"use client"
import React, { useState, useEffect } from 'react';
import { auth } from '@/firebase';
import DownloadTranscriptButton from '@/components/Transcripts/DownloadTranscriptButton';
import { FaFilePdf, FaPrint, FaShareAlt, FaSpinner } from 'react-icons/fa';

const TranscriptsPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchCompletedExams(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCompletedExams = async (studentId) => {
    try {
      const response = await fetch(`/api/exams?studentId=${studentId}`);
      const data = await response.json();
      
      // Filter only completed exams with reports
      const completedExams = data.filter(exam => 
        exam.completed === true && exam.report
      );
      
      // Sort by completion date (most recent first)
      completedExams.sort((a, b) => 
        new Date(b.completed_at) - new Date(a.completed_at)
      );
      
      setExams(completedExams);
    } catch (error) {
      console.error('Error fetching transcripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (score) => {
    if (score >= 80) return { grade: 'A', color: 'text-green-500', bg: 'bg-green-500/20' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-500', bg: 'bg-blue-500/20' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    if (score >= 50) return { grade: 'D', color: 'text-orange-500', bg: 'bg-orange-500/20' };
    return { grade: 'F', color: 'text-red-500', bg: 'bg-red-500/20' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-400 mx-auto mb-6" />
          <p className="text-gray-400">Loading your transcripts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Official Examination Transcripts
          </h1>
          <p className="text-gray-400">
            WEST AFRICAN COLLEGE OF CLINICAL PHYSIOLOGY SCIENCES
          </p>
          <div className="flex items-center justify-between mt-6">
            <div className="bg-gray-800/50 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-400">Total Transcripts</p>
              <p className="text-2xl font-bold text-white">{exams.length}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-lg transition-colors">
                <FaPrint />
                <span>Print All</span>
              </button>
              <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-lg transition-colors">
                <FaShareAlt />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transcripts Grid */}
        <div className="grid gap-6">
          {exams.length === 0 ? (
            <div className="bg-gray-800/50 rounded-2xl p-12 text-center border border-gray-700">
              <FaFilePdf className="text-6xl text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-3">
                No Transcripts Available
              </h3>
              <p className="text-gray-500">
                You have not completed any examinations yet.
              </p>
            </div>
          ) : (
            exams.map((exam) => {
              const gradeInfo = calculateGrade(exam.report?.score || 0);
              
              return (
                <div
                  key={exam.quiz_id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      {/* Exam Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                              {exam.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="bg-gray-700/50 text-gray-300 text-xs px-3 py-1 rounded-full">
                                {exam.course_name || 'Professional Examination'}
                              </span>
                              <span className="bg-gray-700/50 text-gray-300 text-xs px-3 py-1 rounded-full">
                                Exam ID: {exam.quiz_id}
                              </span>
                              <span className={`${gradeInfo.bg} ${gradeInfo.color} text-xs px-3 py-1 rounded-full font-bold`}>
                                Grade: {gradeInfo.grade}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-3xl font-bold text-white mb-1">
                              {exam.report?.score?.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-400">
                              Final Score
                            </div>
                          </div>
                        </div>
                        
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-400">
                              {exam.report?.correct || 0}
                            </div>
                            <div className="text-sm text-gray-400">Correct</div>
                          </div>
                          <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-red-400">
                              {exam.report?.wrong || 0}
                            </div>
                            <div className="text-sm text-gray-400">Wrong</div>
                          </div>
                          <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-400">
                              {exam.report?.answered || 0}/{exam.report?.total || 0}
                            </div>
                            <div className="text-sm text-gray-400">Answered</div>
                          </div>
                          <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-400">
                              {exam.report?.total ? 
                                (((exam.report.correct || 0) / exam.report.total) * 100).toFixed(1) + '%' 
                                : '0%'
                              }
                            </div>
                            <div className="text-sm text-gray-400">Accuracy</div>
                          </div>
                        </div>
                        
                        {/* Exam Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Exam Date</p>
                            <p className="text-white">
                              {new Date(exam.date).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Completed On</p>
                            <p className="text-white">
                              {exam.completed_at ? 
                                new Date(exam.completed_at).toLocaleDateString() 
                                : 'N/A'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Download Section */}
                      <div className="md:w-80 flex-shrink-0">
                        <div className="bg-gray-900/80 rounded-lg p-5 border border-gray-700">
                          <div className="text-center mb-4">
                            <FaFilePdf className="text-4xl text-red-400 mx-auto mb-3" />
                            <h4 className="text-lg font-bold text-white mb-2">
                              Official Transcript
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Download verified transcript with institutional seal
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            <DownloadTranscriptButton 
                              exam={exam}
                              student={user}
                              variant="default"
                            />
                            
                            <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-lg transition-colors">
                              <FaPrint />
                              Print Transcript
                            </button>
                            
                            <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-lg transition-colors">
                              <FaShareAlt />
                              Share Results
                            </button>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-xs text-gray-400 text-center">
                              Transcript ID: WACCPS-TRN-{exam.quiz_id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Bar */}
                  <div className="bg-gray-900 px-6 py-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-300">
                          Verified and Authenticated
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        WEST AFRICAN COLLEGE OF CLINICAL PHYSIOLOGY SCIENCES
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p className="mb-2">
            All transcripts are digitally signed and verified by the WACCPS Examination Board
          </p>
          <p>
            For verification or discrepancies, contact: registrar@waccps.org
          </p>
        </div>
      </div>
    </div>
  );
};

export default TranscriptsPage;