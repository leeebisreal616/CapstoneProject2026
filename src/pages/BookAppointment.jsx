const handleBook = async () => {
  if (!selectedDate || !selectedTime) {
    showNoticeModal("Please select both date and time.");
    return
  }
  if (isWeekend(selectedDate)) {
    showNoticeModal("Cannot book on weekends - Mon-Fri only.");
    return
  }
  if (!reason.trim() || !emergencyName || !emergencyNo) {
    showNoticeModal("Please complete all required fields including Emergency Contact.");
    return
  }
  if (!consent1 || !consent2) {
    showNoticeModal("You must agree to both consent statements.");
    return
  }
  setLoading(true)
  try {
    // 1. GISINGIN MUNA BACKEND - WAKES UP RENDER (FREE TIER SLEEPS)
    showNoticeModal("Waking up server... please wait 10 seconds", "success")
    await fetch('https://gco-portal-backend.onrender.com/', { 
      method: 'GET',
      cache: 'no-store',
      mode: 'cors'
    });
    await new Promise(r => setTimeout(r, 3000)); // wait 3 sec

    const payload = {
      appointment_date: selectedDate,
      consultation_hour: selectedTime,
      counselor_name: counselors[selectedCounselor].name,
      counselor_pref: counselorPref,
      language_pref: langPref,
      reason,
      emergency_contact: { name: emergencyName, rel: emergencyRel, no: emergencyNo },
      student_info: "Aaron Valencia - 202311325 - BSIT 4th Year",
      status: "Pending"
    }
    const res = await fetch('https://gco-portal-backend.onrender.com/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      cache: 'no-store',
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Booking failed')
    showNoticeModal("Your counseling request has been successfully booked and saved to GCO databank.", "success")
    setSelectedDate(''); setSelectedTime(''); setReason(''); setEmergencyName(''); setEmergencyRel(''); setEmergencyNo('')
  } catch (err) {
    console.error(err)
    // REAL ERROR MESSAGE
    if (err.message.includes('Failed to fetch')) {
      showNoticeModal("Server is waking up (Render free sleeps). Wait 30 sec, open https://gco-portal-backend.onrender.com in new tab, then try again.")
    } else {
      showNoticeModal(err.message)
    }
  } finally {
    setLoading(false)
  }
}