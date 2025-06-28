import React from 'react';

export default function StepEducationalQualifications({ formData, handleChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-300 border-b border-gray-700 pb-2">Educational Qualifications</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="degreeInstitution" className="block text-sm font-medium text-gray-300">
            Degree Institution
          </label>
          <input
            type="text"
            name="degreeInstitution"
            id="degreeInstitution"
            value={formData.degreeInstitution}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>
        <div>
          <label htmlFor="degreeYear" className="block text-sm font-medium text-gray-300">
            Year Obtained
          </label>
          <input
            type="number"
            name="degreeYear"
            id="degreeYear"
            value={formData.degreeYear}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="degreeSpecialization" className="block text-sm font-medium text-gray-300">
            Degree Specialization
          </label>
          <input
            type="text"
            name="degreeSpecialization"
            id="degreeSpecialization"
            value={formData.degreeSpecialization}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>
        <div className="sm:col-span-2 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Clinical Physiology Training Program</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="trainingProgramInstitution" className="block text-sm font-medium text-gray-300">
                WACCPS Institution/Center
              </label>
              <input
                type="text"
                name="trainingProgramInstitution"
                id="trainingProgramInstitution"
                value={formData.trainingProgramInstitution}
                onChange={handleChange}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
              />
            </div>
            <div>
              <label htmlFor="trainingDuration" className="block text-sm font-medium text-gray-300">
                Duration
              </label>
              <input
                type="text"
                name="trainingDuration"
                id="trainingDuration"
                value={formData.trainingDuration}
                onChange={handleChange}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <input
                id="trainingCertificateObtained"
                name="trainingCertificateObtained"
                type="checkbox"
                checked={formData.trainingCertificateObtained}
                onChange={handleChange}
                className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-600 rounded"
              />
              <label htmlFor="trainingCertificateObtained" className="ml-2 block text-sm text-gray-300">
                Certificate Obtained
              </label>
            </div>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="degreeCertificates" className="block text-sm font-medium text-gray-300">
            Attach Certified Copies of Degree Certificates
          </label>
          <input
            type="file"
            name="degreeCertificates"
            id="degreeCertificates"
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>
      </div>
    </div>
  );
}
