import { useState } from 'react';
import { isValidEmail } from '@/utils/validation';

export const useSignupForm = () => {
  const [form, setForm] = useState({
    surname: '', firstname: '', middlename: '', email: '', password: '',
    dob: '', gender: '', mobile: '', address: '', institution: '', nationality: '', photo: null
  });
  
  const [phoneValue, setPhoneValue] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const updatePhone = (value) => {
    setPhoneValue(value);
  };

  const updateFormField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email) => {
    if (email && !isValidEmail(email)) {
      return 'Please enter a valid email address';
    }
    if (!email) {
      return 'Email is required';
    }
    return null;
  };

  const getFormWithPhone = () => {
    const trimmedForm = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
    );
    return { ...trimmedForm, mobile: phoneValue };
  };

  return {
    form,
    phoneValue,
    handleChange,
    updatePhone,
    updateFormField,
    validateEmail,
    getFormWithPhone
  };
};