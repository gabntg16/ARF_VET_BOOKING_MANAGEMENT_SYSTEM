const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'Arf_db';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const DB_SKIP_CREATE = process.env.DB_SKIP_CREATE === 'true';
const DB_SSL = process.env.DB_SSL === 'true';
const DB_SSL_REJECT_UNAUTHORIZED = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

function getSslOptions() {
  if (!DB_SSL) return undefined;
  return {
    rejectUnauthorized: DB_SSL_REJECT_UNAUTHORIZED
  };
}

async function createDatabaseIfNeeded() {
  if (DB_SKIP_CREATE) return;

  let connection;

  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
      ssl: getSslOptions()
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  } catch (error) {
    console.warn(`Could not create database "${DB_NAME}". Continuing with the configured database.`, error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

let pool;

async function getPool() {
  if (pool) return pool;
  await createDatabaseIfNeeded();
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
    ssl: getSslOptions()
  });
  return pool;
}

module.exports = {
  getPool
};
