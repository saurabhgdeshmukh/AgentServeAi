import { ChatGroq } from '@langchain/groq';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { Payment, Client } from '../models/models.js';

const MongoAnalyticsTool = {
  name: 'MongoAnalyticsTool',
  description: 'MongoDB aggregation for analytics (revenue, clients, etc.).',
  func: async (input) => {
    try {
      const { queryType } = JSON.parse(input);
      
      if (!queryType) {
        return JSON.stringify({ error: 'Missing queryType parameter' });
      }

      switch (queryType) {
        case 'revenue': {
          const result = await Payment.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]);
          return JSON.stringify({ revenue: result[0]?.total || 0 });
        }
        case 'inactiveClients': {
          const clients = await Client.find({ status: 'inactive' });
          return JSON.stringify(clients);
        }
        default:
          return JSON.stringify({ error: 'Unknown analytics query' });
      }
    } catch (error) {
      console.error('MongoAnalyticsTool error:', error);
      return JSON.stringify({ error: 'Analytics operation failed', details: error.message });
    }
  },
};

const dashboardLlm = new ChatGroq({ 
  temperature: 0,
  model: "llama3-8b-8192"
});


// Initialize agent asynchronously
export const initializeDashboardAgent = async () => {
  try {
    return await initializeAgentExecutorWithOptions(
      [MongoAnalyticsTool],
      dashboardLlm,
      {
        agentType: 'zero-shot-react-description',
        verbose: true,
      }
    );
  } catch (error) {
    console.error('Failed to initialize dashboard agent:', error);
    throw error;
  }
};

// Export a function to get the agent instance
let dashboardAgentInstance = null;
export const getDashboardAgent = async () => {
  if (!dashboardAgentInstance) {
    dashboardAgentInstance = await initializeDashboardAgent();
  }
  return dashboardAgentInstance;
};