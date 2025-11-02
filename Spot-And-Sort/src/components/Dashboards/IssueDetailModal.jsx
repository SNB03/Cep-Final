// src/components/Dashboards/IssueDetailModal.jsx
import React from 'react';
import Button from '../Common/Button';
import { PotholeIcon, BinIcon } from '../Common/ThemeIcons';

const IssueDetailModal = ({ isOpen, onClose, issue, isDayTheme, onStatusUpdate }) => {
  if (!isOpen || !issue) return null;

  const modalBgClass = isDayTheme ? 'bg-white text-gray-900' : 'bg-gray-800 text-white';
  const headerTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';
  const detailTextClass = isDayTheme ? 'text-gray-700' : 'text-gray-300';
  const labelClass = isDayTheme ? 'text-gray-500' : 'text-gray-400';

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-red-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Awaiting Verification': return 'bg-blue-500';
      case 'Closed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus && newStatus !== issue.status) {
      onStatusUpdate(issue.ticketId, newStatus);
    }
  };

  // Static options for status dropdown
  const statusOptions = ['Pending', 'In Progress', 'Awaiting Verification', 'Closed'];


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`relative w-full max-w-2xl rounded-xl p-8 shadow-2xl transition-colors duration-300 ${modalBgClass}`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 text-2xl font-bold ${isDayTheme ? 'text-gray-600' : 'text-gray-300'} hover:${isDayTheme ? 'text-gray-900' : 'text-white'}`}
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className={`text-3xl font-extrabold mb-4 ${headerTextClass}`}>
  {issue.title || `${issue.issueType.charAt(0).toUpperCase() + issue.issueType.slice(1)} Issue`}
</h2>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Image */}
          {issue.imageUrl && (
            <div className="md:w-1/2">
              <img src={issue.imageUrl} alt={issue.title} className="w-full h-auto rounded-lg shadow-md object-cover" />
              <p className={`text-xs mt-2 italic ${detailTextClass}`}>Submitted Photo</p>
            </div>
          )}

          {/* Details */}
          <div className={issue.imageUrl ? "md:w-1/2" : "w-full"}>
            <p className={`mb-2`}><span className={`font-semibold ${labelClass}`}>ID:</span> {issue.ticketId}</p>
            <p className={`mb-2`}><span className={`font-semibold ${labelClass}`}>Type:</span> {issue.issueType.charAt(0).toUpperCase() + issue.issueType.slice(1)}</p>
            <p className={`mb-2`}><span className={`font-semibold ${labelClass}`}>Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${getStatusColor(issue.status)}`}>{issue.status}</span></p>
            <p className={`mb-2`}><span className={`font-semibold ${labelClass}`}>Reported:</span> {new Date(issue.createdAt).toLocaleDateString()}</p>
            <p className={`mb-2`}><span className={`font-semibold ${labelClass}`}>Location:</span> Lat {issue.lat.toFixed(4)}, Lng {issue.lng.toFixed(4)}</p>
            {issue.assignedTo && <p className={`mb-2`}><span className={`font-semibold ${labelClass}`}>Assigned To:</span> {issue.assignedTo}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className={`text-xl font-bold mb-2 ${headerTextClass}`}>Description</h3>
          <p className={`${detailTextClass}`}>{issue.description}</p>
        </div>

        {/* Status Update & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t pt-6 mt-6">
          <div className="flex items-center gap-3">
            <label htmlFor="status-select" className={`${labelClass} font-semibold`}>Update Status:</label>
            <select
              id="status-select"
              value={issue.status}
              onChange={handleStatusChange}
              className={`p-2 rounded-lg border ${isDayTheme ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2">
            Close
          </Button>
        </div>

        {/* Placeholder for map snippet or timeline if desired */}
        <div className={`mt-6 p-4 rounded-lg ${isDayTheme ? 'bg-gray-100' : 'bg-gray-700'} ${detailTextClass} text-sm`}>
          <p className="font-semibold mb-2">Issue Timeline (Placeholder)</p>
          <ul>
            <li>Reported: {new Date(issue.createdAt).toLocaleString()}</li>
            {issue.status !== 'Pending' && <li>Assigned: (Date/Time)</li>}
            {issue.status === 'Awaiting Verification' && <li>Marked Ready for Verification: (Date/Time)</li>}
            {issue.status === 'Closed' && <li>Citizen Verified: (Date/Time)</li>}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default IssueDetailModal;