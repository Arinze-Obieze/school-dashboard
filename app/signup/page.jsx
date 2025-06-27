'use client';
import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';

const countries = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Other'
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
  const [step, setStep] = useState(1); // 1: info, 2: photo, 3: payment
  const [userId, setUserId] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending' | 'success'
  const router = useRouter();

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  // Check if user has incomplete registration (e.g., payment not done)
  useEffect(() => {
    if (!userId) return;
    const checkPayment = async () => {
      try {
        const ref = doc(db, 'users', userId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.paymentStatus === 'success') {
            setStep(4); // Registration complete
          } else {
            setStep(3); // Go to payment step
          }
        }
      } catch (e) {}
    };
    checkPayment();
  }, [userId]);

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
        createdAt: new Date().toISOString(),
        paymentStatus: 'pending',
      }, { merge: true });
      setStep(3);
    } catch (err) {
      setError(err.message || 'Photo upload failed.');
    }
    setLoading(false);
  };

  // Step 3: Handle payment with Flutterwave
  const handleFlutterwavePayment = () => {
    setError('');
    // Load Flutterwave inline script
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => {
      window.FlutterwaveCheckout({
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
        tx_ref: `${userId}-${Date.now()}`,
        amount: 21000,
        currency: 'NGN',
        payment_options: 'banktransfer,card',
        customer: {
          email: form.email,
          name: `${form.surname} ${form.firstname}`,
          phonenumber: form.mobile,
        },
        customizations: {
          title: 'School Registration Fee',
          description: 'Registration payment for dashboard',
          logo: '/logo-50x100.png',
        },
        callback: async function(response) {
          // Call backend to verify payment
          setLoading(true);
          try {
            const res = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: response.transaction_id, tx_ref: response.tx_ref, userId }),            });
            const data = await res.json();
            if (data.status === 'success') {
              setPaymentStatus('success');
              setStep(4); // Registration complete
              // Attempt to close the Flutterwave modal
              if (window.FlutterwaveCheckout && typeof window.FlutterwaveCheckout.close === 'function') {
                window.FlutterwaveCheckout.close();
              }
              // Fallback: try to close window (for popup mode)
              if (typeof window.close === 'function') {
                window.close();
              }
              router.push('/'); // Redirect to dashboard
            } else {
              setError('Payment not completed.');
            }
          } catch (e) {
            setError('Payment verification failed.');
          }
          setLoading(false);
        },
        onclose: function() {
          // User closed payment modal
        },
      });
    };
    document.body.appendChild(script);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-[#23272f]">
      {/* Side panel for large screens */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 h-full bg-gradient-to-br from-blue-900 to-blue-600 text-white mx-12 p-12">
        <img src="/logo-50x100.jpg" alt="Logo" width={120} height={120} className="mb-8" />
        <h1 className="text-4xl font-bold mb-4">Join Our Community!</h1>
        <p className="text-lg mb-8 text-center max-w-md">Create your account to access courses, exams, resources, and more. Start your academic journey with us today.</p>
        <div className="w-64 h-64 bg-white/10 rounded-2xl flex items-center justify-center">
          {/* You can replace this with an illustration or SVG */}
          <img src="/globe.svg" alt="Illustration" className="w-40 h-40" />
        </div>
      </div>
      {/* Main form area */}
      <div className="flex flex-1 flex-col items-center justify-center w-full lg:w-1/2 px-4 py-8">
        <div className="flex justify-center mb-6 lg:hidden">
          <img src="/logo-50x100.jpg" alt="Logo" width={120} height={120} />
        </div>
        <form onSubmit={step === 1 ? handleInfoSubmit : step === 2 ? handlePhotoSubmit : (e) => { e.preventDefault(); handleFlutterwavePayment(); }} className="bg-[#343940] p-8 rounded shadow-md w-full max-w-md" encType="multipart/form-data">
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
          {step === 3 && (
            <div className="flex flex-col gap-4 items-center">
              <h3 className="text-xl text-white font-bold mb-2">Registration Payment</h3>
              <p className="text-gray-300 text-center mb-2">To complete your registration, please pay <span className="font-bold text-green-400">₦21,000</span> to the Fidelity Bank account below using Flutterwave.</p>
            
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded mt-4" disabled={loading || paymentStatus === 'success'}>
                {loading ? 'Processing...' : 'Pay ₦21,000 Now'}
              </button>
              <p className="text-gray-400 text-xs mt-2">You will be redirected to Flutterwave to complete your payment securely.</p>
            </div>
          )}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-6" disabled={loading}>{loading ? (step === 1 ? 'Registering...' : 'Uploading...') : (step === 1 ? 'Next: Upload Photo' : 'Finish Registration')}</button>
          <p className="mt-4 text-gray-400 text-sm text-center">
            Already have an account? <a href="/login" className="text-blue-400 hover:underline">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}
