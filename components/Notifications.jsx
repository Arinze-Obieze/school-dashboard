import { useEffect, useState } from 'react';
import { MdNotificationsActive, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from "@/firebase"

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(10);

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
      },
      (error) => {
        console.error('Error fetching notifications:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Get current notifications
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < Math.ceil(notifications.length / notificationsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Format timestamp if needed
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    // If it's a Firestore timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // If it's already a string or other format
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  return (
    <div className="bg-[#23272f] shadow rounded-lg p-5 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-100">
          <MdNotificationsActive className="text-orange-400" />
          Notifications & Announcements
        </h2>
        <Link href="/notifications" className="text-sm text-orange-400 hover:underline">
          Read More
        </Link>
      </div>
      
      <ul className="space-y-3 mb-4">
        {currentNotifications.map((note) => (
          <li key={note.id} className="text-gray-200 border-l-4 border-orange-400 pl-3 py-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-100">{note.title || 'Notification'}</h3>
                <p className="text-sm mt-1">• {note.message}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                {formatDate(note.createdAt)}
              </span>
            </div>
            <div className="flex gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded ${
                note.status === 'sent' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {/* {note.status} */}
              </span>
              {/* <span className="text-xs text-gray-400">
                To: {note.recipients === 'all' ? 'All Students' : `${note.selectedStudentIds?.length || 0} students`}
              </span> */}
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination Controls */}
      {notifications.length > notificationsPerPage && (
        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
          <div className="text-sm text-gray-400">
            Showing {indexOfFirstNotification + 1}-{Math.min(indexOfLastNotification, notifications.length)} of {notifications.length} notifications
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${
                currentPage === 1 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-orange-400 hover:bg-orange-400/20'
              }`}
            >
              <MdChevronLeft size={20} />
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
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
                    onClick={() => paginate(pageNumber)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === pageNumber
                        ? 'bg-orange-400 text-white'
                        : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${
                currentPage === totalPages 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-orange-400 hover:bg-orange-400/20'
              }`}
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;