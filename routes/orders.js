import express from "express";
import { isAuth } from "../utils.js";
import { createOrder, getOrder, getOrders, updateOrder } from "../controllers/order.js";
const router = express.Router();

router.post('/', isAuth, createOrder);
router.put("/:id/:vendorId", isAuth, updateOrder);
router.get("/:id", isAuth, getOrder);
router.get("/", isAuth, getOrders);

export default router;