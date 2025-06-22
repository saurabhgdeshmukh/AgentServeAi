import { useState, useEffect, useRef } from 'react';
import ChatBox from '../components/ChatBox';
import MetricCard from '../components/MetricCard';
import Icon from '../components/Icon';
import { apiService } from '../services/api.js';
import LanguageSelector from '../components/LanguageSelector';

const DashboardAgentPage = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: '$0',
    activeClients: '0',
    totalOrders: '0',
    avgOrderValue: '$0'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [seedStatus, setSeedStatus] = useState('');
  const chatBoxRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const quickActions = [
    {
      title: 'Revenue Overview',
      description: 'Get total revenue and monthly trends',
      icon: '💰',
      query: 'Show me total revenue and monthly revenue trends'
    },
    {
      title: 'Client Analytics',
      description: 'View client statistics and insights',
      icon: '👥',
      query: 'Give me client analytics including active and inactive clients'
    },
    {
      title: 'Payment Status',
      description: 'Check outstanding payments',
      icon: '📊',
      query: 'Show me outstanding payments and payment status'
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

  const fetchRealMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real metrics from the backend
      const revenueData = await apiService.sendDashboardQuery('What is the total revenue?');
      const activeClientsData = await apiService.sendDashboardQuery('How many active clients do we have?');
      const totalOrdersData = await apiService.sendDashboardQuery('How many total orders do we have?');
      const outstandingPaymentsData = await apiService.sendDashboardQuery('What are the outstanding payments?');

      // Parse the responses and update metrics
      setMetrics({
        totalRevenue: revenueData.result ? `$${parseFloat(revenueData.result.match(/\d+/)?.[0] || 0).toLocaleString()}` : '$0',
        activeClients: activeClientsData.result ? activeClientsData.result.match(/\d+/)?.[0] || '0' : '0',
        totalOrders: totalOrdersData.result ? totalOrdersData.result.match(/\d+/)?.[0] || '0' : '0',
        avgOrderValue: outstandingPaymentsData.result ? `$${parseFloat(outstandingPaymentsData.result.match(/\d+/)?.[0] || 0).toLocaleString()}` : '$0'
      });
    } catch (error) {
      console.error('Error fetching real metrics:', error);
      // Keep default values if there's an error
    } finally {
      setIsLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      setSeedStatus('Seeding...');
      const response = await fetch('http://localhost:4000/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSeedStatus('Database seeded successfully!');
        // Refresh metrics after seeding
        setTimeout(() => {
          fetchRealMetrics();
          setSeedStatus('');
        }, 2000);
      } else {
        setSeedStatus('Failed to seed database');
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      setSeedStatus('Error seeding database');
    }
  };

  useEffect(() => {
    fetchRealMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-[#d4f1fc]">
      <div className="max-w-7xl mx-auto p-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Agent</h1>
              <p className="text-gray-600">
                Get real-time analytics, revenue insights, and business intelligence.
              </p>
            </div>
            <button
              onClick={seedDatabase}
              disabled={seedStatus === 'Seeding...'}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {seedStatus === 'Seeding...' ? 'Seeding...' : 'Seed Database'}
            </button>
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              className="mt-2"
            />
          </div>
          {seedStatus && seedStatus !== 'Seeding...' && (
            <div className={`mt-2 p-2 rounded text-sm ${seedStatus.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {seedStatus}
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={metrics.totalRevenue}
            change="+12.5%"
            icon="💰"
            color="green"
          />
          <MetricCard
            title="Active Clients"
            value={metrics.activeClients}
            change="+8.2%"
            icon="👥"
            color="blue"
          />
          <MetricCard
            title="Total Orders"
            value={metrics.totalOrders}
            change="+15.3%"
            icon="📦"
            color="purple"
          />
          <MetricCard
            title="Outstanding Payments"
            value={metrics.avgOrderValue}
            change="+5.7%"
            icon="📊"
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="h-[600px]">
              <ChatBox agentType="dashboard" selectedLanguage={selectedLanguage} />
            </div>
          </div>

          {/* Quick Analytics */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Analytics</h3>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <button 
                    key={index}
                    onClick={() => handleQuickAction(action.query)}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="mb-2">
                      <Icon src={action.icon} alt={action.title} className="w-8 h-8" />
                    </div>
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                    <div className="mt-2 text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to ask: "{action.query}"
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sample Queries */}
            <div className="mt-8 bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">💡 Try these sample queries:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-800">"What is our total revenue?"</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-800">"Show me monthly revenue trends"</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-800">"How many active clients do we have?"</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-800">"What are our top performing services?"</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-800">"Show me outstanding payments"</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-800">"What is the course completion rate?"</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-800">"Give me attendance reports"</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-800">"Show me birthday reminders for this month"</p>
                </div>
              </div>
              
              {/* Memory Examples */}
              <div className="mt-6 pt-6 border-t border-green-200">
                <h4 className="text-md font-semibold text-green-900 mb-3">🧠 Memory Context Examples:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <p className="text-sm text-purple-800">1. "What is our total revenue?"</p>
                    <p className="text-xs text-purple-600 mt-1">Then ask: "Compare with last month"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <p className="text-sm text-purple-800">2. "Show me active clients"</p>
                    <p className="text-xs text-purple-600 mt-1">Then ask: "How many are new this month?"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <p className="text-sm text-purple-800">3. "Get top services"</p>
                    <p className="text-xs text-purple-600 mt-1">Then ask: "What's the revenue for each?"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <p className="text-sm text-purple-800">4. "Show outstanding payments"</p>
                    <p className="text-xs text-purple-600 mt-1">Then ask: "Which clients owe the most?"</p>
                  </div>
                </div>
              </div>

              {/* Multilingual Examples */}
              <div className="mt-6 pt-6 border-t border-green-200">
                <h4 className="text-md font-semibold text-green-900 mb-3">🌍 Multilingual Examples:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">🇪🇸 "¿Cuál es nuestro ingreso total?"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">🇫🇷 "Montrez-moi les tendances de revenus mensuels"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">🇩🇪 "Wie viele aktive Kunden haben wir?"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">🇯🇵 "支払い待ちの金額を教えてください"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">🇨🇳 "显示我们的顶级服务"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">🇰🇷 "이번 달 생일 알림을 보여주세요"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">🇮🇳 "हमारा कुल राजस्व क्या है?"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">🇮🇳 "எங்கள் மொத்த வருவாய் என்ன?"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">🇮🇳 "আমাদের মোট আয় কত?"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">🇮🇳 "हमारे कितने सक्रिय ग्राहक हैं?"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">��🇳 "ഞങ്ങളുടെ മൊത്തം വരുമാനം എന്താണ്?"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">🇮🇳 "இந்த மாதத்திற்கான பிறந்தநாள் நினைவூட்டல்களைக் காட்டுங்கள்"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New order received</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment processed</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New client registered</p>
                    <p className="text-xs text-gray-500">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAgentPage; 