import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/config';
import Button from '../Common/Button'; // Assuming Button component path

// --- ICONS (Inline SVG for simplicity) ---
const ActivityIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>);
const UserIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const ClockIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
const AlertTriangle = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);

// --- MOCK DATA FOR INITIAL METRICS (Always render these when fetching or if no data) ---
const INITIAL_METRICS = {
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
    activeUsers: 4500, // Mocked base metric
    activeAuthorities: 0,
    avgResolutionTimeDays: 4.5, // Mocked base metric
    pendingOver30Days: 15, // Mocked base metric
    issueBreakdown: [],
    authorityPerformance: []
};

// --- HELPER 1: Calculates metrics from raw issue data ---
const processIssues = (issues) => {
    if (!issues || issues.length === 0) {
        return INITIAL_METRICS;
    }
    const totalIssues = issues.length;
    const resolvedIssues = issues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;
    const pendingIssues = issues.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length;

    const breakdownMap = issues.reduce((acc, issue) => {
        const type = issue.issueType ? issue.issueType.toLowerCase() : 'other';
        const displayType = type.charAt(0).toUpperCase() + type.slice(1);
        acc[type] = acc[type] || { type: displayType, count: 0, pending: 0 };
        acc[type].count++;
        if (issue.status !== 'Resolved' && issue.status !== 'Closed') {
            acc[type].pending++;
        }
        return acc;
    }, {});

    const performanceMap = issues.reduce((acc, issue) => {
        const zone = issue.zone || 'Unknown';
        const status = issue.status;
        acc[zone] = acc[zone] || { zone, resolved: 0, backlog: 0, avgTime: 4.0 };
        
        if (status === 'Resolved' || status === 'Closed') {
            acc[zone].resolved++;
        } else {
            acc[zone].backlog++;
        }
        return acc;
    }, {});

    return {
        totalIssues,
        resolvedIssues,
        pendingIssues,
        activeUsers: INITIAL_METRICS.activeUsers,
        activeAuthorities: Object.keys(performanceMap).length,
        avgResolutionTimeDays: INITIAL_METRICS.avgResolutionTimeDays,
        pendingOver30Days: INITIAL_METRICS.pendingOver30Days,
        issueBreakdown: Object.values(breakdownMap),
        authorityPerformance: Object.values(performanceMap),
    };
};

// --- SUB-COMPONENT 1: MetricCard ---
const MetricCard = ({ title, value, colorClass, icon: Icon, isDayTheme }) => {
    const cardClasses = isDayTheme ? 'bg-white shadow-xl text-gray-900' : 'bg-gray-800 shadow-2xl text-white';
    const metricHeaderClass = isDayTheme ? 'text-gray-600' : 'text-gray-400';

    return (
        <div className={`p-5 rounded-xl ${cardClasses}`}>
            <p className={`text-sm font-medium uppercase ${metricHeaderClass}`}>{title}</p>
            <h2 className={`text-3xl font-bold mt-1 flex items-center ${colorClass}`}>
                {Icon && <Icon className="w-6 h-6 mr-2" />}
                {value}
            </h2>
        </div>
    );
};

// --- SUB-COMPONENT 2: ResolutionRateBar ---
const ResolutionRateBar = ({ resolved, total, isDayTheme }) => {
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const cardClasses = isDayTheme ? 'bg-white shadow-xl text-gray-900' : 'bg-gray-800 shadow-2xl text-white';
    const metricHeaderClass = isDayTheme ? 'text-gray-600' : 'text-gray-400';
    const barColor = resolutionRate >= 80 ? '#10B981' : resolutionRate >= 60 ? '#F59E0B' : '#EF4444';

    return (
        <div className={`p-5 rounded-xl ${cardClasses}`}>
            <p className={`text-sm font-medium uppercase ${metricHeaderClass} mb-2`}>
                System Resolution Rate ({resolved} Resolved / {total} Total)
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                <div
                    className="h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${resolutionRate}%`, backgroundColor: barColor }}
                ></div>
            </div>
            <p className="text-lg font-bold mt-2">{resolutionRate}% Resolved</p>
        </div>
    );
};

