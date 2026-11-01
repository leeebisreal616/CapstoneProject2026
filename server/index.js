import express from 'express';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

let appointments = [];
let idCounter = 1;
const PORT = process.env.PORT || 10000;

app.get('/api/appointments', (req, res) => {
  const sorted = [...appointments].sort((a,b) => new Date(b.appointment_date) - new Date(a.appointment_date));
  res.json(sorted);
});

app.delete('/api/appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const appt = appointments.find(a => a.id === id);
  if (appt) {
    appt.status = 'Cancelled';
    res.json({ message: 'Cancelled' });
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

app.post('/api/appointments', (req, res) => {
  const appointment_date = req.body.appointment_date || req.body.date;
  const consultation_hour = req.body.consultation_hour || req.body.time;
  const counselor_name = req.body.counselor_name || req.body.counselor;
  const reason = req.body.reason;
  const student_info = req.body.student_info || req.body.student;

  if (!appointment_date || !consultation_hour || !counselor_name || !student_info) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const day = new Date(appointment_date).getDay();
  if (day === 0 || day === 6) {
    return res.status(400).json({ message: 'No booking on weekends - Mon to Fri only.' });
  }

  const hasPending = appointments.some(a => a.student_info === student_info && a.status === 'Pending');
  if (hasPending) {
    return res.status(400).json({ message: 'May pending appointment ka pa. 1 lang.' });
  }

  const sameDay = appointments.some(a => a.appointment_date === appointment_date && a.student_info === student_info && a.status !== 'Cancelled');
  if (sameDay) {
    return res.status(400).json({ message: `Naka-book ka na for ${appointment_date}.` });
  }

  const counselorCount = appointments.filter(a => a.appointment_date === appointment_date && a.counselor_name === counselor_name && a.status !== 'Cancelled').length;
  if (counselorCount >= 3) {
    return res.status(400).json({ message: `Full na si ${counselor_name} for ${appointment_date}.` });
  }

  const newAppt = {
    id: idCounter++,
    appointment_date,
    consultation_hour,
    counselor_name,
    reason,
    student_info,
    status: 'Pending',
    createdAt: new Date()
  };
  appointments.push(newAppt);
  res.json({ message: 'Booked!', id: newAppt.id });
});

app.get('/', (req, res) => res.send('GCO Server OK - LIVE'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});