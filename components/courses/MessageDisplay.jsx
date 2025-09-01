import { FiX, FiCheck } from 'react-icons/fi';

const MessageDisplay = ({ message, onClose }) => {
  if (!message.text) return null;

  return (
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
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <FiX />
        </button>
      </div>
    </div>
  );
};

export default MessageDisplay;