import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { Client, Order, Payment, Course, Class } from '../models/models.js';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../utils/multilingual.js';
import { generateContextPrompt, memoryManager } from '../utils/memory.js';

const MongoDBTool = {
  name: 'MongoDBTool',
  description: 'Access MongoDB collections for support queries. Use this tool to query clients, orders, payments, courses, and classes. Input should be a JSON string with queryType and data fields. Valid queryTypes: "findClient", "getOrder", "getPayments", "listCourses", "listClasses", "getClientOrders", "getOrderPayments", "getUpcomingClasses", "getCourseDetails".',
  func: async (input) => {
    try {
      let parsedInput;
      
      // Handle both string and object inputs
      if (typeof input === 'string') {
        parsedInput = JSON.parse(input);
      } else {
        parsedInput = input;
      }
      
      const { queryType, data } = parsedInput;
      
      if (!queryType || !data) {
        return JSON.stringify({ 
          error: 'Missing queryType or data parameter',
          availableTypes: ['findClient', 'getOrder', 'getPayments', 'listCourses', 'listClasses', 'getClientOrders', 'getOrderPayments', 'getUpcomingClasses', 'getCourseDetails'],
          example: { queryType: 'findClient', data: { email: 'user@example.com' } }
        });
      }

      switch (queryType) {
        case 'findClient':
          const client = await Client.findOne(data);
          return JSON.stringify({ 
            success: true,
            client: client,
            found: !!client
          });
        case 'getOrder':
          const orders = await Order.find(data).populate('clientId');
          return JSON.stringify({ 
            success: true,
            orders: orders,
            count: orders.length
          });
        case 'getPayments':
          const payments = await Payment.find(data).populate('orderId');
          return JSON.stringify({ 
            success: true,
            payments: payments,
            count: payments.length
          });
        case 'listCourses':
          const courses = await Course.find(data);
          return JSON.stringify({ 
            success: true,
            courses: courses,
            count: courses.length
          });
        case 'listClasses':
          const classes = await Class.find(data).populate('courseId');
          return JSON.stringify({ 
            success: true,
            classes: classes,
            count: classes.length
          });
        case 'getClientOrders':
          const clientOrders = await Order.find({ clientId: data.clientId }).populate('clientId');
          return JSON.stringify({ 
            success: true,
            orders: clientOrders,
            count: clientOrders.length
          });
        case 'getOrderPayments':
          const orderPayments = await Payment.find({ orderId: data.orderId }).populate('orderId');
          return JSON.stringify({ 
            success: true,
            payments: orderPayments,
            count: orderPayments.length
          });
        case 'getUpcomingClasses':
          const upcomingClasses = await Class.find({ 
            startDate: { $gte: new Date() },
            status: 'active'
          }).populate('courseId');
          return JSON.stringify({ 
            success: true,
            classes: upcomingClasses,
            count: upcomingClasses.length
          });
        case 'getCourseDetails':
          const courseDetails = await Course.findById(data.courseId);
          return JSON.stringify({ 
            success: true,
            course: courseDetails
          });
        default:
          return JSON.stringify({ 
            error: 'Invalid MongoDB query type',
            availableTypes: ['findClient', 'getOrder', 'getPayments', 'listCourses', 'listClasses', 'getClientOrders', 'getOrderPayments', 'getUpcomingClasses', 'getCourseDetails'],
            receivedType: queryType
          });
      }
    } catch (error) {
      console.error('MongoDBTool error:', error);
      return JSON.stringify({ 
        error: 'Database operation failed', 
        details: error.message,
        availableTypes: ['findClient', 'getOrder', 'getPayments', 'listCourses', 'listClasses', 'getClientOrders', 'getOrderPayments', 'getUpcomingClasses', 'getCourseDetails']
      });
    }
  },
};

