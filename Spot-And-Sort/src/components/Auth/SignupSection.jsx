import React, { useState } from 'react';
import api from '../../api/config';
import { EyeIcon } from '../Common/ThemeIcons';
import Button from '../Common/Button';

const SignupSection = ({ isDayTheme, onError, onSignupSuccess }) => {
    // --- Step 1 States (Signup) ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [role] = useState('citizen');
    const [showPassword, setShowPassword] = useState(false);

    // --- Step 2 States (Verification) ---
    const [step, setStep] = useState('signup'); // 'signup' or 'verify'
    const [otp, setOtp] = useState('');

    // --- Utility States ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // --- Styling Classes (Remain the same) ---
    const cardClasses = isDayTheme ? 'bg-gray-100 shadow-xl' : 'bg-gray-800 shadow-2xl';
    const inputClasses = isDayTheme ?
        "bg-white border-gray-300 text-gray-900 placeholder-gray-500" :
        "bg-gray-700 border-gray-600 text-white placeholder-gray-400";
    const accentTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';
    const labelTextClass = isDayTheme ? 'text-gray-700' : 'text-gray-300';


    // 🛑 HANDLER 1: Request OTP and move to verification step
    const handleSignupAttempt = async (e) => {
        e.preventDefault();
        onError(null);
        setMessage('');

        if (password !== confirmPassword) {
            setMessage('Error: Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            // 🛑 Call the new 'request-otp' endpoint
            await api.post(`/auth/request-otp`, {
                name, email, password, mobileNumber, gender, dateOfBirth, role,
            });

            setMessage('Verification code sent! Check your email (and spam) for the 6-digit code.');
            setStep('verify'); // Move to the verification screen

        } catch (error){
            const errorMessage = error.response?.data?.message || 'Signup failed. Check details.';
            setMessage(`Error: ${errorMessage}`);
            onError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🛑 HANDLER 2: Verify the submitted OTP
    const handleOtpVerification = async (e) => {
        e.preventDefault();
        onError(null);
        setMessage('');

        setIsSubmitting(true);
        try {
            // 🛑 Call the 'verify-otp' endpoint
            await api.post(`/auth/verify-otp`, {
                email, // Need to send email to identify the user
                otp,   // The code entered by the user
            });

            setMessage('Account successfully verified! Redirecting to login...');
            // Success cleanup and redirect/login
            onSignupSuccess(); 
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Verification failed. Try again.';
            setMessage(`Error: ${errorMessage}`);
            onError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-20 md:py-32">
            <div className={`rounded-3xl p-8 md:p-16 text-center max-w-lg w-full transition-colors duration-300 ${cardClasses}`}>
                <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${accentTextClass}`}>
                    {step === 'signup' ? 'Create an Account' : 'Verify Your Email'}
                </h2>
                <p className="text-gray-300 text-lg md:text-xl mb-12"></p>
                
                {/* 🛑 CONDITIONAL RENDERING BASED ON STEP */}
                {step === 'signup' && (
                    <form onSubmit={handleSignupAttempt} className="flex flex-col space-y-6">
                        {/* Field: Name */}
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}
                        />
                        {/* Field: Email */}
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}
                        />

                        {/* Password Input Group */}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors pr-12 ${inputClasses}`}
                            />
                             {/* ... Password Toggle Button ... */}
                        </div>

                        {/* Confirm Password Input Group */}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors pr-12 ${inputClasses}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${isDayTheme ? 'text-gray-500 hover:text-teal-600' : 'text-gray-400 hover:text-teal-400'}`}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                <EyeIcon className="h-6 w-6" showPassword={showPassword} />
                            </button>
                        </div>
                        {/* Field: Mobile Number */}
                        <input
                            type="tel"
                            placeholder="Mobile Number"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            required
                            className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}
                        />
                        {/* Field: Gender */}
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            required
                            className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}
                        >
                             <option value="" disabled className={isDayTheme ? "bg-white text-gray-500" : "bg-gray-700 text-gray-400"}>Select Gender</option>
                            <option value="male" className={isDayTheme ? "bg-white text-gray-900" : "bg-gray-700 text-white"}>Male</option>
                            <option value="female" className={isDayTheme ? "bg-white text-gray-900" : "bg-gray-700 text-white"}>Female</option>
                            <option value="other" className={isDayTheme ? "bg-white text-gray-900" : "bg-gray-700 text-white"}>Other</option>
                        </select>
                        {/* Field: Date of Birth */}
                        <div className="text-left">
                            <label htmlFor="dob" className={`block mb-2 text-sm font-medium ${labelTextClass}`}>Date of Birth</label>
                            <input
                                type="date"
                                id="dob"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                required
                                className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}
                            />
                        </div>

                        <Button type="submit" disabled={isSubmitting} className={`w-full ${isSubmitting ? 'bg-gray-500' : 'bg-teal-500 hover:bg-teal-600'} text-white`}>
                            {isSubmitting ? 'Sending Code...' : 'Sign Up & Get Code'}
                        </Button>
                    </form>
                )}
                
                {/* 🛑 OTP VERIFICATION STEP */}
                {step === 'verify' && (
                    <form onSubmit={handleOtpVerification} className="flex flex-col space-y-6">
                        <p className={`text-lg font-medium ${labelTextClass}`}>Enter the 6-digit code sent to **{email}**</p>
                        <input
                            type="text"
                            placeholder="Verification Code (OTP)"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength="6"
                            className={`w-full p-4 rounded-lg border text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}
                        />
                        
                        <Button type="submit" disabled={isSubmitting} className={`w-full ${isSubmitting ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'} text-white`}>
                            {isSubmitting ? 'Verifying...' : 'Verify Account'}
                        </Button>
                    </form>
                )}

                {message && (
                    <p className={`mt-4 font-semibold ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
                )}
            </div>
        </div>
    );
};

export default SignupSection;