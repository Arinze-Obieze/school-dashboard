import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';

const RATE_LIMIT = 10; // 10 requests per minute for payment creation

async function POST(req) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }

  try {
    const { userId, amount, paymentType, txRef, description, customerEmail, customerName } = await req.json();
    
    // Validate required fields
    if (!userId || !amount || !paymentType || !txRef) {
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

    const paymentRef = await adminDb.collection('payments').add(paymentData);
    
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
    return NextResponse.json({ 
      error: 'Failed to create payment record',
      details: error.message 
    }, { status: 500 });
  }
}

export { POST };