'use client';
import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { FaSpinner } from 'react-icons/fa';

// Hooks
import { useSignupForm } from '../../../hooks/useSignupForm';
import { useEmailVerification } from '../../../hooks/useEmailVerification';
import { useSignupSteps } from '../../../hooks/useSignupSteps';

// Components
import { PersonalInfoStep } from '@/components/auth/steps/PersonalInfoStep';
import { EmailVerificationStep } from '@/components/auth/steps/EmailVerificationStep';
import { PhotoUploadStep } from '@/components/auth/steps/PhotoUploadStep';
import { PaymentStep } from '@/components/auth/steps/PaymentStep';
import { CompletionStep } from '@/components/auth/steps/CompletionStep';
import AuthInfoSection from '@/components/AuthInfoSection';
import { StepProgress } from '@/components/auth/steps/layout/StepProgress';

// Utils
import { validateRequiredFields, validatePassword, validateFile } from '../../../utils/validation';
import { uploadToFirebaseStorage } from '../../../utils/firebaseUtils';
import { STEPS } from '../../../utils/constants';

export default function SignupPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const router = useRouter();

  // Custom hooks
  const { form, phoneValue, handleChange, updatePhone, getFormWithPhone } = useSignupForm();
  const { step, paymentStatus, setPaymentStatus, goToStep, nextStep } = useSignupSteps(userId);
  const { 
    checkingVerification, 
    resendCooldown, 
    sendVerification, 
    resendVerification, 
    checkVerificationStatus 
  } = useEmailVerification(userId, step);

  // Preload Flutterwave script
  useEffect(() => {
    if (!document.getElementById('flutterwave-script')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.id = 'flutterwave-script';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('signup_userId');
    if (savedUserId && !userId) {
      setUserId(savedUserId);
      // Optional: restore step if needed, but the useSignupSteps hook handles step restoration based on userId
    }
  }, []); // Empty dependency array to run only on mount

  // Step 1: Register user and send verification email
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    const formWithPhone = getFormWithPhone();
    const required = ['surname','firstname','email','password','gender','mobile','address','institution', 'dob'];

    // Validation
    const requiredValidation = validateRequiredFields(formWithPhone, required);
    if (!requiredValidation.isValid) {
      setError(requiredValidation.error);
      setLoading(false);
      return;
    }

    if (!validatePassword(formWithPhone.password)) {
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
      const userCred = await createUserWithEmailAndPassword(auth, formWithPhone.email, formWithPhone.password);
      const user = userCred.user;
      setUserId(user.uid);
      localStorage.setItem('signup_userId', user.uid); // Save to local storage

      await sendVerification(user);

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
        payments: [],
        profileCompleted: false,
      }, { merge: true });

      nextStep();
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    }
    setLoading(false);
  };

  // Step 2: Check verification
  const handleCheckVerification = async () => {
    try {
      const isVerified = await checkVerificationStatus();
      if (isVerified) {
        nextStep();
      } else {
        setError('Email not verified yet. Please check your inbox and spam folder.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Step 2: Resend verification
  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    try {
      await resendVerification();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Step 3: Upload photo (MANDATORY - cannot be skipped)
  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    
    try {
      // Validate that photo file is selected
      if (!form.photo) {
        setError('Please select a photo before proceeding. Photo upload is mandatory.');
        setLoading(false);
        return;
      }

      const fileValidation = validateFile(form.photo);
      if (!fileValidation.isValid) {
        setError(fileValidation.error);
        setLoading(false);
        return;
      }

      console.log('Starting photo upload to Firebase Storage...');
      const uploadedPhotoURL = await uploadToFirebaseStorage(form.photo, userId);
      
      if (!uploadedPhotoURL) {
        throw new Error('Photo upload returned no URL. Please try again.');
      }

      await setDoc(doc(db, 'users', userId), {
        photoURL: uploadedPhotoURL,
        emailVerified: true,
        profileCompleted: true,
        photoUploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('Photo upload and profile update completed successfully');
      nextStep();
    } catch (err) {
      console.error('Photo upload error:', err);
      setError(err.message || 'Photo upload failed. Please try again.');
    }
    setLoading(false);
  };

  // Step 3: Skip photo upload
  const handleSkipPhoto = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', userId), {
        photoURL: null, // No photo
        emailVerified: true,
        profileCompleted: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      nextStep();
    } catch (err) {
      console.error('Skip photo error:', err);
      setError('Failed to skip. Please try again.');
    }
    setLoading(false);
  };

  // Step 4: Handle payment with improved error handling
  const handleFlutterwavePayment = () => {
    if (!userId) {
      // Try to recover from local storage
      const savedUserId = localStorage.getItem('signup_userId');
      if (savedUserId) {
        setUserId(savedUserId);
        // We can't immediately proceed with the original call because state update is async.
        // But the next click should work.
        setError('Session restored. Please click "Pay" again.');
        return;
      }
      setError('User session not found. Please refresh or sign in again.');
      return;
    }
    
    setError("");
    setLoading(true);

    const triggerPayment = () => {
      if (typeof window.FlutterwaveCheckout === 'undefined') {
        setError('Payment system is still loading. Please wait a moment and try again.');
        setLoading(false);
        return;
      }

      const tx_ref = `${userId}-${Date.now()}`;
      
      window.FlutterwaveCheckout({
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
        tx_ref: tx_ref,
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
                userId: userId,
                paymentType: "registration"
              }),
            });
            
            const data = await res.json();
            
            if (!res.ok) {
              throw new Error(data.error || 'Payment verification failed');
            }
            
            if (data.status === "success") {
              setPaymentStatus("success");
              localStorage.removeItem('signup_userId'); // Clear session on success
              nextStep();
              setTimeout(() => router.push("/dashboard"), 3000);
            } else {
              setError("Payment verification failed: " + (data.error || 'Unknown error'));
            }
          } catch (e) {
            console.error('Payment callback error:', e);
            setError("Payment verification failed: " + e.message);
          } finally {
            setLoading(false);
          }
        },
        onclose: function () {
          setLoading(false);
        },
      });
    };

    // Check if Flutterwave script is loaded with timeout
    const scriptId = "flutterwave-script";
    let script = document.getElementById(scriptId);
    
    if (!script) {
      script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.id = scriptId;
      script.async = true;
      
      const timeoutId = setTimeout(() => {
        setError("Payment system timeout. Please refresh the page.");
        setLoading(false);
      }, 10000);
      
      script.onload = () => {
        clearTimeout(timeoutId);
        triggerPayment();
      };
      
      script.onerror = () => {
        clearTimeout(timeoutId);
        setError("Failed to load payment system. Please check your connection and refresh the page.");
        setLoading(false);
      };
      
      document.body.appendChild(script);
    } else {
      triggerPayment();
    }
  };

  const today = new Date();
  const maxDob = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())
    .toISOString().split('T')[0];

  const getStepComponent = () => {
    switch (step) {
      case STEPS.PERSONAL_INFO:
        return (
          <PersonalInfoStep
            form={form}
            phoneValue={phoneValue}
            handleChange={handleChange}
            updatePhone={updatePhone}
            maxDob={maxDob}
          />
        );
      case STEPS.EMAIL_VERIFICATION:
        return (
          <EmailVerificationStep
            email={form.email}
            checkingVerification={checkingVerification}
            resendCooldown={resendCooldown}
            onCheckVerification={handleCheckVerification}
            onResendVerification={handleResendVerification}
            loading={loading}
          />
        );
      case STEPS.PHOTO_UPLOAD:
        return <PhotoUploadStep form={form} handleChange={handleChange} />;
      case STEPS.PAYMENT:
        return <PaymentStep />;
      case STEPS.COMPLETE:
        return <CompletionStep paymentStatus={paymentStatus} />;
      default:
        return null;
    }
  };

  const getSubmitHandler = () => {
    switch (step) {
      case STEPS.PERSONAL_INFO:
        return handleInfoSubmit;
      case STEPS.PHOTO_UPLOAD:
        return handlePhotoSubmit;
      case STEPS.PAYMENT:
        return (e) => { e.preventDefault(); handleFlutterwavePayment(); };
      default:
        return (e) => e.preventDefault();
    }
  };

  const getButtonText = () => {
    if (loading) {
      switch (step) {
        case STEPS.PERSONAL_INFO: return 'Registering...';
        case STEPS.PHOTO_UPLOAD: return 'Uploading...';
        case STEPS.PAYMENT: return 'Processing Payment...';
        default: return 'Loading...';
      }
    }
    switch (step) {
      case STEPS.PERSONAL_INFO: return 'Next: Verify Email';
      case STEPS.PHOTO_UPLOAD: return 'Next: Payment';
      case STEPS.PAYMENT: return 'Pay ₦21,000 Now';
      default: return 'Continue';
    }
  };

  const showSubmitButton = [STEPS.PERSONAL_INFO, STEPS.PHOTO_UPLOAD, STEPS.PAYMENT].includes(step);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center">
      <AuthInfoSection/>
      <div className="flex flex-1 flex-col items-center justify-center w-full lg:w-1/2 px-4 py-8">
        <div className="flex justify-center mb-6 lg:hidden">
          <img src="/logo-50x100.jpg" alt="Logo" width={300} height={120} />
        </div>
        <form
          onSubmit={getSubmitHandler()}
          className="bg-[#343940] p-6 rounded shadow-md w-full max-w-md"
          encType="multipart/form-data"
        >
          <h2 className="text-2xl mb-4 text-white text-center">Application Form</h2>
          <StepProgress currentStep={step} />
          {error && <div className="mb-4 text-red-500 text-sm py-2 px-3 bg-red-100/10 rounded border border-red-500/50">{error}</div>}
          
          {getStepComponent()}

          {showSubmitButton && (
            <div className="space-y-3 mt-4">
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                {loading && <FaSpinner className="animate-spin mr-2" />}
                {getButtonText()}
              </button>
              
              {/* Skip button for Photo Upload step */}
              {step === STEPS.PHOTO_UPLOAD && (
                <button
                  type="button"
                  onClick={handleSkipPhoto}
                  className="w-full bg-transparent border border-gray-500 text-gray-300 hover:bg-gray-700 py-2 rounded flex items-center justify-center text-sm disabled:opacity-50"
                  disabled={loading}
                >
                  Skip for now
                </button>
              )}
            </div>
          )}

          <p className="mt-4 text-gray-400 text-xs text-center">
            Already have an account? <a href="/login" className="text-blue-400 hover:underline">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}