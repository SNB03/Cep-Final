// src/components/Dashboards/AuthorityMetrics.jsx
import React from 'react';

const AuthorityMetrics = ({ issues, isDayTheme }) => {
  // 1. Calculate counts for each status
  const pendingCount = issues.filter(i => i.status === 'Pending').length;
  const inProgressCount = issues.filter(i => i.status === 'In Progress').length;
  const awaitingVerificationCount = issues.filter(i => i.status === 'Awaiting Verification').length;
  const closedCount = issues.filter(i => i.status === 'Closed').length;
  const totalReports = issues.length; // Use this for percentage base

  const metricCardClass = isDayTheme ? 'bg-white shadow-lg' : 'bg-gray-700 shadow-xl';
  const labelClass = isDayTheme ? 'text-gray-500' : 'text-gray-400';

  // 2. Calculate percentages (avoiding division by zero)
  const calculatePercentage = (count) => totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;

  const metrics = [
    { 
        label: 'Pending Queue', 
        value: pendingCount, 
        color: 'text-red-500', 
        barClass: 'bg-red-500',
        percent: calculatePercentage(pendingCount)
    },
    { 
        label: 'Active In Progress', 
        value: inProgressCount, 
        color: 'text-yellow-500', 
        barClass: 'bg-yellow-500',
        percent: calculatePercentage(inProgressCount)
    },
    { 
        label: 'Awaiting Verification', 
        value: awaitingVerificationCount, 
        color: 'text-blue-500', 
        barClass: 'bg-blue-500',
        percent: calculatePercentage(awaitingVerificationCount)
    },
    { 
        label: 'Closed Reports', 
        value: closedCount, 
        color: 'text-green-500', 
        barClass: 'bg-green-500',
        percent: calculatePercentage(closedCount)
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div key={metric.label} className={`p-5 rounded-xl ${metricCardClass}`}>
          <p className={`text-sm font-medium uppercase ${labelClass}`}>{metric.label}</p>
          <h2 className={`text-3xl font-bold mt-1 ${metric.color}`}>
            {metric.value}
          </h2>
          {/* Progress Bar Visualization */}
          <div className="mt-3">
              <div className={`text-xs font-semibold mb-1 ${labelClass}`}>
                  {metric.percent}% of Total
              </div>
              <div className={`w-full h-2 rounded-full ${isDayTheme ? 'bg-gray-200' : 'bg-gray-600'}`}>
                  <div 
                      className={`h-2 rounded-full ${metric.barClass} transition-all duration-500`} 
                      style={{ width: `${metric.percent}%` }}
                  ></div>
              </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthorityMetrics;