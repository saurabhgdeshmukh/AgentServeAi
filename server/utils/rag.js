import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Client, Order, Payment, Course, Class } from '../models/models.js';

// RAG Configuration
const RAG_CONFIG = {
  maxResults: 5, // Maximum number of relevant results to retrieve
  similarityThreshold: 0.7, // Minimum similarity score for relevance
  maxContextLength: 2000, // Maximum context length for prompt
  enableSemanticSearch: true, // Enable semantic search capabilities
  enableHybridSearch: true // Enable hybrid search (semantic + keyword)
};

/**
 * RAG Query Processor for intelligent information retrieval
 */
class RAGProcessor {
  constructor() {
    this.llm = null;
    this.initializeLLM();
  }

  async initializeLLM() {
    try {
      this.llm = new ChatGoogleGenerativeAI({ 
        temperature: 0,
        model: "gemini-2.0-flash",
        apiKey: process.env.GOOGLE_API_KEY
      });
    } catch (error) {
      console.error('Error initializing RAG LLM:', error);
    }
  }

  /**
   * Generate embeddings for text using Gemini
   */
  async generateEmbedding(text) {
    try {
      if (!this.llm) {
        await this.initializeLLM();
      }

      // Use Gemini's embedding capabilities
      const response = await this.llm.invoke([
        {
          role: "user",
          content: `Generate a semantic representation for this text: "${text}". Return only the key concepts and entities.`
        }
      ]);

      return response.content;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return text; // Fallback to original text
    }
  }

