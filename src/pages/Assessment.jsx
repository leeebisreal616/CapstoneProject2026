import { useState, useEffect } from 'react'

const exams = {
  personality: {
    title: 'Profiling Exam for Personality',
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
      if (s >= 30) return { label: 'High Extraversion / Leadership Oriented', color: '#085041', bg: '#E1F5EE', desc: 'You tend to be outgoing, proactive, and enjoy social interaction. You may thrive in group settings and leadership roles.' }
      if (s >= 20) return { label: 'Balanced Personality', color: '#185FA5', bg: '#e6f1fb', desc: 'You show a healthy mix of introversion and extraversion. You adapt well to different environments and can work effectively both independently and in teams.' }
      return { label: 'Reflective / Introspective', color: '#3C3489', bg: '#ede9fe', desc: 'You tend to be thoughtful and introspective. You may thrive in roles that require careful analysis, creativity, or independent work.' }
    }
  },
  wellbeing: {
    title: 'Profiling Exam for Well-Being',
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
      if (s >= 30) return { label: 'Good Overall Well-Being', color: '#085041', bg: '#E1F5EE', desc: 'You appear to be managing well across physical, emotional, and social dimensions. Keep maintaining your healthy habits.' }
      if (s >= 18) return { label: 'Moderate Well-Being', color: '#B45309', bg: '#FEF3C7', desc: 'You show some areas of strength but may benefit from additional support. Consider speaking with a GCO counselor.' }
      return { label: 'Needs Attention', color: '#9B1C1C', bg: '#FEE2E2', desc: 'Your responses suggest you may be experiencing challenges in several areas. We strongly encourage you to reach out to the GCO for support.' }
    }
  }
}

