import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.js';
import Icon from './Icon';

const MemoryContext = ({ agentType, sessionId, className = '' }) => {
  const [context, setContext] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      loadContext();
      loadStats();
    }
  }, [isExpanded, sessionId, agentType]);

  const loadContext = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMemoryContext(sessionId, agentType);
      if (response.success) {
        setContext(response.context);
      } else {
        setError('Failed to load context');
      }
    } catch (error) {
      console.error('Error loading context:', error);
      setError('Failed to load context');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getMemoryStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleClearMemory = async () => {
    try {
      const response = await apiService.clearMemory(sessionId, agentType);
      if (response.success) {
        setContext(null);
        loadStats();
      }
    } catch (error) {
      console.error('Error clearing memory:', error);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isExpanded) {
    return (
      <div className={`${className}`}>
        <button
          onClick={toggleExpanded}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Icon src="🧠" alt="Memory" className="w-4 h-4" />
          <span>Show Memory Context</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon src="🧠" alt="Memory" className="w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900">Memory Context</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearMemory}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Clear Memory
          </button>
          <button
            onClick={toggleExpanded}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Hide
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading context...</span>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      {context && (
        <div className="space-y-4">
          {/* Context Summary */}
          {context.contextSummary && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Context Summary</h4>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm text-gray-800">{context.contextSummary}</p>
              </div>
            </div>
          )}

          {/* Recent Messages */}
          {context.recentMessages && context.recentMessages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Messages</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {context.recentMessages.map((msg, index) => (
                  <div key={index} className="bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-start space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        msg.sender === 'user' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {msg.sender === 'user' ? 'User' : 'Agent'}
                      </span>
                      <p className="text-sm text-gray-800 flex-1">{msg.text}</p>
                    </div>
                    {msg.timestamp && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Info */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Session Info</h4>
            <div className="bg-white p-3 rounded border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Session ID:</span>
                  <p className="text-gray-800 font-mono">{context.sessionId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Agent Type:</span>
                  <p className="text-gray-800 capitalize">{context.agentType}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memory Stats */}
      {stats && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Memory Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-2 rounded border border-gray-200">
              <span className="text-gray-600">Active Conversations:</span>
              <p className="text-gray-800 font-semibold">{stats.activeConversations}</p>
            </div>
            <div className="bg-white p-2 rounded border border-gray-200">
              <span className="text-gray-600">Retention Hours:</span>
              <p className="text-gray-800 font-semibold">{stats.retentionHours}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryContext; 