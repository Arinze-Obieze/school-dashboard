'use client'
import PhoneInputField from '@/components/auth/steps/forms/PhoneInputField';

export default function StepPersonalDetails({ formData, handleChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-400 mb-4">SECTION A: PERSONAL DETAILS</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Full Name (Surname First)</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
        
        {/* Professional Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Current Professional Title</label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="professionalTitle"
                value="MWCCPS"
                checked={formData.professionalTitle === 'MWCCPS'}
                onChange={handleChange}
                className="form-radio text-blue-500"
                required
              />
              <span className="ml-2 text-gray-300">MWCCPS</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="professionalTitle"
                value="Other"
                checked={formData.professionalTitle === 'Other'}
                onChange={handleChange}
                className="form-radio text-blue-500"
              />
              <span className="ml-2 text-gray-300">Other (Specify)</span>
              <input
                type="text"
                name="otherTitle"
                value={formData.otherTitle}
                onChange={handleChange}
                className="ml-2 px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white"
                disabled={formData.professionalTitle !== 'Other'}
              />
            </label>
          </div>
        </div>
        
        {/* Contact Address - City */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Contact Address - City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
        
        {/* Contact Address - State */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Contact Address - State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
        
        {/* Contact Address - Country */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Contact Address - Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
        
        {/* Phone Number */}
        <div className="mb-4">
          <PhoneInputField
            value={formData.phoneNumber}
            onChange={(value) => handleChange({ target: { name: 'phoneNumber', value } })}
            label="Phone Number"
          />
        </div>
        
        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
        
        {/* Date of Birth */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
        
        {/* Gender */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={formData.gender === 'Male'}
                onChange={handleChange}
                className="form-radio text-blue-500"
                required
              />
              <span className="ml-2 text-gray-300">Male</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={formData.gender === 'Female'}
                onChange={handleChange}
                className="form-radio text-blue-500"
              />
              <span className="ml-2 text-gray-300">Female</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="Other"
                checked={formData.gender === 'Other'}
                onChange={handleChange}
                className="form-radio text-blue-500"
              />
              <span className="ml-2 text-gray-300">Other</span>
            </label>
          </div>
        </div>
        
        {/* Nationality */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Nationality</label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
        
        {/* State of Origin */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">State of Origin</label>
          <input
            type="text"
            name="stateOfOrigin"
            value={formData.stateOfOrigin}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>
      </div>
    </div>
  );
}