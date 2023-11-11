/**
 * @description A static method for creation of database tables
 * @return {Promise<void>}
 */
async function createTables(con, logger) {
   
    const createTableAdmin = `        
      CREATE TABLE IF NOT EXISTS admins (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      company_id BIGINT REFERENCES company_profiles(id),
      name VARCHAR(50),
      company VARCHAR(50),
      role VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(100),
      status VARCHAR(250),
      verification_code VARCHAR(250) NOT NULL,
      expire_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
    const createTableUser = `        
      CREATE TABLE IF NOT EXISTS users (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      phone_number VARCHAR(30) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      avatar VARCHAR(100) NOT NULL,
      country VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL,
      gender VARCHAR(50) NOT NULL,
      nin VARCHAR(50) NOT NULL,
      skills VARCHAR(255) NOT NULL,
      verification_code VARCHAR(250) NOT NULL,
      status VARCHAR(250) NOT NULL,
      expire_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
  
   
  
    const createRefreshToken = `
      CREATE TABLE IF NOT EXISTS refresh_tokens (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      role VARCHAR(50) NOT NULL,
      ip_address VARCHAR(50) NOT NULL,
      token VARCHAR(250) NOT NULL,
      expiry_date DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
  
    const createAllUsers = `
      CREATE TABLE IF NOT EXISTS all_users (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL ,
      email VARCHAR(50) NOT NULL,
      name VARCHAR(50) NOT NULL,
      type VARCHAR(50) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
    const createTablePasswordReset = `
      CREATE TABLE IF NOT EXISTS password_reset (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(250) NOT NULL,
      role VARCHAR(250) NOT NULL,
      verification_code VARCHAR(250) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
  
    con.query(createRefreshToken, function (error, result) {
      if (error) {
        logger.info(`Couldn't create database tables \n${error.stack}`)
        process.exit(1)
      }
    })
  
    con.query(createAllUsers, function (error, result) {
      if (error) {
        logger.info(`Couldn't create database tables \n${error.stack}`)
        process.exit(1)
      }
    })
  
    con.query(createTableAdmin, function (error, result) {
      if (error) {
        logger.info(`Couldn't create database tables \n${error.stack}`)
        process.exit(1)
      }
    })
  
    con.query(createTableUser, function (error, result) {
      if (error) {
        logger.info(`Couldn't create database tables \n${error.stack}`)
        process.exit(1)
      }
    })
  
    con.query(createTablePasswordReset, function (error, results) {
      if (error) {
        logger.info(`Couldn't create database tables \n${error.stack}`)
        process.exit(1)
      }
    })
  }
  
  module.exports = {
    createTables,
  }