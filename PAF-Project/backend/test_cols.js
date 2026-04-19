const mysql = require('mysql2/promise');

async function checkDb() {
  const connection = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'root', database: 'smart_campus_db'
  });
  const [cols] = await connection.execute("SHOW COLUMNS FROM users LIKE 'google_sub'");
  console.log(cols);
  await connection.end();
}
checkDb().catch(console.error);
