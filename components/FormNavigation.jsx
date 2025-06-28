import React from 'react';

export default function FormNavigation({ step, totalSteps, prevStep, nextStep, isStepValid, nextLabel = 'Next' }) {
  return (
    <div className="flex justify-between mt-8">
      {step > 0 && (
        <button type="button" onClick={prevStep} className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">
          Previous
        </button>
      )}
      {step < totalSteps - 1 && (
        <button
          type="button"
          onClick={nextStep}
          className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded ml-auto ${isStepValid && !isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isStepValid && !isStepValid()}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}
