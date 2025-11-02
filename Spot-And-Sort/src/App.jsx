import React, { useState, useEffect } from 'react';
// Assuming the following import path fix (moving up one directory level '..')
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import HomeSection from './components/Pages/HomeSection';
import LoginSection from './components/Auth/LoginSection';
import SignupSection from './components/Auth/SignupSection';

import AuthorityDashboard from './components/Dashboards/AuthorityDashboard';
import CitizenDashboard from './components/Dashboards/CitizenDashboard';
import AdminDashboard from './components/Dashboards/AdminDashboard';
import AuthReportIssueForm from './components/Pages/AuthReportIssueForm'; // Logged-in form (Direct Submit)
import AnonReportIssueForm from './components/Pages/AnonReportIssueForm'; // Anonymous form (OTP Required)

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState(''); // 🚀 ADDED: State for email
  const [isDayTheme, setIsDayTheme] = useState(false);
  const [scrollToId, setScrollToId] = useState(null);
  const [error, setError] = useState(null);

    // 🚀 FIX: New state to force the CitizenDashboard to remount and refetch data
    const [reportsVersion, setReportsVersion] = useState(0); 

  const navItems = [
    { name: 'Home', section: 'home', id: 'hero-section' },
    { name: 'About Us', section: 'about', id: 'about-us-section' },
    { name: 'Report an Issue', section: 'report', id: 'report-issue-section' },
    { name: 'Track Your Report', section: 'track-report', id: 'track-report-section' },
    { name: 'Contact', section: 'contact', id: 'contact-section' },
  ];

  useEffect(() => {
    // Check for existing token in localStorage on mount
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail'); // 🚀 ADDED: Get email
    if (token && role && email) {
      setIsLoggedIn(true);
      setUserRole(role);
      setUserEmail(email); // 🚀 ADDED: Set email
      if (role === 'citizen') {
        setActiveSection('dashboard');
      }
    }
  }, []);

  // 🚀 FIX: Updated to accept and store user's email
  const handleLoginSuccess = (token, role, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', email); // 🚀 ADDED: Store email
    setUserRole(role);
    setUserEmail(email); // 🚀 ADDED: Set email state
    setIsLoggedIn(true);
    setActiveSection(role === 'citizen' ? 'dashboard' : 'home');
    setError(null);
  };

  // 🚀 FIX: Updated to remove user's email
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail'); // 🚀 ADDED: Remove email
    setIsLoggedIn(false);
    setUserRole('');
    setUserEmail(''); // 🚀 ADDED: Clear email state
    setActiveSection('home');
  };
  
  // 🚀 FIX: Handler for when the user clicks 'Return to Dashboard' on the success screen.
  const handleReportSuccess = () => {
    // 1. Force the CitizenDashboard to reload data (by changing its key)
    setReportsVersion(prev => prev + 1);
    // 2. Switch the view back to the dashboard
    setActiveSection('dashboard');
  };

 // Handler to return from the report form to the dashboard (used for 'Cancel' button)
  const handleReportCancel = () => {
    setActiveSection('dashboard');
  };

  const handleThemeToggle = () => {
    setIsDayTheme(prev => !prev);
  };

  const handleNavClick = (section, id) => {
    const scrollingSections = ['home', 'about', 'report', 'contact', 'track-report'];

    if (scrollingSections.includes(section)) {
      setActiveSection(section); 
      setScrollToId(id); 
    } else {
      setActiveSection(section);
      setScrollToId(null);
    }
  };

  useEffect(() => {
    if (scrollToId) {
      const element = document.getElementById(scrollToId);
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      setScrollToId(null); 
    }
  }, [scrollToId]);

  const renderSection = () => {
    // --- STANDALONE PAGES (Login/Signup) ---
    if (activeSection === 'login') {
        return <LoginSection onLoginSuccess={handleLoginSuccess} isDayTheme={isDayTheme} onError={setError} />;
    }
    if (activeSection === 'signup') {
        return <SignupSection isDayTheme={isDayTheme} onError={setError} onSignupSuccess={() => setActiveSection('login')} />;
    }
    
    // --- LOGGED-IN DASHBOARDS/PAGES ---
   if (isLoggedIn && userRole === 'authority') {
      return <AuthorityDashboard isDayTheme={isDayTheme} />;
    }
    
    if (isLoggedIn && userRole === 'admin') {
      return <AdminDashboard isDayTheme={isDayTheme} />; 
    }
    
    if (isLoggedIn && userRole === 'citizen') {
        // Logged-in Citizen: Render Auth form when activeSection is 'report'
        if (activeSection === 'report') {
            return (
                <AuthReportIssueForm
                    isDayTheme={isDayTheme}
                    onCancel={handleReportCancel} 
                    onSuccess={handleReportSuccess} // Use the new handler to trigger dashboard refresh
                    isLoggedIn={isLoggedIn}
                    token={localStorage.getItem('token')} 
                />
            );
        }
        // Default Citizen Logged-In View is the Dashboard
        return (
            <CitizenDashboard 
                key={reportsVersion} // CRITICAL: Forces CitizenDashboard to re-fetch data
                isDayTheme={isDayTheme} 
                onReportClick={() => setActiveSection('report')} // Switch to 'report' view
            />
        );
    }

    // --- GUEST/ANONYMOUS VIEW ---
    switch (activeSection) {
      case 'report':
            // Guest/Anonymous: Render Anon form when activeSection is 'report'
         return (
               <AnonReportIssueForm
                   isDayTheme={isDayTheme}
                   onCancel={() => setActiveSection('home')} 
                   onSuccess={() => setActiveSection('home')}
                   isLoggedIn={false}
             />
         );
      case 'home':
      case 'about':
      case 'contact':
      case 'track-report':
        return <HomeSection userRole={userRole} isDayTheme={isDayTheme} isLoggedIn={isLoggedIn} />;
     default:
          return <HomeSection userRole={userRole} isDayTheme={isDayTheme} isLoggedIn={isLoggedIn} />;
    }
};

  const appClasses = isDayTheme
    ? "bg-white text-gray-900 light-mode"
    : "bg-gray-900 text-white";

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${appClasses}`}>
      <Navbar
        isLoggedIn={isLoggedIn}
        activeSection={activeSection}
        navItems={navItems}
        onLogout={handleLogout}
        onNavClick={handleNavClick}
        onStandaloneClick={setActiveSection}
        isDayTheme={isDayTheme}
        onThemeToggle={handleThemeToggle}
      />
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}
        {renderSection()}
      </main>
      <Footer isDayTheme={isDayTheme} />
    </div>
  );
};

export default App;