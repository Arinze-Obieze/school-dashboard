import React from 'react';

export default function FellowshipInstructions({ onBegin }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8 border border-purple-500">
      <h2 className="text-2xl font-bold text-purple-300 mb-4">Fellowship Requirements</h2>
      <div className="space-y-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-purple-300">Training Requirements</h3>
            <ul className="mt-1 text-gray-300 list-disc pl-5 space-y-1">
              <li>Advanced Clinical Physiology Training</li>
              <li>Research and Publication</li>
              <li>Leadership and Expertise demonstration</li>
            </ul>
          </div>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-purple-300">Alternative Pathway</h3>
            <p className="mt-1 text-gray-300">
              10+ years experience with significant contributions to the field (publications, leadership, etc.)
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-purple-300">Examination Format</h3>
            <ul className="mt-1 text-gray-300 list-disc pl-5 space-y-1">
              <li>Advanced Written Papers</li>
              <li>Clinical Case Defense</li>
              <li>Research Thesis Evaluation</li>
            </ul>
          </div>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-purple-300">Application Fee</h3>
            <p className="mt-1 text-gray-300">
              ₦800,000 / $370 (Non-refundable). Payable via WACCPS website payment portal.
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-purple-300">Submission</h3>
            <p className="mt-1 text-gray-300">
              Submit completed form with required documents to www.waccps.org. Incomplete forms will be rejected.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center mb-4">
        <input
          id="understand-checkbox"
          type="checkbox"
          className="h-4 w-4 text-purple-500 focus:ring-purple-400 border-gray-600 rounded"
          required
        />
        <label htmlFor="understand-checkbox" className="ml-2 block text-gray-300">
          I understand the fellowship requirements and examination format
        </label>
      </div>
      <button
        onClick={onBegin}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
      >
        Begin Fellowship Application
        <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
