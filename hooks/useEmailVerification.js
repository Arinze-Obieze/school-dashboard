import { useState, useEffect } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import {auth} from "@/firebase"
export const useEmailVerification = (userId, currentStep) => {
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check email verification status periodically
  useEffect(() => {
    if (currentStep === 2 && userId) {
      const interval = setInterval(async () => {
        try {
          await auth.currentUser?.reload();
          if (auth.currentUser?.emailVerified) {
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error checking verification:', error);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [currentStep, userId]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const sendVerification = async (user) => {
    await sendEmailVerification(user);
    setEmailVerificationSent(true);
    setResendCooldown(60);
  };

  const resendVerification = async () => {
    if (resendCooldown > 0) return;
    
    try {
      await sendEmailVerification(auth.currentUser);
      setResendCooldown(60);
      setEmailVerificationSent(true);
    } catch (err) {
      throw new Error('Failed to resend verification email. Please try again.');
    }
  };

  const checkVerificationStatus = async () => {
    setCheckingVerification(true);
    try {
      await auth.currentUser.reload();
      return auth.currentUser.emailVerified;
    } catch (err) {
      throw new Error('Failed to check verification status.');
    } finally {
      setCheckingVerification(false);
    }
  };

  return {
    emailVerificationSent,
    checkingVerification,
    resendCooldown,
    sendVerification,
    resendVerification,
    checkVerificationStatus
  };
};