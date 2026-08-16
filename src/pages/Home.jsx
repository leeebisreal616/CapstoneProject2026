export default function Home({ navigate }) {
  const services = [
    { id: 'counseling', title: 'Counseling & Consultation', desc: 'Book sessions and submit forms online', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[21px] h-[21px]"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: 'modules', title: 'Information Service', desc: 'Academic, social-emotional & career modules', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[21px] h-[21px]"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: 'inventory', title: 'Individual Inventory', desc: 'Needs assessment & student profile forms', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[21px] h-[21px]"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: 'assessment', title: 'Assessment & Screening', desc: 'Personality & well-being profiling exams', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[21px] h-[21px]"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  ]

  const announcements = [
    { color: 'bg-red-500', title: 'No Walk-in Sessions — July 18, 2025', desc: 'The GCO office will be closed for an internal seminar. Online appointment booking remains open.', date: 'July 15, 2025' },
    { color: 'bg-yellow-500', title: 'Reminder: Submit Inventory Forms', desc: 'All first-year students are required to complete the Needs Assessment and Student Profile Inventory Form before August 1, 2025.', date: 'July 10, 2025' },
    { color: 'bg-[#1D9E75]', title: 'Mental Health Week — July 21–25, 2025', desc: 'The GCO invites all students to join our Mental Health Awareness Week activities. Free counseling sessions available all week.', date: 'July 8, 2025' },
  ]

  const stats = [
    { value: '4', label: 'Core services' },
    { value: '15', label: 'Modules' },
    { value: 'Free', label: 'For all students' },
    { value: '8–5PM', label: 'Mon – Fri' },
  ]

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#085041] to-[#0d7a5f] px-5 pt-7 pb-9 text-white">
        <div className="inline-flex items-center gap-1.5 bg-white bg-opacity-10 border border-white border-opacity-20 text-[11px] px-3 py-1 rounded-full mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/>
          Portal is live
        </div>
        <h1 className="text-[23px] font-bold leading-tight tracking-tight mb-2">Your Well-Being is Our Priority</h1>
        <p className="text-[14px] leading-relaxed mb-5" style={{opacity:0.82}}>Access counseling, wellness resources, and assessments — all in one place for CvSU Imus students.</p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => navigate('counseling')} className="bg-white text-[#085041] text-[14px] font-bold px-5 py-3 rounded-full">Book Appointment</button>
          <button onClick={() => navigate('modules')} className="bg-transparent text-white border border-white border-opacity-50 text-[14px] font-semibold px-5 py-3 rounded-full">Browse Modules</button>
        </div>
      </div>

      {/* Announcements */}
      <div className="px-4 py-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#1D9E75] mb-1">Notice Board</p>
        <p className="text-[20px] font-bold text-gray-900 mb-4">Announcements</p>
        <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
          {announcements.map((a, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${a.color}`}/>
              <div>
                <p className="text-[13px] font-semibold text-gray-900 mb-1">{a.title}</p>
                <p className="text-[12px] text-gray-500 leading-relaxed">{a.desc}</p>
                <p className="text-[11px] text-[#0F6E56] font-medium mt-1">{a.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="px-4 pb-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#1D9E75] mb-1">Our Services</p>
        <p className="text-[20px] font-bold text-gray-900 mb-1">What We Offer</p>
        <p className="text-[13px] text-gray-500 mb-4">Four core service areas to support every CvSU Imus student.</p>
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
          {services.map(s => (
            <button key={s.id} onClick={() => navigate(s.id)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 text-left transition-transform">
              <div className="w-[42px] h-[42px] rounded-xl bg-[#E1F5EE] flex items-center justify-center flex-shrink-0 text-[#085041]">
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-gray-900 mb-0.5">{s.title}</p>
                <p className="text-[12px] text-gray-500">{s.desc}</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth={2.5} className="w-4 h-4 flex-shrink-0"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#1D9E75] mb-1">At a Glance</p>
        <p className="text-[20px] font-bold text-gray-900 mb-4">Office Info</p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 mb-3">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-[22px] font-bold text-[#085041]">{s.value}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-2xl p-4">
          <p className="text-[13px] text-[#085041] leading-relaxed">
            📍 <strong>GCO Office</strong> — Administration Building, CvSU Imus Campus<br/>
            <span className="text-[12px]" style={{opacity:0.75}}>gco.imus@cvsu.edu.ph</span>
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="px-4 pb-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#1D9E75] mb-1">Get in Touch</p>
        <p className="text-[20px] font-bold text-gray-900 mb-4">Contact Us</p>
        <div className="bg-[#085041] rounded-2xl p-5 text-white">
          <p className="text-[15px] font-semibold mb-4">Guidance &amp; Counseling Office</p>
          {[
            { icon: <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>, label: 'Location', value: 'Administration Building, Ground Floor\nCvSU Imus Campus, Imus, Cavite' },
            { icon: <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>, label: 'Email', value: 'gco.imus@cvsu.edu.ph' },
            { icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>, label: 'Office Hours', value: 'Monday – Friday\n8:00 AM – 12:00 PM & 1:00 PM – 5:00 PM' },
            { icon: <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>, label: 'Phone', value: '(046) XXX-XXXX' },
          ].map((c, i) => (
            <div key={i} className="flex gap-3 mb-3 last:mb-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9FE1CB" strokeWidth={1.8} className="w-[18px] h-[18px] flex-shrink-0 mt-0.5">{c.icon}</svg>
              <div>
                <p className="text-white font-semibold text-[13px]">{c.label}</p>
                <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{color:'rgba(255,255,255,0.75)'}}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#085041] text-center py-5 px-4 text-[12px] leading-relaxed" style={{color:'rgba(255,255,255,0.7)'}}>
        <p className="text-white font-semibold text-[13px] mb-1">Guidance &amp; Counseling Office — CvSU Imus Campus</p>
        <p>Cavite State University · Imus Campus · Imus, Cavite</p>
        <p>All services are free and confidential for enrolled students.</p>
      </div>
    </div>
  )
}