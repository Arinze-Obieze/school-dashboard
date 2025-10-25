import { FaSpinner, FaEnvelope } from 'react-icons/fa';

export const EmailVerificationStep = ({ 
  email, 
  checkingVerification, 
  resendCooldown, 
  onCheckVerification, 
  onResendVerification,
  loading = false 
}) => {
  return (
    <div className="flex flex-col gap-4 items-center text-center">
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
        <FaEnvelope className="text-white text-2xl" />
      </div>
      <h3 className="text-xl text-white font-bold">Verify Your Email</h3>
      <p className="text-gray-300 text-sm">
        We've sent a verification link to <strong>{email}</strong>
      </p>
      <p className="text-gray-400 text-xs">
        Please check your inbox and click the verification link to continue with your registration.
      </p>
      
      <div className="flex flex-col gap-3 w-full mt-4">
        <button
          type="button"
          onClick={onCheckVerification}
          disabled={checkingVerification}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded flex items-center justify-center text-sm"
        >
          {checkingVerification && <FaSpinner className="animate-spin mr-2" />}
          {checkingVerification ? 'Checking...' : 'I\'ve Verified My Email'}
        </button>

        <button
          type="button"
          onClick={onResendVerification}
          disabled={resendCooldown > 0 || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center text-sm disabled:bg-gray-600"
        >
          {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaEnvelope className="mr-2" />}
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
        </button>
      </div>

      <p className="text-gray-500 text-xs mt-4">
        Didn't receive the email? Check your spam folder or try resending.
      </p>
    </div>
  );
};