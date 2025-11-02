// src/components/Dashboards/AuthorityDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/config';
import IssueColumn from './IssueColumn';
import AuthorityMetrics from './AuthorityMetrics';
import IssueMap from './IssueMap'; // Placeholder for map component
import { PotholeIcon, BinIcon } from '../Common/ThemeIcons';
import Button from '../Common/Button';

const AuthorityDashboard = ({ isDayTheme }) => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for filtering and organization
  const [filterType, setFilterType] = useState('all'); // 'all', 'pothole', 'waste'

// const fetchIssues = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);

//     // --- START: DATA SIMULATION BLOCK (UPDATED) ---
//    // --- Inside src/components/Dashboards/AuthorityDashboard.jsx (fetchIssues function) ---

//     // --- START: DATA SIMULATION BLOCK (UPDATED AGAIN) ---
//     const MOCK_ISSUES = [
//       // PENDING ISSUES
//       {
//         ticketId: 'P-001',
//         issueType: 'pothole',
//         title: 'Large Pothole - Main Street',
//         description: 'A very deep and wide pothole on Main Street, causing traffic hazards near the intersection with Oak Avenue. Requires immediate attention.',
//         status: 'Pending',
//         lat: 40.7128,
//         lng: -74.0060,
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago (High Priority)
//         imageUrl: 'https://via.placeholder.com/100x70/6A0DAD/FFFFFF?text=Pothole', // Placeholder image
//       },
//       {
//         ticketId: 'W-002',
//         issueType: 'waste',
//         title: 'Overflowing Bin - Park Entrance',
//         description: 'The public waste bin at the north entrance of Central Park is overflowing, attracting pests and creating a mess.',
//         status: 'Pending',
//         lat: 40.7850,
//         lng: -73.9653,
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
//         imageUrl: 'https://via.placeholder.com/100x70/FF6600/FFFFFF?text=Waste',
//       },
//       {
//         ticketId: 'P-003',
//         issueType: 'pothole',
//         title: 'Cracked Road - School Zone',
//         description: 'Multiple cracks appearing on the road surface near the elementary school. Not a major hazard yet, but needs monitoring.',
//         status: 'Pending',
//         lat: 40.7418,
//         lng: -73.9990,
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
//         imageUrl: 'https://via.placeholder.com/100x70/6A0DAD/FFFFFF?text=RoadCrack',
//       },

//       // IN PROGRESS ISSUES
//       {
//         ticketId: 'W-004',
//         issueType: 'waste',
//         title: 'Graffiti Removal - Underpass',
//         description: 'Graffiti reported on the walls of the underpass on Elm Street. Team assigned for cleaning.',
//         status: 'In Progress',
//         lat: 40.7258,
//         lng: -74.0070,
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
//         assignedTo: 'Team Alpha',
//         imageUrl: 'https://via.placeholder.com/100x70/FF6600/FFFFFF?text=Graffiti',
//       },
//       {
//         ticketId: 'P-005',
//         issueType: 'pothole',
//         title: 'Sidewalk Repair - Commercial District',
//         description: 'Uneven sidewalk blocks causing trip hazards in the busy commercial area. Repair crew is on site.',
//         status: 'In Progress',
//         lat: 40.7500,
//         lng: -73.9900,
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
//         assignedTo: 'Crew B',
//         imageUrl: 'https://via.placeholder.com/100x70/6A0DAD/FFFFFF?text=Sidewalk',
//       },

