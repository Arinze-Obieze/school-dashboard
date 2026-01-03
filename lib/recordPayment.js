// /lib/recordPayment.js
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';

/**
 * Records a successful payment to Firestore for a student.
 * @param {Object} params
 * @param {string} params.userId - The ID of the student who made the payment.
 * @param {number} params.amount - The amount paid.
 * @param {string} params.status - The status of the payment (should be 'success').
 * @param {string} params.method - The payment method (e.g. 'flutterwave').
 * @param {string} params.reference - The payment reference/transaction ID.
 * @param {string} [params.courseId] - Optional course ID related to the payment.
 * @returns {Promise<string|void>} - Returns the new doc ID if successful, or nothing if not saved.
 */
export async function recordPaymentToFirestore({ userId, amount, status, method, reference, courseId }) {
  if (status !== 'success') return;
  if (!userId || !amount || !method || !reference) return;
  try {
    const docRef = await addDoc(
      collection(db, 'payments', userId, 'transactions'),
      {
        userId,
        amount,
        status,
        method,
        reference,
        courseId: courseId || null,
        timestamp: serverTimestamp(),
      }
    );
    return docRef.id;
  } catch (err) {
    console.error('Error recording payment:', err);
  }
}

/**
 * Reusable function to record a successful payment in Firestore under payments/{userId}/transactions/{paymentRef}
 * @param {Object} params - Payment details
 * @param {string} params.userId - The ID of the student who made the payment
 * @param {number} params.amount - The amount paid
 * @param {string} params.status - The status of the payment (should be 'success')
 * @param {string} params.method - The payment method (e.g. 'flutterwave')
 * @param {string} params.reference - The payment reference/transaction ID
 * @param {string} [params.courseId] - The course ID (optional)
 * @param {Object} [params.extra] - Any extra fields to save
 * @returns {Promise<void>} Resolves when the payment is recorded
 */
export async function recordPayment({ userId, amount, status, method, reference, courseId = null, extra = {} }) {
  if (status !== 'success') {
    console.warn(`[RECORD_PAYMENT] Skipping payment record (status=${status}): ${reference}`);
    return;
  }
  if (!userId || !amount || !method || !reference) {
    console.error(`[RECORD_PAYMENT] Missing required fields - userId: ${userId}, amount: ${amount}, method: ${method}, reference: ${reference}`);
    return;
  }
  try {
    const paymentDoc = doc(db, 'payments', userId, 'transactions', reference);
    const paymentData = {
      userId,
      amount,
      status,
      method,
      reference,
      timestamp: serverTimestamp(),
      recordedAt: new Date().toISOString(),
      ...(courseId ? { courseId } : {}),
      ...extra,
    };
    await setDoc(paymentDoc, paymentData, { merge: true });
    console.log(`[RECORD_PAYMENT] Successfully recorded payment: ${reference} for user: ${userId}, amount: ${amount}`);
  } catch (err) {
    console.error('[RECORD_PAYMENT] Error recording payment:', err);
    throw err; // Re-throw so caller knows about the error
  }
}
