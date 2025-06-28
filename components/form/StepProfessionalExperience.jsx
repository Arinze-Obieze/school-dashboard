import React from 'react';

export default function StepProfessionalExperience({ formData, handleChange, handleArrayChange, addArrayItem, removeArrayItem }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-300 border-b border-gray-700 pb-2">Professional Experience</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="currentInstitution" className="block text-sm font-medium text-gray-300">
            Current Institution
          </label>
          <input
            type="text"
            name="currentInstitution"
            id="currentInstitution"
            value={formData.currentInstitution}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="currentPosition" className="block text-sm font-medium text-gray-300">
            Current Position
          </label>
          <input
            type="text"
            name="currentPosition"
            id="currentPosition"
            value={formData.currentPosition}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="employmentFrom" className="block text-sm font-medium text-gray-300">
            From
          </label>
          <input
            type="date"
            name="employmentFrom"
            id="employmentFrom"
            value={formData.employmentFrom}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="employmentTo" className="block text-sm font-medium text-gray-300">
            To
          </label>
          <input
            type="date"
            name="employmentTo"
            id="employmentTo"
            value={formData.employmentTo}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="totalExperience" className="block text-sm font-medium text-gray-300">
            Total Years of Clinical Physiology Experience
          </label>
          <input
            type="number"
            name="totalExperience"
            id="totalExperience"
            value={formData.totalExperience}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
          />
        </div>
      </div>
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Hospitals/Centers Worked</h3>
        {formData.hospitalsWorked.map((hospital, index) => (
          <div key={index} className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-4">
            <div>
              <label htmlFor={`hospital-name-${index}`} className="block text-sm font-medium text-gray-300">
                Hospital/Center Name
              </label>
              <input
                type="text"
                id={`hospital-name-${index}`}
                value={hospital.name}
                onChange={(e) => handleArrayChange('hospitalsWorked', index, 'name', e.target.value)}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
              />
            </div>
            <div>
              <label htmlFor={`hospital-duration-${index}`} className="block text-sm font-medium text-gray-300">
                Duration
              </label>
              <input
                type="text"
                id={`hospital-duration-${index}`}
                value={hospital.duration}
                onChange={(e) => handleArrayChange('hospitalsWorked', index, 'duration', e.target.value)}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
              />
            </div>
            {index > 0 && (
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeArrayItem('hospitalsWorked', index)}
                  className="inline-flex items-center px-3 py-1 border border-red-500 text-sm font-medium rounded-md text-red-400 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('hospitalsWorked', { name: '', duration: '' })}
          className="inline-flex items-center px-3 py-1 border border-blue-500 text-sm font-medium rounded-md text-blue-400 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Another Hospital/Center
        </button>
      </div>
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Supervised Clinical Practice</h3>
        <div className="flex items-center">
          <input
            id="supervisedPractice"
            name="supervisedPractice"
            type="checkbox"
            checked={formData.supervisedPractice}
            onChange={handleChange}
            className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-600 rounded"
          />
          <label htmlFor="supervisedPractice" className="ml-2 block text-sm text-gray-300">
            Have you completed supervised practice?
          </label>
        </div>
        {formData.supervisedPractice && (
          <div className="mt-4">
            <label htmlFor="supervisorDetails" className="block text-sm font-medium text-gray-300">
              Supervisor Details (Name, Duration, Institution)
            </label>
            <textarea
              id="supervisorDetails"
              name="supervisorDetails"
              rows={3}
              value={formData.supervisorDetails}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            />
          </div>
        )}
      </div>
    </div>
  );
}
