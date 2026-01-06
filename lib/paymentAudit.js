import { adminDb } from '@/firebaseAdmin';

/**
 * Payment Audit Actions
 */
export const PAYMENT_AUDIT_ACTIONS = {
  // Payment Creation
  CREATE_INITIATED: 'create_initiated',
  CREATE_SUCCESS: 'create_success',
  CREATE_FAILED: 'create_failed',
  CREATE_VALIDATION_ERROR: 'create_validation_error',
  
  // Payment Verification
  VERIFY_INITIATED: 'verify_initiated',
  VERIFY_SUCCESS: 'verify_success',
  VERIFY_FAILED: 'verify_failed',
  VERIFY_VALIDATION_ERROR: 'verify_validation_error',
  VERIFY_FLUTTERWAVE_ERROR: 'verify_flutterwave_error',
  VERIFY_TX_REF_MISMATCH: 'verify_tx_ref_mismatch',
  
  // Status Changes
  STATUS_CHANGE: 'status_change',
  
  // Database Operations
  DB_WRITE_SUCCESS: 'db_write_success',
  DB_WRITE_FAILED: 'db_write_failed',
  DB_UPDATE_SUCCESS: 'db_update_success',
  DB_UPDATE_FAILED: 'db_update_failed',
  
  // User Document Updates
  USER_DOC_UPDATED: 'user_doc_updated',
  USER_DOC_UPDATE_FAILED: 'user_doc_update_failed',
  USER_DOC_CREATED: 'user_doc_created',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  
  // External API
  FLUTTERWAVE_API_CALL: 'flutterwave_api_call',
  FLUTTERWAVE_API_SUCCESS: 'flutterwave_api_success',
  FLUTTERWAVE_API_ERROR: 'flutterwave_api_error',
};

/**
 * Extract client IP address from request
 * @param {Request} req - Next.js request object
 * @returns {string}
 */
