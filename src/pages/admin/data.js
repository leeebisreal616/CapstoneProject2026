// src/pages/admin/data.js

export const initialAppointments = [
  { id: 1, student: 'Althea Santos', course: 'BS Psychology - 3rd', date: '2026-10-15', time: '10:00 AM', type: 'Academic', status: 'Pending' },
  { id: 2, student: 'Juan Dela Cruz', course: 'BS IT - 2nd', date: '2026-10-14', time: '2:00 PM', type: 'Personal', status: 'Approved' },
  { id: 3, student: 'Maria Reyes', course: 'BS Nursing - 4th', date: '2026-10-13', time: '9:00 AM', type: 'Career', status: 'Pending' },
]

export const inventorySubmissions = [
  { id: 1, student: 'Althea Santos', form: 'Student Inventory Form', submitted: '2026-10-12', status: 'Pending Review' },
  { id: 2, student: 'Juan Dela Cruz', form: 'Student Inventory Form', submitted: '2026-10-10', status: 'Reviewed' },
]

export const examResults = [
  { id: 1, student: 'Althea Santos', exam: 'DASS-21', score: 'Moderate Anxiety', date: '2026-10-12', flag: 'urgent' },
  { id: 2, student: 'Maria Reyes', exam: 'Beck Depression', score: 'Minimal', date: '2026-10-11', flag: 'normal' },
  { id: 3, student: 'Juan Dela Cruz', exam: 'DASS-21', score: 'Mild Stress', date: '2026-10-10', flag: 'normal' },
]   