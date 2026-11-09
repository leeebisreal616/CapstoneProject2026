import { useState, useEffect, useMemo } from 'react';

const BASE = 'http://localhost/gco-api';
const CONCERN_TYPES = ['Academic', 'Psychological', 'Family', 'Physical', 'Career', 'Interpersonal/Relationship', 'Emotional', 'Work Related', 'Others'];

const Icon = {
  x: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}>
      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chevron: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function Badge({ status }) {
  const map = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Approved: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
    Completed: 'bg-gray-100 text-gray-600 border-gray-200',
    Declined: 'bg-red-50 text-red-600 border-red-200',
    Cancelled: 'bg-red-50 text-red-600 border-red-200',
  };
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
}

function ConcernBadge({ concern }) {
  const colors = {
    Academic: 'bg-[#e6f1fb] text-[#185FA5] border-[#bdd7f5]',
    Career: 'bg-[#ede9fe] text-[#3C3489] border-[#d8d0ff]',
    'Work Related': 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
  };
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${colors[concern] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {concern}
    </span>
  );
}

function UrgencyBadge({ urgency }) {
  if (urgency === 'Emergency') {
    return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-red-600 text-white border-red-600 animate-pulse">🚨 EMERGENCY</span>;
  }
  if (urgency === 'Urgent') {
    return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-orange-100 text-orange-700 border-orange-300">⚠️ URGENT</span>;
  }
  return <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-gray-100 text-gray-600 border-gray-200">Normal</span>;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [concernFilter, setConcernFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  // [ADD - ARCHIVE]
  const [showArchived, setShowArchived] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);

  // [ADD - ARCHIVE] - fetch na may ?archived=0 or 1
  const fetchLive = async (isArchived = showArchived) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/appointments/get_appointments.php?archived=${isArchived ? 1 : 0}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || data.appointments || data.result || [];
      const mapped = list.map((r) => ({
        id: r.id || r.appointment_id,
        name: r.student_name || r.name || 'Student',
        studentId: r.student_id,
        studentNumber: r.student_id,
        course: r.course || 'BSIT',
        year: r.year || '4th Year',
        concern: r.concern || r.concern_type || 'Academic',
        date: r.appointment_date || r.preferred_day,
        time: r.time_slot || r.consultation_hour || r.preferred_time || '',
        status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase() : 'Pending',
        urgency: r.urgency_level || r.urgency || 'Normal',
        reason: r.reason || '',
        archived: r.archived ?? 0,
        archived_at: r.archived_at || null,
      }));
      setAppointments(mapped);
      if (!isArchived) {
        const ar = await fetch(`${BASE}/appointments/get_appointments.php?archived=1`).then((r) => r.json());
        setArchivedCount(Array.isArray(ar) ? ar.length : 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive(false);
  }, []);

  const handleToggleArchived = (val) => {
    setShowArchived(val);
    setFilter('all');
    setUrgencyFilter('All');
    fetchLive(val);
  };

  const handleArchive = async (id, action) => {
    if (!confirm(action === 'archive' ? 'Archive this appointment? Hindi sya mabubura, mapupunta lang sa Archived.' : 'Restore this appointment?')) return;
    try {
      const res = await fetch(`${BASE}/appointments/archive_appointment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const result = await res.json();
      if (!result.success) throw new Error('Failed');
      setSelected(null);
      fetchLive(showArchived);
      if (!showArchived) {
        const ar = await fetch(`${BASE}/appointments/get_appointments.php?archived=1`).then((r) => r.json());
        setArchivedCount(Array.isArray(ar) ? ar.length : 0);
      }
    } catch (e) {
      alert('Failed: ' + e.message);
    }
  };

  const emergencyCount = appointments.filter((a) => a.urgency === 'Emergency' && a.status === 'Pending').length;
  const urgentCount = appointments.filter((a) => a.urgency === 'Urgent' && a.status === 'Pending').length;

  const filtered = useMemo(() => {
    let result = [...appointments];
    if (filter !== 'all') result = result.filter((a) => a.status.toLowerCase() === filter.toLowerCase());
    if (concernFilter !== 'All') result = result.filter((a) => a.concern === concernFilter);
    if (search.trim()) result = result.filter((a) => String(a.studentNumber).includes(search.trim()));
    if (urgencyFilter !== 'All') result = result.filter((a) => a.urgency === urgencyFilter);
    const rank = { Emergency: 0, Urgent: 1, Normal: 2 };
    result.sort((a, b) => (rank[a.urgency] ?? 2) - (rank[b.urgency] ?? 2));
    return result;
  }, [appointments, filter, concernFilter, search, urgencyFilter]);

  const applyStatusChange = async () => {
    if (!confirmAction) return;
    try {
      const res = await fetch(`${BASE}/appointments/update_status.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmAction.id, appointment_id: confirmAction.id, status: confirmAction.action }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Update failed');
      setAppointments((prev) => prev.map((a) => (a.id === confirmAction.id ? { ...a, status: confirmAction.action } : a)));
      if (selected?.id === confirmAction.id) {
        setSelected((s) => ({ ...s, status: confirmAction.action }));
      }
      setConfirmAction(null);
      setSelected(null);
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  if (loading) return <div className="p-6 text-[12px] text-gray-400">Loading appointments...</div>;

  return (
    <div className="bg-[#f6f8f7] min-h-full p-5">
      <h1 className="text-[14px] font-semibold text-gray-900 mb-4">Appointments</h1>

      {/* [ADD - ARCHIVE] - Toggle Active / Archived */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleToggleArchived(false)}
          className={`text-[12px] font-medium px-4 py-2 rounded-full border ${!showArchived ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-600 border-gray-200'}`}
        >
          Active
        </button>
        <button
          onClick={() => handleToggleArchived(true)}
          className={`text-[12px] font-medium px-4 py-2 rounded-full border ${showArchived ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}
        >
          📦 Archived ({archivedCount})
        </button>
      </div>

      {showArchived && (
        <div className="bg-gray-100 border border-gray-200 text-gray-600 rounded-xl p-3 mb-4">
          <p className="text-[12px] font-medium">📦 Archived view — hindi na to lumalabas sa Active at sa Report. Pwede mo pa i-Restore.</p>
        </div>
      )}

      {emergencyCount > 0 && !showArchived && (
        <div className="bg-red-600 text-white rounded-xl p-4 mb-4 flex items-center justify-between animate-pulse">
          <div>
            <p className="text-[14px] font-bold">🚨 {emergencyCount} EMERGENCY {emergencyCount > 1 ? 'REQUESTS' : 'REQUEST'} - Needs Immediate Action!</p>
            <p className="text-[11px] text-white/80 mt-0.5">Nasa pinaka-taas na sila. Please review agad. Kung life-threatening, refer to NCMH 1553 / 911.</p>
          </div>
          <button onClick={() => setUrgencyFilter('Emergency')} className="bg-white text-red-600 text-[12px] font-bold px-4 py-2 rounded-full shrink-0 ml-3">
            View Emergency
          </button>
        </div>
      )}

      {emergencyCount === 0 && urgentCount > 0 && !showArchived && (
        <div className="bg-orange-100 border border-orange-300 text-orange-800 rounded-xl p-3 mb-4">
          <p className="text-[12px] font-bold">⚠️ {urgentCount} URGENT {urgentCount > 1 ? 'requests' : 'request'} waiting - prioritize within 24-48 hours.</p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {['all', 'Pending', 'Approved', 'Completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[12px] font-medium px-4 py-2 rounded-full border transition-colors ${filter === f ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            {f === 'all' ? `All (${appointments.length})` : f}
          </button>
        ))}
        <button onClick={() => fetchLive(showArchived)} className="ml-auto bg-white border border-gray-200 text-[12px] px-4 py-2 rounded-full">
          Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['All', 'Emergency', 'Urgent', 'Normal'].map((u) => (
          <button
            key={u}
            onClick={() => setUrgencyFilter(u)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${urgencyFilter === u ? (u === 'Emergency' ? 'bg-red-600 text-white border-red-600' : u === 'Urgent' ? 'bg-orange-500 text-white border-orange-500' : 'bg-[#085041] text-white border-[#085041]') : 'bg-white text-gray-600 border-gray-200'}`}
          >
            {u === 'All' ? 'All Urgency' : u === 'Emergency' ? `🚨 Emergency (${emergencyCount})` : u === 'Urgent' ? `⚠️ Urgent (${urgentCount})` : 'Normal'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3 flex-wrap items-end">
        <div className="flex flex-col">
          <label className="text-[10px] font-medium text-gray-400 mb-1">STUDENT NO.</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="202311325" className="border border-gray-200 rounded-full px-4 py-2 text-[12px] w-[160px] focus:outline-none focus:border-[#085041]" />
        </div>
        <div className="ml-auto text-[11px] text-gray-500">
          Showing {filtered.length} / {appointments.length}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f6f8f7]">
                {['Student', 'Course', 'Concern', 'Schedule', 'Urgency', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-medium text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[12px] text-gray-400">
                    {showArchived ? 'No archived appointments' : 'No appointments'}
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className={`hover:bg-[#f6f8f7] transition-colors ${a.urgency === 'Emergency' ? 'bg-red-50/70 border-l-4 border-l-red-600' : a.urgency === 'Urgent' ? 'bg-orange-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-medium text-gray-900">{a.name}</p>
                      <p className="text-[11px] text-gray-500">{a.studentId}</p>
                    </td>
                    <td className="px-4 py-3 text-[12px]">{a.course} - {a.year}</td>
                    <td className="px-4 py-3"><ConcernBadge concern={a.concern} /></td>
                    <td className="px-4 py-3 text-[11px] text-gray-600">{a.date} {a.time}</td>
                    <td className="px-4 py-3"><UrgencyBadge urgency={a.urgency} /></td>
                    <td className="px-4 py-3"><Badge status={a.status} /></td>
                    <td className="px-4 py-3 text-right flex gap-1 justify-end">
                      <button onClick={() => setSelected(a)} className="text-[11px] font-medium px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-50">View</button>
                      {!showArchived ? (
                        <button onClick={() => handleArchive(a.id, 'archive')} className="text-[11px] font-medium px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100">Archive</button>
                      ) : (
                        <button onClick={() => handleArchive(a.id, 'restore')} className="text-[11px] font-medium px-3 py-1 rounded-full border border-[#085041] text-[#085041] hover:bg-[#E1F5EE]">Restore</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && !confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-sm border border-gray-200">
            <div className="flex justify-between mb-4">
              <p className="text-[13px] font-semibold">Appointment Details</p>
              <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">{Icon.x('w-3.5 h-3.5')}</button>
            </div>
            <div className="space-y-3 text-[12px]">
              <p><span className="text-gray-400">Student:</span> {selected.name} ({selected.studentId})</p>
              <p><span className="text-gray-400">Concern:</span> <ConcernBadge concern={selected.concern} /></p>
              <p><span className="text-gray-400">Schedule:</span> {selected.date} at {selected.time}</p>
              <p><span className="text-gray-400">Urgency:</span> <UrgencyBadge urgency={selected.urgency} /></p>
              {selected.reason && <p><span className="text-gray-400">Reason:</span> {selected.reason}</p>}
              <p><span className="text-gray-400">Status:</span> <Badge status={selected.status} /></p>
              {selected.urgency === 'Emergency' && (
                <p className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-[11px] font-medium">⚠️ Emergency case. Prioritize. If life-threatening, advise student to call NCMH 1553 / 911.</p>
              )}
            </div>
            {selected.status === 'Pending' && !showArchived && (
              <div className="flex gap-2 mt-5">
                <button onClick={() => setConfirmAction({ id: selected.id, action: 'Approved' })} className="flex-1 bg-[#085041] text-white text-[12px] py-2.5 rounded-full">Approve</button>
                <button onClick={() => setConfirmAction({ id: selected.id, action: 'Declined' })} className="flex-1 border border-gray-200 text-[12px] py-2.5 rounded-full">Decline</button>
              </div>
            )}
            <div className="mt-3">
              {!showArchived ? (
                <button onClick={() => handleArchive(selected.id, 'archive')} className="w-full border border-gray-200 text-gray-500 text-[12px] py-2.5 rounded-full">📦 Archive this appointment</button>
              ) : (
                <button onClick={() => handleArchive(selected.id, 'restore')} className="w-full bg-[#085041] text-white text-[12px] py-2.5 rounded-full">↩️ Restore to Active</button>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm text-center">
            <p className="text-[13px] font-semibold mb-1">{confirmAction.action} this appointment?</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setConfirmAction(null)} className="flex-1 border border-gray-200 py-2 rounded-full text-[12px]">Cancel</button>
              <button onClick={applyStatusChange} className="flex-1 bg-[#085041] text-white py-2 rounded-full text-[12px]">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}