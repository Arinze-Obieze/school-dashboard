export default function StepAttachmentsDeclaration({ formData, handleChange, handleFileChange }) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-blue-400"> Declaration</h3>
        
      
        
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="declaration"
                name="declarationChecked"
                type="checkbox"
                checked={formData.declarationChecked}
                onChange={handleChange}
                required
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-600 rounded bg-gray-700"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="declaration" className="font-medium text-gray-300">
                I certify that all information provided is accurate and complete. I understand that falsified documents or misrepresentation will result in disqualification.
              </label>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300">Date of Declaration</label>
            <input
              type="date"
              name="declarationDate"
              value={formData.declarationDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>
      </div>
    );
  }