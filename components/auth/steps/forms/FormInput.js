const FormInput = ({ 
    label, 
    name, 
    type = 'text', 
    value, 
    onChange, 
    required = false, 
    placeholder = '',
    className = '',
    ...props 
  }) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-white text-sm">{label}{required && '*'}</label>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          className={`px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm ${className}`}
          value={value}
          onChange={onChange}
          required={required}
          {...props}
        />
      </div>
    );
  };

  export default FormInput