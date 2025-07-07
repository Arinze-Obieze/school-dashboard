'use client'
import { FaPaperclip, FaCheck, FaUpload } from 'react-icons/fa';

export default function StepAttachmentsDeclaration({ 
  formData, 
  handleChange, 
  handleFileChange 
}) {
  const attachmentFields = [
    { id: 'mwccpsCertificate', label: 'MWCCPS Certificate' },
    { id: 'trainingCertificates', label: 'Professional Training Certificates' },
    { id: 'employmentLetters', label: 'Employment Verification Letters' },
    { id: 'publishedPapers', label: 'Published Papers (Minimum 2)' },
    { id: 'conferenceCertificates', label: 'Conference Certificates' },
    { id: 'passportPhotos', label: 'Passport Photos (2)' },
    { id: 'feeReceipt', label: 'Application Fee Receipt' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-400 mb-4">SECTION G: ATTACHMENTS & DECLARATION</h2>

      {/* Modified Attachments Section */}
      <div className="mb-8">
        <h3 className="text-md font-medium text-gray-300 mb-4 flex items-center">
          <FaPaperclip className="mr-2 text-blue-300" />
          Required Documents
        </h3>
        
        <div className="space-y-4">
          {attachmentFields.map((field) => (
            <div key={field.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-300 mb-1">
                  {field.label}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id={field.id}
                    name={field.id}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg p-3 hover:border-blue-400 transition-colors">
                    <div className="flex items-center">
                      <FaUpload className="text-blue-400 mr-2" />
                      <span className="text-gray-300 text-sm">
                        {formData[field.id]?.name || 'Choose file...'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">PDF, JPG, PNG</span>
                  </div>
                </div>
              </div>
              {formData[field.id] && (
                <div className="flex items-center justify-center sm:justify-start bg-green-900/30 text-green-400 rounded-lg px-4 py-3 sm:w-32">
                  <FaCheck className="mr-1" />
                  Uploaded
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Unchanged Declaration Section */}
      <div className="bg-gray-800 p-6 rounded-lg border border-blue-500">
        <h3 className="text-md font-medium text-blue-300 mb-4 flex items-center">
          <FaPaperclip className="mr-2" />
          Declaration
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-300 mb-4">
            I confirm that all information provided in this application is accurate and complete to the best of my knowledge. 
            I understand that any false statements or misrepresentations may result in disqualification from the examination 
            or revocation of any certification granted.
          </p>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="declarationChecked"
                name="declarationChecked"
                type="checkbox"
                checked={formData.declarationChecked}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500"
                required
              />
            </div>
            <label htmlFor="declarationChecked" className="ml-3 block text-sm text-gray-300">
              I agree to the above declaration
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="declarationDate" className="block text-sm font-medium text-gray-300 mb-1">
            Date of Declaration
          </label>
          <input
            type="date"
            id="declarationDate"
            name="declarationDate"
            value={formData.declarationDate}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
      </div>

      {/* Unchanged Notes Section */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-blue-300 mb-2">Submission Notes:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>All documents must be clear and legible</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Files should be in PDF or JPG/PNG format</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Maximum file size per attachment: 5MB</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Incomplete applications will not be processed</span>
          </li>
        </ul>
      </div>
    </div>
  );
}