import { FaCheckCircle } from 'react-icons/fa';
import { FileUpload } from '@/components/auth/steps/forms/FileUpload';

export const PhotoUploadStep = ({ form, handleChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <FaCheckCircle className="text-green-500" />
        <span className="text-green-500 text-sm">Email Verified Successfully!</span>
      </div>
      <FileUpload
        label="Upload Passport Photo"
        name="photo"
        value={form.photo}
        onChange={handleChange}
        required
      />
    </div>
  );
};