import express from 'express';
import pg from 'pg';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pg;

// Gagamitin nya yung DATABASE_URL na nilagay mo sa Render
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

db.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ DB FAILED:', err.message);
  } else {
    console.log('✅ Postgres Connected - gco_portal OK');
  }
});

// GET all appointments
app.get('/api/appointments', async (req, res) => {
  const { status } = req.query;
  try {
    let result;
    if (status) {
      result = await db.query('SELECT * FROM appointments WHERE status=$1 ORDER BY appointment_date DESC, id DESC', [status]);
    } else {
      result = await db.query('SELECT * FROM appointments ORDER BY appointment_date DESC, id DESC');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM appointments WHERE id=$1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE / CANCEL
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await db.query('UPDATE appointments SET status=$1 WHERE id=$2', ['Cancelled', req.params.id]);
    res.json({ message: 'Cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN PUT
app.put('/api/appointments/:id', async (req, res) => {
  const { status, remarks, counselor_name } = req.body;
  console.log(`🔄 ADMIN UPDATE ID ${req.params.id} -> ${status}`);
  try {
    if (remarks !== undefined) {
      await db.query('UPDATE appointments SET status=$1, remarks=$2 WHERE id=$3', [status, remarks, req.params.id]);
    } else {
      await db.query('UPDATE appointments SET status=$1 WHERE id=$2', [status, req.params.id]);
    }
    console.log('✅ ADMIN UPDATED:', req.params.id);
    res.json({ message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new appointment
app.post('/api/appointments', async (req, res) => {
  const appointment_date = req.body.appointment_date || req.body.date;
  const consultation_hour = req.body.consultation_hour || req.body.time;
  const counselor_name = req.body.counselor_name || req.body.counselor;
  const reason = req.body.reason;
  const student_info = req.body.student_info || req.body.student;
  // [ADD - URGENCY] - bagong fields galing sa BookAppointment.jsx
  const urgency_level = req.body.urgency_level || 'Normal';
  const emergency_contact_name = req.body.emergency_contact_name || null;
  const emergency_contact_relation = req.body.emergency_contact_relation || null;
  const emergency_contact_no = req.body.emergency_contact_no || null;

  if (!appointment_date || !consultation_hour || !counselor_name || !student_info) {
    return res.status(400).json({ message: 'Missing fields - appointment_date cannot be null' });
  }

  const day = new Date(appointment_date).getDay();
  if (day === 0 || day === 6) {
    return res.status(400).json({ message: 'No booking on weekends - Mon to Fri only.' });
  }

  try {
    const pendingRes = await db.query(`SELECT COUNT(*) as cnt FROM appointments WHERE student_info=$1 AND status='Pending'`, [student_info]);
    if (parseInt(pendingRes.rows[0].cnt) >= 1) {
      return res.status(400).json({ message: 'May pending appointment ka pa. 1 appointment per student lang.' });
    }

    const dayRes = await db.query(`SELECT COUNT(*) as cnt FROM appointments WHERE appointment_date=$1 AND student_info=$2 AND status!='Cancelled'`, [appointment_date, student_info]);
    if (parseInt(dayRes.rows[0].cnt) >= 1) {
      return res.status(400).json({ message: `Naka-book ka na for ${appointment_date}.` });
    }

    const counRes = await db.query(`SELECT COUNT(*) as cnt FROM appointments WHERE appointment_date=$1 AND counselor_name=$2 AND status!='Cancelled'`, [appointment_date, counselor_name]);
    if (parseInt(counRes.rows[0].cnt) >= 3) {
      return res.status(400).json({ message: `Full na si ${counselor_name} for ${appointment_date} (3 max per day).` });
    }

    const result = await db.query(
      `INSERT INTO appointments (appointment_date, consultation_hour, counselor_name, reason, student_info, status, urgency_level, emergency_contact_name, emergency_contact_relation, emergency_contact_no) VALUES ($1,$2,$3,$4,$5,'Pending',$6,$7,$8,$9) RETURNING id`,
      [appointment_date, consultation_hour, counselor_name, reason, student_info, urgency_level, emergency_contact_name, emergency_contact_relation, emergency_contact_no]
    );
    console.log('✅ SAVED:', result.rows[0].id, 'Urgency:', urgency_level);
    res.json({ message: 'Booked!', id: result.rows[0].id, student_info, urgency_level });
  } catch (err) {
    console.error('❌ INSERT ERROR:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

app.get('/', (req, res) => res.send('GCO Server OK - Student + Admin Connected'));

// ITO YUNG FIX SA PORT - gagamitin nya yung PORT ni Render (10000), hindi na 3001 lang
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Rules: Mon-Fri Only, 1 per student, 1 per day, 3 per counselor');
  console.log('ADMIN PUT /api/appointments/:id READY');
});
