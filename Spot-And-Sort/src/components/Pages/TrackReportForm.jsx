// src/components/Pages/TrackReportForm.jsx
import React, { useState } from 'react';
import api from '../../api/config';
import Button from '../Common/Button';

const TrackReportForm = ({ isDayTheme }) => {
  const [ticketId, setTicketId] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [statusData, setStatusData] = useState(null); // Holds the full report object from the API
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifyMessage, setVerifyMessage] = useState('');

  const inputClasses = isDayTheme ?
    "bg-white border-gray-300 text-gray-900 placeholder-gray-500" :
    "bg-gray-700 border-gray-600 text-white placeholder-gray-400";
  const statusCardClasses = isDayTheme ? 'bg-gray-200 text-gray-900' : 'bg-gray-700 text-white';

  const getStatusColorClass = (status) => {
    if (status === 'Closed') return 'text-green-400';
    if (status === 'Awaiting Verification') return 'text-blue-400';
    if (status === 'In Progress') return 'text-yellow-400';
    if (status === 'Pending') return 'text-red-400';
    return 'text-gray-400';
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    setStatusData(null);
    setError(null);
    setIsLoading(true);
    setVerifyMessage('');

    try {
        // Hitting the public endpoint (no token required)
        const response = await api.get(`/issues/track/${ticketId}`);
        setStatusData(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            setError(`Ticket ID ${ticketId} was not found.`);
        } else {
            setError(error.response?.data?.message || 'Error tracking report. Check ID.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyResolution = async () => {
    if (!reporterEmail) {
      setVerifyMessage('Please enter the email associated with this report to verify.');
      return;
    }

    setIsLoading(true);
    setVerifyMessage('Sending verification...');
    setError(null);

    try {
      // Hitting the PUT /api/issues/:ticketId/verify endpoint
      const response = await api.put(`/issues/${ticketId}/verify`, { email: reporterEmail });

      // Update the status locally to 'Closed' and show success message
      setStatusData(prev => ({ ...prev, status: response.data.newStatus }));
      setVerifyMessage(response.data.message);

    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Verification failed. Did you use the correct email?';
        setVerifyMessage(errorMessage);
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleTrack} className="max-w-lg mx-auto space-y-6">
      {/* Input 1: Ticket ID */}
      <input
        type="text"
        placeholder="Enter Ticket ID (e.g., P-123456)"
        value={ticketId}
        onChange={(e) => setTicketId(e.target.value)}
        required
        className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}
      />
      
      <Button type="submit" disabled={isLoading} className="bg-teal-500 hover:bg-teal-600 text-white w-full">
        {isLoading && !statusData ? 'Tracking...' : 'Track Status'}
      </Button>
      
      {/* Display Status Results */}
      {statusData && (
        <div className={`mt-4 p-6 rounded-lg shadow-inner text-left transition-colors duration-300 ${statusCardClasses}`}>
          <h3 className="text-xl font-bold mb-3">Ticket Status: {statusData.ticketId}</h3>
          
          <p className={isDayTheme ? 'text-gray-700' : 'text-gray-300'}>
            Issue: <span className={`font-bold ${isDayTheme ? 'text-gray-900' : 'text-white'}`}>{statusData.description}</span>
          </p>
          
          <p className="text-lg font-bold my-3">
            Current Status: <span className={getStatusColorClass(statusData.status)}>{statusData.status}</span>
          </p>

          {/* Verification Section */}
          {statusData.status === 'Awaiting Verification' && (
            <div className={`p-4 mt-4 rounded-lg border-2 ${isDayTheme ? 'border-blue-500 bg-white' : 'border-blue-700 bg-gray-800'}`}>
                <p className="font-semibold text-blue-400 mb-3">Action Required: Verify Resolution</p>
                <p className={`text-sm ${isDayTheme ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                    Enter the email address used to report this issue to confirm the work is done:
                </p>
                
                {/* Input 2: Reporter Email */}
                <input
                    type="email"
                    placeholder="Reporter Email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    required
                    className={`w-full p-3 rounded-lg border ${inputClasses} mb-3`}
                />

                <Button 
                    type="button" 
                    onClick={handleVerifyResolution} 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2"
                >
                    {isLoading && verifyMessage.includes('Sending') ? 'Verifying...' : 'Confirm & Close Issue'}
                </Button>
            </div>
          )}

          {/* Resolution Photo Display (Visible for Awaiting Verification or Closed) */}
          {(statusData.status === 'Awaiting Verification' || statusData.status === 'Closed') && statusData.resolutionImageUrl && (
            <div className="mt-4">
                <p className="font-semibold mb-2">Proof of Resolution:</p>
                <img src={statusData.resolutionImageUrl} alt="Resolution Proof" className="w-full h-auto rounded-lg shadow-lg" />
            </div>
          )}
          
          {/* Status Messages */}
          {verifyMessage && (
            <p className={`mt-3 font-semibold ${verifyMessage.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>{verifyMessage}</p>
          )}

        </div>
      )}
      
      {error && !statusData && (
        <div className="mt-4 p-4 rounded-lg bg-red-800 text-red-200 text-left">
          <p className="font-bold">Error:</p> {error}
        </div>
      )}
    </form>
  );
};

export default TrackReportForm;