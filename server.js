import express  from 'express';
import bodyParser  from 'body-parser';
import path  from 'path';
import dotenv from 'dotenv';


dotenv.config();



import authRouter  from './routes/auth.js';
import adminRouter from './routes/admin.js';
import userRouter  from './routes/user.js';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
to make api call in the frontend use
localhost:{port}/api/auth/signin
*/
app.use('/api/auth/signup', authRouter);
app.use('/api/auth/signin', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter)


let nodeServer = app.listen(process.env.PORT, function () {
    let port = nodeServer.address().port;
    let host = nodeServer.address().address;
    console.log('App working on: ', host, port);
  });