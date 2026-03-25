// Message Type (JSDoc for IntelliSense)
export const MessageRole = {
  USER: "user",
  MODEL: "model",
};

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {"user" | "model"} role
 * @property {string} content
 * @property {number} timestamp
 */

/**
 * @typedef {Object} ChatSession
 * @property {string} id
 * @property {string} title
 * @property {Message[]} messages
 * @property {string=} agentId
 * @property {number} lastModified
 */

/**
 * @typedef {Object} Agent
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} avatar
 * @property {"productivity" | "creative" | "coding" | "lifestyle"} category
 * @property {boolean} installed
 * @property {string} instructions
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} avatar
 */

// AppRoute Enum → Convert to constant object
export const AppRoute = {
  LANDING: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  E_Verification: "/verification",
  DASHBOARD: "/dashboard",
  MARKETPLACE: "/dashboard/marketplace",
  MY_AGENTS: "/dashboard/agents",
  SETTINGS: "/dashboard/settings",
  INVOICES: "/dashboard/invoices",
  NOTIFICATIONS: "/dashboard/notifications",
  SECURITY: "/dashboard/security",
  ADMIN: "/dashboard/admin",
  PROFILE: "/dashboard/profile",
  USER_TRANSACTIONS: "/dashboard/transactions",
  TRUST_SAFETY_COMPLIANCE: "/dashboard/trust-safety-compliance",
  agentSoon: "/agentsoon",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password/:token",
  CHAT: "/dashboard/chat",
  WORKSPACE: "/dashboard/workspace",
  WORKSPACE_AGENT: "/dashboard/workspace/:agentId",
  WORKSPACE_SESSION: "/dashboard/workspace/:agentId/:sessionId",
  AI_HIRE: "/dashboard/workspace/AIHIRE",
};





const PROD_API = "https://a-series-backend-743928421487.asia-south1.run.app/api";
const DEV_API = "http://localhost:8080/api";

// Robust check: if we are on a live domain, consider it production
const isLiveDomain = typeof window !== 'undefined' && 
  (window.location.hostname.includes('onrender.com') || 
   window.location.hostname.includes('aimall24.com') || 
   window.location.hostname.includes('a-series.in'));

export const API = isLiveDomain
  ? (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== '/api' ? import.meta.env.VITE_API_BASE_URL : PROD_API)
  : (import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? PROD_API : DEV_API));
console.log('API Target:', API);

export const apis = {
  emailVerificationApi: `${API}/email_varification`,
  signUp: `${API}/auth/signup`,
  logIn: `${API}/auth/login`,
  forgotPassword: `${API}/auth/forgot-password`,
  resetPassword: `${API}/auth/reset-password`,
  user: `${API}/user`,
  uploadAvatar: `${API}/user/avatar`,
  getPayments: `${API}/user/payments`,
  notifications: `${API}/notifications`,
  agents: `${API}/agents`,
  buyAgent: `${API}/agents/buy`,
  getUserAgents: `${API}/agents/get_my_agents`,
  getMyAgents: `${API}/agents/me`,
  chatAgent: `${API}/chat`,
  aibiz: `${API}/aibiz`,
  aihire: `${API}/aihire`,
  aiwrite: `${API}/aiwrite`,
  aihealth: `${API}/aihealth`,
  support: `${API}/support`,
  resetPasswordEmail: `${API}/auth/reset-password-email`,
  feedback: `${API}/feedback`,
  synthesizeVoice: `${API}/voice/synthesize`,
  synthesizeFile: `${API}/voice/synthesize-file`,
  createOrder: `${API}/payments/create-order`,
  verifyPayment: `${API}/payments/verify`,
  sendForgotOTP: `${API}/auth/send-forgot-otp`,
  verifyForgotOTP: `${API}/auth/verify-forgot-otp`,
  resetPasswordOTP: `${API}/auth/reset-password-otp`,
  imageGen: `${API}/image/generate`,
  videoGen: `${API}/video/generate`,
  audioGen: `${API}/audio/generate`,
  webSearch: `${API}/search/web`,
  conversion: `${API}/conversion`,
  reminders: `${API}/reminders`,
  backendUrl: API,
};
