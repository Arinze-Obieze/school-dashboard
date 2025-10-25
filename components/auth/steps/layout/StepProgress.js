import { STEP_LABELS } from '@/utils/constants';

export const StepProgress = ({ currentStep, steps = 5 }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {Array.from({ length: steps }, (_, i) => i + 1).map(step => (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              step === currentStep
                ? 'bg-blue-500 text-white'
                : step < currentStep
                ? 'bg-green-500 text-white'
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {step}
          </div>
        ))}
      </div>
      <p className="text-gray-400 text-sm text-center">
        {STEP_LABELS[currentStep]}
      </p>
    </div>
  );
};