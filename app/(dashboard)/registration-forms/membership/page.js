'use client'
import ApplicationInstructions from '@/components/form/ApplicationInstructions';
import FormNavigation from '@/components/form/FormNavigation';
import MembershipInstructions from '@/components/form/MembershipInstructions';
import StepAlternativeRoute from '@/components/form/StepAlternativeRoute';
import StepAttachmentsDeclaration from '@/components/form/StepAttachmentsDeclaration';
import StepEducationalQualifications from '@/components/form/StepEducationalQualifications';
import StepExaminationDetails from '@/components/form/StepExaminationDetails';
import StepPersonalDetails from '@/components/form/StepPersonalDetails';
import StepProfessionalExperience from '@/components/form/StepProfessionalExperience';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export default function MembershipRegistration() {
  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
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

  const submitForm = (e) => {
    e.preventDefault();
    if (!isStepValid()) {
      toast.error('Please complete all required fields before submitting.');
      return;
    }
    // Handle form submission here
    toast.success('Application submitted successfully!');
    // console.log('Form submitted:', formData);
    // alert('Application submitted successfully!');
  };

  const alternativeRouteAnyFieldFilled = () => {
    return formData.experienceProof || (formData.conferencesAttended && formData.conferencesAttended.some(c => c.name || c.year)) || formData.cpdCertificates;
  };

  return (
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
              Membership Examination Application
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
  );
}
