import { Client, Order, Payment, Course, Class } from '../models/models.js';

// Memory storage for agent conversations
const agentMemory = new Map();

// Memory configuration
const MEMORY_CONFIG = {
  maxConversations: 100, // Maximum number of conversations to store
  maxMessagesPerConversation: 50, // Maximum messages per conversation
  contextRetentionHours: 24, // How long to retain context in hours
  maxContextTokens: 2000 // Maximum tokens for context summary
};

/**
 * Memory entry structure
 */
class MemoryEntry {
  constructor(sessionId, agentType) {
    this.sessionId = sessionId;
    this.agentType = agentType;
    this.messages = [];
    this.context = {
      lastClientId: null,
      lastOrderId: null,
      lastCourseId: null,
      lastPaymentId: null,
      detectedLanguage: 'en',
      userPreferences: {},
      recentQueries: [],
      businessContext: {}
    };
    this.createdAt = new Date();
    this.lastAccessed = new Date();
    this.summary = '';
  }

  addMessage(message) {
    this.messages.push({
      ...message,
      timestamp: new Date()
    });

    // Keep only recent messages
    if (this.messages.length > MEMORY_CONFIG.maxMessagesPerConversation) {
      this.messages = this.messages.slice(-MEMORY_CONFIG.maxMessagesPerConversation);
    }

    this.lastAccessed = new Date();
  }

  updateContext(newContext) {
    this.context = { ...this.context, ...newContext };
    this.lastAccessed = new Date();
  }

  getRecentMessages(count = 10) {
    return this.messages.slice(-count);
  }

  getContextSummary() {
    const summary = [];
    
    if (this.context.lastClientId) {
      summary.push(`Last client: ${this.context.lastClientId}`);
    }
    if (this.context.lastOrderId) {
      summary.push(`Last order: ${this.context.lastOrderId}`);
    }
    if (this.context.lastCourseId) {
      summary.push(`Last course: ${this.context.lastCourseId}`);
    }
    if (this.context.detectedLanguage !== 'en') {
      summary.push(`Language: ${this.context.detectedLanguage}`);
    }
    if (this.context.recentQueries.length > 0) {
      summary.push(`Recent topics: ${this.context.recentQueries.slice(-3).join(', ')}`);
    }

    return summary.join(' | ');
  }

  isExpired() {
    const hoursSinceLastAccess = (new Date() - this.lastAccessed) / (1000 * 60 * 60);
    return hoursSinceLastAccess > MEMORY_CONFIG.contextRetentionHours;
  }
}

/**
 * Memory Manager for handling conversation context
 */