  /**
   * Calculate similarity between two texts
   */
  calculateSimilarity(text1, text2) {
    try {
      const words1 = text1.toLowerCase().split(/\s+/);
      const words2 = text2.toLowerCase().split(/\s+/);
      
      const intersection = words1.filter(word => words2.includes(word));
      const union = [...new Set([...words1, ...words2])];
      
      return intersection.length / union.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Semantic search across database collections
   */
  async semanticSearch(query, collection, searchFields = []) {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      const results = [];
      
      // Get all documents from the collection
      const documents = await collection.find({}).lean();
      
      for (const doc of documents) {
        let maxScore = 0;
        
        // Search across specified fields
        for (const field of searchFields) {
          if (doc[field]) {
            const fieldValue = typeof doc[field] === 'string' ? doc[field] : JSON.stringify(doc[field]);
            const similarity = this.calculateSimilarity(queryEmbedding, fieldValue);
            maxScore = Math.max(maxScore, similarity);
          }
        }
        
        if (maxScore >= RAG_CONFIG.similarityThreshold) {
          results.push({
            document: doc,
            score: maxScore,
            relevance: this.getRelevanceLevel(maxScore)
          });
        }
      }
      
      // Sort by relevance score
      return results.sort((a, b) => b.score - a.score).slice(0, RAG_CONFIG.maxResults);
    } catch (error) {
      console.error('Semantic search error:', error);
      return [];
    }
  }

  /**
   * Hybrid search combining semantic and keyword search
   */
  async hybridSearch(query, collection, searchFields = []) {
    try {
      const [semanticResults, keywordResults] = await Promise.all([
        this.semanticSearch(query, collection, searchFields),
        this.keywordSearch(query, collection, searchFields)
      ]);

      // Combine and deduplicate results
      const combinedResults = new Map();
      
      // Add semantic results
      semanticResults.forEach(result => {
        const key = result.document._id.toString();
        combinedResults.set(key, {
          ...result,
          searchType: 'semantic'
        });
      });

      // Add keyword results with lower weight
      keywordResults.forEach(result => {
        const key = result.document._id.toString();
        if (combinedResults.has(key)) {
          // Boost existing result
          const existing = combinedResults.get(key);
          existing.score = Math.max(existing.score, result.score * 0.8);
          existing.searchType = 'hybrid';
        } else {
          combinedResults.set(key, {
            ...result,
            searchType: 'keyword'
          });
        }
      });

      return Array.from(combinedResults.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, RAG_CONFIG.maxResults);
    } catch (error) {
      console.error('Hybrid search error:', error);
      return [];
    }
  }

  /**
   * Keyword-based search
   */
  async keywordSearch(query, collection, searchFields = []) {
    try {
      const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const results = [];
      
      // Build regex patterns for keyword matching
      const regexPatterns = keywords.map(keyword => new RegExp(keyword, 'i'));
      
      const documents = await collection.find({}).lean();
      
      for (const doc of documents) {
        let score = 0;
        let matches = 0;
        
        for (const field of searchFields) {
          if (doc[field]) {
            const fieldValue = typeof doc[field] === 'string' ? doc[field] : JSON.stringify(doc[field]);
            
            for (const pattern of regexPatterns) {
              if (pattern.test(fieldValue)) {
                score += 1;
                matches += 1;
              }
            }
          }
        }
        
        if (matches > 0) {
          const normalizedScore = score / (keywords.length * searchFields.length);
          results.push({
            document: doc,
            score: normalizedScore,
            relevance: this.getRelevanceLevel(normalizedScore)
          });
        }
      }
      
      return results.sort((a, b) => b.score - a.score).slice(0, RAG_CONFIG.maxResults);
    } catch (error) {
      console.error('Keyword search error:', error);
      return [];
    }
  }

  /**
   * Get relevance level based on score
   */
  getRelevanceLevel(score) {
    if (score >= 0.9) return 'excellent';
    if (score >= 0.8) return 'very_good';
    if (score >= 0.7) return 'good';
    if (score >= 0.6) return 'fair';
    return 'poor';
  }

  /**
   * Intelligent query routing based on query type
   */
  async routeQuery(query, agentType) {
    try {
      const queryLower = query.toLowerCase();
      const route = {
        collections: [],
        searchFields: [],
        searchType: 'hybrid'
      };

      // Support Agent routing
      if (agentType === 'support') {
        if (queryLower.includes('client') || queryLower.includes('customer') || queryLower.includes('email')) {
          route.collections.push(Client);
          route.searchFields = ['name', 'email', 'phone', 'address'];
        }
        
        if (queryLower.includes('order') || queryLower.includes('purchase')) {
          route.collections.push(Order);
          route.searchFields = ['orderNumber', 'status', 'amount'];
        }
        
        if (queryLower.includes('payment') || queryLower.includes('paid') || queryLower.includes('outstanding')) {
          route.collections.push(Payment);
          route.searchFields = ['status', 'amount', 'paymentMethod'];
        }
        
        if (queryLower.includes('course') || queryLower.includes('class')) {
          route.collections.push(Course, Class);
          route.searchFields = ['name', 'description', 'category'];
        }
      }

      // Dashboard Agent routing
      if (agentType === 'dashboard') {
        if (queryLower.includes('revenue') || queryLower.includes('income') || queryLower.includes('earnings')) {
          route.collections.push(Payment, Order);
          route.searchFields = ['amount', 'status', 'createdAt'];
        }
        
        if (queryLower.includes('client') || queryLower.includes('customer') || queryLower.includes('user')) {
          route.collections.push(Client);
          route.searchFields = ['name', 'email', 'status', 'createdAt'];
        }
        
        if (queryLower.includes('course') || queryLower.includes('service') || queryLower.includes('enrollment')) {
          route.collections.push(Course, Order);
          route.searchFields = ['name', 'description', 'status'];
        }
        
        if (queryLower.includes('attendance') || queryLower.includes('class')) {
          route.collections.push(Class);
          route.searchFields = ['name', 'attendance', 'startDate'];
        }
      }

      // Default to all collections if no specific routing
      if (route.collections.length === 0) {
        route.collections = [Client, Order, Payment, Course, Class];
        route.searchFields = ['name', 'description', 'status', 'email'];
      }

      return route;
    } catch (error) {
      console.error('Query routing error:', error);
      return {
        collections: [Client, Order, Payment, Course, Class],
        searchFields: ['name', 'description', 'status'],
        searchType: 'hybrid'
      };
    }
  }

  /**
   * Retrieve relevant information for RAG
   */
  async retrieveRelevantInfo(query, agentType) {
    try {
      const route = await this.routeQuery(query, agentType);
      const allResults = [];

      // Search across all relevant collections
      for (const collection of route.collections) {
        let results;
        
        if (route.searchType === 'semantic' && RAG_CONFIG.enableSemanticSearch) {
          results = await this.semanticSearch(query, collection, route.searchFields);
        } else if (route.searchType === 'hybrid' && RAG_CONFIG.enableHybridSearch) {
          results = await this.hybridSearch(query, collection, route.searchFields);
        } else {
          results = await this.keywordSearch(query, collection, route.searchFields);
        }

        allResults.push(...results.map(result => ({
          ...result,
          collection: collection.modelName
        })));
      }

      // Sort by relevance and limit results
      const sortedResults = allResults
        .sort((a, b) => b.score - a.score)
        .slice(0, RAG_CONFIG.maxResults);

      return this.formatRetrievedInfo(sortedResults);
    } catch (error) {
      console.error('RAG retrieval error:', error);
      return '';
    }
  }

  /**
   * Format retrieved information for agent context
   */
  formatRetrievedInfo(results) {
    if (results.length === 0) return '';

    let formattedInfo = '\n\nRELEVANT INFORMATION FROM DATABASE:\n';
    
    results.forEach((result, index) => {
      const { document, score, relevance, collection } = result;
      
      formattedInfo += `\n${index + 1}. [${collection}] (Relevance: ${relevance}, Score: ${score.toFixed(2)})\n`;
      
      // Format document information
      if (collection === 'Client') {
        formattedInfo += `   Name: ${document.name || 'N/A'}\n`;
        formattedInfo += `   Email: ${document.email || 'N/A'}\n`;
        formattedInfo += `   Status: ${document.status || 'N/A'}\n`;
      } else if (collection === 'Order') {
        formattedInfo += `   Order ID: ${document._id}\n`;
        formattedInfo += `   Amount: $${document.amount || 'N/A'}\n`;
        formattedInfo += `   Status: ${document.status || 'N/A'}\n`;
      } else if (collection === 'Payment') {
        formattedInfo += `   Payment ID: ${document._id}\n`;
        formattedInfo += `   Amount: $${document.amount || 'N/A'}\n`;
        formattedInfo += `   Status: ${document.status || 'N/A'}\n`;
      } else if (collection === 'Course') {
        formattedInfo += `   Course: ${document.name || 'N/A'}\n`;
        formattedInfo += `   Description: ${document.description || 'N/A'}\n`;
        formattedInfo += `   Price: $${document.price || 'N/A'}\n`;
      } else if (collection === 'Class') {
        formattedInfo += `   Class: ${document.name || 'N/A'}\n`;
        formattedInfo += `   Start Date: ${document.startDate || 'N/A'}\n`;
        formattedInfo += `   Attendance: ${document.attendance || 'N/A'}\n`;
      }
    });

    return formattedInfo;
  }

  /**
   * Generate RAG-enhanced prompt
   */
  async generateRAGPrompt(query, agentType, existingContext = '') {
    try {
      const retrievedInfo = await this.retrieveRelevantInfo(query, agentType);
      
      let ragPrompt = '';
      
      if (retrievedInfo) {
        ragPrompt += retrievedInfo;
      }
      
      if (existingContext) {
        ragPrompt += `\n\nEXISTING CONVERSATION CONTEXT:\n${existingContext}`;
      }
      
      ragPrompt += `\n\nUSER QUERY: ${query}`;
      ragPrompt += `\n\nINSTRUCTIONS: Use the retrieved information above to provide accurate and relevant responses. If the retrieved information is not sufficient, use your available tools to get more specific data.`;
      
      return ragPrompt;
    } catch (error) {
      console.error('RAG prompt generation error:', error);
      return query; // Fallback to original query
    }
  }

  /**
   * Get RAG statistics
   */
  getRAGStats() {
    return {
      config: RAG_CONFIG,
      features: {
        semanticSearch: RAG_CONFIG.enableSemanticSearch,
        hybridSearch: RAG_CONFIG.enableHybridSearch,
        maxResults: RAG_CONFIG.maxResults,
        similarityThreshold: RAG_CONFIG.similarityThreshold
      }
    };
  }
}

// Export singleton instance
export const ragProcessor = new RAGProcessor();

// Export utility functions
export const retrieveRelevantInfo = (query, agentType) => {
  return ragProcessor.retrieveRelevantInfo(query, agentType);
};

export const generateRAGPrompt = (query, agentType, existingContext) => {
  return ragProcessor.generateRAGPrompt(query, agentType, existingContext);
};

export const getRAGStats = () => {
  return ragProcessor.getRAGStats();
}; 