//       // AWAITING VERIFICATION ISSUES
//       {
//         ticketId: 'W-006',
//         issueType: 'waste',
//         title: 'Illegal Dumping Cleaned - Alleyway',
//         description: 'The illegal dumping site in the alley behind 123 Maple Street has been cleared. Awaiting citizen confirmation.',
//         status: 'Awaiting Verification',
//         lat: 40.7100,
//         lng: -74.0000,
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days in this state
//         imageUrl: 'https://via.placeholder.com/100x70/FF6600/FFFFFF?text=Cleaned',
//       },
//       {
//         ticketId: 'P-007',
//         issueType: 'pothole',
//         title: 'Pothole Fixed - Park Avenue',
//         description: 'The pothole near 456 Park Avenue has been patched and road surface is smooth. Ready for citizen verification.',
//         status: 'Awaiting Verification',
//         lat: 40.7600,
//         lng: -73.9700,
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day in this state
//         imageUrl: 'https://via.placeholder.com/100x70/6A0DAD/FFFFFF?text=FixedRoad',
//       },

//       // CLOSED ISSUE (for completeness, though not in columns)
//       {
//         ticketId: 'C-008',
//         issueType: 'waste',
//         title: 'Bin Emptied - Bus Stop',
//         description: 'Public bin at bus stop has been emptied and cleaned. Confirmed by citizen.',
//         status: 'Closed',
//         lat: 40.7000,
//         lng: -74.0100,
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
//         imageUrl: 'https://via.placeholder.com/100x70/FF6600/FFFFFF?text=Emptied',
//       },
//     ];
  

