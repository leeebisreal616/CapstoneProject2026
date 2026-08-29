import { IconCounseling, IconModules, IconInventory, IconAssessment, IconChevronRight, IconLocation, IconMail, IconClock, IconPhone } from '../components/Icons'

export default function Home({ navigate }) {
  const services = [
    { id: 'counseling', title: 'Counseling & Consultation', desc: 'Book sessions and submit forms online', Icon: IconCounseling },
    { id: 'modules', title: 'Information Service', desc: 'Academic, social-emotional & career modules', Icon: IconModules },
    { id: 'inventory', title: 'Individual Inventory', desc: 'Needs assessment & student profile forms', Icon: IconInventory },
    { id: 'assessment', title: 'Assessment & Screening', desc: 'Personality & well-being profiling exams', Icon: IconAssessment },
  ]

  const announcements = [
    { color: 'bg-red-500', title: 'No Walk-in Sessions on July 18, 2025', desc: 'The GCO office will be closed for an internal seminar. Online appointment booking remains open.', date: 'July 15, 2025' },
    { color: 'bg-yellow-500', title: 'Reminder: Submit Inventory Forms', desc: 'All first-year students are required to complete the Needs Assessment and Student Profile Inventory Form before August 1, 2025.', date: 'July 10, 2025' },
    { color: 'bg-[#1D9E75]', title: 'Mental Health Week: July 21 to 25, 2025', desc: 'The GCO invites all students to join our Mental Health Awareness Week activities. Free counseling sessions available all week.', date: 'July 8, 2025' },
  ]

  const stats = [
    { value: '4', label: 'Core services' },
    { value: '15', label: 'Modules' },
    { value: 'Free', label: 'For all students' },
    { value: '8-5PM', label: 'Mon to Fri' },
  ]

  const contactItems = [
    { Icon: IconLocation, label: 'Location', value: 'Administration Building, Ground Floor\nCvSU Imus Campus, Imus, Cavite' },
    { Icon: IconMail, label: 'Email', value: 'gco.imus@cvsu.edu.ph' },
    { Icon: IconClock, label: 'Office Hours', value: 'Monday – Friday\n8:00 AM – 12:00 PM & 1:00 PM – 5:00 PM' },
    { Icon: IconPhone, label: 'Phone', value: '(046) XXX-XXXX' },
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
                <p className="text-[12px] text-gray-600 leading-relaxed">{a.desc}</p>
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
        <p className="text-[13px] text-gray-600 mb-4">Four core service areas to support every CvSU Imus student.</p>
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
          {services.map(s => (
            <button key={s.id} onClick={() => navigate(s.id)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 text-left transition-transform">
              <div className="w-[42px] h-[42px] rounded-xl bg-[#E1F5EE] flex items-center justify-center flex-shrink-0 text-[#085041]">
                <s.Icon className="w-[21px] h-[21px]"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-gray-900 mb-0.5">{s.title}</p>
                <p className="text-[12px] text-gray-600">{s.desc}</p>
              </div>
              <IconChevronRight stroke="#ccc"/>
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
              <p className="text-[12px] text-gray-600 mt-0.5">{s.label}</p>
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
          {contactItems.map((c, i) => (
            <div key={i} className="flex gap-3 mb-3 last:mb-0">
              <c.Icon stroke="#9FE1CB" className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"/>
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
        <p className="text-white font-semibold text-[13px] mb-1">Guidance & Counseling Office, CvSU Imus Campus</p>
        <p>Cavite State University. Imus Campus. Imus, Cavite.</p>
        <p className="mb-2">All services are free and confidential for enrolled students.</p>
        <p className="text-[11px]" style={{color:'rgba(255,255,255,0.55)'}}>
          This portal collects and processes personal data in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173). Your information is kept confidential and used solely for guidance and counseling purposes.
        </p>
      </div>
    </div>
  )
}