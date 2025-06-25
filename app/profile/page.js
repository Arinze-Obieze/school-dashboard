'use client'
import { useState } from "react";
const ProfilePage = () => {
  const [photo, setPhoto] = useState(null);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
    }
  };

  return (
    <div className=" bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>

        {/* Upload Passport Photo */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Passport Photo</h2>
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden mb-4">
              {photo ? <img src={photo} alt="Passport" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="mb-2"
            />
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Upload</button>
          </div>
        </section>
    {/* View & Edit Personal Info */}
    <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">View & Edit Personal Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="p-2 border rounded" type="text" placeholder="Full Name" />
            <input className="p-2 border rounded" type="email" placeholder="Email" />
            <input className="p-2 border rounded" type="text" placeholder="Phone" />
            <input className="p-2 border rounded" type="text" placeholder="Address" />
          </div>
          <button className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save Changes</button>
        </section>
        {/* Update Password
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Update Password</h2>
          <div className="grid grid-cols-1 gap-4">
            <input className="p-2 border rounded" type="password" placeholder="Current Password" />
            <input className="p-2 border rounded" type="password" placeholder="New Password" />
            <input className="p-2 border rounded" type="password" placeholder="Confirm New Password" />
          </div>
          <button className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Update Password</button>
        </section> */}

        {/* Download Student ID Card */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Download Student ID Card</h2>
          <button className="w-full sm:w-auto px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Download ID Card</button>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;