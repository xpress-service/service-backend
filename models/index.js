/**
 * Query the database using the pool
 * @param {String} query - The database query to be executed
 * @param {*} params - Parameters to be used while executing the query
 * @return {Promise<*>}
 */
async function query(query, params = null) {
    return new Promise(function (resolve, reject) {
      con.query(query, params, function (error, rows, field) {
        if (error) return reject(error.sqlMessage);
        resolve(rows);
      });
    });
  }
  
  async function transactionQuery(query, params = null) {
    return new Promise(function (resolve, reject) {
      con.query(query, params, function (error, rows, field) {
        if (error) {
          console.log('---------Transaction error----------');
          console.log(error.sqlMessage);
          con.rollback(()=>{
            reject('An error occurred. Please try again. Help me o')
          })
        }
        resolve(rows);
      });
    });
  }
  
  module.exports = {query, transactionQuery};