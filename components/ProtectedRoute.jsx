'use client';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checkingPayment, setCheckingPayment] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
      // If auth is still loading, wait
      if (loading) return;

      // If not logged in and not on login/signup/payment-required page, redirect to signup
      if (!user && pathname !== '/login' && pathname !== '/signup' && pathname !== '/payment-required') {
        router.replace('/signup');
        return;
      }

      // If user exists, check Firestore for payment
      if (user) {
        try {
          const ref = doc(db, 'users', user.uid);
          const snap = await getDoc(ref);

          if (!snap.exists()) {
            // No profile found, force them back to signup
            router.replace('/signup');
            return;
          }

          const data = snap.data();
          if (data.paymentStatus !== 'success' && pathname !== '/signup' && pathname !== '/payment-required') {
            // Redirect unpaid users to payment-required page
            router.replace('/payment-required');
            return;
          }
        } catch (err) {
          console.error('Payment check failed:', err);
          router.replace('/signup');
        }
      }

      setCheckingPayment(false);
    };

    checkAccess();
  }, [user, loading, pathname, router]);

  if (loading || checkingPayment) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return children;
}
