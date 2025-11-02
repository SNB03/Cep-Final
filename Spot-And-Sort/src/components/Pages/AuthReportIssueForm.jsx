import React, { useState, useEffect } from 'react';
import api from '../../api/config';
import Button from '../Common/Button';
import LocationMap from './LocationMap'; 
import { useReportFormCommon } from '../../hooks/useReportFormCommon'; 
import axios from 'axios'; 

// Assumes the parent (App.jsx) passes: isDayTheme, onCancel, onSuccess, token
const AuthReportIssueForm = ({ isDayTheme, onCancel, onSuccess, token }) => { 
    // Destructure common state and handlers from the hook
    const { 
        issueType, setIssueType, description, setDescription, title, setTitle,
        image, setImage, imagePreviewUrl, handleImageChange, 
        location, setLocation, zone, setZone, 
        isSubmitting, setIsSubmitting, locating, setLocating, error, setError,
        ticketId, setTicketId, inputClasses, accentTextClass,
        labelTextClass, locateTextClass, locateInfoClass, cardClasses 
    } = useReportFormCommon(isDayTheme); 

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 1. Frontend Validation Check
        if (!title || !description || !image || !location.lat || !zone) {
            setError('Please fill out all Issue Details, Zone, Image, and Location fields.');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        
        // Append all required fields for the backend Issue schema
        formData.append('title', title);
        formData.append('issueType', issueType);
        formData.append('description', description);
        formData.append('lat', location.lat);
        formData.append('lng', location.lng);
        formData.append('zone', zone);
        formData.append('issueImage', image);
        
        try {
            // 🚀 SUBMIT DIRECTLY: Uses Authorization header passed in the config
            const response = await api.post('/issues', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`, 
                },
            });

            setTicketId(response.data.ticketId);
            
        } catch (error) {
            const status = error.response?.status;
            
            // 🛑 CRITICAL FIX: If token is expired (401/403), force a session clear and redirect.
            if (status === 401 || status === 403) {
                console.error("Session expired or invalid token. Forcing re-login.");
                // Clear the bad token
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                // Call onSuccess to trigger App.jsx to go to dashboard/home view, which detects logout
                onSuccess(); 
                // Display the error message that will be caught and shown on the next screen refresh
                return setError('Session expired. Please log in again to submit your report.');
            }

            const errorMessage = error.response?.data?.message || 'Report submission failed. Please try logging in again.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (ticketId) {
        // --- Success Message ---
        return (
            <div className={`rounded-3xl p-8 md:p-16 text-center ${cardClasses}`}>
                <div className="bg-green-700 p-6 rounded-lg shadow-inner max-w-md mx-auto">
                    <h3 className="text-2xl font-bold text-white mb-2">Report Submitted! 🎉</h3>
                    <p className="text-green-200">Your ticket ID is: <span className="font-bold text-white">{ticketId}</span></p>
                    <p className="text-green-200 mt-2">Check the dashboard for updates.</p>
                    <Button onClick={onSuccess} className="bg-green-500 hover:bg-green-600 text-white mt-4 px-6">Return to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-3xl p-8 md:p-16 text-center transition-colors duration-300 ${cardClasses}`}>
            <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${accentTextClass}`}>Submit New Report (Authenticated)</h2>
            <p className={`${labelTextClass} text-lg md:text-xl mb-8 max-w-2xl mx-auto`}>
                Your submission will be **instantly linked** to your account.
            </p>
            
            <Button onClick={onCancel} type="button" className={`mb-6 text-sm ${isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                ← Back to Dashboard
            </Button>

            {error && (
                <div className="bg-red-700 p-4 rounded-lg shadow-inner max-w-lg mx-auto mb-4">
                    <p className="text-red-200">{error}</p>
                </div>
            )}
            
            <form onSubmit={handleFormSubmit} className="max-w-lg mx-auto space-y-6">
                {/* 1. ISSUE DETAILS */}
                <h3 className={`text-2xl font-bold mb-4 ${accentTextClass}`}>1. Issue Details</h3>
                
                <input type="text" placeholder="Short Title (e.g., Large Pothole on Main St)" value={title} onChange={(e) => setTitle(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />
                
                <div className="text-left">
                    <label htmlFor="issueType" className={`block mb-2 ${labelTextClass}`}>Type of Issue</label>
                    <select id="issueType" value={issueType} onChange={(e) => setIssueType(e.target.value)} className={`w-full p-4 rounded-lg border ${inputClasses}`}>
                        <option value="pothole">Pothole</option>
                        <option value="waste">Waste Management</option>
                    </select>
                </div>
                <div className="text-left">
                    <label htmlFor="description" className={`block mb-2 ${labelTextClass}`}>Description of the problem</label>
                    <textarea id="description" placeholder="e.g., A large pothole on the corner of Main St and Elm Ave" value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" className={`w-full p-4 rounded-lg border ${inputClasses}`}></textarea>
                </div>
                <div className="text-left">
                    <label htmlFor="image" className={`block mb-2 ${labelTextClass}`}>Upload Image</label>
                    <input type="file" id="image" accept="image/*" onChange={handleImageChange} required className={`w-full p-3 rounded-lg border cursor-pointer ${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDayTheme ? 'file:bg-teal-500 file:text-white' : 'file:bg-teal-500 file:text-white bg-gray-700'}`} />
                    {imagePreviewUrl && (<div className="mt-4"><img src={imagePreviewUrl} alt="Preview" className="w-full h-auto rounded-lg shadow-lg" /></div>)}
                </div>
                
                {/* 2. LOCATION & ZONE */}
                <h3 className={`text-2xl font-bold pt-6 mb-4 ${accentTextClass}`}>2. Confirm Location/Zone</h3>

                <input type="text" placeholder="Zone/Locality (e.g., Central Park Area)" value={zone} onChange={(e) => setZone(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />

                <LocationMap location={location} isDayTheme={isDayTheme} />
                
                <div className="mt-4 p-3 rounded-lg border-2 border-dashed border-teal-500">
                    {locating ? (
                        <p className={locateTextClass}>Fetching your precise GPS location...</p>
                    ) : (
                        <p className={locateTextClass}>
                            **Coordinates:** <span className={`font-bold ${locateInfoClass}`}>Lat: {location.lat?.toFixed(5) || 'N/A'}</span>, 
                            <span className={`font-bold ${locateInfoClass}`}> Lng: {location.lng?.toFixed(5) || 'N/A'}</span>
                        </p>
                    )}
                </div>

                <Button type="submit" disabled={isSubmitting || locating || !image} className="bg-teal-500 hover:bg-teal-600 text-white w-full">
                    {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
                </Button>
            </form>
        </div>
    );
};

export default AuthReportIssueForm;