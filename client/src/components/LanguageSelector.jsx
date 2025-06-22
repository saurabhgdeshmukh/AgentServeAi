import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.js';

const LanguageSelector = ({ selectedLanguage, onLanguageChange, className = '' }) => {
  const [languages, setLanguages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSupportedLanguages();
      if (response.success) {
        setLanguages(response.languages);
      } else {
        setError('Failed to load languages');
      }
    } catch (error) {
      console.error('Error loading languages:', error);
      setError('Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    onLanguageChange(newLanguage);
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading languages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-sm text-red-600 ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
        Language:
      </label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={handleLanguageChange}
        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        {Object.entries(languages).map(([code, name]) => (
          <option key={code} value={code}>
            {name} ({code.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector; 