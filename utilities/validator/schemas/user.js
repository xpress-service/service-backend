const Joi = require("joi")
const validator = require("../schemaValidation")

const payload = Object.freeze({
  QUERY: "req.query",
  PARAMS: "req.params",
  BODY: "req.body",
})

/**
 * @description defines the req.body schema for creating a user
 * @return {function(*=, *, *): void}
 */

function createUserSchema() {
  return (req, res, next) => {
    const bodySchema = Joi.object({
      name: Joi.string().lowercase().trim().required().messages({
        "any.required": "User's name was not provided",
      }),
      email: Joi.string().email().lowercase().required().messages({
        "any.required": "User's email address was not provided",
      }),
      password: Joi.string().trim().required().messages({
        "any.required": "User's password was not provided",
      }),
      confirm_password: Joi.string().trim().required().messages({
        "any.required": "User's confirm password was not provided",
      }),
    })
    validator(req, [bodySchema], [payload.BODY])
    next()
  }
}

/**
 * @description defines the req.body schema for a user to log in
 * @return {function(*=, *, *): void}
 */
function userLoginSchema() {
  return (req, res, next) => {
    const bodySchema = Joi.object({
      email: Joi.string().email().lowercase().required().messages({
        "any.required": "User's email address was not provided",
      }),
      password: Joi.string().trim().required().messages({
        "any.required": "User's password was not provided",
      }),
    })
    validator(req, [bodySchema], [payload.BODY])
    next()
  }
}

function verifyUserSchema() {
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

function updateUserSchema() {
  return (req, res, next) => {
    const bodySchema = Joi.object({
      name: Joi.string().lowercase().trim().required().messages({
        "any.required": "User's name was not provided",
      }),
      phone_number: Joi.string().trim().required().messages({
        "any.required": "User's phone number was not provided",
      }),
      email: Joi.string().email().lowercase().required().messages({
        "any.required": "User's email address was not provided",
      }),
      avatar: Joi.string().trim().required().messages({
        "any.required": "user's avatar url was not provided",
      }),
      country: Joi.string().trim().required().messages({
        "any.required": "user's country was not provided",
      }),
      job_title: Joi.string().trim().required().messages({
        "any.required": "User's job title was not provided",
      }),
      linkedin: Joi.string().messages({
        "any.required": "User's linkedin url was not provided",
      }),
      experience: Joi.string().lowercase().trim().required().messages({
        "any.required": "user's experience was not provided",
      }),
      currency: Joi.string().trim().required().messages({
        "any.required": "user's currency was not provided",
      }),
      salary: Joi.string().trim().required().messages({
        "any.required": "User's salary was not provided",
      }),
      skills: Joi.string().trim().required().messages({
        "any.required": "User's skills was not provided",
      }),
      resume: Joi.string().optional().allow("", null),
      github: Joi.string().trim().optional().allow("", null),
      cover_letter: Joi.string().optional().allow("", null),
    })
    validator(req, [bodySchema], [payload.BODY])
    next()
  }
}

function getUserSchema() {
  return (req, res, next) => {
    const querySchema = Joi.object({
      email: Joi.string().email().lowercase().required().messages({
        "any.required": "User's email address was not provided",
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
        "any.required": "User's current password was not provided",
      }),
      new_password: Joi.string().trim().required().messages({
        "any.required": "User's new password was not provided",
      }),
      confirm_password: Joi.string().trim().required().messages({
        "any.required": "User's confirm password was not provided",
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
  createUserSchema,
  userLoginSchema,
  verifyUserSchema,
  updateUserSchema,
  getUserSchema,
  changePasswordSchema,
}