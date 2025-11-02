import React, { useState } from 'react';
import api from '../../api/config';
import Button from '../Common/Button';
import LocationMap from './LocationMap'; 
import { useReportFormCommon } from '../../hooks/useReportFormCommon'; // Conceptual hook for common logic

// Assumes the parent (App.jsx) passes: isDayTheme, onCancel, onSuccess
const AnonReportIssueForm = ({ isDayTheme, onCancel, onSuccess }) => { 
    const { 
        issueType, setIssueType, description, setDescription, title, setTitle,
        image, setImage, imagePreviewUrl, handleImageChange, 
        location, setLocation, zone, setZone, 
        isSubmitting, setIsSubmitting, locating, setLocating, error, setError,
        ticketId, setTicketId, handleSubmitWrapper, inputClasses, accentTextClass,
        labelTextClass, locateTextClass, locateInfoClass, cardClasses
    } = useReportFormCommon(isDayTheme);

    // --- ANONYMOUS SPECIFIC STATES ---
    const [reporterName, setReporterName] = useState('');
    const [reporterEmail, setReporterEmail] = useState('');
    const [reporterMobile, setReporterMobile] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [tempSessionId, setTempSessionId] = useState(null); 
    const [enteredOtp, setEnteredOtp] = useState('');
    // --- END ANONYMOUS STATES ---


    // --- HANDLER 1: SEND OTP (Initial data submission without image) ---
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError(null);
        
        // 1. Validation Check (All fields required for anonymous flow)
        if (!reporterEmail || !reporterMobile || !reporterName || !description || !image || !location.lat || !title || !zone) {
            setError('Please fill out ALL fields (Contact, Issue Details, Image, Location, and Zone).');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // 🚀 STEP 1: Submit text/data fields to the OTP endpoint
            const response = await api.post('/issues/otp-send', {
                reporterName, reporterEmail, reporterMobile, title, zone,
                issueType, description, lat: location.lat, lng: location.lng
            });
            
            setTempSessionId(response.data.tempId);
            setIsVerifying(true); // Move to verification step

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send verification code. Check email service.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- HANDLER 2: VERIFY OTP AND SUBMIT FINAL REPORT (With Image) ---
    const handleVerifyAndSubmit = async (e) => {
        e.preventDefault();
        
        if (!enteredOtp || !tempSessionId) {
            setError('Invalid verification state. Please restart the submission.');
            return;
        }
        
        setIsSubmitting(true);
        setError(null);

        // 1. Create FormData (Includes OTP, tempId, and the Image)
        const formData = new FormData();
        formData.append('enteredOtp', enteredOtp);
        formData.append('tempId', tempSessionId);
        formData.append('issueImage', image); // The actual image file

        try {
            // 🚀 STEP 2: Final API Call to the anonymous submission endpoint
            const response = await api.post(`/issues/anonymous`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setTicketId(response.data.ticketId);
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Verification or final submission failed.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Determine the form handler for the current step
    const currentFormHandler = isVerifying ? handleVerifyAndSubmit : handleSendOtp;

    // --- RENDERING ---
    if (ticketId) {
        // --- Success Message ---
        return (
            <div className={`rounded-3xl p-8 md:p-16 text-center ${cardClasses}`}>
                <div className="bg-green-700 p-6 rounded-lg shadow-inner max-w-md mx-auto">
                    <h3 className="text-2xl font-bold text-white mb-2">Report Submitted! 🎉</h3>
                    <p className="text-green-200">Your ticket ID is: <span className="font-bold text-white">{ticketId}</span></p>
                    <p className="text-green-200 mt-2">The ID has been sent to **{reporterEmail}**. Use it to track your report.</p>
                    <Button onClick={onSuccess} className="bg-green-500 hover:bg-green-600 text-white mt-4 px-6">Return to Home</Button>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`rounded-3xl p-8 md:p-16 text-center transition-colors duration-300 ${cardClasses}`}>
            <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${accentTextClass}`}>Report an Issue (Anonymous)</h2>
            <p className={`${labelTextClass} text-lg md:text-xl mb-8 max-w-2xl mx-auto`}>
                {isVerifying ? 
                    `Enter the code sent to ${reporterEmail} to verify your identity.` :
                    'Verify your email address to submit your report and receive a tracking ID.'}
            </p>
            
            <Button onClick={onCancel} type="button" className={`mb-6 text-sm ${isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                ← Back to Home
            </Button>

            {error && (
                <div className="bg-red-700 p-4 rounded-lg shadow-inner max-w-lg mx-auto mb-4">
                    <p className="text-red-200">{error}</p>
                </div>
            )}
            
            <form onSubmit={currentFormHandler} className="max-w-lg mx-auto space-y-6">
                
                {/* ----------------------------------------------------------------------------------- */}
                {/* CONTACT INFO (STEP 1/EDIT) */}
                {(!isVerifying) && (
                    <>
                        <h3 className={`text-2xl font-bold mb-4 ${accentTextClass}`}>1. Your Contact Info</h3>
                        <input type="text" placeholder="Your Full Name" value={reporterName} onChange={(e) => setReporterName(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />
                        <input type="email" placeholder="Your Email (for verification & ID)" value={reporterEmail} onChange={(e) => setReporterEmail(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />
                        <input type="tel" placeholder="Your Mobile Number" value={reporterMobile} onChange={(e) => setReporterMobile(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />
                    </>
                )}

                {/* VERIFICATION STEP (STEP 2) */}
                {isVerifying && (
                    <>
                        <h3 className={`text-2xl font-bold mb-4 ${accentTextClass}`}>Verification Code</h3>
                        <input type="text" placeholder="Enter 6-digit Code" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />
                    </>
                )}
                
                {/* ISSUE DETAILS (Visible on Step 1, Hidden on Step 2) */}
                {!isVerifying && (
                    <>
                        <h3 className={`text-2xl font-bold pt-6 mb-4 ${accentTextClass}`}>2. Issue Details</h3>
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
                        
                        {/* LOCATION & ZONE */}
                        <h3 className={`text-2xl font-bold pt-6 mb-4 ${accentTextClass}`}>3. Confirm Location/Zone</h3>
                        <input type="text" placeholder="Zone/Locality (e.g., Central Park Area)" value={zone} onChange={(e) => setZone(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />
                        <LocationMap location={location} isDayTheme={isDayTheme} />
                        <div className="mt-4 p-3 rounded-lg border-2 border-dashed border-teal-500">
                            {locating ? (<p className={locateTextClass}>Fetching your precise GPS location...</p>) : (
                                <p className={locateTextClass}>
                                    **Coordinates:** <span className={`font-bold ${locateInfoClass}`}>Lat: {location.lat?.toFixed(5) || 'N/A'}</span>, <span className={`font-bold ${locateInfoClass}`}> Lng: {location.lng?.toFixed(5) || 'N/A'}</span>
                                </p>
                            )}
                        </div>
                    </>
                )}
                {/* ----------------------------------------------------------------------------------- */}


                {/* Submission Button */}
                <Button type="submit" disabled={isSubmitting || locating || !image} className="bg-teal-500 hover:bg-teal-600 text-white w-full">
                    {isSubmitting ? 'Processing...' : (isVerifying ? 'Verify & Submit Report' : 'Send Verification Code')}
                </Button>
                
                {/* Anonymous Edit Button */}
                {isVerifying && (
                    <Button type="button" onClick={() => setIsVerifying(false)} className={`bg-transparent border-2 ${isDayTheme ? 'border-gray-500 text-gray-500 hover:bg-gray-100' : 'border-gray-500 text-gray-400 hover:bg-gray-700'} w-full mt-2`}>
                        Edit Contact/Details
                    </Button>
                )}
            </form>
        </div>
    );
};

export default AnonReportIssueForm;