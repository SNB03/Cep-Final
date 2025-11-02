// src/components/Common/Navbar.jsx
import React from 'react';
import Button from './Button';
import { SunIcon, MoonIcon } from './ThemeIcons';

const Navbar = ({ isLoggedIn, activeSection, navItems, onLogout, onNavClick, onStandaloneClick, isDayTheme, onThemeToggle }) => {
  const visibleNavItems = navItems;

  const navBgClass = isDayTheme
    ? "bg-white bg-opacity-90 text-gray-900"
    : "bg-gray-900 bg-opacity-90 text-white";

  const accentTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-md shadow-md transition-colors duration-300 ${navBgClass}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className={`text-2xl font-bold cursor-pointer ${accentTextClass}`} onClick={() => onNavClick('home', 'hero-section')}>
          Spot & Sort
        </div>
        <div className="hidden md:flex space-x-6 items-center ml-8">
          {/* THEME TOGGLE BUTTON */}
          <button
            onClick={onThemeToggle}
            className={`p-2 rounded-full transition-colors ${
              isDayTheme
                ? 'bg-gray-200 text-yellow-600 hover:bg-gray-300'
                : 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
            }`}
            aria-label={isDayTheme ? "Switch to Night Mode" : "Switch to Day Mode"}
          >
            {isDayTheme ? (
              <SunIcon className="w-5 h-5 fill-current" />
            ) : (
              <MoonIcon className="w-5 h-5 fill-current" />
            )}
          </button>
          {/* END THEME TOGGLE BUTTON */}

          {visibleNavItems.map((item) => {
            const isActive = activeSection === item.section;

            return (
              <a
                key={item.section}
                onClick={() => onNavClick(item.section, item.id)}
                className={`cursor-pointer transition-colors ${isDayTheme ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:text-teal-400'} ${
                  isActive ? (isDayTheme ? 'text-teal-600 font-bold' : 'text-teal-400 font-bold') : ''}`}
              >
                {item.name}
              </a>
            );
          })}
          {!isLoggedIn && (
            <>
              <Button onClick={() => onStandaloneClick('login')} className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-6">Login</Button>
              <Button onClick={() => onStandaloneClick('signup')} className={`bg-transparent border-2 ${isDayTheme ? 'border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white' : 'border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white'} py-2 px-6`}>Sign Up</Button>
            </>
          )}
          {isLoggedIn && (
            <Button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white py-2 px-6">Logout</Button>
          )}
        </div>
        <div className="md:hidden">
          {/* Mobile menu icon, simplified for a single-file demo */}
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDayTheme ? 'text-gray-900' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </div>
        <style>{`
          body { font-family: 'Inter', sans-serif; }
        `}</style>
      </div>
    </nav>
  );
};

export default Navbar;