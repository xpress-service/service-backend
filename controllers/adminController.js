import database from '../lib/database.js';

import expressAsyncHandler from 'express-async-handler';

// Create Admin Profile
export const createAdminProfile = expressAsyncHandler(async (req, res) => {

    const { first_name, last_name, profile_picture, desc } = req.body;
 
    const adminId = req.user.id; 
    const q =
      "INSERT INTO admin_profile (`admin_id`, `first_name`, `last_name`, `profile_picture`, `desc`) VALUES (?, ?, ?, ?, ?)";
    const values = [adminId, first_name, last_name, profile_picture, desc];
  
    database.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Admin profile created successfully.");
    });
  });
  
// View Admin Profile
  export const viewAdminProfile = expressAsyncHandler(async (req, res) => {
    const adminId = req.params.adminId || req.user.id; 
  
    const q = "SELECT * FROM admin_profile WHERE admin_id = ?";
    database.query(q, [adminId], (err, rows) => {
      if (err) return res.status(500).json(err);
  
      if (rows.length === 0) {
        return res.status(404).json("Admin profile not found.");
      }
  
      const adminProfile = rows[0];
      return res.status(200).json(adminProfile);
    });
  });
  
// Update Admin Profile
  export const updateAdminProfile = expressAsyncHandler(async (req, res) => {
    
    const { first_name, last_name, profile_picture, desc } = req.body;

    const adminId = req.params.adminId || req.user.id; 
  
    const q =
      "UPDATE admin_profile SET first_name = ?, last_name = ?, profile_picture = ?, desc = ? WHERE admin_id = ?";
    const values = [first_name, last_name, profile_picture, desc, adminId];
  
    database.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      
      if (data.affectedRows === 0) {
        return res.status(404).json("Admin profile not found.");
      }
      return res.status(200).json("Admin profile updated successfully.");
    });
  });
  