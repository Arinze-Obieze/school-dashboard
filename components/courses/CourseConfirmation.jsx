import { FiBook, FiSpeaker, FiCalendar, FiArrowLeft } from 'react-icons/fi';

const CourseConfirmation = ({
  selectedCourse,
  programType,
  registering,
  onBack,
  onConfirm,
  formatDate,
  getProgramBadgeColor
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-2">
        <button 
          onClick={onBack}
          className="flex items-center text-blue-400 hover:text-blue-500 mr-4"
        >
          <FiArrowLeft className="mr-1" /> Back
        </button>
        <span className={`px-3 py-1 rounded-full text-sm ${getProgramBadgeColor(programType)}`}>
          {programType === 'primary' ? 'Primary' : programType === 'mentorship' ? 'Mentorship' : 'Fellowship'} Program
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
              <div className="bg-gray-700/50 p-3 rounded-lg">
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
            onClick={onBack}
            className="px-6 py-2 rounded-lg font-medium bg-gray-700 hover:bg-gray-600"
            disabled={registering}
          >
            Change Course
          </button>
          <button 
            onClick={onConfirm}
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
  );
};

export default CourseConfirmation;