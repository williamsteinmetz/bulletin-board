const { Pool } = require('pg');

const pool = new Pool({
  user: 'yourUsername',
  host: 'localhost',
  database: 'yourDatabase',
  password: 'yourPassword',
  port: 5432,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('Error connecting to the database:', err);
  } else {
    console.log('Connection successful, current time from DB:', res.rows[0]);
  }
  pool.end();
});