import axios from "axios";
import { apis } from "../types";
import { getUserData } from "../userStore/userData";
import { getDeviceFingerprint } from "../utils/fingerprint";

export const generateChatResponse = async (history, currentMessage, systemInstruction, attachments, language, abortSignal = null, mode = null, options = {}) => {
    try {
        const token = getUserData()?.token || localStorage.getItem("token");
        const headers = {
            'X-Device-Fingerprint': getDeviceFingerprint()
        };
        if (token && token !== 'undefined' && token !== 'null') {
            headers.Authorization = `Bearer ${token}`;
        }

        // Enhanced system instruction based on user language
        const langInstruction = language ? `You are a helpful AI assistant. Please respond to the user in ${language}. ` : '';
        const combinedSystemInstruction = (langInstruction + (systemInstruction || '')).trim();

        let images = [];
        let documents = [];
        let finalMessage = currentMessage;

        if (attachments && Array.isArray(attachments)) {
            attachments.forEach(attachment => {
                if (attachment.url && attachment.url.startsWith('data:')) {
                    const base64Data = attachment.url.split(',')[1];
                    const mimeType = attachment.url.substring(attachment.url.indexOf(':') + 1, attachment.url.indexOf(';'));

                    if (attachment.type === 'image' || mimeType.startsWith('image/')) {
                        images.push({ mimeType, base64Data });
                    } else {
                        documents.push({ mimeType: mimeType || 'application/pdf', base64Data, name: attachment.name });
                    }
                } else if (attachment.url) {
                    finalMessage += `\n[Shared File: ${attachment.name || 'Link'} - ${attachment.url}]`;
                }
            });
        }

        // Limit history to last 50 messages to prevent token overflow in unlimited chats
        const recentHistory = history.length > 50 ? history.slice(-50) : history;

        const payload = {
            content: finalMessage,
            history: recentHistory,
            systemInstruction: combinedSystemInstruction,
            image: images,
            document: documents,
            language: language || 'English',
            mode: mode,
            agentType: options?.agentType
        };

        const result = await axios.post(apis.chatAgent, payload, {
            headers: headers,
            signal: abortSignal,
            withCredentials: true
        });

        // Return full response data (includes reply and potentially conversion data)
        // Return full response data (includes reply, conversion data, and imageUrl)
        return result.data;

    } catch (error) {
        console.error("AISA API Error:", error);
        if (error.response?.status === 429) {
            // Allow backend detail to override if present, otherwise default
            const detail = error.response?.data?.details || error.response?.data?.error;
            if (detail) return `System Busy (429): ${detail}`;
            return "The A-Series system is currently busy (Quota limit reached). Please wait 60 seconds and try again.";
        }
        if (error.response?.status === 401) {
            return "Please [Log In](/login) to your AIVA™ account to continue chatting.";
        }
        if (error.response?.data?.error === "LIMIT_REACHED") {
            return { error: "LIMIT_REACHED", reason: error.response.data.reason };
        }
        // Return backend error message if available
        if (error.response?.data?.error) {
            const details = error.response.data.details ? ` - ${error.response.data.details}` : '';
            return `System Message: ${error.response.data.error}${details}`;
        }
        if (error.response?.data?.details) {
            return `System Error: ${error.response.data.details}`;
        }
        return "Sorry, I am having trouble connecting to the A-Series network right now. Please check your connection.";
    }
};

