export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateFile = (file) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!file) return { isValid: false, error: 'Please select a file' };
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Please upload a JPEG, PNG, or GIF image.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'Image must be smaller than 5MB.' };
  }
  return { isValid: true, error: null };
};

export const validateRequiredFields = (form, requiredFields) => {
  for (let key of requiredFields) {
    if (!form[key]) {
      return { isValid: false, error: `Please fill all required fields. Missing: ${key}` };
    }
  }
  return { isValid: true, error: null };
};