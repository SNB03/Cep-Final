import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/config';
import Button from '../Common/Button';

// --- ICONS ---
// (Reusing the ActivityIcon from AdminDashboard for reports)
const ActivityIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>);
const SearchIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);

// Mock Data for User's Reports (To be used if API fetch fails)
const MOCK_USER_REPORTS = [
    // This data structure matches the data expected from the backend
    { ticketId: 'P-123456', issueType: 'Pothole', status: 'In Progress', zone: 'West District', date: '2025-10-25', description: 'Large pothole on Main Street.' },
    { ticketId: 'W-678901', issueType: 'Waste', status: 'Awaiting Verification', zone: 'North Central', date: '2025-10-20', description: 'Illegal dumping resolved, please confirm.' },
    { ticketId: 'R-300223', issueType: 'Road Damage', status: 'Pending', zone: 'East Side', date: '2025-10-28', description: 'Sign knocked down.' },
];

// --- MODAL COMPONENT (Placeholder for full details) ---
const TrackDetailsModal = ({ issue, onClose, isDayTheme }) => {
    if (!issue) return null;

    const modalClasses = isDayTheme ? 'bg-white text-gray-900' : 'bg-gray-700 text-white';
    const accentText = isDayTheme ? 'text-teal-600' : 'text-teal-400';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className={`p-6 rounded-lg w-full max-w-md ${modalClasses}`}>
                <h3 className={`text-2xl font-bold mb-4 ${accentText}`}>Report Details: {issue.ticketId}</h3>
                <div className="space-y-2 text-left">
                    <p><strong>Type:</strong> {issue.issueType}</p>
                    <p><strong>Status:</strong> <span className={`font-semibold ${issue.status === 'Closed' ? 'text-green-500' : accentText}`}>{issue.status}</span></p>
                    <p><strong>Description:</strong> {issue.description}</p>
                    <p><strong>Date:</strong> {new Date(issue.date).toLocaleDateString()}</p>
                </div>
                <Button onClick={onClose} className="mt-6 w-full bg-teal-500 hover:bg-teal-600 text-white">
                    Close Details
                </Button>
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
//     const fetchUserReports = useCallback(async () => {
//         setIsLoading(true);
//         setError(null);
//         try {
//             // **NOTE**: You must implement the GET /issues/my-reports endpoint on your server
//             const token = localStorage.getItem('token');
//             const response = await api.get('/issues/my-reports', { headers: { Authorization: `Bearer ${token}` }}); 
//             setReports(response.data);

//             // --- Simulation (Remove after implementing real API call) ---
//             await new Promise(resolve => setTimeout(resolve, 500)); 
//             setReports(MOCK_USER_REPORTS); 
//             // --- End Simulation ---
//         } catch (err) {
//             console.error("Failed to fetch user reports:", err);
//             setError(err.response?.data?.message || 'Failed to load your reports.');
//             setReports(MOCK_USER_REPORTS); // Fallback to mock data on error
//         } finally {
//             setIsLoading(false);
//         }
//     }, []);



// CitizenDashboard.jsx - Inside the component

// ... other state and helper functions ...

// ACTION: Fetch user's own issues
const fetchUserReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        // 🚀 ACTUAL API CALL: Use the token from local storage to authenticate the request
        const token = localStorage.getItem('token');
        if (!token) {
            // Handle case where token is missing (should be handled by parent component redirecting to login)
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
        setReports(MOCK_USER_REPORTS); // Fallback to mock data on error for display
        
        // CRITICAL: If the error is an authorization issue (401/403), force a session clear
        if (err.response?.status === 401 || err.response?.status === 403) {
             localStorage.removeItem('token');
             localStorage.removeItem('userRole');
             // A proper implementation would trigger a global logout/redirect here.
        }

    } finally {
        setIsLoading(false);
    }
}, []); // Dependencies remain empty

    useEffect(() => {
        fetchUserReports();
    }, [fetchUserReports]);


    // 🚀 FUNCTIONALITY: Opens the modal with the selected report's details
    const handleTrackReport = (report) => {
        setSelectedReport(report);
    };

    // 🚀 FUNCTIONALITY: Placeholder action for verifying a completed report
    const handleVerifyAndClose = async (ticketId) => {
    if (!window.confirm(`Are you sure you want to verify that report ${ticketId} is resolved and close it? This action is permanent.`)) {
        return;
    }

    try {
        // 1. Get the authenticated token
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required to verify report.');
        }

        // 2. We need the user's email to satisfy the backend route's verification logic.
        // NOTE: A more secure approach would be to trust the JWT (token) entirely 
        // on the backend and remove the email requirement from the PUT /verify route. 
        // For now, we assume the email is available in a separate stored value 
        // or must be retrieved. Since you only have 'userName' as a placeholder, 
        // we'll assume the email is also stored or passed down, e.g., 'userEmail'.
        // For a demonstration, we'll use a placeholder email.
        const userEmail = 'verified_citizen@example.com'; // ⚠️ REPLACE with actual user email if available

        // 3. Call the backend API
        const response = await api.put(`/issues/${ticketId}/verify`, 
            { email: userEmail }, // Pass email as required by your current backend route
            { 
                headers: { 
                    Authorization: `Bearer ${token}` 
                } 
            }
        ); 

        alert(`✅ Report ${ticketId} status updated to '${response.data.newStatus}'!`);
        
        // Refresh the list of reports to show the updated status
        fetchUserReports(); 

    } catch (err) {
        console.error("Verification Error:", err);
        const errorMessage = err.response?.data?.message || 'Failed to verify and close report.';
        setError(errorMessage);
        
        // Log out user if token is invalid
        if (err.response?.status === 401 || err.response?.status === 403) {
             localStorage.removeItem('token');
             localStorage.removeItem('userRole');
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
                    onClick={onReportClick} // 🚀 FUNCTIONALITY: Navigates to Report Form
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
                        Error loading live reports: **{error}**. Displaying mock data.
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
                                                onClick={() => handleTrackReport(report)} // 🚀 FUNCTIONALITY: Open Modal
                                                className="bg-blue-500 hover:bg-blue-600 text-white p-2 text-xs"
                                            >
                                                Track Details
                                            </Button>
                                            {report.status === 'Awaiting Verification' && (
                                                <Button 
                                                    onClick={() => handleVerifyAndClose(report.ticketId)} // 🚀 FUNCTIONALITY: Confirm & Close
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
                isDayTheme={isDayTheme}
            />

        </div>
    );
};

export default CitizenDashboard;