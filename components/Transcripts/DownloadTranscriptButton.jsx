// components/DownloadTranscriptButton.jsx
import React, { useState } from 'react';
import { FaFileDownload, FaSpinner } from 'react-icons/fa';
import { PDFDownloadLink } from '@react-pdf/renderer';
import TranscriptPDF from './TranscriptPDF';

const DownloadTranscriptButton = ({ exam, student, variant = 'default' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyles = {
    default: 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
  };

  return (
    <PDFDownloadLink
      document={<TranscriptPDF exam={exam} student={student} />}
      fileName={`WACCPS_Transcript_${exam.quiz_id}_${student?.uid || 'student'}.pdf`}
      style={{ textDecoration: 'none' }}
    >
      {({ blob, url, loading, error }) => (
        <button
          className={`flex items-center justify-center px-4 py-2.5 rounded-lg transition-all duration-300 ${
            buttonStyles[variant]
          } ${isHovered ? 'transform hover:scale-[1.02] shadow-lg' : ''} ${
            loading ? 'opacity-70 cursor-wait' : ''
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              <span className="text-white">Generating PDF...</span>
            </>
          ) : (
            <>
              <FaFileDownload className="mr-2" />
              <span className="text-white font-medium">
                Download Official Transcript
              </span>
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default DownloadTranscriptButton;