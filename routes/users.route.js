const express = require("express")
/**
 * Joi schema validation methods
 */
const {
  createUserSchema,
  userLoginSchema,
  verifyUserSchema,
  updateUserSchema,
  getUserSchema,
  changePasswordSchema,
} = require("../utilities/validator/schemas/user")

const {
  createUser,
  userLogin,
  verifyUser,
  updateUser,
  getUser,
  checkUserProfile,
  changePassword,
} = require("../controllers/users.controller")

const router = express.Router()

router.post("/user", createUserSchema(), createUser)
router.get("/verify-user/:code", verifyUserSchema(), verifyUser)
router.post("/login", userLoginSchema(), userLogin)
router.put("/user/:id", updateUserSchema(), updateUser)
router.get("/user", getUserSchema(), getUser)
router.get("/profile_check", getUserSchema(), checkUserProfile)
router.put("/change-password/:id", changePasswordSchema(), changePassword)

module.exports = router