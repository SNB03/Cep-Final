import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/config';
import Button from '../Common/Button';

// --- ICONS ---
const ActivityIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>);
const SearchIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const CloseIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);

// Mock Data for User's Reports (Used for graceful degradation if API fetch fails)
const MOCK_USER_REPORTS = [
    { ticketId: 'P-123456', issueType: 'Pothole', status: 'In Progress', zone: 'West District', date: '2025-10-25', description: 'Large pothole on Main Street.' },
    { ticketId: 'W-678901', issueType: 'Waste', status: 'Awaiting Verification', zone: 'North Central', date: '2025-10-20', description: 'Illegal dumping resolved, please confirm.' },
    { ticketId: 'R-300223', issueType: 'Road Damage', status: 'Pending', zone: 'East Side', date: '2025-10-28', description: 'Sign knocked down.' },
];

const TrackDetailsModal = ({ issue, onClose, onVerifyAndClose, isDayTheme }) => {
    if (!issue) return null;

    const modalClasses = isDayTheme ? 'bg-white text-gray-900' : 'bg-gray-800 text-white';
    const accentText = isDayTheme ? 'text-teal-600' : 'text-teal-400';
    
    // Helper to format path separators for URLs
    const formatImagePath = (path) => issue.resolutionImageUrl ? issue.resolutionImageUrl.replace(/\\/g, '/') : issue.issueImageUrl.replace(/\\/g, '/');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
            {/* Modal Container: Added max-h-[90vh] and overflow-y-auto */}
            <div className={`p-6 rounded-lg w-full max-w-lg shadow-2xl ${modalClasses} max-h-[90vh] overflow-y-auto`}>
                
                {/* 🚀 FIX APPLIED HERE: Used modalClasses to ensure opaque background */}
                <div className={`flex justify-between items-start border-b pb-3 mb-4  z-10 ${modalClasses}`}>
                    <h3 className={`text-2xl font-bold ${accentText}`}>Report Details: {issue.ticketId}</h3>
                    <button onClick={onClose} className={`p-1 rounded-full ${isDayTheme ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-400 hover:bg-gray-700'}`}>
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Details Section */}
                <div className="space-y-4 text-left text-sm md:text-base mb-6">
                    <div className="grid grid-cols-2 gap-y-2">
                        <p><strong>Issue Type:</strong></p>
                        <p className="font-medium">{issue.issueType}</p>
                        
                        <p><strong>Status:</strong></p>
                        <p className={`font-semibold ${issue.status === 'Closed' ? 'text-green-500' : accentText}`}>
                            {issue.status}
                        </p>
                        
                        <p><strong>Date Reported:</strong></p>
                        <p>{new Date(issue.date).toLocaleDateString()}</p>

                         <p><strong>Zone:</strong></p>
                        <p>{issue.zone}</p>
                    </div>

                    <p><strong>Description:</strong></p>
                    <p className={`p-3 rounded-md border ${isDayTheme ? 'bg-gray-100 border-gray-300' : 'bg-gray-700 border-gray-600'}`}>{issue.description}</p>
                </div>
                
                {/* Images Section */}
                {(issue.issueImageUrl || issue.resolutionImageUrl) && (
                    <div className="space-y-4 mb-6">
                        <h4 className="text-lg font-bold border-b pb-2">Proof of Work</h4>
                        {issue.issueImageUrl && (
                            <div>
                                <p className="font-semibold">Original Issue Photo:</p>
                                <img src={`http://localhost:5000/${formatImagePath(issue.issueImageUrl)}`} alt="Issue" className="mt-2 rounded-lg w-full max-h-52 object-cover" />
                            </div>
                        )}
                        {issue.resolutionImageUrl && (
                            <div>
                                <p className="font-semibold text-green-500">Resolution Photo:</p>
                                <img src={`http://localhost:5000/${formatImagePath(issue.resolutionImageUrl)}`} alt="Resolution" className="mt-2 rounded-lg w-full max-h-52 object-cover" />
                            </div>
                        )}
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-col space-y-3">
                    {issue.status === 'Awaiting Verification' && (
                        <Button 
                            onClick={() => onVerifyAndClose(issue.ticketId)} 
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-bold"
                        >
                            Confirm Resolution & Close Report
                        </Button>
                    )}
                    <Button 
                        onClick={onClose} 
                        className={`w-full ${isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
};
// --- END MODAL COMPONENT ---


const CitizenDashboard = ({ isDayTheme, onReportClick }) => {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName] = useState('Verified Citizen'); // Placeholder for user's name
    const [selectedReport, setSelectedReport] = useState(null); // New state for modal

    const accentTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';
    const cardClasses = isDayTheme ? 'bg-white shadow-xl text-gray-900' : 'bg-gray-800 shadow-2xl text-white';
    const tableHeaderClass = isDayTheme ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-white';

    // Helper to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'text-orange-500 bg-orange-100 dark:bg-orange-800/50';
            case 'In Progress': return 'text-blue-500 bg-blue-100 dark:bg-blue-800/50';
            case 'Awaiting Verification': return 'text-purple-500 bg-purple-100 dark:bg-purple-800/50';
            case 'Closed': return 'text-green-500 bg-green-100 dark:bg-green-800/50';
            default: return 'text-gray-500 bg-gray-100 dark:bg-gray-800/50';
        }
    };

    // ACTION: Fetch user's own issues
    const fetchUserReports = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('User not authenticated. Please log in.');
            }

            const response = await api.get('/issues/my-reports', { 
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            }); 
            
            setReports(response.data);

        } catch (err) {
            console.error("Failed to fetch user reports:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to load your reports.';
            
            setError(errorMessage);
            setReports(MOCK_USER_REPORTS); 
            
            if (err.response?.status === 401 || err.response?.status === 403) {
                 localStorage.removeItem('token');
                 localStorage.removeItem('userRole');
                 localStorage.removeItem('userEmail');
                 setError("Session expired. Please log in again.");
            }

        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserReports();
    }, [fetchUserReports]);


    // FUNCTIONALITY: Opens the modal with the selected report's details
    const handleTrackReport = (report) => {
        setSelectedReport(report);
    };

    // FUNCTIONALITY: Action for verifying a completed report
    const handleVerifyAndClose = async (ticketId) => {
        if (!window.confirm(`Are you sure you want to verify that report ${ticketId} is resolved and close it? This action is permanent.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const userEmail = localStorage.getItem('userEmail'); 

            if (!token || !userEmail) {
                throw new Error('Authentication failure. Please log in again.');
            }

            const response = await api.put(`/issues/${ticketId}/verify`, 
                { email: userEmail },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    } 
                }
            ); 

            alert(`✅ Report ${ticketId} status updated to '${response.data.newStatus}'!`);
            
            setSelectedReport(null); 
            fetchUserReports(); 

        } catch (err) {
            console.error("Verification Error:", err);
            const errorMessage = err.response?.data?.message || 'Failed to verify and close report.';
            setError(errorMessage);
            
            if (err.response?.status === 401 || err.response?.status === 403) {
                 localStorage.removeItem('token');
                 localStorage.removeItem('userRole');
                 localStorage.removeItem('userEmail');
                 alert('Session expired. Please log in again.');
            }
        }
    };

    if (isLoading) {
        return <div className={`text-center py-10 ${isDayTheme ? 'text-gray-900' : 'text-white'}`}>Loading your Dashboard...</div>;
    }

    return (
        <div className="space-y-8 py-10">
            <h1 className={`text-4xl font-extrabold ${accentTextClass}`}>Welcome Back, {userName}!</h1>

            {/* Row 1: Main CTA */}
            <div className={`p-6 rounded-xl space-y-4 text-center ${cardClasses}`}>
                <p className="text-xl font-semibold mb-4">See an issue in your community?</p>
                <Button 
                    onClick={onReportClick} 
                    className="w-full md:w-1/2 bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 text-lg"
                >
                    <ActivityIcon className="inline w-6 h-6 mr-3" /> Report a New Issue Now
                </Button>
            </div>

            {/* Row 2: My Reported Issues Table */}
            <div className={`p-6 rounded-xl ${cardClasses}`}>
                <h2 className={`text-xl font-bold border-b pb-2 ${accentTextClass} mb-4`}>My Reported Issues ({reports.length})</h2>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
                        Error loading reports: **{error}**. Displaying mock data (if available).
                    </div>
                )}

                {reports.length === 0 ? (
                    <div className="text-center py-10">
                        <SearchIcon className="w-10 h-10 mx-auto mb-4 text-gray-500" />
                        <p className="text-lg">You haven't reported any issues yet.</p>
                        <p className="text-sm text-gray-500">Use the button above to submit your first report!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-600">
                            <thead className={tableHeaderClass}>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Tracking ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Issue Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Date Reported</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-600">
                                {reports.map((report) => (
                                    <tr key={report.ticketId} className={isDayTheme ? 'hover:bg-gray-50' : 'hover:bg-gray-700'}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono">{report.ticketId}</td>
                                        <td className="px-4 py-4 whitespace-nowrap font-medium">{report.issueType.charAt(0).toUpperCase() + report.issueType.slice(1)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">{new Date(report.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                                            <Button 
                                                onClick={() => handleTrackReport(report)} 
                                                className="bg-blue-500 hover:bg-blue-600 text-white p-2 text-xs"
                                            >
                                                Track Details
                                            </Button>
                                            {report.status === 'Awaiting Verification' && (
                                                <Button 
                                                    onClick={() => handleVerifyAndClose(report.ticketId)}
                                                    className="bg-green-500 hover:bg-green-600 text-white p-2 text-xs"
                                                >
                                                    Verify & Close
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal is rendered outside the main dashboard area */}
            <TrackDetailsModal 
                issue={selectedReport} 
                onClose={() => setSelectedReport(null)} 
                onVerifyAndClose={handleVerifyAndClose} // Pass the handler to the modal
                isDayTheme={isDayTheme}
            />

        </div>
    );
};

export default CitizenDashboard;