import { useState } from 'react'
import Inventory from './Inventory'
import Assessment from './Assessment'
import { T } from "../../components/ui/tokens"

export default function Submissions() {
  const [tab, setTab] = useState('inventory')

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-5 lg:p-7">
      <div className="max-w-[1100px] mx-auto space-y-5">

        {/* HEADER - same sa Appointments */}
        <div className="flex flex-col gap-1">
          <h1 className={T.pageTitle}>Student Submissions</h1>
          <p className={T.pageSub}>Inventory forms & assessment results.</p>
        </div>

        {/* Main Tabs */}
        <div className="space-y-5">
          <div className={`${T.card} inline-flex p-1.5 rounded-full`}>
            <button
              onClick={()=>setTab('inventory')}
              className={`px-5 py-2 rounded-full text-[12.5px] font-bold transition-all ${tab==='inventory'? T.tabActive + ' bg-[#0B3D2E] rounded-full' : T.tabInactive}`}
            >
              Inventory
            </button>
            <button
              onClick={()=>setTab('assessment')}
              className={`px-5 py-2 rounded-full text-[12.5px] font-bold transition-all ${tab==='assessment'? T.tabActive + ' bg-[#0B3D2E] rounded-full' : T.tabInactive}`}
            >
              Assessment
            </button>
          </div>

          {/* Content */}
          <div>
            {tab === 'inventory'? <Inventory /> : <Assessment />}
          </div>
        </div>
      </div>
    </div>
  )
}