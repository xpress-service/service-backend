const {
  createAdmin,
  adminLogin,
  updateAdmin,
  verifyAdmin,
  getAdmin,
  checkAdminProfile,
  changePassword,
} = require("../services/admins.services")
const {
  SuccessResponse,
  CreatedResponse,
} = require("../utilities/core/ApiResponse")
const exec = require("../utilities/core/catchAsync")
const requestIp = require("request-ip")

/**
 * @description A method to handle creating an admin
 * @param req - The request object representing the HTTP request
 * @param res - The response object representing the HTTP response
 * @returns {*}
 */
exports.createAdmin = exec(async (req, res) => {
  /**
   * data needed to create a new admin
   */
  const data = req.body

  /**
   * Calling the createAdmin service to handle all the needed business
   *  logic for creating a admin
   */
  const response = await createAdmin(data)
  /**
   * returning a successful response if the admin sign up is successfull
   */
  new CreatedResponse("Admin created successfully", response).send(res)
})

exports.adminLogin = exec(async (req, res) => {
  /**
   * data needed to login a  user
   */
  const data = req.body
  const ip = requestIp.getClientIp(req)
  /**
   * Calling the adminLogin service to handle all the needed business
   *  logic for a user to log in
   */
  const response = await adminLogin(data, ip)
  /**
   * returning a successful response if the admin log in is successfully
   */
  new SuccessResponse("Admin logged in successfully", response).send(res)
})

exports.verifyAdmin = exec(async (req, res) => {
 
  const {code} = req.params

  const response = await verifyAdmin(code)
  new CreatedResponse("Admin verified successfully", response).send(res)
})

exports.updateAdmin = exec(async (req, res) => {
  /**
   * data needed to update a admin
   */
  const { id } = req.params
  const data = req.body
  // const { id } = req.params

  /**
   * Calling the updateAdmin service to handle all the needed business
   *  logic for creating a admin
   */
  const response = await updateAdmin(data, id)
  /**
   * returning a successful response if the admin update is successfully
   */
  new CreatedResponse("Admin profile updated successfully", response).send(res)
})

exports.getAdmin = exec(async (req, res) => {
  const email = req.query.email
  const response = await getAdmin(email)
  new SuccessResponse("Admin details retrieved successfully", response).send(res)
})

exports.checkAdminProfile = exec(async (req, res) => {
  const email = req.query.email
  const response = await checkAdminProfile(email)
  new SuccessResponse("Profile check complete", response).send(res)
})

exports.changePassword = exec(async (req, res) => {
  const data = req.body
  const { id } = req.params

  const response = await changePassword(data, id)
  new CreatedResponse("Admin updated successfully.", response).send(res)
})