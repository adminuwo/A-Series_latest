import React, { useState } from 'react';
import {
    Upload as LuUpload, GraduationCap, Rocket, UserCheck, Instagram,
    Building2, BookOpen, Search, Zap, Sparkles,
    ChevronDown, Settings2, FileText, Calendar,
    Languages, PenTool, Layout, Mail, Target,
    Megaphone, Hash, PlaySquare, Book, MessageSquare,
    CheckCircle2, Plus, Clock, Globe, Target as TargetIcon, FileSpreadsheet,
    Award, BarChart3, Presentation, Monitor, MousePointer2,
    TrendingUp, Lightbulb, Layers, Briefcase, BadgeDollarSign,
    UserPlus, Shapes, Smile, Music, Tv, Quote, Vote,
    Download, Key, ListTree, Database, History, Trash2, RefreshCw, ArrowRight, X,
    Loader2, Linkedin, Cpu, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../../Components/AISAWorkSpace/CustomSelect';
import { useToast } from '../../Components/Toast/ToastContext';
import apiService from '../../services/apiService';
import { generateChatResponse } from '../../services/aisaService';
import { chatStorageService } from '../../services/chatStorageService';

const SEGMENTS = [
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'startups', label: 'Startups', icon: Rocket },
    { id: 'freelancers', label: 'Freelancers', icon: UserCheck },
    { id: 'influencers', label: 'Influencers', icon: Instagram },
    { id: 'agencies', label: 'Agencies', icon: Building2 },
    { id: 'authors', label: 'Authors', icon: BookOpen }
];

