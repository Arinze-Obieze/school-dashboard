import { FiSearch, FiBook, FiCheck, FiCalendar, FiSpeaker, FiChevronLeft, FiChevronRight, FiArrowLeft } from 'react-icons/fi';

const CourseList = ({
  programType,
  searchQuery,
  onSearchChange,
  currentCourses,
  loading,
  enrollmentsLoading,
  isRegistered,
  onCourseSelect,
  formatDate,
  currentPage,
  totalPages,
  onPaginate,
  filteredCourses,
  itemsPerPage,
  getProgramBadgeColor,
  onBack
}) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-2">
        <button 
          onClick={onBack}
          className="flex items-center text-blue-400 hover:text-blue-500 mr-4"
        >
          <FiArrowLeft className="mr-1 cursor-pointer" /> Back
        </button>
        <span className={`px-3 py-1 rounded-full text-sm ${getProgramBadgeColor(programType)}`}>
          {programType === 'primary' ? 'Primary' : programType === 'mentorship' ? 'Mentorship' : 'Fellowship'} Program
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
          onChange={(e) => {
            onSearchChange(e.target.value);
            onPaginate(1);
          }}
          className="w-full pl-10 pr-4 py-3 rounded-lg border-2 bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Course List */}
      <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading || enrollmentsLoading ? (
          <div className="text-center py-8 text-gray-400 col-span-full">
            Loading courses...
          </div>
        ) : currentCourses.length > 0 ? (
          currentCourses.map((course) => {
            const registered = isRegistered(course.id);
            return (
              <div 
                key={course.id}
                onClick={() => !registered && onCourseSelect(course)}
                className={`p-4 rounded-lg shadow-md transform transition-all duration-300 ${
                  registered 
                    ? 'bg-green-900/30 border-l-4 border-green-500 cursor-not-allowed' 
                    : 'bg-gray-800 hover:bg-gray-700 border-l-4 border-blue-500 cursor-pointer hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-full mr-4 flex-shrink-0 ${
                    registered ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {registered ? <FiCheck className="text-lg" /> : <FiBook />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{course.name}</h3>
                      {registered && (
                        <span className="px-2 py-1 bg-green-700 text-xs rounded-full">Registered</span>
                      )}
                    </div>
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
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400 col-span-full">
            {searchQuery ? 'No courses found matching your search.' : 'No courses available at the moment.'}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredCourses.length > itemsPerPage && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => onPaginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => onPaginate(number)}
                className={`w-10 h-10 rounded-lg ${
                  currentPage === number 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {number}
              </button>
            ))}
            
            <button
              onClick={() => onPaginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronRight />
            </button>
          </nav>
        </div>
      )}

      {/* Results count */}
      <div className="text-center text-gray-400 mt-4 text-sm">
        Showing {currentCourses.length} of {filteredCourses.length} courses
      </div>
    </div>
  );
};

export default CourseList;