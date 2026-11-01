import { useState } from 'react'
import { T } from "../../components/ui/tokens"

const initial = [
  { id:1, name:'Althea Santos', initials:'AS', course:'BS Psychology - 3rd', date:'2026-10-13 at 10:00 AM', type:'Academic', status:'Pending' },
  { id:2, name:'Juan Dela Cruz', initials:'JD', course:'BS IT - 2nd', date:'2026-10-14 at 2:00 PM', type:'Personal', status:'Approved' },
  { id:3, name:'Maria Reyes', initials:'MR', course:'BS Nursing - 4th', date:'2026-10-13 at 9:00 AM', type:'Career', status:'Pending' },
]

export default function Appointments(){
  const [filter,setFilter]=useState('All')
  const [list,setList]=useState(initial)
  const filtered = filter==='All'? list : list.filter(a=>a.status===filter)
  const pendingCount = list.filter(a=>a.status==='Pending').length

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-5 lg:p-7">
      <div className="max-w-[1100px] mx-auto space-y-5">

        {/* HEADER - gamit T */}
        <div className="flex flex-col gap-1">
          <h1 className={T.pageTitle}>Appointments</h1>
          <p className={T.pageSub}>Manage counseling requests • {pendingCount} pending</p>
        </div>

        {/* Filter tabs - gamit T.card */}
        <div className={`${T.card} inline-flex p-1.5 rounded-full`}>
          {['All','Pending','Approved','Completed'].map(f=>{
            const count = f==='Pending'? pendingCount : f==='All'? filtered.length : list.filter(x=>x.status===f).length
            return (
              <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-2 rounded-full text-[12.5px] font-bold transition-all ${filter===f? T.tabActive + ' rounded-full' : T.tabInactive}`}>
                {f} {f!=='All' && `(${f==='Pending'? pendingCount : list.filter(x=>x.status===f).length})`}
              </button>
            )
          })}
        </div>

        <p className={T.sectionLabel}>{filtered.length} Appointments</p>

        <div className="grid gap-3">
          {filtered.map(a=>(
            <div key={a.id} className={`${T.card} px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#0B3D2E] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">{a.initials}</div>
                <div className="min-w-0">
                  <p className={`${T.cardTitle} leading-tight`}>{a.name}</p>
                  <p className={`${T.cardMeta} mt-0.5 flex items-center gap-2 flex-wrap`}>
                    <span>{a.course}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{a.date}</span>
                    <span className={`${T.badge} ml-1 px-2 py-0.5 rounded-full bg-gray-100 border text-gray-600`}>{a.type}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <span className={`${T.badge} px-2.5 py-1 rounded-full border ${a.status==='Pending'?'bg-amber-50 text-amber-700 border-amber-200': a.status==='Approved'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-gray-100 text-gray-600 border-gray-200'}`}>{a.status.toUpperCase()}</span>
                {a.status==='Pending'? (
                  <>
                    <button onClick={()=>setList(list.map(x=>x.id===a.id?{...x,status:'Approved'}:x))} className="h-7 px-3 rounded-full bg-gray-900 text-white text-[11px] font-bold hover:bg-black">Approve</button>
                    <button onClick={()=>setList(list.filter(x=>x.id!==a.id))} className="h-7 px-3 text-[11px] font-bold text-gray-500 hover:text-gray-900">Decline</button>
                  </>
                ) : a.status==='Approved'? (
                  <button onClick={()=>setList(list.map(x=>x.id===a.id?{...x,status:'Completed'}:x))} className="h-7 px-3 text-[11px] font-bold text-gray-500 hover:text-gray-900">Mark Done</button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}