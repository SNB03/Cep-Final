// src/components/Pages/HeroSection.jsx
import React from 'react';

const HeroSection = ({ isDayTheme }) => {
  const accentTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';
  const descTextClass = isDayTheme ? 'text-gray-700' : 'text-gray-300';
  const placeholderClasses = isDayTheme ? 'bg-gray-200 shadow-xl' : 'bg-gray-800 shadow-2xl';

  return (
    <div className="flex flex-col md:flex-row items-center justify-between py-20 md:py-32">
      <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
          Building a <span className={accentTextClass}>Smarter</span>, Cleaner City.
        </h1>
        <p className={`text-lg md:text-xl mb-8 max-w-lg mx-auto md:mx-0 ${descTextClass}`}>
          Innovative solutions for a better urban environment, from citizen-reported potholes to efficient waste management.
        </p>
        <div className="flex justify-center md:justify-start space-x-4">
          {/* Buttons removed for simplicity */}
        </div>
      </div>
      <div className="md:w-1/2 flex justify-center md:justify-end">
        {/* Placeholder for a visually appealing image or illustration */}
        <div className={`w-full max-w-md h-64 md:h-96 rounded-3xl flex items-center justify-center p-8 transition-colors duration-300 ${placeholderClasses}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-24 w-24 ${accentTextClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 4c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;