'use client';

import { useState, useCallback } from 'react';
import { validateFile, validateFiles, getAllowedTypesDescription, getMaxSizeDescription } from '@/lib/fileValidator';

/**
 * Custom hook for file validation in forms
 */
export function useFileValidation() {
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  /**
   * Validate a single file
   * @param {File} file - The file to validate
   * @param {string} fieldName - The field name for error tracking
   * @param {object} options - Validation options
   * @returns {boolean} Whether the file is valid
   */
  const validateSingleFile = useCallback((file, fieldName, options = {}) => {
    const result = validateFile(file, options);

    if (!result.valid) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: result.error
      }));
      setWarnings(prev => {
        const newWarnings = { ...prev };
        delete newWarnings[fieldName];
        return newWarnings;
      });
      return false;
    }

    // Clear errors for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });

    // Store warnings if any
    if (result.warnings.length > 0) {
      setWarnings(prev => ({
        ...prev,
        [fieldName]: result.warnings
      }));
    } else {
      setWarnings(prev => {
        const newWarnings = { ...prev };
        delete newWarnings[fieldName];
        return newWarnings;
      });
    }

    return true;
  }, []);

  /**
   * Validate multiple files
   * @param {File[]} fileList - Array of files
   * @param {string} fieldName - The field name
   * @param {object} options - Validation options
   * @returns {boolean} Whether all files are valid
   */
  const validateMultipleFiles = useCallback((fileList, fieldName, options = {}) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    }

    const result = validateFiles(files, options);

    if (!result.valid) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: result.errors.join('; ')
      }));
      return false;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });

    if (result.warnings.length > 0) {
      setWarnings(prev => ({
        ...prev,
        [fieldName]: result.warnings
      }));
    }

    return true;
  }, []);

  /**
   * Clear errors for a field
   */
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
    setWarnings({});
  }, []);

  return {
    errors,
    warnings,
    validateSingleFile,
    validateMultipleFiles,
    clearFieldError,
    clearAllErrors,
  };
}
