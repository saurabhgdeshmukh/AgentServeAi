import Loader from './Loader';

const MessageList = ({ messages, isLoading }) => {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-lg font-medium">Start a conversation</p>
          <p className="text-sm">Ask me anything and I'll help you out!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white'
                : message.isError
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <div className="text-sm">{message.text}</div>
            
            {/* Multilingual Info for Agent Messages */}
            {message.sender === 'agent' && message.multilingualInfo && (
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <div className="text-xs text-blue-700 space-y-1">
                  {message.multilingualInfo.detectedLanguage !== 'en' && (
                    <div>
                      <span className="font-medium">🌍 Detected:</span> {message.multilingualInfo.detectedLanguage.toUpperCase()}
                    </div>
                  )}
                  {message.multilingualInfo.responseLanguage !== 'en' && (
                    <div>
                      <span className="font-medium">💬 Response:</span> {message.multilingualInfo.responseLanguage.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div
              className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}
            >
              {message.timestamp}
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
            <Loader />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList; 