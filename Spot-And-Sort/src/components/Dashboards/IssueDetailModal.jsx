// src/components/Dashboards/IssueDetailModal.jsx
import React from 'react';
import Button from '../Common/Button';
// NOTE: Assuming ThemeIcons includes PotholeIcon and BinIcon, though they are not used visually in this final modal layout.

// Fallback if CloseIcon is not provided
const CloseIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);

const IssueDetailModal = ({ isOpen, onClose, issue, isDayTheme, onStatusUpdate }) => {
    if (!isOpen || !issue) return null;

    const modalBgClass = isDayTheme ? 'bg-white text-gray-900' : 'bg-gray-800 text-white';
    const headerTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';
    const detailTextClass = isDayTheme ? 'text-gray-700' : 'text-gray-300';
    const labelClass = isDayTheme ? 'text-gray-500' : 'text-gray-400';

    // 🚀 FIX 1: Helper to format path separators and ensure correct prefix for image display
    const formatImageUrl = (path) => {
        if (!path) return null;
        // Replaces any backslashes with forward slashes globally.
        return path.replace(/\\/g, '/');
    };
    
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
            // This calls the authenticated logic implemented in the parent component (IssueCard/AuthorityDashboard)
            onStatusUpdate(issue.ticketId, newStatus);
            // Optionally close the modal after updating, or wait for the parent to refresh/close
            // onClose(); 
        }
    };

    // Static options for status dropdown
    const statusOptions = ['Pending', 'In Progress', 'Awaiting Verification', 'Closed'];

    // Define max height and scrolling behavior
    const modalContentClasses = `relative w-full max-w-2xl rounded-xl p-8 shadow-2xl transition-colors duration-300 ${modalBgClass} max-h-[90vh] overflow-y-auto`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
            <div className={modalContentClasses}>
                
                {/* Header (Sticky to prevent scrolling behind) */}
                <div className={`flex justify-between items-start border-b pb-3 mb-4 sticky top-0 z-10 ${modalBgClass}`}>
                    <h2 className={`text-3xl font-extrabold ${headerTextClass}`}>
                        {issue.title || `${issue.issueType.charAt(0).toUpperCase() + issue.issueType.slice(1)} Issue`}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-full absolute top-4 right-4 text-2xl font-bold ${isDayTheme ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-700'}`}
                        aria-label="Close modal"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Details */}
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {/* 🚀 FIX 2: Image Section now uses the correct property and formatting helper */}
                    {(issue.issueImageUrl || issue.resolutionImageUrl) && (
                        <div className="md:w-1/2 space-y-4">
                            
                            {issue.issueImageUrl && (
                                <div>
                                    <p className={`text-sm font-semibold mb-1 ${labelClass}`}>Submitted Photo:</p>
                                    <img 
                                        src={formatImageUrl(issue.issueImageUrl)} 
                                        alt={issue.title} 
                                        className="w-full h-auto rounded-lg shadow-md object-cover max-h-52" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/250x150/ef4444/FFFFFF?text=Image+Not+Found"; }}
                                    />
                                </div>
                            )}

                             {issue.resolutionImageUrl && (
                                <div>
                                    <p className={`text-sm font-semibold mb-1 mt-4 text-green-500`}>Resolution Photo:</p>
                                    <img 
                                        src={formatImageUrl(issue.resolutionImageUrl)} 
                                        alt="Resolution Proof" 
                                        className="w-full h-auto rounded-lg shadow-md object-cover max-h-52" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/250x150/3b82f6/FFFFFF?text=Resolution+Image"; }}
                                    />
                                </div>
                            )}

                        </div>
                    )}

                    {/* Text Details */}
                    <div className={issue.issueImageUrl || issue.resolutionImageUrl ? "md:w-1/2" : "w-full"}>
                        <p className={`mb-2`}><span className={`font-semibold ${labelClass}`}>ID:</span> {issue.ticketId}</p>
                        <p className={`mb-2`}><span className={`font-semibold ${labelClass}`}>Type:</span> {issue.issueType.charAt(0).toUpperCase() + issue.issueType.slice(1)}</p>
                        <p className={`mb-2`}><span className={`font-semibold ${labelClass}`}>Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${getStatusColor(issue.status)}`}>{issue.status}</span></p>
                        <p className={`mb-2`}><span className={`font-semibold ${labelClass}`}>Reported:</span> {new Date(issue.createdAt).toLocaleDateString()}</p>
                        <p className={`mb-2`}><span className={`font-semibold ${labelClass}`}>Location:</span> Lat {issue.lat}, Lng {issue.lng}</p>
                        <p className={`mb-2`}><span className={`font-semibold ${labelClass}`}>Zone:</span> {issue.zone}</p>
                        {/* Assuming issue.assignedTo is available in the object for display */}
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
                        {issue.status !== 'Pending' && <li>Status: {issue.status} (Date/Time)</li>}
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default IssueDetailModal;