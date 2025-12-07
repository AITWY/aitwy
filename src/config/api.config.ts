// API Configuration - Easy to change for different environments
export const API_CONFIG = {
  // Base URLs
  AUTH_API: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  CHATBOT_API: import.meta.env.VITE_CHATBOT_API_URL || 'https://nonpublishable-katharina-nonblunderingly.ngrok-free.dev',
  
  // Endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      SIGNUP: '/auth/signup',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      VERIFY_EMAIL: '/auth/verify-email',
      RESEND_VERIFICATION: '/auth/resend-verification',
    },
    
    // Chatbot endpoints (based on actual Swagger API)
    CHATBOT: {
      // Wizard endpoints
      WIZARD_START: '/api/v1/chatbots/wizard/start',
      STATUS: '/api/v1/chatbots/:chatbotId/status',
      FINALIZE: '/api/v1/chatbots/:chatbotId/finalize',
      
      // Chatbot CRUD
      LIST: '/api/v1/chatbots/list',
      GET: '/api/v1/chatbots/:chatbotId',
      DELETE: '/api/v1/chatbots/:chatbotId',
      
      // Chat
      CHAT: '/api/v1/chatbots/:chatbotId/chat',
      
      // Knowledge base
      KNOWLEDGE_LIST: '/api/v1/chatbots/:chatbotId/knowledge',
      KNOWLEDGE_CREATE: '/api/v1/chatbots/:chatbotId/knowledge',
      KNOWLEDGE_UPDATE: '/api/v1/chatbots/:chatbotId/knowledge/:itemId',
      KNOWLEDGE_DELETE: '/api/v1/chatbots/:chatbotId/knowledge/:itemId',
      
      // Scraping jobs
      SCRAPING_JOB: '/api/v1/scraping-jobs/:jobId',
      SCRAPING_RETRY: '/api/v1/scraping-jobs/:jobId/retry',
      
      // Conversation management
      CONVERSATIONS_LIST: '/api/v1/chatbots/:chatbotId/conversations',
      CONVERSATIONS_DELETE_ALL: '/api/v1/chatbots/:chatbotId/conversations',
      CONVERSATION_DELETE: '/api/v1/chatbots/:chatbotId/conversations/:conversationId',
      CONVERSATION_GET: '/api/v1/chatbots/:chatbotId/conversations/:conversationId',
    },
  },
};

// Helper to build full URL
export const buildUrl = (base: 'AUTH_API' | 'CHATBOT_API', endpoint: string) => {
  return `${API_CONFIG[base]}${endpoint}`;
};

// Helper to replace path parameters
export const replaceParams = (endpoint: string, params: Record<string, string>) => {
  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });
  return url;
};

