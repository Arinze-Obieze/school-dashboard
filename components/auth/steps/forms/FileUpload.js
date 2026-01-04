export const FileUpload = ({ 
    label, 
    name, 
    value, 
    onChange, 
    accept = 'image/*', 
    required = false,
    preview = true 
  }) => {
    return (
      <div className="flex flex-col gap-4">
        <label className="text-white text-sm font-semibold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {required && <span className="text-red-500 text-xs ml-2">(Mandatory)</span>}
        </label>
        <input 
          name={name} 
          type="file" 
          accept={accept} 
          className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" 
          onChange={onChange} 
          required={required} 
        />
        {preview && value && (
          <img src={URL.createObjectURL(value)} alt="Preview" className="w-32 h-32 object-cover rounded mx-auto mt-2" />
        )}
        <p className="text-gray-400 text-xs">
          Supported formats: JPEG, PNG, GIF. Max size: 5MB
        </p>
      </div>
    );
  };