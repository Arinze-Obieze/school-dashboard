import React from 'react';

export default function StepAlternativeRoute({ formData, handleChange, handleArrayChange, addArrayItem, removeArrayItem }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-300 border-b border-gray-700 pb-2">Alternative Route (For Candidates Without Formal Training)</h2>
      {/* Alternative Route Fields */}
      <p className="text-gray-400 italic">Only complete this section if you're applying via the experience pathway (5+ years of experience)</p>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="experienceProof" className="block text-sm font-medium text-gray-300">
            Proof of 5+ Years of Experience (Employment Letters/Service Records)
          </label>
          <input
            type="file"
            name="experienceProof"
            id="experienceProof"
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Continuous Professional Development (CPD)</h3>
          {formData.conferencesAttended.map((conference, index) => (
            <div key={index} className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-4">
              <div>
                <label htmlFor={`conference-name-${index}`} className="block text-sm font-medium text-gray-300">
                  Conference/Workshop Name
                </label>
                <input
                  type="text"
                  id={`conference-name-${index}`}
                  value={conference.name}
                  onChange={(e) => handleArrayChange('conferencesAttended', index, 'name', e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                />
              </div>
              <div>
                <label htmlFor={`conference-year-${index}`} className="block text-sm font-medium text-gray-300">
                  Year Attended
                </label>
                <input
                  type="number"
                  id={`conference-year-${index}`}
                  value={conference.year}
                  onChange={(e) => handleArrayChange('conferencesAttended', index, 'year', e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                />
              </div>
              {index > 0 && (
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeArrayItem('conferencesAttended', index)}
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
            onClick={() => addArrayItem('conferencesAttended', { name: '', year: '' })}
            className="inline-flex items-center px-3 py-1 border border-blue-500 text-sm font-medium rounded-md text-blue-400 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Another Conference/Workshop
          </button>
        </div>
        <div>
          <label htmlFor="cpdCertificates" className="block text-sm font-medium text-gray-300">
            Attach CPD Certificates
          </label>
          <input
            type="file"
            name="cpdCertificates"
            id="cpdCertificates"
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
          />
        </div>
      </div>
    </div>
  );
}
