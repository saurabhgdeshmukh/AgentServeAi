import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { Payment, Client, Order, Course, Class } from '../models/models.js';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../utils/multilingual.js';
import { generateContextPrompt, memoryManager } from '../utils/memory.js';

const MongoAnalyticsTool = {
  name: 'MongoAnalyticsTool',
  description: 'MongoDB aggregation for comprehensive analytics and business metrics. Use this tool to get revenue data, client insights, service analytics, and attendance reports. Input should be a JSON string with queryType field. Valid queryTypes: "revenue", "inactiveClients", "activeClients", "newClientsThisMonth", "outstandingPayments", "enrollmentTrends", "topServices", "courseCompletionRates", "attendanceReports", "birthdayReminders", "monthlyRevenue", "clientStatusCount".',
  func: async (input) => {
    try {
      console.log('MongoAnalyticsTool called with input:', input);
      
      let parsedInput;
      
      // Handle both string and object inputs
      if (typeof input === 'string') {
        parsedInput = JSON.parse(input);
      } else {
        parsedInput = input;
      }
      
      console.log('Parsed input:', parsedInput);
      const { queryType, data = {} } = parsedInput;
      
      if (!queryType) {
        console.log('Missing queryType, returning error');
        return JSON.stringify({ 
          error: 'Missing queryType parameter',
          availableTypes: ['revenue', 'inactiveClients', 'activeClients', 'newClientsThisMonth', 'outstandingPayments', 'enrollmentTrends', 'topServices', 'courseCompletionRates', 'attendanceReports', 'birthdayReminders', 'monthlyRevenue', 'clientStatusCount'],
          example: { queryType: 'revenue' }
        });
      }

      console.log('Executing queryType:', queryType);

      switch (queryType) {
        case 'revenue': {
          console.log('Executing revenue aggregation...');
          const result = await Payment.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]);
          console.log('Revenue aggregation result:', result);
          const response = { 
            success: true,
            revenue: result[0]?.total || 0,
            currency: 'USD'
          };
          console.log('Returning revenue response:', response);
          return JSON.stringify(response);
        }
        case 'monthlyRevenue': {
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const result = await Payment.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(currentYear, currentMonth, 1),
                  $lt: new Date(currentYear, currentMonth + 1, 1)
                }
              }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ]);
          return JSON.stringify({
            success: true,
            monthlyRevenue: result[0]?.total || 0,
            month: currentMonth + 1,
            year: currentYear,
            currency: 'USD'
          });
        }
        case 'inactiveClients': {
          console.log('Executing inactive clients query...');
          const clients = await Client.find({ status: 'inactive' });
          console.log('Inactive clients result:', clients);
          const response = { 
            success: true,
            inactiveClients: clients,
            count: clients.length
          };
          console.log('Returning inactive clients response:', response);
          return JSON.stringify(response);
        }
        case 'activeClients': {
          const clients = await Client.find({ status: 'active' });
          return JSON.stringify({
            success: true,
            activeClients: clients,
            count: clients.length
          });
        }
        case 'newClientsThisMonth': {
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const clients = await Client.find({
            createdAt: {
              $gte: new Date(currentYear, currentMonth, 1),
              $lt: new Date(currentYear, currentMonth + 1, 1)
            }
          });
          return JSON.stringify({
            success: true,
            newClients: clients,
            count: clients.length,
            month: currentMonth + 1,
            year: currentYear
          });
        }
        case 'outstandingPayments': {
          const outstandingPayments = await Payment.find({ status: 'pending' });
          const totalOutstanding = outstandingPayments.reduce((sum, payment) => sum + payment.amount, 0);
          return JSON.stringify({
            success: true,
            outstandingPayments: outstandingPayments,
            count: outstandingPayments.length,
            totalAmount: totalOutstanding,
            currency: 'USD'
          });
        }
        case 'enrollmentTrends': {
          const enrollments = await Order.aggregate([
            {
              $group: {
                _id: { $month: '$createdAt' },
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
              }
            },
            { $sort: { '_id': 1 } }
          ]);
          return JSON.stringify({
            success: true,
            enrollmentTrends: enrollments
          });
        }
        case 'topServices': {
          const topServices = await Order.aggregate([
            {
              $group: {
                _id: '$courseId',
                enrollmentCount: { $sum: 1 },
                totalRevenue: { $sum: '$amount' }
              }
            },
            { $sort: { enrollmentCount: -1 } },
            { $limit: 5 }
          ]);
          return JSON.stringify({
            success: true,
            topServices: topServices
          });
        }
        case 'courseCompletionRates': {
          const totalEnrollments = await Order.countDocuments();
          const completedOrders = await Order.countDocuments({ status: 'completed' });
          const completionRate = totalEnrollments > 0 ? (completedOrders / totalEnrollments) * 100 : 0;
          return JSON.stringify({
            success: true,
            totalEnrollments,
            completedOrders,
            completionRate: completionRate.toFixed(2) + '%'
          });
        }
        case 'attendanceReports': {
          const attendanceData = await Class.aggregate([
            {
              $group: {
                _id: '$courseId',
                totalClasses: { $sum: 1 },
                averageAttendance: { $avg: '$attendance' }
              }
            }
          ]);
          return JSON.stringify({
            success: true,
            attendanceReports: attendanceData
          });
        }
        case 'birthdayReminders': {
          const currentMonth = new Date().getMonth() + 1;
          const clients = await Client.find({
            $expr: {
              $eq: [{ $month: '$dateOfBirth' }, currentMonth]
            }
          });
          return JSON.stringify({
            success: true,
            birthdayReminders: clients,
            count: clients.length,
            month: currentMonth
          });
        }
        case 'clientStatusCount': {
          const statusCounts = await Client.aggregate([
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ]);
          return JSON.stringify({
            success: true,
            clientStatusCounts: statusCounts
          });
        }
        default:
          console.log('Unknown queryType:', queryType);
          return JSON.stringify({ 
            error: 'Unknown analytics query',
            availableTypes: ['revenue', 'inactiveClients', 'activeClients', 'newClientsThisMonth', 'outstandingPayments', 'enrollmentTrends', 'topServices', 'courseCompletionRates', 'attendanceReports', 'birthdayReminders', 'monthlyRevenue', 'clientStatusCount'],
            receivedType: queryType
          });
      }
    } catch (error) {
      console.error('MongoAnalyticsTool error:', error);
      return JSON.stringify({ 
        error: 'Analytics operation failed', 
        details: error.message,
        availableTypes: ['revenue', 'inactiveClients', 'activeClients', 'newClientsThisMonth', 'outstandingPayments', 'enrollmentTrends', 'topServices', 'courseCompletionRates', 'attendanceReports', 'birthdayReminders', 'monthlyRevenue', 'clientStatusCount']
      });
    }
  },
};

