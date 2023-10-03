import express from 'express';
import { isAuth } from "../utils.js";
import { trackOrder, cancelOrder } from '../controllers/orderController.js'
const router = express.Router();

// track order
router.get('/track-order/:trackingId', isAuth, trackOrder);

// delete order
router.delete('/cancel-order/:orderId', isAuth, cancelOrder);


export default router;