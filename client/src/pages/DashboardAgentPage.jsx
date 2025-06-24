import { useState, useEffect, useRef } from "react";
import ChatBox from "../components/ChatBox";
import MetricCard from "../components/MetricCard";
import Icon from "../components/Icon";
import { apiService } from "../services/api.js";
import LanguageSelector from "../components/LanguageSelector";
import { Link } from "react-router-dom";

const DashboardAgentPage = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: "$0",
    outstandingPayments: "$0",
    activeClients: "0",
    totalOrders: "0",
    topServices: [],
    attendance: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const chatBoxRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [chatBoxKey, setChatBoxKey] = useState(0); // Add key to force re-render

  const quickActions = [
    {
      title: "Revenue Overview",
      description: "Get total revenue and monthly trends",
      icon: "💰",
      query: "Show me total revenue and monthly revenue trends",
    },
    {
      title: "Client Analytics",
      description: "View client statistics and insights",
      icon: "👥",
      query: "Give me client analytics including active and inactive clients",
    },
    {
      title: "Payment Status",
      description: "Check outstanding payments",
      icon: "📊",
      query: "Show me outstanding payments and payment status",
    },
  ];

  const handleQuickAction = (query) => {
    setChatBoxKey((prev) => prev + 1);
    if (chatBoxRef.current) {
      chatBoxRef.current.sendMessage(query);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
  };

  const fetchRealMetrics = async () => {
    try {
      setIsLoading(true);
      const metricsData = await apiService.getMetrics();
      if (metricsData && metricsData.success) {
        const newMetrics = {
          totalRevenue: `$${metricsData.totalRevenue.toLocaleString()}`,
          outstandingPayments: `$${metricsData.outstandingPayments.toLocaleString()}`,
          activeClients: metricsData.activeClients.toString(),
          totalOrders: metricsData.totalOrders.toString(),
          avgOrderValue: `$${metricsData.avgOrderValue.toLocaleString()}`,
          newClientsThisMonth: metricsData.newClientsThisMonth.toString(),
          topServices: metricsData.topServices || [],
          attendance: metricsData.attendance || [],
        };
        setMetrics(newMetrics);
        setLastUpdated(new Date().toLocaleString());
      } else {
        setMetrics({
          totalRevenue: "$0",
          outstandingPayments: "$0",
          activeClients: "0",
          totalOrders: "0",
          avgOrderValue: "$0",
          newClientsThisMonth: "0",
          topServices: [],
          attendance: [],
        });
      }
    } catch (error) {
      setMetrics({
        totalRevenue: "$0",
        outstandingPayments: "$0",
        activeClients: "0",
        totalOrders: "0",
        avgOrderValue: "$0",
        newClientsThisMonth: "0",
        topServices: [],
        attendance: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-[#d4f1fc]">
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Dashboard Agent
                </h1>
                <p className="text-gray-600">
                  Get real-time analytics, revenue insights, and business
                  intelligence.
                </p>
              </div>
            </div>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              className="mt-2"
            />
          </div>
        </div>

        

        {lastUpdated && (
          <div className="text-center text-sm text-gray-500 mb-6">
            Last updated: {lastUpdated} | 📊 Data from MongoDB Database
          </div>
        )}

        <div className="h-[600px]">
          <ChatBox
            key={chatBoxKey}
            ref={chatBoxRef}
            agentType="dashboard"
            selectedLanguage={selectedLanguage}
          />
        </div>
        <div className="grid mt-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={metrics.totalRevenue}
            icon="💰"
            color="green"
          />
          <MetricCard
            title="Outstanding Payments"
            value={metrics.outstandingPayments}
            icon="📊"
            color="orange"
          />
          <MetricCard
            title="Active Clients"
            value={metrics.activeClients}
            icon="👥"
            color="blue"
          />
          <MetricCard
            title="Total Orders"
            value={metrics.totalOrders}
            icon="📦"
            color="purple"
          />
        </div>
        {/* Sample Queries */}
        <div className="mt-8 bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            💡 Try these sample queries:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-sm text-green-800">
                "What is our total revenue?"
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-sm text-green-800">
                "Show me monthly revenue trends"
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-sm text-green-800">
                "How many active clients do we have?"
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-sm text-green-800">
                "What are our top performing services?"
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-sm text-green-800">
                "Show me outstanding payments"
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-sm text-green-800">
                "What is the course completion rate?"
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-sm text-green-800">
                "Give me attendance reports"
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-sm text-green-800">
                "Show me birthday reminders for this month"
              </p>
            </div>
          </div>

          {/* Multilingual Examples */}
          <div className="mt-6 pt-6 border-t border-green-200">
            <h4 className="text-md font-semibold text-green-900 mb-3">
              🌍 Multilingual Examples:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  🇪🇸 "¿Cuál es nuestro ingreso total?"
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  🇫🇷 "Montrez-moi les tendances de revenus mensuels"
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  🇩🇪 "Wie viele aktive Kunden haben wir?"
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  🇯🇵 "支払い未払いの状況を確認してください"
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800">🇨🇳 "显示我们的总收入"</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  🇰🇷 "총 수익을 보여주세요"
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  🇮🇳 "हमारा कुल राजस्व क्या है?"
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  🇮🇳 "எங்கள் மொத்த வருவாய் என்ன?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAgentPage;
