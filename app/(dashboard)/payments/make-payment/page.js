'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { FaChalkboardTeacher, FaHandshake, FaUserPlus, FaPencilAlt, FaCreditCard } from 'react-icons/fa';
import Link from 'next/link';

const paymentPurposes = [
  {
    id: 'primary',
    title: 'Primary Examination',
    icon: <FaChalkboardTeacher className="text-4xl" />,
    bg: '#9b59b6',
    description: 'Payment for Primary Examination registration or fees'
  },
  {
    id: 'fellowship',
    title: 'Fellowship',
    icon: <FaHandshake className="text-4xl" />,
    bg: '#f39c12',
    description: 'Payment for Fellowship registration or fees'
  },
  {
    id: 'membership',
    title: 'Membership',
    icon: <FaUserPlus className="text-4xl" />,
    bg: '#1abc9c',
    description: 'Payment for Membership fees'
  },
  {
    id: 'custom',
    title: 'Custom Payment',
    icon: <FaPencilAlt className="text-4xl" />,
    bg: '#3498db',
    description: 'Enter your own payment purpose'
  }
];

export default function MakePayment() {
  const { user } = useAuth();
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [customPurpose, setCustomPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, [user]);

  const handlePurposeSelect = (purpose) => {
    setSelectedPurpose(purpose);
    if (purpose.id !== 'custom') {
      setCustomPurpose('');
    }
  };

  const getPaymentDescription = () => {
    if (!selectedPurpose) return '';
    if (selectedPurpose.id === 'custom') {
      return customPurpose || 'Custom Payment';
    }
    const descriptions = {
      primary: 'Primary Examination Fee',
      fellowship: 'Fellowship Examination Fee',
      membership: 'Membership Fee Payment'
    };
    return descriptions[selectedPurpose.id] || 'Payment';
  };

  const validateForm = () => {
    if (!selectedPurpose) {
      toast.error('Please select a payment purpose');
      return false;
    }

    if (selectedPurpose.id === 'custom' && !customPurpose.trim()) {
      toast.error('Please enter a custom payment purpose');
      return false;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum < 1000) {
      toast.error('Please enter a valid amount (minimum ₦1,000)');
      return false;
    }

    if (!user?.uid) {
      toast.error('You must be logged in to make a payment');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const amountNum = parseFloat(amount);
      const paymentType = selectedPurpose.id;
      const txRef = `${paymentType.toUpperCase()}-${user.uid}-${Date.now()}`;

      // Create payment record
      const paymentRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          amount: amountNum,
          paymentType: paymentType,
          customPurpose: paymentType === 'custom' ? customPurpose : undefined,
          txRef: txRef,
          description: getPaymentDescription(),
          customerEmail: userProfile?.email || user.email,
          customerName: userProfile 
            ? `${userProfile.surname || ''} ${userProfile.firstname || ''}`.trim() 
            : user.displayName || 'User',
        }),
      });

      if (!paymentRes.ok) {
        throw new Error('Failed to create payment record');
      }

      const paymentData = await paymentRes.json();

      // Proceed with Flutterwave
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      script.onload = () => {
        window.FlutterwaveCheckout({
          public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
          tx_ref: txRef,
          amount: amountNum,
          currency: 'NGN',
          payment_options: 'card,banktransfer',
          customer: {
            email: userProfile?.email || user.email,
            name: userProfile 
              ? `${userProfile.surname || ''} ${userProfile.firstname || ''}`.trim() 
              : user.displayName || 'User',
          },
          customizations: {
            title: 'WACCPS Payment',
            description: getPaymentDescription(),
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
                  paymentType: paymentType,
                }),
              });

              if (verifyRes.ok) {
                toast.success(`Payment successful! ₦${amountNum.toLocaleString()} paid for ${getPaymentDescription()}`);
                // Reset form
                setSelectedPurpose(null);
                setCustomPurpose('');
                setAmount('');
              } else {
                toast.error('Payment verification failed. Please contact support.');
              }
            } else {
              toast.error('Payment was not completed.');
            }
            setLoading(false);
          },
          onclose: function () {
            setLoading(false);
          },
        });
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mt-8 px-4 mb-6">
        <h1 className="text-2xl text-white">Make a Payment</h1>
        <div className="flex space-x-2">
          <Link href="/dashboard" className="text-blue-700 hover:text-blue-500">Home</Link>
          <div className="text-white">/</div>
          <Link href="/payments" className="text-blue-700 hover:text-blue-500">Payments</Link>
          <div className="text-white">/</div>
          <nav className="text-gray-400">Make Payment</nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* Payment Purpose Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Select Payment Purpose</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentPurposes.map((purpose) => (
              <div
                key={purpose.id}
                onClick={() => handlePurposeSelect(purpose)}
                className={`bg-[#343940] p-6 rounded-lg cursor-pointer transition-all hover:scale-[1.02] border-2 ${
                  selectedPurpose?.id === purpose.id
                    ? 'border-blue-500 ring-2 ring-blue-500/50'
                    : 'border-transparent hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded" style={{ backgroundColor: purpose.bg }}>
                    {purpose.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{purpose.title}</h3>
                  </div>
                  {selectedPurpose?.id === purpose.id && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400">{purpose.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Purpose Input */}
        {selectedPurpose?.id === 'custom' && (
          <div className="mb-8 bg-[#343940] p-6 rounded-lg border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What is this payment for? *
            </label>
            <input
              type="text"
              value={customPurpose}
              onChange={(e) => setCustomPurpose(e.target.value)}
              placeholder="e.g., Conference Registration, Workshop Fee, etc."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{customPurpose.length}/100 characters</p>
          </div>
        )}

        {/* Amount Input */}
        <div className="mb-8 bg-[#343940] p-6 rounded-lg border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Enter Amount (NGN) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">₦</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="1000"
              step="0.01"
              className="w-full pl-10 pr-4 py-4 text-2xl bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Minimum amount: ₦1,000</p>
        </div>

        {/* Payment Summary */}
        {selectedPurpose && amount && parseFloat(amount) >= 1000 && (
          <div className="mb-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-lg border border-blue-700/50">
            <h3 className="text-lg font-semibold mb-4 text-white">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Purpose:</span>
                <span className="font-semibold text-white">{getPaymentDescription()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Amount:</span>
                <span className="font-semibold text-green-400 text-xl">
                  ₦{parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={loading || !selectedPurpose || !amount || parseFloat(amount) < 1000}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
            loading || !selectedPurpose || !amount || parseFloat(amount) < 1000
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-green-600 hover:bg-green-700 active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </>
          ) : (
            <>
              <FaCreditCard className="text-xl" />
              Proceed to Payment
            </>
          )}
        </button>

        {/* Info Section */}
        <div className="mt-8 bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Payment Information</h4>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>• All payments are processed securely through Flutterwave</li>
            <li>• You will receive a payment receipt after successful payment</li>
            <li>• All payment history can be viewed in the Payment History section</li>
            <li>• For any payment issues, please contact support at info.waccps@gmail.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
