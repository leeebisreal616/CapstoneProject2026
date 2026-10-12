import express from 'express'
import mysql from 'mysql2'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gco_portal'
})

db.connect(err => {
  if (err) {
    console.error('❌ DB FAILED:', err.message)
  } else {
    console.log('✅ MySQL Connected - gco_portal OK')
  }
})

// GET all appointments - for history
app.get('/api/appointments', (req, res) => {
  db.query('SELECT * FROM appointments ORDER BY appointment_date DESC, id DESC', (err, rows) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json(rows)
  })
})

// DELETE appointment
app.delete('/api/appointments/:id', (req, res) => {
  db.query('UPDATE appointments SET status="Cancelled" WHERE id=?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json({ message: 'Cancelled' })
  })
})

// POST new appointment - UPDATED FOR MON-FRI ONLY
app.post('/api/appointments', (req, res) => {
  // Accept BOTH old and new payload para di malito
  const appointment_date = req.body.appointment_date || req.body.date
  const consultation_hour = req.body.consultation_hour || req.body.time
  const counselor_name = req.body.counselor_name || req.body.counselor
  const reason = req.body.reason
  const student_info = req.body.student_info || req.body.student

  console.log('📩 BOOKING:', { appointment_date, consultation_hour, counselor_name, student_info })

  if (!appointment_date ||!consultation_hour ||!counselor_name ||!student_info) {
    return res.status(400).json({ message: 'Missing fields - appointment_date cannot be null' })
  }

  // Rule 1: MON-FRI ONLY - Block Saturday (6) and Sunday (0)
  const day = new Date(appointment_date).getDay()
  if (day === 0 || day === 6) {
    return res.status(400).json({ message: 'No booking on weekends - Mon to Fri only. School is closed on Sat & Sun.' })
  }

  // Rule 2: 1 appointment per student only (pending)
  db.query(
    `SELECT COUNT(*) as cnt FROM appointments WHERE student_info=? AND status='Pending'`,
    [student_info],
    (err, pendingRes) => {
      if (err) return res.status(500).json({ message: err.message })
      if (pendingRes[0].cnt >= 1) {
        return res.status(400).json({ message: 'May pending appointment ka pa. 1 appointment per student lang.' })
      }

      // Rule 3: 1 per day per student
      db.query(
        `SELECT COUNT(*) as cnt FROM appointments WHERE appointment_date=? AND student_info=? AND status!= 'Cancelled'`,
        [appointment_date, student_info],
        (err, dayRes) => {
          if (err) return res.status(500).json({ message: err.message })
          if (dayRes[0].cnt >= 1) {
            return res.status(400).json({ message: `Naka-book ka na for ${appointment_date}. Next day ka na ulit.` })
          }

          // Rule 4: 3 per counselor per day
          db.query(
            `SELECT COUNT(*) as cnt FROM appointments WHERE appointment_date=? AND counselor_name=? AND status!= 'Cancelled'`,
            [appointment_date, counselor_name],
            (err, counRes) => {
              if (err) return res.status(500).json({ message: err.message })
              if (counRes[0].cnt >= 3) {
                return res.status(400).json({ message: `Full na si ${counselor_name} for ${appointment_date} (3 max per day).` })
              }

              // Save
              const sql = `INSERT INTO appointments (appointment_date, consultation_hour, counselor_name, reason, student_info, status) VALUES (?,?,?,?,?,'Pending')`
              db.query(sql, [appointment_date, consultation_hour, counselor_name, reason, student_info], (err, result) => {
                if (err) {
                  console.error('❌ INSERT ERROR:', err.message)
                  return res.status(500).json({ message: err.message })
                }
                console.log('✅ SAVED:', result.insertId)
                res.json({ message: 'Booked!', id: result.insertId })
              })
            }
          )
        }
      )
    }
  )
})

app.get('/', (req, res) => res.send('GCO Server OK - Mon-Fri Only Rule Active'))

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001')
  console.log('Rules: Mon-Fri Only, 1 per student, 1 per day, 3 per counselor')
})