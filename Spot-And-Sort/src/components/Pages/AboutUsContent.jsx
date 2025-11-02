// src/components/Pages/AboutUsContent.jsx
import React from 'react';

const AboutUsContent = ({ isDayTheme }) => {
  const cardClasses = isDayTheme ? 'bg-gray-100 shadow-xl' : 'bg-gray-800 shadow-2xl';
  const accentTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';
  const textClass = isDayTheme ? 'text-gray-700' : 'text-gray-300';

  return (
    <div className={`rounded-3xl p-8 md:p-16 text-center transition-colors duration-300 ${cardClasses}`}>
      <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${accentTextClass}`}>About Us</h2>
      <p className={`text-lg md:text-xl mb-8 max-w-3xl mx-auto ${textClass}`}>
        Spot & Sort is a civic technology initiative dedicated to creating smarter, more efficient urban environments. Our mission is to empower citizens and streamline municipal operations by providing a seamless platform for reporting and managing critical city issues.
      </p>
      <p className={`text-lg md:text-xl max-w-3xl mx-auto ${textClass}`}>
        We believe that by leveraging technology and fostering collaboration between residents and authorities, we can build a cleaner, safer, and more responsive community for everyone.
      </p>
    </div>
  );
};

export default AboutUsContent;