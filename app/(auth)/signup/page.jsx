// Updated Signup Page with Firebase Storage
'use client';
import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '../../../firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaSpinner, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import AuthInfoSection from '@/components/AuthInfoSection';

const countries = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Other'
];

// Email validation function
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Firebase Storage upload function
async function uploadToFirebaseStorage(file, userId) {
  if (!file) return '';
  
  try {
    // Create a unique file name
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-photos/${userId}/photo-${Date.now()}.${fileExtension}`;
    
    // Create a storage reference
    const storageRef = ref(storage, fileName);
    
    console.log('Uploading to Firebase Storage:', { fileName, fileSize: file.size, fileType: file.type });
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload completed:', snapshot);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Firebase Storage upload error:', error);
    throw new Error(`Photo upload failed: ${error.message}`);
  }
}

export default function SignupPage() {
  const [form, setForm] = useState({
    surname: '', firstname: '', middlename: '', email: '', password: '',
    dob: '', gender: '', mobile: '', address: '', institution: '', nationality: '', photo: null
  });
  const [phoneValue, setPhoneValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: info, 2: email verification, 3: photo, 4: payment
  const [userId, setUserId] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  // Preload Flutterwave script once
  useEffect(() => {
    if (!document.getElementById('flutterwave-script')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.id = 'flutterwave-script';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Check email verification status periodically
  useEffect(() => {
    if (step === 2 && userId) {
      const interval = setInterval(async () => {
        try {
          await auth.currentUser?.reload();
          if (auth.currentUser?.emailVerified) {
            setStep(3); // Move to photo upload after verification
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error checking verification:', error);
        }
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [step, userId]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  
    if (name === 'email' && value && !isValidEmail(value)) {
      setError('Please enter a valid email address');
    } else if (name === 'email' && !value) {
      setError('Email is required');
    } else if (error && name === 'email' && isValidEmail(value)) {
      setError('');
    }
  };

  // Check if user has incomplete registration
  useEffect(() => {
    if (!userId) return;
    const checkPayment = async () => {
      try {
        const ref = doc(db, 'users', userId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.paymentStatus === 'success') {
            setStep(5); // Registration complete
          } else if (data.photoURL) {
            setStep(4); // Go to payment step
          }
        }
      } catch (e) {
        console.error('Error checking payment status:', e);
      }
    };
    checkPayment();
  }, [userId]);

  // Step 1: Register user and send verification email
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    const trimmedForm = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
    );
    
    const formWithPhone = { ...trimmedForm, mobile: phoneValue };

    const required = ['surname','firstname','email','password','gender','mobile','address','institution', 'dob'];
    for (let key of required) {
      if (!formWithPhone[key]) {
        setError('Please fill all required fields.');
        setLoading(false);
        return;
      }
    }
    if (formWithPhone.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    if (!phoneValue) {
      setError('Please enter a valid mobile number.');
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, formWithPhone.email, formWithPhone.password);
      const user = userCred.user;
      setUserId(user.uid);

      // Send email verification
      await sendEmailVerification(user);
      setEmailVerificationSent(true);
      setResendCooldown(60); // 60 seconds cooldown for resend
      setStep(2); // Move to verification step

      // Store basic user info in Firestore (without sensitive data)
      await setDoc(doc(db, 'users', user.uid), {
        surname: form.surname,
        firstname: form.firstname,
        middlename: form.middlename,
        email: form.email,
        dob: form.dob || '',
        gender: form.gender,
        mobile: phoneValue,
        address: form.address,
        institution: form.institution,
        nationality: form.nationality || '',
        emailVerified: false,
        createdAt: new Date().toISOString(),
        paymentStatus: 'pending',
      }, { merge: true });

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    }
    setLoading(false);
  };

  // Resend verification email
  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    setError('');
    try {
      await sendEmailVerification(auth.currentUser);
      setResendCooldown(60); // Reset cooldown
      setEmailVerificationSent(true);
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    }
    setLoading(false);
  };

  // Check verification status manually
  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setStep(3); // Move to photo upload
      } else {
        setError('Email not verified yet. Please check your inbox.');
      }
    } catch (err) {
      setError('Failed to check verification status.');
    }
    setCheckingVerification(false);
  };

  // Step 3: Upload photo to Firebase Storage and update profile
  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    
    try {
      // Validate photo
      if (!form.photo) {
        setError('Please select a photo to upload.');
        setLoading(false);
        return;
      }

      // File validation
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

      if (!ALLOWED_FILE_TYPES.includes(form.photo.type)) {
        setError('Please upload a JPEG, PNG, or GIF image.');
        setLoading(false);
        return;
      }

      if (form.photo.size > MAX_FILE_SIZE) {
        setError('Image must be smaller than 5MB.');
        setLoading(false);
        return;
      }

      console.log('Starting photo upload to Firebase Storage...');

      // Upload photo to Firebase Storage
      const uploadedPhotoURL = await uploadToFirebaseStorage(form.photo, userId);
      setPhotoURL(uploadedPhotoURL);

      // Update Firestore with photo URL
      await setDoc(doc(db, 'users', userId), {
        photoURL: uploadedPhotoURL,
        emailVerified: true,
        profileCompleted: true,
      }, { merge: true });

      console.log('Photo upload and profile update completed successfully');
      setStep(4);
      
    } catch (err) {
      console.error('Photo upload error:', err);
      setError(err.message || 'Photo upload failed. Please try again.');
    }
    setLoading(false);
  };

  // Step 4: Handle payment with Flutterwave
  const handleFlutterwavePayment = () => {
    if (!userId) {
      setError('User not found. Please complete previous steps.');
      return;
    }
    setError("");
    setLoading(true);

    const triggerPayment = () => {
      window.FlutterwaveCheckout({
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
        tx_ref: `${userId}-${Date.now()}`,
        amount: 21000,
        currency: "NGN",
        payment_options: "banktransfer,card",
        customer: {
          email: form.email,
          name: `${form.surname} ${form.firstname}`,
          phonenumber: phoneValue,
        },
        customizations: {
          title: "School Registration Fee",
          description: "Registration payment for dashboard",
          logo: "/logo-50x100.png",
        },
        callback: async function (response) {
          setLoading(true);
          try {
            const res = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tx_ref: response.tx_ref,
                transaction_id: response.transaction_id,
                userId,
              }),
            });
            const data = await res.json();
            if (data.status === "success") {
              await setDoc(doc(db, "users", userId), {
                paymentStatus: "success",
                paymentDate: new Date().toISOString(),
                transactionId: response.transaction_id,
                txRef: response.tx_ref,
              }, { merge: true });
              setPaymentStatus("success");
              setStep(5);
              setTimeout(() => router.push("/dashboard"), 3000);
            } else {
              setError("Payment not completed.");
            }
          } catch (e) {
            setError("Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        onclose: function () {
          setLoading(false);
        },
      });
    };

    if (!document.getElementById("flutterwave-script")) {
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.id = "flutterwave-script";
      script.async = true;
      script.onload = () => triggerPayment();
      document.body.appendChild(script);
    } else {
      triggerPayment();
    }
  };

  const today = new Date();
  const maxDob = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())
    .toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-[#23272f]">
      <AuthInfoSection/>
      <div className="flex flex-1 flex-col items-center justify-center w-full lg:w-1/2 px-4 py-8">
        <div className="flex justify-center mb-6 lg:hidden">
          <img src="/logo-50x100.jpg" alt="Logo" width={300} height={120} />
        </div>
        <form
          onSubmit={
            step === 1
              ? handleInfoSubmit
              : step === 3
              ? handlePhotoSubmit
              : step === 4
              ? (e) => { e.preventDefault(); handleFlutterwavePayment(); }
              : (e) => e.preventDefault()
          }
          className="bg-[#343940] p-6 rounded shadow-md w-full max-w-md"
          encType="multipart/form-data"
        >
          <h2 className="text-2xl mb-4 text-white text-center">Application Form</h2>
          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
          
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ... (your existing step 1 form fields remain the same) ... */}
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">Surname*</label>
                <input name="surname" placeholder="Surname" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" value={form.surname} onChange={handleChange} required />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">First Name*</label>
                <input name="firstname" placeholder="First Name" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" value={form.firstname} onChange={handleChange} required />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">Middle Name*</label>
                <input name="middlename" placeholder="Middle Name" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" value={form.middlename} onChange={handleChange} required />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">Email*</label>
                <input name="email" type="email" placeholder="Email" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" value={form.email} onChange={handleChange} required />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">Password*</label>
                <input name="password" type="password" placeholder="Password" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" value={form.password} onChange={handleChange} required />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">Date of Birth*</label>
                <input name="dob" type="date" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" value={form.dob} onChange={handleChange} max={maxDob} />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">Gender*</label>
                <select name="gender" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" value={form.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-white text-sm">Mobile Number*</label>
                <PhoneInput
                  international
                  defaultCountry="NG"
                  value={phoneValue}
                  onChange={setPhoneValue}
                  className="phone-input-custom"
                  inputClassName="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 w-full text-sm"
                  buttonClassName="bg-[#23272f] border border-gray-600 rounded-l"
                />
              </div>
              
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-white text-sm">Address*</label>
                <input name="address" placeholder="Contact Address" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" value={form.address} onChange={handleChange} required />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">Institution*</label>
                <input name="institution" placeholder="Institution" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" value={form.institution} onChange={handleChange} required />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">Nationality</label>
                <select name="nationality" className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" value={form.nationality} onChange={handleChange}>
                  <option value="">Select Nationality</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Email Verification */}
          {step === 2 && (
            <div className="flex flex-col gap-4 items-center text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <FaEnvelope className="text-white text-2xl" />
              </div>
              <h3 className="text-xl text-white font-bold">Verify Your Email</h3>
              <p className="text-gray-300 text-sm">
                We've sent a verification link to <strong>{form.email}</strong>
              </p>
              <p className="text-gray-400 text-xs">
                Please check your inbox and click the verification link to continue with your registration.
              </p>
              
              <div className="flex flex-col gap-3 w-full mt-4">
                <button
                  type="button"
                  onClick={handleCheckVerification}
                  disabled={checkingVerification}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded flex items-center justify-center text-sm"
                >
                  {checkingVerification && <FaSpinner className="animate-spin mr-2" />}
                  {checkingVerification ? 'Checking...' : 'I\'ve Verified My Email'}
                </button>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0 || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center text-sm disabled:bg-gray-600"
                >
                  {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaEnvelope className="mr-2" />}
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
                </button>
              </div>

              <p className="text-gray-500 text-xs mt-4">
                Didn't receive the email? Check your spam folder or try resending.
              </p>
            </div>
          )}

          {/* Step 3: Photo Upload */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <FaCheckCircle className="text-green-500" />
                <span className="text-green-500 text-sm">Email Verified Successfully!</span>
              </div>
              <label className="text-white text-sm">Upload Passport Photo*</label>
              <input 
                name="photo" 
                type="file" 
                accept="image/*" 
                className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" 
                onChange={handleChange} 
                required 
              />
              {form.photo && (
                <img src={form.photo ? URL.createObjectURL(form.photo) : ''} alt="Preview" className="w-32 h-32 object-cover rounded mx-auto mt-2" />
              )}
              <p className="text-gray-400 text-xs">
                Supported formats: JPEG, PNG, GIF. Max size: 5MB
              </p>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="flex flex-col gap-4 items-center">
              <h3 className="text-xl text-white font-bold mb-2">Application Fee</h3>
              <p className="text-gray-300 text-center mb-2 text-sm">
                To complete your application, please pay <span className="font-bold text-green-400">₦21,000</span> to the WACCPS using Flutterwave.
              </p>
              <p className="text-gray-400 text-xs mt-2">
                You will be redirected to Flutterwave to complete your payment securely.
              </p>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 5 && (
            <div className="flex flex-col gap-4 items-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <FaCheckCircle className="text-white text-2xl" />
              </div>
              <h3 className="text-xl text-green-500 font-bold mb-2">Registration Complete!</h3>
              <p className="text-gray-300 text-center mb-2 text-sm">Your payment was successful and your registration is now complete.</p>
              <p className="text-gray-400 text-sm mt-2">You will be redirected to your dashboard shortly.</p>
            </div>
          )}

          {/* Action Buttons */}
          {(step === 1 || step === 3 || step === 4) && (
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-4 flex items-center justify-center text-sm" disabled={loading}>
              {loading && <FaSpinner className="animate-spin mr-2" />}
              {loading 
                ? (step === 1 ? 'Registering...' : step === 3 ? 'Uploading...' : 'Processing Payment...')
                : (step === 1 ? 'Next: Verify Email' : step === 3 ? 'Next: Payment' : 'Pay ₦21,000 Now')
              }
            </button>
          )}

          <p className="mt-4 text-gray-400 text-xs text-center">
            Already have an account? <a href="/login" className="text-blue-400 hover:underline">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}