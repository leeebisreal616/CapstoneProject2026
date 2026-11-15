import express from 'express';
import pg from 'pg';
import cors from 'cors';
import crypto from 'crypto';
const app = express();
app.use(cors());
app.use(express.json());
const { Pool } = pg;
// Gagamitin nya yung DATABASE_URL na nilagay mo sa Render
const db = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
db.query('SELECT NOW()', async (err) => {
  if (err) { console.error('❌ DB FAILED:', err.message); }
  else {
    console.log('✅ Postgres Connected - gco_portal OK');
    try {
      // Auto-create admins table kung wala pa — fix sa 42P01 error
      await db.query(`CREATE TABLE IF NOT EXISTS admins (id SERIAL PRIMARY KEY, username TEXT UNIQUE, email TEXT UNIQUE, password_hash TEXT, password TEXT)`);
      const check = await db.query(`SELECT COUNT(*) as cnt FROM admins`);
      if (parseInt(check.rows[0].cnt) === 0) {
        // Default login: admin / GCOAdmin123 - palitan mo agad after makapasok
        await db.query(`INSERT INTO admins (username, email, password_hash, password) VALUES ($1,$2,$3,$3)`, ['admin', 'leeebisreal616@gmail.com', 'GCOAdmin123']);
        console.log('✅ Default admin created: admin / GCOAdmin123');
      }
      console.log('✅ Admins table ready');
    } catch (e) { console.error('❌ Admins setup failed:', e.message); }
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
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM appointments WHERE id=$1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE / CANCEL
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await db.query('UPDATE appointments SET status=$1 WHERE id=$2', ['Cancelled', req.params.id]);
    res.json({ message: 'Cancelled' });
  } catch (err) { res.status(500).json({ message: err.message }); }
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
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST new appointment
app.post('/api/appointments', async (req, res) => {
  const appointment_date = req.body.appointment_date || req.body.date;
  const consultation_hour = req.body.consultation_hour || req.body.time;
  const counselor_name = req.body.counselor_name || req.body.counselor;
  const reason = req.body.reason;
  const student_info = req.body.student_info || req.body.student;
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
  } catch (err) { console.error('❌ INSERT ERROR:', err.message); return res.status(500).json({ message: err.message }); }
});

// ===== ADMIN AUTH =====
async function checkPassword(plain, stored) {
  if (!stored) return false;
  if (plain === stored) return true;
  try {
    const bcrypt = (await import('bcryptjs')).default;
    return await bcrypt.compare(plain, stored);
  } catch { return false; }
}
async function hashPassword(plain) {
  try {
    const bcrypt = (await import('bcryptjs')).default;
    return await bcrypt.hash(plain, 10);
  } catch {
    return crypto.createHash('sha256').update(plain).digest('hex');
  }
}

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const r = await db.query(`SELECT * FROM admins WHERE username=$1 OR email=$1 LIMIT 1`, [username]);
    if (r.rows.length === 0) return res.json({ success: false, message: 'Incorrect username or password.' });
    const admin = r.rows[0];
    const stored = admin.password_hash || admin.password || admin.pass;
    const ok = await checkPassword(password, stored);
    // Fallback: check din yung kabilang column kung magkaiba sila
    const ok2 = !ok && admin.password && admin.password !== stored ? await checkPassword(password, admin.password) : false;
    if (!ok && !ok2) return res.json({ success: false, message: 'Incorrect username or password.' });
    const token = crypto.randomBytes(24).toString('hex');
    return res.json({ success: true, admin: { id: admin.id, username: admin.username, email: admin.email }, access_token: token, refresh_token: token, expires_in: 3600 });
  } catch (e) { console.error(e); return res.status(500).json({ success: false, message: 'Server error.' }); }
});

app.post('/api/admin/forgot-password', async (req, res) => {
  try {
    const { username } = req.body || {};
    if (!username) return res.json({ success: false, message: 'Enter your username or email.' });
    const r = await db.query(`SELECT id, username, email FROM admins WHERE username=$1 OR email=$1 LIMIT 1`, [username.trim()]);
    if (r.rows.length === 0) return res.json({ success: true, message: 'If that account exists, a reset link was sent.' });
    const admin = r.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await db.query(`CREATE TABLE IF NOT EXISTS password_resets (id SERIAL PRIMARY KEY, admin_id INT, token TEXT UNIQUE, expires_at TIMESTAMP)`);
    await db.query(`DELETE FROM password_resets WHERE admin_id=$1`, [admin.id]);
    await db.query(`INSERT INTO password_resets (admin_id, token, expires_at) VALUES ($1,$2,$3)`, [admin.id, token, expires]);
    const resetLink = `${process.env.FRONTEND_URL || 'https://gco-portal.vercel.app'}/admin/reset-password?token=${token}`;
    console.log('RESET LINK FOR', admin.username, resetLink);
    return res.json({ success: true, message: 'If that account exists, a reset link was sent. Check Render Logs for the link.' });
  } catch (e) { console.error('forgot-password error', e); return res.status(500).json({ success: false, message: 'Server error.' }); }
});

app.post('/api/admin/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.json({ success: false, message: 'Missing token or password.' });
    const f = await db.query(`SELECT * FROM password_resets WHERE token=$1 AND expires_at > NOW() LIMIT 1`, [token]);
    if (f.rows.length === 0) return res.json({ success: false, message: 'Link expired or invalid.' });
    const hash = await hashPassword(password);
    await db.query(`UPDATE admins SET password_hash=$1, password=$1 WHERE id=$2`, [hash, f.rows[0].admin_id]);
    await db.query(`DELETE FROM password_resets WHERE token=$1`, [token]);
    return res.json({ success: true, message: 'Password updated. You can now login.' });
  } catch (e) { console.error('reset-password error', e); return res.status(500).json({ success: false, message: 'Server error.' }); }
});

app.post('/api/admin/refresh', async (req, res) => {
  const token = crypto.randomBytes(24).toString('hex');
  return res.json({ success: true, access_token: token, expires_in: 3600, admin: null });
});

app.get('/', (req, res) => res.send('GCO Server OK - Student + Admin Connected'));
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Rules: Mon-Fri Only, 1 per student, 1 per day, 3 per counselor');
  console.log('ADMIN PUT /api/appointments/:id READY');
  console.log('ADMIN LOGIN / FORGOT / RESET READY');
});
