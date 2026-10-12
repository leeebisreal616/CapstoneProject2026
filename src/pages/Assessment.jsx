import { useState, useEffect } from 'react'

const exams = {
  personality: {
    title: 'Personality Profile',
    desc: 'Understand your traits and behavioral tendencies.',
    questions: [
      { q: 'I enjoy meeting and talking with new people.', opts: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { q: 'I prefer to plan things ahead rather than be spontaneous.', opts: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { q: 'I stay calm and composed even in stressful situations.', opts: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { q: 'I enjoy thinking about abstract ideas and concepts.', opts: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { q: "I tend to put others' needs before my own.", opts: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { q: 'I find it easy to stay focused on a task until it is completed.', opts: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { q: 'I feel comfortable being the center of attention in a group.', opts: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { q: 'I adapt easily to changes in plans or routines.', opts: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { q: 'I often reflect on my emotions and feelings.', opts: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { q: 'I take initiative and motivate others around me.', opts: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    ],
    score(ans) {
      const s = ans.reduce((a, b) => a + (4 - b), 0)
      if (s >= 30) return { label: 'Leadership Oriented', color: '#085041', bg: '#E8F5F1', desc: 'You tend to be outgoing, proactive, and enjoy social interaction.' }
      if (s >= 20) return { label: 'Balanced', color: '#185FA5', bg: '#e6f1fb', desc: 'Healthy mix of introversion and extraversion. You adapt well.' }
      return { label: 'Reflective', color: '#3C3489', bg: '#ede9fe', desc: 'Thoughtful and introspective. You thrive in roles that require careful analysis.' }
    }
  },
  wellbeing: {
    title: 'Well-Being Profile',
    desc: 'Assess your mental, emotional, and physical well-being.',
    questions: [
      { q: 'Over the past week, I have felt happy and content most of the time.', opts: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'] },
      { q: 'I have been able to manage my stress effectively this week.', opts: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'] },
      { q: 'I feel connected to my friends and family.', opts: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'] },
      { q: 'I have had enough energy to carry out my daily activities.', opts: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'] },
      { q: 'I have been sleeping well and waking up feeling rested.', opts: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'] },
      { q: 'I feel motivated to attend my classes and complete my schoolwork.', opts: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'] },
      { q: 'I have been eating regularly and maintaining a healthy diet.', opts: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'] },
      { q: 'I feel safe and secure in my living environment.', opts: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'] },
      { q: 'I have someone I can talk to when I am going through a difficult time.', opts: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'] },
      { q: 'Overall, I feel satisfied with my life as a student right now.', opts: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'] },
    ],
    score(ans) {
      const s = ans.reduce((a, b) => a + (4 - b), 0)
      if (s >= 30) return { label: 'Good Well-Being', color: '#085041', bg: '#E8F5F1', desc: 'Managing well across physical, emotional, and social dimensions.' }
      if (s >= 18) return { label: 'Moderate', color: '#B45309', bg: '#FEF3C7', desc: 'Some areas of strength but may benefit from additional support.' }
      return { label: 'Needs Attention', color: '#9B1C1C', bg: '#FEE2E2', desc: 'You may be experiencing challenges. Please reach out to GCO.' }
    }
  }
}

function ConfirmModal({ answered, total, onConfirm, onReview }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onReview() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onReview])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onReview() }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-[0_16px_40px_rgba(0,0,0,0.15)]">
        <h3 className="text-[16px] font-bold text-gray-900 text-center">Submit exam?</h3>
        <p className="text-[13px] text-gray-500 text-center mt-2">You answered {answered} of {total}. You cannot change answers after submitting.</p>
        <button onClick={onConfirm} className="bg-[#085041] text-white text-[14px] font-semibold py-3 rounded-full w-full mt-5 transition-all duration-200 hover:bg-[#0a5a49] active:scale-[0.98]">Confirm Submit</button>
        <button onClick={onReview} className="w-full mt-2 text-[13px] font-semibold text-gray-600 py-2 rounded-full hover:bg-gray-100">Review Answers</button>
      </div>
    </div>
  )
}

function ExamScreen({ type, onBack }) {
  const exam = exams[type]
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState(new Array(exam.questions.length).fill(null))
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const total = exam.questions.length
  const select = (i) => { const u = [...answers]; u[current] = i; setAnswers(u) }

  if (done) {
    const res = exam.score(answers)
    const score = answers.reduce((a, b) => a + (4 - (b?? 0)), 0)
    const pct = Math.round((score / (total * 4)) * 100)
    return (
      <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)]">
        <div className="bg-[#085041] px-6 md:px-10 py-6 text-white">
          <p className="text-[11px] text-white/50 tracking-widest font-bold">RESULTS</p>
          <h2 className="text-[20px] font-bold mt-1">{exam.title}</h2>
        </div>
        <div className="px-4 md:px-10 py-6 max-w-[720px] mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-[64px] h-[64px] rounded-full bg-[#E8F5F1] flex items-center justify-center text-[#085041] font-bold text-[18px]">{pct}%</div>
              <div>
                <span className="text-[12px] font-bold px-3 py-1 rounded-full" style={{ background: res.bg, color: res.color }}>{res.label}</span>
                <p className="text-[13px] text-gray-600 mt-2">{res.desc}</p>
              </div>
            </div>
            <button onClick={onBack} className="bg-[#085041] text-white text-[13px] font-semibold py-3 rounded-full w-full mt-5">Back to Assessments</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)]">
      {showConfirm && <ConfirmModal answered={answers.filter(a=>a!==null).length} total={total} onConfirm={() => { setShowConfirm(false); setDone(true)}} onReview={() => setShowConfirm(false)} />}
      <div className="bg-white border-b border-gray-200 px-6 md:px-10 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 className="text-[15px] font-bold text-gray-900">{exam.title}</h2>
          <p className="text-[12px] text-gray-500">Question {current + 1} of {total}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[11px] font-bold text-gray-400 hidden md:block">{Math.round(((current+1)/total)*100)}%</p>
          <div className="w-[100px] md:w-[140px] h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-[#085041] transition-all duration-300" style={{ width: `${((current+1)/total)*100}%` }}/></div>
        </div>
      </div>
      <div className="px-4 md:px-10 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 max-w-[1280px] mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 h-fit">
          <p className="text-[18px] md:text-[20px] font-semibold text-gray-900 leading-snug">{exam.questions[current].q}</p>
          <div className="flex flex-col gap-2.5 mt-6">
            {exam.questions[current].opts.map((o, i) => (
              <button key={i} onClick={() => select(i)} className={`px-4 py-3.5 rounded-xl border text-left text-[14px] flex items-center gap-3 transition-all duration-200 ${answers[current]===i? 'border-[#085041] bg-[#E8F5F1] text-gray-900' : 'border-gray-200 bg-white text-gray-700 hover:border-[#085041]/30'}`}>
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-[11px] font-bold ${answers[current]===i? 'bg-[#085041] border-[#085041] text-white' : 'border-gray-300 text-gray-500 bg-gray-50'}`}>{String.fromCharCode(65+i)}</div>
                {o}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={() => setCurrent(c => Math.max(0, c-1))} disabled={current===0} className="px-6 py-3 rounded-full border border-gray-200 text-[13px] font-semibold disabled:opacity-40">Back</button>
            <button onClick={() => current===total-1? setShowConfirm(true) : setCurrent(c=>c+1)} disabled={answers[current]===null} className={`flex-1 py-3 rounded-full text-[13px] font-bold ${answers[current]===null? 'bg-gray-200 text-gray-400' : 'bg-[#085041] text-white hover:bg-[#0a5a49]'}`}>{current===total-1? 'Submit' : 'Next'}</button>
          </div>
        </div>
        <div className="space-y-4 h-fit lg:sticky lg:top-[88px]">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-[10px] font-bold tracking-widest text-gray-400">YOUR PROGRESS</p>
            <div className="flex gap-1.5 mt-3">
              {Array.from({length: total}).map((_, idx) => (
                <div key={idx} className={`h-2 flex-1 rounded-full ${idx < current? 'bg-[#085041]' : idx === current? 'bg-[#085041]' : answers[idx]!==null? 'bg-[#085041]/50' : 'bg-gray-200'}`}/>
              ))}
            </div>
            <p className="text-[12px] text-gray-500 mt-3">{answers.filter(a=>a!==null).length} of {total} answered</p>
          </div>
          <div className="bg-[#085041] rounded-2xl p-5 text-white">
            <p className="text-[10px] font-bold tracking-widest text-white/50">CONFIDENTIAL</p>
            <p className="text-[12px] text-white/80 mt-2">Only your GCO counselor can view this. RA 10173 protected.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Assessment() {
  const [view, setView] = useState('list')
  if (view!== 'list') return <ExamScreen type={view} onBack={() => setView('list')} />

  return (
    <div className="bg-[#f6f8f7] h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* HEADER - GITNA NA */}
      <div className="bg-[#085041] px-6 md:px-10 py-8 md:py-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between shrink-0">
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-[32px] md:text-[40px] font-bold text-white leading-[0.95] tracking-tight">Initial Assessment</h2>
          <p className="text-[13px] md:text-[14px] text-white/70 mt-3 max-w-[440px] leading-relaxed">Complete both profiles. Required before booking counseling. Helps your counselor understand your current state.</p>
        </div>
        <div className="w-full lg:w-[360px] bg-[#0a5a49] border border-white/10 rounded-2xl p-5 shrink-0">
          <p className="text-[10px] font-bold tracking-widest text-white/40 mb-3">YOUR PROGRESS</p>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center"><p className="text-[20px] font-bold text-white">0/2</p><p className="text-[10px] text-white/50 mt-1">Completed</p></div>
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center"><p className="text-[20px] font-bold text-white">20</p><p className="text-[10px] text-white/50 mt-1">Total items</p></div>
          </div>
          <p className="text-[10px] text-white/50 mt-3">Confidential. Only your GCO counselor sees this. RA 10173.</p>
        </div>
      </div>

      {/* CONTENT - DI NA SCROLLABLE SA PC */}
      <div className="flex-1 px-4 md:px-10 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 max-w-[1280px] mx-auto w-full overflow-y-auto lg:overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-fit">
          {Object.keys(exams).map((key) => {
            const ex = exams[key]
            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col group hover:shadow-[0_12px_32px_rgba(8,80,65,0.14)] hover:-translate-y-[1px] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] flex items-center justify-center text-[#085041] font-bold text-[14px] group-hover:bg-[#085041] group-hover:text-white transition-colors">{key==='personality'? 'P' : 'W'}</div>
                <p className="text-[15px] font-bold text-gray-900 mt-4">{ex.title}</p>
                <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed flex-1">{ex.desc}</p>
                <p className="text-[10px] text-gray-400 mt-3">10 items • 5-10 mins</p>
                <button onClick={() => setView(key)} className="bg-[#085041] text-white text-[12px] font-bold py-2.5 rounded-full w-full mt-4 hover:bg-[#0a5a49] active:scale-[0.98] transition-all">Start Exam →</button>
              </div>
            )
          })}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 h-fit">
          <p className="text-[12px] font-bold text-gray-900">Why is this required?</p>
          <div className="mt-4 space-y-3">
            <div className="flex gap-2.5"><span className="w-6 h-6 rounded-full bg-[#E8F5F1] flex items-center justify-center text-[10px] font-bold text-[#085041]">1</span><p className="text-[11px] text-gray-600 flex-1 leading-relaxed">Helps your counselor understand your state</p></div>
            <div className="flex gap-2.5"><span className="w-6 h-6 rounded-full bg-[#E8F5F1] flex items-center justify-center text-[10px] font-bold text-[#085041]">2</span><p className="text-[11px] text-gray-600 flex-1 leading-relaxed">Only 10 minutes total for both exams</p></div>
            <div className="flex gap-2.5"><span className="w-6 h-6 rounded-full bg-[#E8F5F1] flex items-center justify-center text-[10px] font-bold text-[#085041]">3</span><p className="text-[11px] text-gray-600 flex-1 leading-relaxed">Then you can book counseling instantly</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}