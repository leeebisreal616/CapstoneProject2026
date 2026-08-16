import { useState } from 'react'
import { useForm } from 'react-hook-form'
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

function RadioGroup({ name, options, inline, register, rules, error }) {
  return (
    <>
      <div className={`flex gap-2 mt-1 ${inline ? 'flex-row flex-wrap' : 'flex-col'}`}>
        {options.map(o => (
          <label key={o} className="flex items-center gap-2.5 bg-[#f8fdf9] border-[1.5px] border-[#d1e5de] rounded-xl px-3.5 py-3 cursor-pointer">
            <input type="radio" value={o} className="w-[18px] h-[18px] accent-[#085041] flex-shrink-0" {...register(name, rules)}/>
            <span className="text-[14px] text-gray-800">{o}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-red-500 text-[12px] mt-1 flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error.message}
        </p>
      )}
    </>
  )
}

function CheckGroup({ name, options, register, rules, error }) {
  return (
    <>
      <div className="flex flex-col gap-2 mt-1">
        {options.map(o => (
          <label key={o} className="flex items-center gap-2.5 bg-[#f8fdf9] border-[1.5px] border-[#d1e5de] rounded-xl px-3.5 py-3 cursor-pointer">
            <input type="checkbox" value={o} className="w-[18px] h-[18px] accent-[#085041] flex-shrink-0" {...register(name, rules)}/>
            <span className="text-[14px] text-gray-800">{o}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-red-500 text-[12px] mt-1 flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error.message}
        </p>
      )}
    </>
  )
}

function SuccessScreen({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="w-[72px] h-[72px] rounded-full bg-[#E1F5EE] flex items-center justify-center mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="#085041" strokeWidth={2} className="w-[34px] h-[34px]">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="text-[20px] font-bold text-gray-900 mb-2">Form Submitted!</h3>
      <p className="text-[14px] text-gray-500 leading-relaxed mb-6">Your form has been successfully submitted to the Guidance & Counseling Office. Your counselor will review it before your session.</p>
      <button onClick={onBack} className="bg-[#085041] text-white text-[16px] font-semibold py-4 rounded-full w-full max-w-sm">Back to Inventory</button>
    </div>
  )
}

