import database from '../lib/database.js';

import expressAsyncHandler from 'express-async-handler';


// Create user profile
export const createProfile = expressAsyncHandler(async (req, res) => {

  const { first_name, last_name, profile_picture, desc } = req.body;

  const userId = req.user.id; 
  const q =
    "INSERT INTO user_profile (`user_id`, `first_name`, `last_name`, `profile_picture`, `desc`) VALUES (?, ?, ?, ?, ?)";
  const values = [userId, first_name, last_name, profile_picture, desc];

  database.query(q, values, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Profile created successfully.");
  });
});

// View user profile
export const viewProfile = expressAsyncHandler(async (req, res) => {
  
  const userId = req.params.userId || req.user.id;

  const q = "SELECT * FROM user_profile WHERE user_id = ?";
  database.query(q, [userId], (err, rows) => {
    if (err) return res.status(500).json(err);

    if (rows.length === 0) {
      return res.status(404).json("Profile not found.");
    }

    const userProfile = rows[0];
    return res.status(200).json(userProfile);
  });
});

// Update user profile
export const updateProfile = (async (req, res) => {

  const { first_name, last_name, profile_picture, desc } = req.body;

  const userId = req.params.userId || req.user.id; 

  const q =
    "UPDATE user_profile SET first_name = ?, last_name = ?, profile_picture = ?, desc = ? WHERE user_id = ?";
  const values = [first_name, last_name, profile_picture, desc, userId];

  database.query(q, values, (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.id === 0) {
      return res.status(404).json("Profile not found.");
    }
    
    return res.status(200).json("Profile updated successfully.");
  });
});

