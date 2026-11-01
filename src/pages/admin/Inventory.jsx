import { useState } from 'react'
import { inventorySubmissions } from './data'

export default function Inventory(){
  const [selected, setSelected] = useState(null)

  return (
    <div className="space-y-4">
      {/* Table Card */}
      <div className="bg-white border border-gray-100 rounded-[16px] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 px-5 py-3 bg-[#f8faf9] border-b border-gray-100 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          <div className="col-span-4">Student</div>
          <div className="col-span-3">Form Type</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {inventorySubmissions.map(item=>{
          const name = item.name || item.student || 'Unknown'
          const course = item.course || item.studentId || ''
          const type = item.type || item.formType || 'Inventory Form'
          return (
            <div key={item.id} className="grid grid-cols-12 px-5 py-4 items-center border-b last:border-0 border-gray-50 hover:bg-[#f7f8fa] transition-colors">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#085041] text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">
                  {name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate leading-none">{name}</p>
                  <p className="text-[11px] text-gray-500 mt-1 truncate">{course}</p>
                </div>
              </div>
              <div className="col-span-3 text-[12px] font-medium text-gray-700 truncate">{type}</div>
              <div className="col-span-2 text-[12px] text-gray-500">{item.date}</div>
              <div className="col-span-2">
                <span className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.status==='Reviewed'?'bg-[#E1F5EE] text-[#085041] border-[#B8E6D5]':'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {item.status}
                </span>
              </div>
              <div className="col-span-1 text-right">
                <button onClick={()=>setSelected(item)} className="text-[12px] font-bold text-[#085041] hover:text-black">View →</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-[12px] px-4 py-3 flex gap-2">
        <span className="text-[12px]">🔒</span>
        <p className="text-[11px] leading-snug text-amber-900 font-medium">Inventory submissions contain sensitive personal information and shall be handled in accordance with Data Privacy Act of 2012 (RA 10173).</p>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-[20px] w-full max-w-[440px] p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div><p className="text-[15px] font-extrabold text-gray-900">{selected.name || selected.student}</p><p className="text-[11px] text-gray-500 mt-0.5">{selected.type || selected.formType} • {selected.date}</p></div>
              <button onClick={()=>setSelected(null)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
            </div>
            <div className="mt-5 bg-gray-50 rounded-[12px] p-4 text-[12px] text-gray-700 leading-relaxed">
              {selected.details? (typeof selected.details === 'string'? selected.details : JSON.stringify(selected.details).slice(0,200)+'...') : 'Personal inventory form details will be displayed securely here...'}
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={()=>setSelected(null)} className="flex-1 h-10 rounded-full bg-[#085041] text-white text-[12px] font-bold hover:bg-black transition-colors">Mark as Reviewed</button>
              <button onClick={()=>setSelected(null)} className="px-5 text-[12px] font-bold text-gray-500">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}