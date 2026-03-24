// Generic API service for Dashboard, Automations, Agents, Admin, and Auth
import axios from "axios";
import { API } from "../types";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    let token = localStorage.getItem('token');

    if (!token && user) {
      try {
        const userData = JSON.parse(user);
        token = userData.token;
      } catch (e) {
        console.error("Error parsing user data for token", e);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user data and redirect to login on unauthorized
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // --- AI Tools ---
  async generateImage(prompt, modelMapping, provider) {
    try {
      console.log(`[Frontend] Generating image for prompt: "${prompt}" with model: ${modelMapping || 'default'} and provider: ${provider || 'openai'}`);
      
      const endpoint = provider === 'vertex' ? 'image/generate' : 'openai/image';
      
      // Increased timeout to 60s for image generation
      const response = await apiClient.post(endpoint, { prompt, modelMapping }, { timeout: 60000 });
      console.log("[Frontend] Image generation success:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to generate image:", error);
      if (error.response) {
        console.error("Error Status:", error.response.status);
        console.error("Error Data:", error.response.data);
      }
      throw error;
    }
  },

  async generateVideo(prompt, duration = 5, quality = 'medium') {
    try {
      console.log("[Frontend] Generating video for prompt:", prompt);
      // Increased timeout to 120s for video generation as it takes longer
      const response = await apiClient.post('video/generate', { prompt, duration, quality }, { timeout: 120000 });
      console.log("[Frontend] Video generation success:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to generate video:", error);
      throw error;
    }
  },

  // --- Auth ---
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.warn('Backend login failed, falling back to mock auth for demo:', error.message);

      // Mock fallback for demo purposes
      if (credentials.email && credentials.password) {
        return {
          id: 'demo-user-123',
          name: 'Demo User',
          email: credentials.email,
          avatar: ''
        };
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to connect to server');
    }
  },

  async signup(userData) {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.warn('Backend signup failed, falling back to mock auth for demo:', error.message);

      // Mock fallback for demo purposes
      return {
        id: 'demo-user-' + Date.now(),
        name: userData.name,
        email: userData.email,
        avatar: ''
      };
    }
  },

  // --- Dashboard Stats ---
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      // Mock fallback
      return {
        totalChats: 24,
        activeAgents: 6,
        tokensUsed: 450230,
        savedTime: '18h 45m'
      };
    }
  },

  async getAdminOverviewStats() {
    try {
      const response = await apiClient.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Backend admin stats failed:', error.message);
      throw error;
    }
  },

  async getAdminRevenueStats() {
    try {
      const response = await apiClient.get('/revenue/stats');
      return response.data;
    } catch (error) {
      console.error('Backend revenue stats failed:', error.message);
      throw error;
    }
  },

  async getAdminTransactions() {
    try {
      const response = await apiClient.get('/revenue/admin/all-transactions');
      return response.data;
    } catch (error) {
      console.error('Backend fetch transactions failed:', error.message);
      return []; // Return empty array on failure to prevent crashes
    }
  },

  async getAuditLogs(search = '') {
    try {
      const params = search ? { search } : {};
      const response = await apiClient.get('/audit-logs', { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      return [];
    }
  },

  // --- Agents ---
  async getCreatedAgents() {
    try {
      const response = await apiClient.get('/agents/created-by-me');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch created agents:", error);
      throw error;
    }
  },

  async getAgents() {
    try {
      const response = await apiClient.get('/agents');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      throw error;
    }
  },

  async getAgentById(id) {
    try {
      const response = await apiClient.get(`/agents/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch agent details:", error);
      throw error;
    }
  },

  async createAgent(agentData) {
    try {
      const response = await apiClient.post('/agents', agentData);
      return response.data;
    } catch (error) {
      console.error("Failed to create agent:", error);
      throw error;
    }
  },

  async updateAgent(id, updates) {
    try {
      const response = await apiClient.put(`/agents/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Failed to update agent:", error);
      throw error;
    }
  },

  async deleteAgent(id, force = false) {
    try {
      await apiClient.delete(`/agents/${id}`, { params: { force } });
      return true;
    } catch (error) {
      console.error("Failed to delete agent:", error);
      throw error;
    }
  },

  // --- Review Workflow ---
  async submitForReview(id) {
    try {
      const response = await apiClient.post(`/agents/submit-review/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to submit review:", error);
      throw error;
    }
  },

  async approveAgent(id, message) {
    try {
      const response = await apiClient.post(`/agents/approve/${id}`, { message });
      return response.data;
    } catch (error) {
      console.error("Failed to approve agent:", error);
      throw error;
    }
  },

  async rejectAgent(id, reason) {
    try {
      const response = await apiClient.post(`/agents/reject/${id}`, { reason });
      return response.data;
    } catch (error) {
      console.error("Failed to reject agent:", error);
      throw error;
    }
  },

  // Revenue endpoints for vendor/admin removed as per feature decommissioning.

  async downloadInvoice(transactionId) {
    try {
      const response = await apiClient.get(`/revenue/invoice/${transactionId}`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Failed to download invoice:", error);
      throw error;
    }
  },

  // --- Notifications ---
  async getNotifications() {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error) {
      console.warn("Using mock notifications");
      return [];
    }
  },

  async markNotificationRead(id) {
    try {
      const response = await apiClient.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error("Failed to mark notification read:", error);
    }
  },

  async deleteNotification(id) {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete notification:", error);
      throw error;
    }
  },

  // --- Automations ---
  async getAutomations() {
    try {
      const response = await apiClient.get('/automations');
      return response.data;
    } catch (error) {
      const stored = localStorage.getItem('mock_automations');
      if (stored) return JSON.parse(stored);

      const defaults = [
        { id: '1', name: 'Daily Digest', description: 'Summarize unread emails at 9 AM', active: true, type: 'Email' },
        { id: '2', name: 'Lead Qualifier', description: 'Score incoming leads from CRM', active: false, type: 'CRM' },
        { id: '3', name: 'Code Reviewer', description: 'Auto-review PRs on GitHub', active: true, type: 'Dev' },
        { id: '4', name: 'Meeting Notes', description: 'Transcribe and summarize Zoom calls', active: true, type: 'Productivity' }
      ];

      localStorage.setItem('mock_automations', JSON.stringify(defaults));
      return defaults;
    }
  },

  async toggleAutomation(id) {
    try {
      const response = await apiClient.post(`/automations/${id}/toggle`);
      return response.data;
    } catch (error) {
      const stored = JSON.parse(localStorage.getItem('mock_automations') || '[]');

      const updated = stored.map(a =>
        a.id === id ? { ...a, active: !a.active } : a
      );

      localStorage.setItem('mock_automations', JSON.stringify(updated));

      return updated.find(a => a.id === id);
    }
  },

  // --- Admin ---
  async getAdminSettings() {
    try {
      const response = await apiClient.get('/admin/settings');
      return response.data;
    } catch (error) {
      const stored = localStorage.getItem('mock_admin_settings');
      if (stored) return JSON.parse(stored);

      return {
        allowPublicSignup: true,
        defaultModel: 'gemini-2.5-flash',
        maxTokensPerUser: 500000,
        organizationName: 'ACME Corp'
      };
    }
  },

  async updateAdminSettings(settings) {
    try {
      const response = await apiClient.post('/admin/settings', settings);
      return response.data;
    } catch (error) {
      localStorage.setItem('mock_admin_settings', JSON.stringify(settings));
      return settings;
    }
  },

  async getPublicSettings() {
    try {
      const response = await apiClient.get('/settings/public');
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch public settings, using defaults");
      return {
        platformName: 'A-Series™',
        supportPhone: '',
        announcement: '',
        contactEmail: ''
      };
    }
  },

  async getAllUsers() {
    try {
      const response = await apiClient.get('/user/all');
      return response.data;
    } catch (error) {
      console.error('Backend get users failed:', error.message);
      throw error;
    }
  },

  async toggleBlockUser(id, isBlocked) {
    try {
      const response = await apiClient.put(`/user/${id}/block`, { isBlocked });
      return response.data;
    } catch (error) {
      console.error("Failed to block/unblock user:", error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      await apiClient.delete(`/user/${id}`);
      return true;
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  },

  // --- Reports ---
  async submitReport(reportData) {
    try {
      const response = await apiClient.post('/reports/submit', reportData);
      return response.data;
    } catch (error) {
      console.warn("Backend report submission failed, using mock:", error.message);
      // Mock successful response for demo
      return { success: true, message: "Report submitted successfully (mock)" };
    }
  },

  async getReports(search = '') {
    try {
      const params = search ? { search } : {};
      const response = await apiClient.get('/reports', { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      return [];
    }
  },

  async resolveReport(id, status, resolutionNote) {
    try {
      const response = await apiClient.put(`/reports/${id}/resolve`, { status, resolutionNote });
      return response.data;
    } catch (error) {
      console.error("Failed to resolve report:", error);
      throw error;
    }
  },

  // --- Support Tickets ---
  async createSupportTicket(ticketData) {
    try {
      const response = await apiClient.post('/support', ticketData);
      return response.data;
    } catch (error) {
      console.error("Failed to create support ticket:", error);
      throw error;
    }
  },

  async getSupportTickets(search = '') {
    try {
      const params = search ? { search } : {};
      const response = await apiClient.get('/support', { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch support tickets:", error);
      return [];
    }
  },

  async updateSupportTicketStatus(id, status, resolutionNote) {
    try {
      const response = await apiClient.put(`/support/${id}/status`, { status, resolutionNote });
      return response.data;
    } catch (error) {
      console.error("Failed to update support ticket status:", error);
      throw error;
    }
  },

  async deleteReport(id) {
    try {
      const response = await apiClient.delete(`/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete report:", error);
      throw error;
    }
  },

  async deleteSupportTicket(id) {
    try {
      const response = await apiClient.delete(`/support/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete support ticket:", error);
      throw error;
    }
  },



  // --- Personal Assistant ---
  async getPersonalTasks(params) {
    try {
      const response = await apiClient.get('/personal-assistant/tasks', { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      return [];
    }
  },

  async createPersonalTask(data) {
    try {
      const response = await apiClient.post('/personal-assistant/tasks', data);
      return response.data;
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  },

  async updatePersonalTask(id, data) {
    try {
      const response = await apiClient.put(`/personal-assistant/tasks/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  },

  async deletePersonalTask(id) {
    try {
      const response = await apiClient.delete(`/personal-assistant/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  }
};

export default apiService;