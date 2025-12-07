import axios, { AxiosError } from 'axios';
import { API_CONFIG } from '../config/api.config';

// ============================================================================
// Type Definitions (Based on Swagger Schema)
// ============================================================================

export interface ChatbotWizardStart {
  website_url: string;
  name: string;
  description?: string;
}

export interface ChatbotWizardResponse {
  chatbot_id: string;
  scraping_job_id: string;
  status: string;
  message: string;
}

export interface ChatbotStatusResponse {
  chatbot_id: string;
  name: string;
  status: string;
  website_url: string;
  progress: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatbotResponse {
  id: string;
  name: string;
  description?: string;
  website_url: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  sources?: string[];
}

export interface KnowledgeItemCreate {
  title: string;
  content: string;
  content_type?: string;
  source_url?: string;
  metadata?: Record<string, any>;
}

export interface KnowledgeItemUpdate {
  title?: string;
  content?: string;
  metadata?: Record<string, any>;
}

export interface KnowledgeItemResponse {
  id: string;
  chatbot_id: string;
  title: string;
  content: string;
  content_type: string;
  source_url?: string;
  created_at: string;
}

export interface ScrapingJobResponse {
  id: string;
  chatbot_id: string;
  url: string;
  status: string;
  pages_scraped: number;
  total_pages: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface ConversationResponse {
  id: string;
  chatbot_id: string;
  conversation_id: string;
  title?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ConversationListResponse {
  conversations: ConversationResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: string[];
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ConversationHistoryResponse {
  id: string;
  chatbot_id: string;
  conversation_id: string;
  title?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  messages: MessageResponse[];
}

// ============================================================================
// API Client Setup
// ============================================================================

const chatbotApiClient = axios.create({
  baseURL: API_CONFIG.CHATBOT_API,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
  },
});

// Add auth token to requests if available
chatbotApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// Error Handling
// ============================================================================

interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    return {
      message: axiosError.response?.data?.message || axiosError.message || 'An error occurred',
      status: axiosError.response?.status,
      details: axiosError.response?.data,
    };
  }
  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  };
};

// ============================================================================
// Chatbot Wizard API
// ============================================================================

