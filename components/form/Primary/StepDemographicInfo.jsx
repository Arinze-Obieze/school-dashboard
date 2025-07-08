export default function StepDemographicInfo({ formData, handleChange }) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-blue-400">Demographic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Date of Birth*</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Gender*</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-white"
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Nationality*</label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-white"
              required
            />
          </div>
        </div>
  
        {/* Address Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Street Address*</label>
            <input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-white"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">City*</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">State/Region*</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">State of Origin</label>
              <input
                type="text"
                name="stateOfOrigin"
                value={formData.stateOfOrigin}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-white"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Country*</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Postal/Zip Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }