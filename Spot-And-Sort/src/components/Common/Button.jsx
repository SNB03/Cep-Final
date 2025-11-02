// src/components/Common/Button.jsx
import React from 'react';

const Button = ({ children, onClick, className = '', type = 'button', disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-block px-8 py-3 rounded-full font-bold transition-transform transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100 ${className}`}
  >
    {children}
  </button>
);

export default Button;