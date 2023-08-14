import express from 'express';
import signin from '../controllers/userController.js';
const userRouter = express.Router();

userRouter.post('/signin', signin.signin);
userRouter.post('/adminSignin', signin.adminSignin);

  
export default userRouter;