import React, { useState } from 'react';

export default function PaymentAmountModal({ isOpen, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setError('');
    onSubmit(num);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-sm border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-white">Enter Payment Amount iN NGN</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            min="1"
            step="0.01"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            placeholder="Amount (NGN)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
          {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 text-white transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white font-bold transition-colors"
            >
              Proceed to Pay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}