export function extractClientIP(req) {
  try {
    // Check common headers for forwarded IP
    const forwarded = req.headers.get?.('x-forwarded-for');
    if (forwarded) {
      // x-forwarded-for can contain multiple IPs, get the first one
      return forwarded.split(',')[0].trim();
    }
    
    const realIP = req.headers.get?.('x-real-ip');
    if (realIP) {
      return realIP;
    }
    
    const cfConnectingIP = req.headers.get?.('cf-connecting-ip');
    if (cfConnectingIP) {
      return cfConnectingIP;
    }
    
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Extract user agent from request
 * @param {Request} req - Next.js request object
 * @returns {string}
 */
export function extractUserAgent(req) {
  try {
    return req.headers.get?.('user-agent') || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Generate a unique request ID for tracing
 * @returns {string}
 */
export function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Logs payment action to audit collection (fire-and-forget, non-blocking)
 * This function will NEVER throw an error or block the main operation
 * 
 * @param {Object} auditData - Audit data to log
 * @param {string} auditData.action - Action type from PAYMENT_AUDIT_ACTIONS
 * @param {string} [auditData.paymentId] - Payment document ID
 * @param {string} [auditData.txRef] - Transaction reference
 * @param {string} [auditData.transactionId] - Flutterwave transaction ID
 * @param {string} [auditData.userId] - User ID associated with payment
 * @param {string} [auditData.previousStatus] - Previous status (for status changes)
 * @param {string} [auditData.newStatus] - New status
 * @param {number} [auditData.amount] - Payment amount
 * @param {string} [auditData.currency] - Payment currency
 * @param {string} [auditData.paymentType] - Type of payment (registration, membership, etc.)
 * @param {boolean} [auditData.success=true] - Whether the action was successful
 * @param {string} [auditData.errorMessage] - Error message if action failed
 * @param {string} [auditData.errorCode] - Error code if available
 * @param {Object} [auditData.metadata] - Additional metadata
 * @param {string} [auditData.ipAddress] - Client IP address
 * @param {string} [auditData.userAgent] - Client user agent
 * @param {string} [auditData.requestId] - Request ID for tracing
 * @param {Object} [auditData.flutterwaveResponse] - Flutterwave API response (sanitized)
 * @param {number} [auditData.responseTime] - Response time in ms (for API calls)
 */
export async function logPaymentAudit(auditData) {
  // Fire and forget - wrap everything in try-catch to never break caller
  try {
    const {
      action,
      paymentId = null,
      txRef = null,
      transactionId = null,
      userId = null,
      previousStatus = null,
      newStatus = null,
      amount = null,
      currency = null,
      paymentType = null,
      success = true,
      errorMessage = null,
      errorCode = null,
      metadata = null,
      ipAddress = 'unknown',
      userAgent = 'unknown',
      requestId = null,
      flutterwaveResponse = null,
      responseTime = null,
    } = auditData;

    const timestamp = new Date().toISOString();

    // Sanitize Flutterwave response - remove sensitive data but keep useful info
    let sanitizedFlwResponse = null;
    if (flutterwaveResponse) {
      sanitizedFlwResponse = {
        status: flutterwaveResponse.status,
        message: flutterwaveResponse.message,
        data: flutterwaveResponse.data ? {
          id: flutterwaveResponse.data.id,
          tx_ref: flutterwaveResponse.data.tx_ref,
          flw_ref: flutterwaveResponse.data.flw_ref,
          status: flutterwaveResponse.data.status,
          amount: flutterwaveResponse.data.amount,
          currency: flutterwaveResponse.data.currency,
          charged_amount: flutterwaveResponse.data.charged_amount,
          app_fee: flutterwaveResponse.data.app_fee,
          processor_response: flutterwaveResponse.data.processor_response,
          auth_model: flutterwaveResponse.data.auth_model,
          payment_type: flutterwaveResponse.data.payment_type,
          created_at: flutterwaveResponse.data.created_at,
          // Exclude: card details, customer PII, account numbers
        } : null
      };
    }

    const auditLog = {
      // Core identifiers
      action,
      paymentId,
      txRef,
      transactionId,
      userId,
      
      // Status tracking
      previousStatus,
      newStatus,
      
      // Payment details
      amount,
      currency,
      paymentType,
      
      // Result
      success,
      errorMessage,
      errorCode,
      
      // Request context
      ipAddress,
      userAgent,
      requestId,
      
      // External API data
      flutterwaveResponse: sanitizedFlwResponse,
      responseTime,
      
      // Additional context
      metadata,
      
      // Timestamps
      timestamp,
      
      // Environment info (useful for debugging)
      environment: process.env.NODE_ENV || 'development',
    };

    // Remove null/undefined values to keep documents clean
    const cleanedLog = Object.fromEntries(
      Object.entries(auditLog).filter(([_, value]) => value !== null && value !== undefined)
    );

    // Write to Firestore (fire-and-forget)
    adminDb.collection('payment-audit-logs').add(cleanedLog)
      .then((docRef) => {
        console.log(`[PAYMENT_AUDIT] ${action} logged: ${docRef.id}`);
      })
      .catch((err) => {
        // Log to console but don't throw
        console.error(`[PAYMENT_AUDIT] Failed to write audit log: ${err.message}`);
      });

  } catch (error) {
    // Never throw - just log to console
    console.error('[PAYMENT_AUDIT] Error in logPaymentAudit:', error.message);
  }
}

/**
 * Helper to create audit context from a request
 * @param {Request} req - Next.js request object
 * @returns {Object} - Audit context with IP, user agent, and request ID
 */
export function createAuditContext(req) {
  return {
    ipAddress: extractClientIP(req),
    userAgent: extractUserAgent(req),
    requestId: generateRequestId(),
  };
}

/**
 * Measure and log response time for external API calls
 * @param {Function} apiCall - Async function to measure
 * @param {string} action - Action name for logging
 * @param {Object} baseAuditData - Base audit data to include
 * @returns {Promise<{result: any, responseTime: number}>}
 */
export async function measureAndLogApiCall(apiCall, action, baseAuditData) {
  const startTime = Date.now();
  let result = null;
  let error = null;
  
  try {
    result = await apiCall();
    const responseTime = Date.now() - startTime;
    
    logPaymentAudit({
      ...baseAuditData,
      action,
      success: true,
      responseTime,
    });
    
    return { result, responseTime };
  } catch (err) {
    error = err;
    const responseTime = Date.now() - startTime;
    
    logPaymentAudit({
      ...baseAuditData,
      action: `${action}_error`,
      success: false,
      errorMessage: err.message,
      responseTime,
    });
    
    throw err; // Re-throw to let caller handle
  }
}
