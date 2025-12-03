'use client';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';
import { FiArrowLeft, FiSearch, FiFilter, FiDownload, FiCalendar, FiDollarSign, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';
import { MdOutlinePayments } from 'react-icons/md';

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [userProfile, setUserProfile] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch payments collection
        const q = query(
          collection(db, 'payments'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const paymentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPayments(paymentsData);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      try {
        const { doc: firestoreDoc, getDoc } = await import('firebase/firestore');
        const userDoc = await getDoc(firestoreDoc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Filter and search payments
  useEffect(() => {
    let filtered = payments;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(payment =>
        (payment.txRef && payment.txRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.description && payment.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.transactionId && payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(payment => payment.paymentType === filterType);
    }

    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterType, payments]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'pending':
        return <FiClock className="w-5 h-5" />;
      case 'failed':
        return <FiX className="w-5 h-5" />;
      default:
        return <FiDollarSign className="w-5 h-5" />;
    }
  };

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'registration':
        return 'Registration Fee';
      case 'primary':
        return 'Primary Exam';
      case 'membership':
        return 'Membership';
      case 'fellowship':
        return 'Fellowship';
      default:
        return type || 'Payment';
    }
  };

  const getPaymentTypeColor = (type) => {
    switch (type) {
      case 'registration':
        return 'bg-blue-100 text-blue-800';
      case 'primary':
        return 'bg-purple-100 text-purple-800';
      case 'membership':
        return 'bg-green-100 text-green-800';
      case 'fellowship':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadReceipt = (payment) => {
    // Create a simple receipt in text format
    const receiptContent = `
PAYMENT RECEIPT
===============================================

Payment ID: ${payment.id}
Transaction Reference: ${payment.txRef}
Transaction ID: ${payment.transactionId || 'N/A'}

Date: ${formatDate(payment.paymentDate || payment.createdAt)}
Payment Type: ${getPaymentTypeLabel(payment.paymentType)}
Status: ${payment.status.toUpperCase()}

Amount: ₦${payment.amount.toLocaleString('en-NG')}
Currency: ${payment.currency}

Customer Name: ${payment.customerName || 'N/A'}
Customer Email: ${payment.customerEmail || 'N/A'}

Description: ${payment.description || 'N/A'}

===============================================
This is an automated receipt. No signature required.
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `Receipt-${payment.txRef}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Calculate totals
  const totalAmount = filteredPayments.reduce((sum, payment) => {
    if (payment.status === 'success') {
      return sum + (payment.amount || 0);
    }
    return sum;
  }, 0);

  const successfulPayments = filteredPayments.filter(p => p.status === 'success').length;
  const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/payments"
            className="inline-flex items-center text-blue-400 hover:text-blue-500 mb-4 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Payments
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <MdOutlinePayments className="text-3xl text-green-400" />
            <h1 className="text-3xl font-bold">Payment History</h1>
          </div>
          <p className="text-gray-400">View and manage all your payment transactions</p>
        </div>

        {/* User Info Card */}
        {/* {userProfile && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Account Name</p>
                <p className="text-lg font-semibold">{`${userProfile.surname || ''} ${userProfile.firstname || ''}`.trim() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-lg font-semibold">{userProfile.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Payments</p>
                <p className="text-lg font-semibold">{payments.length}</p>
              </div>
            </div>
          </div>
        )} */}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Payments</p>
            <p className="text-2xl font-bold text-white mt-1">{filteredPayments.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Successful</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{successfulPayments}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{pendingPayments}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Amount (Successful)</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">₦{totalAmount.toLocaleString('en-NG')}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by reference, transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="success">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="registration">Registration</option>
              <option value="primary">Primary Exam</option>
              <option value="membership">Membership</option>
              <option value="fellowship">Fellowship</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
            </div>
            <p className="text-gray-400 mt-4">Loading payment history...</p>
          </div>
        )}

        {/* Payments Table */}
        {!loading && filteredPayments.length > 0 && (
          <>
            <div className="overflow-x-auto border border-gray-700 rounded-lg mb-8">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Transaction Ref</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{payment.txRef}</p>
                          <p className="text-xs text-gray-400 mt-1">{payment.transactionId ? payment.transactionId.substring(0, 20) + '...' : 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentTypeColor(payment.paymentType)}`}>
                          {getPaymentTypeLabel(payment.paymentType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-green-400">₦{payment.amount?.toLocaleString('en-NG') || '0'}</p>
                        <p className="text-xs text-gray-400">{payment.currency || 'NGN'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <FiCalendar className="w-4 h-4 text-gray-500" />
                          {formatDate(payment.paymentDate || payment.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => downloadReceipt(payment)}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <FiDownload className="w-4 h-4" />
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPayments.length)} of {filteredPayments.length} payments
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-700 text-white hover:bg-gray-600'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && filteredPayments.length === 0 && (
          <div className="text-center py-16 bg-gray-800 rounded-lg border border-gray-700">
            <MdOutlinePayments className="mx-auto text-5xl text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Payment History</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || filterStatus !== 'all' || filterType !== 'all'
                ? 'No payments match your search or filters.'
                : 'You have not made any payments yet.'}
            </p>
            {(searchQuery || filterStatus !== 'all' || filterType !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterType('all');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
