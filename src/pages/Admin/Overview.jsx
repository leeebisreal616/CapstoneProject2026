/* ============ OVERVIEW - HOME DESIGN SYSTEM ============ */
import { useState, useEffect } from 'react'

const BASE = 'http://localhost/gco-api'

const Icon = {
  calendar: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  doc: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M10 13H8M16 17H8M10 13h6M16 17h0" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  alert: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  users: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  chevron: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

export default function Overview({ setView }) {
  const [stats, setStats] = useState({ pendingAppointments: 0, pendingReviews: 0, flaggedStudents: 0, totalStudents: 0 })
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [appRes, needsRes, profileRes, assessRes] = await Promise.all([
          fetch(`${BASE}/appointments/get_appointments.php`).then(r=>r.json()).catch(()=>[]),
          fetch(`${BASE}/needs_assessment/get_needs_assessment.php`).then(r=>r.json()).catch(()=>[]),
          fetch(`${BASE}/student_profile/get_student_profile.php`).then(r=>r.json()).catch(()=>[]),
          fetch(`${BASE}/assessment_results/get_results.php`).then(r=>r.json()).catch(()=>[]),
        ])
        const appointments = Array.isArray(appRes) ? appRes : appRes.data || []
        const needs = Array.isArray(needsRes) ? needsRes : needsRes.data || []
        const profiles = Array.isArray(profileRes) ? profileRes : profileRes.data || []
        const assessments = Array.isArray(assessRes) ? assessRes : assessRes.data || []

        const inventoryTotal = needs.length + profiles.length
        setStats({
          pendingAppointments: appointments.filter(a => a.status === 'Pending' || a.status === 'pending').length,
          pendingReviews: [...needs, ...profiles].filter(i => i.status === 'Pending Review' || i.status === 'Pending' || i.status === 'pending').length,
          flaggedStudents: assessments.filter(a => a.flag === 'urgent' || a.needs_followup == 1).length,
          totalStudents: new Set([...appointments.map(a=>a.student_id), ...needs.map(n=>n.student_id), ...profiles.map(p=>p.student_id)]).size || appointments.length + inventoryTotal,
        })

        const recent = [
          ...appointments.slice(0,2).map(a=>({ text: `${a.student_name||a.name} booked ${a.concern||'appointment'}`, time: a.created_at||a.appointment_date, view: 'appointments', flag: false })),
          ...needs.slice(0,2).map(n=>({ text: `${n.student_name||n.name} submitted Needs Assessment`, time: n.created_at, view: 'inventory', flag: false })),
          ...profiles.slice(0,2).map(p=>({ text: `${p.student_name||p.name} submitted Student Profile`, time: p.created_at, view: 'inventory', flag: false })),
        ].slice(0,5)
        setActivity(recent)
      } catch(e){ console.error(e) } finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const cards = [
    { label: 'Pending Appointments', value: stats.pendingAppointments, color: '#085041', bg: 'bg-[#E8F5F1]', view: 'appointments', Icon: Icon.calendar, desc: 'Needs approval' },
    { label: 'Pending Reviews', value: stats.pendingReviews, color: '#185FA5', bg: 'bg-[#e6f1fb]', view: 'inventory', Icon: Icon.doc, desc: 'Inventory forms' },
    { label: 'Flagged Students', value: stats.flaggedStudents, color: '#B91C1C', bg: 'bg-red-50', view: 'assessment', Icon: Icon.alert, desc: 'Needs follow-up' },
    { label: 'Total Students', value: stats.totalStudents, color: '#3C3489', bg: 'bg-[#ede9fe]', view: 'students', Icon: Icon.users, desc: 'In system' },
  ]

  if(loading) return <div className="p-10 text-center text-[13px] text-gray-400">Loading from gco-api...</div>

  return (
    <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)] flex flex-col p-5 md:p-6">
      {/* Header - same as Home */}
      <div className="mb-6">
        <h1 className="text-[28px] md:text-[32px] font-bold text-gray-900 leading-[1.05]">Dashboard</h1>
        <p className="text-[13px] text-gray-500 mt-2">Live overview from gco-api - same design as student Home</p>
      </div>

      {/* STATS CARDS - SAME HOVER AS HOME 3 CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((s,i)=>(
          <button key={i} onClick={()=>setView(s.view)} 
            className="bg-white rounded-2xl p-5 border border-gray-200 text-left group cursor-pointer flex flex-col transition-all duration-200 hover:shadow-[0_8px_24px_rgba(8,80,65,0.12)] hover:border-[#085041]/20 hover:-translate-y-[2px] active:scale-[0.99]">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4 transition-all duration-200 group-hover:shadow-[0_4px_12px_rgba(8,80,65,0.15)]`} style={{ color: s.color }}>
              <s.Icon className="w-5 h-5"/>
            </div>
            <p className="text-[26px] font-bold leading-none" style={{color:s.color}}>{s.value}</p>
            <p className="text-[13px] font-bold text-gray-900 mt-2">{s.label}</p>
            <p className="text-[11px] text-gray-500 mt-1">{s.desc}</p>
            <p className="text-[11px] font-semibold mt-3 flex items-center gap-1 transition-all duration-200 group-hover:gap-2" style={{color:s.color}}>
              View {Icon.chevron('w-3 h-3 transition-transform duration-200 group-hover:translate-x-1')}
            </p>
          </button>
        ))}
      </div>

      {/* RECENT ACTIVITY - HOME CARD HOVER */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-[0_8px_24px_rgba(8,80,65,0.12)] hover:border-[#085041]/20 flex-1">
        <div className="px-6 py-4 border-b border-gray-100 bg-[#f6f8f7]/50 flex items-center justify-between">
          <p className="text-[13px] font-bold tracking-widest text-gray-500 uppercase">Recent Activity</p>
          <span className="text-[11px] bg-white border border-gray-200 px-2.5 py-1 rounded-full font-semibold text-gray-600">{activity.length} items</span>
        </div>
        <div className="divide-y divide-gray-100">
          {activity.length===0 ? 
            <div className="p-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                {Icon.doc('w-6 h-6 text-gray-400')}
              </div>
              <p className="text-[13px] text-gray-500 font-medium">No activity - empty pa DB mo boss</p>
              <p className="text-[11px] text-gray-400 mt-1">Mag-book sa student side, lalabas dito</p>
            </div> 
            : activity.map((a,i)=>
              <button key={i} onClick={()=>setView(a.view)} className="w-full px-6 py-4 flex gap-4 text-left group transition-all duration-200 hover:bg-[#f6f8f7] hover:pl-7">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 transition-all duration-200 group-hover:scale-125 ${a.flag?'bg-red-500':'bg-[#1D9E75]'}`}/>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-gray-900 group-hover:text-[#085041] transition-colors duration-200">{a.text}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{a.time ? new Date(a.time).toLocaleString() : 'Just now'}</p>
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-[#085041]">{Icon.chevron('w-4 h-4')}</span>
              </button>
            )
          }
        </div>
      </div>

      {/* Footer same as Home */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 text-center">CvSU Imus GCO • Live data from MySQL • Hover effects same as Home</p>
      </div>
    </div>
  )
}