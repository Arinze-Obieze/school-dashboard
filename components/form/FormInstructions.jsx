import { FaDownload, FaEnvelope, FaPhone } from 'react-icons/fa';

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
  downloadFilename = "WACCPS-Form.pdf",
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
    <div className={`bg-gray-800 text-gray-300 border-l-4 border-${borderColor} p-4 rounded relative`}>
      {/* Download Button - bottom Right */}
      <button
        onClick={handleDownload}
        className={`absolute bottom-4 right-4 bg-${buttonColor} hover:bg-${buttonColor.replace('00', '00')} text-white font-medium py-2 px-4 rounded flex items-center`}
      >
        <FaDownload className="mr-2" />
        Download as PDF
      </button>

      <h2 className={`text-xl font-bold mb-2 text-${textColor} pr-20`}>
        {title}
      </h2>
      
      <p className="mb-2">
        {description}
      </p>
      
      {trainingRequirements.length > 0 && (
        <>
          <ul className="list-decimal list-inside mb-2 ml-4 space-y-1">
            {trainingRequirements.map((item, index) => (
              <li key={index}>
                {item.includes(':') ? (
                  <>
                    <b>{item.split(':')[0]}:</b> {item.split(':').slice(1).join(':')}
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
          <h3 className="mb-2 mt-6 font-semibold text-lg">
            {alternativeRouteTitle}
          </h3>
          
          <p className="mb-2">
            {alternativeRouteDescription}
          </p>
          
          <ul className="list-decimal list-inside mb-2 ml-4 space-y-1">
            {alternativeRouteRequirements.map((item, index) => (
              <li key={index}>
                {item.includes(':') ? (
                  <>
                    <b>{item.split(':')[0]}:</b> {item.split(':').slice(1).join(':')}
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
          <h3 className="mb-2 mt-6 font-semibold text-lg">
            Examination Format
          </h3>
          
          <ul className="list-disc list-inside mb-2 ml-4 space-y-1">
            {examinationFormat.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {submissionRequirements.length > 0 && (
        <>
          <h3 className="mb-2 mt-6 font-semibold text-lg">
            Submission
          </h3>
          
          <ul className="list-disc list-inside mb-2 ml-4 space-y-1">
            {submissionRequirements.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {notes.length > 0 && (
        <div className="mt-4 text-sm text-gray-200 space-y-1">
          {notes.map((note, index) => (
            <p key={index} className="flex items-start">
              <span className="mr-1">•</span> {note}
            </p>
          ))}
          <p className="flex items-start">
            <span className="mr-1">•</span> Contact: 
            <a href={`mailto:${contactEmail}`} className={`text-${textColor} underline ml-1`}>
              <FaEnvelope className="inline mr-1" /> {contactEmail}
            </a> 
            / <FaPhone className="inline mx-1" /> {contactPhone} for inquiries.
          </p>
        </div>
      )}
    </div>
  );
}