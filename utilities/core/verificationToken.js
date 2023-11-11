const generator = require("generate-password")
const { InternalError } = require("./ApiError")
const { JWT_EXPIRE_VERIFICATION } = process.env

exports.createVerificationToken = async () => {
  try {
    let expiredAt = new Date()
    expiredAt.setMinutes(
      expiredAt.getMinutes() + Number(JWT_EXPIRE_VERIFICATION)
    )
    let verificationCode = generator.generate({
      length: 24,
      numbers: true,
    })

    return {
      expiredAt,
      verificationCode,
    }
  } catch (error) {
    console.error(error)
    throw new InternalError(error.message)
  }
}

exports.verifyVerificationToken = expiryDate => {
  return expiryDate.getTime() < new Date().getTime()
}