"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function PaymentRequiredPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          router.replace("/login");
          return;
        }
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("User profile not found.");
          setLoading(false);
          return;
        }
        setUserData({ ...snap.data(), uid: user.uid });
      } catch (e) {
        setError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handlePay = () => {
    setIsProcessing(true);
    if (!userData) return;
    
    if (!document.getElementById("flutterwave-script")) {
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.id = "flutterwave-script";
      script.async = true;
      script.onload = () => triggerPayment();
      document.body.appendChild(script);
    } else {
      triggerPayment();
    }
  };

  const triggerPayment = () => {
    window.FlutterwaveCheckout({
      public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
      tx_ref: `${userData.uid}-${Date.now()}`,
      amount: 21000,
      currency: "NGN",
      payment_options: "banktransfer,card",
      customer: {
        email: userData.email,
        name: `${userData.surname} ${userData.firstname}`,
        phonenumber: userData.mobile,
      },
      customizations: {
        title: "School Registration Fee",
        description: "Registration payment for dashboard",
        logo: "/logo-50x100.png",
      },
      callback: async function (response) {
        setIsProcessing(true);
        try {
          const res = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                tx_ref: response.tx_ref,
                transaction_id: response.transaction_id, 
                userId: userData.uid
             }),
          });
          const data = await res.json();
          if (data.status === "success") {
            router.push("/dashboard");
          } else {
            setError("Payment not completed.");
          }
        } catch (e) {
          setError("Payment verification failed.");
        } finally {
          setIsProcessing(false);
        }
      },
      onclose: function () {
        setIsProcessing(false);
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-800">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading your information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-800 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Complete Your Registration</h1>
          <p className="text-indigo-200 max-w-md mx-auto">
            You're almost there! Just one step left to complete your registration.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* User Details Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 lg:w-2/3">
            <div className="flex items-center mb-6">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Your Registration Details</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="font-medium text-gray-800">{userData.surname} {userData.firstname} {userData.middlename}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email Address</p>
                  <p className="font-medium text-gray-800">{userData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mobile Number</p>
                  <p className="font-medium text-gray-800">{userData.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Institution</p>
                  <p className="font-medium text-gray-800">{userData.institution}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Registration Date</p>
                  <p className="font-medium text-gray-800">
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 lg:w-1/3">
            <div className="flex items-center mb-6">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Payment Required</h2>
            </div>

            <p className="text-gray-600 mb-6">
              To complete your registration and access all features, please pay the application fee.
            </p>

            <div className="bg-indigo-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-indigo-700 font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-indigo-700">₦21,000</span>
              </div>
            </div>

            <button 
              onClick={handlePay} 
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-md transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Pay Now"
              )}
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">Secure payment powered by Flutterwave</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-indigo-200 text-sm">Need help? Contact support@example.com</p>
        </div>
      </div>
    </div>
  );
}