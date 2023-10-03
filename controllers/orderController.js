import database from '../lib/database.js';
import expressAsyncHandler from 'express-async-handler';
// Track Order
export const trackOrder = expressAsyncHandler(async (req, res) => {
    const trackingId = req.params.trackinId;
    const q = "SELECT * FROM Orders WHERE id = ?";
    
    database.query(q, [trackingId], (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }

        if (data.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        const order = data[0];
        return res.status(200).json(order);
    });
});
// Cancel Order
export const cancelOrder = expressAsyncHandler(async (req, res) => {
    const orderId = req.params.orderId;
    const q = "UPDATE Orders SET status = 'canceled' WHERE id = ?";
    
    database.query(q, [orderId], (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }
  
        if (data.status === 0) {
            return res.status(404).json({ message: "Order not found" });
        }
  
        return res.status(200).json({ message: "Order has been canceled" });
    });
  });