const ExternalAPI = {
  name: 'ExternalAPI',
  description: 'Create new clients or orders. Use this tool to create new records in the database. Input should be a JSON string with type and data fields. Valid types: "createClient", "createOrder", "createPayment".',
  func: async (input) => {
    try {
      let parsedInput;
      
      // Handle both string and object inputs
      if (typeof input === 'string') {
        parsedInput = JSON.parse(input);
      } else {
        parsedInput = input;
      }
      
      const { type, data } = parsedInput;
      
      if (!type || !data) {
        return JSON.stringify({ 
          error: 'Missing type or data parameter',
          availableTypes: ['createClient', 'createOrder', 'createPayment'],
          example: { type: 'createClient', data: { name: 'John Doe', email: 'john@example.com' } }
        });
      }

      switch (type) {
        case 'createClient':
          const newClient = await Client.create(data);
          return JSON.stringify({ 
            success: true,
            client: newClient,
            message: 'Client created successfully'
          });
        case 'createOrder':
          const newOrder = await Order.create(data);
          return JSON.stringify({ 
            success: true,
            order: newOrder,
            message: 'Order created successfully'
          });
        case 'createPayment':
          const newPayment = await Payment.create(data);
          return JSON.stringify({ 
            success: true,
            payment: newPayment,
            message: 'Payment created successfully'
          });
        default:
          return JSON.stringify({ 
            error: 'Invalid creation type',
            availableTypes: ['createClient', 'createOrder', 'createPayment'],
            receivedType: type
          });
      }
    } catch (error) {
      console.error('ExternalAPI error:', error);
      return JSON.stringify({ 
        error: 'Creation operation failed', 
        details: error.message,
        availableTypes: ['createClient', 'createOrder', 'createPayment']
      });
    }
  },
};

// Initialize agent asynchronously
export const initializeSupportAgent = async (apiKey = null) => {
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
      [MongoDBTool, ExternalAPI],
      llm,
      {
        agentType: 'zero-shot-react-description',
        verbose: true,
        maxIterations: 10,
        earlyStoppingMethod: "generate",
        prefix: `You are a multilingual support agent for AgentServe.Ai, a comprehensive business management platform. 

IMPORTANT MULTILINGUAL INSTRUCTIONS:
- You can understand and respond in multiple languages: ${Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => `${name} (${code})`).join(', ')}
- Special support for Indian languages: Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and Urdu
- If a user asks in a non-English language, respond in the same language
- Always provide helpful, accurate, and professional responses
- Use the available tools to access real data from the database
- When creating new records, ensure all required fields are provided

MEMORY AND CONTEXT INSTRUCTIONS:
- You have access to conversation memory and context
- Use the provided context to understand the user's current situation
- Remember previous interactions with clients, orders, courses, and payments
- Provide contextual responses based on the conversation history
- Update context when new information is provided

SUPPORTED LANGUAGES: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}

Your capabilities include:
1. Client Management: Find, create, and manage client information
2. Order Processing: Handle orders, track status, and manage order details
3. Payment Management: Process payments, track outstanding amounts, and payment history
4. Course Management: List courses, get course details, and manage course information
5. Class Scheduling: View class schedules, upcoming classes, and attendance
6. Multilingual Support: Provide assistance in the user's preferred language, including Indian languages
7. Context Awareness: Remember and use conversation context for better assistance

Available tools:
- MongoDBTool: Query database for clients, orders, payments, courses, and classes
- ExternalAPI: Create new clients, orders, and payments

Always respond in the same language as the user's query, unless they specifically request a different language. Use the provided context to give more personalized and relevant responses.`
      }
    );
  } catch (error) {
    console.error('Error initializing support agent:', error);
    throw error;
  }
};

// Enhanced support agent with memory
export const getSupportAgentWithMemory = async (sessionId, apiKey = null) => {
  const agent = await initializeSupportAgent(apiKey);
  
  return {
    ...agent,
    run: async (query, contextData = {}) => {
      try {
        // Generate context-aware prompt
        const contextPrompt = await generateContextPrompt(sessionId, 'support', query);
        
        // Add context to the query
        const enhancedQuery = contextPrompt ? `${contextPrompt}\n\nUSER QUERY: ${query}` : query;
        
        // Run the agent with enhanced context
        const result = await agent.run(enhancedQuery);
        
        // Store the interaction in memory
        memoryManager.addMessage(sessionId, 'support', {
          sender: 'user',
          text: query,
          contextData
        });
        
        memoryManager.addMessage(sessionId, 'support', {
          sender: 'agent',
          text: typeof result === 'string' ? result : result.output || result.result || JSON.stringify(result)
        });
        
        return result;
      } catch (error) {
        console.error('Support agent with memory error:', error);
        throw error;
      }
    }
  };
};

// Export a function to get the agent instance
let supportAgentInstance = null;
export const getSupportAgent = async (apiKey = null) => {
  if (!supportAgentInstance) {
    supportAgentInstance = await initializeSupportAgent(apiKey);
  }
  return supportAgentInstance;
};
