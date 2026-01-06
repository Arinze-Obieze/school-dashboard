import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';
import { 
  logPaymentAudit, 
  createAuditContext, 
  PAYMENT_AUDIT_ACTIONS 
} from '@/lib/paymentAudit';

const RATE_LIMIT = 10; // 10 requests per minute for payment creation

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
      errorMessage: 'Rate limit exceeded for payment creation',
      ...auditContext,
    });
    return rateLimitResult;
  }

  let parsedBody = {};

  try {
    parsedBody = await req.json();
    const { userId, amount, paymentType, txRef, description, customerEmail, customerName } = parsedBody;
    
    // Log payment creation initiated
    logPaymentAudit({
      action: PAYMENT_AUDIT_ACTIONS.CREATE_INITIATED,
      txRef,
      userId,
      paymentType,
      amount: amount ? Number(amount) : null,
      currency: 'NGN',
      metadata: { customerEmail, customerName, description },
      ...auditContext,
    });
    
    // Validate required fields
    if (!userId || !amount || !paymentType || !txRef) {
      // Log validation error
      logPaymentAudit({
        action: PAYMENT_AUDIT_ACTIONS.CREATE_VALIDATION_ERROR,
        txRef,
        userId,
        paymentType,
        amount: amount ? Number(amount) : null,
        success: false,
        errorMessage: 'Missing required fields: userId, amount, paymentType, txRef',
        metadata: { 
          hasUserId: !!userId, 
          hasAmount: !!amount, 
          hasPaymentType: !!paymentType, 
          hasTxRef: !!txRef 
        },
        ...auditContext,
      });
      return NextResponse.json({ 
        error: 'Missing required fields: userId, amount, paymentType, txRef' 
      }, { status: 400 });
    }

    // Create payment record without user verification (user may not have doc yet)
    const paymentData = {
      userId,
      amount: Number(amount),
      currency: 'NGN',
      paymentType,
      status: 'pending',
      txRef,
      description,
      customerEmail,
      customerName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let paymentRef;
    try {
      paymentRef = await adminDb.collection('payments').add(paymentData);
      
      // Log successful payment creation
      logPaymentAudit({
        action: PAYMENT_AUDIT_ACTIONS.CREATE_SUCCESS,
        paymentId: paymentRef.id,
        txRef,
        userId,
        paymentType,
        amount: Number(amount),
        currency: 'NGN',
        newStatus: 'pending',
        success: true,
        metadata: { customerEmail, customerName, description },
        ...auditContext,
      });
    } catch (dbError) {
      // Log database write failure
      logPaymentAudit({
        action: PAYMENT_AUDIT_ACTIONS.DB_WRITE_FAILED,
        txRef,
        userId,
        paymentType,
        amount: Number(amount),
        currency: 'NGN',
        success: false,
        errorMessage: `Failed to create payment record: ${dbError.message}`,
        ...auditContext,
      });
      throw dbError;
    }
    
    const response = NextResponse.json({ 
      success: true, 
      paymentId: paymentRef.id,
      paymentData: {
        txRef: txRef,
        amount: Number(amount),
        paymentType,
        status: 'pending'
      }
    }, { status: 201 });

    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
    
  } catch (error) {
    console.error('Error creating payment record:', error.message);
    
    // Log internal server error
    logPaymentAudit({
      action: PAYMENT_AUDIT_ACTIONS.CREATE_FAILED,
      txRef: parsedBody.txRef || null,
      userId: parsedBody.userId || null,
      paymentType: parsedBody.paymentType || null,
      amount: parsedBody.amount ? Number(parsedBody.amount) : null,
      success: false,
      errorMessage: error.message,
      errorCode: 'INTERNAL_ERROR',
      metadata: { stack: error.stack?.substring(0, 500) },
      ...auditContext,
    });
    
    return NextResponse.json({ 
      error: 'Failed to create payment record',
      details: error.message 
    }, { status: 500 });
  }
}

export { POST };