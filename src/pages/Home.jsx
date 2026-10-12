import { IconCounseling, IconModules, IconAssessment, IconChevronRight } from '../components/Icons'

export default function Home({ navigate }) {
  return (
    <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)] flex flex-col">
      {/* Top */}
      <div className="bg-[#085041] text-white px-6 md:px-10 py-7 flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <h1 className="text-[32px] md:text-[38px] font-bold leading-[1.05]">Your well-being is<br/>our priority</h1>
          <p className="text-[13px] text-white/60 mt-3 max-w-[380px]">Guidance and counseling portal for CvSU Imus students. Free, confidential, Mon to Fri.</p>
          <div className="flex gap-2 mt-5">
            <button onClick={() => navigate('assessment')} className="bg-white text-[#085041] text-[13px] font-bold px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-[0_4px_16px_rgba(255,255,255,0.25)] hover:-translate-y-[1px] active:scale-[0.98]">Take Assessment</button>
            <button onClick={() => navigate('counseling')} className="bg-white/10 border border-white/20 text-white text-[13px] font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-white/15 hover:border-white/30 hover:-translate-y-[1px] active:scale-[0.98]">Book Now</button>
          </div>
        </div>
        {/* Right card */}
        <div className="w-full md:w-[360px] bg-[#0a5a49] border border-white/10 rounded-2xl p-4 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:border-white/20">
          <p className="text-[10px] font-bold tracking-widest text-white/40 mb-3">GUIDANCE & COUNSELING OFFICE</p>
          <div className="space-y-2 text-[12px]">
            <div className="flex gap-3"><span className="text-white/40 w-[50px]">Location</span><span className="text-white">Admin Bldg, Ground Floor</span></div>
            <div className="flex gap-3"><span className="text-white/40 w-[50px]">Hours</span><span className="text-white">8AM-12PM, 1PM-5PM</span></div>
            <div className="flex gap-3"><span className="text-white/40 w-[50px]">Email</span><span className="text-white text-[11px]">cvsuimus.guidance@cvsu.edu.ph</span></div>
            <div className="flex gap-3"><span className="text-white/40 w-[50px]">Facebook</span><a href="https://www.facebook.com/GCOCvSUImus" target="_blank" className="text-white underline decoration-white/20 hover:decoration-white transition-all">GCOCvSUImus</a></div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-[10px] font-bold text-amber-200/70 tracking-wider mb-1.5">NCMH CRISIS HOTLINE</p>
            <div className="flex gap-2">
              <span className="bg-white text-[#085041] text-[11px] font-bold px-2 py-1 rounded transition-all hover:shadow-[0_2px_8px_rgba(255,255,255,0.2)]">1553</span>
              <span className="text-[11px] text-white/80 py-1">1800-1888-1553</span>
            </div>
            <p className="text-[10px] text-white/50 mt-1.5">09190571553 (Smart) • 09178998727 (Globe/TM)</p>
          </div>
        </div>
      </div>

      {/* Bottom 3 cards - SAME HOVER AS ASSESSMENT */}
      <div className="flex-1 px-4 md:px-10 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id:'counseling', title:'Counseling', desc:'Book a one-on-one session. Confidential and free.', Icon: IconCounseling, cta:'Book a session' },
          { id:'assessment', title:'Initial Assessment', desc:'Required first step before booking. 5-10 mins only.', Icon: IconAssessment, cta:'Start assessment' },
          { id:'modules', title:'Wellness Modules', desc:'Self-paced resources for academic and emotional well-being.', Icon: IconModules, cta:'Browse modules' },
        ].map(item => (
          <button key={item.id} onClick={() => navigate(item.id)} className="bg-white rounded-2xl border border-gray-200 p-6 text-left group cursor-pointer flex flex-col transition-all duration-200 hover:shadow-[0_8px_24px_rgba(8,80,65,0.12)] hover:border-[#085041]/20 hover:-translate-y-[2px] active:scale-[0.99]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] flex items-center justify-center text-[#085041] mb-4 transition-all duration-200 group-hover:bg-[#085041] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(8,80,65,0.2)]">
              <item.Icon className="w-5 h-5"/>
            </div>
            <p className="text-[15px] font-bold text-gray-900">{item.title}</p>
            <p className="text-[13px] text-gray-500 mt-1 flex-1 leading-relaxed">{item.desc}</p>
            <p className="text-[12px] font-semibold text-[#085041] mt-4 flex items-center gap-1 transition-all duration-200 group-hover:gap-2">
              {item.cta} <span className="transition-transform duration-200 group-hover:translate-x-1"><IconChevronRight stroke="#085041" /></span>
            </p>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-gray-100 bg-white">
        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          CvSU Imus Campus • Est. 2004<br className="md:hidden" />
          <span className="hidden md:inline"> • </span>
          Free and confidential for all enrolled students
        </p>
        <div className="h-2 md:h-0" />
      </div>
    </div>
  )
}