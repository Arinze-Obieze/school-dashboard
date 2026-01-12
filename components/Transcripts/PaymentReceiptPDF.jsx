// components/Transcripts/PaymentReceiptPDF.jsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#1a365d',
    borderBottomStyle: 'solid',
    paddingBottom: 20,
  },
  collegeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a365d',
    textAlign: 'center',
    marginBottom: 5,
  },
  collegeSubtitle: {
    fontSize: 12,
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 10,
  },
  officialSeal: {
    fontSize: 16,
    color: '#16a34a',
    textAlign: 'center',
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 25,
    textDecoration: 'underline',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10,
    backgroundColor: '#f7fafc',
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#16a34a',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoLabel: {
    fontSize: 11,
    color: '#718096',
    fontWeight: 'bold',
    width: '40%',
  },
  infoValue: {
    fontSize: 11,
    color: '#2d3748',
    width: '60%',
    textAlign: 'right',
  },
  statusBadge: {
    padding: 6,
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statusSuccess: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  statusFailed: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  amountBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#16a34a',
    borderRadius: 8,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#15803d',
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
  },
  amountCurrency: {
    fontSize: 10,
    color: '#15803d',
    marginTop: 3,
  },
  paymentTypeBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
  paymentTypeText: {
    fontSize: 12,
    color: '#1e40af',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  notesBox: {
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#facc15',
    padding: 15,
    borderRadius: 4,
    marginTop: 20,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#854d0e',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 9,
    color: '#713f12',
    lineHeight: 1.5,
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#718096',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 15,
  },
  signatureArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  signature: {
    alignItems: 'center',
  },
  signatureLine: {
    width: 200,
    height: 1,
    backgroundColor: '#000',
    marginTop: 30,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 5,
  },
  signatureTitle: {
    fontSize: 9,
    color: '#718096',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: 'rgba(22, 163, 74, 0.05)',
    fontWeight: 'bold',
  },
  receiptNumber: {
    position: 'absolute',
    top: 30,
    right: 40,
    fontSize: 9,
    color: '#718096',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'dashed',
    marginVertical: 15,
  },
});

const PaymentReceiptPDF = ({ payment, userProfile }) => {
  const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `WACCPS-RCP-${year}${month}${day}-${random}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'success':
        return styles.statusSuccess;
      case 'pending':
        return styles.statusPending;
      case 'failed':
        return styles.statusFailed;
      default:
        return styles.statusSuccess;
    }
  };

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'registration':
        return 'Registration Fee';
      case 'primary':
        return 'Primary Examination Fee';
      case 'membership':
        return 'Membership Fee';
      case 'fellowship':
        return 'Fellowship Fee';
      default:
        return type || 'Payment';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>PAID</Text>
        
        {/* Receipt Number */}
        <Text style={styles.receiptNumber}>
          Receipt No: {generateReceiptNumber()}
        </Text>

        {/* Header with College Info */}
        <View style={styles.header}>
          <Text style={styles.collegeName}>
            WEST AFRICAN COLLEGE OF CLINICAL PHYSIOLOGY SCIENCES
          </Text>
          <Text style={styles.collegeSubtitle}>
            Professional Certification and Examination Board
          </Text>
          <Text style={styles.collegeSubtitle}>
            Accredited by the West African Health Organization
          </Text>
          <Text style={styles.officialSeal}>
            OFFICIAL PAYMENT RECEIPT
          </Text>
        </View>

        <Text style={styles.receiptTitle}>PAYMENT RECEIPT</Text>

        {/* Payment Type Badge */}
        <View style={styles.paymentTypeBox}>
          <Text style={styles.paymentTypeText}>
            {getPaymentTypeLabel(payment.paymentType).toUpperCase()}
          </Text>
        </View>

        {/* Amount Section */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Amount Paid</Text>
          <Text style={styles.amountValue}>
            ₦{payment.amount?.toLocaleString('en-NG') || '0.00'}
          </Text>
          <Text style={styles.amountCurrency}>{payment.currency || 'NGN'}</Text>
        </View>

        {/* Payment Status */}
        <View style={[styles.statusBadge, getStatusStyle(payment.status)]}>
          <Text>{payment.status ? payment.status.toUpperCase() : 'N/A'}</Text>
        </View>

        <View style={styles.divider} />

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRANSACTION DETAILS</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Transaction Reference:</Text>
            <Text style={styles.infoValue}>{payment.txRef || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Transaction ID:</Text>
            <Text style={styles.infoValue}>{payment.transactionId || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Date:</Text>
            <Text style={styles.infoValue}>
              {formatDate(payment.paymentDate || payment.createdAt)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Method:</Text>
            <Text style={styles.infoValue}>
              {payment.paymentMethod || 'Flutterwave'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Type:</Text>
            <Text style={styles.infoValue}>
              {getPaymentTypeLabel(payment.paymentType)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CUSTOMER DETAILS</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer Name:</Text>
            <Text style={styles.infoValue}>
              {payment.customerName || userProfile?.displayName || 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer Email:</Text>
            <Text style={styles.infoValue}>
              {payment.customerEmail || userProfile?.email || 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer Phone:</Text>
            <Text style={styles.infoValue}>
              {payment.customerPhone || userProfile?.phone || 'N/A'}
            </Text>
          </View>

          {payment.description && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description:</Text>
              <Text style={styles.infoValue}>{payment.description}</Text>
            </View>
          )}
        </View>

        {/* Important Notes */}
        <View style={styles.notesBox}>
          <Text style={styles.notesTitle}>IMPORTANT NOTES:</Text>
          <Text style={styles.notesText}>
            • This is an official payment receipt issued by the West African College of Clinical Physiology Sciences.
          </Text>
          <Text style={styles.notesText}>
            • Please retain this receipt for your records and future reference.
          </Text>
          <Text style={styles.notesText}>
            • For any inquiries regarding this payment, please quote the transaction reference number.
          </Text>
          <Text style={styles.notesText}>
            • This receipt is valid only if the payment status is marked as "SUCCESS".
          </Text>
          <Text style={styles.notesText}>
            • For verification, visit https://www.waccps.org or contact finance@waccps.org
          </Text>
        </View>

        {/* Signature Area */}
        <View style={styles.signatureArea}>
          <View style={styles.signature}>
            <Text style={styles.signatureLine} />
            <Text style={styles.signatureName}>Authorized Signature</Text>
            <Text style={styles.signatureTitle}>
              Finance Department
            </Text>
            <Text style={styles.signatureTitle}>
              West African College of Clinical Physiology Sciences
            </Text>
          </View>
          
          <View style={styles.signature}>
            <Text style={styles.signatureLine} />
            <Text style={styles.signatureName}>System Generated</Text>
            <Text style={styles.signatureTitle}>
              Date: {new Date().toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
            <Text style={styles.signatureTitle}>
              Time: {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This is an official payment receipt issued by the West African College of Clinical Physiology Sciences.
          </Text>
          <Text style={{ marginTop: 5 }}>
            © {new Date().getFullYear()} WACCPS. All rights reserved. This document is confidential and intended solely for the addressee.
          </Text>
          <Text style={{ marginTop: 5 }}>
            Contact: finance@waccps.org | Phone: +234 XXX XXX XXXX | Website: www.waccps.org
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PaymentReceiptPDF;
