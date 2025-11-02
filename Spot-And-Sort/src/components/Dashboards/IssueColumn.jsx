// src/components/Dashboards/IssueColumn.jsx
import React from 'react';
import IssueCard from './IssueCard';

const IssueColumn = ({ title, issues, isDayTheme, onStatusUpdate }) => {
  const columnBgClass = isDayTheme ? 'bg-white shadow-md' : 'bg-gray-700 shadow-md';
  const headerBgClass = isDayTheme ? 'bg-gray-100' : 'bg-gray-800';
  const headerTextClass = isDayTheme ? 'text-gray-900' : 'text-white';
  
  // Custom styling for the "Pending" column to highlight urgency
  const titleClass = title.includes('Pending') 
    ? (isDayTheme ? 'text-red-700' : 'text-red-400') 
    : (isDayTheme ? 'text-teal-600' : 'text-teal-400');

  return (
    <div className={`flex flex-col rounded-xl p-4 transition-colors duration-300 ${columnBgClass}`}>
        
        {/* Column Header */}
        <div className={`p-3 rounded-lg mb-4 ${headerBgClass} border-b-2 border-dashed ${title.includes('Pending') ? 'border-red-500' : 'border-teal-500'}`}>
          <h3 className={`text-xl font-extrabold ${titleClass}`}>{title}</h3>
          <p className={`text-sm font-medium ${isDayTheme ? 'text-gray-500' : 'text-gray-400'}`}>{issues.length} {issues.length === 1 ? 'Issue' : 'Issues'}</p>
        </div>

        {/* Issue Cards Container */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar"> {/* Adjusted max-h for scrolling */}
          {issues.length === 0 ? (
            <div className="py-6 text-center">
                <p className={isDayTheme ? 'text-gray-500' : 'text-gray-400'}>No issues in this category.</p>
                <p className={`text-xs mt-1 ${isDayTheme ? 'text-gray-400' : 'text-gray-500'}`}>Great job! Time for the next column.</p>
            </div>
          ) : (
            issues.map(issue => (
              <IssueCard
                key={issue.ticketId}
                issue={issue}
                isDayTheme={isDayTheme}
                onStatusUpdate={onStatusUpdate}
              />
            ))
          )}
        </div>
    </div>
  );
};

export default IssueColumn;