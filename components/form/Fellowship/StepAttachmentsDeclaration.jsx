'use client'
import { FaPaperclip, FaCheck, FaUpload, FaExclamationTriangle } from 'react-icons/fa';
import { useState } from 'react';
import { useFileValidation } from '@/hooks/useFileValidation';
export default function StepAttachmentsDeclaration({ 
  formData, 
  handleChange, 
  handleFileChange,
  handleFileUpdate // New prop
}) {
  const { errors, warnings, validateSingleFile, clearFieldError } = useFileValidation();
  const [focusedField, setFocusedField] = useState(null);

  const attachmentFields = [
    { id: 'mwccpsCertificate', label: 'MWCCPS Certificate', category: 'document' },
    { id: 'trainingCertificates', label: 'Professional Training Certificates', category: 'document' },
    { id: 'employmentLetters', label: 'Employment Verification Letters', category: 'document' },
    { id: 'publishedPapers', label: 'Published Papers (Minimum 2)', category: 'document', multiple: true },
    { id: 'conferenceCertificates', label: 'Conference Certificates', category: 'document' },
    { id: 'passportPhotos', label: 'Passport Photos (2)', category: 'image', multiple: true },
  ];

  const handleAddFiles = (e, fieldId) => {
    const { files } = e.target;
    // Clear previous errors
    clearFieldError(fieldId);

    if (files && files.length > 0) {
      const field = attachmentFields.find(f => f.id === fieldId);
      const newFiles = Array.from(files);
      let validFiles = [];

      // Validate each new file
      for (const file of newFiles) {
        const isValid = validateSingleFile(file, fieldId, { 
          category: field?.category || 'document',
          maxSize: field?.category === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
        });
        if (isValid) validFiles.push(file);
      }

      if (validFiles.length > 0) {
        if (field.multiple && handleFileUpdate) {
            // Append to existing files
            const currentFiles = Array.isArray(formData[fieldId]) ? formData[fieldId] : [];
            handleFileUpdate(fieldId, [...currentFiles, ...validFiles]);
        } else if (handleFileUpdate) {
            // Replace (single file) using direct update
            handleFileUpdate(fieldId, validFiles[0]);
        } else {
             // Fallback
             handleFileChange(e);
        }
      }
      
      // Reset input to allow adding same file again if needed
      e.target.value = '';
    }
  };

  const removeFile = (fieldId, index) => {
      if (handleFileUpdate) {
          const currentFiles = Array.isArray(formData[fieldId]) ? formData[fieldId] : [];
          handleFileUpdate(fieldId, currentFiles.filter((_, i) => i !== index));
      }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-400 mb-4">SECTION G: ATTACHMENTS & DECLARATION</h2>

      {/* Modified Attachments Section */}
      <div className="mb-8">
        <h3 className="text-md font-medium text-gray-300 mb-4 flex items-center">
          <FaPaperclip className="mr-2 text-blue-300" />
          Required Documents
        </h3>
        
        <div className="space-y-6">
          {attachmentFields.map((field) => (
            <div key={field.id} className="flex flex-col gap-2">
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-300">
                  {field.label}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                
                {/* File List for Multiple Files */}
                {field.multiple && Array.isArray(formData[field.id]) && formData[field.id].length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                        {formData[field.id].map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
                                <div className="flex items-center overflow-hidden">
                                    <FaCheck className="text-green-400 mr-2 flex-shrink-0" />
                                    <span className="text-sm text-gray-200 truncate">{file.name}</span>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => removeFile(field.id, index)}
                                    className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <span className="sr-only">Remove</span>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative">
                  {/* Hidden Input */}
                  <input
                    type="file"
                    id={field.id}
                    name={field.id}
                    // For single files, we keep standard behavior. For multiple, we allow re-selection (appending).
                    multiple={field.multiple} 
                    onChange={(e) => handleAddFiles(e, field.id)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    // Required only if empty
                    required={!formData[field.id] || (Array.isArray(formData[field.id]) && formData[field.id].length === 0)}
                  />
                  
                  {/* Custom Upload Button / Display */}
                  <div className={`flex items-center justify-between rounded-lg p-3 transition-colors border ${
                    errors[field.id] 
                      ? 'bg-red-900/20 border-red-500' 
                      : 'bg-gray-700 border-gray-600 hover:border-blue-400'
                  }`}>
                    <div className="flex items-center">
                      <FaUpload className={`mr-2 ${errors[field.id] ? 'text-red-400' : 'text-blue-400'}`} />
                      <span className={`text-sm ${errors[field.id] ? 'text-red-300' : 'text-gray-300'}`}>
                        {field.multiple 
                            ? "Click to add file(s)" 
                            : (formData[field.id]?.name || 'Choose file...')}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {field.category === 'image' ? 'JPG, PNG' : 'PDF, DOC, DOCX'}
                    </span>
                  </div>
                </div>
                
                {/* Validation Error */}
                {errors[field.id] && (
                  <div className="mt-1 flex items-start gap-2 bg-red-900/20 border border-red-500 rounded p-2">
                    <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-red-300">
                      {errors[field.id]}
                    </div>
                  </div>
                )}
                
                {/* Helper text */}
                {field.multiple && (
                     <p className="text-xs text-gray-500">
                        You can add files one by one. {field.id === 'publishedPapers' ? 'At least 2 required.' : '2 required.'}
                     </p>
                )}

                {/* Validation Success Badge for Single Files (Multi-files show checkmark per file) */}
                {!field.multiple && formData[field.id] && !errors[field.id] && (
                     <div className="mt-1 flex items-center text-green-400 text-xs">
                        <FaCheck className="mr-1" /> Validated
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