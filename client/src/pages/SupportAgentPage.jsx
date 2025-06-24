import { useState, useRef } from 'react';
import ChatBox from '../components/ChatBox';
import Icon from '../components/Icon';
import LanguageSelector from '../components/LanguageSelector';

const SupportAgentPage = () => {
  const chatBoxRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const quickActions = [
    {
      title: 'Find Client',
      description: 'Search for customer information',
      icon: '👤',
      query: 'Find a client with email john@example.com'
    },
    {
      title: 'Check Orders',
      description: 'View order status and details',
      icon: '📦',
      query: 'Show me all orders for client ID 12345'
    },
    {
      title: 'Payment Info',
      description: 'Check payment status',
      icon: '💳',
      query: 'Get payment information for order 12345'
    }
  ];

  const handleQuickAction = (query) => {
    // This will be handled by the ChatBox component
    // We'll need to pass this through a callback
    console.log('Quick action triggered:', query);
  };

  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen bg-[#d4f1fc]">
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Agent</h1>
              <p className="text-gray-600">
                Get instant help with customer queries, orders, payments, and account management.
              </p>
            </div>
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              className="mt-2"
            />
          </div>
        </div>
        
        <div className="h-[600px]">
          <ChatBox agentType="support" selectedLanguage={selectedLanguage} />
        </div>
        

        {/* Sample Queries */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Try these sample queries:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-800">"What classes are available this week?"</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-800">"Has order #12345 been paid?"</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-800">"Create an order for Yoga Beginner for client Priya Sharma"</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-800">"Find client with email john@example.com"</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-800">"Show me all courses available"</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-800">"List all classes for course ID 123"</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-800">"Get payment details for order 12345"</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-800">"Create a new client with name 'Jane Doe' and email 'jane@example.com'"</p>
            </div>
          </div>
          
          {/* Multilingual Examples */}
          <div className="mt-6 pt-6 border-t border-blue-200">
            <h4 className="text-md font-semibold text-blue-900 mb-3">🌍 Multilingual Examples:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-green-800">🇪🇸 "¿Qué clases están disponibles esta semana?"</p>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-green-800">🇫🇷 "Afficher tous les cours disponibles"</p>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-green-800">🇩🇪 "Zeige mir alle Bestellungen für Kunde 12345"</p>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-green-800">🇯🇵 "注文番号12345の支払い状況を確認してください"</p>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-green-800">🇨🇳 "查找邮箱为john@example.com的客户"</p>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-green-800">🇰🇷 "고객 ID 12345의 모든 주문을 보여주세요"</p>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-green-800">🇮🇳 "इस सप्ताह कौन सी कक्षाएं उपलब्ध हैं?"</p>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-green-800">🇮🇳 "கடந்த வாரம் என்ன வகுப்புகள் கிடைக்கின்றன?"</p>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-green-800">🇮🇳 "এই সপ্তাহে কোন ক্লাসগুলি উপলব্ধ?"</p>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-green-800">🇮🇳 "इस हफ्ते कौन सी क्लासेस उपलब्ध हैं?"</p>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-green-800">🇮🇳 "ഈ ആഴ്ചയിൽ ഏത് ക്ലാസുകൾ ലഭ്യമാണ്?"</p>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-green-800">🇮🇳 "இந்த வாரம் என்ன வகுப்புகள் கிடைக்கின்றன?"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportAgentPage; 