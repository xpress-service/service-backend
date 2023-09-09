import mysql from 'mysql';

const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: '',
});

database.connect(function (err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
  console.log('Database connected.');
});

export default database;
