// src/components/Dashboards/IssueMap.jsx
import React from 'react';

const IssueMap = ({ isDayTheme, issueLocations }) => {
  const mapBgClass = isDayTheme ? 'bg-gray-300' : 'bg-gray-600';
  const textClass = isDayTheme ? 'text-gray-700' : 'text-gray-300';
  const accentClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';

  return (
    <div className={`w-full h-64 rounded-xl flex items-center justify-center ${mapBgClass}`}>
      <div className="text-center">
        <p className={`text-lg font-bold ${accentClass}`}>Interactive Issue Map Placeholder</p>
        <p className={`text-sm ${textClass}`}>Showing {issueLocations.length} issue locations in your zone.</p>
        <p className={`text-xs mt-2 ${textClass}`}>Map integration (e.g., Leaflet/Google Maps) required here.</p>
      </div>
    </div>
  );
};

export default IssueMap;
