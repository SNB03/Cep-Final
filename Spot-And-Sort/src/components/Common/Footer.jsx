// src/components/Common/Footer.jsx
import React from 'react';

const Footer = ({ isDayTheme }) => (
  <footer className={`py-8 border-t transition-colors duration-300 ${isDayTheme ? 'bg-gray-100 border-gray-300' : 'bg-gray-900 border-gray-800'}`}>
    <div className="container mx-auto px-4 text-center text-gray-400">
      <p>&copy; 2024 Spot & Sort. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;