import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';

export const runtime = 'nodejs';

export async function POST(req) {
  
  try {
    const {  transaction_id, tx_ref, userId } = await req.json();
    if (!transaction_id || !userId || !tx_ref) {
      return NextResponse.json({ error: 'Missing transaction_id or userId or tx_ref' }, { status: 400 });
    }
    
    // Call Flutterwave verify endpoint
    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
    const flwRes = await fetch(verifyUrl, {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const flwData = await flwRes.json();
    if (flwData.status === 'success' && flwData.data.status === 'successful') {
     // Verify that the tx_ref matches what we expect
      if(flwData.data.tx_ref !== tx_ref){
        return NextResponse.json({ error: 'Transaction reference mismatch' }, { status: 400 });
      }
      
      
      // Update Firestore using Admin SDK
      await adminDb.collection('users').doc(userId).update({ paymentStatus: 'success' });
      return NextResponse.json({ status: 'success' });
    } else {
      return NextResponse.json({ error: 'Payment not successful', flwData }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
