'use client'
import { FaTrashAlt, FaAward, FaFileAlt } from 'react-icons/fa';

export default function StepAlternativeRoute({ 
  formData, 
  handleChange, 
  handleArrayChange, 
  addArrayItem, 
  removeArrayItem 
}) {
  // Template for alternative route roles
  const altRoleTemplate = { role: '', institution: '', duration: '' };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-400 mb-4">SECTION E: ALTERNATIVE ROUTE (10+ Years Experience)</h2>
      <p className="text-sm text-gray-400 mb-6">
        Complete this section only if applying via the alternative route with extensive experience.
      </p>

      {/* Alternative Route Roles */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-300">Professional Roles</label>
          <button
            type="button"
            onClick={() => addArrayItem('altRoles', altRoleTemplate)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center"
          >
            <span>Add Role</span>
          </button>
        </div>

        {formData.altRoles.map((role, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-700 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Role</label>
              <input
                type="text"
                value={role.role}
                onChange={(e) => handleArrayChange('altRoles', index, 'role', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Institution</label>
              <input
                type="text"
                value={role.institution}
                onChange={(e) => handleArrayChange('altRoles', index, 'institution', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              />
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">Duration</label>
                <input
                  type="text"
                  value={role.duration}
                  onChange={(e) => handleArrayChange('altRoles', index, 'duration', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('altRoles', index)}
                  className="text-red-400 hover:text-red-300 p-1"
                  aria-label="Remove role"
                >
                  <FaTrashAlt className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Awards */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
          <FaAward className="mr-2 text-yellow-400" />
          Awards Received
        </label>
        <textarea
          name="altAwards"
          value={formData.altAwards}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          placeholder="List any awards or recognitions received in the field"
        />
      </div>

      {/* Policy Documents */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
          <FaFileAlt className="mr-2 text-blue-300" />
          Policy Documents Developed
        </label>
        <textarea
          name="altPolicyDocs"
          value={formData.altPolicyDocs}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          placeholder="Describe any policy documents you've contributed to developing"
        />
      </div>

      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-sm font-medium text-blue-300 mb-2">Note:</h3>
        <p className="text-xs text-gray-400">
          Candidates applying via the alternative route may be required to attend an interview.
          Ensure all information provided is accurate and verifiable.
        </p>
      </div>
    </div>
  );
}