'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';
import { MdNotificationsActive, MdClose, FiArrowLeft } from 'react-icons/md';
import { FiArrowLeft as FiArrowLeftIcon, FiSearch, FiFilter, FiCheckCircle, FiCircle } from 'react-icons/fi';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter and search notifications
  useEffect(() => {
    let filtered = notifications;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(notification =>
        (notification.title && notification.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (notification.message && notification.message.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(notification => notification.status === filterStatus);
    }

    setFilteredNotifications(filtered);
    setCurrentPage(1);
  }, [searchQuery, filterStatus, notifications]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

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

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        status: 'read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const toggleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === currentNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      const allIds = new Set(currentNotifications.map(n => n.id));
      setSelectedNotifications(allIds);
    }
  };

  const markSelectedAsRead = async () => {
    try {
      for (const notificationId of selectedNotifications) {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
          status: 'read'
        });
      }
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course':
        return '📚';
      case 'payment':
        return '💳';
      case 'exam':
        return '📝';
      case 'announcement':
        return '📢';
      case 'system':
        return '⚙️';
      default:
        return '📬';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'course':
        return 'border-blue-500 bg-blue-500/10';
      case 'payment':
        return 'border-green-500 bg-green-500/10';
      case 'exam':
        return 'border-purple-500 bg-purple-500/10';
      case 'announcement':
        return 'border-orange-500 bg-orange-500/10';
      case 'system':
        return 'border-gray-500 bg-gray-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-400 hover:text-blue-500 mb-4 transition-colors"
          >
            <FiArrowLeftIcon className="mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <MdNotificationsActive className="text-3xl text-orange-400" />
            <h1 className="text-3xl font-bold">Notifications & Announcements</h1>
          </div>
          <p className="text-gray-400">Stay updated with all your notifications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Notifications</p>
            <p className="text-2xl font-bold text-white mt-1">{notifications.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Unread</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">
              {notifications.filter(n => n.status === 'sent').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Read</p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {notifications.filter(n => n.status === 'read').length}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="sent">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>

          {/* Selection Controls */}
          {currentNotifications.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.size === currentNotifications.length && currentNotifications.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-blue-500"
                />
                <span className="text-sm text-gray-400">
                  {selectedNotifications.size > 0
                    ? `${selectedNotifications.size} selected`
                    : 'Select notifications'}
                </span>
              </div>
              {selectedNotifications.size > 0 && (
                <button
                  onClick={markSelectedAsRead}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Mark as Read
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
            </div>
            <p className="text-gray-400 mt-4">Loading notifications...</p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && filteredNotifications.length > 0 && (
          <>
            <div className="space-y-4 mb-8">
              {currentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (notification.status === 'sent') {
                      markAsRead(notification.id);
                    }
                  }}
                  className={`${getNotificationColor(notification.type)} border-l-4 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                    notification.status === 'sent' ? 'bg-opacity-30' : 'bg-opacity-10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={() => toggleSelectNotification(notification.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 mt-1 cursor-pointer accent-blue-500 flex-shrink-0"
                    />

                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-base ${
                            notification.status === 'sent' ? 'text-white' : 'text-gray-300'
                          }`}>
                            {notification.title || 'Notification'}
                          </h3>
                          <p className={`text-sm mt-1 ${
                            notification.status === 'sent' ? 'text-gray-200' : 'text-gray-400'
                          }`}>
                            {notification.message}
                          </p>

                          {/* Additional Info */}
                          {notification.additionalInfo && (
                            <p className="text-xs text-gray-500 mt-2">
                              ℹ️ {notification.additionalInfo}
                            </p>
                          )}
                        </div>

                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                          {notification.status === 'sent' ? (
                            <FiCircle className="text-orange-400 text-xl" />
                          ) : (
                            <FiCheckCircle className="text-green-400 text-xl" />
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                            {notification.type || 'general'}
                          </span>
                          {notification.recipients && (
                            <span className="text-xs text-gray-500">
                              To: {notification.recipients === 'all' ? 'All Students' : `${notification.selectedStudentIds?.length || 0} students`}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredNotifications.length)} of {filteredNotifications.length} notifications
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
                              ? 'bg-orange-500 text-white'
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
        {!loading && filteredNotifications.length === 0 && (
          <div className="text-center py-16">
            <MdNotificationsActive className="mx-auto text-5xl text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Notifications</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'No notifications match your search or filters.'
                : 'You\'re all caught up! No notifications at the moment.'}
            </p>
            {(searchQuery || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
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

export default NotificationsPage;
