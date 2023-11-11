const express = require("express")
/**
 * Joi schema validation methods
 */
const {
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
} = require("../utilities/validator/schemas/admin")

const {
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
} = require("../controllers/admins.controller")

const router = express.Router()

router.post("/amin", createAdminSchema(), createAdmin)
router.post("/login", adminLoginSchema(), adminLogin)
router.post("/verify-admin", verifyAdminSchema(), verifyAdmin)
router.get("/verify-email/:code", getAdminRoleSchema(), getAdminRole)
router.post("/companies/", createCompanyAdminSchema(), createCompanyAdmin)
router.get("/companies/:id", getCompanyAdminsSchema(), getCompanyAdmins)
router.put("/companies/:id", updateCompanyAdminSchema(), updateCompanyAdmin)
router.post(
  "/companies/verify-admin",
  verifyCompanyAdminSchema(),
  verifyCompanyAdmin
)
router.delete("/companies/:id", deleteCompanyAdminSchema(), deleteCompanyAdmin)
router.put("/change-password/:id", changePasswordSchema(), changePassword)
router.post("/verify-guest", verifyNonAdminSchema(), verifyNonAdmin)

module.exports = router