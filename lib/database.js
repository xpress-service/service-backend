import mysql from 'mysql';

const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'iorolun45',
  database: 'service_express',
});
database.connect(function (err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
  console.log('Database connected.');
});

export default database;
