export default function StepCareerIntentions({ formData, handleChange }) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-blue-400">Career Intentions</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Do you intend to practice abroad after certification?
          </label>
          <div className="mt-2 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="practiceAbroad"
                value="Yes"
                checked={formData.practiceAbroad === "Yes"}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-600 focus:ring-blue-500 bg-gray-700"
              />
              <span className="ml-2 text-gray-300">Yes</span>
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="radio"
                name="practiceAbroad"
                value="No"
                checked={formData.practiceAbroad === "No"}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-600 focus:ring-blue-500 bg-gray-700"
              />
              <span className="ml-2 text-gray-300">No</span>
            </label>
          </div>
        </div>
      </div>
    );
  }