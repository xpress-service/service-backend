// import jwt from 'jsonwebtoken';

// export const generateToken = (user) => {
//     return jwt.sign({
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         isAdmin: user.isAdmin,

//     }, process.env.JWTSECRET, {
//         expiresIn: '30d',
//     } )
// }

// export const isAuth = (req, res, next) => {
//     const authorization = req.headers.authorization;
//     if (authorization) {
//         const token = authorization.slice(7, authorization.length); // slice to get rid of Bearer
//         jwt.verify(
//             token,
//             process.env.JWTSECRET,
//             (err, decode) => { 
//                 if (err) {
//                     res.status(401).send({ message: 'Invalid Token'});
//                 } else {
//                     req.user = decode;
//                     next();
//                 }
//             }
//         )
//     } else {
//         res.status(401).send({ message: 'No Token' });
//     }
// }