/**
 * Input Validation and Sanitization Utility
 * Protects against NoSQL injection, XSS, and data corruption
 */

/**
 * Sanitize string input to prevent XSS and injection attacks
 * @param {string} input - Input string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input, options = {}) {
  const { maxLength = 1000, allowHTML = false } = options;
  
  if (input === null || input === undefined) {
    return '';
  }
  
  // Convert non-string inputs to string (e.g. numbers)
  if (typeof input !== 'string') {
    input = String(input);
  }
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove HTML tags unless explicitly allowed
  if (!allowHTML) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }
  
  // Remove null bytes and other dangerous characters
  sanitized = sanitized.replace(/\0/g, '');
  
  return sanitized;
}

/**
 * Validate and sanitize email address
 * @param {string} email - Email to validate
 * @returns {Object} { valid: boolean, sanitized: string, error: string|null }
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, sanitized: '', error: 'Email is required' };
  }
  
  const sanitized = sanitizeString(email, { maxLength: 254 }).toLowerCase();
  
  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  
  if (!emailRegex.test(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid email format' };
  }
  
  return { valid: true, sanitized, error: null };
}

/**
 * Validate Firebase UID format
 * @param {string} uid - User ID to validate
 * @returns {Object} { valid: boolean, sanitized: string, error: string|null }
 */
export function validateUserId(uid) {
  if (!uid || typeof uid !== 'string') {
    return { valid: false, sanitized: '', error: 'User ID is required' };
  }
  
  const sanitized = uid.trim();
  
  // Firebase UIDs are alphanumeric and typically 28 characters
  // Allow flexibility for different auth providers
  const uidRegex = /^[a-zA-Z0-9_-]{1,128}$/;
  
  if (!uidRegex.test(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid user ID format' };
  }
  
  return { valid: true, sanitized, error: null };
}

/**
 * Validate and sanitize URL
 * @param {string} url - URL to validate
 * @param {Object} options - Validation options
 * @returns {Object} { valid: boolean, sanitized: string, error: string|null }
 */
export function validateUrl(url, options = {}) {
  const { allowedProtocols = ['http:', 'https:'], allowedDomains = [] } = options;
  
  if (!url || typeof url !== 'string') {
    return { valid: false, sanitized: '', error: 'URL is required' };
  }
  
  const sanitized = sanitizeString(url, { maxLength: 2048 });
  
  try {
    const parsedUrl = new URL(sanitized);
    
    // Check protocol
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return { valid: false, sanitized, error: `Protocol must be one of: ${allowedProtocols.join(', ')}` };
    }
    
    // Check domain if specified
    if (allowedDomains.length > 0 && !allowedDomains.includes(parsedUrl.hostname)) {
      return { valid: false, sanitized, error: 'URL domain not allowed' };
    }
    
    return { valid: true, sanitized, error: null };
  } catch (e) {
    return { valid: false, sanitized, error: 'Invalid URL format' };
  }
}

/**
 * Validate numeric value
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {Object} { valid: boolean, sanitized: number, error: string|null }
 */
export function validateNumber(value, options = {}) {
  const { min = -Infinity, max = Infinity, integer = false } = options;
  
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, sanitized: 0, error: 'Invalid number' };
  }
  
  if (integer && !Number.isInteger(num)) {
    return { valid: false, sanitized: Math.floor(num), error: 'Must be an integer' };
  }
  
  if (num < min) {
    return { valid: false, sanitized: num, error: `Must be at least ${min}` };
  }
  
  if (num > max) {
    return { valid: false, sanitized: num, error: `Must be at most ${max}` };
  }
  
  return { valid: true, sanitized: num, error: null };
}

/**
 * Validate and sanitize transaction reference
 * @param {string} txRef - Transaction reference
 * @returns {Object} { valid: boolean, sanitized: string, error: string|null }
 */
export function validateTxRef(txRef) {
  if (!txRef || typeof txRef !== 'string') {
    return { valid: false, sanitized: '', error: 'Transaction reference is required' };
  }
  
  const sanitized = sanitizeString(txRef, { maxLength: 255 });
  
  // Allow alphanumeric, hyphens, underscores
  const txRefRegex = /^[a-zA-Z0-9_-]+$/;
  
  if (!txRefRegex.test(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid transaction reference format' };
  }
  
  return { valid: true, sanitized, error: null };
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {Object} { valid: boolean, sanitized: string, error: string|null }
 */
export function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, sanitized: '', error: 'Phone number is required' };
  }
  
  // Remove common formatting characters
  const sanitized = phone.replace(/[\s()-]/g, '');
  
  // Allow + prefix for international numbers
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  
  if (!phoneRegex.test(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid phone number format' };
  }
  
  return { valid: true, sanitized, error: null };
}

/**
 * Validate enum value
 * @param {any} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} fieldName - Name of field for error message
 * @returns {Object} { valid: boolean, sanitized: any, error: string|null }
 */
