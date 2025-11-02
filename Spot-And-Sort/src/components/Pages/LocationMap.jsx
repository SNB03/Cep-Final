// src/components/Pages/LocationMap.jsx
import React, { useMemo, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  height: '300px',
  width: '100%',
  borderRadius: '12px',
};

// Main Map Component
const LocationMap = ({ location, isDayTheme }) => {
  // 🚨 IMPORTANT: REPLACE 'YOUR_GOOGLE_MAPS_API_KEY' with your actual API key
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY', 
    libraries,
  });

  // Center position derived from props
  const center = useMemo(() => ({ 
    lat: location.lat || 0, 
    lng: location.lng || 0 
  }), [location.lat, location.lng]);

  const mapOptions = useMemo(() => ({
    // Use the theme to set the map style
    styles: isDayTheme ? [] : [
      // Basic dark theme configuration
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }],
      },
      // ... Add more dark styles if desired ...
    ],
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  }), [isDayTheme]);


  if (loadError) {
    return <div style={mapContainerStyle}>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div style={mapContainerStyle} className="flex items-center justify-center bg-gray-300 dark:bg-gray-700">Loading Map...</div>;
  }

  // Check if coordinates are valid
  const isValidLocation = location.lat && location.lng;

  if (!isValidLocation) {
    return (
      <div style={mapContainerStyle} className="flex items-center justify-center bg-gray-300 dark:bg-gray-700">
        <p className={isDayTheme ? 'text-gray-700' : 'text-gray-300'}>
          Fetching location... (Enable location services)
        </p>
      </div>
    );
  }

  return (
    <div style={mapContainerStyle}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={center}
        options={mapOptions}
      >
        {/* Marker is only shown when a valid location exists */}
        {isValidLocation && <Marker position={center} />}
      </GoogleMap>
    </div>
  );
};

export default LocationMap;