const AIWRITEInputs = ({
    handleAction,
    isProcessing,
    writeSegment, setWriteSegment,
    agencyClientName, setAgencyClientName,
    agencyIndustry, setAgencyIndustry,
    agencyTargetAudience, setAgencyTargetAudience,
    agencyMonth, setAgencyMonth,
    agencyFrequency, setAgencyFrequency,
    agencySocialGoal, setAgencySocialGoal,
    agencyTone, setAgencyTone,
    agencyPlatforms, setAgencyPlatforms,
    agencyView, setAgencyView,
    agencyUSP, setAgencyUSP,
    agencyKeyword, setAgencyKeyword,
    agencyWordCount, setAgencyWordCount,
    agencyPageDescription, setAgencyPageDescription,
    sessions,
    currentSessionId,
    onDeleteSession,
    navigate,
    onClearWorkspace,
    studentSubject, setStudentSubject,
    studentTopic, setStudentTopic,
    studentWordCount, setStudentWordCount,
    studentTone, setStudentTone,
    isAcademicFormat, setIsAcademicFormat,
    studentFeature, setStudentFeature,
    startupName, setStartupName,
    startupProduct, setStartupProduct,
    startupProblem, setStartupProblem,
    startupSolution, setStartupSolution,
    startupTone, setStartupTone,
    startupPlatform, setStartupPlatform,
    startupFeature, setStartupFeature,
    startupAudience, setStartupAudience,
    freelancerService, setFreelancerService,
    freelancerClientType, setFreelancerClientType,
    freelancerBudget, setFreelancerBudget,
    freelancerTone, setFreelancerTone,
    freelancerFeature, setFreelancerFeature,
    influencerNiche, setInfluencerNiche,
    influencerMood, setInfluencerMood,
    useEmojis, setUseEmojis,
    hashtagCount, setHashtagCount,
    influencerFeature, setInfluencerFeature,
    authorStoryTopic, setAuthorStoryTopic,
    authorGenre, setAuthorGenre,
    authorTone, setAuthorTone,
    authorFeature, setAuthorFeature,
    authorTheme, setAuthorTheme,
    authorMood, setAuthorMood,
    authorStyle, setAuthorStyle,
    authorRhyme, setAuthorRhyme,
    authorCharacters, setAuthorCharacters,
    authorScript, setAuthorScript,
    authorContext, setAuthorContext,
    authorLength, setAuthorLength,
    agencyFeature, setAgencyFeature,
    aiWriteResult, setAiWriteResult,
    isMultiOutputEnabled, setIsMultiOutputEnabled,
    automationWorkflows, setAutomationWorkflows,
    automationDeadlines, setAutomationDeadlines,
    authorLanguage, setAuthorLanguage,
    authorFile, setAuthorFile
}) => {
    const [segment, setSegment] = [writeSegment, setWriteSegment];
    const [mode, setMode] = [agencyView, setAgencyView];
    const toast = useToast();

    const handleLocalClear = () => {
        // Parent clear (messages, session)
        onClearWorkspace();

        // Resets via parent setters
        setStudentTopic('');
        setStudentSubject('');
        setStudentWordCount('1000');
        setStudentTone('Academic');
        setIsAcademicFormat(true);
        setStudentFeature('assignment_writer');

        setStartupName('');
        setStartupProduct('');
        setStartupProblem('');
        setStartupSolution('');
        setStartupTone('Energetic');
        setStartupPlatform('Google/Facebook Ads');
        setStartupFeature('ad_copy');
        setStartupAudience('');

        setFreelancerService('');
        setFreelancerClientType('');
        setFreelancerBudget('');
        setFreelancerTone('Professional');
        setFreelancerFeature('proposal_generator');

        setInfluencerNiche('Fitness');
        setInfluencerMood('Motivational');
        setUseEmojis(true);
        setHashtagCount('10');
        setInfluencerFeature('insta_caption');

        setAuthorStoryTopic('');
        setAuthorGenre('Fiction');
        setAuthorTone('Creative');
        setAuthorFeature('manuscript_editor');
        setAuthorTheme('');
        setAuthorMood('Mysterious');
        setAuthorStyle('Free Verse');
        setAuthorRhyme(false);
        setAuthorCharacters('');
        setAuthorScript('');
        setAuthorContext('');
        setAuthorLength('Medium');

        setAgencyClientName('');
        setAgencyIndustry('');
        setAgencyTargetAudience('');
        setAgencyUSP('');
        setAgencyFeature('daily_ideas');
        setAgencySocialGoal('Brand Awareness');
        setAgencyMonth('February');
        setAgencyFrequency('3x per week');
        setAgencyPlatforms(['Instagram', 'LinkedIn']);
        setAgencyTone('Expert');

        setLocalUploadedFile(null);
        setAiWriteResult('');
        setRefinePrompt('');
        setSelectedRefineTags([]);

        // Automation Reset
        setIsMultiOutputEnabled(false);
        setAutomationWorkflows([
            { id: 1, title: 'Monday Assignment Draft', schedule: 'Every Monday', active: true, type: 'draft' },
            { id: 2, title: 'Auto-Write New Topics', schedule: 'On Topic Added', active: false, type: 'auto' }
        ]);
        setAutomationDeadlines([
            { id: 1, topic: 'Machine Learning Ethics', date: '2026-03-05', status: 'Pending' }
        ]);
    };


    // --- SEGMENT SPECIFIC STATES --- (Managed in Parent)

    // 7. Advanced Engine State
    const [isAdvancedEngineOpen, setIsAdvancedEngineOpen] = useState(false);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [selectedRefineTags, setSelectedRefineTags] = useState([]);
    const [advancedActiveTab, setAdvancedActiveTab] = useState('headlines');
    const [isLocalHistoryOpen, setIsLocalHistoryOpen] = useState(false);
    const [historySearch, setHistorySearch] = useState('');

    const REFINE_TAGS = [
        'MAKE IT PUNCHIER', 'MORE PROFESSIONAL', 'ADD EMOJIS', 'FOCUS ON SEO',
        'REWRITE FOR LINKEDIN', 'SHORTEN IT', 'EXPAND IT', 'SIMPLIFY LANGUAGE',
        'ADD VIRAL HOOK', 'HUMANIZE CONTENT'
    ];

    const [isAutoSuggesting, setIsAutoSuggesting] = useState(false);
    const [autoTopics, setAutoTopics] = useState([]);
    const [automationMode, setAutomationMode] = useState('manual');

    const toggleRefineTag = (tag) => {
        setSelectedRefineTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleAdvancedExecute = () => {
        handleAction(null, {
            segment,
            type: 'advanced_refinement',
            inputs: {
                prompt: refinePrompt,
                tags: selectedRefineTags,
                tab: advancedActiveTab,
                currentContent: aiWriteResult // Pass current result for refinement
            }
        });
        setIsAdvancedEngineOpen(false);
    };

    const [localUploadedFile, setLocalUploadedFile] = useState(null);
    const [agencyOverviewMode, setAgencyOverviewMode] = useState('text');

    const agencyInputs = {
        companyName: agencyClientName,
        industry: agencyIndustry,
        targetAudience: agencyTargetAudience,
        goal: agencySocialGoal,
        month: agencyMonth,
        frequency: agencyFrequency,
        platforms: agencyPlatforms,
        usp: agencyUSP,
        pageDescription: agencyPageDescription,
        keyword: agencyKeyword,
        wordCount: agencyWordCount,
        uploadedFile: localUploadedFile,
        overviewMode: agencyOverviewMode
    };

    const setAgencyInputs = (updater) => {
        const next = typeof updater === 'function' ? updater(agencyInputs) : updater;
        if (next.companyName !== undefined) setAgencyClientName(next.companyName);
        if (next.industry !== undefined) setAgencyIndustry(next.industry);
        if (next.targetAudience !== undefined) setAgencyTargetAudience(next.targetAudience);
        if (next.goal !== undefined) setAgencySocialGoal(next.goal);
        if (next.month !== undefined) setAgencyMonth(next.month);
        if (next.frequency !== undefined) setAgencyFrequency(next.frequency);
        if (next.platforms !== undefined) setAgencyPlatforms(next.platforms);
        if (next.usp !== undefined) setAgencyUSP(next.usp);
        if (next.pageDescription !== undefined) setAgencyPageDescription(next.pageDescription);
        if (next.keyword !== undefined) setAgencyKeyword(next.keyword);
        if (next.wordCount !== undefined) setAgencyWordCount(next.wordCount);
        if (next.uploadedFile !== undefined) setLocalUploadedFile(next.uploadedFile);
        if (next.overviewMode !== undefined) setAgencyOverviewMode(next.overviewMode);
    };



    const [isExtracting, setIsExtracting] = useState(false);

    const handleAutoFill = async () => {
        if (!agencyInputs.uploadedFile) return;
        setIsExtracting(true);
        try {
            // 1. Upload to backend for real text extraction (RAG Pipeline)
            const uploadResult = await apiService.uploadKnowledgeDocument(agencyInputs.uploadedFile);

            if (uploadResult.success && uploadResult.data.textContent) {
                // 2. Use AIVA to parse the extracted local context into structured brand data
                const extractionPrompt = `
                    Analyze the following company document text and extract specific brand intelligence:
                    1. Company Name
                    2. Industry
                    3. Primary Target Audience
                    4. Unique Selling Proposition (USP) or Core Mission
                    
                    Text: ${uploadResult.data.textContent.substring(0, 15000)}
                    
                    Return ONLY a valid JSON object with EXACTLY these keys: companyName, industry, targetAudience, usp.
                `;

                const aiResponse = await generateChatResponse([], extractionPrompt, "You are a specialized Brand Intelligence Agent for RAG operations.");

                let brandIntel = null;
                const responseText = aiResponse?.data || aiResponse?.reply || (typeof aiResponse === 'string' ? aiResponse : '');

                if (responseText) {
                    try {
                        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                        if (jsonMatch) brandIntel = JSON.parse(jsonMatch[0]);
                    } catch (e) {
                        console.error("Failed to parse brand intelligence JSON", e);
                    }
                }

                if (brandIntel) {
                    setAgencyInputs(prev => ({
                        ...prev,
                        companyName: brandIntel.companyName || prev.companyName,
                        industry: brandIntel.industry || prev.industry,
                        targetAudience: brandIntel.targetAudience || prev.targetAudience,
                        usp: brandIntel.usp || prev.usp
                    }));
                }
            }
        } catch (err) {
            console.error("RAG Processing Failed:", err);
            // Fallback for demo if backend fails
            if (agencyInputs.uploadedFile.name.toLowerCase().includes('uwo')) {
                setAgencyInputs(prev => ({
                    ...prev,
                    companyName: 'UWO Pvt Ltd',
                    industry: 'SaaS and IT',
                    targetAudience: 'Marketing Agencies',
                    usp: 'AI-Powered automation for scaling content production.'
                }));
            }
        } finally {
            setIsExtracting(false);
        }
    };

    const handleAutoSuggestTopic = async () => {
        setIsAutoSuggesting(true);
        try {
            // Fetch past assignments for context
            const pastSessions = await chatStorageService.getSessions('AIWRITE');
            const pastAssignmentTitles = pastSessions.slice(0, 5).map(s => s.title).join(', ');

            const prompt = `
                Generate 5 relevant or innovative academic/professional research topics based on:
                Subject: "${studentSubject || 'General Digital Trends'}"
                Current Topic Interest: "${studentTopic || 'N/A'}"
                User's Past Assignments: "${pastAssignmentTitles || 'None yet'}"
                
                Automation Requirements:
                1. Check for Trending academic topics in this field (2025-2026).
                2. Ensure topics follow a logical progression from past assignments if applicable.
                3. Align strictly with the course subject.

                Focus on modern, high-impact titles that would be perfect for a student or professional assignment.
                Return ONLY a valid JSON array of strings: ["Topic 1", "Topic 2", ...]
            `;
            const aiResponse = await generateChatResponse([], prompt, "You are an Academic Topic Intelligence Agent specialized in contextual automation.");
            const responseText = aiResponse?.data || aiResponse?.reply || (typeof aiResponse === 'string' ? aiResponse : '');

            if (responseText) {
                const jsonMatch = responseText.match(/\[.*\]/s);
                if (jsonMatch) {
                    const topics = JSON.parse(jsonMatch[0]);
                    setAutoTopics(topics);
                    setAutomationMode('suggested');
                }
            }
        } catch (err) {
            console.error("Auto Suggest failed", err);
            setAutoTopics([
                "The Impact of Generative AI on Academic Integrity",
                "Sustainable Urban Planning using IoT & Digital Twins",
                "Psychology of Remote Work: A Longitudinal Study",
                "Blockchain beyond Crypto: Decentralized Governance",
                "Ethical Implications of Gene Editing in Modern Medicine"
            ]);
            setAutomationMode('suggested');
        } finally {
            setIsAutoSuggesting(false);
        }
    };

    const handleTrendDetection = async () => {
        setIsAutoSuggesting(true);
        try {
            const pastSessions = await chatStorageService.getSessions('AIWRITE');
            const pastAssignmentTitles = pastSessions.slice(0, 3).map(s => s.title).join(', ');

            const prompt = `
                Act as a Trend Analysis Agent. Detect the latest (2026) trending academic and professional research subjects for:
                Field: "${studentSubject || 'Digital Technology'}"
                User Context: "${pastAssignmentTitles || 'New Student'}"
                
                Identify 5 cutting-edge topics that are currently viral in research papers, industrial journals, or academic discussions.
                Return ONLY a valid JSON array of strings: ["Trending Topic 1", "Trending Topic 2", ...]
            `;
            const aiResponse = await generateChatResponse([], prompt, "Focus on real-time 2026 trends and academic relevance.");
            const responseText = aiResponse?.data || aiResponse?.reply || (typeof aiResponse === 'string' ? aiResponse : '');

            if (responseText) {
                const jsonMatch = responseText.match(/\[.*\]/s);
                if (jsonMatch) {
                    const topics = JSON.parse(jsonMatch[0]);
                    setAutoTopics(topics);
                    setAutomationMode('trending');
                }
            }
        } catch (err) {
            console.error("Trend detection failed", err);
            setAutoTopics([
                "2026 Shift: The Rise of Sovereign AI Infrastructures",
                "Post-Quantum Cryptography: Protecting Global Data",
                "Circular Economy: Tech-Driven Zero Waste Models",
                "Bio-Digital Convergence: The New Health Frontier",
                "Autonomous Agents in Enterprise Decision Making"
            ]);
            setAutomationMode('trending');
        } finally {
            setIsAutoSuggesting(false);
        }
    };

    const handleScheduledGen = async () => {
        setIsAutoSuggesting(true);
        try {
            const pastSessions = await chatStorageService.getSessions('AIWRITE');
            const pastAssignmentTitles = pastSessions.slice(0, 5).map(s => s.title).join(', ');

            const prompt = `
                Simulate a 'Weekly Academic Schedule' or 'Learning Roadmap'.
                Subject: "${studentSubject || 'Digital Business'}"
                Past Work: "${pastAssignmentTitles || 'None'}"
                
                Suggest 5 upcoming research topics or milestones that follow a logical curriculum progression, ensuring they don't repeat past work but build upon it.
                Return ONLY a valid JSON array of strings: ["Milestone 1", "Milestone 2", ...]
            `;
            const aiResponse = await generateChatResponse([], prompt, "You are a Curriculum Intelligence Agent.");
            const responseText = aiResponse?.data || aiResponse?.reply || (typeof aiResponse === 'string' ? aiResponse : '');

            if (responseText) {
                const jsonMatch = responseText.match(/\[.*\]/s);
                if (jsonMatch) {
                    const topics = JSON.parse(jsonMatch[0]);
                    setAutoTopics(topics);
                    setAutomationMode('scheduled');
                }
            }
        } catch (err) {
            console.error("Scheduled gen failed", err);
            setAutoTopics([
                "Module 1: Foundations of Modern Research",
                "Module 2: Advanced Data Synthesis",
                "Module 3: Cross-Disciplinary Case Studies",
                "Module 4: Emerging Tech Trends Impact",
                "Module 5: Final Thesis Presentation Prep"
            ]);
        } finally {
            setIsAutoSuggesting(false);
        }
    };

    const handleSmartConfig = async () => {
        const inputTopic = segment === 'students' ? studentTopic :
            segment === 'startups' ? startupProduct :
                segment === 'freelancers' ? freelancerService :
                    segment === 'influencers' ? influencerNiche :
                        segment === 'authors' ? (authorStoryTopic || authorTheme) :
                            segment === 'agencies' ? (mode === 'planner' ? agencyInputs.companyName : agencyInputs.keyword) : '';

        if (!inputTopic?.trim()) {
            toast.error(`Please enter a ${segment === 'startups' ? 'product name' : 'topic'} first for Smart Config!`);
            return;
        }

        setIsAutoSuggesting(true);
        setAutomationMode('config');
        try {
            const prompt = `
                Act as a Professional Workspace Automation Architect. 
                Analyze the input for the ${segment} segment:
                Input Topic/Product: "${inputTopic}"
                Current Subject Context: "${studentSubject}"

                🎯 GOAL: Generate a 100% complete workspace configuration. 
                ⚠️ CRITICAL RULE: You MUST pick exactly ONE value from the lists provided. DO NOT return the whole list. DO NOT concatenate values.

                SCHEMA PER SEGMENT (Pick exactly ONE value for each key):

                1. STUDENTS:
                   - feature: [assignment_writer, essay_generator, ppt_generator, sop_writer, linkedin_creator, paraphraser, plagiarism_rewrite]
                   - wordCount: [300, 500, 1000, 2000]
                   - tone: [Academic, Professional, Critical, Conversational]
                   - isAcademicFormat: true/false

                2. STARTUPS:
                   - feature: [ad_copy, landing_copy, product_desc, email_marketing, ab_variations, cta_generator]
                   - tone: [Energetic, Professional, Urgent, Innovative]
                   - audience: (Pick a short, valid target audience name)
                   - platform: [Google/Facebook Ads, LinkedIn, Email, Landing Page]

                3. FREELANCERS:
                   - feature: [proposal_generator, client_email, portfolio_desc, blog_generator, pricing_letter]
                   - tone: [Professional, Confident, Creative, Salesy]
                   - clientType: (Pick a valid industry/client type)
                   - budget: (e.g. $500 - $1500)

                4. INFLUENCERS:
                   - feature: [insta_caption, hashtag_gen, viral_hook, reel_script, poll_gen]
                   - niche: [Fitness, Travel, Tech, Fashion, Food, Business]
                   - mood: [Motivational, Funny, Sarcastic, Educational, Esthetic / Chill]
                   - useEmojis: true/false
                   - hashtagCount: [5, 10, 20, 30]

                5. AGENCIES:
                   - feature: [daily_ideas, seo_content, bulk_blog, ab_variations, brand_memory, bio_generator, page_description_generator, lead_funnel, video_scripts]
                   - tone: [Expert, Empathetic, Professional, Friendly, Technical]
                   - targetAudience: [Business Owner, Students, Professional, Govt Employee, Retired]
                   - goal: [Brand Awareness, Leads, Engagement, Sales]
                   - frequency: [Daily, 3x per week, Weekly]
                   - platform: [INSTAGRAM, LINKEDIN, FACEBOOK, TWITTER, PINTEREST, THREADS, QUORA]

                6. AUTHORS:
                   - feature: [story, poetry_generator, script_editor, dialogue_enhancer, chapter_continuation, manuscript_editor]
                   - tone: [Creative, Noir, Futuristic, Classical, Sarcastic]
                   - length: [Short, Medium, Long, Epic]
                   - mood: [Somber, Joyful, Wistful, Aggressive, Mystical]
                   - authorLanguage: [English, Hindi]

                Return ONLY a valid JSON object. No extra text.
            `;
            const aiResponse = await generateChatResponse([], prompt, "You are a specialized Workspace AI Automator.");
            const responseText = aiResponse?.data || aiResponse?.reply || (typeof aiResponse === 'string' ? aiResponse : '');

            if (responseText) {
                const jsonMatch = responseText.match(/\{.*\}/s);
                if (jsonMatch) {
                    const config = JSON.parse(jsonMatch[0]);

                    if (segment === 'students') {
                        if (config.feature) setStudentFeature(config.feature);
                        if (config.wordCount) setStudentWordCount(String(config.wordCount));
                        if (config.tone) setStudentTone(config.tone);
                        if (config.isAcademicFormat !== undefined) setIsAcademicFormat(Boolean(config.isAcademicFormat));
                    } else if (segment === 'startups') {
                        if (config.feature) setStartupFeature(config.feature);
                        if (config.tone) setStartupTone(config.tone);
                        if (config.audience) setStartupAudience(config.audience);
                        if (config.platform) setStartupPlatform(config.platform);
                    } else if (segment === 'freelancers') {
                        if (config.feature) setFreelancerFeature(config.feature);
                        if (config.tone) setFreelancerTone(config.tone);
                        if (config.clientType) setFreelancerClientType(config.clientType);
                        if (config.budget) setFreelancerBudget(config.budget);
                    } else if (segment === 'influencers') {
                        if (config.feature) setInfluencerFeature(config.feature);
                        if (config.niche) setInfluencerNiche(config.niche);
                        if (config.mood) setInfluencerMood(config.mood);
                        if (config.useEmojis !== undefined) setUseEmojis(Boolean(config.useEmojis));
                        if (config.hashtagCount) setHashtagCount(String(config.hashtagCount));
                    } else if (segment === 'authors') {
                        if (config.feature) setAuthorFeature(config.feature);
                        if (config.genre) setAuthorGenre(config.genre);
                        if (config.tone) setAuthorTone(config.tone);
                        if (config.length) setAuthorLength(config.length);
                        if (config.theme) setAuthorTheme(config.theme);
                        if (config.mood) setAuthorMood(config.mood);
                        if (config.style) setAuthorStyle(config.style);
                        if (config.characters) setAuthorCharacters(config.characters);
                        if (config.rhyme !== undefined) setAuthorRhyme(Boolean(config.rhyme));
                    } else if (segment === 'agencies') {
                        if (config.feature) setAgencyFeature(config.feature);
                        if (config.tone) setAgencyTone(config.tone);
                        const updates = {};
                        if (config.industry) updates.industry = config.industry;
                        if (config.targetAudience) updates.targetAudience = config.targetAudience;
                        if (config.goal) updates.goal = config.goal;
                        if (config.frequency) updates.frequency = config.frequency;
                        if (config.month) updates.month = config.month;
                        if (config.platform) updates.platforms = [config.platform];
                        if (config.usp) updates.usp = config.usp;
                        if (Object.keys(updates).length > 0) {
                            setAgencyInputs(prev => ({ ...prev, ...updates }));
                        }
                    }

                    toast.success("Magic Setup Complete!", {
                        description: `Fully optimized for ${inputTopic}.`,
                        icon: '🪄',
                        style: { borderRadius: '20px', fontWeight: 'bold' }
                    });
                } else {
                    toast.error("AI could not determine the best config for this topic.");
                }
            } else {
                toast.error("AI response failed. Please try again.");
            }
        } catch (error) {
            console.error("Smart Config Error:", error);
            setStudentFeature('assignment_writer');
            setStudentWordCount('1000');
            setStudentTone('Academic');
            setIsAcademicFormat(true);
        } finally {
            setIsAutoSuggesting(false);
            setAutomationMode('manual');
        }
    };

    const handleSmartFieldSuggest = async (field) => {
        if (!studentTopic.trim()) {
            toast.error("Please enter a topic first!");
            return;
        }

        setIsAutoSuggesting(true);
        setAutomationMode(field);
        try {
            const prompt = `
                Based on the topic: "${studentTopic}", 
                Suggest the single best ${field === 'tone' ? 'Tone (Academic, Professional, Critical, Conversational)' : 'Word Count (300, 500, 1000, 2000)'}.
                Return ONLY the value string.
            `;
            const aiResponse = await generateChatResponse([], prompt, "You are a specialized Parameter Agent.");
            const responseText = aiResponse?.data || aiResponse?.reply || (typeof aiResponse === 'string' ? aiResponse : '');

            const cleanValue = responseText.trim().replace(/[^a-zA-Z0-9+ ]/g, '');

            if (field === 'tone') {
                setStudentTone(cleanValue);
            } else if (field === 'wordCount') {
                const numOnly = cleanValue.replace(/[^0-9]/g, '');
                setStudentWordCount(numOnly || '500');
            }

            toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} optimized!`, { icon: '🪄' });
        } catch (error) {
            console.error("Field Suggest Error:", error);
        } finally {
            setIsAutoSuggesting(false);
            setAutomationMode('manual');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAgencyInputs(prev => ({ ...prev, uploadedFile: file }));
        }
    };

    const removeUploadedFile = () => {
        setAgencyInputs(prev => ({ ...prev, uploadedFile: null }));
    };

    const handleAgencyInputChange = (field, value) => {
        setAgencyInputs(prev => ({ ...prev, [field]: value }));
    };

    const togglePlatform = (p) => {
        setAgencyInputs(prev => ({
            ...prev,
            platforms: prev.platforms.includes(p)
                ? prev.platforms.filter(x => x !== p)
                : [...prev.platforms, p]
        }));
    };

    const onGenerate = () => {
        let inputs = {};
        let type = mode === 'planner' ? 'content_calendar' : segment;

        if (segment === 'students') {
            type = studentFeature;
            inputs = { topic: studentTopic, wordCount: studentWordCount, tone: studentTone, isAcademicFormat, feature: studentFeature };
        } else if (segment === 'startups') {
            type = startupFeature;
            inputs = { product: startupProduct, audience: startupAudience, tone: startupTone, platform: startupPlatform, feature: startupFeature };
        } else if (segment === 'freelancers') {
            type = freelancerFeature;
            inputs = { service: freelancerService, clientType: freelancerClientType, budget: freelancerBudget, tone: freelancerTone, feature: freelancerFeature };
        } else if (segment === 'influencers') {
            type = influencerFeature;
            inputs = { niche: influencerNiche, mood: influencerMood, useEmojis, hashtagCount, feature: influencerFeature };
        } else if (segment === 'agencies') {
            if (mode === 'planner') {
                type = 'content_calendar';
                inputs = agencyInputs;
            } else {
                type = agencyFeature;
                inputs = {
                    companyName: agencyInputs.companyName,
                    industry: agencyInputs.industry,
                    tone: agencyTone,
                    usp: agencyInputs.usp,
                    keyword: agencyInputs.keyword,
                    wordCount: agencyInputs.wordCount,
                    feature: agencyFeature,
                    platforms: agencyInputs.platforms
                };
            }
        } else if (segment === 'authors') {
            type = authorFeature;
            inputs = {
                topic: authorStoryTopic,
                genre: authorGenre,
                tone: authorTone,
                feature: authorFeature,
                theme: authorTheme,
                mood: authorMood,
                style: authorStyle,
                rhyme: authorRhyme,
                characters: authorCharacters,
                context: authorContext,
                script: authorScript,
                length: authorLength,
                language: authorLanguage,
                file: authorFile ? authorFile.name : null
            };
        }

        handleAction(null, { segment, type, inputs });
    };

    // --- HELPER RENDERING ---
    const renderStructuredResult = () => {
        if (!aiWriteResult) return null;

        // Try to parse if it's a JSON string
        let content = aiWriteResult;
        if (typeof aiWriteResult === 'string') {
            try {
                // Look for JSON block
                const jsonMatch = aiWriteResult.match(/\{[\s\S]*?\}/);
                if (jsonMatch) {
                    content = JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                // Not JSON, keep as string
            }
        }

        const isCalendar = Array.isArray(content.calendar) || (Array.isArray(content) && content[0]?.date);
        const data = Array.isArray(content.calendar) ? content.calendar : (Array.isArray(content) ? content : null);

        if (isCalendar && data) {
            const handleExportCSV = () => {
                const headers = ["Date", "Phase", "Platform", "Format", "Post Type", "Heading / Hook", "Sub-Heading", "Short Caption", "Long Caption", "Hashtags", "Breakdown"];

                const wrapInQuotes = (str) => {
                    const clean = (str || '').toString().replace(/"/g, '""');
                    return `"${clean}"`;
                };

                const rows = data.map(item => [
                    wrapInQuotes(item.date),
                    wrapInQuotes(item.phase),
                    wrapInQuotes(item.platform),
                    wrapInQuotes(item.format),
                    wrapInQuotes(item.post_type || item.postType),
                    wrapInQuotes(item.heading),
                    wrapInQuotes(item.sub_head || item.subHeading),
                    wrapInQuotes(item.short_cap || item.shortCaption),
                    wrapInQuotes(item.long_capt || item.longCaption),
                    wrapInQuotes(item.hashtags),
                    wrapInQuotes(item.breakdown || item.slideOrReelBreakdown)
                ]);

                const csvContent = "\ufeff" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `Content_Calendar_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            return (
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Strategy Calendar</h4>
                        </div>
                        <button onClick={handleExportCSV} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
                            <FileSpreadsheet size={14} /> Export Excel (CSV)
                        </button>
                    </div>
                    <div className="overflow-x-auto rounded-[8px] border border-slate-300 shadow-sm bg-white">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead>
                                <tr className="bg-[#f8f9fa] sticky top-0 z-10 border-b border-slate-300">
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase border-r border-slate-200">date</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase border-r border-slate-200">phase</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase border-r border-slate-200">platform</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase border-r border-slate-200">format</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase border-r border-slate-200">topic</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase border-r border-slate-200">hook</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase border-r border-slate-200">sub hook</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase border-r border-slate-200">short cap</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase border-r border-slate-200">full copy</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase border-r border-slate-200">hashtags</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase">breakdown</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, idx) => (
                                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors text-[11px] text-slate-700">
                                        <td className="px-4 py-3 border-r border-slate-200 whitespace-nowrap">{item.date}</td>
                                        <td className="px-4 py-3 border-r border-slate-200">{item.phase}</td>
                                        <td className="px-4 py-3 border-r border-slate-200">{item.platform}</td>
                                        <td className="px-4 py-3 border-r border-slate-200">{item.format}</td>
                                        <td className="px-4 py-3 border-r border-slate-200">{item.post_type || item.postType}</td>
                                        <td className="px-4 py-3 border-r border-slate-200 font-medium">{item.heading}</td>
                                        <td className="px-4 py-3 border-r border-slate-200 text-slate-500">{item.sub_head || item.subHeading || '-'}</td>
                                        <td className="px-4 py-3 border-r border-slate-200 max-w-[150px]"><div className="line-clamp-2">{item.short_cap || item.shortCaption}</div></td>
                                        <td className="px-4 py-3 border-r border-slate-200 max-w-[200px]"><div className="line-clamp-3 text-slate-500">{item.long_capt || item.longCaption}</div></td>
                                        <td className="px-4 py-3 border-r border-slate-200 text-blue-600 underline font-medium">{item.hashtags}</td>
                                        <td className="px-4 py-3 max-w-[200px]"><div className="text-[10px] whitespace-pre-wrap">{item.breakdown || item.slideOrReelBreakdown}</div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        // Standard Object (mapped as cards)
        if (typeof content === 'object' && content !== null) {
            const entries = Object.entries(content).filter(([k]) => k !== 'status' && k !== 'success');
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {entries.map(([key, value], idx) => {
                        const isMainContent = key.toLowerCase().includes('content') || key.toLowerCase().includes('body') || key.toLowerCase().includes('story');
                        const isFullWidth = entries.length === 1 || String(value).length > 500 || isMainContent || Array.isArray(value);

                        return (
                            <div key={idx} className={`bg-white border border-slate-100 rounded-[40px] p-10 shadow-xl shadow-blue-500/5 flex flex-col ${isFullWidth ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                                <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                    {key.replace(/_/g, ' ')}
                                </h4>
                                <div className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap flex-1">
                                    {Array.isArray(value) ? (
                                        <div className="space-y-6">
                                            {value.map((item, i) => (
                                                <div key={i} className="bg-slate-50/50 rounded-[24px] p-6 border border-slate-100">
                                                    {typeof item === 'object' ? (
                                                        <div className="space-y-4">
                                                            {Object.entries(item).map(([subKey, subVal]) => (
                                                                <div key={subKey}>
                                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{subKey.replace(/_/g, ' ')}</div>
                                                                    <div className="text-[13px] text-slate-700 font-bold whitespace-pre-wrap">
                                                                        {Array.isArray(subVal) ? subVal.join(', ') : String(subVal)}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : String(item)}
                                                </div>
                                            ))}
                                        </div>
                                    ) : typeof value === 'object' ? (
                                        <div className="space-y-6 bg-slate-50/50 rounded-[24px] p-6 border border-slate-100">
                                            {Object.entries(value).map(([vKey, vVal]) => (
                                                <div key={vKey}>
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{vKey.replace(/_/g, ' ')}</div>
                                                    <div className="text-[13px] text-slate-700 font-bold whitespace-pre-wrap">
                                                        {Array.isArray(vVal) ? vVal.join(', ') : String(vVal)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : key === 'downloadUrl' ? (
                                        <div className="flex flex-col items-center justify-center py-10 gap-6 bg-blue-50/30 rounded-[30px] border border-dashed border-blue-200">
                                            <div className="w-20 h-20 rounded-[30px] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                                <Download className="w-10 h-10" />
                                            </div>
                                            <div className="text-center">
                                                <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Edited Manuscript Ready</h5>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Click below to download your proofread document</p>
                                            </div>
                                            <a
                                                href={value}
                                                download={content.fileName || 'Edited_Manuscript.docx'}
                                                className="px-10 py-5 bg-blue-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-3"
                                            >
                                                <FileText size={16} /> Download .DOCX
                                            </a>
                                        </div>
                                    ) : key === 'fileName' ? null : (
                                        <div className="text-[15px] text-slate-700 font-bold leading-relaxed">{value}</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        // Simple String
        return (
            <div className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                {aiWriteResult}
            </div>
        );
    };

    const renderHistoryList = (isCompact = false) => {
        const filteredSessions = (sessions || []).filter(session =>
            session.agentType === 'AIWRITE' &&
            (session.title || '').toLowerCase().includes(historySearch.toLowerCase())
        );

        if (!filteredSessions || filteredSessions.length === 0) return (
            <div className={`flex flex-col items-center justify-center ${isCompact ? 'py-10' : 'py-20'} bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200`}>
                <MessageSquare className={`${isCompact ? 'w-8 h-8' : 'w-12 h-12'} text-slate-100 mb-4`} />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No history for this segment</p>
            </div>
        );

        return (
            <div className={isCompact ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {filteredSessions.map((session) => (
                    <motion.div
                        key={session.sessionId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`group bg-white rounded-[35px] ${isCompact ? 'p-5' : 'p-8'} border transition-all cursor-pointer relative shadow-sm hover:shadow-xl hover:shadow-blue-500/5 ${currentSessionId === session.sessionId ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-slate-50 hover:border-blue-100'}`}
                        onClick={() => {
                            navigate(`/dashboard/workspace/AIWRITE/${session.sessionId}`);
                            setIsLocalHistoryOpen(false);
                        }}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentSessionId === session.sessionId ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-blue-50 text-blue-400'}`}>
                                    <MessageSquare size={16} />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className={`text-sm font-black tracking-tight truncate max-w-[150px] ${currentSessionId === session.sessionId ? 'text-slate-800' : 'text-slate-600'}`}>
                                        {session.title || 'New Assignment'}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                                        {new Date(session.lastModified).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSession(e, session.sessionId);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    // --- SUB-UI RENDERING ---

    const renderActionFooter = (buttonText, isDisabled = false) => (
        <div className="mt-12 md:mt-20 flex flex-col items-center pb-8 md:pb-16 w-full px-4">
            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
                <div className="flex gap-4 relative">
                    <div className="relative">
                        <button
                            onClick={() => setIsLocalHistoryOpen(!isLocalHistoryOpen)}
                            className={`flex items-center gap-2.5 px-7 py-4 border rounded-full text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-300 shadow-sm ${isLocalHistoryOpen ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/50'}`}
                        >
                            <History size={16} className={isLocalHistoryOpen ? 'text-white' : 'text-slate-400'} /> History
                        </button>

                        <AnimatePresence>
                            {isLocalHistoryOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 15 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute top-full left-0 mt-4 w-[calc(100vw-2rem)] md:w-[400px] bg-white rounded-3xl md:rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 p-6 md:p-7 z-[100]"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Recent Sessions</h4>
                                        <button onClick={() => setIsLocalHistoryOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="relative mb-5">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200">
                                            <Search size={12} />
                                        </div>
                                        <input
                                            type="text"
                                            value={historySearch}
                                            onChange={(e) => setHistorySearch(e.target.value)}
                                            placeholder="Search history..."
                                            className="w-full bg-blue-50/50 border border-blue-100/50 rounded-xl py-3 pl-10 pr-4 text-[10px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                                        />
                                    </div>
                                    <div className="max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
                                        {renderHistoryList(true)}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button onClick={handleLocalClear} className="flex items-center gap-2.5 px-7 py-4 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm">
                        <Trash2 size={16} className="text-slate-400" /> Clear
                    </button>
                </div>

                <div className="flex-1 flex justify-center px-4">
                    <div
                        onClick={() => setIsAdvancedEngineOpen(!isAdvancedEngineOpen)}
                        className={`flex items-center gap-5 px-8 py-4 bg-white border rounded-full shadow-lg shadow-blue-500/5 group cursor-pointer transition-all duration-300 ${isAdvancedEngineOpen ? 'border-blue-500 bg-blue-50/10' : 'border-slate-100 hover:border-blue-200'}`}
                    >
                        <div className={`w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md transition-transform duration-500 ${isAdvancedEngineOpen ? 'rotate-180' : 'group-hover:rotate-180'}`}>
                            <RefreshCw size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-slate-800 tracking-tight">Refine & Regenerate</span>
                            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest leading-none mt-0.5">Open Advanced Engine</span>
                        </div>
                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${isAdvancedEngineOpen ? 'text-blue-600 border-blue-500' : 'text-slate-200 border-slate-100 group-hover:text-blue-500'}`}>
                            <ArrowRight size={12} className={isAdvancedEngineOpen ? 'rotate-90' : ''} />
                        </div>
                    </div>
                </div>

                <button
                    onClick={onGenerate}
                    disabled={isProcessing || isDisabled}
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-xs uppercase tracking-[0.1em] shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50 disabled:grayscale"
                >
                    {isProcessing ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Zap size={16} className="fill-white" />
                    )}
                    {isProcessing ? 'Executing...' : (buttonText || 'Execute Strategy')}
                </button>
            </div>


            {/* Inline Advanced Engine Expansion */}
            <AnimatePresence>
                {isAdvancedEngineOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="w-full mt-10 overflow-hidden"
                    >
                        <div className="bg-white w-full rounded-[40px] overflow-hidden shadow-2xl border border-slate-50 flex flex-col">
                            {/* Tags Grid */}
                            <div className="p-8 space-y-8">
                                <div className="flex flex-wrap gap-2">
                                    {REFINE_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleRefineTag(tag)}
                                            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border ${selectedRefineTags.includes(tag)
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-100'
                                                }`}
                                        >
                                            <div className={`w-1 h-1 rounded-full ${selectedRefineTags.includes(tag) ? 'bg-white' : 'bg-blue-400'}`} />
                                            {tag}
                                        </button>
                                    ))}
                                </div>

                                {/* Text Area */}
                                <div className="relative group">
                                    <textarea
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-[25px] p-6 text-base font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[150px] resize-none placeholder:text-slate-300"
                                        placeholder="Describe your writing objective or paste a draft to refine..."
                                        value={refinePrompt}
                                        onChange={(e) => setRefinePrompt(e.target.value)}
                                    />
                                    <div className="absolute top-6 right-8 text-[9px] font-black text-blue-100 uppercase tracking-widest group-hover:text-blue-200 transition-colors">
                                        A.I. Editor
                                    </div>
                                </div>

                                {/* Navigation & Footer */}
                                <div className="flex items-center justify-between pt-4">
                                    <div className="flex items-center gap-4 bg-slate-50/50 p-2 rounded-full border border-slate-100">
                                        <button
                                            onClick={() => setAdvancedActiveTab('headlines')}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${advancedActiveTab === 'headlines'
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            <Layers size={14} /> Headlines
                                        </button>
                                        <button
                                            onClick={() => setAdvancedActiveTab('variations')}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${advancedActiveTab === 'variations'
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            <RefreshCw size={14} /> Variations
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleAdvancedExecute}
                                        disabled={!refinePrompt.trim() && selectedRefineTags.length === 0}
                                        className="px-12 py-5 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50 disabled:scale-100"
                                    >
                                        Refine with AI
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Result Display (Below Footer) */}
            <AnimatePresence>
                {aiWriteResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="w-full mt-6 lg:mt-12 bg-white rounded-3xl md:rounded-[40px] shadow-2xl shadow-blue-500/10 border border-slate-50 overflow-hidden relative"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />

                        {/* Result Header */}
                        <div className="px-4 py-6 md:px-10 md:py-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h4 className="text-xs md:text-sm font-black text-slate-800 tracking-tight uppercase">Generation Result</h4>
                                    <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">Optimized Content Intelligent Engine</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        const blob = new Blob([aiWriteResult], { type: 'text/plain' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `AI_Write_${Date.now()}.txt`;
                                        a.click();
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                                >
                                    <Download size={14} /> Download TXT
                                </button>
                                <button
                                    onClick={() => setAiWriteResult('')}
                                    className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Result Content */}
                        <div className="p-4 sm:p-6 md:p-12 prose prose-slate max-w-none prose-sm prose-headings:font-black prose-headings:text-slate-800 prose-p:text-slate-600 prose-p:leading-relaxed whitespace-pre-wrap">
                            {renderStructuredResult()}
                        </div>

                        {/* Result Footer */}
                        <div className="px-6 md:px-12 py-6 md:py-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Clock size={14} /> {new Date().toLocaleTimeString()}
                                </span>
                                <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center">
                                    <CheckCircle2 size={14} /> Plagiarism Free
                                </span>
                            </div>
                            <button
                                onClick={handleAdvancedExecute}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                            >
                                <RefreshCw size={14} /> Improve with AI
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );


    const renderAgencyUI = () => (
        <div className="w-full px-4">
            {mode === 'planner' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                    {/* Card 1: Social Brand */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.85] backdrop-blur-xl rounded-3xl md:rounded-[48px] p-6 md:p-10 shadow-2xl shadow-blue-500/5 border border-white/50 space-y-8 md:space-y-12 flex flex-col">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-[24px] bg-gradient-to-br from-blue-50 to-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                                <Building2 className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2">Social Brand</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Identity Context</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10 flex-1">
                            <div className="space-y-4 group">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Company Entity</label>
                                    <span className="text-[8px] font-bold text-blue-200 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Required</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={agencyInputs.companyName}
                                        onChange={(e) => handleAgencyInputChange('companyName', e.target.value)}
                                        placeholder="Enter brand name..."
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-full px-6 md:px-8 py-4 md:py-6 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200/50 transition-all shadow-inner placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-2">Target Industry</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={agencyInputs.industry}
                                        onChange={(e) => handleAgencyInputChange('industry', e.target.value)}
                                        placeholder="e.g. Fintech, SaaS, Health"
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-full px-8 py-6 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200/50 transition-all shadow-inner placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <div className="p-6 bg-blue-50/30 rounded-[32px] border border-blue-100/20">
                                    <p className="text-[9px] font-bold text-blue-400/80 leading-relaxed text-center italic">
                                        "Defining these core fields helps the AI build a specific industry-relevant calendar."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Social Strategy */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/[0.85] backdrop-blur-xl rounded-3xl md:rounded-[48px] p-6 md:p-10 shadow-2xl shadow-blue-500/5 border border-white/50 space-y-8 md:space-y-12">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-[24px] bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                                <TargetIcon className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2">Social Strategy</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Audience & Intelligence</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-2">Primary Target Audience</label>
                                <CustomSelect
                                    value={agencyInputs.targetAudience}
                                    onChange={(e) => handleAgencyInputChange('targetAudience', e.target.value)}
                                    options={['Business Owner', 'Students', 'Professional (Dr, Advocate, etc.)', 'Govt Employee', 'Retired']}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-2">Content Objective</label>
                                <CustomSelect
                                    value={agencyInputs.goal}
                                    onChange={(e) => handleAgencyInputChange('goal', e.target.value)}
                                    options={['Brand Awareness', 'Leads', 'Engagement', 'Sales']}
                                />
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Intelligence Core</label>
                                    <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
                                        <button
                                            onClick={() => setAgencyOverviewMode('text')}
                                            className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${agencyOverviewMode === 'text' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Text
                                        </button>
                                        <button
                                            onClick={() => setAgencyOverviewMode('upload')}
                                            className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${agencyOverviewMode === 'upload' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>
                                {agencyOverviewMode === 'upload' ? (
                                    <div className="w-full">
                                        <input type="file" id="rag-file-upload" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
                                        {!agencyInputs.uploadedFile ? (
                                            <label htmlFor="rag-file-upload" className="border-2 border-dashed border-blue-100 rounded-[40px] p-8 bg-blue-50/10 flex flex-col items-center justify-center gap-4 group hover:bg-blue-50/30 hover:border-blue-300 transition-all cursor-pointer">
                                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform"><Plus size={24} /></div>
                                                <div className="text-center">
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Knowledge Sync</span>
                                                    <span className="text-[8px] text-slate-400 font-bold uppercase">Connect PDF / DOCX</span>
                                                </div>
                                            </label>
                                        ) : (
                                            <div className="border border-emerald-100 rounded-[40px] p-8 bg-emerald-50/20 flex flex-col items-center justify-center gap-4 relative shadow-sm">
                                                <button onClick={removeUploadedFile} className="absolute top-5 right-5 text-slate-300 hover:text-rose-500 transition-colors"><X size={16} /></button>
                                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50">
                                                    {isExtracting ? <RefreshCw className="w-6 h-6 animate-spin" /> : <CheckCircle2 size={24} />}
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[11px] font-black text-slate-800 tracking-tight uppercase truncate max-w-[180px] mb-1">{agencyInputs.uploadedFile.name}</p>
                                                    <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest italic">RAG Ready</p>
                                                </div>
                                                <button onClick={handleAutoFill} disabled={isExtracting} className="px-8 py-3 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                                                    <Sparkles size={12} /> {isExtracting ? 'Syncing...' : 'Fetch Intelligence'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <textarea
                                        value={agencyInputs.usp}
                                        onChange={(e) => handleAgencyInputChange('usp', e.target.value)}
                                        placeholder="Enter company USP / mission / key context for strategy..."
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-[32px] p-8 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all min-h-[160px] resize-none shadow-inner placeholder:text-slate-300"
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Social Engine */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/[0.85] backdrop-blur-xl rounded-3xl md:rounded-[48px] p-6 md:p-10 shadow-2xl shadow-blue-500/5 border border-white/50 space-y-8 md:space-y-12">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-[24px] bg-gradient-to-br from-slate-50 to-white flex items-center justify-center text-slate-600 shadow-sm border border-slate-100/50">
                                <Clock className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2">Social Engine</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Scheduling & Output</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-2">Campaign Month</label>
                                <CustomSelect
                                    value={agencyInputs.month}
                                    onChange={(e) => handleAgencyInputChange('month', e.target.value)}
                                    options={['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-2">Posting Frequency</label>
                                <CustomSelect
                                    value={agencyInputs.frequency}
                                    onChange={(e) => handleAgencyInputChange('frequency', e.target.value)}
                                    options={['Daily', '3x per week', 'Weekly']}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-2 block">Target Platform</label>
                            <CustomSelect
                                value={agencyInputs.platforms[0] || 'INSTAGRAM'}
                                onChange={(e) => handleAgencyInputChange('platforms', [e.target.value])}
                                options={['INSTAGRAM', 'LINKEDIN', 'FACEBOOK', 'TWITTER', 'PINTEREST', 'THREADS', 'QUORA']}
                            />
                        </div>

                        <div className="pt-8 border-t border-slate-50">
                            <div className="p-8 bg-gradient-to-br from-slate-50/50 to-white rounded-[40px] border border-slate-100/50 shadow-inner">
                                <div className="flex items-center gap-4 mb-4">
                                    <PenTool size={16} className="text-blue-500" />
                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Strategy Preview</span>
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic">
                                    "Generates a bespoke content calender strictly optimized for {agencyInputs.platforms[0] || 'your selected platform'}."
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Standard Toolkit UI (Cards 1, 2, 3) */}
                    {/* Card 1: Social Brand */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.85] backdrop-blur-xl rounded-[48px] p-10 shadow-2xl shadow-blue-500/5 border border-white/50 space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[24px] bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50"><Building2 className="w-8 h-8" /></div>
                                <div><h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Social Brand</h3><p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Identity & Industry</p></div>
                            </div>
                            <button
                                onClick={handleSmartConfig}
                                disabled={isAutoSuggesting}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isAutoSuggesting ? 'bg-slate-100 animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg shadow-blue-500/10'}`}
                                title="AI Automation Setup"
                            >
                                {isAutoSuggesting && automationMode === 'config' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            </button>
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Entity</label>
                                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">Save</button>
                                </div>
                                <input type="text" value={agencyInputs.companyName} onChange={(e) => handleAgencyInputChange('companyName', e.target.value)} placeholder="e.g. Amazon" className="w-full bg-slate-50/50 border border-slate-100 rounded-full px-8 py-6 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Industry</label>
                                <input type="text" value={agencyInputs.industry} onChange={(e) => handleAgencyInputChange('industry', e.target.value)} placeholder="Tech & AI" className="w-full bg-slate-50/50 border border-slate-100 rounded-full px-8 py-6 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Brand Identity */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/[0.85] backdrop-blur-xl rounded-[48px] p-10 shadow-2xl shadow-blue-500/5 border border-white/50 space-y-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[24px] bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50"><TargetIcon className="w-8 h-8" /></div>
                            <div><h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Brand Identity</h3><p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Voice & USP</p></div>
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Tone of Voice</label>
                                <CustomSelect
                                    value={agencyTone}
                                    onChange={(e) => setAgencyTone(e.target.value)}
                                    options={['Expert', 'Empathetic', 'Professional', 'Friendly', 'Technical']}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Key USP / Mission</label>
                                <textarea value={agencyInputs.usp} onChange={(e) => handleAgencyInputChange('usp', e.target.value)} placeholder="What makes this brand unique?" className="w-full bg-slate-50/50 border border-slate-100 rounded-[32px] p-8 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[140px] resize-none shadow-inner" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Agency Engine */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/[0.85] backdrop-blur-xl rounded-[48px] p-10 shadow-2xl shadow-blue-500/5 border border-white/50 space-y-10 flex flex-col">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100/50"><Zap className="w-8 h-8" /></div>
                            <div><h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Agency Engine</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Select Your Tool</p></div>
                        </div>
                        <div className="space-y-8 flex-1">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Agency Tool</label>
                                <CustomSelect
                                    value={agencyFeature}
                                    onChange={(e) => setAgencyFeature(e.target.value)}
                                    options={[
                                        { value: 'daily_ideas', label: 'Daily Content Ideas' },
                                        { value: 'seo_content', label: 'SEO Authority Content' },
                                        { value: 'bulk_blog', label: 'Bulk Blog Generator' },
                                        { value: 'ab_variations', label: 'A/B Variation Generator' },
                                        { value: 'brand_memory', label: 'Brand Voice / Identity' },
                                        { value: 'bio_generator', label: 'Professional Bio Engine' },
                                        { value: 'page_description_generator', label: 'Social Media Branding' },
                                        { value: 'lead_funnel', label: 'Lead Magnet & Funnel' },
                                        { value: 'video_scripts', label: 'Bulk Video Scripts' }
                                    ]}
                                />
                            </div>
                            {(agencyFeature === 'seo_content' || agencyFeature === 'bulk_blog' || agencyFeature === 'daily_ideas' || agencyFeature === 'lead_funnel' || agencyFeature === 'video_scripts' || agencyFeature === 'page_description_generator') && (
                                <div className="space-y-6 pt-2">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Primary Topic / Keyword</label>
                                        <input
                                            type="text"
                                            value={agencyInputs.keyword}
                                            onChange={(e) => handleAgencyInputChange('keyword', e.target.value)}
                                            placeholder="e.g. Digital Marketing Trends 2026"
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-full px-8 py-6 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                                        />
                                    </div>
                                    {(agencyFeature === 'seo_content' || agencyFeature === 'bulk_blog') && (
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Target Word Count</label>
                                            <CustomSelect
                                                value={agencyInputs.wordCount}
                                                onChange={(e) => handleAgencyInputChange('wordCount', e.target.value)}
                                                options={['500', '1000', '1500', '2500+']}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="space-y-4 pt-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block">Select Platform</label>
                                <CustomSelect
                                    value={agencyInputs.platforms[0] || 'Instagram'}
                                    onChange={(e) => handleAgencyInputChange('platforms', [e.target.value])}
                                    options={['Instagram', 'LinkedIn', 'Facebook', 'Twitter', 'Pinterest', 'Threads', 'Quora']}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {renderActionFooter(mode === 'planner' ? 'Generate content calender' : 'Execute Strategy', !agencyInputs.companyName.trim())}
        </div >
    );

    const renderInfluencerUI = () => (
        <div className="w-full px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Card 1: Vibe Check */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-8 md:space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 md:gap-5">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600"><Music className="w-6 h-6 md:w-7 md:h-7" /></div>
                            <div><h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">Vibe Check</h3><p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Niche & Mood</p></div>
                        </div>
                        <button
                            onClick={handleSmartConfig}
                            disabled={isAutoSuggesting}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isAutoSuggesting ? 'bg-slate-100 animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg shadow-blue-500/10'}`}
                            title="AI Automation Setup"
                        >
                            {isAutoSuggesting && automationMode === 'config' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        </button>
                    </div>
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Niche Select</label>
                            <CustomSelect
                                value={influencerNiche}
                                onChange={(e) => setInfluencerNiche(e.target.value)}
                                options={['Fitness', 'Travel', 'Tech', 'Fashion', 'Food', 'Business']}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Content Mood</label>
                            <CustomSelect
                                value={influencerMood}
                                onChange={(e) => setInfluencerMood(e.target.value)}
                                options={['Motivational', 'Funny', 'Sarcastic', 'Educational', 'Esthetic / Chill']}
                            />
                        </div>
                    </div>
                </motion.div>
                {/* Card 2: Viral Settings */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[40px] p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600"><Tv className="w-7 h-7" /></div>
                        <div><h3 className="text-lg font-black text-slate-800 tracking-tight">Viral Settings</h3><p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Growth Hacks</p></div>
                    </div>
                    <div className="space-y-8">
                        <button onClick={() => setUseEmojis(!useEmojis)} className={`w-full flex items-center justify-between p-5 rounded-[30px] border transition-all ${useEmojis ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                            <div className="flex items-center gap-3"><Smile size={18} /> <span className="text-xs font-black uppercase tracking-widest">Auto-Inject Emojis</span></div>
                            <CheckCircle2 size={14} className={useEmojis ? 'text-blue-200' : 'text-slate-200'} />
                        </button>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Hashtag Density</label>
                            <div className="flex gap-2">
                                {['5', '10', '20', '30'].map(cnt => (
                                    <button key={cnt} onClick={() => setHashtagCount(cnt)} className={`flex-1 py-3 rounded-[30px] text-[10px] font-black transition-all ${hashtagCount === cnt ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-50 text-slate-400 border border-slate-50 hover:bg-slate-100'}`}>#{cnt}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
                {/* Card 3: Creator Hub */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[40px] p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600"><Layout className="w-7 h-7" /></div>
                        <div><h3 className="text-lg font-black text-slate-800 tracking-tight">Creator Hub</h3><p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Feed & Reels</p></div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Select Toolkit</label>
                        <CustomSelect
                            value={influencerFeature}
                            onChange={(e) => setInfluencerFeature(e.target.value)}
                            options={[
                                { value: 'insta_caption', label: 'IG Caption Engine' },
                                { value: 'hashtag_gen', label: 'Hashtag Generator' },
                                { value: 'viral_hook', label: 'Viral Hook Ideas' },
                                { value: 'reel_script', label: 'Reel Script Writer' },
                                { value: 'poll_gen', label: 'Story Poll Question' }
                            ]}
                        />
                    </div>
                </motion.div>
            </div>
            {renderActionFooter('Execute Strategy', !influencerNiche.trim())}
        </div>
    );

    const renderFreelancerUI = () => (
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Card 1: Service Profiling */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] lg:rounded-[40px] p-6 lg:p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-8 lg:space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 lg:gap-5">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl lg:rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600"><Briefcase className="w-6 h-6 lg:w-7 lg:h-7" /></div>
                            <div><h3 className="text-lg font-black text-slate-800 tracking-tight">Service Profile</h3><p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Niche & Experience</p></div>
                        </div>
                        <button
                            onClick={handleSmartConfig}
                            disabled={isAutoSuggesting}
                            className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all ${isAutoSuggesting ? 'bg-slate-100 animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg shadow-blue-500/10'}`}
                            title="AI Automation Setup"
                        >
                            {isAutoSuggesting && automationMode === 'config' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        </button>
                    </div>
                    <div className="space-y-6 lg:space-y-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Service Offered</label>
                            <input type="text" value={freelancerService} onChange={(e) => setFreelancerService(e.target.value)} placeholder="e.g. Website Development" className="w-full bg-slate-50/50 border border-slate-100 rounded-[24px] lg:rounded-[30px] px-6 lg:px-8 py-4 lg:py-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Project Budget (Optional)</label>
                            <input type="text" value={freelancerBudget} onChange={(e) => setFreelancerBudget(e.target.value)} placeholder="e.g. $2000 - $5000" className="w-full bg-slate-50/50 border border-slate-100 rounded-[24px] lg:rounded-[30px] px-6 lg:px-8 py-4 lg:py-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" />
                        </div>
                    </div>
                </motion.div>
                {/* Card 2: Client Intel */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[32px] lg:rounded-[40px] p-6 lg:p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-8 lg:space-y-10">
                    <div className="flex items-center gap-4 lg:gap-5">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl lg:rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600"><UserPlus className="w-6 h-6 lg:w-7 lg:h-7" /></div>
                        <div><h3 className="text-lg font-black text-slate-800 tracking-tight">Client Intel</h3><p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Audience Type</p></div>
                    </div>
                    <div className="space-y-6 lg:space-y-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Client Type / Industry</label>
                            <input type="text" value={freelancerClientType} onChange={(e) => setFreelancerClientType(e.target.value)} placeholder="e.g. E-commerce" className="w-full bg-slate-50/50 border border-slate-100 rounded-[24px] lg:rounded-[30px] px-6 lg:px-8 py-4 lg:py-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Communication Tone</label>
                            <CustomSelect
                                value={freelancerTone}
                                onChange={(e) => setFreelancerTone(e.target.value)}
                                options={['Professional', 'Confident', 'Creative', 'Salesy']}
                            />
                        </div>
                    </div>
                </motion.div>
                {/* Card 3: Freelance Ops */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-8 md:space-y-10">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600"><Shapes className="w-6 h-6 md:w-7 md:h-7" /></div>
                        <div><h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">Freelance Ops</h3><p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Business Growth Tools</p></div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Select Tool</label>
                        <CustomSelect
                            value={freelancerFeature}
                            onChange={(e) => setFreelancerFeature(e.target.value)}
                            options={[
                                { value: 'proposal_generator', label: 'Proposal Generator' },
                                { value: 'client_email', label: 'Client Email Writer' },
                                { value: 'portfolio_desc', label: 'Portfolio Description' },
                                { value: 'blog_generator', label: 'Blog Generator' },
                                { value: 'pricing_letter', label: 'Pricing Justification' }
                            ]}
                        />
                    </div>
                </motion.div>
            </div>
            {renderActionFooter('Execute Strategy', !freelancerService.trim() || !freelancerClientType.trim())}
        </div>
    );

    const renderStudentUI = () => (
        <div className="w-full px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                {/* Left Side: The Writing Workspace */}
                <div className="lg:col-span-8 space-y-6 md:space-y-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-12 shadow-2xl shadow-blue-500/5 border border-slate-100 flex flex-col min-h-[500px] md:min-h-[700px]"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 md:mb-12">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[28px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <PenTool className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Writing Workspace</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">AI Ready</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleAutoSuggestTopic}
                                    disabled={isAutoSuggesting}
                                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all active:scale-95 border border-blue-100/50"
                                >
                                    {isAutoSuggesting && automationMode === 'suggested' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                    Auto Suggest
                                </button>
                                <button
                                    onClick={handleTrendDetection}
                                    disabled={isAutoSuggesting}
                                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-100/50"
                                >
                                    {isAutoSuggesting && automationMode === 'trending' ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                                    Trends 2026
                                </button>
                                <button
                                    onClick={handleScheduledGen}
                                    disabled={isAutoSuggesting}
                                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all active:scale-95 border border-orange-100/50"
                                >
                                    {isAutoSuggesting && automationMode === 'scheduled' ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
                                    Roadmap
                                </button>
                                <button
                                    onClick={handleSmartConfig}
                                    disabled={isAutoSuggesting}
                                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                                    title="Universal Magic Setup"
                                >
                                    {isAutoSuggesting && automationMode === 'config' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                    Magic Setup
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 space-y-12">
                            {/* Subject & Topic Combined Logic */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <Search size={14} className="text-slate-400" />
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 1: Define Your Subject</label>
                                </div>
                                <input
                                    type="text"
                                    value={studentSubject}
                                    onChange={(e) => setStudentSubject(e.target.value)}
                                    placeholder="Which course or field are we exploring? (e.g. Modern Architecture)"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl md:rounded-[30px] px-6 md:px-10 py-5 md:py-7 text-sm md:text-lg font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <Layers size={14} className="text-slate-400" />
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 2: Refine the Final Topic</label>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50/50 rounded-full border border-blue-100/30">
                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">AI Output</span>
                                    </div>
                                </div>
                                <textarea
                                    value={studentTopic}
                                    onChange={(e) => setStudentTopic(e.target.value)}
                                    placeholder="Your precise research topic will appear here..."
                                    className="w-full bg-white border-2 border-slate-50 rounded-3xl md:rounded-[40px] p-6 md:p-12 text-sm md:text-xl font-black text-slate-800 outline-none focus:border-blue-500/20 focus:ring-0 transition-all min-h-[200px] md:min-h-[300px] resize-none shadow-inner placeholder:text-slate-200 leading-relaxed"
                                />

                                <AnimatePresence>
                                    {autoTopics.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="pt-4"
                                        >
                                            <div className="p-6 bg-slate-50/50 rounded-[32px] border border-slate-100/50 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Sparkles size={12} /> Suggestions for you
                                                    </p>
                                                    <button onClick={() => setAutoTopics([])} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={12} /></button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {autoTopics.map((topic, i) => (
                                                        <button
                                                            key={topic + i}
                                                            onClick={() => setStudentTopic(topic)}
                                                            className="text-left px-6 py-4 bg-white border border-slate-100 hover:border-blue-500 hover:shadow-md rounded-[20px] text-[11px] font-bold text-slate-600 transition-all flex items-center justify-between group"
                                                        >
                                                            <span className="line-clamp-1">{topic}</span>
                                                            <Plus size={14} className="text-slate-300 group-hover:text-blue-500 flex-shrink-0" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Advanced Controls */}
                <div className="lg:col-span-4 space-y-6 md:space-y-8">
                    {/* Tool Selection */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-6 md:space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-[22px] bg-indigo-50 flex items-center justify-center text-indigo-600"><Layout className="w-6 h-6" /></div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Toolkit</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Select Output Type</p>
                                </div>
                            </div>

                            <button
                                onClick={handleSmartConfig}
                                disabled={isAutoSuggesting}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all group border border-white/10"
                                title="AI Magic Setup: Auto-configure workspace based on topic"
                            >
                                {isAutoSuggesting && automationMode === 'config' ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                                )}
                                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Magic Setup</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <CustomSelect
                                value={studentFeature}
                                onChange={(e) => setStudentFeature(e.target.value)}
                                options={[
                                    { value: 'assignment_writer', label: 'Assignment Writer' },
                                    { value: 'essay_generator', label: 'Essay Generator' },
                                    { value: 'ab_variations', label: 'A/B Variation Generator' },
                                    { value: 'linkedin_creator', label: 'LinkedIn Post Creator' },
                                    { value: 'ppt_generator', label: 'PPT Content Generator' },
                                    { value: 'sop_writer', label: 'SOP Writer (Statement of Purpose)' },
                                    { value: 'paraphraser', label: 'Paraphraser' },
                                    { value: 'plagiarism_rewrite', label: 'Plagiarism-safe rewrite' }
                                ]}
                            />
                        </div>
                    </motion.div>

                    {/* Word Count & Tone */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-8 md:space-y-10">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Words Volume</label>
                                <CustomSelect
                                    value={studentWordCount}
                                    onChange={(e) => setStudentWordCount(e.target.value)}
                                    options={[
                                        { value: '300', label: '300 Words (Short)' },
                                        { value: '500', label: '500 Words (Standard)' },
                                        { value: '1000', label: '1000 Words (Detailed)' },
                                        { value: '2000', label: '2000+ Words (Full)' }
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tone Voice</label>
                                <CustomSelect
                                    value={studentTone}
                                    onChange={(e) => setStudentTone(e.target.value)}
                                    options={['Academic', 'Professional', 'Critical', 'Conversational']}
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                            <button onClick={() => setIsAcademicFormat(!isAcademicFormat)} className={`w-full flex items-center justify-between p-5 rounded-[30px] border transition-all ${isAcademicFormat ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}>
                                <div className="flex items-center gap-3"><CheckCircle2 size={18} className={isAcademicFormat ? 'text-white' : 'text-slate-300'} /><span className="text-xs font-black uppercase tracking-widest">Citation Mode</span></div>
                                <Zap size={14} className={isAcademicFormat ? 'text-blue-200' : 'text-slate-200'} />
                            </button>
                            <p className="text-[10px] text-slate-400 mt-4 px-2 font-bold italic leading-relaxed text-center">Enables APA/MLA bibliography generation.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
            {renderActionFooter('Execute AI Write', !studentTopic.trim())}
        </div>
    );

    const renderStartupUI = () => (
        <div className="w-full px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Card 1: Product Branding */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-8 md:space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600"><Rocket className="w-7 h-7" /></div>
                            <div><h3 className="text-lg font-black text-slate-800 tracking-tight">Product Branding</h3><p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Offer & Identity</p></div>
                        </div>
                        <button
                            onClick={handleSmartConfig}
                            disabled={isAutoSuggesting}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isAutoSuggesting ? 'bg-slate-100 animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg shadow-blue-500/10'}`}
                            title="AI Automation Setup"
                        >
                            {isAutoSuggesting && automationMode === 'config' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        </button>
                    </div>
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Product/Service Name</label>
                            <input type="text" value={startupProduct} onChange={(e) => setStartupProduct(e.target.value)} placeholder="e.g. AI Fitness App" className="w-full bg-slate-50/50 border border-slate-100 rounded-[30px] px-8 py-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Ad/Landing Page Platform</label>
                            <CustomSelect
                                value={startupPlatform}
                                onChange={(e) => setStartupPlatform(e.target.value)}
                                options={['Google/Facebook Ads', 'Landing Page V1', 'Product Launch Email', 'LinkedIn InMail']}
                            />
                        </div>
                    </div>
                </motion.div>
                {/* Card 2: Market Strategy */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-8 md:space-y-10">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600"><TargetIcon className="w-6 h-6 md:w-7 md:h-7" /></div>
                        <div><h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">Market Strategy</h3><p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Audience & Tone</p></div>
                    </div>
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Target Audience</label>
                            <CustomSelect
                                value={startupAudience}
                                onChange={(e) => setStartupAudience(e.target.value)}
                                options={['Business Owner', 'Students', 'Professional (Dr, Advocate, etc.)', 'Govt Employee', 'Retired']}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Tone Selector</label>
                            <CustomSelect
                                value={startupTone}
                                onChange={(e) => setStartupTone(e.target.value)}
                                options={['Energetic', 'Professional', 'Urgent', 'Innovative']}
                            />
                        </div>
                    </div>
                </motion.div>
                {/* Card 3: Growth Toolkit */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-8 md:space-y-10">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600"><TrendingUp className="w-6 h-6 md:w-7 md:h-7" /></div>
                        <div><h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">Growth Toolkit</h3><p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">High-Converting Features</p></div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Select Feature</label>
                        <CustomSelect
                            value={startupFeature}
                            onChange={(e) => setStartupFeature(e.target.value)}
                            options={[
                                { value: 'ad_copy', label: 'FB/Google Ad Copy' },
                                { value: 'landing_copy', label: 'Landing Page Copy' },
                                { value: 'product_desc', label: 'Product Description' },
                                { value: 'email_marketing', label: 'Email Marketing' },
                                { value: 'ab_variations', label: 'A/B Variation Generator' },
                                { value: 'cta_generator', label: 'CTA Generator' }
                            ]}
                        />
                    </div>
                </motion.div>
            </div>
            {renderActionFooter('Execute Strategy', !startupProduct.trim())}
        </div>
    );

    const renderAuthorUI = () => (
        <div className="w-full px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Card 1: Creative Context */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-8 md:space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600">
                                {authorFeature === 'poetry_generator' ? <Sparkles className="w-7 h-7" /> : <BookOpen className="w-7 h-7" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Creative Context</h3>
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Base Concepts</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSmartConfig}
                            disabled={isAutoSuggesting}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isAutoSuggesting ? 'bg-slate-100 animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg shadow-blue-500/10'}`}
                            title="AI Automation Setup"
                        >
                            {isAutoSuggesting && automationMode === 'config' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        </button>
                    </div>
                    <div className="space-y-8">
                        {authorFeature === 'poetry_generator' ? (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Poetry Theme</label>
                                    <input type="text" value={authorTheme} onChange={(e) => setAuthorTheme(e.target.value)} placeholder="e.g. Lost Love, Digital Ethics" className="w-full bg-slate-50/50 border border-slate-100 rounded-[30px] px-8 py-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Mood</label>
                                    <CustomSelect value={authorMood} onChange={(e) => setAuthorMood(e.target.value)} options={['Somber', 'Joyful', 'Wistful', 'Aggressive', 'Mystical']} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Style</label>
                                    <CustomSelect value={authorStyle} onChange={(e) => setAuthorStyle(e.target.value)} options={['Haiku', 'Sonnet', 'Free Verse', 'Limerick', 'Epic']} />
                                </div>
                                <div className="flex items-center justify-between px-4 py-4 bg-slate-50/50 rounded-[25px] border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enable Rhyme</span>
                                    <button onClick={() => setAuthorRhyme(!authorRhyme)} className={`w-12 h-6 rounded-full transition-all relative ${authorRhyme ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${authorRhyme ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        ) : authorFeature === 'script_editor' || authorFeature === 'dialogue_enhancer' ? (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Raw Script Segment</label>
                                    <textarea value={authorScript} onChange={(e) => setAuthorScript(e.target.value)} placeholder="Paste your raw script or dialogue here..." className="w-full bg-slate-50/50 border border-slate-100 rounded-[30px] p-8 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[250px] resize-none shadow-sm" />
                                </div>
                            </div>
                        ) : authorFeature === 'manuscript_editor' ? (
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Manuscript Language</label>
                                    <div className="flex gap-4">
                                        {['English', 'Hindi'].map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => setAuthorLanguage(lang)}
                                                className={`flex-1 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all border ${authorLanguage === lang ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Upload Manuscript (.doc, .docx only)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="manuscript-file-input"
                                            accept=".doc,.docx"
                                            onChange={(e) => {
                                                console.log("File selected:", e.target.files[0]);
                                                setAuthorFile(e.target.files[0]);
                                            }}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="manuscript-file-input"
                                            className={`w-full py-12 rounded-[30px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${authorFile ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/50 border-slate-200 hover:border-blue-300'}`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${authorFile ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400'}`}>
                                                {authorFile ? <CheckCircle2 /> : <LuUpload />}
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-sm font-black ${authorFile ? 'text-emerald-700' : 'text-slate-500'}`}>
                                                    {authorFile ? authorFile.name : 'Choose File'}
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    {authorFile ? `${(authorFile.size / 1024).toFixed(1)} KB` : 'Max 10MB'}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                    {authorFile && (
                                        <button onClick={() => setAuthorFile(null)} className="w-full py-4 text-[9px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition-all">Remove File</button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Story Topic/Plot</label>
                                    <textarea value={authorStoryTopic} onChange={(e) => setAuthorStoryTopic(e.target.value)} placeholder="Describe the core conflict or prompt..." className="w-full bg-slate-50/50 border border-slate-100 rounded-[30px] p-8 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[170px] resize-none shadow-sm" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Characters (Optional)</label>
                                    <input type="text" value={authorCharacters} onChange={(e) => setAuthorCharacters(e.target.value)} placeholder="e.g. Neo, Trinity" className="w-full bg-slate-50/50 border border-slate-100 rounded-[30px] px-8 py-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" />
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Card 2: Narrative Style */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[40px] p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600"><PenTool className="w-7 h-7" /></div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Narrative Style</h3>
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Voice & Format</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Genre / Category</label>
                            <input type="text" value={authorGenre} onChange={(e) => setAuthorGenre(e.target.value)} placeholder="e.g. Cyberpunk, Fantasy" className="w-full bg-slate-50/50 border border-slate-100 rounded-[30px] px-8 py-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Narrative Tone</label>
                            <CustomSelect value={authorTone} onChange={(e) => setAuthorTone(e.target.value)} options={['Creative', 'Noir', 'Futuristic', 'Classical', 'Sarcastic']} />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Length</label>
                            <CustomSelect value={authorLength} onChange={(e) => setAuthorLength(e.target.value)} options={['Short', 'Medium', 'Long', 'Epic']} />
                        </div>
                    </div>
                </motion.div>

                {/* Card 3: Author Toolkit */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[40px] p-10 shadow-xl shadow-blue-500/5 border border-slate-50 space-y-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600"><Zap className="w-7 h-7" /></div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Author Toolkit</h3>
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Select Feature</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Select Output Type</label>
                        <CustomSelect
                            value={authorFeature}
                            onChange={(e) => setAuthorFeature(e.target.value)}
                            options={[
                                { value: 'manuscript_editor', label: 'Manuscript Editor (Proofreader)' },
                                { value: 'story', label: 'Story Generator' },
                                { value: 'poetry_generator', label: 'Poetry Generator' },
                                { value: 'script_editor', label: 'Script Editor' },
                                { value: 'dialogue_enhancer', label: 'Dialogue Enhancer' },
                                { value: 'chapter_continuation', label: 'Chapter Continuation' }
                            ]}
                        />
                    </div>
                </motion.div>
            </div>
            {renderActionFooter('Execute Creative Strategy', (authorFeature === 'poetry_generator' ? !authorTheme.trim() : authorFeature === 'script_editor' ? !authorScript.trim() : authorFeature === 'manuscript_editor' ? !authorFile : !authorStoryTopic.trim()))}
        </div>
    );

    return (
        <div className="w-full flex flex-col items-center">
            <div className="flex justify-start md:justify-center gap-4 md:gap-10 border-b border-slate-50 w-full mb-6 lg:mb-12 overflow-x-auto no-scrollbar pb-2 px-4 shadow-sm md:shadow-none">
                {SEGMENTS.map((seg) => (
                    <button key={seg.id} onClick={() => setSegment(seg.id)} className={`pb-3 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.25em] transition-all relative flex items-center gap-2 md:gap-3 shrink-0 ${segment === seg.id ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}>
                        {seg.icon && <seg.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${segment === seg.id ? 'text-blue-600' : 'text-slate-300'}`} />}
                        <span className="whitespace-nowrap">{seg.label}</span>
                        {segment === seg.id && <motion.div layoutId="activeTabSegment" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full" />}
                    </button>
                ))}
            </div>
            {(segment !== 'students' && segment !== 'startups' && segment !== 'freelancers' && segment !== 'influencers' && segment !== 'authors') && (
                <div className="bg-blue-50/50 p-1.5 rounded-full flex items-center gap-2 mb-16 shadow-inner">
                    <button onClick={() => setMode('toolkit')} className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'toolkit' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-400 hover:bg-blue-100/50'}`}><Zap className="w-3.5 h-3.5" />Standard Toolkit</button>
                    <button onClick={() => setMode('planner')} className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'planner' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-blue-400 hover:bg-blue-100/50'}`}><Calendar className="w-3.5 h-3.5" />📅 AI Content Planner</button>
                </div>
            )}
            <AnimatePresence mode="wait">
                <motion.div key={segment + mode} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="w-full">
                    {segment === 'students' ? renderStudentUI() :
                        segment === 'startups' ? renderStartupUI() :
                            segment === 'freelancers' ? renderFreelancerUI() :
                                segment === 'influencers' ? renderInfluencerUI() :
                                    segment === 'authors' ? renderAuthorUI() :
                                        renderAgencyUI()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AIWRITEInputs;
