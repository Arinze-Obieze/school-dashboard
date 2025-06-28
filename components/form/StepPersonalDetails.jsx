import React from 'react';

export default function StepPersonalDetails({ formData, handleChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-300 border-b border-gray-700 pb-2">Personal Details</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
            Full Name (Surname First)
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>
      
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-300">
            City
          </label>
          <input
            type="text"
            name="city"
            id="city"
            value={formData.city}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-300">
            State
          </label>
          <input
            type="text"
            name="state"
            id="state"
            value={formData.state}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>
      
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300">
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>
     
        <div>
          <label htmlFor="nationality" className="block text-sm font-medium text-gray-300">
            Nationality
          </label>
          <input
            type="text"
            name="nationality"
            id="nationality"
            value={formData.nationality}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>

        <div>
          <label htmlFor="stateOfOrigin" className="block text-sm font-medium text-gray-300">
            State of Origin
          </label>
          <input
            type="text"
            name="stateOfOrigin"
            id="stateOfOrigin"
            value={formData.stateOfOrigin}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Gender</label>
          <div className="mt-1 space-y-2">
            <div className="flex items-center">
              <input
                id="gender-male"
                name="gender"
                type="radio"
                value="Male"
                checked={formData.gender === 'Male'}
                onChange={handleChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-600"
              />
              <label htmlFor="gender-male" className="ml-3 block text-sm text-gray-300">
                Male
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="gender-female"
                name="gender"
                type="radio"
                value="Female"
                checked={formData.gender === 'Female'}
                onChange={handleChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-600"
              />
              <label htmlFor="gender-female" className="ml-3 block text-sm text-gray-300">
                Female
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="gender-other"
                name="gender"
                type="radio"
                value="Other"
                checked={formData.gender === 'Other'}
                onChange={handleChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-600"
              />
              <label htmlFor="gender-other" className="ml-3 block text-sm text-gray-300">
                Other
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
