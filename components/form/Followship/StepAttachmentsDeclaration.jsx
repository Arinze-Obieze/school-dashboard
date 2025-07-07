'use client'
import { FaPaperclip, FaFileUpload, FaSignature, FaCheckSquare } from 'react-icons/fa';

export default function StepAttachmentsDeclaration({ 
  formData, 
  handleChange, 
  handleFileChange 
}) {
  const attachmentFields = [
    {
      id: 'mwccpsCertificate',
      label: 'MWCCPS Certificate',
      required: true,
      icon: <FaPaperclip className="mr-2 text-blue-300" />
    },
    {
      id: 'trainingCertificates',
      label: 'Professional Training Certificates',
      required: true,
      icon: <FaPaperclip className="mr-2 text-blue-300" />
    },
    {
      id: 'employmentLetters',
      label: 'Employment Verification Letters',
      required: true,
      icon: <FaPaperclip className="mr-2 text-blue-300" />
    },
    {
      id: 'publishedPapers',
      label: 'Published Papers (Minimum 2)',
      required: true,
      icon: <FaPaperclip className="mr-2 text-blue-300" />
    },
    {
      id: 'conferenceCertificates',
      label: 'Conference Certificates',
      required: true,
      icon: <FaPaperclip className="mr-2 text-blue-300" />
    },
    {
      id: 'passportPhotos',
      label: 'Passport Photos (2 copies)',
      required: true,
      icon: <FaPaperclip className="mr-2 text-blue-300" />
    },
    {
      id: 'feeReceipt',
      label: 'Application Fee Receipt',
      required: true,
      icon: <FaPaperclip className="mr-2 text-blue-300" />
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-400 mb-4">SECTION G: ATTACHMENTS & DECLARATION</h2>

      {/* Attachments Section */}
      <div className="mb-8">
        <h3 className="text-md font-medium text-gray-300 mb-4 flex items-center">
          <FaFileUpload className="mr-2 text-blue-300" />
          Required Documents
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {attachmentFields.map((field) => (
            <div key={field.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                {field.icon}
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              <div className="flex items-center">
                <input
                  type="file"
                  id={field.id}
                  name={field.id}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700
                    file:cursor-pointer"
                  required={field.required}
                />
                {formData[field.id] && (
                  <span className="ml-2 text-sm text-green-400 flex items-center">
                    <FaCheckSquare className="mr-1" />
                    Uploaded
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Declaration Section */}
      <div className="bg-gray-800 p-6 rounded-lg border border-blue-500">
        <h3 className="text-md font-medium text-blue-300 mb-4 flex items-center">
          <FaSignature className="mr-2" />
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