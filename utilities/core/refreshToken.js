const { v4: uuidv4 } = require("uuid")
const { query } = require("../../models/index")
const { InternalError } = require("./ApiError")
const { JWT_EXPIRE_REFRESH } = process.env
exports.createRefreshToken = async (user, ip) => {
  try {
    let expiredAt = new Date()
    expiredAt.setMinutes(expiredAt.getMinutes() + Number(JWT_EXPIRE_REFRESH))
    let _token = uuidv4()
    const createRefreshTokenQuery = "INSERT INTO refresh_tokens SET ?"
    const refreshToken = await query(createRefreshTokenQuery, {
      token: _token,
      user_id: user.id,
      role: user.type,
      ip_address: ip,
      expiry_date: expiredAt,
    })

    if (refreshToken.affectedRows !== 1) {
      console.error("-----------REFRESH TOKEN CREATION ERROR----------")
      throw new InternalError("An error occurred. Please try again later.")
    }
    return _token
  } catch (error) {
    console.error(error)
    throw new InternalError(error.message)
  }
}

exports.verifyRefreshToken = expiryDate => {
  return expiryDate.getTime() < new Date().getTime()
}