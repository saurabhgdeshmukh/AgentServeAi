const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://c41a-44-212-68-56.ngrok-free.app';

// Generate a unique session ID for this browser session
const generateSessionId = () => {
  if (!localStorage.getItem('sessionId')) {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }
  return localStorage.getItem('sessionId');
};

export const apiService = {
  // Support Agent API with multilingual support and memory
  async sendSupportQuery(query, preferredLanguage = 'en', sessionId = null) {
    try {
      const session = sessionId || generateSessionId();
      const response = await fetch(`${API_BASE_URL}/api/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, preferredLanguage, sessionId: session })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Support API Error:', error);
      throw error;
    }
  },

  // Dashboard Agent API with multilingual support and memory
  async sendDashboardQuery(query, preferredLanguage = 'en', sessionId = null) {
    try {
      const session = sessionId || generateSessionId();
      const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, preferredLanguage, sessionId: session })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Dashboard API Error:', error);
      throw error;
    }
  },

  // Get supported languages
  async getSupportedLanguages() {
    try {
      const url = `${API_BASE_URL}/api/languages`;
      console.log('Languages API URL:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      console.log('Languages API Response:', response); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseText = await response.text();
      console.log('Languages API Response Text:', responseText);
      const data = JSON.parse(responseText);
      // console.log(data)
      return data;
    } catch (error) {
      console.error('Languages API Error:', error);
      throw error;
    }
  },

  // Detect language of text
  async detectLanguage(text) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/detect-language`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Language Detection API Error:', error);
      throw error;
    }
  },

  // Memory management APIs
  async getMemoryStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/memory/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Memory Stats API Error:', error);
      throw error;
    }
  },

  // Get memory context for a specific session and agent type
  async getMemoryContext(sessionId, agentType) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/memory/context/${sessionId}/${agentType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Memory Context API Error:', error);
      throw error;
    }
  },

  // Clear memory for all sessions
  async clearMemory() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/memory/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Clear Memory API Error:', error);
      throw error;
    }
  },

  // Get current session ID
  getCurrentSessionId() {
    return generateSessionId();
  },

  // Clear session ID
  clearSessionId() {
    localStorage.removeItem('sessionId');
  },

  // Test connection
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Get dashboard metrics
  async getMetrics() {
    try {
      const url = `${API_BASE_URL}/api/metrics`;
      console.log('Metrics API URL:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseText = await response.text();
      console.log('Metrics API Response Text:', responseText);
      const data = JSON.parse(responseText);
      return data;
    } catch (error) {
      console.error('Metrics API Error:', error);
      throw error;
    }
  }
}; 
