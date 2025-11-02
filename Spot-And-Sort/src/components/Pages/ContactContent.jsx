// src/components/Pages/ContactContent.jsx
import React from 'react';
import Button from '../Common/Button';

const ContactContent = ({ isDayTheme }) => {
  const cardClasses = isDayTheme ? 'bg-gray-100 shadow-xl' : 'bg-gray-800 shadow-2xl';
  const inputClasses = isDayTheme ?
    "bg-white border-gray-300 text-gray-900 placeholder-gray-500" :
    "bg-gray-700 border-gray-600 text-white placeholder-gray-400";
  const accentTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';
  const textClass = isDayTheme ? 'text-gray-700' : 'text-gray-300';

  return (
    <div className={`rounded-3xl p-8 md:p-16 text-center transition-colors duration-300 ${cardClasses}`}>
      <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${accentTextClass}`}>Get in Touch</h2>
      <p className={`text-lg md:text-xl mb-12 max-w-2xl mx-auto ${textClass}`}>
        Ready to transform your city? Contact us to learn how our solutions can be tailored to your needs.
      </p>
      <form className="max-w-lg mx-auto">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Your Name"
            className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}
          />
        </div>
        <div className="mb-6">
          <input
            type="email"
            placeholder="Your Email"
            className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}
          />
        </div>
        <div className="mb-6">
          <textarea
            placeholder="Your Message"
            rows="4"
            className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}
          ></textarea>
        </div>
        <Button className="bg-teal-500 hover:bg-teal-600 text-white w-full">Send Message</Button>
      </form>
    </div>
  );
};

export default ContactContent;