// Confirmation Modal
function ConfirmModal({ exam, answers, onConfirm, onReview }) {
  const total = exam.questions.length
  const answered = answers.filter(a => a !== null).length

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onReview() }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onReview])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onReview() }}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-[fadeUp_.2s_ease]">
        <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="#085041" strokeWidth={1.8} className="w-7 h-7">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="text-[18px] font-bold text-gray-900 text-center mb-2">Submit Exam?</h3>
        <p className="text-[13px] text-gray-500 text-center leading-relaxed mb-1">
          You have answered <strong className="text-gray-900">{answered} of {total}</strong> questions.
        </p>
        <p className="text-[13px] text-gray-500 text-center leading-relaxed mb-5">
          Once submitted, you cannot change your answers.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
          <p className="text-[12px] text-amber-800 text-center">🔒 Your results are confidential and only seen by your GCO counselor.</p>
        </div>
        <button onClick={onConfirm}
          className="bg-[#085041] text-white text-[15px] font-semibold py-3.5 rounded-full w-full mb-2">
          Confirm Submit
        </button>
        <button onClick={onReview}
          className="border-[1.5px] border-[#9FE1CB] text-[#085041] text-[14px] font-semibold py-3 rounded-full w-full">
          Review Answers
        </button>
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
  const pct = Math.round((current / total) * 100)
  const letters = ['A', 'B', 'C', 'D', 'E']

  const select = (i) => {
    const updated = [...answers]
    updated[current] = i
    setAnswers(updated)
  }

  const next = () => {
    if (current < total - 1) setCurrent(current + 1)
    else setShowConfirm(true)
  }

  const prev = () => { if (current > 0) setCurrent(current - 1) }

  const confirmSubmit = () => {
    setShowConfirm(false)
    setDone(true)
  }

  if (done) {
    const res = exam.score(answers)
    const score = answers.reduce((a, b) => a + (4 - (b ?? 0)), 0)
    const maxScore = total * 4
    const scorePct = Math.round((score / maxScore) * 100)

    return (
      <div>
        <div className="bg-[#E1F5EE] border-b border-[#9FE1CB] px-4 py-5">
          <h2 className="text-[20px] font-bold text-[#085041]">Your Results</h2>
          <p className="text-[13px] text-[#0F6E56] mt-1">{exam.title}</p>
        </div>
        <div className="px-4 py-6 max-w-xl mx-auto text-center">
          <div className="w-[88px] h-[88px] rounded-full bg-[#E1F5EE] border-[3px] border-[#9FE1CB] flex flex-col items-center justify-center mx-auto mb-4">
            <p className="text-[22px] font-bold text-[#085041]">{scorePct}%</p>
            <p className="text-[10px] text-[#0F6E56]">Score</p>
          </div>
          <span className="inline-block text-[13px] font-bold px-4 py-2 rounded-full mb-4"
            style={{ background: res.bg, color: res.color }}>{res.label}</span>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left mb-3">
            <p className="text-[12px] font-bold text-[#085041] uppercase tracking-wider mb-2">What This Means</p>
            <p className="text-[13px] text-gray-600 leading-relaxed">{res.desc}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left mb-3">
            <p className="text-[12px] font-bold text-[#085041] uppercase tracking-wider mb-2">Next Steps</p>
            <p className="text-[13px] text-gray-600 leading-relaxed">Your results have been recorded and will be reviewed by your guidance counselor. You may be invited for a follow-up session based on your responses.</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-left">
            <p className="text-[13px] text-amber-800 leading-relaxed">🔒 <strong>Confidential</strong> — These results are strictly confidential and only visible to your licensed GCO counselor.</p>
          </div>
          <button onClick={onBack} className="bg-[#085041] text-white text-[15px] font-semibold py-4 rounded-full w-full">
            Back to Assessment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {showConfirm && (
        <ConfirmModal
          exam={exam}
          answers={answers}
          onConfirm={confirmSubmit}
          onReview={() => setShowConfirm(false)}
        />
      )}
      <div className="bg-[#E1F5EE] border-b border-[#9FE1CB] px-4 py-5">
        <h2 className="text-[18px] font-bold text-[#085041]">{exam.title}</h2>
        <p className="text-[13px] text-[#0F6E56] mt-1">Select the answer that best describes you.</p>
      </div>
      <div className="px-4 py-5 max-w-xl mx-auto">
        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between text-[12px] font-semibold text-gray-500 mb-2">
            <span>Question {current + 1} of {total}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#085041] rounded-full transition-all duration-300" style={{ width: `${pct}%` }}/>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <p className="text-[11px] font-bold text-[#1D9E75] mb-2">Question {current + 1}</p>
          <p className="text-[15px] font-semibold text-gray-900 leading-relaxed mb-4">{exam.questions[current].q}</p>
          <div className="flex flex-col gap-2">
            {exam.questions[current].opts.map((o, i) => (
              <button key={i} onClick={() => select(i)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-[1.5px] text-left transition-all ${answers[current] === i ? 'border-[#085041] bg-[#E1F5EE]' : 'border-[#d1e5de] bg-white'}`}>
                <div className={`w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center text-[12px] font-bold flex-shrink-0 transition-all ${answers[current] === i ? 'bg-[#085041] border-[#085041] text-white' : 'border-[#d1e5de] text-gray-400'}`}>
                  {letters[i]}
                </div>
                <span className="text-[14px] text-gray-800">{o}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Nav */}
        <div className="flex gap-3">
          <button onClick={prev} style={{ visibility: current === 0 ? 'hidden' : 'visible' }}
            className="flex-1 border-[1.5px] border-[#9FE1CB] text-[#085041] text-[14px] font-semibold py-3.5 rounded-full">
            ← Back
          </button>
          <button onClick={next} disabled={answers[current] === null}
            className={`flex-[2] text-[14px] font-semibold py-3.5 rounded-full transition-all ${answers[current] === null ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#085041] text-white'}`}>
            {current === total - 1 ? 'Submit ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Assessment() {
  const [view, setView] = useState('list')

  if (view === 'personality') return <ExamScreen type="personality" onBack={() => setView('list')}/>
  if (view === 'wellbeing') return <ExamScreen type="wellbeing" onBack={() => setView('list')}/>

  const examCards = [
    {
      type: 'personality',
      title: 'Profiling Exam for Personality',
      desc: 'Understand your personality traits and behavioral tendencies through a structured self-assessment.',
      meta: '⏱ 15–20 mins · 10 items',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#085041" strokeWidth={1.8} className="w-[28px] h-[28px]"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>
    },
    {
      type: 'wellbeing',
      title: 'Profiling Exam for Well-Being',
      desc: 'Assess your overall mental, emotional, and physical well-being to guide your counseling support.',
      meta: '⏱ 10–15 mins · 10 items',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#085041" strokeWidth={1.8} className="w-[28px] h-[28px]"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
    }
  ]

  return (
    <div>
      <div className="bg-[#E1F5EE] border-b border-[#9FE1CB] px-4 py-5">
        <h2 className="text-[20px] font-bold text-[#085041]">Assessment & Screening</h2>
        <p className="text-[13px] text-[#0F6E56] mt-1">Complete all required profiling exams.</p>
      </div>
      <div className="px-4 py-5 flex flex-col gap-4 max-w-2xl mx-auto md:grid md:grid-cols-2">
        {examCards.map(card => (
          <div key={card.type} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="w-[60px] h-[60px] rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-3">
              {card.icon}
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#E1F5EE] text-[#085041] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#085041] inline-block"/>
              Required
            </span>
            <h3 className="text-[16px] font-bold text-gray-900 mb-2">{card.title}</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-2">{card.desc}</p>
            <p className="text-[12px] font-semibold text-[#0F6E56] mb-4">{card.meta}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-left">
              <p className="text-[12px] text-amber-800 leading-relaxed">🔒 <strong>Confidential</strong> — Results are only accessed by your licensed guidance counselor.</p>
            </div>
            <button onClick={() => setView(card.type)}
              className="bg-[#085041] text-white text-[14px] font-semibold py-3.5 rounded-full w-full">
              Start Exam
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}