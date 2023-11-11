const { createRefreshToken } = require("../utilities/core/refreshToken")
const {
  BadRequestError,
  InternalError,
  NotFoundError,
  DuplicateDataError,
} = require("../utilities/core/ApiError")
const { query } = require("../models/index")
const JsonWebToken = require("../utilities/core/JsonWebToken")
const bcrypt = require("bcrypt")
const generator = require("generate-password")
const sgMail = require("@sendgrid/mail")
const {
  createVerificationToken,
} = require("../utilities/core/verificationToken")

async function createAdmin(data) {
  const checkCompanyProfile = `SELECT company_email FROM company_profiles WHERE company_email = ?`
  const checkCompanyProfileResult = await query(checkCompanyProfile, [
    data.email,
  ])
  if (checkCompanyProfileResult.length > 0) {
    console.error("--------DUPLICATE ERROR--------")
    throw new DuplicateDataError(
      "Company profile with this email alrready exists. Profile to login or create a new account with a new email address."
    )
  }

  const companyQuery = `INSERT INTO company_profiles SET ?`
  const companyQueryResult = await query(companyQuery, {
    company_name: data.company,
    company_email: data.email,
  })

  if (companyQueryResult.affectedRows !== 1) {
    console.error("-----------COMPANY PROFILE CREATION ERROR----------")
    throw new InternalError("An error occurred. Please try again later.")
  }

  const salt = await bcrypt.genSalt()
  const hashPassword = await bcrypt.hash(data.password, salt)
  const verificationToken = await createVerificationToken()

  const adminQuery = "INSERT INTO admins SET ?"
  const adminQueryResult = await query(adminQuery, {
    company_id: companyQueryResult.insertId,
    name: data.first_name,
    company: data.company,
    email: data.email,
    role: "Admin",
    password: hashPassword,
    status: "pending",
    verification_code: verificationToken.verificationCode,
    expire_at: verificationToken.expiredAt,
  })

  if (adminQueryResult.affectedRows !== 1) {
    console.error("-----------ADMIN CREATION ERROR----------")
    throw new InternalError("An error occurred. Please try again later.")
  }

  const allUser = "INSERT INTO all_users SET ?"
  await query(allUser, {
    name: data.name,
    user_id: adminQueryResult.insertId,
    email: data.email,
    type: "Admin",
  })

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const message = {
    to: data.email,
    from: process.env.FROM_EMAIL,
    subject: `Account Verification`,
    html: `
      <!DOCTYPE html PUBLIC 
        "-//W3C//DTD XHTML 1.0 Transitional//EN" 
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style type="text/css">
              @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap');

              body {
                margin: 0;
              }
              table {
                border-spacing: 0;
              }
              td {
                padding: 0;
              }
              img {
                border: 0;
              }
              .wrapper {
                width: 100%;
                table-layout: fixed;
                background-color: #eeeee4;
                padding: 60px 0px;
              }
              .main {
                width: 100%;
                max-width: 600px;
                background-color: #fff;
                border-radius: 4px;
                font-family: Roboto, sans-serif;
                padding: 25px;
              }
            </style>
          </head>   
          <body>
            <center class="wrapper">
                <table class="main" width="100%">
                    <tr>
                        <td>
                            <a href="${process.env.CLIENT_URL}"><img src="https://i.ibb.co/fXqJ5W3/logopic.png" alt="" border="0" width="60"></a>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>
                            <p>Hello ${data.first_name},</p>
                            <p>Thanks for signing up on the Edge App.</p>
                            <p>Please click the button below to verify your account.</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 24px 0px;">
                            <a href="${process.env.CLIENT_URL}/verify-email/${verificationToken.verificationCode}" target="_blank" style="background-color: blue; color: white; padding: 10px 20px; text-align: center; border: none; border-radius: 5px; text-decoration: none;">Verify My Account</a>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>
                            <p>Thanks,</p>
                            <p>The Edge Team</p>
                        </td>
                    </tr>  
                </table>
            </center>
          </body>
        </html>                 
`,
  }

  sgMail.send(message, (err, result) => {
    if (err) {
      console.error(err.response.body.errors)
      throw new InternalError("An error occurred. Please try again later.")
    }
  })
}

