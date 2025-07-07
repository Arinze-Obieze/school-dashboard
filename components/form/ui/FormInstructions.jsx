'use client'
import { FaDownload, FaEnvelope, FaPhone, FaExclamationTriangle } from 'react-icons/fa';

export default function FormInstructions({
  title = "Training Requirements",
  description = "The West African College of Clinical Physiology Sciences (WACCPS) requires candidates to undergo structured training programs before sitting for the examination.",
  borderColor = "blue-400",
  buttonColor = "blue-600",
  textColor = "blue-300",
  trainingRequirements = [],
  alternativeRouteTitle = "Alternative Route",
  alternativeRouteDescription = "Alternatively, candidates with significant experience may be eligible to sit for the examination.",
  alternativeRouteRequirements = [],
  examinationFormat = [],
  submissionRequirements = [],
  notes = [],
  contactEmail = "info.waccps@gmail.com",
  contactPhone = "07061543295",
  downloadFilename
}) {
  const handleDownload = () => {
    const pdfUrl = `/forms/${downloadFilename}`;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`bg-gray-800 text-gray-300 border-l-4 border-${borderColor} p-6 rounded-lg mb-8`}>
      <div className="flex flex-col h-full">
        {/* Main Content */}
        <div className="flex-grow">
          <h2 className={`text-xl font-bold mb-3 text-${textColor}`}>
            {title}
          </h2>
          
          <p className="mb-4">
            {description}
          </p>
          
          {/* Non-refundable Payment Notice */}
          <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-4 mb-6 rounded-r">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-yellow-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-300 mb-1">*NOTE*</h4>
                <p className="text-sm text-yellow-200">
                  All payments made to the West African College of Clinical Physiology Sciences (WACCPS) are non-refundable. 
                  This policy applies to all types of payments, including application fees, course registration fees, 
                  examination fees, and any other charges. By making a payment to WACCPS, you acknowledge and agree to this policy.
                </p>
              </div>
            </div>
          </div>
          
          {trainingRequirements.length > 0 && (
            <>
              <h3 className="font-semibold mb-2">Training Requirements</h3>
              <ul className="list-decimal list-inside mb-4 ml-4 space-y-1">
                {trainingRequirements.map((item, index) => (
                  <li key={index} className="mb-1">
                    {item.includes(':') ? (
                      <>
                        <span className="font-medium">{item.split(':')[0]}:</span> {item.split(':').slice(1).join(':')}
                      </>
                    ) : (
                      item
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {alternativeRouteRequirements.length > 0 && (
            <>
              <h3 className="font-semibold mb-2 mt-6">
                {alternativeRouteTitle}
              </h3>
              
              <p className="mb-2">
                {alternativeRouteDescription}
              </p>
              
              <ul className="list-decimal list-inside mb-4 ml-4 space-y-1">
                {alternativeRouteRequirements.map((item, index) => (
                  <li key={index} className="mb-1">
                    {item.includes(':') ? (
                      <>
                        <span className="font-medium">{item.split(':')[0]}:</span> {item.split(':').slice(1).join(':')}
                      </>
                    ) : (
                      item
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {examinationFormat.length > 0 && (
            <>
              <h3 className="font-semibold mb-2 mt-6">
                Examination Format
              </h3>
              
              <ul className="list-disc list-inside mb-4 ml-4 space-y-1">
                {examinationFormat.map((item, index) => (
                  <li key={index} className="mb-1">{item}</li>
                ))}
              </ul>
            </>
          )}

          {submissionRequirements.length > 0 && (
            <>
              <h3 className="font-semibold mb-2 mt-6">
                Submission Requirements
              </h3>
              
              <ul className="list-disc list-inside mb-4 ml-4 space-y-1">
                {submissionRequirements.map((item, index) => (
                  <li key={index} className="mb-1">{item}</li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-6 text-sm">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a 
                href={`mailto:${contactEmail}`} 
                className={`text-${textColor} hover:text-${textColor.replace('00', '00')} flex items-center`}
              >
                <FaEnvelope className="mr-2" /> {contactEmail}
              </a>
              <div className={`text-${textColor} flex items-center`}>
                <FaPhone className="mr-2" /> {contactPhone}
              </div>
            </div>
          </div>
        </div>

        {/* Download Button - Bottom Right */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleDownload}
            className={`bg-${buttonColor} hover:bg-${buttonColor.replace('00', '00')} text-white font-medium py-2 px-4 rounded flex items-center`}
          >
            <FaDownload className="mr-2" />
            Download as PDF
          </button>
        </div>
      </div>
    </div>
  );
}