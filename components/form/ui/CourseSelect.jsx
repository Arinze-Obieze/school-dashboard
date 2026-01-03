import React from 'react';

const COURSE_OPTIONS = [
  'Clinical Neurophysiology (Neurophysiology)',
  'Clinical Renal Physiology',
  'Clinical Cardiac Physiology',
  'Respiratory Physiology',
  'Cardiopulmonary Physiology',
  'Gastrointestinal Physiology',
  'Clinical Exercise Physiology',
  'Clinical Reproductive Physiology',
  'Cardiovascular Perfusion',
  'Critical Care Physiology',
  'Audiological Physiology',
];

export default function CourseSelect({ value, onChange, required = false }) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label htmlFor="course" className="block text-sm font-medium text-gray-300">
        Course <span className="text-red-500">*</span>
      </label>
      <select
        id="course"
        name="course"
        value={value || ''}
        onChange={handleChange}
        required={required}
        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
      >
        <option value="">Select a course</option>
        {COURSE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
