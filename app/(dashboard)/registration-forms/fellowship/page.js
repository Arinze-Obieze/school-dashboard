'use client'
import ApplicationInstructions from '@/components/form/ui/ApplicationInstructions';
import FormNavigation from '@/components/form/FormNavigation';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
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
    feeReceipt: null,
    declarationChecked: false,
    declarationDate: '',
  });


  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
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
    "Application Fee Receipt",
    "All payments are non-refundable"
  ],
  notes: [
    "Incomplete applications will not be processed.",
    "Interview may be required for alternative route candidates."
  ],
  contactEmail: "info.waccps@gmail.com",
  contactPhone: "07061543295",
  downloadFilename: "WACCPS MEMBERSHIP FORM.pdf"
};

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
    setFormData(prev => ({ ...prev, [name]: files[0] }));
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
        formData.mwccpsCertificate && formData.trainingCertificates && formData.employmentLetters && formData.publishedPapers && formData.conferenceCertificates && formData.passportPhotos && formData.feeReceipt && formData.declarationChecked && formData.declarationDate
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

  // Flutterwave payment handler
  const handleFlutterwavePayment = () => {
    // You can customize the payment details as needed
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => {
      window.FlutterwaveCheckout({
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
        tx_ref: `FW-FELLOWSHIP-${user.uid}-${Date.now()}`,
        amount: 50000, // Set your fee amount
        currency: 'NGN',
        payment_options: 'card,banktransfer',
        customer: {
          email: formData.email,
          name: formData.fullName,
        },
        customizations: {
          title: 'WACCPS Fellowship Application Fee',
          description: 'Fellowship Registration Payment',
          logo: '/logo.jpg',
        },
        callback: async (response) => {
          if (response.status === 'successful') {
            // Optionally verify payment on backend
            await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tx_ref: response.tx_ref, userId: user.uid }),
            });
            toast.success('Payment successful!');
            // Optionally show a success screen or redirect
          } else {
            toast.error('Payment not completed.');
          }
        },
        onclose: () => {},
      });
    };
    document.body.appendChild(script);
  };

  // Submit logic
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
        'mwccpsCertificate',
        'trainingCertificates',
        'employmentLetters',
        'publishedPapers',
        'conferenceCertificates',
        'passportPhotos',
        'feeReceipt',
      ];
      fileFields.forEach((field) => {
        if (formData[field]) {
          formDataToSend.append(field, formData[field]);
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
        }),
      });
      if (!saveRes.ok) throw new Error('Failed to save registration');
      toast.success('Fellowship application submitted successfully!');
      // 3. Trigger Flutterwave payment
      handleFlutterwavePayment();
    } catch (err) {
      toast.error(err.message || 'Submission failed.');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="mx-auto lg:flex">
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
              <ApplicationInstructions formName={'Followship'} onBegin={() => setShowForm(true)} />
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
    </>
  );
}