export function validateEnum(value, allowedValues, fieldName = 'Value') {
  if (!allowedValues.includes(value)) {
    return {
      valid: false,
      sanitized: null,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`
    };
  }
  
  return { valid: true, sanitized: value, error: null };
}

/**
 * Sanitize object to prevent NoSQL injection
 * Removes dangerous MongoDB operators and deeply nested objects
 * @param {Object} obj - Object to sanitize
 * @param {Object} options - Sanitization options
 * @returns {Object} - Sanitized object
 */
export function sanitizeObject(obj, options = {}) {
  const { maxDepth = 3, allowedKeys = null } = options;
  
  function sanitizeRecursive(value, depth = 0) {
    // Prevent deeply nested objects (DoS attack)
    if (depth > maxDepth) {
      return null;
    }
    
    // Handle null and undefined
    if (value === null || value === undefined) {
      return value;
    }
    
    // Handle primitives
    if (typeof value !== 'object') {
      if (typeof value === 'string') {
        return sanitizeString(value);
      }
      return value;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(item => sanitizeRecursive(item, depth + 1));
    }
    
    // Handle objects
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      // Remove MongoDB operators (starting with $)
      if (key.startsWith('$')) {
        continue;
      }
      
      // Remove prototype pollution attempts
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      
      // Check allowed keys if specified
      if (allowedKeys && !allowedKeys.includes(key)) {
        continue;
      }
      
      sanitized[key] = sanitizeRecursive(val, depth + 1);
    }
    
    return sanitized;
  }
  
  return sanitizeRecursive(obj);
}

/**
 * Validate required fields in an object
 * @param {Object} data - Data object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} { valid: boolean, missing: Array<string>, error: string|null }
 */
export function validateRequiredFields(data, requiredFields) {
  const missing = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    return {
      valid: false,
      missing,
      error: `Missing required fields: ${missing.join(', ')}`
    };
  }
  
  return { valid: true, missing: [], error: null };
}

/**
 * Validate and sanitize payment data
 * @param {Object} paymentData - Payment data to validate
 * @returns {Object} { valid: boolean, sanitized: Object, errors: Array }
 */
export function validatePaymentData(paymentData) {
  const errors = [];
  const sanitized = {};
  
  // Validate userId
  const userIdValidation = validateUserId(paymentData.userId);
  if (!userIdValidation.valid) {
    errors.push({ field: 'userId', error: userIdValidation.error });
  } else {
    sanitized.userId = userIdValidation.sanitized;
  }
  
  // Validate amount
  const amountValidation = validateNumber(paymentData.amount, { min: 0.01, max: 10000000 });
  if (!amountValidation.valid) {
    errors.push({ field: 'amount', error: amountValidation.error });
  } else {
    sanitized.amount = amountValidation.sanitized;
  }
  
  // Validate txRef
  if (paymentData.txRef) {
    const txRefValidation = validateTxRef(paymentData.txRef);
    if (!txRefValidation.valid) {
      errors.push({ field: 'txRef', error: txRefValidation.error });
    } else {
      sanitized.txRef = txRefValidation.sanitized;
    }
  }
  
  // Validate paymentType
  if (paymentData.paymentType) {
    const paymentTypeValidation = validateEnum(
      paymentData.paymentType,
      ['registration', 'primary', 'membership', 'fellowship', 'custom', 'course', 'exam', 'other'],
      'Payment type'
    );
    if (!paymentTypeValidation.valid) {
      errors.push({ field: 'paymentType', error: paymentTypeValidation.error });
    } else {
      sanitized.paymentType = paymentTypeValidation.sanitized;
    }
  }
  
  // Sanitize optional text fields
  if (paymentData.description) {
    sanitized.description = sanitizeString(paymentData.description, { maxLength: 500 });
  }
  
  if (paymentData.customerEmail) {
    const emailValidation = validateEmail(paymentData.customerEmail);
    if (emailValidation.valid) {
      sanitized.customerEmail = emailValidation.sanitized;
    }
  }
  
  if (paymentData.customerName) {
    sanitized.customerName = sanitizeString(paymentData.customerName, { maxLength: 100 });
  }
  
  // Validate and sanitize customPurpose for custom payment types
  if (paymentData.customPurpose) {
    sanitized.customPurpose = sanitizeString(paymentData.customPurpose, { maxLength: 200 });
  }
  
  return {
    valid: errors.length === 0,
    sanitized,
    errors
  };
}

/**
 * Validate and sanitize registration data
 * @param {Object} registrationData - Registration data to validate
 * @returns {Object} { valid: boolean, sanitized: Object, errors: Array }
 */
export function validateRegistrationData(registrationData) {
  const errors = [];
  
  // Validate userId
  const userIdValidation = validateUserId(registrationData.userId);
  if (!userIdValidation.valid) {
    errors.push({ field: 'userId', error: userIdValidation.error });
  }
  
  // Sanitize the rest of the data
  const sanitized = sanitizeObject(registrationData, { maxDepth: 3 });
  
  return {
    valid: errors.length === 0,
    sanitized,
    errors
  };
}
