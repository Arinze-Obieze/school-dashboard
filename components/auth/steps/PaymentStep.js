export const PaymentStep = () => {
    return (
      <div className="flex flex-col gap-4 items-center">
        <h3 className="text-xl text-white font-bold mb-2">Application Fee</h3>
        <p className="text-gray-300 text-center mb-2 text-sm">
          To complete your application, please pay <span className="font-bold text-green-400">₦21,000</span> to the WACCPS using Flutterwave.
        </p>
        <p className="text-gray-400 text-xs mt-2">
          You will be redirected to Flutterwave to complete your payment securely.
        </p>
      </div>
    );
  };