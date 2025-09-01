import { FiAward, FiUser, FiUsers } from 'react-icons/fi';

const ProgramSelection = ({ onProgramSelect }) => {
  const programs = [
    {
      type: 'primary',
      icon: FiAward,
      title: 'Primary Program',
      color: 'purple'
    },
    {
      type: 'mentorship',
      icon: FiUser,
      title: 'Mentorship Program',
      color: 'blue'
    },
    {
      type: 'fellowship',
      icon: FiUsers,
      title: 'Fellowship Program',
      color: 'green'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-8 text-center">Select Registration Type</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {programs.map((program) => (
          <div 
            key={program.type}
            onClick={() => onProgramSelect(program.type)}
            className={`p-6 rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 bg-gray-800 hover:bg-gray-700 border-2 border-${program.color}-500`}
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full bg-${program.color}-100 text-${program.color}-600`}>
                <program.icon className="text-2xl" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">{program.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramSelection;