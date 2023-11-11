const Joi = require("joi")
const validator = require("../schemaValidation")

const payload = Object.freeze({
  QUERY: "req.query",
  PARAMS: "req.params",
  BODY: "req.body",
})

/**
 * @description defines the req.body schema for creating an admin
 * @return {function(*=, *, *): void}
 */

function createAdminSchema() {
  return (req, res, next) => {
    const bodySchema = Joi.object({
      name: Joi.string().lowercase().trim().required().messages({
        "any.required": "Admin's first name was not provided",
      }),
      
      company: Joi.string().trim().required().messages({
        "any.required": "Admin's company was not provided",
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
 * @description defines the req.body schema for an admin to log in
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
    const bodySchema = Joi.object({
      verification_code: Joi.string().lowercase().trim().required().messages({
        "any.required": "Verification code was not provided",
      }),
    })
    validator(req, [bodySchema], [payload.BODY])
    next()
  }
}

function createCompanyAdminSchema() {
  return (req, res, next) => {
    const bodySchema = Joi.object({
      company_id: Joi.number().required().messages({
        "any.required": "Company id was not provided.",
      }),
      first_name: Joi.string().lowercase().trim().required().messages({
        "any.required": "Admin's first name was not provided",
      }),
      last_name: Joi.string().lowercase().trim().required().messages({
        "any.required": "Admin's last name was not provided",
      }),
      email: Joi.string().email().lowercase().trim().required().messages({
        "any.required": "Admin's company email was not provided",
      }),
    })
    validator(req, [bodySchema], [payload.BODY])
    next()
  }
}

function getCompanyAdminsSchema() {
  return (req, res, next) => {
    const paramsSchema = Joi.object({
      id: Joi.string().required().messages({
        "any.required": "Company id was not provided",
      }),
    })
    validator(req, [paramsSchema], [payload.PARAMS])
    next()
  }
}

function updateCompanyAdminSchema() {
  return (req, res, next) => {
    const bodySchema = Joi.object({
      first_name: Joi.string().lowercase().trim().required().messages({
        "any.required": "Admin's first name was not provided",
      }),
      last_name: Joi.string().lowercase().trim().required().messages({
        "any.required": "Admin's last name was not provided",
      }),
      email: Joi.string().email().lowercase().trim().required().messages({
        "any.required": "Admin's company email was not provided",
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

function verifyCompanyAdminSchema() {
  return (req, res, next) => {
    const bodySchema = Joi.object({
      verification_code: Joi.string().lowercase().trim().required().messages({
        "any.required": "Verification code was not provided",
      }),
    })
    validator(req, [bodySchema], [payload.BODY])
    next()
  }
}

function deleteCompanyAdminSchema() {
  return (req, res, next) => {
    const paramsSchema = Joi.object({
      id: Joi.string().required().messages({
        "any.required": "Id was not provided",
      }),
    })
    validator(req, [paramsSchema], [payload.PARAMS])
    next()
  }
}

function getAdminRoleSchema() {
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
      id: Joi.string().trim().required().messages({
        "any.required": "Id was not provided",
      }),
    })
    validator(req, [bodySchema, paramsSchema], [payload.BODY, payload.PARAMS])
    next()
  }
}

function verifyNonAdminSchema() {
  return (req, res, next) => {
    const bodySchema = Joi.object({
      verification_code: Joi.string().lowercase().trim().required().messages({
        "any.required": "Verification code was not provided",
      }),
    })
    validator(req, [bodySchema], [payload.BODY])
    next()
  }
}

module.exports = {
  createAdminSchema,
  adminLoginSchema,
  verifyAdminSchema,
  createCompanyAdminSchema,
  getCompanyAdminsSchema,
  updateCompanyAdminSchema,
  verifyCompanyAdminSchema,
  deleteCompanyAdminSchema,
  getAdminRoleSchema,
  changePasswordSchema,
  verifyNonAdminSchema,
}