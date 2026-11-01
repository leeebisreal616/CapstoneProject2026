import { initialAppointments, inventorySubmissions, examResults } from './data'
import { T } from "../../components/ui/tokens"

export default function Overview({ setView }) {
  const pendingAppts = initialAppointments.filter(a => a.status === 'Pending').length
  const pendingForms = inventorySubmissions.filter(i => i.status === 'Pending Review').length
  const urgent = examResults.filter(e => e.flag === 'urgent').length

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-5 lg:p-7">
      <div className="max-w-[1100px] mx-auto space-y-5">

        {/* HEADER */}
        <div className="flex flex-col gap-1">
          <h1 className={T.pageTitle}>Overview</h1>
          <p className={T.pageSub}>Welcome back, here is what is happening today.</p>
        </div>

        {/* Stats - gamit T.card + T.sectionLabel + T.count + T.badge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={()=>setView('appointments')} className={`text-left ${T.card} p-5 hover:border-[#085041]/30 transition-all`}>
            <p className={T.sectionLabel}>Pending Appointments</p>
            <div className="flex items-end justify-between mt-3">
              <span className={T.count}>{pendingAppts}</span>
              <span className={`${T.badge} text-[#085041] bg-[#E1F5EE] px-3 py-1 rounded-full`}>View →</span>
            </div>
          </button>

          <button onClick={()=>setView('submissions')} className={`text-left ${T.card} p-5 hover:border-amber-200 transition-all`}>
            <p className={T.sectionLabel}>Pending Forms</p>
            <div className="flex items-end justify-between mt-3">
              <span className={T.count}>{pendingForms}</span>
              <span className={`${T.badge} text-amber-700 bg-amber-50 px-3 py-1 rounded-full`}>Review →</span>
            </div>
          </button>

          <button onClick={()=>setView('submissions')} className={`text-left ${T.card} p-5 hover:border-red-200 transition-all border-l-[3px] border-l-red-500`}>
            <p className={`${T.sectionLabel} text-red-500`}>Urgent Flags</p>
            <div className="flex items-end justify-between mt-3">
              <span className={T.count}>{urgent}</span>
              <span className={`${T.badge} ${urgent>0? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'} px-3 py-1 rounded-full`}>{urgent > 0? 'Action needed' : 'Clear'}</span>
            </div>
          </button>
        </div>

        {/* Recent - single table */}
        <div className={T.card + " overflow-hidden"}>
          <div className="p-4 px-5 flex justify-between items-center border-b border-gray-50">
            <h3 className={T.cardTitle}>Recent Appointments</h3>
            <button onClick={()=>setView('appointments')} className={`${T.cardMeta} font-semibold hover:text-[#085041]`}>View all appointments</button>
          </div>
          <div className="divide-y divide-gray-50">
            {initialAppointments.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 px-5 hover:bg-gray-50/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] font-bold">
                    {a.student?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p className={`${T.cardTitle} leading-none`}>{a.student}</p>
                    <p className={`${T.cardMeta} mt-1`}>{a.course} • {a.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`${T.cardMeta} hidden md:block`}>{a.date}</p>
                  <span className={`${T.badge} px-2.5 py-1 rounded-full border ${a.status==='Pending'?'bg-amber-50 text-amber-700 border-amber-100':'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}