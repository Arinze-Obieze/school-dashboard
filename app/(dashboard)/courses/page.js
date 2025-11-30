'use client'
import Card from '@/components/Card'
import React, { useEffect, useState } from 'react'
import { FaBookOpen, FaPlusCircle, FaCloudDownloadAlt, FaUpload, FaRegClock } from 'react-icons/fa'
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';


function Courses() {
  const [registeredCount, setRegisteredCount] = useState(null);

  useEffect(() => {
    const fetchRegisteredCourses = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        const enrollmentRef = doc(db, 'enrollments', user.uid);
        const enrollmentDoc = await getDoc(enrollmentRef);
        if (enrollmentDoc.exists()) {
          const courses = enrollmentDoc.data().courses || {};
          setRegisteredCount(Object.keys(courses).length);
        } else {
          setRegisteredCount(0);
        }
      } catch (e) {
        setRegisteredCount(0);
      }
    };
    fetchRegisteredCourses();
  }, []);

  const courseCards = [
    {
      title: 'Register',
      icon: <FaPlusCircle className="text-3xl" />, 
      bg: '#7ed957',
      href: '/courses/register'
    },
    {
      title: 'Registered Courses',
      icon: <FaBookOpen className="text-3xl" />, 
      bg: '#4a90e2',
      href: '/courses/registered',
      count: registeredCount
    },
    // {
    //   title: 'Course Materials',
    //   icon: <FaCloudDownloadAlt className="text-3xl" />, 
    //   bg: '#f5a623',
    //   href: '/courses/materials'
    // },
    // {
    //   title: 'Assignment Uploads',
    //   icon: <FaUpload className="text-3xl" />,
    //   bg: '#d0021b',
    //   href: '/courses/assignments'
    // },
   
  ];

  return (
    <div>
      <div className='flex justify-between items-center mt-8 px-4'>
        <h1 className='text-2xl text-white'>Courses</h1>
        <div className='flex space-x-2'>
          <h3 className='text-blue-700'>Home</h3>
          <div className='text-white'> / </div>
          <nav className='text-gray-400'>Courses</nav>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {courseCards.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            icon={card.icon}
            bg={card.bg}
            href={card.href}
            count={card.count}
          />
        ))}
      </div>
    </div>
  )
}

export default Courses
