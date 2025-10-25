import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { STEPS } from '@/utils/constants';

export const useSignupSteps = (userId) => {
  const [step, setStep] = useState(STEPS.PERSONAL_INFO);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  // Check if user has incomplete registration
  useEffect(() => {
    if (!userId) return;
    
    const checkPayment = async () => {
      try {
        const ref = doc(db, 'users', userId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.paymentStatus === 'success') {
            setStep(STEPS.COMPLETE);
          } else if (data.photoURL) {
            setStep(STEPS.PAYMENT);
          }
        }
      } catch (e) {
        console.error('Error checking payment status:', e);
      }
    };
    
    checkPayment();
  }, [userId]);

  const goToStep = (newStep) => {
    setStep(newStep);
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  return {
    step,
    paymentStatus,
    setPaymentStatus,
    goToStep,
    nextStep
  };
};