//     await new Promise(resolve => setTimeout(resolve, 800));
//     setIssues(MOCK_ISSUES);
//     setIsLoading(false);
//   }, []);
    // --- END: DATA SIMULATION BLOCK ---
    
 const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    // --- REAL API CALL ---
    try {
      const response = await api.get('/issues/authority/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssues(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load issues for your zone. Ensure backend is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Handler for updating an issue status (passed down to IssueCard)
  // const handleStatusUpdate = (ticketId, newStatus) => {
  //   // Optimistic UI update
  //   setIssues(prevIssues => 
  //     prevIssues.map(issue => 
  //       issue.ticketId === ticketId ? { ...issue, status: newStatus } : issue
  //     )
  //   );
  //   // You would call an API endpoint here to persist the status change
  //   // api.put(`/issues/${ticketId}/status`, { status: newStatus, notes: '...' });
  // };

//changes
  const handleStatusUpdate = async (ticketId, newStatus) => {
    
    // 1. Optimistic UI update (optional, but good for perceived speed)
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.ticketId === ticketId ? { ...issue, status: newStatus } : issue
      )
    );

    const token = localStorage.getItem('token');
    if (!token) {
        setError("Session token missing. Please log in again.");
        return;
    }

    try {
        // 2. Call the backend API to persist the status change
        // This uses your existing backend route: PUT /api/issues/:ticketId/status (secured by 'protect' and 'authorize')
        await api.put(`/issues/${ticketId}/status`, 
            { status: newStatus }, // Send the new status in the request body
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        // 3. Re-fetch issues to ensure the entire state (including any backend-side updates/logic) is current
        // For a Kanban view, re-fetching is often safer than complex local state management.
        fetchIssues(); 
        
    } catch (err) {
        // 4. Handle errors (and revert optimistic update if needed)
        console.error("Status Update Failed:", err);
        setError(err.response?.data?.message || `Failed to update status for ${ticketId}.`);

        // Revert the optimistic update on failure
        setIssues(prevIssues => 
            prevIssues.map(issue => 
              issue.ticketId === ticketId ? { ...issue, status: 'Error Revert' } : issue // You might revert to the old status or a default error status
            )
        );
         // Log out user if token is invalid
        if (err.response?.status === 401 || err.response?.status === 403) {
             localStorage.removeItem('token');
             localStorage.removeItem('userRole');
             // In a real app, you'd trigger a redirect here.
        }
    }
  };


  // const getColumnIssues = (status) => {
  //   let filtered = issues.filter(issue => issue.status === status);
    
  //   // Apply issue type filter
  //   if (filterType !== 'all') {
  //     filtered = filtered.filter(issue => issue.issueType === filterType);
  //   }
    
  //   // Custom sort for priority (e.g., issues pending over 7 days first)
  //   if (status === 'Pending') {
  //     filtered.sort((a, b) => {
  //       const aDays = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  //       const bDays = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  //       if (aDays > 7 && bDays <= 7) return -1;
  //       if (aDays <= 7 && bDays > 7) return 1;
  //       return 0; // Maintain natural order for others
  //     });
  //   }

  //   return filtered;
  // };
const getColumnIssues = (status) => {
    let filtered = issues.filter(issue => issue.status === status);
    
    // Apply issue type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(issue => issue.issueType === filterType);
    }
    
    // Custom sort for priority (e.g., issues pending over 7 days first)
    if (status === 'Pending') {
      filtered.sort((a, b) => {
        const aDays = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const bDays = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (aDays > 7 && bDays <= 7) return -1;
        if (aDays <= 7 && bDays > 7) return 1;
        return 0; // Maintain natural order for others
      });
    }

    return filtered;
  };
  const cardClasses = isDayTheme ? 'bg-white shadow-xl text-gray-900' : 'bg-gray-800 shadow-2xl text-white';

  if (isLoading) return <div className={`text-center py-20 ${isDayTheme ? 'text-gray-700' : 'text-gray-300'}`}>Loading Issues...</div>;
  if (error) return <div className={`p-4 bg-red-700 text-white rounded-lg`}>Error: {error}</div>;

  return (
    <div className="space-y-8">
      <h1 className={`text-4xl font-extrabold ${isDayTheme ? 'text-teal-600' : 'text-teal-400'}`}>Authority Operations Dashboard</h1>
      
      {/* Metrics Section */}
      <AuthorityMetrics issues={issues} isDayTheme={isDayTheme} />

      {/* Filter and Map Section */}
     <div className={`p-6 rounded-xl transition-colors duration-300 ${cardClasses}`}>
        <div className="flex flex-wrap justify-between items-center">
            <div className="flex space-x-3 items-center">
                <h2 className="text-xl font-bold mr-3">Filter by Type:</h2>
                <Button 
                    onClick={() => setFilterType('all')} 
                    className={`py-2 px-4 text-sm ${filterType === 'all' ? 'bg-teal-500 text-white' : isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-teal-100' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                    All ({issues.length})
                </Button>
                <Button 
                    onClick={() => setFilterType('pothole')} 
                    className={`py-2 px-4 text-sm ${filterType === 'pothole' ? 'bg-purple-500 text-white' : isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-purple-100' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                    Potholes ({issues.filter(i => i.issueType === 'pothole').length})
                </Button>
                <Button 
                    onClick={() => setFilterType('waste')} 
                    className={`py-2 px-4 text-sm ${filterType === 'waste' ? 'bg-orange-500 text-white' : isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-orange-100' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                    Waste ({issues.filter(i => i.issueType === 'waste').length})
                </Button>
            </div>
            <Button className="bg-blue-500 text-white py-2 px-4 text-sm">View Map</Button>
        </div>
        
        {/* Placeholder for Map View (moved below filters) */}
        <div className="mt-6">
            <IssueMap isDayTheme={isDayTheme} issueLocations={issues.map(i => ({ lat: i.lat, lng: i.lng, id: i.ticketId }))} />
        </div>
    </div>

      {/* Kanban-Style Columns */}
    
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <IssueColumn
          title="Issues Pending (New & High Priority)"
          issues={getColumnIssues('Pending')} // Uses filtered issues
          isDayTheme={isDayTheme}
          onStatusUpdate={handleStatusUpdate}
        />
        <IssueColumn
          title="In Progress (Assigned & Working)"
          issues={getColumnIssues('In Progress')} // Uses filtered issues
          isDayTheme={isDayTheme}
          onStatusUpdate={handleStatusUpdate}
        />
        <IssueColumn
          title="Awaiting Citizen Verification"
          issues={getColumnIssues('Awaiting Verification')} // Uses filtered issues
          isDayTheme={isDayTheme}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
};

export default AuthorityDashboard;