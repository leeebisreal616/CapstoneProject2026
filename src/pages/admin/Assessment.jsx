import { useState } from 'react'

const data = [
  { id:1, student:'Althea Santos', course:'BS Psychology', date:'2026-10-10', score:78, flag:'urgent', remarks:'High anxiety indicators, needs follow-up', ans:['Often','Sometimes'] },
  { id:2, student:'Juan Dela Cruz', course:'BS IT', date:'2026-10-11', score:45, flag:'attention', remarks:'Moderate stress level', ans:['Rarely','Often'] },
  { id:3, student:'Maria Reyes', course:'BS Nursing', date:'2026-10-09', score:20, flag:'normal', remarks:'No significant concerns', ans:['Never','Rarely'] },
]

export default function Assessment(){
  const [filter,setFilter]=useState('All')
  const [selected,setSelected]=useState(null)

  const filtered = filter==='All'? data : data.filter(d=>d.flag===filter.toLowerCase())

  return (
    <div className="space-y-6">
      {/* Sub filter - may gap sa main tabs, hindi dikit */}
      <div className="inline-flex bg-[#f1f3f2] rounded-full p-1">
        {['All','Urgent','Attention'].map(f=>(
          <button
            key={f}
            onClick={()=>setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${filter===f?'bg-gray-900 text-white shadow-sm':'text-gray-500 hover:text-gray-900'}`}
          >
            {f} {f!=='All'? `(${data.filter(d=>d.flag===f.toLowerCase()).length})`:''}
          </button>
        ))}
      </div>

      {/* Table - may sariling breathing room */}
      <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 px-6 py-4 bg-gray-50/60 border-b border-gray-100 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          <div className="col-span-5">Student</div>
          <div className="col-span-2">Score</div>
          <div className="col-span-3">Flag</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {filtered.map(r=>(
          <div key={r.id} className="grid grid-cols-12 px-6 py-5 items-center border-b last:border-0 border-gray-50 hover:bg-gray-50/70 transition-colors">
            <div className="col-span-5 pr-4">
              <p className="text-[14px] font-bold text-gray-900 leading-tight">{r.student}</p>
              <p className="text-[12px] text-gray-500 mt-1">{r.course} • {r.date}</p>
            </div>
            <div className="col-span-2">
              <span className="text-[13px] font-extrabold bg-gray-900 text-white w-8 h-8 rounded-full inline-flex items-center justify-center">{r.score}</span>
            </div>
            <div className="col-span-3">
              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${r.flag==='urgent'?'bg-red-50 text-red-700 border-red-200': r.flag==='attention'?'bg-amber-50 text-amber-700 border-amber-200':'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                {r.flag.toUpperCase()}
              </span>
            </div>
            <div className="col-span-2 text-right">
              <button onClick={()=>setSelected(r)} className="text-[12px] font-bold text-[#085041] hover:underline">View</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-[20px] w-full max-w-[420px] p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <p className="text-[15px] font-extrabold">{selected.student}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{selected.course} • {selected.date}</p>
            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-[12px] space-y-1">
              <p><b>Score:</b> {selected.score}</p>
              <p><b>Remarks:</b> {selected.remarks}</p>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={()=>setSelected(null)} className="flex-1 h-10 rounded-full bg-[#0B3D2E] text-white text-[12px] font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}