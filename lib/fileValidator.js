/**
 * File Validation Utility
 * Provides comprehensive file type, size, and security validation
 */

// Allowed MIME types by category
const ALLOWED_MIME_TYPES = {
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  all: [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    // Spreadsheets
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]
};

// File extension mappings
const EXTENSION_TO_MIME = {
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  document: 10 * 1024 * 1024,    // 10 MB
  image: 5 * 1024 * 1024,        // 5 MB
  spreadsheet: 10 * 1024 * 1024, // 10 MB
  default: 10 * 1024 * 1024,     // 10 MB
};

/**
 * Validate file type by MIME type
 * @param {File} file - The file object
 * @param {string} allowedCategory - 'document', 'image', 'spreadsheet', or 'all'
 * @returns {object} { valid: boolean, error: string|null }
 */
export function validateFileType(file, allowedCategory = 'all') {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const allowedTypes = ALLOWED_MIME_TYPES[allowedCategory] || ALLOWED_MIME_TYPES.all;
  const mimeType = file.type || 'application/octet-stream';

  if (!allowedTypes.includes(mimeType)) {
    const categoryTypes = allowedCategory === 'all' 
      ? 'PDF, DOC, DOCX, JPG, PNG, GIF, WEBP, XLS, XLSX'
      : allowedCategory.charAt(0).toUpperCase() + allowedCategory.slice(1);
    return {
      valid: false,
      error: `Invalid file type. Only ${categoryTypes} files are allowed. Received: ${mimeType}`
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate file size
 * @param {File} file - The file object
 * @param {string} category - 'document', 'image', 'spreadsheet', or 'default'
 * @returns {object} { valid: boolean, error: string|null }
 */
export function validateFileSize(file, category = 'default') {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const maxSize = FILE_SIZE_LIMITS[category] || FILE_SIZE_LIMITS.default;

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB, but your file is ${fileSizeMB}MB`
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate file name for security issues
 * @param {string} filename - The filename
 * @returns {object} { valid: boolean, error: string|null }
 */
export function validateFileName(filename) {
  if (!filename) {
    return { valid: false, error: 'No filename provided' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\x00/,                    // Null bytes
    /\.{2,}/,                  // Multiple dots (path traversal)
    /^\.+$/,                   // Only dots
    /[<>:"\\|?*]/,             // Invalid Windows characters
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(filename)) {
      return {
        valid: false,
        error: `Invalid filename. Contains suspicious characters: ${filename}`
      };
    }
  }

  // Check filename length
  if (filename.length > 255) {
    return {
      valid: false,
      error: `Filename too long. Maximum 255 characters allowed`
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate file extension against MIME type
 * @param {File} file - The file object
 * @returns {object} { valid: boolean, error: string|null }
 */
export function validateFileExtension(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const filename = file.name.toLowerCase();
  const extension = filename.split('.').pop();
  const mimeType = file.type || 'application/octet-stream';

  // Check if extension matches MIME type
  const expectedMimeType = EXTENSION_TO_MIME[extension];
  
  if (expectedMimeType && expectedMimeType !== mimeType) {
    return {
      valid: false,
      error: `File extension doesn't match content. Expected ${extension} but received ${mimeType}`
    };
  }

  return { valid: true, error: null };
}

/**
 * Comprehensive file validation
 * @param {File} file - The file object
 * @param {object} options - Validation options
 * @param {string} options.category - 'document', 'image', 'spreadsheet', 'all' (default: 'all')
 * @param {number} options.maxSize - Max file size in bytes (overrides default)
 * @param {boolean} options.validateExtension - Validate extension match (default: true)
 * @returns {object} { valid: boolean, error: string|null, warnings: string[] }
 */
export function validateFile(file, options = {}) {
  const {
    category = 'all',
    maxSize = null,
    validateExtension = true,
  } = options;

  const errors = [];
  const warnings = [];

  // Validate file exists
  if (!file) {
    return { valid: false, error: 'No file provided', warnings: [] };
  }

  // Validate filename
  const filenameValidation = validateFileName(file.name);
  if (!filenameValidation.valid) {
    errors.push(filenameValidation.error);
  }

  // Validate file type
  const typeValidation = validateFileType(file, category);
  if (!typeValidation.valid) {
    errors.push(typeValidation.error);
  }

  // Validate file size
  const sizeValidation = validateFileSize(file, maxSize ? 'default' : category);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error);
  }

  // Validate extension if requested
  if (validateExtension) {
    const extValidation = validateFileExtension(file);
    if (!extValidation.valid) {
      warnings.push(extValidation.error);
    }
  }

  return {
    valid: errors.length === 0,
    error: errors.length > 0 ? errors.join('; ') : null,
    warnings: warnings.length > 0 ? warnings : [],
  };
}

/**
 * Validate multiple files
 * @param {File[]} files - Array of file objects
 * @param {object} options - Validation options (same as validateFile)
 * @returns {object} { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateFiles(files, options = {}) {
  if (!Array.isArray(files) || files.length === 0) {
    return { valid: false, errors: ['No files provided'], warnings: [] };
  }

  const errors = [];
  const warnings = [];

  files.forEach((file, index) => {
    const result = validateFile(file, options);
    if (!result.valid) {
      errors.push(`File ${index + 1} (${file.name}): ${result.error}`);
    }
    if (result.warnings.length > 0) {
      warnings.push(...result.warnings.map(w => `File ${index + 1}: ${w}`));
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get allowed file types description
 * @param {string} category - 'document', 'image', 'spreadsheet', 'all'
 * @returns {string} Human-readable description
 */
export function getAllowedTypesDescription(category = 'all') {
  const descriptions = {
    document: 'PDF, DOC, DOCX',
    image: 'JPG, PNG, GIF, WEBP',
    spreadsheet: 'XLS, XLSX',
    all: 'PDF, DOC, DOCX, JPG, PNG, GIF, WEBP, XLS, XLSX',
  };
  return descriptions[category] || descriptions.all;
}

/**
 * Get max file size description
 * @param {string} category - 'document', 'image', 'spreadsheet', 'default'
 * @returns {string} Human-readable description
 */
export function getMaxSizeDescription(category = 'default') {
  const maxSize = FILE_SIZE_LIMITS[category] || FILE_SIZE_LIMITS.default;
  return `${(maxSize / (1024 * 1024)).toFixed(1)}MB`;
}

// Export MIME types and limits for reference
export { ALLOWED_MIME_TYPES, FILE_SIZE_LIMITS, EXTENSION_TO_MIME };