export const generateAIWriteResponse = async (payload) => {
    try {
        const token = getUserData()?.token || localStorage.getItem("token");
        const headers = {
            'X-Device-Fingerprint': getDeviceFingerprint()
        };
        if (token && token !== 'undefined' && token !== 'null') {
            headers.Authorization = `Bearer ${token}`;
        }

        const isFormData = payload instanceof FormData;

        const result = await axios.post(`${apis.aiwrite}/generate`, payload, {
            headers: {
                ...headers,
                'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
            },
            withCredentials: true,
            timeout: 120000 // 2 minutes for complex strategies
        });

        return result.data;

    } catch (error) {
        console.error("AIWRITE API Error:", error);
        if (error.code === 'ECONNABORTED') {
            return { error: "ERROR", message: "Request timed out. The strategy generation is taking longer than expected. Please try a shorter frequency (e.g., Weekly) or try again." };
        }
        if (error.response?.status === 403) {
            return { error: "LIMIT_REACHED", reason: error.response.data.error };
        }
        if (error.response?.status === 401) {
            return { error: "ERROR", message: "Your session has expired or is invalid. Please log out and sign in again to continue." };
        }
        return { error: "ERROR", message: error.response?.data?.error || "Failed to generate content" };
    }
};
export const generateAIHealthSymptomCheck = async (payload) => {
    try {
        const token = getUserData()?.token || localStorage.getItem("token");
        const headers = {
            'X-Device-Fingerprint': getDeviceFingerprint()
        };
        if (token && token !== 'undefined' && token !== 'null') {
            headers.Authorization = `Bearer ${token}`;
        }

        const result = await axios.post(`${apis.aihealth}/symptom-check`, payload, {
            headers: headers,
            withCredentials: true
        });

        return result.data;

    } catch (error) {
        console.error("AIHEALTH Symptom Check API Error:", error);
        return { success: false, error: error.response?.data?.error || "Symptom analysis failed" };
    }
};

export const generateAIHealthWellnessPlan = async (payload) => {
    try {
        const token = getUserData()?.token || localStorage.getItem("token");
        const headers = { 'X-Device-Fingerprint': getDeviceFingerprint() };
        if (token && token !== 'undefined' && token !== 'null') headers.Authorization = `Bearer ${token}`;

        const result = await axios.post(`${apis.aihealth}/wellness-plan`, payload, { headers, withCredentials: true });
        return result.data;
    } catch (error) {
        console.error("AIHEALTH Wellness Plan API Error:", error);
        return { success: false, error: error.response?.data?.error || "Wellness plan generation failed" };
    }
};

export const generateAIHealthMentalSupport = async (payload) => {
    try {
        const token = getUserData()?.token || localStorage.getItem("token");
        const headers = { 'X-Device-Fingerprint': getDeviceFingerprint() };
        if (token && token !== 'undefined' && token !== 'null') headers.Authorization = `Bearer ${token}`;

        const result = await axios.post(`${apis.aihealth}/mental-support`, payload, { headers, withCredentials: true });
        return result.data;
    } catch (error) {
        console.error("AIHEALTH Mental Support API Error:", error);
        return { success: false, error: error.response?.data?.error || "Mental support analysis failed" };
    }
};

export const generateAIHealthTreatmentGuide = async (payload) => {
    try {
        const token = getUserData()?.token || localStorage.getItem("token");
        const headers = { 'X-Device-Fingerprint': getDeviceFingerprint() };
        if (token && token !== 'undefined' && token !== 'null') headers.Authorization = `Bearer ${token}`;

        const result = await axios.post(`${apis.aihealth}/treatment-guide`, payload, { headers, withCredentials: true });
        return result.data;
    } catch (error) {
        console.error("AIHEALTH Treatment Guide API Error:", error);
        return { success: false, error: error.response?.data?.error || "Treatment guide generation failed" };
    }
};

