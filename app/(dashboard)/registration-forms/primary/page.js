'use client'
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

// Components
import ApplicationInstructions from '@/components/form/ui/ApplicationInstructions';
import FormNavigation from '@/components/form/FormNavigation';
import Success from '../success';
import FormInstructions from '@/components/form/ui/FormInstructions';
import StepPersonalDetails from '@/components/form/Primary/StepPersonalDetails';
import StepDemographicInfo from '@/components/form/Primary/StepDemographicInfo';
import StepInstitutionDetails from '@/components/form/Primary/StepInstitutionDetails';
import StepCareerIntentions from '@/components/form/Primary/StepCareerIntentions';
import StepAttachmentsDeclaration from '@/components/form/Primary/StepAttachmentsDeclaration';
import PaymentAmountModal from '@/components/PaymentAmountModal';

export default function PrimaryRegistration() {
  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Details
    title: '',
    otherTitle: '',
    surname: '',
    firstName: '',
    middleName: '',
    email: '',
    phoneNumber: '',
    
    // Demographic Information
    dateOfBirth: '',
    gender: '',
    nationality: '',
    streetAddress: '',
    city: '',
    state: '',
    stateOfOrigin: '',
    country: '',
    postalCode: '',
    
    // Institution Details
    institutionName: '',
    graduationYear: '',
    courseSelection: '',
    
    // Career Intentions
    practiceAbroad: '',
    
    // Declaration
    declarationChecked: false,
    declarationDate: '',
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(null);
  const { user } = useAuth();
  const router = useRouter();
  const totalSteps = 5;

  const primaryExamData = {
    title: "Primary Examination Requirements (WACCPS)",
    description: `The primary examination is the first step in the WACCPS's examination process. It assesses
candidates' foundational knowledge in clinical physiology sciences.`,
    borderColor: "blue-500",
    buttonColor: "blue-600",
    textColor: "blue-300",    textColor: "blue-300",

    eligibility: [
      "Relevant Degree: Candidates must hold a degree in a related field.",
      "Certified Training: Completion of a certified training program."
    ],
    examinationFormat: [
      "Multiple-Choice Questions (MCQs)",
      "Short-Answer Questions",
      "Practical/Clinical Components (if applicable)"
    ],
    submissionRequirements: [
      "Completed Registration Form",
      "Degree Certificate",
      "Training Program Certification",
      "Passport Photos (2 copies)",
      "Application Fee Receipt"
    ],
    notes: [
      "All payments are non-refundable.",
      "Falsified information will result in disqualification.",
      "Select 1-2 course specializations."
    ],
    contactEmail: "info.waccps@gmail.com",
    contactPhone: "07061543295",
    downloadFilename: "WACCPS PRIMARY FORM.pdf"
  };

  useEffect(() => {
    if (!user?.uid) return;
    checkExistingRegistration();
  }, [user]);

  const checkExistingRegistration = async () => {
    try {
      const res = await fetch(`/api/get-primary-registration?userId=${user.uid}`);
      const data = await res.json();
      if (data.exists) setShowSuccess(true);
    } catch (error) {
      console.error('Registration check failed:', error);
    }
  };

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

  const handleCourseSelection = (selectedCourses) => {
    setFormData(prev => ({
      ...prev,
      courseSelection: selectedCourses
    }));
  };

  const isStepValid = () => {
    const validations = [
      // Step 0: Personal Details
      () => formData.title && formData.surname && formData.firstName && 
            formData.email && formData.phoneNumber,
      
      // Step 1: Demographic Information
      () => formData.dateOfBirth && formData.gender && formData.nationality && 
            formData.streetAddress && formData.city && formData.state && formData.country,
      
      // Step 2: Institution Details
      () => formData.institutionName && formData.graduationYear && 
            formData.courseSelection,
      
      // Step 3: Career Intentions
      () => formData.practiceAbroad !== '',
      
      // Step 4: Attachments & Declaration
      () =>  formData.declarationChecked
    ];
    
    return validations[step] ? validations[step]() : true;
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

  const handlePayment = async (docId) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    
    script.onload = () => {
      window.FlutterwaveCheckout({
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
        tx_ref: `PRIMARY-${user.uid}-${Date.now()}`,
        amount: 30000,
        currency: 'NGN',
        payment_options: 'card,banktransfer',
        customer: {
          email: formData.email,
          name: `${formData.surname} ${formData.firstName}`,
        },
        customizations: {
          title: 'WACCPS Primary Examination Fee',
          description: 'Primary Registration Payment',
          logo: '/logo.jpg',
        },
        callback: async (response) => {
          if (response.status === 'successful') {
            await updateRegistrationWithPayment(docId, response);
            toast.success('Payment successful! Application updated.');
          } else {
            toast.error('Payment not completed.');
          }
        },
      });
    };
    
    document.body.appendChild(script);
  };

  const updateRegistrationWithPayment = async (docId, paymentResponse) => {
    try {
      await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tx_ref: paymentResponse.tx_ref, 
          userId: user.uid 
        }),
      });

      await fetch('/api/save-primary-registration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          docId,
          paymentStatus: 'successful',
          paymentRef: paymentResponse.tx_ref,
          paymentResponse,
        }),
      });
    } catch (error) {
      console.error('Payment update failed:', error);
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!isStepValid()) {
      toast.error('Please complete all required fields before submitting.');
      return;
    }
    if (!user?.uid) {
      toast.error('You must be logged in to submit the form.');
      return;
    }
    setShowAmountModal(true);
  };

  const handleAmountSubmit = (amount) => {
    setShowAmountModal(false);
    setPaymentAmount(amount);
    proceedWithPayment(amount);
  };

  const proceedWithPayment = async (amount) => {
    setLoading(true);
    try {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      script.onload = () => {
        window.FlutterwaveCheckout({
          public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
          tx_ref: `PRIMARY-${user.uid}-${Date.now()}`,
          amount: amount,
          currency: 'NGN',
          payment_options: 'card,banktransfer',
          customer: {
            email: formData.email,
            name: `${formData.surname} ${formData.firstName}`,
          },
          customizations: {
            title: 'WACCPS Primary Examination Fee',
            description: 'Primary Registration Payment',
            logo: '/logo.jpg',
          },
          callback: async (response) => {
            if (response.status === 'successful') {
              try {
                const res = await fetch('/api/save-primary-registration', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user.uid,
                    ...formData,
                    paymentStatus: 'successful',
                    paymentRef: response.tx_ref,
                    paymentAmount: amount,
                  }),
                });
                if (!res.ok) throw new Error('Failed to save registration');
                toast.success('Payment and registration successful!');
                setShowSuccess(true);
              } catch (err) {
                toast.error('Payment succeeded but registration failed. Please contact support.');
              }
            } else {
              toast.error('Payment not completed.');
            }
            setLoading(false);
          },
        });
      };
      document.body.appendChild(script);
    } catch (error) {
      toast.error(error.message || 'Submission failed.');
      setLoading(false);
    }
  };

  const uploadFiles = async () => {
    const formDataToSend = new FormData();
    const fileFields = [
      'degreeCertificate',
      'trainingCertificate',
      'passportPhotos',
      'feeReceipt',
    ];

    fileFields.forEach(field => {
      if (formData[field]) formDataToSend.append(field, formData[field]);
    });
    formDataToSend.append('userId', user.uid);

    const res = await fetch('/api/upload-primary-files', {
      method: 'POST',
      body: formDataToSend,
    });

    if (!res.ok) throw new Error('File upload failed');
    return await res.json();
  };

  const saveRegistration = async (fileUrls) => {
    const res = await fetch('/api/save-primary-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.uid,
        ...formData,
        fileUrls,
      }),
    });

    if (!res.ok) throw new Error('Failed to save registration');
    return await res.json();
  };

  return (
    <>
      <PaymentAmountModal
        isOpen={showAmountModal}
        onClose={() => setShowAmountModal(false)}
        onSubmit={handleAmountSubmit}
      />
      {showSuccess ? (
        <Success />
      ) : (
        <div className="mx-auto lg:flex min-h-screen">
          <div className="lg:w-1/3 bg-gray-800 p-6">
            <FormInstructions {...primaryExamData} />
          </div>
          
          <div className="lg:w-2/3 bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-blue-400">
                  WEST AFRICAN COLLEGE OF CLINICAL PHYSIOLOGY SCIENCES
                </h1>
                <p className="mt-3 text-xl text-blue-200">
                  Primary Examination Application
                </p>
              </div>
              
              {!showForm ? (
                <ApplicationInstructions 
                  formName={'Primary Examination'} 
                  onBegin={() => setShowForm(true)} 
                />
              ) : (
                <form onSubmit={submitForm} className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-blue-500/30">
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-blue-300">
                        Step {step + 1} of {totalSteps}
                      </span>
                      <span className="text-sm font-medium text-blue-300">
                        {Math.round(((step + 1) / totalSteps) * 100)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Form Steps */}
                  {step === 0 && (
                    <StepPersonalDetails 
                      formData={formData} 
                      handleChange={handleChange} 
                    />
                  )}
                  
                  {step === 1 && (
                    <StepDemographicInfo 
                      formData={formData} 
                      handleChange={handleChange} 
                    />
                  )}
                  
                  {step === 2 && (
                    <StepInstitutionDetails 
                      formData={formData} 
                      handleChange={handleChange}
                      onCourseSelection={(e) => handleCourseSelection(e.target.value)}
                      />
                  )}
                  
                  {step === 3 && (
                    <StepCareerIntentions 
                      formData={formData} 
                      handleChange={handleChange} 
                    />
                  )}
                  
                  {step === 4 && (
                    <StepAttachmentsDeclaration 
                      formData={formData} 
                      handleChange={handleChange} 
                      handleFileChange={handleFileChange} 
                    />
                  )}

                  <FormNavigation 
                    step={step}
                    totalSteps={totalSteps}
                    prevStep={prevStep}
                    nextStep={nextStep}
                    isStepValid={isStepValid}
                  />
                  
                  {step === totalSteps - 1 && (
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center ${
                        loading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : 'Submit Primary Application & Pay'}
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
