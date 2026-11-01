import { useState } from 'react'
import Modules from './Modules'
import Announcements from './Announcements'
import { T } from "../../components/ui/tokens"

export default function Content() {
  const [tab, setTab] = useState('modules')

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-5 lg:p-7">
      <div className="max-w-[1100px] mx-auto space-y-5">

        {/* HEADER - consistent sa lahat */}
        <div className="flex flex-col gap-1">
          <h1 className={T.pageTitle}>Content Management</h1>
          <p className={T.pageSub}>Modules & announcements shown to students.</p>
        </div>

        {/* Tabs */}
        <div className={`${T.card} inline-flex p-1.5 rounded-full`}>
          <button
            onClick={()=>setTab('modules')}
            className={`px-5 py-2 rounded-full text-[12.5px] font-bold transition-all ${tab==='modules'? T.tabActive + ' bg-[#0B3D2E] rounded-full' : T.tabInactive}`}
          >
            Modules
          </button>
          <button
            onClick={()=>setTab('announcements')}
            className={`px-5 py-2 rounded-full text-[12.5px] font-bold transition-all ${tab==='announcements'? T.tabActive + ' bg-[#0B3D2E] rounded-full' : T.tabInactive}`}
          >
            Announcements
          </button>
        </div>

        <div>
          {tab === 'modules'? <Modules /> : <Announcements />}
        </div>
      </div>
    </div>
  )
}