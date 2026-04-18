const mysql = require('mysql2/promise');

async function fixDb() {
  const connection = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'root', database: 'smart_campus_db'
  });
  
  // Make role varchar so we never have enum truncation issues again
  await connection.execute("ALTER TABLE users MODIFY role VARCHAR(50) NOT NULL");
  
  const [cols] = await connection.execute("SHOW COLUMNS FROM users");
  console.log(cols);
  
  await connection.end();
}
fixDb().catch(console.error);
