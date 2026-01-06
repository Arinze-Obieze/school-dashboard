/**
 * Pagination Helper Utility
 * Provides standardized pagination for API endpoints across Firestore and external APIs
 * 
 * Features:
 * - Parse and validate pagination parameters (page, limit)
 * - Format paginated responses with metadata
 * - Build Firestore queries with offset-based pagination
 * - Calculate pagination metadata (total pages, hasMore, nextPage, prevPage)
 * - Per-endpoint configurable limits
 */

// Default and maximum limits for different endpoints
const ENDPOINT_LIMITS = {
  payments: { default: 25, max: 100 },
  exams: { default: 50, max: 100 },
  registrations: { default: 20, max: 100 },
  default: { default: 20, max: 100 },
};

/**
 * Parse and validate pagination parameters from query string
 * 
 * @param {number|string} page - Page number (1-indexed)
 * @param {number|string} limit - Items per page
 * @param {string} endpoint - Endpoint name for limit lookup
 * @returns {Object} { page, limit, skip } - Validated values and calculated skip offset
 * @throws {Error} If parameters are invalid
 * 
 * @example
 * const { page, limit, skip } = parsePaginationParams(2, 25, 'payments');
 * // Returns: { page: 2, limit: 25, skip: 25 }
 */
function parsePaginationParams(page = 1, limit = undefined, endpoint = 'default') {
  // Get endpoint-specific limits
  const endpointConfig = ENDPOINT_LIMITS[endpoint] || ENDPOINT_LIMITS.default;
  const defaultLimit = endpointConfig.default;
  const maxLimit = endpointConfig.max;

  // Parse page number (1-indexed)
  let parsedPage = parseInt(page, 10) || 1;
  if (parsedPage < 1) parsedPage = 1;

  // Parse limit
  let parsedLimit = limit ? parseInt(limit, 10) : defaultLimit;
  if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = defaultLimit;
  if (parsedLimit > maxLimit) parsedLimit = maxLimit;

  // Calculate skip (offset)
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
}

/**
 * Format a paginated response with metadata
 * 
 * @param {Array} data - Array of items to paginate
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total count of all items
 * @param {Object} meta - Additional metadata (optional)
 * @returns {Object} Formatted response with pagination metadata
 * 
 * @example
 * const response = formatPaginationResponse(
 *   items,
 *   2,
 *   25,
 *   1000,
 *   { source: 'firestore' }
 * );
 * // Returns:
 * // {
 * //   success: true,
 * //   data: [...],
 * //   pagination: {
 * //     page: 2,
 * //     limit: 25,
 * //     total: 1000,
 * //     pages: 40,
 * //     hasMore: true,
 * //     nextPage: 3,
 * //     prevPage: 1
 * //   },
 * //   meta: { source: 'firestore' }
 * // }
 */
