import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MemoryContext from './MemoryContext';
import { apiService } from '../services/api.js';

const ChatBox = forwardRef(({ agentType = 'support', selectedLanguage = 'en' }, ref) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

 
  
  useEffect(() => {
    setSessionId(apiService.getCurrentSessionId());
  }, []);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let data;
      if (agentType === 'support') {
        data = await apiService.sendSupportQuery(message, selectedLanguage, sessionId);
      } else {
        data = await apiService.sendDashboardQuery(message, selectedLanguage, sessionId);
      }

      const agentMessage = {
        id: Date.now() + 1,
        text: data.result || 'Sorry, I could not process your request.',
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString(),
        // multilingualInfo: data.multilingualInfo // Remove or update if not present
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, there was an error connecting to the server. Please make sure the backend is running.',
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Expose sendMessage function to parent component
  useImperativeHandle(ref, () => ({
    sendMessage
  }));

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {agentType === 'support' ? 'Support Agent' : 'Dashboard Agent'}
            </h2>
            <p className="text-blue-100 text-sm">
              {agentType === 'support' 
                ? 'Ask me anything about clients, orders, and services' 
                : 'Get analytics, revenue data, and insights'
              }
            </p>
          </div>
        </div>
      </div>


      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
});

ChatBox.displayName = 'ChatBox';

export default ChatBox; 