class MemoryManager {
  constructor() {
    this.memory = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 1000 * 60 * 60); // Cleanup every hour
  }

  /**
   * Get or create memory for a session
   */
  getMemory(sessionId, agentType) {
    const key = `${sessionId}-${agentType}`;
    
    if (!this.memory.has(key)) {
      this.memory.set(key, new MemoryEntry(sessionId, agentType));
      
      // Cleanup if too many conversations
      if (this.memory.size > MEMORY_CONFIG.maxConversations) {
        this.cleanup();
      }
    }
    
    return this.memory.get(key);
  }

  /**
   * Add message to memory
   */
  addMessage(sessionId, agentType, message) {
    const memory = this.getMemory(sessionId, agentType);
    memory.addMessage(message);
    return memory;
  }

  /**
   * Update context in memory
   */
  updateContext(sessionId, agentType, context) {
    const memory = this.getMemory(sessionId, agentType);
    memory.updateContext(context);
    return memory;
  }

  /**
   * Get conversation context for agent
   */
  getConversationContext(sessionId, agentType) {
    const memory = this.getMemory(sessionId, agentType);
    const recentMessages = memory.getRecentMessages(5);
    const contextSummary = memory.getContextSummary();
    
    return {
      recentMessages,
      contextSummary,
      fullContext: memory.context,
      sessionId,
      agentType
    };
  }

  /**
   * Extract entities from message for context
   */
  async extractContextFromMessage(message, agentType) {
    const context = {};
    
    // Extract potential IDs (client, order, course, payment)
    const idPatterns = {
      clientId: /(?:client|customer)\s*(?:id|#)?\s*(\d+)/gi,
      orderId: /(?:order|order\s*id|order\s*#)\s*(\d+)/gi,
      courseId: /(?:course|course\s*id|course\s*#)\s*(\d+)/gi,
      paymentId: /(?:payment|payment\s*id|payment\s*#)\s*(\d+)/gi
    };

    for (const [key, pattern] of Object.entries(idPatterns)) {
      const match = pattern.exec(message);
      if (match) {
        context[key] = match[1];
      }
    }

    // Extract email addresses
    const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      context.lastEmail = emailMatch[0];
    }

    // Extract course names
    const courseMatch = message.match(/(?:course|class)\s+(?:named\s+)?["']?([^"']+)["']?/i);
    if (courseMatch) {
      context.lastCourseName = courseMatch[1];
    }

    // Extract client names
    const nameMatch = message.match(/(?:client|customer)\s+(?:named\s+)?["']?([^"']+)["']?/i);
    if (nameMatch) {
      context.lastClientName = nameMatch[1];
    }

    return context;
  }

  /**
   * Get relevant business context from database
   */
  async getBusinessContext(context, agentType) {
    const businessContext = {};

    try {
      // Get client context
      if (context.lastClientId) {
        const client = await Client.findById(context.lastClientId);
        if (client) {
          businessContext.client = {
            id: client._id,
            name: client.name,
            email: client.email,
            status: client.status
          };
        }
      } else if (context.lastEmail) {
        const client = await Client.findOne({ email: context.lastEmail });
        if (client) {
          businessContext.client = {
            id: client._id,
            name: client.name,
            email: client.email,
            status: client.status
          };
          context.lastClientId = client._id;
        }
      }

      // Get order context
      if (context.lastOrderId) {
        const order = await Order.findById(context.lastOrderId).populate('clientId courseId');
        if (order) {
          businessContext.order = {
            id: order._id,
            amount: order.amount,
            status: order.status,
            clientName: order.clientId?.name,
            courseName: order.courseId?.name
          };
        }
      }

      // Get course context
      if (context.lastCourseId) {
        const course = await Course.findById(context.lastCourseId);
        if (course) {
          businessContext.course = {
            id: course._id,
            name: course.name,
            description: course.description,
            price: course.price
          };
        }
      } else if (context.lastCourseName) {
        const course = await Course.findOne({ name: { $regex: context.lastCourseName, $options: 'i' } });
        if (course) {
          businessContext.course = {
            id: course._id,
            name: course.name,
            description: course.description,
            price: course.price
          };
          context.lastCourseId = course._id;
        }
      }

      // Get payment context
      if (context.lastPaymentId) {
        const payment = await Payment.findById(context.lastPaymentId).populate('orderId');
        if (payment) {
          businessContext.payment = {
            id: payment._id,
            amount: payment.amount,
            status: payment.status,
            orderId: payment.orderId?._id
          };
        }
      }

    } catch (error) {
      console.error('Error getting business context:', error);
    }

    return businessContext;
  }

  /**
   * Generate context-aware prompt for agent
   */
  async generateContextPrompt(sessionId, agentType, userMessage) {
    const memory = this.getMemory(sessionId, agentType);
    const context = this.getConversationContext(sessionId, agentType);
    
    // Extract context from current message
    const extractedContext = await this.extractContextFromMessage(userMessage, agentType);
    
    // Update memory with new context
    if (Object.keys(extractedContext).length > 0) {
      memory.updateContext(extractedContext);
    }

    // Get business context from database
    const businessContext = await this.getBusinessContext(memory.context, agentType);
    memory.updateContext({ businessContext });

    // Build context prompt
    let contextPrompt = '';
    
    if (context.contextSummary) {
      contextPrompt += `\n\nCONVERSATION CONTEXT:\n${context.contextSummary}\n`;
    }

    if (Object.keys(businessContext).length > 0) {
      contextPrompt += `\nRELEVANT BUSINESS DATA:\n`;
      
      if (businessContext.client) {
        contextPrompt += `- Current Client: ${businessContext.client.name} (${businessContext.client.email}) - Status: ${businessContext.client.status}\n`;
      }
      
      if (businessContext.order) {
        contextPrompt += `- Current Order: #${businessContext.order.id} - Amount: $${businessContext.order.amount} - Status: ${businessContext.order.status}\n`;
      }
      
      if (businessContext.course) {
        contextPrompt += `- Current Course: ${businessContext.course.name} - Price: $${businessContext.course.price}\n`;
      }
      
      if (businessContext.payment) {
        contextPrompt += `- Current Payment: #${businessContext.payment.id} - Amount: $${businessContext.payment.amount} - Status: ${businessContext.payment.status}\n`;
      }
    }

    if (context.recentMessages.length > 0) {
      contextPrompt += `\nRECENT CONVERSATION:\n`;
      context.recentMessages.forEach(msg => {
        const role = msg.sender === 'user' ? 'User' : 'Agent';
        contextPrompt += `${role}: ${msg.text}\n`;
      });
    }

    return contextPrompt;
  }

  /**
   * Cleanup expired memories
   */
  cleanup() {
    const now = new Date();
    for (const [key, memory] of this.memory.entries()) {
      if (memory.isExpired()) {
        this.memory.delete(key);
      }
    }
  }

  /**
   * Clear memory for a specific session
   */
  clearMemory(sessionId, agentType) {
    const key = `${sessionId}-${agentType}`;
    this.memory.delete(key);
  }

  /**
   * Get memory statistics
   */
  getStats() {
    return {
      totalConversations: this.memory.size,
      activeConversations: Array.from(this.memory.values()).filter(m => !m.isExpired()).length,
      maxConversations: MEMORY_CONFIG.maxConversations,
      retentionHours: MEMORY_CONFIG.contextRetentionHours
    };
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();

// Export utility functions
export const getMemoryContext = (sessionId, agentType) => {
  return memoryManager.getConversationContext(sessionId, agentType);
};

export const updateMemoryContext = (sessionId, agentType, context) => {
  return memoryManager.updateContext(sessionId, agentType, context);
};

export const generateContextPrompt = (sessionId, agentType, userMessage) => {
  return memoryManager.generateContextPrompt(sessionId, agentType, userMessage);
}; 