function formatPaginationResponse(data = [], page = 1, limit = 20, total = 0, meta = {}) {
  const pages = Math.ceil(total / limit) || 0;
  const hasMore = page < pages;
  const nextPage = hasMore ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasMore,
      nextPage,
      prevPage,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Format an error response with consistent structure
 * 
 * @param {string|Error} error - Error message or Error object
 * @param {number} status - HTTP status code
 * @returns {Object} Formatted error response
 */
function formatErrorResponse(error, status = 400) {
  const message = error instanceof Error ? error.message : error;
  return {
    success: false,
    error: message,
    pagination: null,
    meta: {
      timestamp: new Date().toISOString(),
      status,
    },
  };
}

/**
 * Build a paginated Firestore query
 * 
 * @param {Object} query - Firestore query reference (already filtered/ordered)
 * @param {number} skip - Number of documents to skip
 * @param {number} limit - Number of documents to fetch
 * @returns {Object} { dataQuery, countQuery } - Query references for data and count
 * 
 * @example
 * let query = db.collection('payments').where('userId', '==', userId).orderBy('createdAt', 'desc');
 * const { page, limit, skip } = parsePaginationParams(req.query.page, req.query.limit, 'payments');
 * const { dataQuery, countQuery } = buildFirestoreQuery(query, skip, limit);
 * 
 * const snapshot = await dataQuery.get();
 * const countSnapshot = await countQuery.count().get();
 * const total = countSnapshot.data().count;
 */
function buildFirestoreQuery(query, skip, limit) {
  // For data: skip then limit
  const dataQuery = query.offset(skip).limit(limit);

  // For count: use full query (skip and limit don't affect count)
  const countQuery = query;

  return { dataQuery, countQuery };
}

/**
 * Extract Firestore documents into plain objects
 * 
 * @param {QuerySnapshot} snapshot - Firestore query snapshot
 * @returns {Array} Array of documents with id field
 */
function extractFirestoreData(snapshot) {
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Validate pagination parameters
 * 
 * @param {Object} params - { page, limit, skip }
 * @returns {boolean} True if valid
 * @throws {Error} If invalid
 */
function validatePaginationParams(params) {
  const { page, limit, skip } = params;

  if (!Number.isInteger(page) || page < 1) {
    throw new Error('Page must be a positive integer');
  }

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('Limit must be a positive integer');
  }

  if (!Number.isInteger(skip) || skip < 0) {
    throw new Error('Skip must be a non-negative integer');
  }

  return true;
}

/**
 * Create a pagination metadata object
 * 
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
function createPaginationMetadata(page, limit, total) {
  const pages = Math.ceil(total / limit) || 0;
  return {
    page,
    limit,
    total,
    pages,
    hasMore: page < pages,
    nextPage: page < pages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
}

/**
 * Handle pagination for external API responses
 * Ensures consistent pagination format regardless of source
 * 
 * @param {Array} items - Items from external API
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total count (may come from API or headers)
 * @returns {Object} Standardized paginated response
 * 
 * @example
 * const apiResponse = await fetch(`https://api.example.com/items?page=${page}&limit=${limit}`);
 * const apiData = await apiResponse.json();
 * const response = handleExternalPagination(
 *   apiData.items,
 *   page,
 *   limit,
 *   apiData.totalCount || items.length
 * );
 */
function handleExternalPagination(items = [], page = 1, limit = 20, total = 0) {
  // If total not provided, assume it's at least the items we received
  const actualTotal = total || items.length;

  return {
    success: true,
    data: items,
    pagination: createPaginationMetadata(page, limit, actualTotal),
    meta: {
      timestamp: new Date().toISOString(),
      source: 'external-api',
    },
  };
}

/**
 * Build query parameters for external API pagination
 * Adapts common pagination patterns to specific API requirements
 * 
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @param {string} style - API pagination style: 'offset', 'page', 'cursor'
 * @returns {Object} Query parameters for the API
 * 
 * @example
 * // For APIs using offset/limit
 * const params = buildExternalPaginationParams(2, 25, 'offset');
 * // Returns: { offset: 25, limit: 25 }
 * 
 * // For APIs using page/size
 * const params = buildExternalPaginationParams(2, 25, 'page');
 * // Returns: { page: 2, size: 25 }
 */
function buildExternalPaginationParams(page = 1, limit = 20, style = 'offset') {
  const validStyles = ['offset', 'page', 'cursor'];
  const normalizedStyle = validStyles.includes(style) ? style : 'offset';

  switch (normalizedStyle) {
    case 'offset':
      return {
        offset: (page - 1) * limit,
        limit,
      };
    case 'page':
      return {
        page,
        size: limit,
      };
    case 'cursor':
      // For cursor-based pagination, you'll need additional logic
      // This is a placeholder
      return {
        page,
        limit,
      };
    default:
      return { offset: (page - 1) * limit, limit };
  }
}

/**
 * Calculate total count from a Firestore collection
 * (Note: Firestore count aggregations are recommended for large collections)
 * 
 * @param {Object} query - Firestore query reference
 * @returns {Promise<number>} Total document count
 * 
 * @example
 * const total = await getTotalCount(
 *   db.collection('payments').where('userId', '==', userId)
 * );
 */
async function getTotalCount(query) {
  try {
    const countSnapshot = await query.count().get();
    return countSnapshot.data().count;
  } catch (error) {
    console.error('Error counting documents:', error);
    throw error;
  }
}

module.exports = {
  // Configuration
  ENDPOINT_LIMITS,

  // Core functions
  parsePaginationParams,
  formatPaginationResponse,
  formatErrorResponse,
  buildFirestoreQuery,
  extractFirestoreData,

  // Validation and metadata
  validatePaginationParams,
  createPaginationMetadata,

  // External API helpers
  handleExternalPagination,
  buildExternalPaginationParams,
  getTotalCount,
};
