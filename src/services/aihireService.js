import axios from 'axios';
import { getUserData } from '../userStore/userData';
import { apis, API } from '../types';

// Fallback if apis.aihire is not yet defined in types.js
const API_URL = apis?.aihire || '/api/aihire';

const getHeaders = () => {
    const user = getUserData();
    const token = user?.token || localStorage.getItem('token');
    console.log("[AIHIRE SERVICE] Token retrieval:", { fromUser: !!user?.token, fromStorage: !!localStorage.getItem('token'), final: !!token });

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const axiosConfig = {
    withCredentials: true
};

export const generateJobDescription = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/job-description`, data, { ...axiosConfig, headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error("AIHire Service Error:", error);
        throw error;
    }
};

export const generateOfferLetter = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/offer-letter`, data, { ...axiosConfig, headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error("AIHire Service Error:", error.response?.data || error);
        throw error;
    }
};

export const generateInterviewQuestions = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/interview-questions`, data, { ...axiosConfig, headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error("AIHire Service Error:", error);
        throw error;
    }
};

export const getHireHistory = async () => {
    try {
        const response = await axios.get(`${API_URL}/history`, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error("AIHire History Error:", error);
        throw error;
    }
};

export const extractTemplateText = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        // Call the specific aihire route that supports generic templates (PDFs, Images via Vertex AI)
        const response = await axios.post(`${API_URL}/extract-template`, formData, {
            headers: {
                ...getHeaders(),
                "Content-Type": "multipart/form-data"
            },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Template Extraction Error:", error);
        throw error;
    }
};

export const deleteHireDocument = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/history/${id}`, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error("AIHire Delete Error:", error);
        throw error;
    }
};
