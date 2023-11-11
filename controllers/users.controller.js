const {
    createUser,
    userLogin,
    updateUser,
    verifyUser,
    getUser,
    checkUserProfile,
    changePassword,
  } = require("../services/user.services")
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
  exports.createUser = exec(async (req, res) => {
    /**
     * data needed to create a new user
     */
    const data = req.body
  
    /**
     * Calling the createUser service to handle all the needed business
     *  logic for creating a user
     */
    const response = await createUser(data)
    /**
     * returning a successful response if the user sign up is successfull
     */
    new CreatedResponse("User created successfully", response).send(res)
  })
  
  exports.userLogin = exec(async (req, res) => {
    /**
     * data needed to create a new user
     */
    const data = req.body
    const ip = requestIp.getClientIp(req)
    /**
     * Calling the userLogin service to handle all the needed business
     *  logic for a user to log in
     */
    const response = await userLogin(data, ip)
    /**
     * returning a successful response if the user log in is successfully
     */
    new SuccessResponse("User logged in successfully", response).send(res)
  })
  
  exports.verifyUser = exec(async (req, res) => {
   
    const {code} = req.params
  
    const response = await verifyUser(code)
    new CreatedResponse("User verified successfully", response).send(res)
  })
  
  exports.updateUser = exec(async (req, res) => {
    /**
     * data needed to update a user
     */
    const { id } = req.params
    const data = req.body
    // const { id } = req.params
  
    /**
     * Calling the updateUser service to handle all the needed business
     *  logic for creating a user
     */
    const response = await updateUser(data, id)
    /**
     * returning a successful response if the user update is successfully
     */
    new CreatedResponse("User profile updated successfully", response).send(res)
  })
  
  exports.getUser = exec(async (req, res) => {
    const email = req.query.email
    const response = await getUser(email)
    new SuccessResponse("User details retrieved successfully", response).send(res)
  })
  
  exports.checkUserProfile = exec(async (req, res) => {
    const email = req.query.email
    const response = await checkUserProfile(email)
    new SuccessResponse("Profile check complete", response).send(res)
  })
  
  exports.changePassword = exec(async (req, res) => {
    const data = req.body
    const { id } = req.params
  
    const response = await changePassword(data, id)
    new CreatedResponse("User updated successfully.", response).send(res)
  })