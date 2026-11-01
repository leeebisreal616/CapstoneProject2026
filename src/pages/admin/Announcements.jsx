import { useState } from 'react'

const initialAnns = [
  { id: 1, title: 'Mental Health Week', date: '2026-10-12', content: 'Join us for wellness activities and workshops all week.', status: 'Published' },
  { id: 2, title: 'Counseling Schedule Update', date: '2026-10-10', content: 'New hours for guidance office: Mon-Fri 8AM-5PM.', status: 'Draft' },
]

export default function Announcements() {
  const [anns, setAnns] = useState(initialAnns)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', status: 'Published' })

  const handleAdd = () => {
    if (!form.title.trim()) return // FIX: wag mag post pag empty
    setAnns([{ id: Date.now(), date: new Date().toISOString().split('T')[0],...form },...anns])
    setForm({ title: '', content: '', status: 'Published' })
    setShowAdd(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="font-extrabold text-[16px] text-gray-900">Announcements</h2>
        <button onClick={()=>setShowAdd(true)} className="h-9 px-4 rounded-full bg-[#0B3D2E] text-white text-[12px] font-bold hover:bg-black transition-colors">+ New Post</button>
      </div>

      <div className="grid gap-3">
        {anns.map(a => (
          <div key={a.id} className="bg-white border border-gray-100 rounded-[16px] px-6 py-5 flex justify-between items-start hover:shadow-sm transition-shadow">
            <div className="pr-4">
              <h3 className="font-bold text-[14px] text-gray-900 leading-tight">{a.title}</h3>
              <p className="text-[11px] text-gray-400 mt-1">{a.date}</p>
              <p className="text-[13px] mt-2 text-gray-600 leading-snug">{a.content}</p>
            </div>
            <span className={`shrink-0 ml-3 text-[10px] font-bold px-3 py-1.5 rounded-full border ${a.status === 'Published'? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{a.status.toUpperCase()}</span>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={()=>setShowAdd(false)}>
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[440px] space-y-5 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <h3 className="font-extrabold text-[16px]">New Announcement</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Title</label>
                <input value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="e.g. Mental Health Week" className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-4 text-[13px] focus:outline-none focus:border-[#0B3D2E] focus:ring-1 focus:ring-[#0B3D2E]" />
              </div>
              <div>
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Content</label>
                <textarea value={form.content} onChange={e=>setForm({...form, content: e.target.value})} placeholder="Write announcement..." className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-[13px] h-28 resize-none focus:outline-none focus:border-[#0B3D2E]" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleAdd} className="flex-1 h-11 rounded-full bg-[#0B3D2E] text-white text-[13px] font-bold hover:bg-black">Post</button>
              <button onClick={()=>setShowAdd(false)} className="px-6 text-[13px] font-bold text-gray-500">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}