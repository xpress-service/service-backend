import db from "../lib/database.js";
// ROUTE TO CREATE A NEW TRANSACTION
export const createTransaction = (req, res) => {
    const { userId, vendorId, amount } = req.body;

  // Perform validation (e.g., check if userId and vendorId exist)
  if (!userId || !vendorId || !amount) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // SQL query to insert a new transaction into the database
  const sql = 'INSERT INTO transactions (userId, vendorId, amount) VALUES (?, ?, ?)';

  // Execute the SQL query with the provided data
  db.query(sql, [userId, vendorId, amount], (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    
    const newTransaction = {
      id: results.insertId,
      userId,
      vendorId,
      amount,
    };

    res.status(201).json(newTransaction);
  });
}

// ROUTE TO GET ALL TRANSACTIONS BELONGING TO A SPECIFIC USER
export const getUserTransactions = (req, res) => {

  if(req.params.id != req.user.id && !req.user.isAdmin) return res.status(403).json("Unauthorized");

  const ql = "SELECT * FROM transactions WHERE userId=?";

  db.query(ql, [req.params.id], (err, result) => {

    if(err) return res.status(500).json(err);
    if(!result.length) return res.status(404).json("No transaction found");
    res.status(200).json(result);
  })
}

// ROUTE TO GET ALL TRANSACTIONS
export const getAllTransaction = (req ,res) => {
     // SQL query to retrieve all transactions from the database
  const sql = 'SELECT * FROM transactions';

  // Execute the SQL query
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    if(!results.length) return res.status(404).json("No transaction found!");

    res.status(200).json(results);
  });
}