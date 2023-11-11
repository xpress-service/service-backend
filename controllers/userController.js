// import database from '../lib/database.js';
// import bcrypt from 'bcryptjs';
// import { generateToken } from '../utils.js';
// import expressAsyncHandler from 'express-async-handler';

// const signin =  expressAsyncHandler (async (req, res) => {
//     const { email, password } = req.body;

//     const query = `SELECT * FROM users WHERE email = ?`;
//     database.query(query, [email], async (err, rows) => {
//       if (err) {
//         console.error('Error executing query:', err);
//         res.status(500).send({ message: 'Database error' });
//         return;
//       }
//       const user = rows[0];
//       if (user && bcrypt.compareSync(password, user.password)) {
//         res.send({
//           id: user.id,
//           email: user.email,
//           isAdmin: user.isAdmin,
//           token: generateToken(user),
//         });
//       } else {
//         res.status(401).send({ message: 'Invalid email or password' });
//       }
//     });
//   })

//   export default signin;