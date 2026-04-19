const mysql = require('mysql2/promise');

async function fixDb() {
  const connection = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'root', database: 'smart_campus_db'
  });
  
  // Make google_sub nullable
  await connection.execute("ALTER TABLE users MODIFY google_sub VARCHAR(255) NULL");
  
  // Make student_id nullable just in case
  await connection.execute("ALTER TABLE users MODIFY student_id VARCHAR(20) NULL");

  // Check columns
  const [cols] = await connection.execute("SHOW COLUMNS FROM users");
  console.log(cols);
  
  await connection.end();
}
fixDb().catch(console.error);
