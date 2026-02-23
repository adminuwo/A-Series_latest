import axios from "axios";
import { apis } from "../types";
import { getUserData } from "../userStore/userData";
import { getDeviceFingerprint } from "../utils/fingerprint";

export const generateChatResponse = async (history, currentMessage, systemInstruction, attachments, language, abortSignal = null, mode = null, options = {}) => {
    try {
        const token = getUserData()?.token;
        const headers = {
            'X-Device-Fingerprint': getDeviceFingerprint()
        };
        if (token && token !== 'undefined' && token !== 'null') {
            headers.Authorization = `Bearer ${token}`;
        }

        // Enhanced system instruction based on user language
        const langInstruction = language ? `\n\n### LANGUAGE HINT:\n- Respond in ${language} if appropriate for the user's query.` : '';
        const combinedSystemInstruction = ((systemInstruction || '') + langInstruction).trim();

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

        return result.data;

    } catch (error) {
        console.error("Gemini API Error:", error);
        if (error.response?.status === 429) {
            const detail = error.response?.data?.details || error.response?.data?.error;
            if (detail) return `System Busy (429): ${detail}`;
            return "The A-Series system is currently busy (Quota limit reached). Please wait 60 seconds and try again.";
        }
        if (error.response?.status === 401) {
            return "Please [Log In](/login) to your AISA™ account to continue chatting.";
        }
        if (error.response?.data?.error === "LIMIT_REACHED") {
            return { error: "LIMIT_REACHED", reason: error.response.data.reason };
        }
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

const getHeaders = () => {
    const token = getUserData()?.token;
    const headers = {
        'X-Device-Fingerprint': getDeviceFingerprint()
    };
    if (token && token !== 'undefined' && token !== 'null') {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

export const generateImage = async (prompt) => {
    const result = await axios.post(apis.imageGen, { prompt }, { headers: getHeaders() });
    return result.data;
};

export const generateVideo = async (prompt, duration = 5) => {
    const result = await axios.post(apis.videoGen, { prompt, duration }, { headers: getHeaders() });
    return result.data;
};

export const generateAudio = async (prompt, duration = 30) => {
    const result = await axios.post(apis.audioGen, { prompt, duration }, { headers: getHeaders() });
    return result.data;
};

export const performWebSearch = async (query, language = 'English', isDeepSearch = false) => {
    const result = await axios.post(apis.webSearch, { query, language, isDeepSearch }, { headers: getHeaders() });
    return result.data;
};

export const convertDocument = async (base64Data, target_format, source_format = null, fileName = null) => {
    const result = await axios.post(apis.conversion, { base64Data, target_format, source_format, fileName }, { headers: getHeaders() });
    return result.data;
};

export const setReminder = async (title, datetime, isAlarm = false) => {
    const result = await axios.post(apis.reminders, { title, datetime, isAlarm }, { headers: getHeaders() });
    return result.data;
};