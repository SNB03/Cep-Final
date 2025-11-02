import React, { useState, useEffect } from 'react';
import api from '../../api/config';
import Button from '../Common/Button';
import LocationMap from './LocationMap'; 
import axios from 'axios'; 

// Added isLoggedIn and token props to determine submission flow
const ReportIssueForm = ({ isDayTheme, onCancel, onSuccess, isLoggedIn, token }) => { 
  const [issueType, setIssueType] = useState('pothole');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState(''); // REQUIRED by backend schema
  const [image, setImage] = useState(null); 
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); 
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [zone, setZone] = useState(''); // REQUIRED by backend schema
  const [ticketId, setTicketId] = useState('');
  
  // States for Anonymous Reporter Details (Only used if NOT logged in)
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterMobile, setReporterMobile] = useState('');
  
  // OTP Verification Flow
  const [isVerifying, setIsVerifying] = useState(false);
  const [tempSessionId, setTempSessionId] = useState(null); 
  const [enteredOtp, setEnteredOtp] = useState('');
  
  // State for submission and loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  
  const cardClasses = isDayTheme ? 'bg-gray-100 shadow-xl' : 'bg-gray-800 shadow-2xl';
  const inputClasses = isDayTheme ? 
    "bg-white border-gray-300 text-gray-900 placeholder-gray-500" : 
    "bg-gray-700 border-gray-600 text-white placeholder-gray-400";
  const accentTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';
  const labelTextClass = isDayTheme ? 'text-gray-700' : 'text-gray-300';
  const locateTextClass = isDayTheme ? 'text-gray-600' : 'text-gray-400';
  const locateInfoClass = isDayTheme ? 'text-gray-900' : 'text-white';


  // Get user's location on component mount (Geolocation)
  useEffect(() => {
    setLocating(true);
    setLocation({ lat: 28.7041, lng: 77.1025 }); 
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocating(false);
        },
        (error) => {
          console.error("Geolocation Error:", error);
          setLocating(false);
          if (!location.lat || !location.lng) {
            setError('Location access denied or not supported. Using a default center point.');
          }
        }
      );
    } else {
      setLocating(false);
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreviewUrl(null);
    }
  };
  
  // --- SHARED SUBMISSION LOGIC (Handles API call and headers) ---
  const submitFinalReport = async (endpoint, formData, isAuth = false) => {
    setIsSubmitting(true);
    setError(null);
    setTicketId('');

    try {
        const config = { 
            headers: { 'Content-Type': 'multipart/form-data' } 
        };

        // Add Authorization header for logged-in users
        if (isAuth && token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const response = await api.post(endpoint, formData, config);

        setTicketId(response.data.ticketId);
        
        setEnteredOtp('');
        setTempSessionId(null);
        setIsVerifying(false); 
        return true; 

    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Report submission failed. Check server logs.';
        setError(errorMessage);
        console.error("Final Submission Error:", error.response || error);
        return false; 
    } finally {
        setIsSubmitting(false);
    }
  };
  
  // --- HANDLER 1: AUTHENTICATED SUBMISSION (Direct Submit) ---
  const handleDirectSubmit = async (e) => {
    e.preventDefault();
    
    // Validation for logged-in user
    if (!title || !description || !image || !location.lat || !zone) {
        setError('Please fill out all required Issue Details, Location, and Zone fields.');
        return;
    }

    const formData = new FormData();
    // Fields required by the backend Issue schema (reporter ID comes from JWT on server)
    formData.append('title', title);
    formData.append('issueType', issueType);
    formData.append('description', description);
    formData.append('lat', location.lat);
    formData.append('lng', location.lng);
    formData.append('zone', zone);
    formData.append('issueImage', image);
    
    // Call the authenticated endpoint (which should be /issues)
    await submitFinalReport('/issues', formData, true); 
  };

  // --- HANDLER 2a: ANONYMOUS STEP 1 (Send OTP) ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation Check for anonymous user (all fields required)
    if (!reporterEmail || !reporterMobile || !reporterName || !description || !image || !location.lat || !title || !zone) {
        setError('Please fill out ALL fields (Contact, Issue Details, Image, Location, and Zone).');
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        // Submit data to the OTP endpoint (backend saves temporary data)
        const response = await api.post('/issues/otp-send', {
            reporterName, reporterEmail, reporterMobile, title, zone,
            issueType, description, lat: location.lat, lng: location.lng
        });
        
        setTempSessionId(response.data.tempId);
        setIsVerifying(true); // Move to verification step

    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to send verification code. Check server logs.';
        setError(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- HANDLER 2b: ANONYMOUS STEP 2 (Verify OTP & Submit Final Report) ---
  const handleVerifyAndSubmit = async (e) => {
    e.preventDefault();
    
    if (!enteredOtp || !tempSessionId) {
        setError('Invalid verification state. Please restart the submission.');
        return;
    }
    
    // Create FormData (Includes OTP, tempId, and the Image)
    const formData = new FormData();
    formData.append('enteredOtp', enteredOtp);
    formData.append('tempId', tempSessionId);
    formData.append('issueImage', image); 
    
    // Submit report via the anonymous endpoint
    await submitFinalReport(`/issues/anonymous`, formData, false);
  };

  // Determine the main handler based on the verification status
  const currentFormHandler = isLoggedIn ? handleDirectSubmit : (isVerifying ? handleVerifyAndSubmit : handleSendOtp);

  return (
    <div className={`rounded-3xl p-8 md:p-16 text-center transition-colors duration-300 ${cardClasses}`}>
      <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${accentTextClass}`}>Report an Issue</h2>
      <p className={`${labelTextClass} text-lg md:text-xl mb-8 max-w-2xl mx-auto`}>
        {isLoggedIn ? 
            'Submit your report instantly.' : 
            'Verify your email address to submit your report and receive a tracking ID.'}
      </p>
      
      {/* Button to go back to dashboard */}
      <Button 
        onClick={onCancel} 
        type="button" 
        className={`mb-6 text-sm ${isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
      >
        ← Back to Dashboard
      </Button>

      {/* Display General Error */}
      {error && (
        <div className="bg-red-700 p-4 rounded-lg shadow-inner max-w-md mx-auto mb-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}
      
      {ticketId ? (
        // --- Success Message ---
        <div className="bg-green-700 p-6 rounded-lg shadow-inner max-w-md mx-auto">
          <h3 className="text-2xl font-bold text-white mb-2">Report Submitted! 🎉</h3>
          <p className="text-green-200">Your ticket ID is: <span className="font-bold text-white">{ticketId}</span></p>
          <p className="text-green-200 mt-2">
            {isLoggedIn ? `Check the dashboard for updates.` : `The ID has been sent to **${reporterEmail}**.`}
          </p>
          <Button onClick={onSuccess} className="bg-green-500 hover:bg-green-600 text-white mt-4 px-6">Return to Dashboard</Button>
        </div>
      ) : (
        <form onSubmit={currentFormHandler} className="max-w-lg mx-auto space-y-6">
            
            {/* Conditional Rendering for Anonymous Contact Info */}
            {!isLoggedIn && !isVerifying && (
                <>
                    <h3 className={`text-2xl font-bold mb-4 ${accentTextClass}`}>1. Your Contact Info</h3>
                    <input type="text" placeholder="Your Full Name" value={reporterName} onChange={(e) => setReporterName(e.target.value)} required className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`} />
                    <input type="email" placeholder="Your Email (for verification & ID)" value={reporterEmail} onChange={(e) => setReporterEmail(e.target.value)} required className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`} />
                    <input type="tel" placeholder="Your Mobile Number" value={reporterMobile} onChange={(e) => setReporterMobile(e.target.value)} required className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`} />
                </>
            )}

            {/* OTP Verification Step */}
            {isVerifying ? (
                <>
                    <h3 className={`text-2xl font-bold mb-4 ${accentTextClass}`}>Verification Required</h3>
                    <p className={`${labelTextClass} text-sm`}>
                        Enter the code sent to **{reporterEmail}**.
                    </p>
                    <input type="text" placeholder="Enter 6-digit Code" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} required className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`} />
                </>
            ) : (
                <>
                    <h3 className={`text-2xl font-bold ${isLoggedIn ? 'mb-4' : 'pt-6 mb-4'} ${accentTextClass}`}>{isLoggedIn ? '1. Issue Details' : '2. Issue Details'}</h3>

                    {/* Title Field */}
                    <input type="text" placeholder="Short Title (e.g., Large Pothole on Main St)" value={title} onChange={(e) => setTitle(e.target.value)} required className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`} />
                    
                    {/* Issue Type */}
                    <div className="text-left">
                        <label htmlFor="issueType" className={`block mb-2 ${labelTextClass}`}>Type of Issue</label>
                        <select id="issueType" value={issueType} onChange={(e) => setIssueType(e.target.value)} className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}>
                            <option value="pothole">Pothole</option>
                            <option value="waste">Waste Management</option>
                        </select>
                    </div>
                    {/* Description */}
                    <div className="text-left">
                        <label htmlFor="description" className={`block mb-2 ${labelTextClass}`}>Description of the problem</label>
                        <textarea id="description" placeholder="e.g., A large pothole on the corner of Main St and Elm Ave" value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}></textarea>
                    </div>
                    {/* Image Upload */}
                    <div className="text-left">
                        <label htmlFor="image" className={`block mb-2 ${labelTextClass}`}>Upload Image</label>
                        <input type="file" id="image" accept="image/*" onChange={handleImageChange} required className={`w-full p-3 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDayTheme ? 'text-gray-900 file:bg-teal-500 file:text-white' : 'text-white file:bg-teal-500 file:text-white bg-gray-700 border-gray-600'}`} />
                        {imagePreviewUrl && (
                            <div className="mt-4">
                                <img src={imagePreviewUrl} alt="Preview" className="w-full h-auto rounded-lg shadow-lg" />
                            </div>
                        )}
                    </div>
                    
                    <h3 className={`text-2xl font-bold pt-6 mb-4 ${accentTextClass}`}>{isLoggedIn ? '2. Confirm Location/Zone' : '3. Confirm Location/Zone'}</h3>

                    {/* Zone Field */}
                    <input type="text" placeholder="Zone/Locality (e.g., Central Park Area)" value={zone} onChange={(e) => setZone(e.target.value)} required className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`} />

                    {/* Map Component */}
                    <LocationMap location={location} isDayTheme={isDayTheme} />
                    
                    <div className="mt-4 p-3 rounded-lg border-2 border-dashed border-teal-500">
                        {locating ? (
                            <p className={locateTextClass}>Fetching your precise GPS location...</p>
                        ) : (
                            <p className={locateTextClass}>
                                **Report Coordinates:** <span className={`font-bold ${locateInfoClass}`}>Lat: {location.lat?.toFixed(5) || 'N/A'}</span>, 
                                <span className={`font-bold ${locateInfoClass}`}> Lng: {location.lng?.toFixed(5) || 'N/A'}</span>
                            </p>
                        )}
                    </div>
                    
                </>
            )}
            
            {/* Submission Button */}
            <Button 
                type="submit" 
                disabled={isSubmitting || locating || !image}
                className="bg-teal-500 hover:bg-teal-600 text-white w-full"
            >
                {isSubmitting ? 'Processing...' : (isVerifying ? 'Verify & Submit Report' : (isLoggedIn ? 'Submit Report' : 'Send Verification Code'))}
            </Button>
            
            {/* Anonymous Edit Button */}
            {isVerifying && (
                <Button 
                    type="button" 
                    onClick={() => setIsVerifying(false)}
                    className={`bg-transparent border-2 ${isDayTheme ? 'border-gray-500 text-gray-500 hover:bg-gray-100' : 'border-gray-500 text-gray-400 hover:bg-gray-700'} w-full mt-2`}
                >
                    Edit Contact/Details
                </Button>
            )}
        </form>
      )}
    </div>
  );
};

export default ReportIssueForm;