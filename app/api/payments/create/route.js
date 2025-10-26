import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';

export async function POST(req) {
  try {
    const { userId, amount, paymentType, txRef, description, customerEmail, customerName } = await req.json();
    
    if (!userId || !amount || !paymentType || !txRef) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user exists and get user reference
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRef = adminDb.collection('users').doc(userId);

    const paymentData = {
      userId,
      userRef: userRef, // Firebase DocumentReference
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
    
    // Add payment reference to user document
    await userRef.update({
      payments: adminDb.FieldValue.arrayUnion({
        paymentRef: paymentRef, // Firebase DocumentReference to payment
        amount: Number(amount),
        type: paymentType,
        status: 'pending',
        createdAt: new Date().toISOString()
      }),
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true, 
      paymentId: paymentRef.id,
      paymentData 
    });
    
  } catch (error) {
    console.error('Error creating payment record:', error);
    return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
  }
}