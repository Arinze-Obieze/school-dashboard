export default function StepAttachmentsDeclaration({ formData, handleChange, handleFileChange }) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-blue-400">Attachments & Declaration</h3>
        
        {/* File Uploads */}
        <div className="space-y-4 pb-6 border-b border-gray-700">
          <h4 className="text-lg font-medium text-gray-300">Required Documents</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Degree Certificate (PDF)*</label>
            <input
              type="file"
              name="degreeCertificate"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              required
              className="mt-1 block w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md cursor-pointer file:bg-gray-600 file:text-gray-200 file:px-3 file:py-2 file:rounded file:border-0 file:cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Training Certificate (PDF)*</label>
            <input
              type="file"
              name="trainingCertificate"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              required
              className="mt-1 block w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md cursor-pointer file:bg-gray-600 file:text-gray-200 file:px-3 file:py-2 file:rounded file:border-0 file:cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Passport Photos (JPG/PNG)*</label>
            <input
              type="file"
              name="passportPhotos"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              required
              className="mt-1 block w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md cursor-pointer file:bg-gray-600 file:text-gray-200 file:px-3 file:py-2 file:rounded file:border-0 file:cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">Accepted formats: JPG, PNG (Max 5MB)</p>
          </div>
        </div>
        
        {/* Declaration */}
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
            <label className="block text-sm font-medium text-gray-300">Date of Declaration*</label>
            <input
              type="date"
              name="declarationDate"
              value={formData.declarationDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    );
  }