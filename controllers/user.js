import db from "../lib/database.js";

// GET VENDOR BY CATEGORY
export const getVendorByCategory = (req, res) => {
    const query = req.query.category; // Get the query parameter 'q' from the request

    // SQL query to search for vendors by category
    const sql = `SELECT * FROM vendors WHERE category LIKE ?`;
  
    // Execute the SQL query with the search query as a parameter
    db.query(sql, [`%${query}%`], (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      if(!results.length) return res.status(404).json("No Vendor found!");

      res.status(200).json(results);
    });
}

// CREATE A VENDOR
export const createVendor = (req, res) => {
    const ql = "INSERT INTO vendors (name, category, location) VALUES (?)";
    const values = [
        req.body.name,
        req.body.category,
        req.body.location
    ]
    db.query(ql, [values], (err, result) => {
        if(err) return res.status(500).json(err);
        res.status(200).json("Vendor has been created")
    }) 
}

