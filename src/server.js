const express = require('express');
const cors = require('cors');
const path = require('path');
const { getPool } = require('./config/db');
const apiRoutes = require('./routes/api');

const PORT = process.env.API_PORT || 3000;

async function createTables(pool) {
  const tableStatements = [
    `CREATE TABLE IF NOT EXISTS clients (
      email VARCHAR(255) PRIMARY KEY,
      password VARCHAR(255) NOT NULL,
      petName VARCHAR(255),
      owner VARCHAR(255),
      phone VARCHAR(64),
      createdDate DATE,
      expiryDate DATE DEFAULT NULL,
      status VARCHAR(64) DEFAULT 'Active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS appointments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      pet VARCHAR(255),
      emoji VARCHAR(16),
      owner VARCHAR(255),
      phone VARCHAR(64),
      service VARCHAR(255),
      date DATE,
      time VARCHAR(64),
      vet VARCHAR(255),
      status VARCHAR(64),
      notes TEXT,
      clientEmail VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS vets (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255),
      emoji VARCHAR(16),
      spec VARCHAR(255),
      status VARCHAR(64),
      appts INT DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS patients (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255),
      emoji VARCHAR(16),
      species VARCHAR(255),
      breed VARCHAR(255),
      age VARCHAR(64),
      owner VARCHAR(255),
      phone VARCHAR(64),
      lastVisit VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      adminPassword VARCHAR(255) DEFAULT 'admin123',
      clinicName VARCHAR(255) DEFAULT 'ARF - Animal Relief Facility',
      clinicPhone VARCHAR(64) DEFAULT '+63 2 8123 4567'
    )`
  ];

  for (const statement of tableStatements) {
    await pool.query(statement);
  }
}

async function startServer() {
  const pool = await getPool();
  await createTables(pool);
  console.log('MySQL tables created or verified');

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api', apiRoutes);

  app.use(express.static(path.join(__dirname, '../public')));
  app.use('/assets', express.static(path.join(__dirname, '../assets')));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, message: 'API endpoint not found' });
    }

    res.sendFile(path.resolve(__dirname, '../public/index.html'));
  });

  app.listen(PORT, () => {
    console.log(`ARF Vet Clinic server running on http://localhost:${PORT}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