// --- SUB-COMPONENT 3: AuthorityPerformanceSummary ---
const AuthorityPerformanceSummary = ({ performanceData, isDayTheme }) => {
    const accentTextClass = isDayTheme ? 'text-red-600' : 'text-red-400';
    const cardClasses = isDayTheme ? 'bg-white shadow-xl text-gray-900' : 'bg-gray-800 shadow-2xl text-white';
    const metricHeaderClass = isDayTheme ? 'text-gray-600' : 'text-gray-400';

    const getAuthorityCardClasses = (backlog) => {
        let base = isDayTheme ? 'border-gray-200' : 'border-gray-700';
        if (backlog > 50) {
            base += ' border-red-500 bg-red-800/20';
        } else if (backlog > 25) {
            base += ' border-orange-500 bg-orange-800/20';
        }
        return `p-4 rounded-lg border transition-all duration-300 ${base}`;
    };

    return (
        <div className={`p-6 rounded-xl ${cardClasses}`}>
            <h2 className={`text-xl font-bold border-b pb-2 ${accentTextClass} mb-4`}>Authority Performance Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {performanceData.length > 0 ? (
                    performanceData.map(perf => (
                        <div key={perf.zone} className={getAuthorityCardClasses(perf.backlog)}>
                            <div className="flex justify-between items-center">
                                <h3 className={`font-semibold text-lg ${accentTextClass}`}>{perf.zone}</h3>
                                {perf.backlog > 50 && (
                                    <AlertTriangle className="w-5 h-5 text-red-500" title="High Backlog Alert" />
                                )}
                            </div>
                            <p className={metricHeaderClass}>Resolved: <span className="text-green-500">{perf.resolved}</span></p>
                            <p className={metricHeaderClass}>Avg Time: <span className="text-teal-500">{perf.avgTime}d</span></p>
                            <p className={metricHeaderClass}>Backlog: <span className="text-red-500 font-bold">{perf.backlog}</span></p>
                        </div>
                    ))
                ) : (
                    <div className="md:col-span-3 text-center py-4">
                        <p className={`text-lg ${metricHeaderClass}`}>Data is not present for this section.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT 4: AllIssuesTable (Full Visibility and Actions) ---
const AllIssuesTable = ({ reports, isDayTheme, refreshData }) => {
    const [search, setSearch] = useState('');
    const cardClasses = isDayTheme ? 'bg-white shadow-xl text-gray-900' : 'bg-gray-800 shadow-2xl text-white';
    const accentTextClass = isDayTheme ? 'text-red-600' : 'text-red-400';
    const tableHeaderClass = isDayTheme ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-white';

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'text-orange-500 bg-orange-100 dark:bg-orange-800/50';
            case 'In Progress': return 'text-blue-500 bg-blue-100 dark:bg-blue-800/50';
            case 'Awaiting Verification': return 'text-purple-500 bg-purple-100 dark:bg-purple-800/50';
            case 'Closed': return 'text-green-500 bg-green-100 dark:bg-green-800/50';
            default: return 'text-gray-500 bg-gray-100 dark:bg-gray-800/50';
        }
    };

    // ACTION: Reassigns the issue to a new zone/user
    const handleReassign = async (report) => {
        const newZone = prompt(`Reassign Issue ${report.ticketId} from ${report.zone}.\nEnter new Zone:`);
        if (newZone) {
            try {
                // PUT /api/issues/:ticketId/status
                await api.put(`/issues/${report.ticketId}/status`, { 
                    status: 'Pending', 
                    zone: newZone, 
                });
                alert(`Issue ${report.ticketId} successfully reassigned to ${newZone} and status reset.`);
                refreshData(); // Refresh the entire dashboard data
            } catch (err) {
                console.error("Reassign Error:", err);
                alert(`Failed to reassign issue. Check console for details. Error: ${err.response?.data?.message || 'Server error'}`);
            }
        }
    };

    // ACTION: Admin reviews and potentially force-closes the issue
    const handleViewEdit = (report) => {
        const imageAlert = report.issueImageUrl 
            ? `Issue Image available at: ${report.issueImageUrl}\n` 
            : 'No Issue Image available.\n';
        const resolutionAlert = report.resolutionImageUrl 
            ? `Resolution Image available at: ${report.resolutionImageUrl}\n` 
            : 'No Resolution Image available.\n';

        alert(`${imageAlert}${resolutionAlert}Zone: ${report.zone}, Status: ${report.status}`);

        // Admin can finalize and close issues that are 'Awaiting Verification'
        if (report.status === 'Awaiting Verification') {
            const confirmClose = window.confirm(`Issue ${report.ticketId} is ready for final verification. Confirm closing this issue?`);
            if (confirmClose) {
                // PUT /api/issues/:ticketId/status to close
                api.put(`/issues/${report.ticketId}/status`, { status: 'Closed' })
                    .then(() => {
                        alert(`Issue ${report.ticketId} successfully closed.`);
                        refreshData();
                    })
                    .catch((err) => {
                        console.error("Close Error:", err);
                        alert(`Failed to close issue: ${err.response?.data?.message || 'Server error'}`);
                    });
            }
        }
    };
    
    // Simple frontend filtering based on search input
    const filteredReports = reports.filter(report => 
        report.ticketId?.toLowerCase().includes(search.toLowerCase()) ||
        report.issueType?.toLowerCase().includes(search.toLowerCase()) ||
        report.zone?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={`p-6 rounded-xl ${cardClasses}`}>
            <h2 className={`text-xl font-bold border-b pb-2 ${accentTextClass} mb-4`}>All System Reports (Total: {reports.length})</h2>
            
            <div className="flex justify-between items-center mb-4">
                <input 
                    type="text" 
                    placeholder="Search by ID, Type, or Zone..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`p-2 rounded border w-1/3 ${isDayTheme ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                />
                <Button className="bg-red-500 hover:bg-red-600 text-white">Export All Data</Button>
            </div>

            <div className="overflow-x-auto">
                {filteredReports.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-600">
                        <thead className={tableHeaderClass}>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Zone</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Report Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600">
                            {filteredReports.map((report) => (
                                <tr key={report.ticketId} className={isDayTheme ? 'hover:bg-gray-50' : 'hover:bg-gray-700'}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono">{report.ticketId}</td>
                                    <td className="px-4 py-4 whitespace-nowrap font-medium">{report.issueType.charAt(0).toUpperCase() + report.issueType.slice(1)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{report.zone}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{new Date(report.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                                        <Button onClick={() => handleViewEdit(report)} className="bg-blue-500 hover:bg-blue-600 text-white p-2 text-xs">View/Close</Button>
                                        <Button onClick={() => handleReassign(report)} className="bg-red-500 hover:bg-red-600 text-white p-2 text-xs">Reassign</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center py-8 text-lg">No reports match the current filter/search criteria.</p>
                )}
            </div>
            
            {reports.length === 0 && (
                 <p className="text-center py-8 text-lg">Data is not present for this section.</p>
            )}
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT (Container) ---
const AdminDashboard = ({ isDayTheme }) => {
  const [rawIssues, setRawIssues] = useState([]);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const accentTextClass = isDayTheme ? 'text-red-600' : 'text-red-400';
  const cardClasses = isDayTheme ? 'bg-white shadow-xl text-gray-900' : 'bg-gray-800 shadow-2xl text-white';


    // Function to fetch and update all data
    const fetchAdminData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/issues/authority/dashboard'); 
            
            setRawIssues(response.data);
            setMetrics(processIssues(response.data));
            
        } catch (err) {
            console.error("Failed to fetch admin dashboard data:", err);
            setError(err.response?.data?.message || 'Failed to load dashboard data.');
            
            setMetrics(processIssues([])); // Fallback metrics if fetch fails
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    // --- Button Handlers for Management Controls (NOW IMPLEMENTED) ---
    const handleManageUsers = () => {
        alert("Action: Navigating to the dedicated User Management Page.");
    };

    const handleReviewPending = () => {
        // This is where you would apply a filter to the AllIssuesTable component
        alert(`Action: Filtering All Reports table to show only the ${metrics.pendingOver30Days} issues pending over 30 days.`);
    };

    const handleViewAuditLog = () => {
        alert("Action: Navigating to the Full System Audit Log page.");
    };

    // 1. Show Loading Screen
    if (isLoading) {
        return <div className={`text-center py-10 ${isDayTheme ? 'text-gray-900' : 'text-white'}`}>Loading System Dashboard...</div>;
    }
    
    const hasIssues = rawIssues && rawIssues.length > 0;
    
    return (
        <div className="space-y-8 py-10">
            <h1 className={`text-4xl font-extrabold ${accentTextClass}`}>System Administrator Dashboard</h1>

            {/* Top-Level Error/Warning Message */}
            {error && (
                 <div className={`p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800`}>
                     **Warning:** Could not fetch live data. Displaying base metrics. Error: {error}
                 </div>
            )}

            {/* Row 1: Key Metrics Grid (Always visible with calculated data) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <MetricCard title="Total Reports" value={metrics.totalIssues} colorClass="text-blue-500" icon={ActivityIcon} isDayTheme={isDayTheme} />
                <MetricCard title="Current Backlog" value={metrics.pendingIssues} colorClass="text-red-500" isDayTheme={isDayTheme} />
                <MetricCard title="Avg. Resolution Time" value={`${metrics.avgResolutionTimeDays} days`} colorClass="text-teal-500" icon={ClockIcon} isDayTheme={isDayTheme} />
                <MetricCard title="Active Users" value={metrics.activeUsers} colorClass="text-green-500" icon={UserIcon} isDayTheme={isDayTheme} />
                <MetricCard title="Active Authority Zones" value={metrics.activeAuthorities} colorClass="text-purple-500" isDayTheme={isDayTheme} />
            </div>

            {hasIssues && <ResolutionRateBar resolved={metrics.resolvedIssues} total={metrics.totalIssues} isDayTheme={isDayTheme} />}

            {/* Row 3: Management and Bottlenecks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Management Controls (Now Functional) */}
                <div className={`p-6 rounded-xl space-y-4 ${cardClasses}`}>
                  <h2 className={`text-xl font-bold border-b pb-2 ${accentTextClass}`}>System Controls</h2>
                  <Button onClick={handleManageUsers} className="w-full bg-blue-500 hover:bg-blue-600 text-white">Manage User Accounts</Button>
                  <Button onClick={handleReviewPending} className="w-full bg-orange-500 hover:bg-orange-600 text-white">Review Pending 30 Days ({metrics.pendingOver30Days})</Button>
                  <Button onClick={handleViewAuditLog} className="w-full bg-gray-500 hover:bg-gray-600 text-white">View Full Audit Log</Button>
                </div>

                {/* Column 2: Issue Breakdown Table */}
                <div className={`md:col-span-2 p-6 rounded-xl ${cardClasses}`}>
                  <h2 className={`text-xl font-bold border-b pb-2 ${accentTextClass} mb-4`}>Issue Type Breakdown</h2>
                  <div className="overflow-x-auto">
                        {metrics.issueBreakdown.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-600">
                                <thead className={tableHeaderClass}>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Reports</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-red-500">Pending</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-600">
                                    {metrics.issueBreakdown.map((item) => (
                                        <tr key={item.type} className={isDayTheme ? 'hover:bg-gray-50' : 'hover:bg-gray-700'}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{item.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-red-500 font-bold">{item.pending}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table >
                        ) : (
                             <p className="text-center py-8 text-lg">Data is not present for this section.</p>
                        )}
                  </div>
                </div>
              </div>
              
            {/* Row 4: FULL ISSUES TABLE */}
            {hasIssues ? (
                <AllIssuesTable reports={rawIssues} isDayTheme={isDayTheme} refreshData={fetchAdminData} />
            ) : (
                 <div className={`p-6 rounded-xl ${cardClasses}`}>
                    <h2 className={`text-xl font-bold border-b pb-2 ${accentTextClass} mb-4`}>All System Reports</h2>
                    <p className="text-center py-10 text-lg">Data is not present for this section.</p>
                </div>
            )}


            {/* Row 5: Authority Performance Summary */}
            <AuthorityPerformanceSummary performanceData={metrics.authorityPerformance} isDayTheme={isDayTheme} />
        </div>
  );
};

export default AdminDashboard;