import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(' Database connection successful!');
    connection.release();
  } catch (error) {
    console.error(' Database connection failed:', error.message);
    // If the error indicates the database doesn't exist, try to create it and reconnect.
    if (error && (error.code === 'ER_BAD_DB_ERROR' || /Unknown database/i.test(error.message))) {
      try {
        console.log(` Database "${process.env.DB_NAME}" not found — attempting to create it...`);
        const tmpConn = await mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD
        });
        await tmpConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        await tmpConn.end();
        console.log(` Database "${process.env.DB_NAME}" created or already existed. Retrying connection...`);

        const connection = await pool.getConnection();
        console.log(' Database connection successful!');
        connection.release();
        return;
      } catch (createErr) {
        console.error(' Failed to create database:', createErr.message);
        process.exit(1);
      }
    }
    process.exit(1);
  }
};

export default pool;