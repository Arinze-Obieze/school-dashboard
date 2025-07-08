import CourseSelect from "../ui/CourseSelect";

export default function StepInstitutionDetails({ formData, handleChange, onCourseSelection }) {
  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-blue-400 mb-6">Institution Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-300">Name of Institution*</label>
          <input
            type="text"
            name="institutionName"
            value={formData.institutionName}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-lg border border-gray-500 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="University of Lagos"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-300">Year of Graduation*</label>
          <input
            type="number"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
            className="block w-full px-4 py-3 text-base rounded-lg border border-gray-500 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="2020"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-lg font-medium text-gray-300">Course Selection*</label>
        <p className="text-sm text-gray-400 mb-3">Select one subspecialty</p>
        <CourseSelect 
          value={formData.courseSelection}
          onChange={onCourseSelection}
                    required
        />
      </div>
    </div>
  );
}