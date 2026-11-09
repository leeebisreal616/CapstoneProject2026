import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE = 'http://localhost/gco-api'

export default function StudentLogin() {
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if(!studentId.trim()) return alert("Lagay mo Student ID")
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/students/login.php?student_id=${studentId.trim()}`)
      const data = await res.json()
      if(data.success){
        localStorage.setItem('student', JSON.stringify(data.student))
        localStorage.setItem('student_id', data.student.student_id)
        navigate('/') 
      } else {
        alert(data.message)
      }
    } catch(err){ 
      console.log(err)
      alert("API Error: " + err.message) 
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f6f8f7] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="text-[20px] font-bold text-gray-900">GCO Student Portal</h1>
          <p className="text-[13px] text-gray-500">CvSU Imus Campus</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-bold text-gray-900">Student Login</h2>
          <p className="text-[12px] text-gray-500 mt-1 mb-6">Sign in with your Student ID to continue</p>
          <form onSubmit={handleLogin}>
            <label className="text-[11px] font-bold tracking-wider text-gray-600">STUDENT ID</label>
            <input type="text" placeholder="Ex: 202311325" value={studentId} onChange={(e)=>setStudentId(e.target.value)} className="w-full mt-2 px-4 py-3.5 rounded-xl border border-gray-200 text-[14px] bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#085041] focus:ring-2 focus:ring-[#085041]/10 transition-all" />
            <button type="submit" disabled={loading} className="w-full mt-6 bg-[#0d3b2e] text-white text-[14px] font-semibold py-3.5 rounded-full hover:bg-[#085041] transition-all active:scale-[0.98] disabled:opacity-50">
              {loading ? 'Checking...' : 'Enter Portal'}
            </button>
          </form>
          <p className="text-[11px] text-gray-400 text-center mt-6">Test ID: 202311325 - Aaron Valencia</p>
        </div>
      </div>
    </div>
  )
}