// import express  from 'express';
// import bodyParser  from 'body-parser';
// import path  from 'path';
// import dotenv from 'dotenv';


// dotenv.config();



// import userRouter  from './routes/userRoute.js';
// import authRouter  from './routes/auth.js';
// // import userRouter  from './routes/user.js';

// const app = express();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// /*
// to make api call in the frontend use
// localhost:{port}/api/users/signin
// */
// app.use('/api/users', userRouter)
// app.use('/api/auth', authRouter)
// // app.use('/api/users', userRouter)


// let nodeServer = app.listen(process.env.PORT, function () {
//     let port = nodeServer.address().port;
//     let host = nodeServer.address().address;
//     console.log('App working on: ', host, port);
//   });

const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const helmet = require("helmet")
const mysql = require("mysql")
const HPP = require("hpp")
const cors = require("cors")
const fileUpload = require("express-fileupload")
const session = require("express-session")

const routeHandler = require("./routes")
const { createTables } = require("./models/repository/index")
const {
  ApiError,
  InternalError,
  NotFoundError,
} = require("./utilities/core/ApiError")

// List of allowed urls to make request to the staging ang production server
// const whitelist = [
// 	'http://localhost:3000',
// 	'https://edgedev.ivyarc.com',
// 	'https://www.edgedev.ivyarc.com',
// 	'https://edge.ivyarc.com',
// 	'https://www.edge.ivyarc.com',
// ];

const corsOption = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["x-auth-token"],
}

module.exports = config => {
  const app = express()

  const { db } = config
  const con = mysql.createConnection({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database,
  })

  con.connect(async function (err) {
    if (err) {
      config.logger.info(`Couldn't connect to the database\n${err}`)
      process.exit()
    }
    config.logger.info("Successfully connected to the Database")
    await createTables(con, config.logger)
  })


  app.use(bodyParser.json())
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  )
  app.use(helmet())
  app.use(
    session({
      secret: "sessionssecret",
      resave: false,
      saveUninitialized: true,
      cookies: {
        expires: 60 * 60 * 24,
      },
    })
  )
  app.use(cors(corsOption))
  app.use(express.static("uploads"))

  // prevent parameter pollution
  app.use(HPP())
  app.use(morgan("dev"))
  app.use(fileUpload())
  app.use(
    express.json({
      limit: "20mb",
      extended: true,
    })
  )
  app.use(
    express.urlencoded({
      limit: "20mb",
      extended: true,
    })
  )

  /**
   * Adds application routes middleware from the routes index which groups all routes together
   */
  app.use("/v1", routeHandler)

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(new NotFoundError("Resource Not Found"))
  })

  // error handler
  app.use(function (err, req, res, next) {
    // Checks if err is thrown by us and handled to the ApiError Class, if not we throw and handle an internal server error
    if (err instanceof ApiError) {
      ApiError.handle(err, res)
    } else {
      ApiError.handle(new InternalError(err), res)
    }
    // log error to the console for debugging purpose
    config.logger.error(`${err} app----`)
    console.error(err)
  })

  global.con = con
  return app
}