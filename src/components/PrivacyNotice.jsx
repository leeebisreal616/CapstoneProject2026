export default function PrivacyNotice({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-[#f4f9f7] border border-[#d1e5de] rounded-xl p-3.5 mb-4">
        <p className="text-[11px] text-gray-600 leading-relaxed">
          By submitting this form, you consent to the collection and processing of your personal data by the CvSU Imus GCO in accordance with the Data Privacy Act of 2012 (RA 10173). Your information will be kept confidential and used only for counseling and guidance purposes.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-[15px] font-semibold text-gray-900 mb-3 pb-3 border-b border-gray-100">Data Privacy Notice</p>
      <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
        The Guidance and Counseling Office of Cavite State University, Imus Campus, is committed to protecting your personal information in compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) and its Implementing Rules and Regulations.
      </p>
      <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
        Personal and sensitive information collected through this portal, including but not limited to academic records, family background, and health information, shall be used exclusively for guidance, counseling, and student welfare purposes.
      </p>
      <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
        Access to your records is limited to authorized GCO personnel. Your information will not be disclosed to third parties without your consent, except when required by law or in cases involving risk of harm to yourself or others.
      </p>
      <p className="text-[13px] text-gray-600 leading-relaxed">
        For concerns regarding your personal data, you may contact the CvSU Imus Data Protection Office or the Guidance and Counseling Office directly.
      </p>
    </div>
  )
}