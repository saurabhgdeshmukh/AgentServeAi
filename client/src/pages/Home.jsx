import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      title: 'Support Agent',
      description: 'Get help with customer queries, orders, and account management',
      icon: '💬',
      color: 'blue',
      link: '/support'
    },
    {
      title: 'Dashboard Agent',
      description: 'Access analytics, revenue data, and business insights',
      icon: '📊',
      color: 'purple',
      link: '/dashboard'
    }
  ];

  return (
    <div className="min-h-screen bg-[#d4f1fc] from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="text-center py-20 px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-blue-600">AgentServe.AI</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Your intelligent AI-powered assistant for customer support and business analytics. 
          Get instant help and insights with our advanced Gemini-powered agents.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/support"
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Support Agent
          </Link>
          <Link
            to="/dashboard"
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Choose Your Agent
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group block"
            >
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-6xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {feature.description}
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                  Get Started
                  <svg className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powered by Advanced AI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">Gemini 2.0</div>
              <p className="text-gray-600">Latest AI Model</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <p className="text-gray-600">Always Available</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">Instant</div>
              <p className="text-gray-600">Real-time Responses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 