// Initialize agent asynchronously
export const initializeDashboardAgent = async (apiKey = null) => {
  try {
    // Use provided API key or fall back to environment variable
    const googleApiKey = apiKey || process.env.GOOGLE_API_KEY;
    
    if (!googleApiKey) {
      throw new Error('Google API key is required. Please provide it as a parameter or set GOOGLE_API_KEY environment variable.');
    }

    const llm = new ChatGoogleGenerativeAI({ 
      temperature: 0,
      model: "gemini-2.0-flash",
      apiKey: googleApiKey
    });

    return await initializeAgentExecutorWithOptions(
      [MongoAnalyticsTool],
      llm,
      {
        agentType: 'zero-shot-react-description',
        verbose: true,
        maxIterations: 10,
        earlyStoppingMethod: "generate",
        prefix: `You are a multilingual dashboard analytics agent for AgentServe.Ai, providing comprehensive business insights and metrics.

IMPORTANT MULTILINGUAL INSTRUCTIONS:
- You can understand and respond in multiple languages: ${Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => `${name} (${code})`).join(', ')}
- Special support for Indian languages: Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and Urdu
- If a user asks in a non-English language, respond in the same language
- Always provide clear, actionable insights with proper formatting
- Use the available tools to access real analytics data from the database
- Present data in a user-friendly format with appropriate units and context

MEMORY AND CONTEXT INSTRUCTIONS:
- You have access to conversation memory and context
- Use the provided context to understand what metrics the user has been asking about
- Remember previous analytics requests and provide comparative insights
- Build upon previous conversations to provide deeper analysis
- Use context to suggest related metrics and insights

SUPPORTED LANGUAGES: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}

Your capabilities include:
1. Revenue Analytics: Total revenue, monthly revenue, revenue trends
2. Client Analytics: Active/inactive clients, new clients, client status distribution
3. Payment Analytics: Outstanding payments, payment processing, payment trends
4. Service Analytics: Top services, enrollment trends, course completion rates
5. Attendance Analytics: Class attendance, attendance reports, attendance trends
6. Business Insights: Birthday reminders, business metrics, performance indicators
7. Multilingual Support: Provide analytics in the user's preferred language, including Indian languages
8. Context Awareness: Remember previous analytics requests and provide comparative insights

Available tools:
- MongoAnalyticsTool: Access comprehensive analytics and business metrics from the database

Always respond in the same language as the user's query, unless they specifically request a different language. Format numbers and currency appropriately for the target language. Use the provided context to give more relevant and comparative insights.`
      }
    );
  } catch (error) {
    console.error('Error initializing dashboard agent:', error);
    throw error;
  }
};

// Enhanced dashboard agent with memory
export const getDashboardAgentWithMemory = async (sessionId, apiKey = null) => {
  const agent = await initializeDashboardAgent(apiKey);
  
  return {
    ...agent,
    run: async (query, contextData = {}) => {
      try {
        // Generate context-aware prompt
        const contextPrompt = await generateContextPrompt(sessionId, 'dashboard', query);
        
        // Add context to the query
        const enhancedQuery = contextPrompt ? `${contextPrompt}\n\nUSER QUERY: ${query}` : query;
        
        // Run the agent with enhanced context
        const result = await agent.run(enhancedQuery);
        
        // Store the interaction in memory
        memoryManager.addMessage(sessionId, 'dashboard', {
          sender: 'user',
          text: query,
          contextData
        });
        
        memoryManager.addMessage(sessionId, 'dashboard', {
          sender: 'agent',
          text: typeof result === 'string' ? result : result.output || result.result || JSON.stringify(result)
        });
        
        return result;
      } catch (error) {
        console.error('Dashboard agent with memory error:', error);
        throw error;
      }
    }
  };
};

// Export a function to get the agent instance
let dashboardAgentInstance = null;
export const getDashboardAgent = async (apiKey = null) => {
  if (!dashboardAgentInstance) {
    dashboardAgentInstance = await initializeDashboardAgent(apiKey);
  }
  return dashboardAgentInstance;
};