function NeedsAssessment({ onBack, onSubmit }) {
  const submit = async (data) => {
  await new Promise(r => setTimeout(r, 800))
  const cleanData = sanitizeFormData(data)
  console.log('Needs Assessment (sanitized):', cleanData)
  reset()
  onSubmit()
  }

  return (
    <div>
      <div className="bg-[#E1F5EE] border-b border-[#9FE1CB] px-4 py-5">
        <h2 className="text-[20px] font-bold text-[#085041]">Needs Assessment Form</h2>
        <p className="text-[13px] text-[#0F6E56] mt-1">All items marked with * are required.</p>
      </div>
      <form onSubmit={handleSubmit(submit)} noValidate className="px-4 py-5 max-w-2xl mx-auto">
        <SectionTitle title="Personal Information"/>
        <Field label="Full Name" required error={errors.fullName}>
          <input type="text" placeholder="Juan Dela Cruz" autoComplete="name" className={inputCls(errors.fullName)}
            {...register('fullName', { required: 'Full name is required', minLength: { value: 3, message: 'At least 3 characters' } })}/>
        </Field>
        <Field label="Student ID" required error={errors.studentId}>
          <input type="text" placeholder="202100123" inputMode="numeric" className={inputCls(errors.studentId)}
            {...register('studentId', { required: 'Student ID is required', pattern: { value: /^\d{9}$/, message: 'Format: YYYYNNNNN (e.g. 202100123)' } })}/>
        </Field>
        <Field label="Course & Year" required error={errors.courseYear}>
          <input type="text" placeholder="BSIT 3-E" className={inputCls(errors.courseYear)}
            {...register('courseYear', { required: 'Course and year is required' })}/>
        </Field>
        <Field label="Age" required error={errors.age}>
          <input type="number" placeholder="19" inputMode="numeric" className={inputCls(errors.age)}
            {...register('age', { required: 'Age is required', min: { value: 16, message: 'Must be at least 16' }, max: { value: 40, message: 'Must be under 40' } })}/>
        </Field>
        <Field label="Sex" required error={errors.sex}>
          <RadioGroup name="sex" options={['Male','Female']} inline register={register} rules={{ required: 'Please select your sex' }} error={errors.sex}/>
        </Field>

        <SectionTitle title="Academic Needs"/>
        <Field label="Which academic areas do you need help with?" required error={errors.academicNeeds}>
          <CheckGroup name="academicNeeds" options={['Study habits and time management','Test anxiety or exam preparation','Understanding course materials','Attendance and motivation','Relationship with professors']}
            register={register} rules={{ required: 'Please select at least one area' }} error={errors.academicNeeds}/>
        </Field>

        <SectionTitle title="Personal-Social-Emotional Needs"/>
        <Field label="Which of the following do you currently experience?" required error={errors.socialNeeds}>
          <CheckGroup name="socialNeeds" options={['Stress or anxiety','Family concerns','Peer or relationship issues','Financial difficulties','Low self-esteem or confidence','Difficulty adjusting to college life']}
            register={register} rules={{ required: 'Please select at least one' }} error={errors.socialNeeds}/>
        </Field>

        <SectionTitle title="Career Needs"/>
        <Field label="Do you need career-related guidance?" required error={errors.careerNeeds}>
          <RadioGroup name="careerNeeds" options={["Yes, I'm unsure about my course or career path","Yes, I want help with job/internship readiness","Not at the moment"]}
            register={register} rules={{ required: 'Please select an option' }} error={errors.careerNeeds}/>
        </Field>

        <SectionTitle title="Priority Concern"/>
        <Field label="What is your most pressing concern right now?" required error={errors.concern}>
          <textarea rows={4} placeholder="Describe your most urgent concern..." className={inputCls(errors.concern) + ' resize-none leading-relaxed'}
            {...register('concern', { required: 'Please describe your concern', minLength: { value: 10, message: 'Please provide more detail (at least 10 characters)' } })}/>
        </Field>
        <Field label="How would you rate your overall well-being this week?" required error={errors.wellbeing}>
          <select className={inputCls(errors.wellbeing)} style={selectStyle}
            {...register('wellbeing', { required: 'Please rate your well-being' })}>
            <option value="">— Select —</option>
            <option>😊 Very good</option>
            <option>🙂 Good</option>
            <option>😐 Neutral</option>
            <option>😟 Poor</option>
            <option>😢 Very poor</option>
          </select>
        </Field>

        <button type="submit" disabled={isSubmitting}
          className={`w-full py-4 rounded-full text-[16px] font-semibold mt-2 transition-all ${isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#085041] text-white'}`}>
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Submitting...
            </span>
          ) : 'Submit Form'}
        </button>
        <button type="button" onClick={onBack} className="border-[1.5px] border-[#9FE1CB] text-[#085041] text-[14px] font-semibold py-3.5 rounded-full w-full mt-3">← Back to Inventory</button>
      </form>
    </div>
  )
}

