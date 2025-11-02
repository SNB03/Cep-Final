// src/components/Pages/FeatureHighlightSection.jsx
import React from 'react';
import { PotholeIcon, BinIcon } from '../Common/ThemeIcons';

const FeatureHighlightSection = ({ isDayTheme }) => {
  const highlightCardClasses = isDayTheme ? 'bg-gray-100 shadow-xl' : 'bg-gray-800 shadow-2xl';
  const accentTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';
  const textClass = isDayTheme ? 'text-gray-700' : 'text-gray-300';

  return (
    <div className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold">Our Solutions</h2>
        <p className={`text-lg mt-4 max-w-3xl mx-auto ${isDayTheme ? 'text-gray-600' : 'text-gray-400'}`}>
          We provide cutting-edge technology to solve the most pressing urban challenges.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`rounded-2xl p-8 md:p-12 shadow-xl flex flex-col items-center text-center transition-transform transform hover:scale-105 duration-300 ${highlightCardClasses}`}>
          <div className={`p-4 rounded-full mb-6 ${isDayTheme ? 'bg-purple-600' : 'bg-purple-500'}`}>
            <PotholeIcon className="w-12 h-12 text-white" />
          </div>
          <h3 className={`text-2xl font-bold mb-4 ${accentTextClass}`}>Pothole Detection</h3>
          <p className={textClass}>
            Citizens report potholes by submitting photos and location data, allowing for direct communication with authorities for faster road repair.
          </p>
        </div>
        <div className={`rounded-2xl p-8 md:p-12 shadow-xl flex flex-col items-center text-center transition-transform transform hover:scale-105 duration-300 ${highlightCardClasses}`}>
          <div className={`p-4 rounded-full mb-6 ${isDayTheme ? 'bg-orange-600' : 'bg-orange-500'}`}>
            <BinIcon className="w-12 h-12 text-white" />
          </div>
          <h3 className={`text-2xl font-bold mb-4 ${accentTextClass}`}>Waste Management</h3>
          <p className={textClass}>
            Citizens can report overflowing or damaged public bins, enabling sanitation teams to address problems proactively and maintain city cleanliness.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureHighlightSection;