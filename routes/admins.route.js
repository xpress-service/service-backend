const express = require("express")
/**
 * Joi schema validation methods
 */
const {
  createAdminSchema,
  adminLoginSchema,
  verifyAdminSchema,
  updateAdminSchema,
  getAdminSchema,
  changePasswordSchema,
} = require("../utilities/validator/schemas/admin")

const {
  createAdmin,
  adminLogin,
  verifyAdmin,
  updateAdmin,
  getAdmin,
  checkAdminProfile,
  changePassword,
} = require("../controllers/admins.controller")

const router = express.Router()

router.post("/", createAdminSchema(), createAdmin)
router.get("/verify-admin/:code", verifyAdminSchema(), verifyAdmin)
router.post("/login", adminLoginSchema(), adminLogin)
router.put("/admin/:id", updateAdminSchema(), updateAdmin)
router.get("/admin", getAdminSchema(), getAdmin)
router.get("/profile_check", getAdminSchema(), checkAdminProfile)
router.put("/change-password/:id", changePasswordSchema(), changePassword)

module.exports = router