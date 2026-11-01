import { useState } from 'react'

const initialModules = [
  { id: 1, title: 'Understanding Anxiety', category: 'Mental Health', status: 'Published', views: 120 },
  { id: 2, title: 'Stress Management 101', category: 'Wellness', status: 'Draft', views: 0 },
]

export default function Modules() {
  const [modules, setModules] = useState(initialModules)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'Mental Health', status: 'Draft' })

  const handleAdd = () => {
    if (!form.title.trim()) return // FIX: wag mag add pag empty
    setModules([{ id: Date.now(),...form, views: 0 },...modules])
    setForm({ title: '', category: 'Mental Health', status: 'Draft' })
    setShowAdd(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="font-extrabold text-[16px] text-gray-900">Wellness Modules</h2>
        <button onClick={()=>setShowAdd(true)} className="h-9 px-4 rounded-full bg-[#0B3D2E] text-white text-[12px] font-bold hover:bg-black transition-colors">+ Add Module</button>
      </div>

      <div className="bg-white rounded-[20px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 px-6 py-4 bg-gray-50/70 border-b text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          <div className="col-span-5">Title</div>
          <div className="col-span-3">Category</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Views</div>
        </div>
        {modules.map(m => (
          <div key={m.id} className="grid grid-cols-12 px-6 py-5 items-center border-b last:border-0 border-gray-50 hover:bg-gray-50/60 transition-colors">
            <div className="col-span-5 pr-4"><p className="text-[14px] font-bold text-gray-900 leading-tight">{m.title}</p></div>
            <div className="col-span-3 text-[13px] text-gray-600">{m.category}</div>
            <div className="col-span-2"><span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${m.status === 'Published'? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{m.status.toUpperCase()}</span></div>
            <div className="col-span-2 text-right text-[13px] font-semibold text-gray-700">{m.views}</div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={()=>setShowAdd(false)}>
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[420px] space-y-5 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <h3 className="font-extrabold text-[16px]">Add Module</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Title</label>
                <input value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="e.g. Understanding Anxiety" className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-4 text-[13px] focus:outline-none focus:border-[#0B3D2E] focus:ring-1 focus:ring-[#0B3D2E]" />
              </div>
              <div>
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Category</label>
                <select value={form.category} onChange={e=>setForm({...form, category: e.target.value})} className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-4 text-[13px] focus:outline-none focus:border-[#0B3D2E]">
                  <option>Mental Health</option><option>Wellness</option><option>Self-Care</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleAdd} className="flex-1 h-11 rounded-full bg-[#0B3D2E] text-white text-[13px] font-bold hover:bg-black">Save</button>
              <button onClick={()=>setShowAdd(false)} className="px-6 text-[13px] font-bold text-gray-500">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}