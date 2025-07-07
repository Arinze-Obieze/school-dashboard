'use client'
import { FaTrashAlt } from 'react-icons/fa';

export default function StepResearchPublications({ 
  formData, 
  handleChange, 
  handleArrayChange, 
  addArrayItem, 
  removeArrayItem 
}) {
  // Templates for array fields
  const researchPaperTemplate = { title: '', journal: '', year: '' };
  const conferenceTemplate = { title: '', event: '', year: '' };
  const supervisedResearchTemplate = { title: '', institution: '', year: '' };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-400 mb-4">SECTION D: RESEARCH & PUBLICATIONS</h2>

      {/* Published Research Papers */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-300">Published Research Papers (Minimum 2 required)</label>
          <button
            type="button"
            onClick={() => addArrayItem('researchPapers', researchPaperTemplate)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            Add Research Paper
          </button>
        </div>

        {formData.researchPapers.map((paper, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-700 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={paper.title}
                onChange={(e) => handleArrayChange('researchPapers', index, 'title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
                required={index < 2} // First two papers are required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Journal</label>
              <input
                type="text"
                value={paper.journal}
                onChange={(e) => handleArrayChange('researchPapers', index, 'journal', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
                required={index < 2}
              />
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">Year</label>
                <input
                  type="text"
                  value={paper.year}
                  onChange={(e) => handleArrayChange('researchPapers', index, 'year', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
                  required={index < 2}
                />
              </div>
              {index > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('researchPapers', index)}
                  className="text-red-400 hover:text-red-300 p-1"
                  aria-label="Remove research paper"
                >
                  <FaTrashAlt className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Conference Presentations */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-300">Conference Presentations</label>
          <button
            type="button"
            onClick={() => addArrayItem('conferencePresentations', conferenceTemplate)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            Add Conference Presentation
          </button>
        </div>

        {formData.conferencePresentations.map((presentation, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-700 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={presentation.title}
                onChange={(e) => handleArrayChange('conferencePresentations', index, 'title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Event</label>
              <input
                type="text"
                value={presentation.event}
                onChange={(e) => handleArrayChange('conferencePresentations', index, 'event', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              />
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">Year</label>
                <input
                  type="text"
                  value={presentation.year}
                  onChange={(e) => handleArrayChange('conferencePresentations', index, 'year', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('conferencePresentations', index)}
                  className="text-red-400 hover:text-red-300 p-1"
                  aria-label="Remove conference presentation"
                >
                  <FaTrashAlt className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Research Projects Supervised */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-300">Research Projects Supervised</label>
          <button
            type="button"
            onClick={() => addArrayItem('researchSupervised', supervisedResearchTemplate)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            Add Research Project
          </button>
        </div>

        {formData.researchSupervised.map((project, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-700 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => handleArrayChange('researchSupervised', index, 'title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Institution</label>
              <input
                type="text"
                value={project.institution}
                onChange={(e) => handleArrayChange('researchSupervised', index, 'institution', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              />
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">Year</label>
                <input
                  type="text"
                  value={project.year}
                  onChange={(e) => handleArrayChange('researchSupervised', index, 'year', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('researchSupervised', index)}
                  className="text-red-400 hover:text-red-300 p-1"
                  aria-label="Remove research project"
                >
                  <FaTrashAlt className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}