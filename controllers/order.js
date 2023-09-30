import db from "../lib/database.js";

// CREATE ORDER
export const createOrder = async(req, res) => {
    const {userId, vendorId, category} = req.body;
    if(!userId || !vendorId || !category)  return res.status(400).json("Invalid request");

    const q = "INSERT INTO orders (`userId`, `vendorId`, `category`) VALUES (?)";
    const values = [
        userId,
        vendorId,
        category,
    ]
    db.query(q, [values], (err, data) =>{
        if(err) return res.status(500).json(err);
        return res.status(200).json("Order has been created!")
    })
}
//UPDATE ORDER
export const updateOrder = async(req, res) => {
    const q = "UPDATE orders SET `status`=? WHERE `id`=?";
    const values = [
        req.body.status, 
        req.params.id
    ]

    db.query(q, values, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
}
// GET ORDER
export const getOrder = async(req, res) => {
    const q = "SELECT * FROM Orders WHERE id=?";
    db.query(q, [req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.status(200).json(data);
    })
}
// GET ALL ORDERS
export const getOrders = (req, res) => {
    const q = "SELECT * FROM Orders";
    db.query(q,(err, data) => {
        if(err) return res.status(500).json(err);
        return res.status(200).json(data);
    })
}