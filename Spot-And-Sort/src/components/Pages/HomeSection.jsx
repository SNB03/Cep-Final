// src/components/Pages/HomeSection.jsx
import React from 'react';
import HeroSection from './HeroSection';
import FeatureHighlightSection from './FeatureHighlightSection';
import TrackReportForm from './TrackReportForm';
import AboutUsContent from './AboutUsContent';
import ReportIssueForm from './ReportIssueForm';
import ContactContent from './ContactContent';

// Home Section (Now contains all scrollable content)
const HomeSection = ({ userRole, isDayTheme, isLoggedIn }) => {
  const cardClasses = isDayTheme ? 'bg-gray-100 shadow-xl' : 'bg-gray-800 shadow-2xl';
  const accentTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';

  return (
    <>
      {/* 1. Hero Section (Home) */}
      <section id="hero-section">
        <HeroSection isDayTheme={isDayTheme} />
      </section>

      {/* Feature Highlights (stays mid-page) */}
      <FeatureHighlightSection isDayTheme={isDayTheme} />

      {/* 2. Track Report Section */}
      <section id="track-report-section" className="py-12 md:py-20 flex justify-center">
        <div className={`rounded-2xl p-8 shadow-xl w-full max-w-2xl transition-colors duration-300 ${cardClasses}`}>
          <h3 className={`text-3xl font-extrabold mb-6 text-center ${accentTextClass}`}>Track Your Report</h3>
          <TrackReportForm isDayTheme={isDayTheme} />
        </div>
      </section>

      {/* 3. About Us Section */}
      <section id="about-us-section" className="py-12 md:py-20">
        <AboutUsContent isDayTheme={isDayTheme} />
      </section>

      {/* 4. Report Issue Section */}
      <section id="report-issue-section" className="py-12 md:py-20">
        <ReportIssueForm isDayTheme={isDayTheme} isLoggedIn={isLoggedIn} />
      </section>

      {/* 5. Contact Section */}
      <section id="contact-section" className="py-12 md:py-20">
        <ContactContent isDayTheme={isDayTheme} />
      </section>
    </>
  );
};

export default HomeSection;