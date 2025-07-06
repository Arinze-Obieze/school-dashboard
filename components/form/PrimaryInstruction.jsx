export default function PrimaryInstructions() {
  const handleDownload = () => {
    // You can implement PDF generation/download logic here
    const pdfUrl = '/forms/WACCPS PRIMARY FORM.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'WACCPS-PRIMARY-Form.pdf'; // Suggested filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-800 text-gray-300 border-l-4 border-blue-400 p-4  rounded relative">
      {/* Download Button - bottom Right */}
      <button
        onClick={handleDownload}
        className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download as PDF
      </button>

      <h2 className="text-xl font-bold mb-2 text-blue-300 pr-20">
        Training Requirements for Primary Examination
      </h2>
      
      <p className="mb-2">
        The primary examination is the first step in the WACCPS's examination process. It 
        assesses candidates' foundational knowledge in clinical physiology sciences.
      </p>
      
      <ul className="list-decimal list-inside mb-2 ml-4 space-y-1">
        <li>
          <b>Eligibility:</b> Candidates must meet specific requirements, including a 
          relevant degree and completion of a certified training program..
        </li>
        <li>
          <b>Examination format:</b> The examination consist of multiple-choice questions,
          short-answer questions, and/or practical/clinical components.
        </li>
        </ul>

      <h3 className="mb-2 mt-6 font-semibold text-lg">
        Submission
      </h3>
      
      <ul className="list-disc list-inside mb-2 ml-4 space-y-1">
        <li>Submit completed form + required documents</li>
        <li>
          Application Fee: All fees are Payable via WACCPS website payment portal.
        </li>
      </ul>

      <h3 className="mb-2 mt-6 font-semibold text-lg">
        NOTE:
      </h3>

      <ul className="list-disc list-inside mb-2 ml-4 space-y-1">
        <li>All payments made to the West African College of Clinical Physiology Sciences 
          (WACCPS) are non-refundable. This policy applies to all types of payments, including 
          application fees, course registration fees, examination fees, and any other charges. 
          Submit completed form + required documents</li>
       </ul>

      <div className="mt-4 text-sm text-gray-200 space-y-1">
        <p className="flex items-start">
          <span className="mr-1">•</span> Incomplete forms will be rejected.
        </p>
        <p className="flex items-start">
          <span className="mr-1">•</span> Successful candidates will receive an exam date via email.
        </p>
        <p className="flex items-start">
          <span className="mr-1">•</span> Contact: 
          <a href="mailto:info.waccps@gmail.com" className="text-blue-400 underline ml-1">
            info.waccps@gmail.com
          </a> 
          / 07061543295 for inquiries.
        </p>
      </div>
    </div>
  );
}
