import express  from 'express';
import dotenv from 'dotenv';
import authRouter  from './routes/auth.js';
import userRouter  from './routes/users.js';
import orderRouter  from './routes/orders.js';

dotenv.config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/*
to make api call in the frontend use
localhost:{port}/api/users/signin
*/
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/orders', orderRouter)


let nodeServer = app.listen(5000, function () {
    let port = nodeServer.address().port;
    let host = nodeServer.address().address;
    console.log('App working on: ', host, port);
  });