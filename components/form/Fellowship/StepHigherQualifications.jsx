'use client'

export default function StepHigherQualifications({ 
  formData, 
  handleChange, 
  handleArrayChange, 
  addArrayItem, 
  removeArrayItem 
}) {
  // Template for additional qualifications
  const qualificationTemplate = { degree: '', institution: '', year: '' };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-400 mb-4">SECTION B: HIGHER QUALIFICATIONS & SPECIALIZATION</h2>

      {/* MWCCPS Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">MWCCPS Award Year</label>
          <input
            type="text"
            name="mwccpsAwardYear"
            value={formData.mwccpsAwardYear}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Institution</label>
          <input
            type="text"
            name="mwccpsInstitution"
            value={formData.mwccpsInstitution}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
      </div>

      {/* Advanced Training */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Advanced Training Institution</label>
          <input
            type="text"
            name="advancedTrainingInstitution"
            value={formData.advancedTrainingInstitution}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Duration</label>
          <input
            type="text"
            name="advancedTrainingDuration"
            value={formData.advancedTrainingDuration}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
      </div>

      {/* Specialization Area */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1">Specialization Area</label>
        <input
          type="text"
          name="specializationArea"
          value={formData.specializationArea}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          required
        />
      </div>

      {/* Certificate Obtained */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1">Certificate Obtained</label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="advancedCertificateObtained"
              checked={formData.advancedCertificateObtained === true}
              onChange={() => handleChange({ target: { name: 'advancedCertificateObtained', value: true } })}
              className="form-radio text-blue-500"
              required
            />
            <span className="ml-2 text-gray-300">Yes</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="advancedCertificateObtained"
              checked={formData.advancedCertificateObtained === false}
              onChange={() => handleChange({ target: { name: 'advancedCertificateObtained', value: false } })}
              className="form-radio text-blue-500"
            />
            <span className="ml-2 text-gray-300">No</span>
          </label>
        </div>
      </div>

      {/* Additional Qualifications */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-300">Additional Relevant Qualifications</label>
          <button
            type="button"
            onClick={() => addArrayItem('additionalQualifications', qualificationTemplate)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            Add Qualification
          </button>
        </div>

        {formData.additionalQualifications.map((qual, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-700 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Degree/Diploma</label>
              <input
                type="text"
                value={qual.degree}
                onChange={(e) => handleArrayChange('additionalQualifications', index, 'degree', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Institution</label>
              <input
                type="text"
                value={qual.institution}
                onChange={(e) => handleArrayChange('additionalQualifications', index, 'institution', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              />
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">Year</label>
                <input
                  type="text"
                  value={qual.year}
                  onChange={(e) => handleArrayChange('additionalQualifications', index, 'year', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('additionalQualifications', index)}
                  className="text-red-400 hover:text-red-300 p-1"
                  aria-label="Remove qualification"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}