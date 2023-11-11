const router = require("express").Router()

const admins = require("./admins.route")
const users = require("./users.route")

router.use("/admins", admins)
router.use("/users", users)


module.exports = router