import mysql from 'mysql';

const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'service_express',
});
database.connect(function (err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
  console.log('Database connected.');
});

export default database;
