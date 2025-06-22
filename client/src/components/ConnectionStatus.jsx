import { useState, useEffect } from 'react';
import { apiService } from '../services/api.js';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);

  const checkConnection = async () => {
    try {
      const isConnected = await apiService.testConnection();
      setStatus(isConnected ? 'connected' : 'disconnected');
      setLastChecked(new Date());
    } catch (error) {
      setStatus('disconnected');
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      case 'checking':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Backend Connected';
      case 'disconnected':
        return 'Backend Disconnected';
      case 'checking':
        return 'Checking Connection...';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-3 border">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
          <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
          <button
            onClick={checkConnection}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Refresh
          </button>
        </div>
        {lastChecked && (
          <p className="text-xs text-gray-500 mt-1">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus; 