function StudentProfile({ onBack, onSubmit }) {
  const submit = async (data) => {
  await new Promise(r => setTimeout(r, 800))
  const cleanData = sanitizeFormData(data)
  console.log('Student Profile (sanitized):', cleanData)
  reset()
  onSubmit()
  }

  return (
    <div>
      <div className="bg-[#E1F5EE] border-b border-[#9FE1CB] px-4 py-5">
        <h2 className="text-[20px] font-bold text-[#085041]">Student Profile Inventory</h2>
        <p className="text-[13px] text-[#0F6E56] mt-1">All items marked with * are required.</p>
      </div>
      <form onSubmit={handleSubmit(submit)} noValidate className="px-4 py-5 max-w-2xl mx-auto">
        <SectionTitle title="Personal Information"/>
        <Field label="Full Name" required error={errors.fullName}>
          <input type="text" placeholder="Juan Dela Cruz" autoComplete="name" className={inputCls(errors.fullName)}
            {...register('fullName', { required: 'Full name is required', minLength: { value: 3, message: 'At least 3 characters' } })}/>
        </Field>
        <Field label="Nickname" required error={errors.nickname}>
          <input type="text" placeholder="e.g. Juan" className={inputCls(errors.nickname)}
            {...register('nickname', { required: 'Nickname is required' })}/>
        </Field>
        <Field label="Student ID" required error={errors.studentId}>
          <input type="text" placeholder="202100123" inputMode="numeric" className={inputCls(errors.studentId)}
            {...register('studentId', { required: 'Student ID is required', pattern: { value: /^\d{9}$/, message: 'Format: YYYYNNNNN (e.g. 202100123)' } })}/>
        </Field>
        <Field label="Date of Birth" required error={errors.dob}>
          <input type="date" className={inputCls(errors.dob)}
            {...register('dob', { required: 'Date of birth is required' })}/>
        </Field>
        <Field label="Place of Birth" required error={errors.pob}>
          <input type="text" placeholder="e.g. Imus, Cavite" className={inputCls(errors.pob)}
            {...register('pob', { required: 'Place of birth is required' })}/>
        </Field>
        <Field label="Sex" required error={errors.sex}>
          <RadioGroup name="sex" options={['Male','Female']} inline register={register} rules={{ required: 'Please select your sex' }} error={errors.sex}/>
        </Field>
        <Field label="Civil Status" required error={errors.civilStatus}>
          <select className={inputCls(errors.civilStatus)} style={selectStyle}
            {...register('civilStatus', { required: 'Civil status is required' })}>
            <option value="">— Select —</option>
            <option>Single</option><option>Married</option><option>Other</option>
          </select>
        </Field>
        <Field label="Religion" required error={errors.religion}>
          <input type="text" placeholder="e.g. Roman Catholic" className={inputCls(errors.religion)}
            {...register('religion', { required: 'Religion is required' })}/>
        </Field>
        <Field label="Home Address" required error={errors.address}>
          <textarea rows={2} placeholder="Street, Barangay, City/Municipality, Province" className={inputCls(errors.address) + ' resize-none'}
            {...register('address', { required: 'Home address is required' })}/>
        </Field>
        <Field label="Contact Number" required error={errors.contact}>
          <input type="tel" placeholder="09XXXXXXXXX" inputMode="numeric" className={inputCls(errors.contact)}
            {...register('contact', { required: 'Contact number is required', pattern: { value: /^09\d{9}$/, message: 'Must be a valid PH number (09XXXXXXXXX)' } })}/>
        </Field>

        <SectionTitle title="Academic Information"/>
        <Field label="College / Department" required error={errors.college}>
          <input type="text" placeholder="e.g. College of Information and Computing Sciences" className={inputCls(errors.college)}
            {...register('college', { required: 'College/department is required' })}/>
        </Field>
        <Field label="Course & Year" required error={errors.courseYear}>
          <input type="text" placeholder="e.g. BSIT 3-E" className={inputCls(errors.courseYear)}
            {...register('courseYear', { required: 'Course and year is required' })}/>
        </Field>
        <Field label="Year of Admission" required error={errors.yearAdmission}>
          <input type="number" placeholder="e.g. 2021" inputMode="numeric" className={inputCls(errors.yearAdmission)}
            {...register('yearAdmission', { required: 'Year of admission is required', min: { value: 2000, message: 'Invalid year' }, max: { value: new Date().getFullYear(), message: 'Invalid year' } })}/>
        </Field>
        <Field label="Scholarship / Financial Aid" required error={errors.scholarship}>
          <RadioGroup name="scholarship" options={['Yes, government scholarship (e.g. CHED, UNIFAST)','Yes, institutional or private scholarship','No scholarship / self-funded']}
            register={register} rules={{ required: 'Please select an option' }} error={errors.scholarship}/>
        </Field>

        <SectionTitle title="Family Background"/>
        <Field label="Father's Name" required error={errors.fatherName}>
          <input type="text" placeholder="Full name" className={inputCls(errors.fatherName)}
            {...register('fatherName', { required: "Father's name is required" })}/>
        </Field>
        <Field label="Father's Occupation" required error={errors.fatherOccupation}>
          <input type="text" placeholder="e.g. Engineer" className={inputCls(errors.fatherOccupation)}
            {...register('fatherOccupation', { required: "Father's occupation is required" })}/>
        </Field>
        <Field label="Mother's Name" required error={errors.motherName}>
          <input type="text" placeholder="Full name" className={inputCls(errors.motherName)}
            {...register('motherName', { required: "Mother's name is required" })}/>
        </Field>
        <Field label="Mother's Occupation" required error={errors.motherOccupation}>
          <input type="text" placeholder="e.g. Teacher" className={inputCls(errors.motherOccupation)}
            {...register('motherOccupation', { required: "Mother's occupation is required" })}/>
        </Field>
        <Field label="Guardian's Name (if different)" required error={errors.guardian}>
          <input type="text" placeholder="Full name or N/A" className={inputCls(errors.guardian)}
            {...register('guardian', { required: "Guardian's name is required or write N/A" })}/>
        </Field>
        <Field label="Monthly Family Income" required error={errors.income}>
          <select className={inputCls(errors.income)} style={selectStyle}
            {...register('income', { required: 'Please select income range' })}>
            <option value="">— Select range —</option>
            <option>Below ₱10,000</option>
            <option>₱10,000 – ₱20,000</option>
            <option>₱20,001 – ₱40,000</option>
            <option>₱40,001 – ₱60,000</option>
            <option>Above ₱60,000</option>
          </select>
        </Field>
        <Field label="Number of Siblings" required error={errors.siblings}>
          <input type="number" placeholder="e.g. 2" inputMode="numeric" min="0" className={inputCls(errors.siblings)}
            {...register('siblings', { required: 'Number of siblings is required', min: { value: 0, message: 'Cannot be negative' } })}/>
        </Field>
        <Field label="Birth Order" required error={errors.birthOrder}>
          <select className={inputCls(errors.birthOrder)} style={selectStyle}
            {...register('birthOrder', { required: 'Birth order is required' })}>
            <option value="">— Select —</option>
            <option>Eldest</option><option>Middle</option><option>Youngest</option><option>Only Child</option>
          </select>
        </Field>

        <SectionTitle title="Health Information"/>
        <Field label="Do you have any existing health condition?" required error={errors.health}>
          <RadioGroup name="health" options={['None','Physical condition (please specify below)','Mental health concern (please specify below)']}
            register={register} rules={{ required: 'Please select an option' }} error={errors.health}/>
        </Field>
        <Field label="Please specify (if applicable)" error={errors.healthSpec}>
          <input type="text" placeholder="e.g. Asthma, or N/A" className={inputCls(errors.healthSpec)}
            {...register('healthSpec')}/>
        </Field>

        <button type="submit" disabled={isSubmitting}
          className={`w-full py-4 rounded-full text-[16px] font-semibold mt-2 transition-all ${isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#085041] text-white'}`}>
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Submitting...
            </span>
          ) : 'Submit Form'}
        </button>
        <button type="button" onClick={onBack} className="border-[1.5px] border-[#9FE1CB] text-[#085041] text-[14px] font-semibold py-3.5 rounded-full w-full mt-3">← Back to Inventory</button>
      </form>
    </div>
  )
}

