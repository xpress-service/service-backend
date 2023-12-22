const Joi = require("joi")
const validator = require("../schemaValidation")

const payload = Object.freeze({
  QUERY: "req.query",
  PARAMS: "req.params",
  BODY: "req.body",
})

/**
 * @description defines the req.body schema for creating a admin
 * @return {function(*=, *, *): void}
 */

function createAdminSchema() {
  return (req, res, next) => {
    const bodySchema = Joi.object({
      name: Joi.string().lowercase().trim().required().messages({
        "any.required": "Admin's name was not provided",
      }),
      email: Joi.string().email().lowercase().required().messages({
        "any.required": "Admin's email address was not provided",
      }),
      password: Joi.string().trim().required().messages({
        "any.required": "Admin's password was not provided",
      }),
      confirm_password: Joi.string().trim().required().messages({
        "any.required": "Admin's confirm password was not provided",
      }),
    })
    validator(req, [bodySchema], [payload.BODY])
    next()
  }
}

/**
 * @description defines the req.body schema for a admin to log in
 * @return {function(*=, *, *): void}
 */
function adminLoginSchema() {
  return (req, res, next) => {
    const bodySchema = Joi.object({
      email: Joi.string().email().lowercase().required().messages({
        "any.required": "Admin's email address was not provided",
      }),
      password: Joi.string().trim().required().messages({
        "any.required": "Admin's password was not provided",
      }),
    })
    validator(req, [bodySchema], [payload.BODY])
    next()
  }
}

function verifyAdminSchema() {
  return (req, res, next) => {
    const paramsSchema = Joi.object({
      code: Joi.string().required().messages({
        "any.required": "Verification code was not provided",
      }),
    })
    validator(req, [paramsSchema], [payload.PARAMS])
    next()
  }
}

function updateAdminSchema() {
  return (req, res, next) => {
    const bodySchema = Joi.object({
      name: Joi.string().lowercase().trim().required().messages({
        "any.required": "Admin's name was not provided",
      }),
      phone_number: Joi.string().trim().required().messages({
        "any.required": "Admin's phone number was not provided",
      }),
      email: Joi.string().email().lowercase().required().messages({
        "any.required": "Admin's email address was not provided",
      }),
      avatar: Joi.string().trim().required().messages({
        "any.required": "Admin's avatar url was not provided",
      }),
      country: Joi.string().trim().required().messages({
        "any.required": "Admin's country was not provided",
      }),
      birth: Joi.string().trim().required().messages({
        "any.required": "Admin's date of birth was not provided",
      }),
      nin: Joi.string().messages({
        "any.required": "Admin's linkedin url was not provided",
      }),
      experience: Joi.string().lowercase().trim().required().messages({
        "any.required": "Admin's experience was not provided",
      }),
      currency: Joi.string().trim().required().messages({
        "any.required": "Admin's currency was not provided",
      }),
      salary: Joi.string().trim().required().messages({
        "any.required": "Admin's salary was not provided",
      }),
      skills: Joi.string().trim().required().messages({
        "any.required": "Admin's skills was not provided",
      }),
    })
    validator(req, [bodySchema], [payload.BODY])
    next()
  }
}

function getAdminSchema() {
  return (req, res, next) => {
    const querySchema = Joi.object({
      email: Joi.string().email().lowercase().required().messages({
        "any.required": "Admin's email address was not provided",
      }),
    })
    validator(req, [querySchema], [payload.QUERY])
    next()
  }
}

function changePasswordSchema() {
  return (req, res, next) => {
    const bodySchema = Joi.object({
      current_password: Joi.string().trim().required().messages({
        "any.required": "Admin's current password was not provided",
      }),
      new_password: Joi.string().trim().required().messages({
        "any.required": "Admin's new password was not provided",
      }),
      confirm_password: Joi.string().trim().required().messages({
        "any.required": "Admin's confirm password was not provided",
      }),
    })
    const paramsSchema = Joi.object({
      id: Joi.string().lowercase().trim().required().messages({
        "any.required": "Id was not provided",
      }),
    })
    validator(req, [bodySchema, paramsSchema], [payload.BODY, payload.PARAMS])
    next()
  }
}

module.exports = {
  createAdminSchema,
  adminLoginSchema,
  verifyAdminSchema,
  updateAdminSchema,
  getAdminSchema,
  changePasswordSchema,
}