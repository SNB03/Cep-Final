import { useState, useEffect } from 'react';

/**
 * Custom hook to manage all common state and logic for the Issue Report forms.
 * This includes state initialization, geolocation, and image handling.
 * * @param {boolean} isDayTheme Used for determining styling variables
 * @returns {object} Contains all states and handler functions for the form components
 */
export const useReportFormCommon = (isDayTheme) => {
    // --- 1. CORE FORM STATES (Shared by Auth & Anon) ---
    const [title, setTitle] = useState(''); // Required by backend
    const [issueType, setIssueType] = useState('pothole');
    const [description, setDescription] = useState('');
    const [zone, setZone] = useState(''); // Required by backend

    // --- 2. FILE/IMAGE STATES ---
    const [image, setImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

    // --- 3. LOCATION STATES ---
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [locating, setLocating] = useState(false);
    
    // --- 4. UTILITY STATES ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [ticketId, setTicketId] = useState('');


    // --- STYLING (Can be centralized here for reuse) ---
    const cardClasses = isDayTheme ? 'bg-gray-100 shadow-xl' : 'bg-gray-800 shadow-2xl';
    const inputClasses = isDayTheme ? "bg-white border-gray-300 text-gray-900 placeholder-gray-500" : "bg-gray-700 border-gray-600 text-white placeholder-gray-400";
    const accentTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';
    const labelTextClass = isDayTheme ? 'text-gray-700' : 'text-gray-300';
    const locateTextClass = isDayTheme ? 'text-gray-600' : 'text-gray-400';
    const locateInfoClass = isDayTheme ? 'text-gray-900' : 'text-white';


    // --- HANDLERS ---

    // Handler for image file selection
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
    
    // Geolocation Effect (Runs once on mount)
    useEffect(() => {
        setLocating(true);
        // Fallback position (Delhi, India)
        const fallbackLocation = { lat: 28.7041, lng: 77.1025 };
        setLocation(fallbackLocation); 
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLocating(false);
                },
                (err) => {
                    console.error("Geolocation Error:", err);
                    setLocating(false);
                    setError('Location access denied or not supported. Using a default center point.');
                }
            );
        } else {
            setLocating(false);
            setError('Geolocation is not supported by this browser. Using a default center point.');
        }
    }, []);

    // --- RETURN ALL STATES AND HANDLERS ---
    return {
        // Core Form State
        title, setTitle,
        issueType, setIssueType,
        description, setDescription,
        zone, setZone,

        // File/Image State
        image, setImage,
        imagePreviewUrl, handleImageChange,

        // Location State
        location, setLocation,
        locating, setLocating,

        // Utility State
        isSubmitting, setIsSubmitting,
        error, setError,
        ticketId, setTicketId,

        // Styling Classes
        cardClasses, inputClasses, accentTextClass, 
        labelTextClass, locateTextClass, locateInfoClass,
    };
};