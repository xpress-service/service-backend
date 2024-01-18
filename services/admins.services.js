const bcrypt = require("bcrypt")
const JsonWebToken = require("../utilities/core/JsonWebToken")
const { createRefreshToken } = require("../utilities/core/refreshToken")
const sgMail = require("@sendgrid/mail")
const {
  createVerificationToken,
} = require("../utilities/core/verificationToken")

const {
  BadRequestError,
  InternalError,
  NotFoundError,
  DuplicateDataError,
} = require("../utilities/core/ApiError")
const { query, transactionQuery } = require("../models/index")

async function createAdmin(data) {
  const checkAdmin = "SELECT email FROM users WHERE email = ?"
  const checkAdminResult = await query(checkAdmin, [data.email])
  // check if user already exists with provided email
  if (checkAdminResult.length > 0 && checkAdminResult[0].email) {
    console.error("-----------DUPLICATE EMAIL ERROR----------")
    throw new DuplicateDataError(
      "admin's email already exists. Proceed to login or create an account with a new email address"
    )
  }

  if (data.password !== data.confirm_password) {
    console.error("-----------BAD REQUEST ERROR----------")
    throw new BadRequestError("Password and Confirm Password do not match")
  }

  const salt = await bcrypt.genSalt()
  const hashPassword = await bcrypt.hash(data.password, salt)
  const verificationToken = await createVerificationToken()

  const adminQuery = "INSERT INTO admins SET ?"
  const adminQueryResult = await query(adminQuery, {
    name: data.name,
    email: data.email,
    role: "admin",
    password: hashPassword,
    status: "pending",
    verification_code: verificationToken.verificationCode,
    expire_at: verificationToken.expiredAt,
  })

  if (adminQueryResult.affectedRows !== 1) {
    console.error("-----------USER CREATION ERROR----------")
    throw new InternalError("An error occurred. Please try again later.")
  }

  const allUser = "INSERT INTO all_users SET ?"
  await query(allUser, {
    name: data.name,
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
                            <p>Hello ${data.name},</p>
                            <p>Thanks for signing up on the ServiceXpress App.</p>
                            <p>Please click the button below to verify your account.</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 24px 0px;">
                            <a href="${process.env.CLIENT_URL}/verify-admin/${verificationToken.verificationCode}" target="_blank" style="background-color: orange; color: white; padding: 10px 20px; text-align: center; border: none; border-radius: 5px; text-decoration: none;">Verify My Account</a>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>
                            <p>Thanks,</p>
                            <p>The ServiceXpress Team</p>
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

// admin Login
async function adminLogin(data, ip) {
  const adminQuery = "SELECT * FROM admins WHERE email = ?"
  const admin = await query(adminQuery, [data.email])

  if (admin.length < 1) throw new NotFoundError("Invalid Email or Password!")

  for (const item of admin) {
    const match = await bcrypt.compare(data.password, item.password)

    if (match) {
      if (item.status !== "verified")
        throw new BadRequestError("Please verify your account!")

      const getAllUserId = `SELECT * FROM all_users WHERE user_id = ? AND type = "admin" `
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
        name: item.first_name,
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

// Verify admin
async function verifyAdmin(code) {
  const checkAdmin = `SELECT * FROM admins WHERE verification_code = ?`
  const checkAdminResult = await query(checkAdmin, [code])

  if (checkAdminResult.length < 1) throw new NotFoundError("User does not exist")

  if (checkAdminResult[0].status === "verified")
    throw new InternalError("An error occurred. Please try again later.")

  const updateAdminStatusQuery = `UPDATE admins SET ? WHERE verification_code = ?`
  const adminData = {
    status: "verified",
  }

  const updateAdminStatusQueryResult = await query(updateAdminStatusQuery, [
    adminData,
    code,
  ])

  if (!updateAdminStatusQueryResult) {
    console.error("-----------Admin UPDATING ERROR----------")
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
                    <p>Hello ${checkAdminResult[0].name},</p>
                    <p>This is to inform you that your account has been successfully verified.</p>
                  </td>
                </tr>
                    
                <tr>
                  <td style="padding: 24px 0px;">
                    <a href="${process.env.CLIENT_URL}/admin-login" target="_blank" style="background-color: orange; color: white; padding: 10px 20px; text-align: center; border: none; border-radius: 5px; text-decoration: none;">Proceed to login</a>
                  </td>
                </tr>
                    
                <tr>
                  <td>
                    <p>Thanks,</p>
                    <p>The Service Team</p>
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

// update admin
async function updateAdmin(data, id) {
  if (!data)
    throw BadRequestError(
      "Data to be updated can not be empty or provided details are not allowed to be updated"
    )

  const adminUpdateQuery = "UPDATE admins SET ? WHERE id = ?"
  const adminData = {
    id: id,
    email: data.email,
    name: data.name,
    phone_number: data.phone_number,
    avatar: data.avatar,
    country: data.country,
    nin: data.nin,
    gender: data.gender,
    birth: data.birth,
    experience: data.experience,
    currency: data.currency,
    salary: data.salary,
    skills: data.skills,
  }

  const adminUpdateQueryResult = await transactionQuery(adminUpdateQuery, [
    adminData,
    id,
  ])
  if (!adminUpdateQueryResult) {
    console.error("-----------ADMIN UPDATING ERROR----------")
    throw new BadRequestError("An error occurred.")
  }

  const allUser = "UPDATE all_users SET ? WHERE user_id = ?"
  await query(allUser, [
    {
      name: data.name,
    },
    id,
  ])

  const dbCommit = await con.commit(function (err) {
    if (err) {
      return con.rollback(function () {
        console.log("Transaction commit error: ", err)
        throw new BadRequestError(
          "An error occurred. Please check provided data and try again later. (dbcommit)"
        )
      })
    }
  })
  if (dbCommit)
    return {
      email: data.email,
    }
}

async function getAdmin(email) {
  const getAdminQuery =
    "SELECT id, name, email, phone_number, avatar, role, country, birth, nin, experience, currency, salary, skills FROM users WHERE email = ?"
  const getAdminResult = await query(getAdminQuery, [email])

  if (getAdminResult.length < 1) throw new NotFoundError("User does not exist")

  return {
  admin: getAdminResult[0],
  }
}

async function checkAdminProfile(email) {
  const checkAdminProfileQuery = `SELECT * FROM adminss WHERE email = ? AND avatar <> "" AND country <> "" AND job_title <> "" AND linkedin <> "" AND experience <> "" AND salary <> ""`
  const checkAdminProfileResult = await query(checkAdminProfileQuery, [email])

  if (checkAdminProfileResult.length > 0) {
    return {
      profileCompleted: true,
    }
  } else {
    return {
      profileCompleted: false,
    }
  }
}

async function changePassword(data, id) {
  const userQuery = `SELECT * FROM users WHERE id = ?`
  const userQueryResult = await query(userQuery, [id])

  if (userQueryResult.length < 1) throw new NotFoundError("Invalid Password!")

  const match = await bcrypt.compare(
    data.current_password,
    userQueryResult[0].password
  )
  if (!match) throw new BadRequestError("Invalid Password!")

  const salt = await bcrypt.genSalt()
  const hashPassword = await bcrypt.hash(data.new_password, salt)

  const updateData = {
    password: hashPassword,
  }

  const changePasswordQuery = `UPDATE users SET ? WHERE id = ?`
  const changePasswordQueryResult = await query(changePasswordQuery, [
    updateData,
    id,
  ])

  if (!changePasswordQueryResult) {
    console.error("-----------USER UPDATING ERROR----------")
    throw new BadRequestError("An error occurred.")
  }
}

module.exports = {
  createAdmin,
  adminLogin,
  verifyAdmin,
  updateAdmin,
  getAdmin,
  checkAdminProfile,
  changePassword,
}