import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';
import { validateUserId, validateTxRef, sanitizeString, validateEnum } from '@/lib/inputValidator';
import { 
  logPaymentAudit, 
  createAuditContext, 
  PAYMENT_AUDIT_ACTIONS 
} from '@/lib/paymentAudit';

export const runtime = 'nodejs';

const RATE_LIMIT = 15; // 15 requests per minute for payment verification

async function POST(req) {
  // Create audit context early for all logging
  const auditContext = createAuditContext(req);
  
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    // Log rate limit exceeded
    logPaymentAudit({
      action: PAYMENT_AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
      success: false,
      errorMessage: 'Rate limit exceeded for payment verification',
      ...auditContext,
    });
    return rateLimitResult;
  }

  let parsedBody = {};
  
  try {
    parsedBody = await req.json();
    const { transaction_id, tx_ref, userId, paymentType = 'registration' } = parsedBody;
    
    // Validate required fields
    if (!transaction_id || !userId || !tx_ref) {
      logPaymentAudit({
        action: PAYMENT_AUDIT_ACTIONS.VERIFY_VALIDATION_ERROR,
        success: false,
        errorMessage: 'Missing required fields: transaction_id, userId, or tx_ref',
        metadata: { 
          hasTransactionId: !!transaction_id, 
          hasUserId: !!userId, 
          hasTxRef: !!tx_ref 
        },
        ...auditContext,
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate and sanitize inputs
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.valid) {
      logPaymentAudit({
        action: PAYMENT_AUDIT_ACTIONS.VERIFY_VALIDATION_ERROR,
        success: false,
        errorMessage: userIdValidation.error,
        ...auditContext,
      });
      return NextResponse.json({ error: userIdValidation.error }, { status: 400 });
    }

    const txRefValidation = validateTxRef(tx_ref);
    if (!txRefValidation.valid) {
      logPaymentAudit({
        action: PAYMENT_AUDIT_ACTIONS.VERIFY_VALIDATION_ERROR,
        success: false,
        errorMessage: txRefValidation.error,
        ...auditContext,
      });
      return NextResponse.json({ error: txRefValidation.error }, { status: 400 });
    }

    const paymentTypeValidation = validateEnum(
      paymentType,
      ['registration', 'membership', 'fellowship', 'course', 'exam', 'other'],
      'Payment type'
    );
    if (!paymentTypeValidation.valid) {
      logPaymentAudit({
        action: PAYMENT_AUDIT_ACTIONS.VERIFY_VALIDATION_ERROR,
        success: false,
        errorMessage: paymentTypeValidation.error,
        ...auditContext,
      });
      return NextResponse.json({ error: paymentTypeValidation.error }, { status: 400 });
    }

    const sanitizedTransactionId = sanitizeString(transaction_id, { maxLength: 255 });
    
    // Use sanitized values
    const validatedUserId = userIdValidation.sanitized;
    const validatedTxRef = txRefValidation.sanitized;
    const validatedPaymentType = paymentTypeValidation.sanitized;
    
    // Log verification initiated
    logPaymentAudit({
      action: PAYMENT_AUDIT_ACTIONS.VERIFY_INITIATED,
      txRef: validatedTxRef,
      transactionId: sanitizedTransactionId,
      userId: validatedUserId,
      paymentType: validatedPaymentType,
      ...auditContext,
    });
    
    // Call Flutterwave verify endpoint
    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${sanitizedTransactionId}/verify`;
    
    const flwStartTime = Date.now();
    let flwRes;
    try {
      flwRes = await fetch(verifyUrl, {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (fetchError) {
      const responseTime = Date.now() - flwStartTime;
      // Log Flutterwave API network error
      logPaymentAudit({
        action: PAYMENT_AUDIT_ACTIONS.FLUTTERWAVE_API_ERROR,
        txRef: validatedTxRef,
        transactionId: sanitizedTransactionId,
        userId: validatedUserId,
        paymentType: validatedPaymentType,
        success: false,
        errorMessage: `Network error calling Flutterwave: ${fetchError.message}`,
        errorCode: 'NETWORK_ERROR',
        responseTime,
        ...auditContext,
      });
      throw fetchError;
    }
    
    const flwResponseTime = Date.now() - flwStartTime;
    
    if (!flwRes.ok) {
      // Log Flutterwave API HTTP error
      logPaymentAudit({
        action: PAYMENT_AUDIT_ACTIONS.FLUTTERWAVE_API_ERROR,
        txRef: validatedTxRef,
        transactionId: sanitizedTransactionId,
        userId: validatedUserId,
        paymentType: validatedPaymentType,
        success: false,
        errorMessage: `Flutterwave API error: ${flwRes.status}`,
        errorCode: `HTTP_${flwRes.status}`,
        responseTime: flwResponseTime,
        ...auditContext,
      });
      throw new Error(`Flutterwave API error: ${flwRes.status}`);
    }
    
    const flwData = await flwRes.json();
    
    // Log successful Flutterwave API call (without sensitive data)
    logPaymentAudit({
      action: PAYMENT_AUDIT_ACTIONS.FLUTTERWAVE_API_SUCCESS,
      txRef: validatedTxRef,
      transactionId: sanitizedTransactionId,
      userId: validatedUserId,
      paymentType: validatedPaymentType,
      success: true,
      // Only log essential verification details, not full customer/card data
      verificationStatus: flwData.data?.status,
      verificationAmount: flwData.data?.amount,
      verificationCurrency: flwData.data?.currency,
      responseTime: flwResponseTime,
      ...auditContext,
    });
    
    if (flwData.status === 'success' && flwData.data.status === 'successful') {
      if (flwData.data.tx_ref !== validatedTxRef) {
        // Log transaction reference mismatch
        logPaymentAudit({
          action: PAYMENT_AUDIT_ACTIONS.VERIFY_TX_REF_MISMATCH,
          txRef: validatedTxRef,
          transactionId: sanitizedTransactionId,
          userId: validatedUserId,
          paymentType: validatedPaymentType,
          success: false,
          errorMessage: 'Transaction reference mismatch',
          metadata: {
            expectedTxRef: validatedTxRef,
            receivedTxRef: flwData.data.tx_ref,
          },
          ...auditContext,
        });
        return NextResponse.json({ error: 'Transaction reference mismatch' }, { status: 400 });
      }
      
      const userRef = adminDb.collection('users').doc(validatedUserId);
      
      // Get user doc (but don't fail if it doesn't exist - we'll create it)
      const userDoc = await userRef.get();
      
      const paymentData = {
        userId: validatedUserId,
        txRef: validatedTxRef,
        transactionId: sanitizedTransactionId,
        amount: flwData.data.amount,
        currency: flwData.data.currency,
        paymentType: validatedPaymentType,
        status: 'success',
        flutterwaveResponse: flwData.data,
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Find existing payment document
      const paymentsSnapshot = await adminDb.collection('payments')
        .where('txRef', '==', validatedTxRef)
        .where('userId', '==', validatedUserId)
        .limit(1)
        .get();
      
      let paymentId;
      
      if (paymentsSnapshot.empty) {
        // Create new payment document
        try {
          const paymentRef = await adminDb.collection('payments').add(paymentData);
          paymentId = paymentRef.id;
          
          // Log successful payment creation
          logPaymentAudit({
            action: PAYMENT_AUDIT_ACTIONS.DB_WRITE_SUCCESS,
            paymentId,
            txRef: validatedTxRef,
            transactionId: sanitizedTransactionId,
            userId: validatedUserId,
            paymentType: validatedPaymentType,
            amount: flwData.data.amount,
            currency: flwData.data.currency,
            previousStatus: null,
            newStatus: 'success',
            success: true,
            metadata: { operation: 'create_new_payment' },
            ...auditContext,
          });
        } catch (dbError) {
          // Log database write failure
          logPaymentAudit({
            action: PAYMENT_AUDIT_ACTIONS.DB_WRITE_FAILED,
            txRef: validatedTxRef,
            transactionId: sanitizedTransactionId,
            userId: validatedUserId,
            paymentType: validatedPaymentType,
            amount: flwData.data.amount,
            currency: flwData.data.currency,
            success: false,
            errorMessage: `Failed to create payment record: ${dbError.message}`,
            metadata: { operation: 'create_new_payment' },
            ...auditContext,
          });
          throw dbError;
        }
      } else {
        // Update existing payment document
        const paymentDoc = paymentsSnapshot.docs[0];
        paymentId = paymentDoc.id;
        const previousData = paymentDoc.data();
        const paymentRef = adminDb.collection('payments').doc(paymentId);
        
        try {
          await paymentRef.update({
            ...paymentData,
            updatedAt: new Date().toISOString()
          });
          
          // Log successful payment update with status change
          logPaymentAudit({
            action: PAYMENT_AUDIT_ACTIONS.STATUS_CHANGE,
            paymentId,
            txRef: validatedTxRef,
            transactionId: sanitizedTransactionId,
            userId: validatedUserId,
            paymentType: validatedPaymentType,
            amount: flwData.data.amount,
            currency: flwData.data.currency,
            previousStatus: previousData.status,
            newStatus: 'success',
            success: true,
            metadata: { operation: 'update_existing_payment' },
            ...auditContext,
          });
        } catch (dbError) {
          // Log database update failure
          logPaymentAudit({
            action: PAYMENT_AUDIT_ACTIONS.DB_UPDATE_FAILED,
            paymentId,
            txRef: tx_ref,
            transactionId: transaction_id,
            userId,
            paymentType,
            success: false,
            errorMessage: `Failed to update payment record: ${dbError.message}`,
            metadata: { operation: 'update_existing_payment' },
            ...auditContext,
          });
          throw dbError;
        }
      }
      
      // Update user document with payment status
      const userUpdateData = {
        paymentStatus: 'success',
        lastPaymentDate: new Date().toISOString(),
        lastPaymentAmount: flwData.data.amount,
        lastPaymentType: paymentType,
        updatedAt: new Date().toISOString()
      };
      
      // Update or create user doc
      try {
        if (userDoc.exists) {
          await userRef.update(userUpdateData);
          // Log user doc updated
          logPaymentAudit({
            action: PAYMENT_AUDIT_ACTIONS.USER_DOC_UPDATED,
            paymentId,
            txRef: tx_ref,
            transactionId: transaction_id,
            userId,
            paymentType,
            success: true,
            metadata: { operation: 'update_user_doc' },
            ...auditContext,
          });
        } else {
          // Create user doc if it doesn't exist
          await userRef.set(userUpdateData, { merge: true });
          // Log user doc created
          logPaymentAudit({
            action: PAYMENT_AUDIT_ACTIONS.USER_DOC_CREATED,
            paymentId,
            txRef: tx_ref,
            transactionId: transaction_id,
            userId,
            paymentType,
            success: true,
            metadata: { operation: 'create_user_doc' },
            ...auditContext,
          });
        }
      } catch (userDocError) {
        // Log user doc update failure (non-blocking - payment was successful)
        logPaymentAudit({
          action: PAYMENT_AUDIT_ACTIONS.USER_DOC_UPDATE_FAILED,
          paymentId,
          txRef: tx_ref,
          transactionId: transaction_id,
          userId,
          paymentType,
          success: false,
          errorMessage: `Failed to update user doc: ${userDocError.message}`,
          metadata: { operation: userDoc.exists ? 'update_user_doc' : 'create_user_doc' },
          ...auditContext,
        });
        // Don't throw - payment was successful, this is secondary
        console.error(`[PAYMENT] Failed to update user doc but payment was successful: ${userDocError.message}`);
      }
      
      // Add payment reference to user's payments array
      const userData = userDoc.exists ? userDoc.data() : {};
      const userPayments = userData.payments || [];
      
      // Check if this payment already exists in user's payments array
      const existingPaymentIndex = userPayments.findIndex(
        payment => payment.txRef === tx_ref
      );
      
      const paymentRefObj = {
        id: paymentId,
        txRef: tx_ref,
        amount: flwData.data.amount,
        type: paymentType,
        status: 'success',
        paymentDate: new Date().toISOString()
      };
      
      if (existingPaymentIndex >= 0) {
        userPayments[existingPaymentIndex] = paymentRefObj;
      } else {
        userPayments.push(paymentRefObj);
      }
      
      await userRef.update({ payments: userPayments });
      console.log(`[PAYMENT] Payment successfully recorded and linked to user`);
      
      // Log overall verification success
      logPaymentAudit({
        action: PAYMENT_AUDIT_ACTIONS.VERIFY_SUCCESS,
        paymentId,
        txRef: tx_ref,
        transactionId: transaction_id,
        userId,
        paymentType,
        amount: flwData.data.amount,
        currency: flwData.data.currency,
        newStatus: 'success',
        success: true,
        flutterwaveResponse: flwData,
        ...auditContext,
      });
      
      const response = NextResponse.json({ 
        status: 'success',
        paymentId: paymentId,
        message: 'Payment verified and recorded successfully'
      });
      // Add rate limit headers
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
      
    } else {
      console.warn(`[PAYMENT] Payment verification failed: ${JSON.stringify(flwData)}`);
      
      // Log payment verification failed (Flutterwave returned non-successful status)
      logPaymentAudit({
        action: PAYMENT_AUDIT_ACTIONS.VERIFY_FAILED,
        txRef: tx_ref,
        transactionId: transaction_id,
        userId,
        paymentType,
        success: false,
        errorMessage: `Payment not successful: ${flwData.data?.status || flwData.status}`,
        errorCode: flwData.data?.status || 'PAYMENT_FAILED',
        flutterwaveResponse: flwData,
        metadata: {
          flwStatus: flwData.status,
          flwDataStatus: flwData.data?.status,
          processorResponse: flwData.data?.processor_response,
        },
        ...auditContext,
      });
      
      return NextResponse.json({ 
        error: 'Payment not successful', 
        details: flwData 
      }, { status: 400 });
    }
  } catch (e) {
    console.error('[PAYMENT] Payment verification error:', e);
    
    // Log internal server error
    logPaymentAudit({
      action: PAYMENT_AUDIT_ACTIONS.VERIFY_FAILED,
      txRef: parsedBody.tx_ref || null,
      transactionId: parsedBody.transaction_id || null,
      userId: parsedBody.userId || null,
      paymentType: parsedBody.paymentType || null,
      success: false,
      errorMessage: e.message,
      errorCode: 'INTERNAL_ERROR',
      metadata: { stack: e.stack?.substring(0, 500) },
      ...auditContext,
    });
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: e.message 
    }, { status: 500 });
  }
}

export { POST };