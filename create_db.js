const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    console.log('Connecting to MySQL...');
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: ''
    });

    console.log('Creating database db_parkir...');
    await connection.query("CREATE DATABASE IF NOT EXISTS db_parkir;");
    console.log('Database db_parkir is ready.');

    await connection.end();
  } catch (error) {
    console.error('Failed to create database:', error);
  }
}

createDatabase();
