import { ChatGroq } from '@langchain/groq';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { Client, Order, Payment, Course, Class } from '../models/models.js';

const MongoDBTool = {
  name: 'MongoDBTool',
  description: 'Access MongoDB collections (clients, orders, payments, courses, classes).',
  func: async (input) => {
    try {
      const { queryType, data } = JSON.parse(input);
      
      if (!queryType || !data) {
        return JSON.stringify({ error: 'Missing queryType or data parameter' });
      }

      switch (queryType) {
        case 'findClient':
          const client = await Client.findOne(data);
          return JSON.stringify(client);
        case 'getOrder':
          const orders = await Order.find(data).populate('clientId');
          return JSON.stringify(orders);
        case 'getPayments':
          const payments = await Payment.find(data).populate('orderId');
          return JSON.stringify(payments);
        case 'listCourses':
          const courses = await Course.find(data);
          return JSON.stringify(courses);
        case 'listClasses':
          const classes = await Class.find(data).populate('courseId');
          return JSON.stringify(classes);
        default:
          return JSON.stringify({ error: 'Invalid MongoDB query type' });
      }
    } catch (error) {
      console.error('MongoDBTool error:', error);
      return JSON.stringify({ error: 'Database operation failed', details: error.message });
    }
  },
};

const ExternalAPI = {
  name: 'ExternalAPI',
  description: 'Create new clients or orders.',
  func: async (input) => {
    try {
      const { type, data } = JSON.parse(input);
      
      if (!type || !data) {
        return JSON.stringify({ error: 'Missing type or data parameter' });
      }

      switch (type) {
        case 'createClient':
          const newClient = await Client.create(data);
          return JSON.stringify(newClient);
        case 'createOrder':
          const newOrder = await Order.create(data);
          return JSON.stringify(newOrder);
        default:
          return JSON.stringify({ error: 'Invalid creation type' });
      }
    } catch (error) {
      console.error('ExternalAPI error:', error);
      return JSON.stringify({ error: 'Creation operation failed', details: error.message });
    }
  },
};

const llm = new ChatGroq({ 
  temperature: 0,
  model: "llama3-8b-8192"
});

// Initialize agent asynchronously
export const initializeSupportAgent = async () => {
  try {
    return await initializeAgentExecutorWithOptions(
      [MongoDBTool, ExternalAPI],
      llm,
      {
        agentType: 'zero-shot-react-description',
        verbose: true,
      }
    );
  } catch (error) {
    console.error('Failed to initialize support agent:', error);
    throw error;
  }
};

// Export a function to get the agent instance
let supportAgentInstance = null;
export const getSupportAgent = async () => {
  if (!supportAgentInstance) {
    supportAgentInstance = await initializeSupportAgent();
  }
  return supportAgentInstance;
};