export default function Inventory({ navigate }) {
  const [view, setView] = useState('list')

  const items = [
    { title: 'Needs Assessment Form', desc: 'Identify your primary needs and areas requiring guidance support.', action: () => setView('needs') },
    { title: 'Student Profile Inventory Form', desc: 'Provide background information for your counseling record.', action: () => setView('profile') },
    { title: 'Routine Interview', desc: 'Schedule a routine check-in session with a guidance counselor.', action: () => navigate('counseling') },
  ]

  if (view === 'needs') return <NeedsAssessment onBack={() => setView('list')} onSubmit={() => setView('success')}/>
  if (view === 'profile') return <StudentProfile onBack={() => setView('list')} onSubmit={() => setView('success')}/>
  if (view === 'success') return <SuccessScreen onBack={() => setView('list')}/>

  return (
    <div>
      <div className="bg-[#E1F5EE] border-b border-[#9FE1CB] px-4 py-5">
        <h2 className="text-[20px] font-bold text-[#085041]">Individual Inventory</h2>
        <p className="text-[13px] text-[#0F6E56] mt-1">Complete all required assessment and profile forms.</p>
      </div>
      <div className="px-4 py-5 flex flex-col gap-3 max-w-2xl mx-auto">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#E1F5EE] text-[#085041] flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#085041] inline-block"/>
                Required
              </span>
            </div>
            <button onClick={item.action} className="bg-[#085041] text-white text-[14px] font-semibold py-3.5 rounded-full w-full">
              {i === 2 ? 'Schedule Interview' : 'Fill Out Form'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}