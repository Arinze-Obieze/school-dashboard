import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';

export const runtime = 'nodejs';

export async function POST(req) {
  
  try {
    const { tx_ref, userId } = await req.json();
    if (!tx_ref || !userId) {
      return NextResponse.json({ error: 'Missing tx_ref or userId' }, { status: 400 });
    }
    
    // Call Flutterwave verify endpoint
    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${tx_ref}/verify`;
    const flwRes = await fetch(verifyUrl, {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const flwData = await flwRes.json();
    if (flwData.status === 'success' && flwData.data.status === 'successful') {
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
