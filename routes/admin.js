import express from 'express';
import {
  createAdminProfile,
  viewAdminProfile,
  updateAdminProfile,
} from '../controllers/adminController.js';
import { isAuth } from '../utils.js';

const router = express.Router();

// Create Admin Profile 
router.post('/create-profile', isAuth, createAdminProfile);

// View Admin Profile
router.get('/:adminId', isAuth, viewAdminProfile);

// Update Admin Profile 
router.put('/:adminId', isAuth, updateAdminProfile);

export default router;
