import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';

export async function POST(req) {
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
    
    return NextResponse.json({ 
      success: true, 
      paymentId: paymentRef.id,
      paymentData: {
        txRef: txRef,
        amount: Number(amount),
        paymentType,
        status: 'pending'
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating payment record:', error.message);
    return NextResponse.json({ 
      error: 'Failed to create payment record',
      details: error.message 
    }, { status: 500 });
  }
}