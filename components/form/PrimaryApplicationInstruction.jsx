import { useState } from 'react';

export default function PrimaryInstructions({ onBegin }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8 border border-blue-500">
      <h2 className="text-2xl font-bold text-blue-300 mb-4">Application Instructions</h2>
   
      <div className="flex items-center mb-4">
        <input
          id="understand-checkbox"
          type="checkbox"
          required
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
          className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-600 rounded"
        />
        <label htmlFor="understand-checkbox" className="ml-2 block text-gray-300">
          I have read the documents and understand the requirements and examination format
        </label>
      </div>
      <button
        onClick={() => checked && onBegin()}
        disabled={!checked}
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center ${!checked ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Begin Primary Registration
        <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
