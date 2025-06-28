import React from 'react';

export default function FormNavigation({ step, totalSteps, prevStep, nextStep, isStepValid, isAlternativeRoute, anyAltRouteFilled }) {
  // For Alternative Route step, show Skip if empty, else Next/Submit
  let nextLabel = 'Next';
  if (isAlternativeRoute) {
    nextLabel = anyAltRouteFilled ? 'Next' : 'Skip';
  }
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
          className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded ml-auto ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isStepValid()}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}
