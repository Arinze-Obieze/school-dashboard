import React, { useState } from 'react';

export default function StepAttachmentsDeclaration({ formData, handleChange, handleFileChange, declarationChecked, setDeclarationChecked, declarationDate, setDeclarationDate }) {
  return (
    <div className="space-y-8 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-blue-400 mb-2">Document Submission</h2>
        <p className="text-gray-400">Upload all required documents to complete your application</p>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-blue-300 mb-6 pb-2 border-b border-gray-700 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Required Attachments
          <span className="text-red-500 ml-1">*</span>
        </h3>

        <div className="space-y-5">
          {[
            { id: 'degreeCertificates', label: 'Degree Certificates' },
            { id: 'trainingCertificate', label: 'Training Certificate' },
            { id: 'workExperienceProof', label: 'Work Experience Proof' },
            { id: 'cpdCertificates', label: 'CPD Certificates' },
            { id: 'passportPhoto', label: 'Passport Photo' },
          ].map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <label htmlFor={item.id} className="block text-sm font-medium text-gray-300 mb-1">
                  {item.label}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id={item.id}
                    name={item.id}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-blue-400 transition-colors">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-gray-300 text-sm">
                        {formData[item.id]?.name || 'Choose file...'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">PDF, JPG, PNG</span>
                  </div>
                </div>
              </div>
              {formData[item.id] && (
                <div className="flex items-center justify-center sm:justify-start bg-green-900/30 text-green-400 rounded-lg px-4 py-3 sm:w-32">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Uploaded
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-blue-300 mb-4 pb-2 border-b border-gray-700">
          Declaration
        </h3>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="declaration"
                name="declaration"
                type="checkbox"
                checked={declarationChecked}
                onChange={e => setDeclarationChecked(e.target.checked)}
                className="h-5 w-5 text-blue-500 focus:ring-blue-400 border-gray-600 rounded"
                required
              />
            </div>
            <label htmlFor="declaration" className="ml-3 text-gray-300">
              <span className="text-red-500">*</span> I hereby declare that all information provided in this application is true, complete, and accurate to the best of my knowledge. I understand that any false statements or misrepresentations may result in the rejection of my application or termination of membership if discovered later. I agree to abide by the rules, regulations, and ethical standards of the West African College of Clinical Physiology Sciences (WACCPS).
            </label>
          </div>

          <div className="mt-4">
            <label htmlFor="declarationDate" className="block text-sm font-medium text-gray-300 mb-1">
              Declaration Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                id="declarationDate"
                name="declarationDate"
                value={declarationDate}
                onChange={e => setDeclarationDate(e.target.value)}
                className="block w-full bg-gray-800 border border-gray-700 
                rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2
                 focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 
          hover:to-blue-600 text-white font-bold py-3.5 px-6 rounded-lg 
          shadow-md hover:shadow-lg cursor-pointer
          transition-all duration-200 flex items-center justify-center"
        >
          Submit Application & Pay
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}