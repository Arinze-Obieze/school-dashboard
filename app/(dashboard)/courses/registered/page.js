'use client';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import MessageDisplay from '@/components/courses/MessageDisplay';
import { FiArrowLeft, FiBook, FiCalendar, FiUser, FiMail } from 'react-icons/fi';
import Link from 'next/link';

const RegisteredCoursesPage = () => {
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [userProfile, setUserProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchRegisteredCourses = async () => {
      setLoading(true);
      try {
        if (!user) {
          setMessage({ text: 'Please log in to view your registered courses.', type: 'error' });
          return;
        }

        // Fetch user's enrollment data
        const enrollmentRef = doc(db, 'enrollments', user.uid);
        const enrollmentDoc = await getDoc(enrollmentRef);

        if (!enrollmentDoc.exists() || !enrollmentDoc.data().courses) {
          setMessage({ text: 'You have not registered for any courses yet.', type: 'info' });
          setRegisteredCourses([]);
          return;
        }

        // Fetch user profile
        const profileRef = doc(db, 'users', user.uid);
        const profileDoc = await getDoc(profileRef);
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data());
        }

        // Fetch all courses to get course details
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const coursesMap = {};
        coursesSnapshot.docs.forEach(doc => {
          coursesMap[doc.id] = doc.data();
        });

        // Combine enrollment data with course details
        const enrollmentData = enrollmentDoc.data();
        const courses = enrollmentData.courses || {};
        
        const registeredCoursesData = Object.entries(courses).map(([courseId, courseData]) => {
          const courseDetails = coursesMap[courseId] || {};
          return {
            id: courseId,
            courseName: courseData.courseName || courseDetails.name || 'Unknown Course',
            programType: courseData.programType,
            registeredAt: courseData.registeredAt,
            status: courseData.status || 'registered',
            // description: courseDetails.description || 'No description available',
            // instructor: courseDetails.instructor || 'TBD',
            // duration: courseDetails.duration || 'TBD',
          };
        });

        setRegisteredCourses(registeredCoursesData);
        if (registeredCoursesData.length === 0) {
          setMessage({ text: 'You have not registered for any courses yet.', type: 'info' });
        }
      } catch (error) {
        console.error('Error fetching registered courses:', error);
        setMessage({ text: 'Failed to load registered courses. Please try again.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredCourses();
  }, [user]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date not available';
    
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

  const getProgramBadgeColor = (type) => {
    switch (type) {
      case 'primary': return 'bg-purple-100 text-purple-800';
      case 'mentorship': return 'bg-blue-100 text-blue-800';
      case 'fellowship': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'registered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = registeredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(registeredCourses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-900 text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/courses"
            className="inline-flex items-center text-blue-400 hover:text-blue-500 mb-4 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Courses
          </Link>
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-blue-400 mb-2">My Registered Courses</h1>
            <p className="text-gray-400">View all your course registrations</p>
          </header>
        </div>

        {/* User Profile Section */}
        {userProfile && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Registered Course Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
              <div className="flex items-center">
                <FiBook className="mr-3 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Total Registered Courses</p>
                  <p className="font-semibold">{registeredCourses.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <MessageDisplay message={message} onClose={() => setMessage({ text: '', type: '' })} />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
            <p className="text-gray-400 mt-4">Loading your registered courses...</p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && registeredCourses.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-700 hover:border-blue-500"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                    <h3 className="text-lg font-bold text-white truncate">{course.courseName}</h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Program Type Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getProgramBadgeColor(course.programType)}`}>
                        {course.programType === 'primary' ? 'Primary' : course.programType === 'mentorship' ? 'Mentorship' : 'Fellowship'} Program
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>

                    {/* Course Details */}
                    <div className="space-y-3 mb-4 border-t border-gray-700 pt-4">
                      <div className="flex items-start">
                        <FiCalendar className="mr-2 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-gray-400 text-xs">Registered</p>
                          <p className="text-sm">{formatDate(course.registeredAt)}</p>
                        </div>
                      </div>
                      
                      {/* <div className="flex items-start">
                        <FiUser className="mr-2 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-gray-400 text-xs">Instructor</p>
                          <p className="text-sm">{course.instructor}</p>
                        </div>
                      </div> */}

                      {/* <div className="flex items-start">
                        <FiBook className="mr-2 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-gray-400 text-xs">Duration</p>
                          <p className="text-sm">{course.duration}</p>
                        </div>
                      </div> */}
                    </div>

                    {/* Status Badge */}
                    <div className="border-t border-gray-700 pt-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(course.status)}`}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && registeredCourses.length === 0 && (
          <div className="text-center py-16">
            <FiBook className="mx-auto text-4xl text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Registered Courses</h3>
            <p className="text-gray-400 mb-6">You haven't registered for any courses yet.</p>
            <Link
              href="/courses/register"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register for a Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisteredCoursesPage;
