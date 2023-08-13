import database from '../lib/database.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

 export const signin =  expressAsyncHandler (async (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM users WHERE email = ?`;
    database.query(query, [email], async (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send({ message: 'Database error' });
        return;
      }
      const user = rows[0];
      if (user && bcrypt.compareSync(password, user.password)) {
        res.send({
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
      } else {
        res.status(401).send({ message: 'Invalid email or password' });
      }
    });
  })

// REGISTER USER
export const signup = async(req, res) => {
    //CHECK USER IF EXISTS

  const q = "SELECT * FROM users WHERE email = ?";

  database.query(q, [req.body.email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");
    //CREATE A NEW USER
    //Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const q =
      "INSERT INTO users (`image`,`email`,`password`,`name`,`isAdmin`,`contact`) VALUE (?)";

    const values = [
      req.body.image,
      req.body.email,
      hashedPassword,
      req.body.name,
      req.body.isAdmin,
      req.body.contact,
    ];

    database.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created.");
    });
  });
}