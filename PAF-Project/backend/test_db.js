const mysql = require('mysql2/promise');

async function checkDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'smart_campus_db'
  });

  const [rows] = await connection.execute('SELECT email, google_sub FROM users LIMIT 10');
  console.log('Users:');
  console.log(rows);
  
  try {
    const [indexes] = await connection.execute("SHOW INDEX FROM users");
    console.log('\nIndexes:');
    console.log(indexes.map(i => ({Key_name: i.Key_name, Column_name: i.Column_name})));
  } catch(e){}

  await connection.end();
}

checkDb().catch(console.error);
