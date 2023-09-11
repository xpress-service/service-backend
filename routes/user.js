import express from 'express';
import {
  createProfile,
  viewProfile,
  updateProfile,
} from '../controllers/userController.js';
import { isAuth } from '../utils.js';

const router = express.Router();

// Create User Profile 
router.post('/create-profile', isAuth, createProfile);

// View User Profile 
router.get('/:userId', isAuth, viewProfile);

// Update User Profile (PUT)
router.put('/:userId', isAuth, updateProfile);

export default router;
