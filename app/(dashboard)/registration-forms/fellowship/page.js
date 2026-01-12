'use client'
import ApplicationInstructions from '@/components/form/ui/ApplicationInstructions';
import FormNavigation from '@/components/form/FormNavigation';
import PaymentAmountModal from '@/components/PaymentAmountModal';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormInstructions from '@/components/form/ui/FormInstructions';
import StepHigherQualifications from '@/components/form/Fellowship/StepHigherQualifications';
import StepPersonalDetails from '@/components/form/Fellowship/StepPersonalDetails';
import StepProfessionalExperience from '@/components/form/Fellowship/StepProfessionalExperience';
import StepResearchPublications from '@/components/form/Fellowship/StepResearchPublications';
import StepAlternativeRoute from '@/components/form/Fellowship/StepAlternativeRoute';
import StepExamDetails from '@/components/form/Fellowship/StepExamDetails';
import StepAttachmentsDeclaration from '@/components/form/Fellowship/StepAttachmentsDeclaration';
import { useRouter } from 'next/navigation';
import Success from '../success';

export default function FellowshipRegistration() {
  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    // SECTION A: PERSONAL DETAILS
    fullName: '',
    professionalTitle: '',
    mwccps: '',
    otherTitle: '',
    contactAddress: '',
    city: '',
    state: '',
    country: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    stateOfOrigin: '',
    
    // SECTION B: HIGHER QUALIFICATIONS & SPECIALIZATION
    mwccpsAwardYear: '',
    mwccpsInstitution: '',
    advancedTrainingInstitution: '',
    advancedTrainingDuration: '',
    specializationArea: '',
    advancedCertificateObtained: false,
    additionalQualifications: [{ degree: '', institution: '', year: '' }],
    
    // SECTION C: PROFESSIONAL EXPERIENCE & LEADERSHIP
    currentInstitution: '',
    currentJobTitle: '',
    employmentFrom: '',
    employmentTo: '',
    totalPracticeYears: '',
    leadershipRoles: [{ role: '', institution: '', duration: '' }],
    teachingExperience: [{ institution: '', role: '', duration: '' }],
    
    // SECTION D: RESEARCH & PUBLICATIONS
    researchPapers: [{ title: '', journal: '', year: '' }],
    conferencePresentations: [{ title: '', event: '', year: '' }],
    researchSupervised: [{ title: '', institution: '', year: '' }],
    
    // SECTION E: ALTERNATIVE ROUTE
    altRoles: [{ role: '', institution: '', duration: '' }],
    altAwards: '',
    altPolicyDocs: '',
    
    // SECTION F: EXAMINATION DETAILS
    examCenter: '',
    understandsWritten: false,
    understandsCaseDefense: false,
    understandsThesis: false,
    course: '',
    
    // SECTION G: ATTACHMENTS & DECLARATION
    mwccpsCertificate: null,
    trainingCertificates: null,
    employmentLetters: null,
    publishedPapers: null,
    conferenceCertificates: null,
    passportPhotos: null,
    declarationChecked: false,
    declarationDate: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const totalSteps = 7;

 // Instruction data for fellowship
 const fellowshipData = {
  title: "Fellowship Requirements (FWCCPS/DCP)",
  description: "The West African College of Clinical Physiology Sciences (WACCPS) fellowship program requires advanced training and significant contributions to the field.",
  borderColor: "purple-500",
  buttonColor: "purple-600",
  textColor: "purple-300",
  trainingRequirements: [
    "Advanced Clinical Physiology Training: Candidates must complete advanced training in a specialized area of clinical physiology sciences.",
    "Research and Publication: Conduct original research, publish papers, and present at conferences.",
    "Leadership and Expertise: Demonstrate leadership including mentorship, teaching, or professional service."
  ],
  alternativeRouteTitle: "Alternative Route for Fellowship",
  alternativeRouteDescription: "Candidates with extensive experience may be eligible to sit for the Fellowship examination.",
  alternativeRouteRequirements: [
    "Years of Experience: Minimum 10 years in clinical physiology with evidence of significant contributions.",
    "Professional Achievements: Publications, presentations, and leadership roles.",
    "Interview: May be required for alternative route candidates."
  ],
  examinationFormat: [
    "Advanced Written Papers",
    "Clinical Case Defense",
    "Research Thesis Evaluation"
  ],
  submissionRequirements: [
    "MWCCPS Certificate",
    "Professional Training Certificates",
    "Employment Verification Letters",
    "Published Papers (Minimum 2)",
    "Conference Certificates",
    "Passport Photos (2)",
    "All payments are non-refundable"
  ],
  notes: [
    "Incomplete applications will not be processed.",
    "Interview may be required for alternative route candidates."
  ],
  contactEmail: "info.waccps@gmail.com",
  contactPhone: "07061543295",
  downloadFilename: "WACCPS Fellowship form.pdf"
};

  useEffect(() => {
    if (!user || !user.uid) return;
    // Check if fellowship registration exists
    fetch(`/api/get-fellowship-registration?userId=${user.uid}`)
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          setShowSuccess(true);
        }
      });
  }, [user]);

  // Handlers for input, file, array, navigation, validation, and submit logic will be implemented here, tailored for fellowship fields and steps.

  // Input change handler
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  // File change handler
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    // For multi-file fields, store the FileList as an array
    if (name === 'publishedPapers' || name === 'passportPhotos') {
        setFormData(prev => ({ ...prev, [name]: Array.from(files) }));
    } else {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  // Direct file state updater for improved UI
  const handleFileUpdate = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Array field change handler
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

  // Step validation logic
  const isStepValid = () => {
    if (step === 0) {
      // Personal Details validation
      return (
        formData.fullName &&
        formData.professionalTitle && // This checks if any radio is selected
        formData.city &&
        formData.state &&
        formData.country &&
        formData.phoneNumber &&
        formData.email &&
        formData.dateOfBirth &&
        formData.gender && // This checks if any gender is selected
        formData.nationality &&
        formData.stateOfOrigin
      );
    }
    if (step === 1) {
      // Higher Qualifications & Specialization
      return (
        formData.mwccpsAwardYear && formData.mwccpsInstitution && formData.advancedTrainingInstitution && formData.advancedTrainingDuration && formData.specializationArea
      );
    }
    if (step === 2) {
      // Professional Experience & Leadership
      return (
        formData.currentInstitution && formData.currentJobTitle && formData.employmentFrom && formData.employmentTo && formData.totalPracticeYears
      );
    }
    if (step === 3) {
      // Research & Publications
      return (
        formData.researchPapers && formData.researchPapers.length > 0 && formData.researchPapers[0].title && formData.conferencePresentations && formData.conferencePresentations.length > 0 && formData.conferencePresentations[0].title
      );
    }
    if (step === 4) {
      // Alternative Route (optional, can skip if not filled)
      const anyFilled = formData.altRoles.some(r => r.role || r.institution || r.duration) || formData.altAwards || formData.altPolicyDocs;
      if (!anyFilled) return true;
      return (
        formData.altRoles.every(r => r.role && r.institution && r.duration) && formData.altAwards && formData.altPolicyDocs
      );
    }
    if (step === 5) {
      // Examination Details
      return (
        formData.examCenter && formData.course && formData.understandsWritten && formData.understandsCaseDefense && formData.understandsThesis
      );
    }
    if (step === 6) {
      // Attachments & Declaration
      return (
        formData.mwccpsCertificate && formData.trainingCertificates && formData.employmentLetters && formData.publishedPapers && formData.conferenceCertificates && formData.passportPhotos && formData.declarationChecked && formData.declarationDate
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
      // First create payment record
      const paymentRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          amount: amount,
          paymentType: 'fellowship',
          txRef: `FELLOWSHIP-${user.uid}-${Date.now()}`,
          description: 'Fellowship Examination Registration Fee',
          customerEmail: formData.email,
          customerName: formData.fullName,
        }),
      });

      if (!paymentRes.ok) throw new Error('Failed to create payment record');
      const paymentData = await paymentRes.json();

      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      script.onload = () => {
        window.FlutterwaveCheckout({
          public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
          tx_ref: paymentData.paymentData.txRef,
          amount: amount,
          currency: 'NGN',
          payment_options: 'card,banktransfer',
          customer: {
            email: formData.email,
            name: formData.fullName,
          },
          customizations: {
            title: 'WACCPS Fellowship Registration Fee',
            description: 'Fellowship Registration Payment',
            logo: '/logo.jpg',
          },
          callback: async (response) => {
            if (response.status === 'successful') {
              // Verify payment
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  transaction_id: response.transaction_id,
                  tx_ref: response.tx_ref,
                  userId: user.uid,
                  paymentType: 'fellowship'
                }),
              });
              
              if (verifyRes.ok) {
                setPaymentSuccess(true);
                toast.success('Payment successful! Now complete your application.');
              } else {
                toast.error('Payment verification failed.');
              }
            } else {
              toast.error('Payment not completed.');
            }
            setLoading(false);
          },
          onclose: function() {
            setLoading(false);
          }
        });
      };
      document.body.appendChild(script);
    } catch (error) {
      toast.error(error.message || 'Payment failed.');
      setLoading(false);
    }
  };

  // Modified submitForm: require payment before submission
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
        'mwccpsCertificate',
        'trainingCertificates',
        'employmentLetters',
        'publishedPapers',
        'conferenceCertificates',
        'passportPhotos',
      ];
      fileFields.forEach((field) => {
        if (formData[field]) {
           if (Array.isArray(formData[field])) {
               // Append each file in the array with the SAME key
               formData[field].forEach(file => {
                   formDataToSend.append(field, file);
               });
           } else {
               formDataToSend.append(field, formData[field]);
           }
        }
      });
      formDataToSend.append('userId', user.uid);
      const uploadRes = await fetch('/api/upload-fellowship-files', {
        method: 'POST',
        body: formDataToSend,
      });
      if (!uploadRes.ok) throw new Error('File upload failed');
      const uploadData = await uploadRes.json();
      // 2. Save form data + file URLs to Firestore
      const saveRes = await fetch('/api/save-fellowship-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          ...formData,
          fileUrls: uploadData.urls,
          paymentAmount: paymentAmount,
        }),
      });
      if (!saveRes.ok) throw new Error('Failed to save registration');
      const saveData = await saveRes.json();
      toast.success('Fellowship application submitted successfully!');
      setShowSuccess(true);
    } catch (err) {
      toast.error(err.message || 'Submission failed.');
    }
    setLoading(false);
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
          <div className="flex-2">
            <FormInstructions {...fellowshipData} />
          </div>
          <div className="bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-blue-400 sm:text-3xl">
                  WEST AFRICAN COLLEGE OF CLINICAL PHYSIOLOGY SCIENCES
                </h1>
                <p className="mt-3 text-xl text-blue-200">
                  Fellowship Examination Application
                </p>
              </div>
              {!showForm ? (
                <ApplicationInstructions formName={'Fellowship'} onBegin={() => setShowForm(true)} />
              ) : (
                <form onSubmit={submitForm} className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-purple-500/30">
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
                    <StepPersonalDetails 
                      formData={formData} 
                      handleChange={handleChange} 
                    />
                  )}
                  {step === 1 && (
                    <StepHigherQualifications 
                      formData={formData} 
                      handleChange={handleChange} 
                      handleArrayChange={handleArrayChange} 
                      addArrayItem={addArrayItem} 
                      removeArrayItem={removeArrayItem} 
                    />
                  )}
                  {step === 2 && (
                    <StepProfessionalExperience 
                      formData={formData} 
                      handleChange={handleChange} 
                      handleArrayChange={handleArrayChange} 
                      addArrayItem={addArrayItem} 
                      removeArrayItem={removeArrayItem} 
                    />
                  )}
                  {step === 3 && (
                    <StepResearchPublications 
                      formData={formData} 
                      handleChange={handleChange} 
                      handleArrayChange={handleArrayChange} 
                      addArrayItem={addArrayItem} 
                      removeArrayItem={removeArrayItem} 
                    />
                  )}
                  {step === 4 && (
                    <StepAlternativeRoute 
                      formData={formData} 
                      handleChange={handleChange} 
                      handleArrayChange={handleArrayChange} 
                      addArrayItem={addArrayItem} 
                      removeArrayItem={removeArrayItem} 
                    />
                  )}
                  {step === 5 && (
                    <StepExamDetails 
                      formData={formData} 
                      handleChange={handleChange} 
                    />
                  )}
                  {step === 6 && (
                    <StepAttachmentsDeclaration 
                      formData={formData} 
                      handleChange={handleChange} 
                      handleFileChange={handleFileChange}
                      handleFileUpdate={handleFileUpdate} 
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
                      className={`w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Fellowship Application'}
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
