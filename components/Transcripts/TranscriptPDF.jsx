// components/TranscriptPDF.jsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  PDFDownloadLink,
  Font,
  Line,
} from '@react-pdf/renderer';

// Register fonts (you'll need to add these font files to your public folder)
// Font.register({
//   family: 'OpenSans',
//   src: '/fonts/OpenSans-Regular.ttf',
// });

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
    color: '#c53030',
    textAlign: 'center',
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  transcriptTitle: {
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
    borderLeftColor: '#2b6cb0',
  },
  studentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'column',
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#718096',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    color: '#2d3748',
    fontWeight: 'bold',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeader: {
    backgroundColor: '#1a365d',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
  },
  col1: { width: '15%' },
  col2: { width: '35%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '20%' },
  performanceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  performanceLabel: {
    fontSize: 10,
    color: '#718096',
    marginTop: 2,
  },
  gradeScale: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8f9fa',
  },
  gradeScaleTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
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
    marginTop: 40,
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
    color: 'rgba(26, 54, 93, 0.05)',
    fontWeight: 'bold',
  },
  certificateNumber: {
    position: 'absolute',
    top: 30,
    right: 40,
    fontSize: 9,
    color: '#718096',
  },
});

const TranscriptPDF = ({ exam, student }) => {
  const {
    quiz_id,
    title,
    date,
    student_category,
    student_batch,
    completed_at,
    report,
    course_name,
    course_code
  } = exam;

  const generateCertificateNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `WACCPS-TRN-${year}${month}-${quiz_id}-${random}`;
  };

  const calculateGrade = (score) => {
    if (score >= 80) return 'A - Excellent';
    if (score >= 70) return 'B - Very Good';
    if (score >= 60) return 'C - Good';
    if (score >= 50) return 'D - Pass';
    return 'F - Fail';
  };

  const getPerformanceRemarks = (score) => {
    if (score >= 80) return 'Outstanding Performance';
    if (score >= 70) return 'Very Good Performance';
    if (score >= 60) return 'Satisfactory Performance';
    if (score >= 50) return 'Passing Performance';
    return 'Needs Improvement';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>WACCPS</Text>
        
        {/* Certificate Number */}
        <Text style={styles.certificateNumber}>
          Transcript ID: {generateCertificateNumber()}
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
            OFFICIAL EXAMINATION TRANSCRIPT
          </Text>
        </View>

        {/* Student Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STUDENT INFORMATION</Text>
          <View style={styles.studentInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Student Name</Text>
              <Text style={styles.infoValue}>{student?.displayName || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Student ID</Text>
              <Text style={styles.infoValue}>{student?.uid || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{student_category}</Text>
            </View>
          </View>
          <View style={styles.studentInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Batch/Year</Text>
              <Text style={styles.infoValue}>{student_batch}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Transcript Date</Text>
              <Text style={styles.infoValue}>
                {new Date().toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Exam Date</Text>
              <Text style={styles.infoValue}>
                {new Date(date).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Exam Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXAMINATION DETAILS</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col1]}>Code</Text>
              <Text style={[styles.tableCell, styles.col2]}>Course/Exam</Text>
              <Text style={[styles.tableCell, styles.col3]}>Date</Text>
              <Text style={[styles.tableCell, styles.col4]}>Status</Text>
              <Text style={[styles.tableCell, styles.col5]}>Completion</Text>
            </View>
            
            {/* Table Row */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>{course_code || 'EXM-' + quiz_id}</Text>
              <Text style={[styles.tableCell, styles.col2]}>{title}</Text>
              <Text style={[styles.tableCell, styles.col3]}>
                {new Date(date).toLocaleDateString()}
              </Text>
              <Text style={[styles.tableCell, styles.col4]}>Completed</Text>
              <Text style={[styles.tableCell, styles.col5]}>
                {new Date(completed_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERFORMANCE SUMMARY</Text>
          
          <View style={styles.performanceSummary}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>
                {report?.score ? `${report.score.toFixed(1)}%` : 'N/A'}
              </Text>
              <Text style={styles.performanceLabel}>FINAL SCORE</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>
                {calculateGrade(report?.score || 0).split(' - ')[0]}
              </Text>
              <Text style={styles.performanceLabel}>GRADE</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>
                {report?.correct || 0}/{report?.total || 0}
              </Text>
              <Text style={styles.performanceLabel}>CORRECT ANSWERS</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>
                {(((report?.correct || 0) / (report?.total || 1)) * 100).toFixed(1)}%
              </Text>
              <Text style={styles.performanceLabel}>ACCURACY RATE</Text>
            </View>
          </View>

          {/* Detailed Breakdown */}
          <View style={[styles.table, { marginTop: 15 }]}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: '25%' }]}>Metric</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>Value</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>Percentage</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>Remarks</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '25%' }]}>Total Questions</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>{report?.total || 0}</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>100%</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>-</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '25%' }]}>Answered</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>{report?.answered || 0}</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>
                {report?.total ? ((report.answered / report.total) * 100).toFixed(1) + '%' : '0%'}
              </Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>
                {report?.answered === report?.total ? 'All questions attempted' : 'Some questions unattempted'}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '25%' }]}>Correct Answers</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>{report?.correct || 0}</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>
                {report?.total ? ((report.correct / report.total) * 100).toFixed(1) + '%' : '0%'}
              </Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>Satisfactory</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '25%' }]}>Wrong Answers</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>{report?.wrong || 0}</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>
                {report?.total ? ((report.wrong / report.total) * 100).toFixed(1) + '%' : '0%'}
              </Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>Needs Review</Text>
            </View>
            {report?.total && report?.answered && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '25%' }]}>Unattempted</Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>
                  {report.total - report.answered}
                </Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>
                  {((report.total - report.answered) / report.total * 100).toFixed(1)}%
                </Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>Time Management</Text>
              </View>
            )}
          </View>
        </View>

        {/* Grade Scale and Remarks */}
        <View style={styles.gradeScale}>
          <Text style={styles.gradeScaleTitle}>GRADING SCALE & REMARKS</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <View>
              <Text style={{ fontSize: 10, marginBottom: 3 }}>• 80-100%: A - Excellent</Text>
              <Text style={{ fontSize: 10, marginBottom: 3 }}>• 70-79%: B - Very Good</Text>
              <Text style={{ fontSize: 10, marginBottom: 3 }}>• 60-69%: C - Good</Text>
              <Text style={{ fontSize: 10, marginBottom: 3 }}>• 50-59%: D - Pass</Text>
              <Text style={{ fontSize: 10 }}>• Below 50%: F - Fail</Text>
            </View>
            <View style={{ width: '50%' }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>
                EXAMINER'S REMARKS:
              </Text>
              <Text style={{ fontSize: 10, fontStyle: 'italic' }}>
                {getPerformanceRemarks(report?.score || 0)}. This transcript is an official record of examination performance at the West African College of Clinical Physiology Sciences. The results have been verified and authenticated by the examination board.
              </Text>
            </View>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatureArea}>
          <View style={styles.signature}>
            <Text style={styles.signatureLine} />
            <Text style={styles.signatureName}>Dr. A. B. Johnson</Text>
            <Text style={styles.signatureTitle}>
              Registrar & Chief Examiner
            </Text>
            <Text style={styles.signatureTitle}>
              West African College of Clinical Physiology Sciences
            </Text>
          </View>
          
          <View style={styles.signature}>
            <Text style={styles.signatureLine} />
            <Text style={styles.signatureName}>Prof. M. K. Williams</Text>
            <Text style={styles.signatureTitle}>
              Dean of Examinations
            </Text>
            <Text style={styles.signatureTitle}>
              Professional Certification Board
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This is an official transcript issued by the West African College of Clinical Physiology Sciences.
            For verification, visit https://www.waccps.org or contact registrar@waccps.org
          </Text>
          <Text style={{ marginTop: 5 }}>
            © {new Date().getFullYear()} WACCPS. All rights reserved. This document is confidential and intended solely for the addressee.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default TranscriptPDF;