export const generateAIHealthReportAnalysis = async (formData) => {
    try {
        const token = getUserData()?.token || localStorage.getItem("token");
        const headers = {
            'X-Device-Fingerprint': getDeviceFingerprint(),
            'Content-Type': 'multipart/form-data'
        };
        if (token && token !== 'undefined' && token !== 'null') headers.Authorization = `Bearer ${token}`;

        const result = await axios.post(`${apis.aihealth}/report-analysis`, formData, { headers, withCredentials: true });
        return result.data;
    } catch (error) {
        console.error("AIHEALTH Report Analysis API Error:", error);
        return { success: false, error: error.response?.data?.error || "Report analysis failed" };
    }
};
export const generateAIHealthAutomation = async (payload) => {
    try {
        const token = getUserData()?.token || localStorage.getItem("token");
        const headers = { 'X-Device-Fingerprint': getDeviceFingerprint() };
        if (token && token !== 'undefined' && token !== 'null') headers.Authorization = `Bearer ${token}`;

        const result = await axios.post(`${apis.aihealth}/automation`, payload, { headers, withCredentials: true });
        return result.data;
    } catch (error) {
        console.error("AIHEALTH Automation API Error:", error);
        return { success: false, error: error.response?.data?.error || "Health automation scan failed" };
    }
};
export const generateAIHealthLogData = async (payload) => {
    try {
        const token = getUserData()?.token || localStorage.getItem("token");
        const headers = { 'X-Device-Fingerprint': getDeviceFingerprint() };
        if (token && token !== 'undefined' && token !== 'null') headers.Authorization = `Bearer ${token}`;

        const result = await axios.post(`${apis.aihealth}/log-data`, payload, { headers, withCredentials: true });
        return result.data;
    } catch (error) {
        console.error("AIHEALTH Log Data API Error:", error);
        return { success: false, error: error.response?.data?.error || "Health data logging failed" };
    }
};

// --- AIBIZ Specialized Functions ---
export const analyzeAIBizCRM = async (payload) => {
    try {
        const token = getUserData()?.token || localStorage.getItem("token");
        const headers = { 'X-Device-Fingerprint': getDeviceFingerprint() };
        if (token && token !== 'undefined' && token !== 'null') headers.Authorization = `Bearer ${token}`;

        const result = await axios.post(`${apis.aibiz}/analyze-crm`, payload, { headers, withCredentials: true });
        return result.data;
    } catch (error) {
        console.error("AIBIZ CRM Analysis API Error:", error);
        return { success: false, error: error.response?.data?.error || "CRM analysis failed" };
    }
};

export const scoreAIBizLead = async (payload) => {
    try {
        const token = getUserData()?.token || localStorage.getItem("token");
        const headers = { 'X-Device-Fingerprint': getDeviceFingerprint() };
        if (token && token !== 'undefined' && token !== 'null') headers.Authorization = `Bearer ${token}`;

        const result = await axios.post(`${apis.aibiz}/score-lead`, payload, { headers, withCredentials: true });
        return result.data;
    } catch (error) {
        console.error("AIBIZ Lead Score API Error:", error);
        return { success: false, error: error.response?.data?.error || "Lead scoring failed" };
    }
};

export const segmentAIBizCustomers = async (payload) => {
    try {
        const token = getUserData()?.token || localStorage.getItem("token");
        const headers = { 'X-Device-Fingerprint': getDeviceFingerprint() };
        if (token && token !== 'undefined' && token !== 'null') headers.Authorization = `Bearer ${token}`;

        const result = await axios.post(`${apis.aibiz}/segment-customers`, payload, { headers, withCredentials: true });
        return result.data;
    } catch (error) {
        console.error("AIBIZ Customer Segmentation API Error:", error);
        return { success: false, error: error.response?.data?.error || "Customer segmentation failed" };
    }
};

export const generateAIBizCampaign = async (payload) => {
    try {
        const token = getUserData()?.token || localStorage.getItem("token");
        const headers = { 'X-Device-Fingerprint': getDeviceFingerprint() };
        if (token && token !== 'undefined' && token !== 'null') headers.Authorization = `Bearer ${token}`;

        const result = await axios.post(`${apis.aibiz}/generate-campaign`, payload, { headers, withCredentials: true });
        return result.data;
    } catch (error) {
        console.error("AIBIZ Campaign API Error:", error);
        return { success: false, error: error.response?.data?.error || "Campaign generation failed" };
    }
};
