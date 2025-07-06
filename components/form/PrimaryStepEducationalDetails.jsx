import React from 'react';

export default function PrimaryStepEducationalQualifications({ formData, handleChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-300 border-b border-gray-700 pb-2">Institution Details:</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="nameofInstitution" className="block text-sm font-medium text-gray-300">
            Name of Institution
          </label>
          <input
            type="text"
            name="nameofInstitution"
            id="nameofInstitution"
            value={formData.nameofInstitution}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>
        <div>
          <label htmlFor="GraduationYear" className="block text-sm font-medium text-gray-300">
            Year of Graduation
          </label>
          <input
            type="number"
            name="graduationYear"
            id="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="courseSelection" className="block text-sm font-medium text-gray-300">
            Course Selection
          </label>
          <input
            type="text"
            name="courseSelection"
            id="courseSelection"
            value={formData.courseSelection}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>
        <div className="sm:col-span-2 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Career Intentions</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <input
                id="CertificateObtained"
                name="CertificateObtained"
                type="checkbox"
                checked={formData.CertificateObtained}
                onChange={handleChange}
                className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-600 rounded"
              />
              <label htmlFor="CertificateObtained" className="ml-2 block text-sm text-gray-300">
                Do you intend to practice abroad after certification?
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