export const chatbotWizardApi = {
  /**
   * Start chatbot creation wizard
   * POST /api/v1/chatbots/wizard/start
   */
  startWizard: async (data: ChatbotWizardStart): Promise<ChatbotWizardResponse> => {
    try {
      const response = await chatbotApiClient.post<ChatbotWizardResponse>(
        API_CONFIG.ENDPOINTS.CHATBOT.WIZARD_START,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get chatbot creation status
   * GET /api/v1/chatbots/{chatbot_id}/status
   */
  getStatus: async (chatbotId: string): Promise<ChatbotStatusResponse> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.STATUS.replace(':chatbotId', chatbotId);
      const response = await chatbotApiClient.get<ChatbotStatusResponse>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Finalize chatbot creation
   * POST /api/v1/chatbots/{chatbot_id}/finalize
   */
  finalize: async (chatbotId: string): Promise<{ message: string }> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.FINALIZE.replace(':chatbotId', chatbotId);
      const response = await chatbotApiClient.post<{ message: string }>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// ============================================================================
// Chatbot CRUD API
// ============================================================================

export const chatbotApi = {
  /**
   * List all chatbots
   * GET /api/v1/chatbots/list
   */
  list: async (skip: number = 0, limit: number = 100): Promise<ChatbotResponse[]> => {
    try {
      const response = await chatbotApiClient.get<ChatbotResponse[]>(
        API_CONFIG.ENDPOINTS.CHATBOT.LIST,
        {
          params: { skip, limit },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get chatbot by ID
   * GET /api/v1/chatbots/{chatbot_id}
   */
  get: async (chatbotId: string): Promise<ChatbotResponse> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.GET.replace(':chatbotId', chatbotId);
      const response = await chatbotApiClient.get<ChatbotResponse>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete chatbot
   * DELETE /api/v1/chatbots/{chatbot_id}
   */
  delete: async (chatbotId: string): Promise<{ message: string }> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.DELETE.replace(':chatbotId', chatbotId);
      const response = await chatbotApiClient.delete<{ message: string }>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// ============================================================================
// Chat API
// ============================================================================

export const chatApi = {
  /**
   * Send message to chatbot
   * POST /api/v1/chatbots/{chatbot_id}/chat
   */
  sendMessage: async (chatbotId: string, request: ChatRequest): Promise<ChatResponse> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.CHAT.replace(':chatbotId', chatbotId);
      const response = await chatbotApiClient.post<ChatResponse>(url, request);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// ============================================================================
// Knowledge Base API
// ============================================================================

export const knowledgeApi = {
  /**
   * List knowledge items
   * GET /api/v1/chatbots/{chatbot_id}/knowledge
   */
  list: async (
    chatbotId: string,
    contentType?: string,
    skip: number = 0,
    limit: number = 50
  ): Promise<KnowledgeItemResponse[]> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.KNOWLEDGE_LIST.replace(':chatbotId', chatbotId);
      const response = await chatbotApiClient.get<KnowledgeItemResponse[]>(url, {
        params: { content_type: contentType, skip, limit },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create knowledge item
   * POST /api/v1/chatbots/{chatbot_id}/knowledge
   */
  create: async (
    chatbotId: string,
    data: KnowledgeItemCreate
  ): Promise<KnowledgeItemResponse> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.KNOWLEDGE_CREATE.replace(':chatbotId', chatbotId);
      const response = await chatbotApiClient.post<KnowledgeItemResponse>(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update knowledge item
   * PUT /api/v1/chatbots/{chatbot_id}/knowledge/{item_id}
   */
  update: async (
    chatbotId: string,
    itemId: string,
    data: KnowledgeItemUpdate
  ): Promise<KnowledgeItemResponse> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.KNOWLEDGE_UPDATE
        .replace(':chatbotId', chatbotId)
        .replace(':itemId', itemId);
      const response = await chatbotApiClient.put<KnowledgeItemResponse>(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete knowledge item
   * DELETE /api/v1/chatbots/{chatbot_id}/knowledge/{item_id}
   */
  delete: async (chatbotId: string, itemId: string): Promise<{ message: string }> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.KNOWLEDGE_DELETE
        .replace(':chatbotId', chatbotId)
        .replace(':itemId', itemId);
      const response = await chatbotApiClient.delete<{ message: string }>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// ============================================================================
// Scraping Jobs API
// ============================================================================

export const scrapingApi = {
  /**
   * Get scraping job details
   * GET /api/v1/scraping-jobs/{job_id}
   */
  getJob: async (jobId: string): Promise<ScrapingJobResponse> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.SCRAPING_JOB.replace(':jobId', jobId);
      const response = await chatbotApiClient.get<ScrapingJobResponse>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Retry failed scraping job
   * POST /api/v1/scraping-jobs/{job_id}/retry
   */
  retry: async (jobId: string): Promise<{ message: string }> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.SCRAPING_RETRY.replace(':jobId', jobId);
      const response = await chatbotApiClient.post<{ message: string }>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// ============================================================================
// Conversation Management API
// ============================================================================

export const conversationApi = {
  /**
   * List conversations for a chatbot
   * GET /api/v1/chatbots/{chatbot_id}/conversations
   */
  list: async (
    chatbotId: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<ConversationListResponse> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.CONVERSATIONS_LIST.replace(':chatbotId', chatbotId);
      const response = await chatbotApiClient.get<ConversationListResponse>(url, {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a specific conversation
   * DELETE /api/v1/chatbots/{chatbot_id}/conversations/{conversation_id}
   */
  deleteOne: async (chatbotId: string, conversationId: string): Promise<{ message: string }> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.CONVERSATION_DELETE
        .replace(':chatbotId', chatbotId)
        .replace(':conversationId', conversationId);
      const response = await chatbotApiClient.delete<{ message: string }>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete all conversations for a chatbot
   * DELETE /api/v1/chatbots/{chatbot_id}/conversations
   */
  deleteAll: async (chatbotId: string): Promise<{ message: string; deleted_count: number }> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.CONVERSATIONS_DELETE_ALL.replace(':chatbotId', chatbotId);
      const response = await chatbotApiClient.delete<{ message: string; deleted_count: number }>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get conversation details with full message history
   * GET /api/v1/chatbots/{chatbot_id}/conversations/{conversation_id}
   */
  getHistory: async (chatbotId: string, conversationId: string): Promise<ConversationHistoryResponse> => {
    try {
      const url = API_CONFIG.ENDPOINTS.CHATBOT.CONVERSATION_GET
        .replace(':chatbotId', chatbotId)
        .replace(':conversationId', conversationId);
      const response = await chatbotApiClient.get<ConversationHistoryResponse>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// ============================================================================
// Export all APIs
// ============================================================================

export default {
  wizard: chatbotWizardApi,
  chatbot: chatbotApi,
  chat: chatApi,
  knowledge: knowledgeApi,
  scraping: scrapingApi,
  conversation: conversationApi,
};
