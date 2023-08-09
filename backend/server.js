import express  from 'express';
import bodyParser  from 'body-parser';
import path  from 'path';

import dotenv from 'dotenv';
dotenv.config();

import userRouter  from './routes/userRoute.js';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
to make api call in the frontend use
localhost:{port}/api/users/signin
*/
app.use('/api/users', userRouter)


let nodeServer = app.listen(process.env.PORT, function () {
    let port = nodeServer.address().port;
    let host = nodeServer.address().address;
    console.log('App working on: ', host, port);
  });