'use client'
import ApplicationInstructions from '@/components/form/ui/ApplicationInstructions';
import FormNavigation from '@/components/form/FormNavigation';
import FormInstructions from '@/components/form/ui/FormInstructions';
import StepAlternativeRoute from '@/components/form/StepAlternativeRoute';
import StepAttachmentsDeclaration from '@/components/form/StepAttachmentsDeclaration';
import StepEducationalQualifications from '@/components/form/StepEducationalQualifications';
import StepExaminationDetails from '@/components/form/StepExaminationDetails';
import StepPersonalDetails from '@/components/form/StepPersonalDetails';
import StepProfessionalExperience from '@/components/form/StepProfessionalExperience';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import MembershipSuccess from '../success';
import PaymentAmountModal from '@/components/PaymentAmountModal';



export default function MembershipRegistration() {
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
    degreeInstitution: '',
    degreeYear: '',
    degreeSpecialization: '',
    trainingProgramInstitution: '',
    trainingDuration: '',
    trainingCertificateObtained: false,
    
    // Professional Experience
    currentInstitution: '',
    currentPosition: '',
    employmentFrom: '',
    employmentTo: '',
    totalExperience: '',
    hospitalsWorked: [{ name: '', duration: '' }],
    supervisedPractice: false,
    supervisorDetails: '',
    
    // Alternative Route
    experienceProof: null,
    conferencesAttended: [{ name: '', year: '' }],
    
    // Examination Details
    examCenter: '',
    course: '',
    understandsWritten: false,
    understandsPractical: false,
    understandsCaseBased: false,
    
    // Attachments
    degreeCertificates: null,
    trainingCertificate: null,
    workExperienceProof: null,
    cpdCertificates: null,
    passportPhoto: null,
    feeReceipt: null,
  });
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [declarationDate, setDeclarationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

 // Instruction data for membership
 const membershipData = {
  title: "Training Requirements for Membership Examination",
  description: "The West African College of Clinical Physiology Sciences (WACCPS) requires candidates to undergo structured training programs before sitting for the Membership examination.",
  borderColor: "blue-400",
  buttonColor: "blue-600",
  textColor: "blue-300",
  trainingRequirements: [
    "Clinical Physiology Training: Candidates must complete a recognized training program in clinical physiology sciences.",
    "Practical Experience: Hands-on training in relevant clinical settings.",
    "Supervised Clinical Practice: Candidates are required to complete a specified period of supervised clinical practice."
  ],
  alternativeRouteTitle: "Alternative Route for Membership",
  alternativeRouteDescription: "Alternatively, candidates with significant experience in clinical physiology may be eligible to sit for the Membership examination.",
  alternativeRouteRequirements: [
    "Years of Experience: A minimum of 5 years of experience working in a clinical physiology unit, with evidence of continuous professional development.",
    "Professional Development: Candidates must provide evidence of ongoing professional development, including attendance at conferences, workshops, and relevant training programs."
  ],
  examinationFormat: [
    "Written components (e.g., multiple-choice questions, short-answer questions)",
    "Practical components (e.g., clinical skills assessment)",
    "Case-based discussions"
  ],
  submissionRequirements: [
    "Submit completed form + required documents",
    "Please note that all payments are non-refundable."
  ],
  notes: [
    "Incomplete forms will be rejected.",
    "Successful candidates will receive an exam date via email."
  ],
  contactEmail: "info.waccps@gmail.com",
  contactPhone: "07061543295",
  downloadFilename: "WACCPS MEMBERSHIP FORM.pdf"
};


  
  useEffect(() => {
    if (!user || !user.uid) return;
    // Check if membership registration exists
    fetch(`/api/get-membership-registration?userId=${user.uid}`)
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
      // Professional Experience
      return (
        formData.currentInstitution && formData.currentPosition && formData.employmentFrom && formData.employmentTo && formData.totalExperience
      );
    }
    if (step === 3) {
      // Alternative Route: skippable unless any field is filled
      const anyFilled = formData.experienceProof || (formData.conferencesAttended && formData.conferencesAttended.some(c => c.name || c.year)) || formData.cpdCertificates;
      if (!anyFilled) return true; // allow skip
      // If any field is filled, all must be filled
      return (
        formData.experienceProof && formData.cpdCertificates && formData.conferencesAttended && formData.conferencesAttended.every(c => c.name && c.year)
      );
    }
    if (step === 4) {
      // Examination Details
      return (
        formData.examCenter && formData.understandsWritten && formData.understandsPractical && formData.understandsCaseBased
      );
    }
    if (step === 5) {
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

  // Payment handler using modal
  const handleAmountSubmit = (amount) => {
    setShowAmountModal(false);
    setPaymentAmount(amount);
    proceedWithPayment(amount);
  };

  // Payment logic using entered amount
  const proceedWithPayment = async (amount) => {
    setLoading(true);
    try {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      script.onload = () => {
        window.FlutterwaveCheckout({
          public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
          tx_ref: `MEMBERSHIP-${user.uid}-${Date.now()}`,
          amount: amount,
          currency: 'NGN',
          payment_options: 'card,banktransfer',
          customer: {
            email: formData.email,
            name: formData.fullName,
          },
          customizations: {
            title: 'WACCPS Membership Registration Fee',
            description: 'Membership Registration Payment',
            logo: '/logo.jpg',
          },
          callback: async (response) => {
            if (response.status === 'successful') {
              setPaymentSuccess(true);
              toast.success('Payment successful! Now complete your application.');
            } else {
              toast.error('Payment not completed.');
            }
            setLoading(false);
          },
        });
      };
      document.body.appendChild(script);
    } catch (error) {
      toast.error(error.message || 'Payment failed.');
      setLoading(false);
    }
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
    if (!paymentSuccess) {
      setShowAmountModal(true);
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
      const uploadRes = await fetch('/api/upload-membership-files', {
        method: 'POST',
        body: formDataToSend,
      });
      if (!uploadRes.ok) throw new Error('File upload failed');
      const uploadData = await uploadRes.json();
      // 2. Save form data + file URLs to Firestore
      const saveRes = await fetch('/api/save-membership-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid, // Use Firebase Auth userId
          ...formData,
          fileUrls: uploadData.urls,
          paymentAmount: paymentAmount,
        }),
      });
      if (!saveRes.ok) throw new Error('Failed to save registration');
      const saveData = await saveRes.json();
      toast.success('Application submitted successfully!');
      setShowSuccess(true); // Show success page
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
      <PaymentAmountModal
        isOpen={showAmountModal}
        onClose={() => setShowAmountModal(false)}
        onSubmit={handleAmountSubmit}
      />
      {showSuccess ? (
        <MembershipSuccess />
      ) : (
        <div className=" mx-auto lg:flex ">
          {/* <ToastContainer /> */}
          <div className=' flex-2'>
            <FormInstructions {...membershipData}/>
          </div>
          <div  className=" bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-blue-400 sm:text-3xl">
                  WEST AFRICAN COLLEGE OF CLINICAL PHYSIOLOGY SCIENCES
                </h1>
                <p className="mt-3 text-xl text-blue-200">
                  Membership Examination Application
                </p>
              </div>
              {!showForm ? (
                <ApplicationInstructions formName="Membership" onBegin={() => setShowForm(true)} />
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

                  {/* Step 1: Personal Details */}
                  {step === 0 && (
                    <StepPersonalDetails formData={formData} handleChange={handleChange} />
                  )}

                  {/* Step 2: Educational Qualifications */}
                  {step === 1 && (
                    <StepEducationalQualifications formData={formData} handleChange={handleChange} />
                  )}

                  {/* Step 3: Professional Experience */}
                  {step === 2 && (
                    <StepProfessionalExperience formData={formData} handleChange={handleChange} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
                  )}

                  {/* Step 4: Alternative Route */}
                  {step === 3 && (
                    <StepAlternativeRoute formData={formData} handleChange={handleChange} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
                  )}

                  {/* Step 5: Examination Details */}
                  {step === 4 && (
                    <StepExaminationDetails formData={formData} handleChange={handleChange} />
                  )}

                  {/* Step 6: Attachments & Declaration */}
                  {step === 5 && (
                    <StepAttachmentsDeclaration
                      formData={formData}
                      handleChange={handleChange}
                      handleFileChange={handleFileChange}
                      declarationChecked={declarationChecked}
                      setDeclarationChecked={setDeclarationChecked}
                      declarationDate={declarationDate}
                      setDeclarationDate={setDeclarationDate}
                    />
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