// Admin Login
async function adminLogin(data, ip) {
  const adminQuery = "SELECT * FROM admins WHERE email = ?"
  const admin = await query(adminQuery, [data.email])

  if (admin.length < 1) throw new NotFoundError("Invalid Email or Password!")

  for (const item of admin) {
    const match = await bcrypt.compare(data.password, item.password)

    if (match) {
      if (item.status !== "verified")
        throw new BadRequestError("Please verify your account!")

      const getAllUserId = `SELECT * FROM all_users WHERE user_id = ? AND type IN ("superAdmin", "admin") `
      const getAllUserResult = await query(getAllUserId, [item.id])

      const accessToken = new JsonWebToken({
        name: getAllUserResult[0].name,
        email: getAllUserResult[0].email,
        id: getAllUserResult[0].id,
        role: getAllUserResult[0].type,
      }).createAccessToken()
      const refreshToken = await createRefreshToken(getAllUserResult[0], ip)

      return {
        id: item.id,
        companyId: item.company_id,
        name: item.name,
        email: item.email,
        role: item.role,
        accessToken,
        refreshToken,
      }
    } else {
      throw new BadRequestError("Invalid Email or Password!")
    }
  }
}

async function verifyAdmin(data) {
  const checkAdmin = `SELECT * FROM admins WHERE verification_code = ?`
  const checkAdminResult = await query(checkAdmin, [data.verification_code])

  if (checkAdminResult.length < 1)
    throw new NotFoundError("Admin does not exist")

  if (checkAdminResult[0].role !== "superAdmin")
    throw new InternalError("An error occurred. Please try again later.")

  if (checkAdminResult[0].status === "verified")
    throw new InternalError("An error occurred. Please try again later.")

  const updateAdminStatusQuery = `UPDATE admins SET ? WHERE verification_code = ?`
  const adminData = {
    status: "verified",
  }

  const updateAdminStatusQueryResult = await query(updateAdminStatusQuery, [
    adminData,
    data.verification_code,
  ])

  if (!updateAdminStatusQueryResult) {
    console.error("-----------COMPANY ADMIN UPDATING ERROR----------")
    throw new BadRequestError("An error occurred.")
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const message = {
    to: checkAdminResult[0].email,
    from: process.env.FROM_EMAIL,
    subject: `Account Verification`,
    html: `
      <!DOCTYPE html PUBLIC 
        "-//W3C//DTD XHTML 1.0 Transitional//EN" 
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style type="text/css">
              @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap');

              body {
                margin: 0;
              }
              table {
                border-spacing: 0;
              }
              td {
                padding: 0;
              }
              img {
                border: 0;
              }
              .wrapper {
                width: 100%;
                table-layout: fixed;
                background-color: #eeeee4;
                padding: 60px 0px;
              }
              .main {
                width: 100%;
                max-width: 600px;
                background-color: #fff;
                border-radius: 4px;
                font-family: Roboto, sans-serif;
                padding: 25px;
              }
            </style>
          </head> 
          <body>
            <center class="wrapper">
              <table class="main" width="100%">
                <tr>
                  <td>
                    <a href="${process.env.CLIENT_URL}"><img src="https://i.ibb.co/fXqJ5W3/logopic.png" alt="" border="0" width="60"></a>
                  </td>
                </tr>
                    
                <tr>
                  <td>
                    <p>Hello ${checkAdminResult[0].first_name},</p>
                    <p>This is to inform you that your account has been successfully verified.</p>
                  </td>
                </tr>
                    
                <tr>
                  <td style="padding: 24px 0px;">
                    <a href="${process.env.CLIENT_URL}/admin-login" target="_blank" style="background-color: blue; color: white; padding: 10px 20px; text-align: center; border: none; border-radius: 5px; text-decoration: none;">Proceed to login</a>
                  </td>
                </tr>
                    
                <tr>
                  <td>
                    <p>Thanks,</p>
                    <p>The Edge Team</p>
                  </td>
                </tr>  
              </table>
            </center>
          </body>
        </html>                 
`,
  }

  sgMail.send(message, (err, result) => {
    if (err) {
      console.error(err.response.body.errors)
      throw new InternalError("An error occurred. Please try again later.")
    }
  })
}

async function createCompanyAdmin(data) {
  const checkAdmin = `SELECT email FROM admins WHERE email = ? AND company_id = ?`
  const checkAdminResult = await query(checkAdmin, [data.email, data.company_id])

  if (checkAdminResult.length > 0) {
    console.error("-----------DUPLICATE EMAIL ERROR----------")
    throw new DuplicateDataError(
      "Admin's email already exists. Please create an account with a new email address"
    )
  }

  const getCompanyNameQuery = `SELECT company_name FROM company_profiles WHERE id = ?`
  const getCompanyNameQueryResult = await query(getCompanyNameQuery, [
    data.company_id,
  ])

  const password = generator.generate({
    length: 10,
    numbers: true,
  })
  const verificationToken = await createVerificationToken()

  const adminQuery = `INSERT INTO admins SET ?`
  const adminQueryResult = await query(adminQuery, {
    company_id: data.company_id,
    first_name: data.first_name,
    last_name: data.last_name,
    company: getCompanyNameQueryResult[0].company_name,
    email: data.email,
    role: "admin",
    password: password,
    status: "pending",
    verification_code: verificationToken.verificationCode,
    expire_at: verificationToken.expiredAt,
  })

  if (adminQueryResult.affectedRows !== 1) {
    console.error("-----------ADMIN CREATION ERROR----------")
    throw new InternalError("An error occurred. Please try again later.")
  }

  const allUser = "INSERT INTO all_users SET ?"
  await query(allUser, {
    first_name: data.first_name,
    last_name: data.last_name,
    user_id: adminQueryResult.insertId,
    email: data.email,
    type: "admin",
  })

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const message = {
    to: data.email,
    from: process.env.FROM_EMAIL,
    subject: `Account Verification`,
    html: `
      <!DOCTYPE html PUBLIC 
        "-//W3C//DTD XHTML 1.0 Transitional//EN" 
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style type="text/css">
              @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap');

              body {
                margin: 0;
              }
              table {
                border-spacing: 0;
              }
              td {
                padding: 0;
              }
              img {
                border: 0;
              }
              .wrapper {
                width: 100%;
                table-layout: fixed;
                background-color: #eeeee4;
                padding: 60px 0px;
              }
              .main {
                width: 100%;
                max-width: 600px;
                background-color: #fff;
                border-radius: 4px;
                font-family: Roboto, sans-serif;
                padding: 25px;
              }
            </style>
          </head> 
          <body>
            <center class="wrapper">
              <table class="main" width="100%">
                <tr>
                  <td>
                    <a href="${process.env.CLIENT_URL}"><img src="https://i.ibb.co/fXqJ5W3/logopic.png" alt="" border="0" width="60"></a>
                  </td>
                </tr>
                    
                <tr>
                  <td>
                    <p>Hello ${data.first_name},</p>
                    <p>This is to inform you that an account has been created for you on our platform.</p>
                    <p>Please verify your account using the verification code provided to be able to login.</p>
                    <p>Verification code: ${verificationToken.verificationCode}</p>
                  </td>
                </tr>
                    
                <tr>
                  <td style="padding: 24px 0px;">
                    <a href="${process.env.CLIENT_URL}/verify-email/${verificationToken.verificationCode}" target="_blank" style="background-color: blue; color: white; padding: 10px 20px; text-align: center; border: none; border-radius: 5px; text-decoration: none;">Verify Your Account</a>
                  </td>
                </tr>
                    
                <tr>
                  <td>
                    <p>Thanks,</p>
                    <p>The Edge Team</p>
                  </td>
                </tr>  
              </table>
            </center>
          </body>
        </html>                 
`,
  }

  sgMail.send(message, (err, result) => {
    if (err) {
      console.error(err.response.body.errors)
      throw new InternalError("An error occurred. Please try again later.")
    }
  })
}

async function getCompanyAdmins(id) {
  const getCompanyAdminsQuery = `SELECT id, company_id, first_name, last_name, email, company, status, created_at FROM admins WHERE role = "admin" AND company_id = ?`
  const getCompanyAdminsQueryResult = await query(getCompanyAdminsQuery, [id])

  if (getCompanyAdminsQueryResult.length < 1)
    throw new NotFoundError("Company Admins do not exist")

  return getCompanyAdminsQueryResult
}

async function verifyCompanyAdmin(data) {
  const checkCompanyAdminQuery = `SELECT * FROM admins WHERE verification_code = ?`
  const checkCompanyAdminQueryResult = await query(checkCompanyAdminQuery, [
    data.verification_code,
  ])

  if (checkCompanyAdminQueryResult.length < 1)
    throw new NotFoundError("Company Admin does not exist")

  if (checkCompanyAdminQueryResult[0].role !== "admin")
    throw new InternalError("An error occurred. Please try again later.")

  if (checkCompanyAdminQueryResult[0].status === "verified")
    throw new InternalError("An error occurred. Please try again later.")

  const salt = await bcrypt.genSalt()
  const hashPassword = await bcrypt.hash(
    checkCompanyAdminQueryResult[0].password,
    salt
  )

  const updateCompanyAdminStatusQuery = `UPDATE admins SET ? WHERE verification_code = ?`
  const updateCompanyAdminData = {
    status: "verified",
    password: hashPassword,
  }

  const updateCompanyAdminStatusQueryResult = await query(
    updateCompanyAdminStatusQuery,
    [updateCompanyAdminData, data.verification_code]
  )

  if (!updateCompanyAdminStatusQueryResult) {
    console.error("-----------COMPANY ADMIN UPDATING ERROR----------")
    throw new BadRequestError("An error occurred.")
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const message = {
    to: checkCompanyAdminQueryResult[0].email,
    from: process.env.FROM_EMAIL,
    subject: `Account Verification`,
    html: `
      <!DOCTYPE html PUBLIC 
        "-//W3C//DTD XHTML 1.0 Transitional//EN" 
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style type="text/css">
              @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap');

              body {
                margin: 0;
              }
              table {
                border-spacing: 0;
              }
              td {
                padding: 0;
              }
              img {
                border: 0;
              }
              .wrapper {
                width: 100%;
                table-layout: fixed;
                background-color: #eeeee4;
                padding: 60px 0px;
              }
              .main {
                width: 100%;
                max-width: 600px;
                background-color: #fff;
                border-radius: 4px;
                font-family: Roboto, sans-serif;
                padding: 25px;
              }
            </style>
          </head> 
          <body>
            <center class="wrapper">
              <table class="main" width="100%">
                <tr>
                  <td>
                    <a href="${process.env.CLIENT_URL}"><img src="https://i.ibb.co/fXqJ5W3/logopic.png" alt="" border="0" width="60"></a>
                  </td>
                </tr>
                    
                <tr>
                  <td>
                    <p>Hello ${checkCompanyAdminQueryResult[0].first_name},</p>
                    <p>This is to inform you that your account has been successfully verified.</p>
                    <p>Please find your login details below:</p>
                  </td>
                </tr>
                    
                <tr>
                  <td style="padding: 0px 16px;">
                    <p>Email: ${checkCompanyAdminQueryResult[0].email}
                    <p>Password: ${checkCompanyAdminQueryResult[0].password}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 24px 0px;">
                    <a href="${process.env.CLIENT_URL}/admin-login" target="_blank" style="background-color: blue; color: white; padding: 10px 20px; text-align: center; border: none; border-radius: 5px; text-decoration: none;">Proceed to login</a>
                  </td>
                </tr>
                    
                <tr>
                  <td>
                    <p>Thanks,</p>
                    <p>The Edge Team</p>
                  </td>
                </tr>  
              </table>
            </center>
          </body>
        </html>                 
`,
  }

  sgMail.send(message, (err, result) => {
    if (err) {
      console.error(err.response.body.errors)
      throw new InternalError("An error occurred. Please try again later.")
    }
  })
}

async function updateCompanyAdmin(data, id) {
  if (!data)
    throw BadRequestError(
      "Data to be updated can not be empty or provided details are not allowed to be updated"
    )

  const updateCompanyAdminQuery = `UPDATE admins SET ? WHERE id = ?`
  const updateCompanyAdminData = {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
  }

  const updateCompanyAdminQueryResult = await query(updateCompanyAdminQuery, [
    updateCompanyAdminData,
    id,
  ])

  if (!updateCompanyAdminQueryResult) {
    console.error("-----------COMPANY ADMIN UPDATING ERROR----------")
    throw new BadRequestError("An error occurred.")
  }
}

async function deleteCompanyAdmin(id) {
  const deactivateCompanyAdminQuery = `UPDATE admins SET ? WHERE id = ?`
  const data = {
    status: "deactivated",
  }
  const deactivateCompanyAdminQueryResult = await query(
    deactivateCompanyAdminQuery,
    [data, id]
  )

  if (!deactivateCompanyAdminQueryResult) {
    console.error("-----------COMPANY ADMIN UPDATING ERROR----------")
    throw new BadRequestError("An error occurred.")
  }
}

async function getAdminRole(code) {
  const getAdminQuery = `SELECT role FROM admins WHERE verification_code = ?`
  const getAdminQueryResult = await query(getAdminQuery, [code])

  if (getAdminQueryResult.length < 1)
    throw new NotFoundError("Company Admins do not exist")

  return getAdminQueryResult[0]
}

async function changePassword(data, id) {
  const adminQuery = `SELECT * FROM admins WHERE id = ?`
  const adminQueryResult = await query(adminQuery, [id])

  if (adminQueryResult.length < 1) throw new NotFoundError("Invalid Password!")

  const match = await bcrypt.compare(
    data.current_password,
    adminQueryResult[0].password
  )
  if (!match) throw new BadRequestError("Invalid Password!")

  const salt = await bcrypt.genSalt()
  const hashPassword = await bcrypt.hash(data.new_password, salt)

  const updateData = {
    password: hashPassword,
  }

  const changePasswordQuery = `UPDATE admins SET ? WHERE id = ?`
  const changePasswordQueryResult = await query(changePasswordQuery, [
    updateData,
    id,
  ])

  if (!changePasswordQueryResult) {
    console.error("-----------ADMIN UPDATING ERROR----------")
    throw new BadRequestError("An error occurred.")
  }
}

async function verifyNonAdmin(data) {
  const checkAdminQuery = `SELECT * FROM admins WHERE verification_code = ?`
  const checkAdminQueryResult = query(checkAdminQuery, [data.verification_code])

  if (checkAdminQueryResult.length < 1)
    throw new NotFoundError("Guest does not exist")

  const updateAdminStatusQuery = `UPDATE admins SET ? WHERE verification_code = ?`
  const updateAdminData = {
    status: "verified",
  }

  const updateAdminStatusQueryResult = await query(updateAdminStatusQuery, [
    updateAdminData,
    data.verification_code,
  ])

  if (!updateAdminStatusQueryResult) {
    console.error("-----------ADMIN UPDATING ERROR----------")
    throw new BadRequestError("An error occurred.")
  }
}

module.exports = {
  createAdmin,
  adminLogin,
  verifyAdmin,
  createCompanyAdmin,
  getCompanyAdmins,
  verifyCompanyAdmin,
  updateCompanyAdmin,
  deleteCompanyAdmin,
  getAdminRole,
  changePassword,
  verifyNonAdmin,
}