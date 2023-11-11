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
  } = require("../services/admins.services")
  const {
    SuccessResponse,
    CreatedResponse,
  } = require("../utilities/core/ApiResponse")
  const exec = require("../utilities/core/catchAsync")
  const requestIp = require("request-ip")
  
  /**
   * @description A method to handle creating an applicant
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
     *  logic for creating an admin
     */
    const response = await createAdmin(data)
    /**
     * returning a successful response if the admin sign up is successfully
     */
    new CreatedResponse("Admin created successfully", response).send(res)
  })
  
  exports.adminLogin = exec(async (req, res) => {
    /**
     * data needed to create a new user
     */
    const data = req.body
    const ip = requestIp.getClientIp(req)
    /**
     * Calling the adminLogin service to handle all the needed business
     *  logic for an admin to log in
     */
    const response = await adminLogin(data, ip)
    /**
     * returning a successful response if the admin log in is successfull
     */
    new SuccessResponse("Admin logged in successfully", response).send(res)
  })
  
  exports.verifyAdmin = exec(async (req, res) => {
    const data = req.body
  
    const response = await verifyAdmin(data)
    new CreatedResponse("Admin verified successfully", response).send(res)
  })
  
  exports.createCompanyAdmin = exec(async (req, res) => {
    const data = req.body
    const { id } = req.params
  
    const response = await createCompanyAdmin(data, id)
    new CreatedResponse("Company Admin created successfully", response).send(res)
  })
  
  exports.getCompanyAdmins = exec(async (req, res) => {
    const { id } = req.params
  
    const response = await getCompanyAdmins(id)
    new SuccessResponse(
      "Company Admin details retrieved successfully.",
      response
    ).send(res)
  })
  
  exports.verifyCompanyAdmin = exec(async (req, res) => {
    const data = req.body
  
    const response = await verifyCompanyAdmin(data)
    new CreatedResponse("Company Admin verified successfully", response).send(res)
  })
  
  exports.updateCompanyAdmin = exec(async (req, res) => {
    const data = req.body
    const { id } = req.params
  
    const response = await updateCompanyAdmin(data, id)
    new CreatedResponse("Company Admin updated successfully", response).send(res)
  })
  
  exports.deleteCompanyAdmin = exec(async (req, res) => {
    const { id } = req.params
  
    const response = await deleteCompanyAdmin(id)
    new CreatedResponse("Company Admin deleted successfully.", response).send(res)
  })
  
  exports.getAdminRole = exec(async (req, res) => {
    const { code } = req.params
  
    const response = await getAdminRole(code)
    new SuccessResponse("Admin details retreieved successfully.", response).send(
      res
    )
  })
  
  exports.changePassword = exec(async (req, res) => {
    const data = req.body
    const { id } = req.params
  
    const response = await changePassword(data, id)
    new CreatedResponse("Admin updated successfully.", response).send(res)
  })
  
  exports.verifyNonAdmin = exec(async (req, res) => {
    const data = req.body
  
    const response = await verifyNonAdmin(data)
    new CreatedResponse("Guest verified successfully", response).send(res)
  })