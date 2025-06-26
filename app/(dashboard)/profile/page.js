'use client'
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (!user) {
      console.log('No user logged in');
      return;
    }
    const fetchProfile = async () => {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        console.log('Fetched profile data:', data);
        setProfile(data);
        setPhoto(data.photoURL || null);
        setForm({
          fullName: `${data.surname || ''} ${data.firstname || ''} ${data.middlename || ''}`.trim(),
          email: data.email || '',
          phone: data.mobile || '',
          address: data.address || ''
        });
      } else {
        console.log('No profile found for user:', user.uid);
        setProfile(null);
      }
      setLoading(false);
    };
    console.log('Current user:', user);
    fetchProfile();
  }, [user]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, {
      email: form.email,
      mobile: form.phone,
      address: form.address,
      surname: form.fullName.split(' ')[0] || '',
      firstname: form.fullName.split(' ')[1] || '',
      middlename: form.fullName.split(' ')[2] || ''
    });
    setEdit(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!profile) return <div className="p-8 text-center text-red-500">No profile data found for this user.</div>;

  return (
    <div className=" bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>
        {/* Upload Passport Photo */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Passport Photo</h2>
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden mb-4">
              {photo ? <img src={photo} alt="Passport" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>}
            </div>
          </div>
        </section>
        {/* View & Edit Personal Info */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">View & Edit Personal Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="p-2 border rounded" type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} disabled={!edit} />
            <input className="p-2 border rounded" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} disabled={!edit} />
            <input className="p-2 border rounded" type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} disabled={!edit} />
            <input className="p-2 border rounded" type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} disabled={!edit} />
          </div>
          {edit ? (
            <button className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleSave}>Save Changes</button>
          ) : (
            <button className="mt-4 w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={() => setEdit(true)}>Edit</button>
          )}
        </section>
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