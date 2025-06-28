import React from 'react';

export default function StepExaminationDetails({ formData, handleChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-300 border-b border-gray-700 pb-2">Examination Details</h2>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">Preferred Examination Center</label>
          <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {['Lagos', 'Abuja', 'Accra', 'Rivers', 'Anambra', 'Other'].map((center) => (
              <div key={center} className="flex items-center">
                <input
                  id={`exam-center-${center.toLowerCase()}`}
                  name="examCenter"
                  type="radio"
                  value={center}
                  checked={formData.examCenter === center}
                  onChange={handleChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-600"
                />
                <label htmlFor={`exam-center-${center.toLowerCase()}`} className="ml-3 block text-sm text-gray-300">
                  {center}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Examination Format Acknowledgment</h3>
          <p className="text-gray-400 mb-4">I understand the exam includes:</p>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="understandsWritten"
                name="understandsWritten"
                type="checkbox"
                checked={formData.understandsWritten}
                onChange={handleChange}
                className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-600 rounded"
                required
              />
              <label htmlFor="understandsWritten" className="ml-2 block text-sm text-gray-300">
                Written (MCQ/Short Answer)
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="understandsPractical"
                name="understandsPractical"
                type="checkbox"
                checked={formData.understandsPractical}
                onChange={handleChange}
                className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-600 rounded"
                required
              />
              <label htmlFor="understandsPractical" className="ml-2 block text-sm text-gray-300">
                Practical (Clinical Skills)
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="understandsCaseBased"
                name="understandsCaseBased"
                type="checkbox"
                checked={formData.understandsCaseBased}
                onChange={handleChange}
                className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-600 rounded"
                required
              />
              <label htmlFor="understandsCaseBased" className="ml-2 block text-sm text-gray-300">
                Case-Based Discussions
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
