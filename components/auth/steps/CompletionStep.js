import { FaCheckCircle } from 'react-icons/fa';

export const CompletionStep = () => {
  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
        <FaCheckCircle className="text-white text-2xl" />
      </div>
      <h3 className="text-xl text-green-500 font-bold mb-2">Registration Complete!</h3>
      <p className="text-gray-300 text-center mb-2 text-sm">Your payment was successful and your registration is now complete.</p>
      <p className="text-gray-400 text-sm mt-2">You will be redirected to your dashboard shortly.</p>
    </div>
  );
};