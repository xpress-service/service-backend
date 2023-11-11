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

async function createUser(data) {
  const checkUser = "SELECT email FROM users WHERE email = ?"
  const checkUserResult = await query(checkUser, [data.email])
  // check if user already exists with provided email
  if (checkUserResult.length > 0 && checkUserResult[0].email) {
    console.error("-----------DUPLICATE EMAIL ERROR----------")
    throw new DuplicateDataError(
      "User's email already exists. Proceed to login or create an account with a new email address"
    )
  }

  if (data.password !== data.confirm_password) {
    console.error("-----------BAD REQUEST ERROR----------")
    throw new BadRequestError("Password and Confirm Password do not match")
  }

  const salt = await bcrypt.genSalt()
  const hashPassword = await bcrypt.hash(data.password, salt)
  const verificationToken = await createVerificationToken()

  const userQuery = "INSERT INTO users SET ?"
  const userQueryResult = await query(userQuery, {
    name: data.first_name,
    email: data.email,
    role: "vendor",
    phone_number: data.phone_number,
    password: hashPassword,
    status: "pending",
    verification_code: verificationToken.verificationCode,
    expire_at: verificationToken.expiredAt,
  })

  if (userQueryResult.affectedRows !== 1) {
    console.error("-----------USER CREATION ERROR----------")
    throw new InternalError("An error occurred. Please try again later.")
  }

  const allUser = "INSERT INTO all_users SET ?"
  await query(allUser, {
    name: data.first_name,
    user_id: userQueryResult.insertId,
    email: data.email,
    type: "vendor",
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
                            <a href="${process.env.CLIENT_URL}/verify-user/${verificationToken.verificationCode}" target="_blank" style="background-color: blue; color: white; padding: 10px 20px; text-align: center; border: none; border-radius: 5px; text-decoration: none;">Verify My Account</a>
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

// user Login
async function userLogin(data, ip) {
  const userQuery = "SELECT * FROM users WHERE email = ?"
  let user = await query(userQuery, [data.email])
  if (user.length < 1) throw new NotFoundError("Invalid Email or Password!")

  const match = await bcrypt.compare(data.password, user[0].password)
  if (!match) throw new BadRequestError("Invalid Email or Password!")

  if (user[0].status !== "verified")
    throw new BadRequestError("Please verify your account!")

  const getAllUserId = `SELECT * FROM all_users WHERE user_id = ? AND type = "applicant" `
  const getAllUserResult = await query(getAllUserId, [user[0].id])

  const accessToken = new JsonWebToken({
    name: getAllUserResult[0].name,
    email: getAllUserResult[0].email,
    id: getAllUserResult[0].id,
    role: getAllUserResult[0].type,
  }).createAccessToken()
  const refreshToken = await createRefreshToken(getAllUserResult[0], ip)

  return {
    id: user[0].id,
    email: user[0].email,
    role: user[0].role,
    accessToken,
    refreshToken,
  }
}

// Verify user
async function verifyUser(code) {
  const checkUser = `SELECT * FROM users WHERE verification_code = ?`
  const checkUserResult = await query(checkUser, [code])

  if (checkUserResult.length < 1) throw new NotFoundError("User does not exist")

  if (checkUserResult[0].status === "verified")
    throw new InternalError("An error occurred. Please try again later.")

  const updateUserStatusQuery = `UPDATE users SET ? WHERE verification_code = ?`
  const userData = {
    status: "verified",
  }

  const updateUserStatusQueryResult = await query(updateUserStatusQuery, [
    userData,
    code,
  ])

  if (!updateUserStatusQueryResult) {
    console.error("-----------User UPDATING ERROR----------")
    throw new BadRequestError("An error occurred.")
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const message = {
    to: checkUserResult[0].email,
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
                    <p>Hello ${checkUserResult[0].first_name},</p>
                    <p>This is to inform you that your account has been successfully verified.</p>
                  </td>
                </tr>
                    
                <tr>
                  <td style="padding: 24px 0px;">
                    <a href="${process.env.CLIENT_URL}/user-login" target="_blank" style="background-color: blue; color: white; padding: 10px 20px; text-align: center; border: none; border-radius: 5px; text-decoration: none;">Proceed to login</a>
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

// update user
async function updateUser(data, id) {
  if (!data)
    throw BadRequestError(
      "Data to be updated can not be empty or provided details are not allowed to be updated"
    )

  const userUpdateQuery = "UPDATE users SET ? WHERE id = ?"
  const userData = {
    id: id,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    phone_number: data.phone_number,
    avatar: data.avatar,
    country: data.country,
    job_title: data.job_title,
    linkedin: data.linkedin,
    github: data.github,
    resume: data.resume,
    cover_letter: data.cover_letter,
    experience: data.experience,
    currency: data.currency,
    salary: data.salary,
    skills: data.skills,
  }

  const userUpdateQueryResult = await transactionQuery(userUpdateQuery, [
    userData,
    id,
  ])
  if (!userUpdateQueryResult) {
    console.error("-----------USER UPDATING ERROR----------")
    throw new BadRequestError("An error occurred.")
  }

  const allUser = "UPDATE all_users SET ? WHERE user_id = ?"
  await query(allUser, [
    {
      first_name: data.first_name,
      last_name: data.last_name,
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

async function getUser(email) {
  const getUserQuery =
    "SELECT id, first_name, last_name, email, phone_number, avatar, role, country, job_title, linkedin, github, resume, cover_letter, experience, currency, salary, skills FROM users WHERE email = ?"
  const getUserResult = await query(getUserQuery, [email])

  if (getUserResult.length < 1) throw new NotFoundError("User does not exist")

  return {
    user: getUserResult[0],
  }
}

async function checkUserProfile(email) {
  const checkUserProfileQuery = `SELECT * FROM users WHERE email = ? AND avatar <> "" AND country <> "" AND job_title <> "" AND linkedin <> "" AND experience <> "" AND salary <> ""`
  const checkUserProfileResult = await query(checkUserProfileQuery, [email])

  if (checkUserProfileResult.length > 0) {
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
  createUser,
  userLogin,
  verifyUser,
  updateUser,
  getUser,
  checkUserProfile,
  changePassword,
}