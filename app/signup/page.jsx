'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase';
import { setDoc, doc } from 'firebase/firestore';

const countries = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United States', 'United Kingdom', 'Canada', 'India', 'China', 'Germany', 'France', 'Italy', 'Spain', 'Brazil', 'Australia', 'Other'
];

async function uploadToR2(file, userId) {
  if (!file) return '';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  const res = await fetch('/api/upload-r2', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Photo upload failed');
  const data = await res.json();
  return data.url;
}

export default function SignupPage() {
  const [form, setForm] = useState({
    surname: '', firstname: '', middlename: '', email: '', password: '',
    dob: '', gender: '', mobile: '', address: '', institution: '', nationality: '', photo: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: info, 2: photo
  const [userId, setUserId] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const router = useRouter();

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  // Step 1: Register user (no photo)
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const required = ['surname','firstname','middlename','email','password','gender','mobile','address','institution'];
    for (let key of required) {
      if (!form[key]) {
        setError('Please fill all required fields.');
        setLoading(false);
        return;
      }
    }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      setUserId(userCred.user.uid);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Step 2: Upload photo and save profile
  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let uploadedPhotoURL = '';
    try {
      if (form.photo) {
        uploadedPhotoURL = await uploadToR2(form.photo, userId);
        setPhotoURL(uploadedPhotoURL);
      }
      await setDoc(doc(db, 'users', userId), {
        surname: form.surname,
        firstname: form.firstname,
        middlename: form.middlename,
        email: form.email,
        dob: form.dob || '',
        gender: form.gender,
        mobile: form.mobile,
        address: form.address,
        institution: form.institution,
        nationality: form.nationality || '',
        photoURL: uploadedPhotoURL,
        createdAt: new Date().toISOString()
      });
      router.push('/');
    } catch (err) {
      setError(err.message || 'Photo upload failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#23272f]">
      <form onSubmit={step === 1 ? handleInfoSubmit : handlePhotoSubmit} className="bg-[#343940] p-8 rounded shadow-md w-full max-w-md" encType="multipart/form-data">
        <h2 className="text-2xl mb-6 text-white text-center">Sign Up</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="surname" placeholder="Surname*" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none" value={form.surname} onChange={handleChange} required />
            <input name="firstname" placeholder="First Name*" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none" value={form.firstname} onChange={handleChange} required />
            <input name="middlename" placeholder="Middle Name*" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none" value={form.middlename} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email Address*" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none" value={form.email} onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password*" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none" value={form.password} onChange={handleChange} required />
            <input name="mobile" placeholder="Mobile*" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none" value={form.mobile} onChange={handleChange} required />
            <input name="address" placeholder="Contact Address*" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none" value={form.address} onChange={handleChange} required />
            <input name="institution" placeholder="Institution*" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none" value={form.institution} onChange={handleChange} required />
            <select name="gender" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none" value={form.gender} onChange={handleChange} required>
              <option value="">Select Gender*</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <select name="nationality" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none" value={form.nationality} onChange={handleChange}>
              <option value="">Select Nationality (optional)</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="dob" type="date" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none" value={form.dob} onChange={handleChange} />
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <label className="text-white">Upload Passport Photo*</label>
            <input name="photo" type="file" accept="image/*" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none" onChange={handleChange} required />
            {form.photo && (
              <img src={form.photo ? URL.createObjectURL(form.photo) : ''} alt="Preview" className="w-32 h-32 object-cover rounded mx-auto mt-2" />
            )}
          </div>
        )}
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-6" disabled={loading}>{loading ? (step === 1 ? 'Registering...' : 'Uploading...') : (step === 1 ? 'Next: Upload Photo' : 'Finish Registration')}</button>
        <p className="mt-4 text-gray-400 text-sm text-center">
          Already have an account? <a href="/login" className="text-blue-400 hover:underline">Login</a>
        </p>
      </form>
    </div>
  );
}
