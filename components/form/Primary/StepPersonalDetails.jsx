export default function StepPersonalDetails({ formData, handleChange }) {
  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-blue-400 mb-6">Personal Information</h3>
      
      {/* Title Selection */}
      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-300">Title*</label>
        <div className="flex flex-wrap gap-4">
          {['Mr.', 'Mrs.', 'Dr.', 'Prof.'].map((title) => (
            <label key={title} className="inline-flex items-center space-x-3">
              <input
                type="radio"
                name="title"
                value={title}
                checked={formData.title === title}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 border-gray-500 focus:ring-blue-500 bg-gray-700"
              />
              <span className="text-gray-200 text-base">{title}</span>
            </label>
          ))}
          <div className="inline-flex items-center space-x-3">
            <input
              type="radio"
              name="title"
              value="Other"
              checked={formData.title === 'Other'}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 border-gray-500 focus:ring-blue-500 bg-gray-700"
            />
            <span className="text-gray-200 text-base">Other:</span>
            <input
              type="text"
              name="otherTitle"
              value={formData.otherTitle}
              onChange={handleChange}
              disabled={formData.title !== 'Other'}
              className="ml-2 w-32 px-3 py-2 text-base rounded-lg border border-gray-500 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-300">Surname*</label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-lg border border-gray-500 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Enter your surname"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-300">First Name*</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-lg border border-gray-500 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Enter your first name"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-300">Middle Name</label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-lg border border-gray-500 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter middle name (if any)"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-300">Email Address*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-lg border border-gray-500 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="youremail@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-300">Phone/WhatsApp Number*</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-400 text-base">+</span>
            </div>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              minLength="10"
              maxLength="15"
              pattern="[0-9\s+]+"
              className="block w-full pl-8 px-4 py-3 text-base rounded-lg border border-gray-500 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="234 123 456 7890"
            />
          </div>
        </div>
      </div>
    </div>
  );
}