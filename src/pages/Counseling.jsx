import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { sanitizeFormData } from '../utils/sanitize'

const inputCls = (error) =>
  `w-full border-[1.5px] ${error ? 'border-red-400 bg-red-50' : 'border-[#d1e5de]'} rounded-xl px-3.5 py-3 text-[16px] text-gray-900 bg-white outline-none focus:border-[#1D9E75] transition-all font-sans appearance-none`

const selectStyle = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '38px'
}

function Field({ label, required, error, children }) {
  return (
    <div className="mb-3.5">
      <label className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        {required && <span className="text-red-500 text-[13px]">*</span>}{label}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-[12px] mt-1 flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error.message}
        </p>
      )}
    </div>
  )
}

function SectionTitle({ title }) {
  return <p className="text-[12px] font-bold text-[#0F6E56] uppercase tracking-wider mt-5 mb-3 pb-2 border-b border-[#9FE1CB]">{title}</p>
}

function CheckboxGroup({ name, options, register, rules, error, cols = 2 }) {
  return (
    <>
      <div className={`grid gap-2 mt-1`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {options.map(o => (
          <label key={o} className="flex items-center gap-2 bg-[#f8fdf9] border-[1.5px] border-[#d1e5de] rounded-xl px-3 py-2.5 cursor-pointer">
            <input type="checkbox" value={o} className="w-4 h-4 accent-[#085041] flex-shrink-0" {...register(name, rules)}/>
            <span className="text-[13px] text-gray-800 leading-tight">{o}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-[12px] mt-1">{error.message}</p>}
    </>
  )
}

function RadioGroup({ name, options, register, rules, error, inline = true }) {
  return (
    <>
      <div className={`flex gap-2 mt-1 flex-wrap`}>
        {options.map(o => (
          <label key={o} className="flex items-center gap-2 bg-[#f8fdf9] border-[1.5px] border-[#d1e5de] rounded-xl px-3 py-2.5 cursor-pointer">
            <input type="radio" value={o} className="w-4 h-4 accent-[#085041] flex-shrink-0" {...register(name, rules)}/>
            <span className="text-[13px] text-gray-800">{o}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-[12px] mt-1">{error.message}</p>}
    </>
  )
}

export default function Counseling({ showToast }) {
  const [submitted, setSubmitted] = useState(false)
  const [searchParams] = useSearchParams()
  const isRoutine = searchParams.get('type') === 'routine'
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: isRoutine ? { reason: ['Routine Check-in'] } : {}
  })

  const onSubmit = async (data) => {
    await new Promise(r => setTimeout(r, 800))
    const cleanData = sanitizeFormData(data)
    // TODO: Replace with real API call once backend is connected
    // await fetch('/api/counseling-requests', { method: 'POST', body: JSON.stringify(cleanData) })
    reset()
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="w-[72px] h-[72px] rounded-full bg-[#E1F5EE] flex items-center justify-center mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="#085041" strokeWidth={2} className="w-[34px] h-[34px]">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="text-[20px] font-bold text-gray-900 mb-2">Request Submitted!</h3>
      <p className="text-[14px] text-gray-500 leading-relaxed mb-2">Your counseling request has been received.</p>
      <p className="text-[13px] text-gray-400 leading-relaxed mb-6">The GCO will confirm your appointment via your CvSU email. Please note that cancellation must be made the day prior to your appointment date.</p>
      <button onClick={() => setSubmitted(false)} className="bg-[#085041] text-white text-[16px] font-semibold px-6 py-3.5 rounded-full w-full max-w-sm">Back to Counseling</button>
    </div>
  )

  const today = new Date().toISOString().split('T')[0]
  const forms = ['Counseling Request Form', 'Informed Consent Form', 'Individual Interview Form']

  return (
    <div>
      <div className="bg-[#E1F5EE] border-b border-[#9FE1CB] px-4 py-5">
        <h2 className="text-[20px] font-bold text-[#085041]">Counseling & Consultation</h2>
        <p className="text-[13px] text-[#0F6E56] mt-1">Fill out the official counseling request form or download forms below.</p>
      </div>

      {isRoutine && (
        <div className="px-4 pt-4 max-w-6xl mx-auto">
          <div className="bg-[#085041] rounded-xl px-4 py-3 flex items-center gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9FE1CB" strokeWidth={1.8} className="w-5 h-5 flex-shrink-0">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-[13px] text-white">You're booking a <strong>Routine Interview</strong> — this is a scheduled periodic check-in, not a general concern request.</p>
          </div>
        </div>
      )}

      <div className="px-4 py-5 md:grid md:grid-cols-2 md:gap-6 md:max-w-6xl md:mx-auto">
        {/* MAIN FORM */}
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <p className="text-[15px] font-semibold text-gray-900 mb-1 pb-3 border-b border-gray-100">📋 Counseling Request Form</p>
            <p className="text-[12px] text-gray-400 mb-4">OSAS-QF-06 · CvSU Imus Campus</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <SectionTitle title="Personal Information"/>

              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" required error={errors.firstName}>
                  <input type="text" placeholder="Juan" autoComplete="given-name" className={inputCls(errors.firstName)}
                    {...register('firstName', { required: 'Required' })}/>
                </Field>
                <Field label="Middle Initial" error={errors.middleInitial}>
                  <input type="text" placeholder="D." maxLength={3} className={inputCls(errors.middleInitial)}
                    {...register('middleInitial')}/>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Last Name" required error={errors.lastName}>
                  <input type="text" placeholder="Dela Cruz" autoComplete="family-name" className={inputCls(errors.lastName)}
                    {...register('lastName', { required: 'Required' })}/>
                </Field>
                <Field label="Extension" error={errors.extension}>
                  <input type="text" placeholder="Jr., Sr., III" className={inputCls(errors.extension)}
                    {...register('extension')}/>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Student No." required error={errors.studentNo}>
                  <input type="text" placeholder="2021-00123" inputMode="numeric" className={inputCls(errors.studentNo)}
                    {...register('studentNo', { required: 'Required' })}/>
                </Field>
                <Field label="Contact No." required error={errors.contactNo}>
                  <input type="tel" placeholder="09XXXXXXXXX" inputMode="numeric" className={inputCls(errors.contactNo)}
                    {...register('contactNo', { required: 'Required', pattern: { value: /^09\d{9}$/, message: 'Format: 09XXXXXXXXX' } })}/>
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Age" required error={errors.age}>
                  <input type="number" placeholder="19" inputMode="numeric" min="16" max="60" className={inputCls(errors.age)}
                    {...register('age', { required: 'Required', min: { value: 16, message: 'Min 16' } })}/>
                </Field>
                <Field label="Civil Status" required error={errors.civilStatus}>
                  <select className={inputCls(errors.civilStatus)} style={selectStyle}
                    {...register('civilStatus', { required: 'Required' })}>
                    <option value="">—</option>
                    <option>Single</option><option>Married</option><option>Widowed</option><option>Separated</option>
                  </select>
                </Field>
                <Field label="Sex at Birth" required error={errors.sex}>
                  <select className={inputCls(errors.sex)} style={selectStyle}
                    {...register('sex', { required: 'Required' })}>
                    <option value="">—</option>
                    <option>Female</option><option>Male</option>
                  </select>
                </Field>
              </div>

              <Field label="Birthdate" required error={errors.birthdate}>
                <input type="date" className={inputCls(errors.birthdate)}
                  {...register('birthdate', { required: 'Birthdate is required' })}/>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Course / Department" required error={errors.course}>
                  <input type="text" placeholder="e.g. BSIT" className={inputCls(errors.course)}
                    {...register('course', { required: 'Required' })}/>
                </Field>
                <Field label="Year Level" required error={errors.yearLevel}>
                  <select className={inputCls(errors.yearLevel)} style={selectStyle}
                    {...register('yearLevel', { required: 'Required' })}>
                    <option value="">—</option>
                    <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>5th Year</option>
                  </select>
                </Field>
              </div>

              <Field label="Email Address" required error={errors.email}>
                <input type="email" placeholder="student@cvsu.edu.ph" autoComplete="email" className={inputCls(errors.email)}
                  {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' } })}/>
              </Field>

              <SectionTitle title="Reason for Seeking Counseling"/>
              <Field label="Select all that apply" required error={errors.reason}>
                <CheckboxGroup name="reason" cols={2}
                  options={['Academic','Career','Psychological','Interpersonal/Relationship Issue','Family','Emotional','Physical','Work Related/Organizational Issues']}
                  register={register} rules={{ required: 'Please select at least one reason' }} error={errors.reason}/>
              </Field>

              <SectionTitle title="Preferences"/>
              <Field label="Counselor Gender Preference" required error={errors.counselorGender}>
                <RadioGroup name="counselorGender" options={['Female','Male']}
                  register={register} rules={{ required: 'Please select a preference' }} error={errors.counselorGender}/>
              </Field>

              <Field label="Language Preference" required error={errors.language}>
                <RadioGroup name="language" options={['English','Filipino','English/Filipino']}
                  register={register} rules={{ required: 'Please select a language' }} error={errors.language}/>
              </Field>

              <SectionTitle title="Preferred Schedule"/>
              <Field label="Preferred Day/s" required error={errors.preferredDay}>
                <CheckboxGroup name="preferredDay" cols={3}
                  options={['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']}
                  register={register} rules={{ required: 'Please select at least one day' }} error={errors.preferredDay}/>
              </Field>

              <Field label="Preferred Time/s" required error={errors.preferredTime}>
                <CheckboxGroup name="preferredTime" cols={2}
                  options={['8AM to 9AM','9AM to 10AM','10AM to 11AM','11AM to 12NN','1PM to 2PM','2PM to 3PM','3PM to 4PM']}
                  register={register} rules={{ required: 'Please select at least one time' }} error={errors.preferredTime}/>
              </Field>

              <SectionTitle title="Emergency Contact"/>
              <Field label="Full Name of Emergency Contact" required error={errors.emergencyName}>
                <input type="text" placeholder="Full name" className={inputCls(errors.emergencyName)}
                  {...register('emergencyName', { required: 'Emergency contact name is required' })}/>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Relationship" required error={errors.emergencyRelationship}>
                  <input type="text" placeholder="e.g. Parent, Sibling" className={inputCls(errors.emergencyRelationship)}
                    {...register('emergencyRelationship', { required: 'Required' })}/>
                </Field>
                <Field label="Contact Number" required error={errors.emergencyContact}>
                  <input type="tel" placeholder="09XXXXXXXXX" inputMode="numeric" className={inputCls(errors.emergencyContact)}
                    {...register('emergencyContact', { required: 'Required', pattern: { value: /^09\d{9}$/, message: 'Format: 09XXXXXXXXX' } })}/>
                </Field>
              </div>

              <SectionTitle title="Consent"/>
              <div className="bg-[#f4f9f7] border border-[#d1e5de] rounded-xl p-4 mb-4">
                <p className="text-[12px] text-gray-600 leading-relaxed mb-3">
                  <strong>Data Privacy/Confidentiality Policy:</strong> Contents of all counseling, psychotherapy, and psychological assessment sessions are confidential. Records cannot be shared with another party without written consent.
                </p>
                <p className="text-[12px] text-gray-600 leading-relaxed mb-3">
                  <strong>Cancellation Policy:</strong> Cancellation must be made the day prior to your appointment date.
                </p>
                <Field label="Do you consent to the GCO keeping records of your session?" required error={errors.consent1}>
                  <RadioGroup name="consent1" options={['Yes','No']}
                    register={register} rules={{ required: 'Please select an answer' }} error={errors.consent1}/>
                </Field>
                <Field label="Do you understand that sessions are confidential but may be discussed under legal circumstances?" required error={errors.consent2}>
                  <RadioGroup name="consent2" options={['Yes','No']}
                    register={register} rules={{ required: 'Please select an answer' }} error={errors.consent2}/>
                </Field>
              </div>

              <button type="submit" disabled={isSubmitting}
                className={`w-full py-4 rounded-full text-[16px] font-semibold mt-1 transition-all ${isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#085041] text-white'}`}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        {/* SIDE PANEL */}
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <p className="text-[15px] font-semibold text-gray-900 mb-2 pb-3 border-b border-gray-100">📄 Official GCO Forms</p>
            <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">Download and complete the required forms before your session.</p>
            {forms.map(f => (
              <div key={f} className="flex items-center gap-3 px-3.5 py-3 bg-[#f4f9f7] border border-[#e0ece8] rounded-xl mb-2 last:mb-0">
                <span className="text-[13px] font-medium text-gray-900 flex-1">{f}</span>
                <button onClick={() => showToast?.('⬇️ Downloading...')}
                  className="bg-[#E1F5EE] text-[#085041] border border-[#9FE1CB] text-[12px] font-bold px-3.5 py-2 rounded-full flex-shrink-0">
                  Download
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <p className="text-[15px] font-semibold text-gray-900 mb-3 pb-3 border-b border-gray-100">🕐 Walk-in Hours</p>
            <p className="text-[14px] text-[#0F6E56] leading-loose">
              Monday – Saturday<br/>
              <strong className="text-[#085041]">8:00 AM – 12:00 NN</strong><br/>
              <strong className="text-[#085041]">1:00 PM – 5:00 PM</strong><br/>
              <span className="text-[12px] text-gray-400">GCO Office, CvSU Imus Campus</span>
            </p>
          </div>

          <div className="bg-[#085041] rounded-2xl p-5 text-white">
            <p className="text-[14px] font-semibold mb-3">📍 Contact Information</p>
            <p className="text-[13px] text-white/80 leading-relaxed mb-2">Cavite Civic Center, Palico IV, Imus, Cavite</p>
            <p className="text-[13px] text-white/80 leading-relaxed mb-2">(046) 471-66-07 / (046) 471-67-70 / (046) 686-2349</p>
            <p className="text-[13px] text-white/80">www.cvsu.edu.ph</p>
          </div>
        </div>
      </div>
    </div>
  )
} 