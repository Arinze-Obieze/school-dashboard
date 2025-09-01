'use client'
import { useEffect, useState } from 'react';
import { FiSearch, FiBook, FiUser, FiUsers, FiArrowLeft, FiCheck, FiX, FiCalendar, FiSpeaker } from 'react-icons/fi';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import {getAuth} from 'firebase/auth'

const CourseSelectionPortal = () => {
  const [programType, setProgramType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });


const auth =getAuth();
const user =auth.currentUser;

// Fetch courses from Firestore using IIFE in useEffect
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(data);
      } catch (e) {
        console.error('Error fetching course collection', e);
        setMessage({ text: 'Failed to load courses. Please try again.', type: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.name && course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date not available';
    
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle course registration
  const handleRegistration = async () => {
    if ( !selectedCourse) {
      setMessage({ text: 'Missing required information for registration.', type: 'error' });
      return;
    }

    setRegistering(true);
    try {
      // Save to enrollments collection
      await addDoc(collection(db, 'enrollments'), {     
           userId: user.uid,
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        programType,
        registeredAt: serverTimestamp(),
        status: 'registered'
      });

      setMessage({ text: 'Registration successful!', type: 'success' });
      
      // Reset after successful registration
      setTimeout(() => {
        setProgramType(null);
        setSelectedCourse(null);
        setSearchQuery('');
        setMessage({ text: '', type: '' });
      }, 2000);
    } catch (error) {
      console.error('Error registering for course:', error);
      setMessage({ text: 'Registration failed. Please try again.', type: 'error' });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Course Registration Portal</h1>
          <p className="text-gray-400">register for available courses</p>
        </header>

        {/* Message Display */}
        {message.text && (
          <div className={`max-w-2xl mx-auto mb-6 p-4 rounded-lg ${
            message.type === 'error' ? 'bg-red-900/30 border border-red-700' : 'bg-green-900/30 border border-green-700'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {message.type === 'error' ? (
                  <FiX className="text-red-400 mr-2" />
                ) : (
                  <FiCheck className="text-green-400 mr-2" />
                )}
                <span>{message.text}</span>
              </div>
              <button 
                onClick={() => setMessage({ text: '', type: '' })}
                className="text-gray-400 hover:text-white"
              >
                <FiX />
              </button>
            </div>
          </div>
        )}

        {/* Program Selection */}
        {!programType && !selectedCourse && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-8 text-center">Select Registration Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                onClick={() => setProgramType('mentorship')}
                className="p-6 rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 bg-gray-800 hover:bg-gray-700 border-2 border-blue-500"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <FiUser className="text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Mentorship Program</h3>
                <p className="text-center text-gray-400">
                  One-on-one guidance from experienced professionals in your field of study.
                </p>
              </div>

              <div 
                onClick={() => setProgramType('fellowship')}
                className="p-6 rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 bg-gray-800 hover:bg-gray-700 border-2 border-green-500"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <FiUsers className="text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Fellowship Program</h3>
                <p className="text-center text-gray-400">
                  Join a community of scholars for collaborative research and advanced training.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Course Selection */}
        {programType && !selectedCourse && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center mb-2">
              <button 
                onClick={() => setProgramType(null)}
                className="flex items-center text-blue-400 hover:text-blue-500 mr-4"
              >
                <FiArrowLeft className="mr-1 cursor-pointer" /> Back
              </button>
              <span className={`px-3 py-1 rounded-full text-sm ${programType === 'mentorship' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {programType === 'mentorship' ? 'Mentorship' : 'Fellowship'} Program
              </span>
            </div>

            <h2 className="text-2xl font-semibold mb-6">Select a Course</h2>
            
            {/* Search Bar */}
            <div className="relative mb-8 bg-gray-800 rounded-lg shadow-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Course List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-400">
                  Loading courses...
                </div>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div 
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className="p-4 rounded-lg shadow-md cursor-pointer transform transition-all duration-300 hover:scale-[1.02] bg-gray-800 hover:bg-gray-700 border-l-4 border-blue-500"
                  >
                    <div className="flex items-start">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-4 flex-shrink-0">
                        <FiBook />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{course.name}</h3>
                        {course.description && (
                          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{course.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-3 mt-3">
                          {course.lecturers && course.lecturers.length > 0 && (
                            <div className="flex items-center text-xs text-gray-500">
                              <FiSpeaker className="mr-1" />
                              <span>{course.lecturers.length} Lecturer{course.lecturers.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          
                          {course.createdAt && (
                            <div className="flex items-center text-xs text-gray-500">
                              <FiCalendar className="mr-1" />
                              <span>{formatDate(course.createdAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {searchQuery ? 'No courses found matching your search.' : 'No courses available at the moment.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Course Confirmation */}
        {selectedCourse && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-2">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="flex items-center text-blue-400 hover:text-blue-500 mr-4"
              >
                <FiArrowLeft className="mr-1" /> Back
              </button>
              <span className={`px-3 py-1 rounded-full text-sm ${programType === 'mentorship' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {programType === 'mentorship' ? 'Mentorship' : 'Fellowship'} Program
              </span>
            </div>

            <div className="p-6 rounded-xl shadow-lg bg-gray-800 border-2 border-green-500">
              <div className="flex justify-center mb-6">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FiBook className="text-2xl" />
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold mb-2 text-center">Course Selected</h2>
              <h3 className="text-xl font-medium mb-6 text-center text-blue-400">{selectedCourse.name}</h3>
              
              <div className="mb-6">
                {selectedCourse.description && (
                  <p className="text-gray-400 mb-4 text-center">{selectedCourse.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {selectedCourse.lecturers && selectedCourse.lecturers.length > 0 && (
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-300 mb-2 flex items-center">
                        <FiSpeaker className="mr-2" /> Lecturers
                      </h4>
                      <ul className="text-sm text-gray-400">
                        {selectedCourse.lecturers.map((lecturer, index) => (
                          <li key={index} className="mb-1">• {lecturer}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedCourse.createdAt && (
                    <div className="bg-gray-700/50 p-3  rounded-lg">
                      <h4 className="font-medium text-gray-300 mb-2 flex items-center">
                        <FiCalendar className="mr-2" /> Course Created
                      </h4>
                      <p className="text-sm text-gray-400">{formatDate(selectedCourse.createdAt)}</p>
                    </div>
                  )}
                </div>
                
                <p className="text-center text-gray-400 mt-6">
                  You have selected <span className="font-medium">{selectedCourse.name}</span> under the {programType} program.
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="px-6 py-2 rounded-lg font-medium bg-gray-700 hover:bg-gray-600"
                  disabled={registering}
                >
                  Change Course
                </button>
                <button 
                  onClick={handleRegistration}
                  disabled={registering}
                  className="px-6 py-2 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
                >
                  {registering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Confirm Registration'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

     
      </div>
    </div>
  );
};

export default CourseSelectionPortal;