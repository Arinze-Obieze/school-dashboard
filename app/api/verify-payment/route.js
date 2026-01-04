import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { transaction_id, tx_ref, userId, paymentType = 'registration' } = await req.json();
    
    if (!transaction_id || !userId || !tx_ref) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    console.log(`[PAYMENT] Verifying payment: txRef=${tx_ref}, userId=${userId}, transactionId=${transaction_id}`);
    
    // Call Flutterwave verify endpoint
    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
    
    const flwRes = await fetch(verifyUrl, {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!flwRes.ok) {
      throw new Error(`Flutterwave API error: ${flwRes.status}`);
    }
    
    const flwData = await flwRes.json();
    console.log(`[PAYMENT] Flutterwave response: ${JSON.stringify(flwData)}`);
    
    if (flwData.status === 'success' && flwData.data.status === 'successful') {
      if (flwData.data.tx_ref !== tx_ref) {
        return NextResponse.json({ error: 'Transaction reference mismatch' }, { status: 400 });
      }
      
      const userRef = adminDb.collection('users').doc(userId);
      
      // Get user doc (but don't fail if it doesn't exist - we'll create it)
      const userDoc = await userRef.get();
      
      const paymentData = {
        userId: userId,
        txRef: tx_ref,
        transactionId: transaction_id,
        amount: flwData.data.amount,
        currency: flwData.data.currency,
        paymentType: paymentType,
        status: 'success',
        flutterwaveResponse: flwData.data,
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Find existing payment document
      const paymentsSnapshot = await adminDb.collection('payments')
        .where('txRef', '==', tx_ref)
        .where('userId', '==', userId)
        .limit(1)
        .get();
      
      let paymentId;
      
      if (paymentsSnapshot.empty) {
        // Create new payment document
        const paymentRef = await adminDb.collection('payments').add(paymentData);
        paymentId = paymentRef.id;
        console.log(`[PAYMENT] Created new payment record: ${paymentId}`);
      } else {
        // Update existing payment document
        const paymentDoc = paymentsSnapshot.docs[0];
        paymentId = paymentDoc.id;
        const paymentRef = adminDb.collection('payments').doc(paymentId);
        await paymentRef.update({
          ...paymentData,
          updatedAt: new Date().toISOString()
        });
        console.log(`[PAYMENT] Updated existing payment record: ${paymentId}`);
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
      if (userDoc.exists) {
        await userRef.update(userUpdateData);
      } else {
        // Create user doc if it doesn't exist
        await userRef.set(userUpdateData, { merge: true });
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
      
      return NextResponse.json({ 
        status: 'success',
        paymentId: paymentId,
        message: 'Payment verified and recorded successfully'
      });
      
    } else {
      console.warn(`[PAYMENT] Payment verification failed: ${JSON.stringify(flwData)}`);
      return NextResponse.json({ 
        error: 'Payment not successful', 
        details: flwData 
      }, { status: 400 });
    }
  } catch (e) {
    console.error('[PAYMENT] Payment verification error:', e);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: e.message 
    }, { status: 500 });
  }
}