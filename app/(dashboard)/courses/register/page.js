'use client';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import ProgramSelection from '@/components/courses/ProgramSelection';
import CourseList from '@/components/courses/CourseList';
import CourseConfirmation from '@/components/courses/CourseConfirmation';
import MessageDisplay from '@/components/courses/MessageDisplay';

const CourseSelectionPortal = () => {
  const [programType, setProgramType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [userEnrollments, setUserEnrollments] = useState({});
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setEnrollmentsLoading(true);
      
      try {
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);

        if (user) {
          const enrollmentRef = doc(db, 'enrollments', user.uid);
          const enrollmentDoc = await getDoc(enrollmentRef);
          
          if (enrollmentDoc.exists()) {
            setUserEnrollments(enrollmentDoc.data().courses || {});
          }

          const profileRef = doc(db, 'users', user.uid);
          const profileDoc = await getDoc(profileRef);
          
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data());
          }
        }
      } catch (e) {
        console.error('Error fetching data:', e);
        setMessage({ text: 'Failed to load data. Please try again.', type: 'error' });
      } finally {
        setLoading(false);
        setEnrollmentsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredCourses = courses.filter(course => 
    course.name && course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isRegistered = (courseId) => {
    return userEnrollments.hasOwnProperty(courseId);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  const handleRegistration = async () => {
    if (!selectedCourse) {
      setMessage({ text: 'Missing required information for registration.', type: 'error' });
      return;
    }

    if (isRegistered(selectedCourse.id)) {
      setMessage({ text: 'You are already registered for this course.', type: 'error' });
      return;
    }

    setRegistering(true);
    try {
      const userEnrollmentRef = doc(db, 'enrollments', user.uid);
      const userName = userProfile 
        ? `${userProfile.surname || ''} ${userProfile.firstname || ''} ${userProfile.middlename || ''}`.trim()
        : user.displayName || 'Unknown User';
      
      const userEmail = userProfile?.email || user.email || 'No email';

      await setDoc(userEnrollmentRef, { 
        userId: user.uid,
        userName: userName,
        userEmail: userEmail,
        courses: {
          ...userEnrollments,
          [selectedCourse.id]: {
            courseName: selectedCourse.name,
            programType,
            registeredAt: serverTimestamp(),
            status: 'registered'
          }
        },
        lastUpdated: serverTimestamp()
      }, { merge: true });

      setUserEnrollments(prev => ({
        ...prev,
        [selectedCourse.id]: {
          courseName: selectedCourse.name,
          programType,
          registeredAt: new Date(),
          status: 'registered'
        }
      }));

      setMessage({ text: 'Registration successful!', type: 'success' });
      
      setTimeout(() => {
        setSelectedCourse(null);
        setMessage({ text: '', type: '' });
      }, 2000);
    } catch (error) {
      console.error('Error registering for course:', error);
      setMessage({ text: `Registration failed: ${error.message}`, type: 'error' });
    } finally {
      setRegistering(false);
    }
  };

  const handleCourseSelect = (course) => {
    if (isRegistered(course.id)) {
      setMessage({ text: 'You are already registered for this course.', type: 'error' });
      return;
    }
    setSelectedCourse(course);
  };

  const getProgramBadgeColor = (type) => {
    switch (type) {
      case 'primary': return 'bg-purple-100 text-purple-800';
      case 'mentorship': return 'bg-blue-100 text-blue-800';
      case 'fellowship': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">Course Registration Portal</h1>
          <p className="text-gray-400">Register for available courses</p>
        </header>

        <MessageDisplay message={message} onClose={() => setMessage({ text: '', type: '' })} />

        {!programType && !selectedCourse && (
          <ProgramSelection onProgramSelect={setProgramType} />
        )}

        {programType && !selectedCourse && (
          <CourseList
            programType={programType}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentCourses={currentCourses}
            loading={loading}
            enrollmentsLoading={enrollmentsLoading}
            isRegistered={isRegistered}
            onCourseSelect={handleCourseSelect}
            formatDate={formatDate}
            currentPage={currentPage}
            totalPages={totalPages}
            onPaginate={paginate}
            filteredCourses={filteredCourses}
            itemsPerPage={itemsPerPage}
            getProgramBadgeColor={getProgramBadgeColor}
            onBack={() => {
              setProgramType(null);
              setCurrentPage(1);
            }}
          />
        )}

        {selectedCourse && (
          <CourseConfirmation
            selectedCourse={selectedCourse}
            programType={programType}
            registering={registering}
            onBack={() => setSelectedCourse(null)}
            onConfirm={handleRegistration}
            formatDate={formatDate}
            getProgramBadgeColor={getProgramBadgeColor}
          />
        )}
      </div>
    </div>
  );
};

export default CourseSelectionPortal;