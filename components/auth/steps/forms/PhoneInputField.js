import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const PhoneInputField = ({ value, onChange, label = 'Mobile Number*' }) => {
  return (
    <div className="md:col-span-2 flex flex-col gap-1">
      <label className="text-white text-sm">{label}</label>
      <PhoneInput
        international
        defaultCountry="NG"
        value={value}
        onChange={onChange}
        className="phone-input-custom"
        inputClassName="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 w-full text-sm"
        buttonClassName="bg-[#23272f] border border-gray-600 rounded-l"
      />
    </div>
  );
};

export default PhoneInputField;