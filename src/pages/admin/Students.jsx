// ============ STUDENTS DIRECTORY - FINAL WITH TOKENS ============
import { useState } from 'react'
import { T } from "../../components/ui/tokens"

const initialStudents = [
  { id: 1, name: 'Althea Santos', course: 'BS Psychology', year: '3rd', email: 'althea@cspc.edu.ph', status: 'Active' },
  { id: 2, name: 'Juan Dela Cruz', course: 'BS IT', year: '2nd', email: 'juan@cspc.edu.ph', status: 'Active' },
  { id: 3, name: 'Maria Reyes', course: 'BS Nursing', year: '4th', email: 'maria@cspc.edu.ph', status: 'Inactive' },
]

const Icon = {
  search: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mail: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

function getInitials(name){
  return name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()
}

export default function Students() {
  const [students] = useState(initialStudents)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.course.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeCount = students.filter(s=>s.status==='Active').length

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-5 lg:p-7">
      <div className="max-w-[1100px] mx-auto space-y-5">

        {/* HEADER */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className={T.pageTitle}>Students Directory</h1>
            <span className={`${T.badge} px-2.5 py-1 rounded-full bg-gray-900 text-white`}>{students.length} total • {activeCount} active</span>
          </div>
          <p className={T.pageSub}>Browse students who have used the portal.</p>
        </div>

        {/* SEARCH + FILTER CARD */}
        <div className={`${T.card} p-4 flex flex-col sm:flex-row gap-3`}>
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{Icon.search('w-4 h-4')}</span>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Search name, course or email..."
              className="w-full bg-[#f7f8fa] border border-gray-200 rounded-full pl-10 pr-4 py-2.5 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#085041]/20 focus:border-[#085041]/30"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-[#f7f8fa] p-1 rounded-full border border-gray-100">
            {['All','Active','Inactive'].map(tab => (
              <button
                key={tab}
                onClick={()=>setStatusFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-[12.5px] font-bold transition-all ${statusFilter===tab? T.tabActive + ' bg-[#085041] rounded-full' : T.tabInactive}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* STUDENTS CARD */}
        <div className={`${T.card} overflow-hidden`}>
          <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <p className={T.sectionLabel}>Student</p>
            <p className={`${T.sectionLabel} hidden sm:block`}>Status</p>
          </div>

          <div className="divide-y divide-gray-100">
            {filtered.length === 0? (
              <div className="px-6 py-16 text-center">
                <p className={T.pageSub}>No students found matching "{search}"</p>
              </div>
            ) : filtered.map(s => (
              <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#f7f8fa]/70 transition-colors group">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#085041] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                    {getInitials(s.name)}
                  </div>
                  <div className="min-w-0">
                    <p className={`${T.cardTitle} truncate group-hover:text-[#085041] transition-colors`}>{s.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`${T.cardMeta} flex items-center gap-1 truncate`}>
                        {Icon.mail('w-3 h-3')} {s.email}
                      </span>
                      <span className="text-gray-300 hidden sm:inline">•</span>
                      <span className={`${T.cardMeta} hidden sm:inline`}>{s.course} • {s.year} Year</span>
                    </div>
                    <p className={`${T.cardMeta} sm:hidden mt-0.5`}>{s.course} • {s.year} Year</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className={`${T.badge} inline-flex items-center px-2.5 py-1 rounded-full border ${s.status === 'Active'? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${s.status==='Active'? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className={`${T.cardMeta} text-center`}>Showing {filtered.length} of {students.length} students</p>
      </div>
    </div>
  )
}