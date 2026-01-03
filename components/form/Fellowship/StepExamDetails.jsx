'use client'
import { FaCheckCircle, FaUniversity, FaBook, FaClipboardCheck } from 'react-icons/fa';
import CourseSelect from '../ui/CourseSelect';

export default function StepExamDetails({ formData, handleChange }) {
  const examCenters = [
    { id: 'lagos', label: 'Lagos' },
    { id: 'abuja', label: 'Abuja' },
    { id: 'accra', label: 'Accra' },
    { id: 'anambra', label: 'Anambra' },
    { id: 'rivers', label: 'Rivers State' },
    { id: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-400 mb-4">SECTION F: EXAMINATION DETAILS</h2>

      {/* Preferred Examination Center */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
          <FaUniversity className="mr-2 text-blue-300" />
          Preferred Examination Center
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {examCenters.map((center) => (
            <div key={center.id} className="flex items-center">
              <input
                id={`center-${center.id}`}
                name="examCenter"
                type="radio"
                value={center.label}
                checked={formData.examCenter === center.label}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-600 focus:ring-blue-500"
                required
              />
              <label htmlFor={`center-${center.id}`} className="ml-3 block text-sm text-gray-300">
                {center.label}
              </label>
            </div>
          ))}
        </div>
        {formData.examCenter === 'Other' && (
          <div className="mt-3">
            <input
              type="text"
              name="examCenterOther"
              value={formData.examCenterOther || ''}
              onChange={handleChange}
              placeholder="Please specify"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
              required
            />
          </div>
        )}
      </div>

      {/* Course Selection  */}
      <CourseSelect 
       value={formData.course}
       onChange={(selectedCourse) => handleChange({
         target: { name: 'course', value: selectedCourse }
       })}
       required={true}
      />

      {/* Examination Format Acknowledgment */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          I understand the examination includes:
        </label>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="understandsWritten"
                name="understandsWritten"
                type="checkbox"
                checked={formData.understandsWritten}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500"
                required
              />
            </div>
            <div className="ml-3 flex items-center">
              <FaBook className="text-blue-300 mr-2" />
              <label htmlFor="understandsWritten" className="block text-sm text-gray-300">
                Advanced Written Papers
              </label>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="understandsCaseDefense"
                name="understandsCaseDefense"
                type="checkbox"
                checked={formData.understandsCaseDefense}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500"
                required
              />
            </div>
            <div className="ml-3 flex items-center">
              <FaClipboardCheck className="text-blue-300 mr-2" />
              <label htmlFor="understandsCaseDefense" className="block text-sm text-gray-300">
                Clinical Case Defense
              </label>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="understandsThesis"
                name="understandsThesis"
                type="checkbox"
                checked={formData.understandsThesis}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500"
                required
              />
            </div>
            <div className="ml-3 flex items-center">
              <FaCheckCircle className="text-blue-300 mr-2" />
              <label htmlFor="understandsThesis" className="block text-sm text-gray-300">
                Research Thesis Evaluation
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg border border-blue-500">
        <h3 className="text-sm font-medium text-blue-300 mb-2">Important Notes:</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Examination dates will be communicated after application review</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Bring valid identification to the examination center</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>The examination may span multiple days</span>
          </li>
        </ul>
      </div>
    </div>
  );
}