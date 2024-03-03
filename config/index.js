const dotenv = require("dotenv");
const bunyan = require("bunyan");

const APP_NAME = "SERVICE-EXPRESS";

// load env configuration as early as possible
dotenv.config();

const {
	PORT = 6000,
	DB_USER,
	DB_HOST,
	DB_PASSWORD,
	DB_NAME,
	NODE_ENV = "development",
} = process.env;
// export configuration
module.exports = {
	applicationName: APP_NAME,
	port: PORT,
	logger: bunyan.createLogger({
		name: APP_NAME,
	}),
	db: {
		host: DB_HOST,
		user: DB_USER,
		password: DB_PASSWORD,
		database: DB_NAME,
	},

	production: NODE_ENV === "production",
};
