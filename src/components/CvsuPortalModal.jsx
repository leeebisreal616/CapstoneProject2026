export default function CvsuPortalModal({ open, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[20px] w-full max-w-[380px] overflow-hidden shadow-2xl">
        <div className="bg-[#085041] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#085041] font-bold text-[12px]">CvSU</div>
            <div>
              <p className="text-white font-bold text-[13px] leading-none">Cavite State University</p>
              <p className="text-[#A7F3D0] text-[10px] mt-1">Imus Campus • Student Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center">✕</button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[11px] font-bold text-green-700">CONNECTED • Live Data</p>
            <span className="ml-auto text-[10px] bg-[#E1F5EE] text-[#085041] px-2 py-0.5 rounded-full">API: /api/student/202311325</span>
          </div>
          <div className="bg-[#f4f9f7] rounded-2xl p-4 border border-gray-100">
            <p className="text-[11px] text-gray-400 font-semibold mb-3">STUDENT RECORD FETCHED</p>
            <div className="space-y-2.5 text-[12px]">
              <div className="flex justify-between"><span className="text-gray-500">Full Name</span><span className="font-bold">Aaron Valencia</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Student No.</span><span className="font-bold">202311325</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Course</span><span className="font-bold">BSIT 4th Year</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-bold text-green-700">Enrolled • Regular</span></div>
            </div>
          </div>
          <div className="mt-4 bg-[#FFFBEA] border border-[#FDE68A] rounded-xl p-3">
            <p className="text-[11px] font-bold text-[#92400E]">Integration Logic</p>
            <p className="text-[11px] text-[#78350F] mt-1">GCO Portal auto-fills via CvSU Portal API. No manual typing → less errors.</p>
          </div>
          <button onClick={onClose} className="w-full mt-4 bg-[#085041] text-white text-[13px] font-bold py-3 rounded-full">Continue to Booking</button>
        </div>
      </div>
    </div>
  )
}