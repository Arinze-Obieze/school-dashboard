'use client'

export default function StepProfessionalExperience({ 
  formData, 
  handleChange, 
  handleArrayChange, 
  addArrayItem, 
  removeArrayItem 
}) {
  // Template for leadership roles
  const leadershipTemplate = { role: '', institution: '', duration: '' };
  
  // Template for teaching experience
  const teachingTemplate = { institution: '', role: '', duration: '' };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-400 mb-4">SECTION C: PROFESSIONAL EXPERIENCE & LEADERSHIP</h2>

      {/* Current Position */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Current Institution</label>
          <input
            type="text"
            name="currentInstitution"
            value={formData.currentInstitution}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Job Title</label>
          <input
            type="text"
            name="currentJobTitle"
            value={formData.currentJobTitle}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
      </div>

      {/* Employment Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Employment From</label>
          <input
            type="date"
            name="employmentFrom"
            value={formData.employmentFrom}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Employment To</label>
          <input
            type="date"
            name="employmentTo"
            value={formData.employmentTo}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
      </div>

      {/* Total Years of Practice */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1">Total Years of Clinical Physiology Practice</label>
        <input
          type="number"
          name="totalPracticeYears"
          value={formData.totalPracticeYears}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          required
          min="0"
        />
      </div>

      {/* Leadership Roles */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-300">Leadership Roles Held</label>
          <button
            type="button"
            onClick={() => addArrayItem('leadershipRoles', leadershipTemplate)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            Add Leadership Role
          </button>
        </div>

        {formData.leadershipRoles.map((role, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-700 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Role</label>
              <input
                type="text"
                value={role.role}
                onChange={(e) => handleArrayChange('leadershipRoles', index, 'role', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Institution</label>
              <input
                type="text"
                value={role.institution}
                onChange={(e) => handleArrayChange('leadershipRoles', index, 'institution', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              />
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">Duration</label>
                <input
                  type="text"
                  value={role.duration}
                  onChange={(e) => handleArrayChange('leadershipRoles', index, 'duration', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('leadershipRoles', index)}
                  className="text-red-400 hover:text-red-300 p-1"
                  aria-label="Remove leadership role"
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

      {/* Teaching/Mentorship Experience */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-300">Teaching/Mentorship Experience</label>
          <button
            type="button"
            onClick={() => addArrayItem('teachingExperience', teachingTemplate)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            Add Teaching Experience
          </button>
        </div>

        {formData.teachingExperience.map((exp, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-700 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Institution</label>
              <input
                type="text"
                value={exp.institution}
                onChange={(e) => handleArrayChange('teachingExperience', index, 'institution', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Role</label>
              <input
                type="text"
                value={exp.role}
                onChange={(e) => handleArrayChange('teachingExperience', index, 'role', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              />
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">Duration</label>
                <input
                  type="text"
                  value={exp.duration}
                  onChange={(e) => handleArrayChange('teachingExperience', index, 'duration', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('teachingExperience', index)}
                  className="text-red-400 hover:text-red-300 p-1"
                  aria-label="Remove teaching experience"
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