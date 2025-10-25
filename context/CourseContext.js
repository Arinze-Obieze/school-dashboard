'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';

const CourseContext = createContext();

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};

export const CourseProvider = ({ children }) => {
  const [registeredCount, setRegisteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    // Real-time listener for enrollment changes
    const enrollmentRef = doc(db, 'enrollments', user.uid);
    const unsubscribe = onSnapshot(
      enrollmentRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const courses = data.courses || {};
          const courseCount = Object.keys(courses).length;
          const courseList = Object.values(courses);
          
          setRegisteredCount(courseCount);
          setEnrolledCourses(courseList);
        } else {
          setRegisteredCount(0);
          setEnrolledCourses([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to course enrollments:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const refreshCourses = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const enrollmentRef = doc(db, 'enrollments', user.uid);
      const enrollmentDoc = await getDoc(enrollmentRef);
      
      if (enrollmentDoc.exists()) {
        const courses = enrollmentDoc.data().courses || {};
        setRegisteredCount(Object.keys(courses).length);
        setEnrolledCourses(Object.values(courses));
      } else {
        setRegisteredCount(0);
        setEnrolledCourses([]);
      }
    } catch (error) {
      console.error('Error refreshing courses:', error);
    }
  };

  const value = {
    registeredCount,
    enrolledCourses,
    loading,
    refreshCourses
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};