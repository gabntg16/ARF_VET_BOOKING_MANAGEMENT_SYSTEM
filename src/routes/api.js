const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

function buildUpdateQuery(data, allowedFields) {
  const keys = Object.keys(data).filter(key => allowedFields.includes(key));
  const values = keys.map(key => data[key]);
  const setClause = keys.map(key => `\`${key}\` = ?`).join(', ');
  return { setClause, values };
}

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/clients', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM clients');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/clients/:email', async (req, res) => {
  const email = req.params.email;
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM clients WHERE email = ?', [email]);
    res.json(rows[0] || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/clients', async (req, res) => {
  const { email, password, petName, owner, phone, expiryDate, status } = req.body;
  try {
    const pool = await getPool();
    await pool.query(
      `INSERT INTO clients (email, password, petName, owner, phone, createdDate, expiryDate, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        password,
        petName || null,
        owner || null,
        phone || null,
        new Date().toISOString().split('T')[0],
        expiryDate || null,
        status || 'Active'
      ]
    );
    res.json({ success: true, message: 'Account created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/clients/:email', async (req, res) => {
  const email = req.params.email;
  const updates = req.body;
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No updates provided' });
  }
  const { setClause, values } = buildUpdateQuery(updates, ['password', 'petName', 'owner', 'phone', 'expiryDate', 'status']);
  if (!setClause) {
    return res.status(400).json({ success: false, message: 'No valid client fields provided' });
  }

  try {
    const pool = await getPool();
    await pool.query(`UPDATE clients SET ${setClause} WHERE email = ?`, [...values, email]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/clients/:email', async (req, res) => {
  const email = req.params.email;
  try {
    const pool = await getPool();
    await pool.query('DELETE FROM clients WHERE email = ?', [email]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/appointments', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM appointments ORDER BY date, time');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/appointments/client/:email', async (req, res) => {
  const email = req.params.email;
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      'SELECT * FROM appointments WHERE clientEmail = ? ORDER BY date, time',
      [email]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/appointments', async (req, res) => {
  const appointment = req.body;
  try {
    const pool = await getPool();
    const [result] = await pool.query(
      `INSERT INTO appointments (pet, emoji, owner, phone, service, date, time, vet, status, notes, clientEmail)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointment.pet || null,
        appointment.emoji || null,
        appointment.owner || null,
        appointment.phone || null,
        appointment.service || null,
        appointment.date || null,
        appointment.time || null,
        appointment.vet || null,
        appointment.status || null,
        appointment.notes || null,
        appointment.clientEmail || null
      ]
    );
    res.json({ success: true, id: result.insertId, message: 'Appointment created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/appointments/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No updates provided' });
  }
  const { setClause, values } = buildUpdateQuery(updates, ['pet', 'emoji', 'owner', 'phone', 'service', 'date', 'time', 'vet', 'status', 'notes', 'clientEmail']);
  if (!setClause) {
    return res.status(400).json({ success: false, message: 'No valid appointment fields provided' });
  }

  try {
    const pool = await getPool();
    await pool.query(`UPDATE appointments SET ${setClause} WHERE id = ?`, [...values, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/appointments/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const pool = await getPool();
    await pool.query('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/vets', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM vets');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/vets', async (req, res) => {
  const { name, emoji, spec, status, appts } = req.body;
  try {
    const pool = await getPool();
    const [result] = await pool.query(
      'INSERT INTO vets (name, emoji, spec, status, appts) VALUES (?, ?, ?, ?, ?)',
      [name || null, emoji || null, spec || null, status || null, appts || 0]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/vets/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No updates provided' });
  }
  const { setClause, values } = buildUpdateQuery(updates, ['name', 'emoji', 'spec', 'status', 'appts']);
  if (!setClause) {
    return res.status(400).json({ success: false, message: 'No valid staff fields provided' });
  }

  try {
    const pool = await getPool();
    await pool.query(`UPDATE vets SET ${setClause} WHERE id = ?`, [...values, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/vets/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const pool = await getPool();
    await pool.query('DELETE FROM vets WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/patients', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM patients');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/patients', async (req, res) => {
  const { name, emoji, species, breed, age, owner, phone, lastVisit } = req.body;
  try {
    const pool = await getPool();
    const [result] = await pool.query(
      'INSERT INTO patients (name, emoji, species, breed, age, owner, phone, lastVisit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name || null, emoji || null, species || null, breed || null, age || null, owner || null, phone || null, lastVisit || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/patients/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No updates provided' });
  }
  const { setClause, values } = buildUpdateQuery(updates, ['name', 'emoji', 'species', 'breed', 'age', 'owner', 'phone', 'lastVisit']);
  if (!setClause) {
    return res.status(400).json({ success: false, message: 'No valid patient fields provided' });
  }

  try {
    const pool = await getPool();
    await pool.query(`UPDATE patients SET ${setClause} WHERE id = ?`, [...values, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM settings ORDER BY id LIMIT 1');
    res.json(rows[0] || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/settings/admin', async (req, res) => {
  const { adminPassword, clinicName, clinicPhone } = req.body;
  try {
    const pool = await getPool();
    const [existing] = await pool.query('SELECT id FROM settings ORDER BY id LIMIT 1');
    if (existing.length > 0) {
      await pool.query(
        'UPDATE settings SET adminPassword = ?, clinicName = ?, clinicPhone = ? WHERE id = ?',
        [adminPassword || 'admin123', clinicName || 'ARF — Animal Relief Facility', clinicPhone || '+63 2 8123 4567', existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO settings (adminPassword, clinicName, clinicPhone) VALUES (?, ?, ?)',
        [adminPassword || 'admin123', clinicName || 'ARF — Animal Relief Facility', clinicPhone || '+63 2 8123 4567']
      );
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
