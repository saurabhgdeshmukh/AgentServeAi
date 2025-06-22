import express from 'express';
import cors from 'cors';
import connectDB from './db/db.js';
import { getSupportAgent, getSupportAgentWithMemory } from './agents/supportAgent.js';
import { getDashboardAgent, getDashboardAgentWithMemory } from './agents/dashboardAgent.js';
import { seedData } from './utils/seedData.js';
import { 
  processMultilingualQuery, 
  translateAgentResponse, 
  getSupportedLanguages, 
  detectLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE 
} from './utils/multilingual.js';
import { memoryManager } from './utils/memory.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

connectDB();

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/languages', (req, res) => {
  res.json({ 
    success: true,
    languages: getSupportedLanguages(),
    defaultLanguage: DEFAULT_LANGUAGE
  });
});

app.post('/api/detect-language', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'Text is required' 
      });
    }
    
    const detectedLang = detectLanguage(text);
    const languageName = SUPPORTED_LANGUAGES[detectedLang] || 'Unknown';
    
    res.json({ 
      success: true,
      detectedLanguage: detectedLang,
      languageName: languageName,
      isSupported: !!SUPPORTED_LANGUAGES[detectedLang]
    });
  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to detect language', 
      details: error.message 
    });
  }
});

app.get('/api/memory/stats', (req, res) => {
  try {
    const stats = memoryManager.getStats();
    res.json({ 
      success: true,
      stats
    });
  } catch (error) {
    console.error('Memory stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get memory stats', 
      details: error.message 
    });
  }
});

app.get('/api/memory/context/:sessionId/:agentType', (req, res) => {
  try {
    const { sessionId, agentType } = req.params;
    const context = memoryManager.getConversationContext(sessionId, agentType);
    res.json({ 
      success: true,
      context
    });
  } catch (error) {
    console.error('Memory context error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get memory context', 
      details: error.message 
    });
  }
});

app.delete('/api/memory/clear/:sessionId/:agentType', (req, res) => {
  try {
    const { sessionId, agentType } = req.params;
    memoryManager.clearMemory(sessionId, agentType);
    res.json({ 
      success: true,
      message: 'Memory cleared successfully'
    });
  } catch (error) {
    console.error('Memory clear error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear memory', 
      details: error.message 
    });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    const data = await seedData();
    res.json({ 
      success: true, 
      message: 'Database seeded successfully',
      data: {
        courses: data.courses.length,
        clients: data.clients.length,
        classes: data.classes.length,
        orders: data.orders.length,
        payments: data.payments.length,
        attendanceRecords: data.attendanceRecords.length
      }
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to seed database', 
      details: error.message 
    });
  }
});

app.post('/api/support', async (req, res) => {
  try {
    const { query, preferredLanguage = DEFAULT_LANGUAGE, sessionId = 'default' } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Query is required' 
      });
    }
    
    const multilingualData = await processMultilingualQuery(query, preferredLanguage);
    console.log('Multilingual processing:', multilingualData);
    
    const supportAgent = await getSupportAgentWithMemory(sessionId);
    const result = await supportAgent.run(multilingualData.translatedQuery, {
      detectedLanguage: multilingualData.detectedLanguage,
      preferredLanguage: multilingualData.preferredLanguage
    });
    
    let agentResponse;
    if (typeof result === 'string') {
      agentResponse = result;
    } else if (result && typeof result === 'object') {
      agentResponse = result.output || result.result || JSON.stringify(result);
    } else {
      agentResponse = String(result);
    }
    
    let finalResponse = agentResponse;
    if (multilingualData.detectedLanguage !== DEFAULT_LANGUAGE || preferredLanguage !== DEFAULT_LANGUAGE) {
      finalResponse = await translateAgentResponse(agentResponse, preferredLanguage);
    }
    
    res.json({
      success: true,
      result: finalResponse,
      multilingualInfo: {
        originalQuery: multilingualData.originalQuery,
        detectedLanguage: multilingualData.detectedLanguage,
        translatedQuery: multilingualData.translatedQuery,
        responseLanguage: preferredLanguage
      },
      sessionId
    });
  } catch (error) {
    console.error('Support agent error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process support query', 
      details: error.message 
    });
  }
});

app.post('/api/dashboard', async (req, res) => {
  try {
    const { query, preferredLanguage = DEFAULT_LANGUAGE, sessionId = 'default' } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Query is required' 
      });
    }
    
    const multilingualData = await processMultilingualQuery(query, preferredLanguage);
    console.log('Multilingual processing:', multilingualData);
    
    const dashboardAgent = await getDashboardAgentWithMemory(sessionId);
    const result = await dashboardAgent.run(multilingualData.translatedQuery, {
      detectedLanguage: multilingualData.detectedLanguage,
      preferredLanguage: multilingualData.preferredLanguage
    });
    
    let agentResponse;
    if (typeof result === 'string') {
      agentResponse = result;
    } else if (result && typeof result === 'object') {
      agentResponse = result.output || result.result || JSON.stringify(result);
    } else {
      agentResponse = String(result);
    }
    
    let finalResponse = agentResponse;
    if (multilingualData.detectedLanguage !== DEFAULT_LANGUAGE || preferredLanguage !== DEFAULT_LANGUAGE) {
      finalResponse = await translateAgentResponse(agentResponse, preferredLanguage);
    }
    
    res.json({
      success: true,
      result: finalResponse,
      multilingualInfo: {
        originalQuery: multilingualData.originalQuery,
        detectedLanguage: multilingualData.detectedLanguage,
        translatedQuery: multilingualData.translatedQuery,
        responseLanguage: preferredLanguage
      },
      sessionId
    });
  } catch (error) {
    console.error('Dashboard agent error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process dashboard query', 
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Multilingual support enabled for ${Object.keys(SUPPORTED_LANGUAGES).length} languages`);
  console.log(`Memory system enabled with context retention`);
});