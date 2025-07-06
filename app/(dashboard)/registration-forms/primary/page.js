'use client'
import PrimaryApplicationInstructions from '@/components/form/PrimaryApplicationInstructions';
import FormNavigation from '@/components/form/FormNavigation';
import PrimaryInstructions from '@/components/form/PrimaryInstructions';
import PrimaryStepAttachmentsDeclaration from '@/components/form/PrimaryStepAttachmentsDeclaration';
import PrimaryEducationalDetails from '@/components/form/PrimaryEducationalDetails';
import StepPrimaryPersonalDetails from '@/components/form/StepPrimaryPersonalDetails';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import PrimarySuccess from './success';



export default function PrimaryRegistration() {
  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    city: '',
    state: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    stateOfOrigin: '',
    
    // Educational Qualifications
    priamryInstitution: '',
    degreeYear: '',
    degreeSpecialization: '',
    trainingProgramInstitution: '',
    yearofgraduation: '',
    trainingCertificateObtained: false,
    
  
  });
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [declarationDate, setDeclarationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !user.uid) return;
    // Check if membership registration exists
    fetch(`/api/get-primary-registration?userId=${user.uid}`)
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          setShowSuccess(true);
        }
      });
  }, [user]);

  const totalSteps = 6;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleArrayChange = (field, index, key, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index][key] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field, template) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], { ...template }]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Helper to check if all required fields are filled for a step
  const isStepValid = () => {
    if (step === 0) {
      // Personal Details
      return (
        formData.fullName && formData.city && formData.state && formData.phoneNumber && formData.email && formData.dateOfBirth && formData.gender && formData.nationality && formData.stateOfOrigin
      );
    }
    if (step === 1) {
      // Educational Qualifications
      return (
        formData.degreeInstitution && formData.degreeYear && formData.degreeSpecialization
      );
    }
    if (step === 2) {
      // Attachments & Declaration
      return (
        formData.degreeCertificates && formData.trainingCertificate && formData.workExperienceProof && formData.cpdCertificates && formData.passportPhoto && declarationChecked && declarationDate
      );
    }
    return true;
  };

  const nextStep = () => {
    if (!isStepValid()) {
      toast.warn('Please complete all required fields before proceeding.');
      return;
    }
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  // Payment handler for Flutterwave
  const handleFlutterwavePayment = (userId, email, fullName, phoneNumber) => {
    // Load Flutterwave inline script
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => {
      window.FlutterwaveCheckout({
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
        tx_ref: `${userId}-Primary-${Date.now()}`,
        amount: ,
        currency: 'NGN',
        payment_options: 'banktransfer,card',
        customer: {
          email: email,
          name: fullName,
          phonenumber: phoneNumber,
        },
        customizations: {
          title: 'Primary Registration Fee',
          description: 'Primary registration payment for WACCPS',
          logo: '/logo-50x100.jpg',
        },
        callback: async function(response) {
          setLoading(true);
          try {
            const res = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tx_ref: response.transaction_id, userId }),
            });
            const data = await res.json();
            if (data.status === 'success') {
              toast.success('Payment completed successfully!');
              // Optionally redirect or update UI
            } else {
              toast.error('Payment not completed.');
            }
          } catch (e) {
            toast.error('Payment verification failed.');
          }
          setLoading(false);
        },
        onclose: function() {},
      });
    };
    document.body.appendChild(script);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!isStepValid()) {
      toast.error('Please complete all required fields before submitting.');
      return;
    }
    if (!user || !user.uid) {
      toast.error('You must be logged in to submit the form.');
      return;
    }
    setLoading(true);
    try {
      // 1. Upload files to R2
      const formDataToSend = new FormData();
      const fileFields = [
        'degreeCertificates',
        'trainingCertificate',
        'workExperienceProof',
        'cpdCertificates',
        'passportPhoto',
      ];
      fileFields.forEach((field) => {
        if (formData[field]) {
          formDataToSend.append(field, formData[field]);
        }
      });
      formDataToSend.append('userId', user.uid); // Use Firebase Auth userId
      const uploadRes = await fetch('/api/upload-Primary-files', {
        method: 'POST',
        body: formDataToSend,
      });
      if (!uploadRes.ok) throw new Error('File upload failed');
      const uploadData = await uploadRes.json();
      // 2. Save form data + file URLs to Firestore
      const saveRes = await fetch('/api/save-primary-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid, // Use Firebase Auth userId
          ...formData,
          fileUrls: uploadData.urls,
        }),
      });
      if (!saveRes.ok) throw new Error('Failed to save registration');
      const saveData = await saveRes.json();
      toast.success('Application submitted successfully!');
      // 3. Initiate payment
      handleFlutterwavePayment(
        user.uid,
        formData.email,
        formData.fullName,
        formData.phoneNumber
      );
      setShowSuccess(true); // Show success page after payment
    } catch (err) {
      toast.error(err.message || 'Submission failed.');
    }
    setLoading(false);
  };

  const alternativeRouteAnyFieldFilled = () => {
    return formData.experienceProof || (formData.conferencesAttended && formData.conferencesAttended.some(c => c.name || c.year)) || formData.cpdCertificates;
  };

  return (
    <>
      {showSuccess ? (
        <MembershipSuccess />
      ) : (
        <div className=" mx-auto lg:flex ">
          {/* <ToastContainer /> */}
          <div className=' flex-2'>
            <MembershipInstructions />
          </div>
          <div  className=" bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-blue-400 sm:text-3xl">
                  WEST AFRICAN COLLEGE OF CLINICAL PHYSIOLOGY SCIENCES
                </h1>
                <p className="mt-3 text-xl text-blue-200">
                  Primary Examination Application
                </p>
              </div>
              {!showForm ? (
                <ApplicationInstructions onBegin={() => setShowForm(true)} />
              ) : (
                <form onSubmit={submitForm} className="bg-gray-800 rounded-lg shadow-xl p-6 border border-blue-500">
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-blue-300">Step {step + 1} of {totalSteps}</span>
                      <span className="text-sm font-medium text-blue-300">
                        {Math.round(((step + 1) / totalSteps) * 100)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Step 1: Personal Information */}
                  {step === 0 && (
                    <StepPersonalDetails formData={formData} handleChange={handleChange} />
                  )}

                  {/* Step 2: Educational Qualifications */}
                  {step === 1 && (
                    <StepEducationalQualifications formData={formData} handleChange={handleChange} />
                  )}

                  {/* Navigation Buttons */}
                  <FormNavigation 
                    step={step} 
                    totalSteps={totalSteps} 
                    prevStep={prevStep} 
                    nextStep={nextStep} 
                    isStepValid={isStepValid}
                    nextLabel={step === 3 && !alternativeRouteAnyFieldFilled() ? 'Skip' : 'Next'}
                  />
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
