import express from 'express';
import { isAuth } from '../utils.js';
import { createVendor, getVendorByCategory } from '../controllers/user.js';
import { createTransaction, getAllTransaction, getUserTransactions } from '../controllers/transaction.js';
const router = express.Router();

router.get("/vendors", isAuth, getVendorByCategory);
router.post("/vendors", isAuth, createVendor);
router.post("/transactions", isAuth, createTransaction);
router.get("/transactions", isAuth, getAllTransaction);
router.get("/transactions/:id",isAuth, getUserTransactions);
  
export default router;