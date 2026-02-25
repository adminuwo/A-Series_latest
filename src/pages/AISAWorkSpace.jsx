import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
    BarChart3,
    Mail,
    Linkedin,
    Briefcase,
    MessageSquare,
    FileText,
    Zap,
    Filter,
    Plus,
    MoreHorizontal,
    ChevronRight,
    ChevronDown,
    User,
    Layout,
    Settings,
    Shield,
    CreditCard,
    Target,
    Users,
    TrendingUp,
    Award,
    Clock,
    CheckCircle2,
    AlertCircle,
    FilePieChart,
    Search as SearchIcon,
    Menu,
    X,
    Trash2,
    History,
    IndianRupee,
    Globe,
    Building2,
    Hash,
    CalendarDays,
    Cpu,
    Layers,
    Settings2,
    ShieldCheck,
    Bot,
    CalendarClock,
    FileSpreadsheet,
    UploadCloud,
    Phone,
    Trophy,
    Target as TargetIcon,
    GitGraph,
    Calculator,
    Newspaper,
    Network,
    TrendingDown,
    Activity,
    Download
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { getUserData } from '../userStore/userData';
import { generateChatResponse } from '../services/aivaService';
import { chatStorageService } from '../services/chatStorageService';
import { useNavigate, useParams } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

const CustomSelect = ({ value, onChange, options, placeholder, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = Array.isArray(options)
        ? (typeof options[0] === 'object'
            ? options.find(o => o.value === value || o === value)?.label || value
            : value)
        : value;

    return (
        <div ref={containerRef} className={`relative ${className} ${isOpen ? 'z-50' : 'z-0'}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-primary/30 transition-all shadow-sm flex items-center justify-between group"
            >
                <span className={!value ? "text-subtext" : ""}>{selectedLabel || placeholder}</span>
                <ChevronDown className={`w-4 h-4 text-subtext transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative z-10 bg-white/50 border border-border/40 rounded-3xl mt-2 py-2 overflow-hidden"
                    >
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                            {options.map((option, idx) => {
                                const val = typeof option === 'object' ? option.value : option;
                                const label = typeof option === 'object' ? option.label : option;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            onChange({ target: { value: val } });
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-5 py-3 text-sm transition-all hover:bg-primary/5 ${val === value ? 'text-primary font-bold bg-primary/5' : 'text-maintext hover:pl-7'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AGENTS = [
    { id: 'AISALES', name: 'Sales Intelligence', icon: Target, category: 'Growth', color: 'blue' },
    { id: 'AIWRITE', name: 'Content Intelligence', icon: FileText, category: 'Marketing', color: 'pink' },
    { id: 'AIDESK', name: 'Service Intelligence', icon: MessageSquare, category: 'Service', color: 'emerald' },
    { id: 'AIBIZ', name: 'Business Intelligence', icon: BarChart3, category: 'Strategy', color: 'red' },
    { id: 'AIHIRE', name: 'Hire Intelligence', icon: Users, category: 'HR', color: 'emerald' },
];

// AISALES Intelligence Constants
const PERSONAS = {
    CEO: {
        focus: 'ROI, strategic vision, competitive advantage, market leadership',
        language: 'Executive, high-level, outcome-focused, strategic',
        painPoints: 'Revenue growth, market share, operational efficiency, competitive threats',
        decisionCriteria: 'Strategic alignment, long-term value, competitive positioning'
    },
    CTO: {
        focus: 'Technical architecture, security, scalability, integration complexity',
        language: 'Technical, detailed, implementation-focused, architecture-oriented',
        painPoints: 'Tech debt, integration challenges, security vulnerabilities, scalability issues',
        decisionCriteria: 'Technical fit, security standards, scalability, vendor reliability'
    },
    'VP Sales': {
        focus: 'Pipeline growth, team productivity, quota attainment, sales velocity',
        language: 'Metrics-driven, practical, results-oriented, performance-focused',
        painPoints: 'Lead quality, sales cycle length, conversion rates, team efficiency',
        decisionCriteria: 'Impact on quota, ease of adoption, ROI timeline, team buy-in'
    },
    'VP Marketing': {
        focus: 'Lead generation, brand awareness, campaign ROI, attribution',
        language: 'Creative yet data-driven, brand-conscious, growth-focused',
        painPoints: 'Lead quality, attribution complexity, budget constraints, proving ROI',
        decisionCriteria: 'Marketing ROI, lead quality improvement, ease of integration'
    },
    CFO: {
        focus: 'Cost reduction, financial ROI, budget optimization, risk management',
        language: 'Financial, analytical, risk-averse, ROI-focused',
        painPoints: 'Budget constraints, proving ROI, cost control, financial risk',
        decisionCriteria: 'Clear ROI, payback period, total cost of ownership, financial risk'
    }
};

const OBJECTION_TYPES = [
    'Price/Budget',
    'Timing ("Not now")',
    'Authority ("Need to check with...")',
    'Competitor ("Using X already")',
    'Trust ("Never heard of you")',
    'Need ("Don\'t need this")',
    'Implementation ("Too complex")'
];

const FUNNEL_STAGES = [
    'Awareness (Cold)',
    'Interest (Engaged)',
    'Consideration (Evaluating)',
    'Intent (Demo Requested)',
    'Purchase (Negotiating)',
    'Closed Won',
    'Closed Lost'
];

const DEAL_STAGES = [
    'Closed Won',
    'Closed Lost'
];

const STAKEHOLDERS = [
    { role: 'CEO', priority: 'High' },
    { role: 'CTO', priority: 'High' },
    { role: 'CFO', priority: 'High' },
    { role: 'VP Sales', priority: 'Medium' },
    { role: 'VP Marketing', priority: 'Medium' }
];

const AISAWorkSpace = () => {


    const navigate = useNavigate();
    const { agentId, sessionId } = useParams();
    const { language } = useLanguage();
    const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(sessionId || 'new');

    // Sync activeAgent with agentId param
    useEffect(() => {
        if (agentId) {
            const found = AGENTS.find(a => a.id === agentId.toUpperCase());
            if (found) {
                setActiveAgent(found);
            }
        }
    }, [agentId]);

    // AISALES Specialized States
    const [salesMode, setSalesMode] = useState('Write Email');
    const [leadType, setLeadType] = useState('Enterprise');
    const [tone, setTone] = useState('Professional');

    // AISALES Advanced Features - Phase 1: Core Intelligence
    const [dealValue, setDealValue] = useState('');
    const [dealStage, setDealStage] = useState('Discovery');
    const [lastContactDate, setLastContactDate] = useState('');
    const [competitorInvolved, setCompetitorInvolved] = useState(false);
    const [companySize, setCompanySize] = useState('51-200');
    const [engagementLevel, setEngagementLevel] = useState('Medium');
    const [prospectReply, setProspectReply] = useState('');

    // AISALES Advanced Features - Phase 2: AI-Powered Messaging
    const [targetPersona, setTargetPersona] = useState('CEO');
    const [personaGoals, setPersonaGoals] = useState('');
    const [personaPainPoints, setPersonaPainPoints] = useState('');
    const [generateVariants, setGenerateVariants] = useState(true);
    const [variantCount, setVariantCount] = useState(3);
    const [ctaType, setCtaType] = useState('Medium-Commitment');
    const [outreachChannel, setOutreachChannel] = useState('Email');

    // AIHIRE Specialized States
    const [hiringMode, setHiringMode] = useState('Strategy');
    const [scorecardData, setScorecardData] = useState(null);
    const [hireRole, setHireRole] = useState('');
    const [hireDepartment, setHireDepartment] = useState('Engineering');
    const [hireSeniority, setHireSeniority] = useState('Senior');
    const [hireLocation, setHireLocation] = useState('Remote');
    const [hireBudget, setHireBudget] = useState(1500000);
    const [hireUrgency, setHireUrgency] = useState('Medium');
    const [hireTradeoff, setHireTradeoff] = useState(50);
    const [hireExtraNotes, setHireExtraNotes] = useState('');
    const [hireTeamSize, setHireTeamSize] = useState('1-5');
    const [hireIndustry, setHireIndustry] = useState('SaaS');
    const [hireBusinessStage, setHireBusinessStage] = useState('Early Startup');
    const [hireRiskTolerance, setHireRiskTolerance] = useState('Medium');
    const [hireTimelineWeeks, setHireTimelineWeeks] = useState(8);
    const [hireSourcingChannels, setHireSourcingChannels] = useState('LinkedIn');
    const [hireCandidateProfiles, setHireCandidateProfiles] = useState('');
    const [hireJobDescription, setHireJobDescription] = useState('');
    const [hireScorecardCriteria, setHireScorecardCriteria] = useState('Technical Skills, Culture Fit, Communication');
    const [hireBiasCheck, setHireBiasCheck] = useState(true);
    const [hireUploadedFiles, setHireUploadedFiles] = useState([]);
    const [hireFileAttachments, setHireFileAttachments] = useState([]);
    const [hireUploadDragging, setHireUploadDragging] = useState(false);
    const hireFileInputRef = React.useRef(null);
    const [hireOfferSalary, setHireOfferSalary] = useState('');
    const [hireEquityPercent, setHireEquityPercent] = useState('');
    const [hireCompetitorSalary, setHireCompetitorSalary] = useState('');
    const [hireOfferPerks, setHireOfferPerks] = useState('');
    const [hireCandidateLeverage, setHireCandidateLeverage] = useState('Medium');
    const [hireOrgStructure, setHireOrgStructure] = useState('Flat');
    const [hireCulturalValues, setHireCulturalValues] = useState('Speed, Ownership, Transparency');

    const handleResumeFiles = async (files) => {
        if (!files) return;
        const newFiles = Array.from(files);

        for (const file of newFiles) {
            setHireUploadedFiles(prev => [...prev, file.name]);

            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Content = e.target.result;

                // Add to attachments for AI
                setHireFileAttachments(prev => [...prev, {
                    url: base64Content,
                    name: file.name,
                    type: file.type
                }]);

                // Extract text for UI if possible
                if (file.name.endsWith('.docx')) {
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    setHireCandidateProfiles(prev => prev + `\n\n--- FILE: ${file.name} ---\n` + result.value);
                } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                    const textReader = new FileReader();
                    textReader.onload = (ev) => {
                        setHireCandidateProfiles(prev => prev + `\n\n--- FILE: ${file.name} ---\n` + ev.target.result);
                    };
                    textReader.readAsText(file);
                } else if (file.name.endsWith('.pdf')) {
                    setHireCandidateProfiles(prev => prev + `\n\n--- FILE: ${file.name} ---\n[PDF Content is sent as attachment to AI]`);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // AISALES Advanced Features - Phase 3: Analysis & Intelligence
    const [prospectObjection, setProspectObjection] = useState('');
    const [objectionType, setObjectionType] = useState('Price/Budget');
    const [yourPrice, setYourPrice] = useState('');
    const [competitorPrice, setCompetitorPrice] = useState('');
    const [valueProps, setValueProps] = useState('');
    const [mainCompetitor, setMainCompetitor] = useState('');
    const [competitorStrength, setCompetitorStrength] = useState('');
    const [subjectLine, setSubjectLine] = useState('');

    // AISALES Advanced Features - Phase 4: Strategic Planning
    const [targetAccount, setTargetAccount] = useState('');
    const [accountSize, setAccountSize] = useState('Enterprise');
    const [stakeholders, setStakeholders] = useState([
        { role: 'CEO', name: '', priority: 'High' },
        { role: 'CTO', name: '', priority: 'Medium' }
    ]);
    const [playbookType, setPlaybookType] = useState('Enterprise Sales');
    const [auditLogs, setAuditLogs] = useState('');

    // AISALES Sales Bot / Automation Features
    const [followUpReminders, setFollowUpReminders] = useState([
        { id: 1, text: 'Follow up with Ravi regarding demo', date: '2026-02-18', status: 'pending' },
        { id: 2, text: 'Send pricing sheet to T-Series', date: '2026-02-20', status: 'pending' }
    ]);
    const [excelFile, setExcelFile] = useState(null);
    const [showReminderForm, setShowReminderForm] = useState(false);
    const [newReminderText, setNewReminderText] = useState('');
    const [newReminderDate, setNewReminderDate] = useState('');

    // AISALES Advanced Features - Phase 5: Lead Center & Scripts
    const [leadScoringData, setLeadScoringData] = useState({
        score: 85,
        factors: [
            { label: 'Budget Fit', value: 'High', score: 90 },
            { label: 'Decision Power', value: 'CEO Level', score: 95 },
            { label: 'Timeliness', value: 'Q1 Budget', score: 80 }
        ],
        intent: 'Buying Signal Detected'
    });
    const [scriptType, setScriptType] = useState('Cold Call');

    // AISALES Advanced Features - Phase 6: Network & Value Intelligence
    const [stakeholderMap, setStakeholderMap] = useState([
        { id: 1, role: 'CEO', name: 'Alok Nath', relationship: 'Positive', influence: 100, type: 'Decision Maker' },
        { id: 2, role: 'CTO', name: 'Ravi Gupta', relationship: 'Neutral', influence: 80, type: 'Technical Buyer' },
        { id: 3, role: 'Procurement', name: 'Sneha Kapur', relationship: 'Negative', influence: 60, type: 'Blocker' }
    ]);
    const [roiCalc, setRoiCalc] = useState({
        currentCost: 1000000,
        expectedEfficiency: 30,
        paybackPeriod: 4, // months
        totalSavings: 300000
    });
    const [newsItems, setNewsItems] = useState([
        { id: 1, tag: 'Funding', title: 'Target raised $50M in Series B', time: '2h ago', sentiment: 'Positive' },
        { id: 2, tag: 'Staffing', title: 'New VP of Engineering hired', time: '5h ago', sentiment: 'Neutral' }
    ]);

    const [liveSignals, setLiveSignals] = useState([
        { id: 1, type: 'Intent', source: 'LinkedIn', message: 'Decision maker viewed pricing page', time: 'Just now', intensity: 'High' },
        { id: 2, type: 'Sentiment', source: 'Email', message: 'Replied with "Send more info"', time: '1m ago', intensity: 'Medium' }
    ]);

    // Real-Time Signal Simulation Engine
    useEffect(() => {
        if (activeAgent.id === 'AISALES') {
            const interval = setInterval(() => {
                const signalTypes = ['Intent', 'Sentiment', 'Movement', 'Market'];
                const sources = ['LinkedIn', 'Email', 'CRM', 'Web'];
                const messages = [
                    'Stakeholder added to committee',
                    'Pricing page dwell time > 5m',
                    'Competitor mention in email sync',
                    'Social engagement from CEO',
                    'Quarterly report released'
                ];

                const newSignal = {
                    id: Date.now(),
                    type: signalTypes[Math.floor(Math.random() * signalTypes.length)],
                    source: sources[Math.floor(Math.random() * sources.length)],
                    message: messages[Math.floor(Math.random() * messages.length)],
                    time: 'Just now',
                    intensity: Math.random() > 0.5 ? 'High' : 'Medium'
                };

                setLiveSignals(prev => [newSignal, ...prev.slice(0, 4)]);
            }, 8000); // New signal every 8 seconds

            return () => clearInterval(interval);
        }
    }, [activeAgent.id]);



    // AIWRITE Specialized States
    const [contentType, setContentType] = useState('SEO Blog Post');
    const [seoKeyword, setSeoKeyword] = useState('');
    const [targetAudience, setTargetAudience] = useState('B2B Decision Makers');
    const [contentContext, setContentContext] = useState('');
    const [brandPersonality, setBrandPersonality] = useState('');
    const [writingLength, setWritingLength] = useState(2); // 1=Short, 2=Medium, 3=Long
    const [objective, setObjective] = useState('Brand Awareness');
    const [isSeoMode, setIsSeoMode] = useState(true);
    const [isConversionMode, setIsConversionMode] = useState(false);
    const [isRepurposeMode, setIsRepurposeMode] = useState(false);

    // AIDESK Specialized States
    const [ticketCategory, setTicketCategory] = useState('Technical');
    const [urgency, setUrgency] = useState('Medium');

    // AIBIZ Specialized States
    const [industry, setIndustry] = useState('SaaS');
    const [businessStage, setBusinessStage] = useState('Idea Stage');
    const [marketType, setMarketType] = useState('B2B');
    const [businessDescription, setBusinessDescription] = useState('');
    const [aibizMode, setAibizMode] = useState('Competitor Analysis');

    const [sessions, setSessions] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showResultModal, setShowResultModal] = useState(false);


    const user = getUserData() || { name: 'Super User', email: 'user@a-series.ai', plan: 'Business' };

    // Load Sessions History
    useEffect(() => {
        const loadSessions = async () => {
            if (activeAgent?.id) {
                try {
                    const data = await chatStorageService.getSessions(activeAgent.id);
                    setSessions(data || []);
                } catch (error) {
                    console.error("Failed to load sessions:", error);
                }
            }
        };
        loadSessions();
    }, [activeAgent.id, currentSessionId, messages.length]);

    const handleDeleteSession = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Delete this session history?")) {
            await chatStorageService.deleteSession(id);
            setSessions(prev => prev.filter(s => s.sessionId !== id));
            if (currentSessionId === id) {
                navigate('/dashboard/workspace');
                setCurrentSessionId('new');
                setMessages([]);
            }
        }
    };

    useEffect(() => {
        const initWorkspace = async () => {
            const agentFromUrl = AGENTS.find(a => a.id === sessionId);
            if (agentFromUrl) {
                setActiveAgent(agentFromUrl);
                setMessages([]);
                setCurrentSessionId('new');
            } else if (sessionId && sessionId !== 'new') {
                const history = await chatStorageService.getHistory(sessionId);
                setMessages(history || []);
                setCurrentSessionId(sessionId);
                const lastModelMsg = [...(history || [])].reverse().find(m => m.role === 'model' && m.agentName);
                if (lastModelMsg) {
                    const agent = AGENTS.find(a => a.id === lastModelMsg.agentName);
                    if (agent) setActiveAgent(agent);
                }
            } else {
                setMessages([]);
                setCurrentSessionId('new');
            }
        };
        initWorkspace();
    }, [sessionId]);

    const handleAction = async (e, customPrompt = null) => {
        if (e) e.preventDefault();

        // Build the prompt from input
        let finalInput = customPrompt || inputValue;

        if (!finalInput || !finalInput.trim() || isProcessing) return;

        setIsProcessing(true);
        try {
            const userMsg = {
                id: Date.now().toString(),
                role: 'user',
                content: finalInput,
                timestamp: Date.now(),
                agentName: activeAgent.id,
                agentCategory: activeAgent.category,
                metadata: activeAgent.id === 'AISALES'
                    ? { leadType, tone, outreachChannel, accountSize, dealValue, dealStage, mainCompetitor, competitorStrength, salesMode }
                    : activeAgent.id === 'AIWRITE'
                        ? { contentType, seoKeyword, targetAudience, tone, contentContext, brandPersonality, writingLength, objective, isSeoMode, isConversionMode, isRepurposeMode }
                        : activeAgent.id === 'AIDESK'
                            ? { ticketCategory, urgency, auditLogs }
                            : activeAgent.id === 'AIBIZ'
                                ? { industry, businessStage, marketType, businessDescription }
                                : activeAgent.id === 'AIHIRE'
                                    ? { hiringMode, hireRole, hireDepartment, hireSeniority, hireLocation, hireBudget, hireUrgency, hireTradeoff, hireTeamSize, hireIndustry, hireBusinessStage, hireRiskTolerance, hireTimelineWeeks, hireSourcingChannels, hireScorecardCriteria, hireBiasCheck, hireOfferSalary, hireEquityPercent, hireCompetitorSalary, hireCandidateLeverage, hireOrgStructure, hireCulturalValues }
                                    : {}
            };

            const updatedMessages = [...messages, userMsg];
            setMessages(updatedMessages);
            setInputValue('');

            let agentSpecificInstruction = "";
            if (activeAgent.id === 'AISALES') {
                let aisalesPrompt = `
                SPECIALIZED AISALES MODE: ${salesMode}
                GLOBAL CONTEXT:
                - Target Role: ${targetPersona} (Focus: ${PERSONAS[targetPersona]?.focus})
                - Company Size: ${companySize}
                - Account Size: ${accountSize}
                - Lead Type: ${leadType}
                - Outreach Channel: ${outreachChannel}
                - Engagement Level: ${engagementLevel}
                `;
                if (dealValue || dealStage || engagementLevel) {
                    aisalesPrompt += `
                    DEAL INTELLIGENCE CONTEXT:
                    - Deal Value: ₹${dealValue || 'Unknown'}
                    - Stage: ${dealStage}
                    - Probability Factors: Competitor (${competitorInvolved ? 'Yes' : 'No'}), Last Contact (${lastContactDate || 'None'})
                    - Lead Scoring: ${leadType} account, ${outreachChannel} channel
                    MANDATORY: Regardless of the specific task, you must keep the "Lead Score" and "Deal Probability" in mind.
                    `;
                }
                if (salesMode === 'Write Email') {
                    aisalesPrompt += `
                    TASK: Generate a COMPLETE, ready-to-send sales email sequence.
                    - Target Company: ${targetAccount || 'a leading company in ' + leadType}
                    - Your Role: AI Sales Specialist
                    - Persona Goals: ${personaGoals || 'Not specified'}
                    - Persona Pain Points: ${personaPainPoints || 'Not specified'}
                    - CTA Commitment: ${ctaType}
                    INSTRUCTIONS:
                    1. SUBJECT LINES: Write 3 subject line options with predicted open rates.
                    2. EMAIL BODY: Write the core message. Use "Dynamic CTA" optimized for ${dealStage} stage.
                    3. SEQUENCE: Outline a 3-step follow-up plan.
                    4. VARIANTS: Generate ${generateVariants ? '3 distinct versions' : '1 optimized version'}.

                    MANDATORY OUTPUT FORMAT:
                    SECTION 1: SUBJECT LINE OPTIONS
                    SECTION 2: PRIMARY EMAIL DRAFT
                    SECTION 3: MULTI-CHANNEL SEQUENCE
                    SECTION 4: A/B VARIANTS
                    `;
                } else if (salesMode === 'Analyze Reply') {
                    aisalesPrompt += `
                    TASK: Analyze a prospect's reply and generate a strategic counter-response.
                    INPUT:
                    - Prospect Reply: "${prospectObjection || prospectReply}"
                    - Detected Objection: ${prospectObjection || 'None specified'}
                    - Current Deal Stage: ${dealStage}
                    INSTRUCTIONS:
                    1. INTENT CLASSIFICATION: Classify as Interested / Objection / Not Interested / Referral.
                    2. OBJECTION ANALYSIS: Identify the Root Cause (Price, Authority, Trust, Need) and psychological trigger.
                    3. FUNNEL UPDATE: Recommend if we should move them to the next stage or nurture.
                    4. DRAFT RESPONSE: Write a "Turnaround Script" using proven techniques.
                    5. STRATEGY: Provide Deal Probability update and Lead Score update.

                    MANDATORY OUTPUT FORMAT:
                    SECTION 1: INTENT CLASSIFICATION
                    SECTION 2: OBJECTION ANALYSIS
                    SECTION 3: FUNNEL UPDATE
                    SECTION 4: DRAFT RESPONSE
                    SECTION 5: STRATEGY
                    `;
                } else if (salesMode === 'Strategy') {
                    aisalesPrompt += `
                    TASK: Generate high-level sales strategy and intelligence.
                    SELECTED TOOL: ${playbookType || 'General Strategy'}
                    INPUTS:
                    - Competitor: ${mainCompetitor}
                    - Competitor Strength: ${competitorStrength || 'Unknown'}
                    - Pricing: Us (₹${yourPrice}) vs Them (₹${competitorPrice})
                    - Target Account: ${targetAccount}
                    - Stakeholders: ${JSON.stringify(stakeholders)}
                    - Value Props: ${valueProps || 'None provided'}
                    INSTRUCTIONS:
                    `;
                    if (targetAccount) {
                        aisalesPrompt += `
                        - ABM CAMPAIGN PLAN (Feature 13):
                          1. Map out stakeholders for ${targetAccount}.
                          2. Create a "Why Us, Why Now" narrative.
                          3. 30-60-90 day engagement plan.
                        `;
                    }
                    if (mainCompetitor) {
                        aisalesPrompt += `
                        - COMPETITOR BATTLECARD (Feature 11):
                          1. Kill Points (Where we win).
                          2. Landmines (What to warn the prospect about).
                          3. Depositioning Script.
                          - Main Competitor: ${mainCompetitor}
                          - Competitor Strength: ${competitorStrength}
                        `;
                    }
                    if (yourPrice || competitorPrice) {
                        aisalesPrompt += `
                        - PRICING INTELLIGENCE (Feature 10):
                          1. ROI Calculator Logic.
                          2. Cost of Inaction (COI) script.
                          3. Negotiation trade-offs.
                        `;
                    }
                    if (subjectLine) {
                        aisalesPrompt += `
                        - OPEN RATE PREDICTION (Feature 12):
                          1. Score (0-100).
                          2. Fixes for spam triggers.
                          3. Emotional impact score.
                        `;
                    }
                    aisalesPrompt += `
                    - DEAL & LEAD SCORING (Feature 1 & 2):
                      1. Calculate Win Probability based on context.
                      2. Assign a Lead Quality Score (A/B/C) based on engagement.

                    MANDATORY OUTPUT FORMAT:
                    SECTION 1: STRATEGY SUMMARY
                    SECTION 2: COMPETITOR INFO
                    SECTION 3: ACTION PLAN
                    SECTION 4: SAVINGS & ROI
                    SECTION 5: VISUALIZATIONS
                    (MANDATORY: Provide JSON data for charts inside Section 5. Do not use code blocks.)
                    {
                        "marketShare": [{"name": "Our Solution", "value": 60, "color": "#3b82f6"}, {"name": "Competitor", "value": 40, "color": "#ef4444"}],
                        "growthProjection": [{"year": "Month 1", "revenue": 20}, {"year": "Month 2", "revenue": 45}, {"year": "Month 3", "revenue": 80}],
                        "mindMap": [{"id": "1", "label": "Growth Strategy", "children": ["Inbound", "Outbound", "Referrals"]}]
                    }
                    `;
                } else if (salesMode === 'Bot') {
                    aisalesPrompt += `
                    TASK: Act as an Intelligent Sales Automation Bot.
                    INPUT:
                    - Pending Follow-ups: ${JSON.stringify(followUpReminders)}
                    - Data Source: ${excelFile ? 'Uploaded Excel: ' + excelFile.name : 'No file uploaded'}
                    INSTRUCTIONS:
                    1. DATA ANALYSIS: If an Excel file is present, analyze the prospect list and identify high-value targets.
                    2. REMINDER STRATEGY: Review pending follow-ups and suggest optimal times/messages for each.
                    3. AUTOMATION PLAN: Create a 7-day automated outreach calendar for the target account ${targetAccount}.
                    4. BOT INSIGHTS: Provide a specialized "Automation Report" with predicted conversion lift.

                    MANDATORY OUTPUT FORMAT:
                    SECTION 1: PROSPECT LIST ANALYSIS
                    SECTION 2: FOLLOW-UP OPTIMIZATION
                    SECTION 3: 7-DAY OUTREACH PLAN
                    SECTION 4: BOT RECOMMENDATIONS
                    `;
                } else if (salesMode === 'Scripts') {
                    aisalesPrompt += `
                    TASK: Generate High-Impact Sales Scripts and Objection Handlers.
                    INPUT:
                    - Script Type: ${scriptType}
                    - Target Persona: ${targetPersona} (Goals: ${personaGoals}, Pains: ${personaPainPoints})
                    - Tone: ${tone}
                    INSTRUCTIONS:
                    1. OPENING: Write a 10-second "Pattern Interrupt" opening.
                    2. CORE VALUE: Pitch the value prop focused on ${personaGoals}.
                    3. OBJECTION BATTLECARD: Provide 3 common objections for this persona and "Wolf-style" rebuttals.
                    4. CTA: A low-friction close for a discovery call.

                    MANDATORY OUTPUT FORMAT:
                    SECTION 1: BEST CALL OPENER
                    SECTION 2: CORE PITCH
                    SECTION 3: QUICK REPLIES
                    SECTION 4: CALL CLOSING
                    `;
                } else if (salesMode === 'Network') {
                    aisalesPrompt += `
                    TASK: Generate a Power Map and Stakeholder Influence Strategy.
                    INPUT:
                    - Current Stakeholders: ${JSON.stringify(stakeholderMap)}
                    INSTRUCTIONS:
                    1. INFLUENCE ANALYSIS: Identify the economic buyer, technical buyer, and potential blocker.
                    2. RELATIONSHIP STRATEGY: Provide a plan to move "Neutral" or "Negative" stakeholders to "Positive".
                    3. POWER MAP: Create a visual roadmap of how to navigate the organization to reach the decision-maker.

                    MANDATORY OUTPUT FORMAT:
                    SECTION 1: KEY CONTACTS MAP
                    SECTION 2: HOW TO WIN THEM OVER
                    SECTION 3: MAKING A FAN
                    `;
                } else if (salesMode === 'Value') {
                    aisalesPrompt += `
                    TASK: Perform a deep ROI and Value-Realization Analysis.
                    INPUT:
                    - Current Costs: ₹${roiCalc.currentCost}
                    - Expected Efficiency Gain: ${roiCalc.expectedEfficiency}%
                    INSTRUCTIONS:
                    1. HARD ROI: Calculate exact annual savings in Rupees.
                    2. SOFT ROI: Identify non-monetary gains like team morale or brand equity.
                    3. PAYBACK ANALYSIS: Confirm the payback period and break-even point.

                    MANDATORY OUTPUT FORMAT:
                    SECTION 1: SAVINGS BREAKDOWN
                    SECTION 2: STEPS TO SUCCESS
                    SECTION 3: COST OF INACTION (COI)
                    `;
                }
                aisalesPrompt += `
                FINAL OUTPUT GUARDRAILS:
                - OUTPUT MUST BE A FULL EMAIL, NOT A TEMPLATE (if in Write Email mode).
                - SECTION 5 MUST CONTAIN VALID JSON FOR STRATEGY MODE.
                - ZERO PLACEHOLDERS: If you use [ ] or { } in the final text (outside JSON), you have FAILED.
                - Be concise, actionable, and "wolf of wall street" style confident.
                - Use professional formatting (bullet points, bold text).
                - OUTPUT ONLY what is asked for in the user's selected mode (${salesMode}).
                `;
                agentSpecificInstruction = aisalesPrompt;
            } else if (activeAgent.id === 'AIWRITE') {
                agentSpecificInstruction = `
                SPECIALIZED AIWRITE MODE: ${contentType}
                TONE: ${tone}
                BRAND PERSONALITY: ${brandPersonality || 'Standard'}
                LENGTH: ${writingLength === 1 ? 'Short & Punchy' : writingLength === 3 ? 'Long-form & Detailed' : 'Medium Length'}
                TARGET AUDIENCE: ${targetAudience}
                KEYWORD / TOPIC: ${seoKeyword || 'Not specific'}
                SEO MODE: ${isSeoMode ? 'ENABLED' : 'DISABLED'}
                CONVERSION MODE: ${isConversionMode ? 'ENABLED' : 'DISABLED'}
                REPURPOSING MODE: ${isRepurposeMode ? 'ENABLED' : 'DISABLED'}
                OBJECTIVE: ${objective}
                CONTEXT: ${contentContext || 'None'}
                You are a Senior Content Strategist and Direct Response Copywriter.
                Your role: Always write structured, engaging, and conversion-focused content.
                1. AVOID GENERIC WRITING. Be specific, punchy, and valuable.
                2. Adapt tone perfectly to '${tone}'.
                3. Use strong hooks (first 2 lines must grab attention).
                4. Structure content for readability (short paragraphs, bullet points).
                ${isConversionMode ? `
                CONVERSION OPTIMIZATION (CRITICAL):
                - Use "Problem-Agitation-Solution" (PAS) or "AIDA" framework.
                - Include clear, action-oriented CTAs.
                - Use emotional triggers and power words.
                - Pre-emptively handle common objections in the copy.
                ` : ''}
                ${isSeoMode ? `
                SEO INSTRUCTIONS (CRITICAL):
                - Integrate primary keyword: "${seoKeyword}" naturally.
                - Use H1, H2, H3 structure for readability and SEO.
                - Suggest keyword density (approx 1-2%).
                - Provide optimized Meta Title and Description.
                ` : ''}
                ${isRepurposeMode ? `
                REPURPOSING INSTRUCTIONS (CRITICAL):
                You must assume the MAIN DRAFT is the "source of truth".
                Then, generate separate, platform-native versions of that SAME core message for LinkedIn, Twitter, Email, ads, and captions.
                ` : ''}
                MANDATORY OUTPUT FORMAT:
                SECTION 1: MAIN CONTENT
                SECTION 2: SEO ANALYSIS
                SECTION 3: CTA OPTIMIZATION
                SECTION 4: REPURPOSED CONTENT
                SECTION 5: VISUALIZATIONS
                (MANDATORY: Provide JSON data for charts inside Section 5. Do not use code blocks.)
                {
                    "marketShare": [{"name": "SEO Traffic", "value": 50, "color": "#ec4899"}, {"name": "Direct", "value": 30, "color": "#94a3b8"}, {"name": "Social", "value": 20, "color": "#3b82f6"}],
                    "growthProjection": [{"year": "Day 1", "revenue": 10}, {"year": "Day 7", "revenue": 40}, {"year": "Day 30", "revenue": 100}],
                    "mindMap": [{"id": "1", "label": "Content Cluster", "children": ["Support", "Case Study", "Tutorial"]}]
                }
                `;
            } else if (activeAgent.id === 'AIDESK') {
                agentSpecificInstruction = `
                SPECIALIZED AIDESK MODE
                TICKET CATEGORY: ${ticketCategory}
                URGENCY LEVEL: ${urgency}
                AUDIT LOGS / CONTEXT: ${auditLogs || 'None'}
                MANDATORY OUTPUT FORMAT:
                SECTION 1: SUPPORT REPLY
                SECTION 2: RESOLUTION SUMMARY
                SECTION 3: SENTIMENT ANALYSIS
                `;
            } else if (activeAgent.id === 'AIBIZ') {
                agentSpecificInstruction = `
                SPECIALIZED AIBIZ MODE: ${aibizMode}
                INDUSTRY: ${industry}
                BUSINESS STAGE: ${businessStage}
                MARKET TYPE: ${marketType}
                PRICING: Us (₹${yourPrice || 'Not set'}) vs Competitors (₹${competitorPrice || 'Not set'})
                BUSINESS DESCRIPTION: ${businessDescription || 'Not provided'}
                Industry Context: ${industry}. Stage: ${businessStage}. Market: ${marketType}.
                MODE: ${aibizMode}.
                ${user.plan === 'Pro' || user.plan === 'Business' ? 'Provide deep strategy for Pro plan.' : ''}
                MANDATORY OUTPUT FORMAT:
                SECTION 1: SWOT ANALYSIS
                SECTION 2: PRICING STRATEGY
                SECTION 3: POSITIONING STRATEGY
                SECTION 4: GROWTH ROADMAP
                SECTION 5: VISUALIZATIONS
                (MANDATORY: Provide JSON data for charts inside Section 5. Do not use code blocks.)
                {
                    "marketShare": [{"name": "Comp A", "value": 30, "color": "#0088FE"}],
                    "growthProjection": [{"year": "2024", "revenue": 100}],
                    "mindMap": [{"id": "1", "label": "Start", "children": ["A", "B"]}]
                }
                `;
            } else if (activeAgent.id === 'AIHIRE') {
                agentSpecificInstruction = `
                SPECIALIZED AIHIRE MODE: ${hiringMode}
                CONTEXT:
                - Role: ${hireRole} (${hireSeniority} level)
                - Department: ${hireDepartment}
                - Location: ${hireLocation}
                - Budget: ₹${hireBudget}
                - Urgency: ${hireUrgency}
                - Quality/Speed Tradeoff: ${hireTradeoff}%
                - Industry: ${hireIndustry}
                - Business Stage: ${hireBusinessStage}
                
                ${hiringMode === 'Strategy' ? `
                GOAL: Create a hiring roadmap. Timeline: ${hireTimelineWeeks} weeks. Risk: ${hireRiskTolerance}. Sourcing: ${hireSourcingChannels}.
                NOTES: ${hireExtraNotes}
                SECTIONS: READINESS SCORE, TRADE-OFF ANALYSIS, RISK RADAR, COST FORECAST, VISUALIZATIONS.
                ` : hiringMode === 'Evaluation' ? `
                GOAL: Rank candidates and check bias. Criteria: ${hireScorecardCriteria}. Bias Check: ${hireBiasCheck}.
                JD: ${hireJobDescription}
                PROFILES: ${hireCandidateProfiles}
                SECTIONS: SCORECARD FRAMEWORK, CANDIDATE RANKING (with SCORECARD_JSON), BIAS REPORT, INTERVIEW FRAMEWORK, VISUALIZATIONS.
                ` : hiringMode === 'Offer' ? `
                GOAL: Closing strategy. 
                CANDIDATE_DETAILS: ${hireExtraNotes}
                TARGET_OFFER: Salary: ₹${hireOfferSalary}, Equity: ${hireEquityPercent}%, Perks: ${hireOfferPerks}.
                MARKET_CONTEXT: Competitor: ₹${hireCompetitorSalary}, Leverage: ${hireCandidateLeverage}.
                SECTIONS: MARKET BENCHMARK, EQUITY ANALYSIS, ACCEPTANCE PROBABILITY, NEGOTIATION PLAYBOOK, VISUALIZATIONS.
                ` : `${hiringMode === 'Planning' ? `
                GOAL: Org design and headcount forecasting. 
                CONTEXT: ${hireExtraNotes}
                STRUCTURE: ${hireOrgStructure}. Values: ${hireCulturalValues}.
                SECTIONS: SCALABILITY AUDIT, CAPACITY PLANNING, REPORTING LINES, SUCCESSION PLAN, VISUALIZATIONS.
                ` : `
                GOAL: Talent Analytics and Funnel Optimization. 
                ANALYSIS_REQUEST: ${hireExtraNotes || 'General funnel efficiency and cost-per-hire analysis.'}
                SECTIONS: FUNNEL PERFORMANCE, BUDGET ATTRIBUTION, TURNOVER PREDICTION, DATA VISUALIZATIONS.
                `}`}
                
                ${activeAgent.id === 'AIHIRE' ? `
                IMPORTANT: The user has requested a specific function: "${finalInput}".
                You must ONLY provide the analysis/output for this specific function. Do not provide a generic overview of other modes.
                Maintain the context of "${hiringMode}" but focus exclusively on the requested task.
                ${hiringMode === 'Evaluation' ? 'MANDATORY: You must provide a "match percentage" out of 100 for each candidate in Section 2, indicating how well they fit the job.' : ''}
                MANDATORY: You must respond in English. Absolutely NO HINDI or other languages allowed. Every single word of your response must be in English.
                ` : ''}

                MANDATORY OUTPUT FORMAT:
                SECTION 1: EXECUTIVE SUMMARY
                SECTION 2: DETAILED ANALYSIS
                SECTION 3: ACTIONABLE STEPS
                SECTION 4: RISK & MITIGATION (Only if applicable to "${finalInput}")
                SECTION 5: VISUALIZATIONS
                (MANDATORY: Provide JSON data for charts inside Section 5. Do not use code blocks.)
                {
                    "marketShare": [{"name": "Talent Pool", "value": 70, "color": "#10b981"}],
                    "growthProjection": [{"year": "Week 1", "revenue": 10}, {"year": "Week 4", "revenue": 50}],
                    "mindMap": [{"id": "1", "label": "Hiring Funnel", "children": ["Sourcing", "Screening", "Offer"]}]
                }

                ${hiringMode === 'Evaluation' ? 'MANDATORY: For Evaluation mode, you MUST include a SCORECARD_JSON_START ... SCORECARD_JSON_END block after Section 2 containing the parsed scores for visualizations.' : ''}
                `;
            }

            const systemInstruction = `You are ${activeAgent.name}, part of the A-Series AI Business OS.
                Focus: ${activeAgent.category}.
                ${agentSpecificInstruction}
                MANDATORY: You must respond in ${activeAgent.id === 'AIHIRE' ? 'English' : (language || 'English')}.
                Use Markdown formatting effectively.`;

            let activeSessionId = currentSessionId;
            if (activeSessionId === 'new') {
                const newSession = await chatStorageService.createSession(activeAgent.id, finalInput.substring(0, 30) + '...');
                activeSessionId = newSession.sessionId;
                setCurrentSessionId(activeSessionId);
                setSessions(prev => [newSession, ...prev]);
            }
            await chatStorageService.saveMessage(activeSessionId, userMsg);
            const attachments = activeAgent.id === 'AIHIRE' ? hireFileAttachments : [];
            const response = await generateChatResponse(updatedMessages, finalInput, systemInstruction, attachments, activeAgent.id === 'AIHIRE' ? 'English' : (language || 'English'), null, null, { agentType: activeAgent.id });
            const aiReply = response.reply || response;
            const modelMsg = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: aiReply,
                timestamp: Date.now(),
                agentName: activeAgent.id,
                agentCategory: activeAgent.category
            };
            setMessages(prev => [...prev, modelMsg]);

            setShowResultModal(true);
            await chatStorageService.saveMessage(activeSessionId, modelMsg);
        } catch (err) {
            console.error('[WORKSPACE ERROR]', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const groupSessionsByDate = (sessions) => {
        const groups = {
            'Today': [],
            'Yesterday': [],
            'Previous 7 Days': [],
            'Older': []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterday = today - 86400000;
        const lastWeek = today - 86400000 * 7;

        sessions.forEach(session => {
            const date = new Date(session.lastModified).getTime();
            if (date >= today) groups['Today'].push(session);
            else if (date >= yesterday) groups['Yesterday'].push(session);
            else if (date >= lastWeek) groups['Previous 7 Days'].push(session);
            else groups['Older'].push(session);
        });

        return groups;
    };

    const handleNewChat = () => {
        if (activeAgent?.id) {
            navigate(`/dashboard/workspace/${activeAgent.id}`);
        } else {
            navigate('/dashboard/workspace');
        }
        setMessages([]);
        setCurrentSessionId('new');
        setInputValue('');
        setFollowUpReminders([]);
        setExcelFile(null);
        setShowReminderForm(false);
    };

    const handleAddReminder = (e) => {
        e.preventDefault();
        if (!newReminderText || !newReminderDate) return;
        const newRem = {
            id: Date.now(),
            text: newReminderText,
            date: newReminderDate,
            status: 'pending'
        };
        setFollowUpReminders(prev => [newRem, ...prev]);
        setNewReminderText('');
        setNewReminderDate('');
        setShowReminderForm(false);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setExcelFile(file);
            console.log("File uploaded:", file.name);
        }
    };

    const getIconForContent = (title) => {
        const t = title.toUpperCase();
        if (t.includes('EMAIL') || t.includes('DRAFT')) return Mail;
        if (t.includes('STRATEGY') || t.includes('PLAN')) return Target;
        if (t.includes('ANALYSIS') || t.includes('REVIEW')) return SearchIcon;
        if (t.includes('TREND') || t.includes('GROWTH')) return TrendingUp;
        if (t.includes('KPI') || t.includes('METRIC')) return BarChart3;
        return Zap;
    };

    const renderCardContent = (card) => {
        if (card.type === 'charts' && card.chartData) {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {card.chartData.marketShare && (
                        <div className="h-64">
                            <p className="text-[10px] font-bold text-center mb-2">MARKET SHARE</p>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={card.chartData.marketShare} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {card.chartData.marketShare.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {card.chartData.growthProjection && (
                        <div className="h-64">
                            <p className="text-[10px] font-bold text-center mb-2">GROWTH PROJECTION</p>
                            <ResponsiveContainer>
                                <BarChart data={card.chartData.growthProjection}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="year" fontSize={10} />
                                    <YAxis fontSize={10} />
                                    <Tooltip />
                                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {card.chartData.mindMap && (
                        <div className="col-span-full border-t border-border pt-6">
                            <p className="text-[10px] font-bold text-center mb-4">STRATEGY MAP</p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                {card.chartData.mindMap.map((node, ni) => (
                                    <div key={ni} className="p-3 bg-secondary/50 rounded-lg border border-border min-w-[150px]">
                                        <p className="text-xs font-bold mb-2">{typeof node.label === 'string' ? node.label : JSON.stringify(node.label)}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {(node.children || []).map((c, j) => (
                                                <span key={j} className="text-[9px] px-2 py-0.5 bg-white rounded-full border border-border">
                                                    {typeof c === 'string' ? c : typeof c === 'object' ? (c.label || JSON.stringify(c)) : String(c)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (card.type === 'swot') {
            return (
                <div className="grid grid-cols-2 gap-3 mt-2">
                    {['Strengths', 'Weaknesses', 'Opportunities', 'Threats'].map((q) => (
                        <div key={q} className="p-4 rounded-2xl border border-border bg-secondary/20">
                            <p className="text-[10px] font-black uppercase mb-1">{q}</p>
                            <p className="text-[9px] text-subtext leading-relaxed">
                                {card.content.split(q)[1]?.split('\n')[0]?.replace(/[:-]/g, '').trim() || 'Analysis pending...'}
                            </p>
                        </div>
                    ))}
                </div>
            );
        }

        if (card.type === 'analysis_data' && card.chartData) {
            const renderRecursiveValue = (val) => {
                if (Array.isArray(val)) {
                    return val.map((v, i) => (
                        <div key={i} className="text-[10px] mt-1 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                            <span>{typeof v === 'object' ? renderRecursiveValue(v) : String(v)}</span>
                        </div>
                    ));
                }
                if (typeof val === 'object' && val !== null) {
                    return Object.entries(val).map(([k, v]) => (
                        <div key={k} className="mt-1">
                            <span className="text-[9px] font-black text-subtext/50 uppercase mr-1">{k.replace(/_/g, ' ')}:</span>
                            <span className="text-[10px] text-maintext">{typeof v === 'object' ? renderRecursiveValue(v) : String(v)}</span>
                        </div>
                    ));
                }
                return String(val);
            };

            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {Object.entries(card.chartData).map(([key, value]) => {
                        const label = key.replace(/_/g, ' ').toUpperCase();
                        return (
                            <div key={key} className="p-4 rounded-2xl border border-border bg-secondary/10 flex flex-col gap-1">
                                <p className="text-[9px] font-black text-subtext/60 uppercase tracking-widest">{label}</p>
                                <div className="text-[11px] font-bold text-maintext leading-relaxed">
                                    {renderRecursiveValue(value)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        const safeContent = typeof card.content === 'string'
            ? card.content
            : card.content != null
                ? JSON.stringify(card.content, null, 2)
                : '';
        return (
            <div className="text-xs text-subtext leading-relaxed font-medium">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        table: ({ node, ...props }) => <div className="overflow-x-auto my-4 rounded-xl border border-border/50 shadow-sm"><table className="w-full text-left border-collapse bg-white" {...props} /></div>,
                        thead: ({ node, ...props }) => <thead className="bg-secondary/50 text-[10px] font-black uppercase tracking-widest text-subtext border-b border-border/40" {...props} />,
                        tbody: ({ node, ...props }) => <tbody className="divide-y divide-border/20" {...props} />,
                        tr: ({ node, ...props }) => <tr className="hover:bg-secondary/10 transition-colors group" {...props} />,
                        th: ({ node, ...props }) => <th className="px-4 py-3 first:pl-6 last:pr-6 whitespace-nowrap" {...props} />,
                        td: ({ node, ...props }) => <td className="px-4 py-3 first:pl-6 last:pr-6 text-maintext align-top" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-3 last:mb-0 leading-relaxed whitespace-pre-wrap" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-3 space-y-1 marker:text-primary" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-3 space-y-1 marker:text-primary font-bold" {...props} />,
                        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                        a: ({ node, ...props }) => <a className="text-primary hover:underline font-bold" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-black text-maintext" {...props} />,
                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-4 bg-secondary/20 rounded-r-xl italic text-maintext" {...props} />,
                        code: ({ node, inline, className, children, ...props }) => {
                            if (inline) return <code className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-maintext border border-border/50" {...props}>{children}</code>;
                            return <div className="bg-[#1e1e1e] rounded-xl p-4 overflow-x-auto my-4 text-white text-[10px] font-mono shadow-inner"><code {...props}>{children}</code></div>;
                        }
                    }}
                >
                    {safeContent}
                </ReactMarkdown>
            </div>
        );
    };

    const renderMessageAsCards = (msg) => {
        if (!msg || msg.role === 'user') return null;
        try {
            let sections = msg.content.split(/SECTION \d+:/).filter(s => s.trim());
            if (sections.length <= 1) {
                const headerSplit = msg.content.split(/#{2,3}\s/).filter(s => s.trim());
                if (headerSplit.length > 1) {
                    sections = headerSplit;
                } else {
                    // If still only 1 or 0 sections, try splitting by common titles in caps if present
                    const titleSplit = msg.content.split(/\n([A-Z\s]{5,}):?\n/).filter(s => s.trim());
                    if (titleSplit.length > 1) {
                        sections = titleSplit;
                    } else {
                        sections = [msg.content];
                    }
                }
            }
            const cards = sections.map(sec => {
                const firstNewLine = sec.indexOf('\n');
                let title = firstNewLine !== -1 ? sec.substring(0, firstNewLine).trim() : 'Analysis';
                let content = firstNewLine !== -1 ? sec.substring(firstNewLine).trim() : sec;

                // Clean up title and content
                title = title.replace(/^\d+:\s*/, '').replace(/\*+/g, '').replace(/[:#]/g, '').trim();
                content = content.replace(/```(json|JSON)?/g, '').replace(/```/g, '').trim();

                let icon = getIconForContent(title, content);
                let type = 'default';
                let chartData = null;

                if (title.toUpperCase().includes('SWOT')) {
                    icon = Layout;
                    type = 'swot';
                }
                if (title.toUpperCase().includes('VISUALIZATIONS') || content.trim().startsWith('{')) {
                    const isVisual = title.toUpperCase().includes('VISUALIZATIONS');
                    icon = isVisual ? FilePieChart : Layout;
                    type = isVisual ? 'charts' : 'analysis_data';
                    try {
                        const jsonStr = content.match(/\{[\s\S]*\}/)?.[0];
                        if (jsonStr) chartData = JSON.parse(jsonStr);
                    } catch (e) {
                        console.error("JSON parse error", e);
                    }
                }

                return { title, content, icon, type, chartData };
            });
            return { title: `Deep Intelligence Result`, cards };
        } catch (err) {
            console.error('[renderMessageAsCards error]', err);
            return { title: 'Analysis Result', cards: [{ title: 'Result', content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content), icon: Zap, type: 'default', chartData: null }] };
        }
    };

    const renderAgentInputs = () => {
        switch (activeAgent.id) {
            case 'AISALES':
                return (
                    <div className="col-span-full space-y-10">
                        {/* Centered Tab Bar */}
                        <div className="flex justify-center border-b border-border/20 pb-4">
                            <div className="flex gap-10">
                                {[
                                    { id: 'Write Email', label: 'Email' },
                                    { id: 'Analyze Reply', label: 'Reply' },
                                    { id: 'Strategy', label: 'Strategy' },
                                    { id: 'Bot', label: 'Bot' },
                                    { id: 'Scripts', label: 'Calls' },
                                    { id: 'Network', label: 'People' },
                                    { id: 'Value', label: 'Savings' }
                                ].map((modeOption) => (
                                    <button
                                        key={modeOption.id}
                                        onClick={() => setSalesMode(modeOption.id)}
                                        className={`relative py-2 text-sm font-bold transition-all duration-300 ${salesMode === modeOption.id
                                            ? 'text-primary'
                                            : 'text-subtext hover:text-maintext'
                                            }`}
                                    >
                                        {modeOption.label}
                                        {salesMode === modeOption.id && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute -bottom-4 left-0 right-0 h-1 bg-primary rounded-t-full"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {salesMode === 'Write Email' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Card 1: Deal Profile */}
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-blue-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-500 rounded-3xl">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Profile</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Target & Persona</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Account Name</label>
                                            <input
                                                type="text"
                                                value={targetAccount}
                                                onChange={(e) => setTargetAccount(e.target.value)}
                                                placeholder="Enter company name"
                                                className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-primary/30 transition-all shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Target Persona</label>
                                            <CustomSelect
                                                value={targetPersona}
                                                onChange={(e) => setTargetPersona(e.target.value)}
                                                options={Object.keys(PERSONAS)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Deal Value (₹)</label>
                                            <input
                                                type="number"
                                                value={dealValue}
                                                onChange={(e) => setDealValue(e.target.value)}
                                                placeholder="Expected deal size"
                                                className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-primary/30 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2: Strategic Intel */}
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-blue-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-3xl">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Competition</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Market Edge</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Main Competitor</label>
                                            <input
                                                type="text"
                                                value={mainCompetitor}
                                                onChange={(e) => setMainCompetitor(e.target.value)}
                                                placeholder="Who are we against?"
                                                className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-indigo-500/30 transition-all shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Their Edge</label>
                                            <CustomSelect
                                                value={competitorStrength}
                                                onChange={(e) => setCompetitorStrength(e.target.value)}
                                                options={['Pricing', 'Features', 'Brand', 'Support']}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Sales Guide</label>
                                            <CustomSelect
                                                value={playbookType}
                                                onChange={(e) => setPlaybookType(e.target.value)}
                                                options={['Enterprise Sales', 'SaaS Sales', 'Discovery Guide']}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3: Interaction Sync */}
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-blue-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-3xl">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Activity</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Engagement Sync</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Deal Stage</label>
                                            <CustomSelect
                                                value={dealStage}
                                                onChange={(e) => setDealStage(e.target.value)}
                                                options={DEAL_STAGES}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Last Contact</label>
                                            <input
                                                type="date"
                                                value={lastContactDate}
                                                onChange={(e) => setLastContactDate(e.target.value)}
                                                className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-emerald-500/30 transition-all shadow-sm [color-scheme:light]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Channel</label>
                                            <CustomSelect
                                                value={outreachChannel}
                                                onChange={(e) => setOutreachChannel(e.target.value)}
                                                options={['Email', 'LinkedIn', 'Cold Call']}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Full Width Bottom Inputs (Optional) */}
                                <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-4 shadow-xl shadow-blue-500/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Award className="w-5 h-5 text-amber-500" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Sales Goals</h4>
                                        </div>
                                        <textarea
                                            value={personaGoals}
                                            onChange={(e) => setPersonaGoals(e.target.value)}
                                            placeholder="What specific outcome are you helping them achieve?"
                                            className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext h-32 focus:outline-none focus:border-amber-500/30 transition-all shadow-inner resize-none"
                                        />
                                    </div>
                                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-4 shadow-xl shadow-blue-500/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Pain Points</h4>
                                        </div>
                                        <textarea
                                            value={personaPainPoints}
                                            onChange={(e) => setPersonaPainPoints(e.target.value)}
                                            placeholder="What is their single biggest problem right now?"
                                            className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext h-32 focus:outline-none focus:border-red-500/30 transition-all shadow-inner resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {salesMode === 'Analyze Reply' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Left Side: Text Input */}
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-6 shadow-xl shadow-blue-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-500 rounded-3xl">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Conversation</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Prospect Outreach</p>
                                        </div>
                                    </div>
                                    <textarea
                                        value={prospectReply}
                                        onChange={(e) => setProspectReply(e.target.value)}
                                        placeholder="Paste the prospect's reply here..."
                                        className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext h-64 focus:outline-none focus:border-primary/30 transition-all shadow-inner resize-none"
                                    />
                                </div>

                                {/* Right Side: Objection Intel */}
                                <div className="space-y-8">
                                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-6 shadow-xl shadow-blue-500/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-red-50 text-red-500 rounded-3xl">
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-maintext">Objections</h3>
                                                <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Resistance Detection</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Specific Counter</label>
                                                <input
                                                    type="text"
                                                    value={prospectObjection}
                                                    onChange={(e) => setProspectObjection(e.target.value)}
                                                    placeholder="e.g. Too expensive"
                                                    className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-red-500/30 transition-all shadow-sm"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Sentiment</label>
                                                    <CustomSelect
                                                        value={engagementLevel}
                                                        onChange={(e) => setEngagementLevel(e.target.value)}
                                                        options={['Low', 'Medium', 'High']}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-[40px] p-8 text-white shadow-xl shadow-red-500/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Engagement Score</p>
                                            <Zap className="w-5 h-5 opacity-80" />
                                        </div>
                                        <h2 className="text-4xl font-black">{engagementLevel === 'High' ? '85%' : engagementLevel === 'Medium' ? '45%' : '12%'}</h2>
                                        <p className="text-[10px] font-bold mt-2 opacity-70">Likelihood of conversion with proper rebuttal</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {salesMode === 'Strategy' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Left: Pricing & Value */}
                                <div className="space-y-10">
                                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-blue-500/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-amber-50 text-amber-500 rounded-3xl">
                                                <IndianRupee className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-maintext">Value Architecture</h3>
                                                <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Pricing & Impact</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Our Price (₹)</label>
                                                <input
                                                    type="number"
                                                    value={yourPrice}
                                                    onChange={(e) => setYourPrice(e.target.value)}
                                                    className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm font-black text-maintext focus:outline-none focus:border-amber-500/30 transition-all shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Comp. Price (₹)</label>
                                                <input
                                                    type="number"
                                                    value={competitorPrice}
                                                    onChange={(e) => setCompetitorPrice(e.target.value)}
                                                    className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm font-black text-maintext focus:outline-none focus:border-amber-500/30 transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-6 shadow-xl shadow-blue-500/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-pink-50 text-pink-500 rounded-3xl">
                                                <TrendingUp className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-maintext">Propositions</h3>
                                                <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Why You Win</p>
                                            </div>
                                        </div>
                                        <textarea
                                            value={valueProps}
                                            onChange={(e) => setValueProps(e.target.value)}
                                            placeholder="What's the unique edge?"
                                            className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext h-40 focus:outline-none focus:border-pink-500/30 transition-all shadow-inner resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Right: Cadence Visualizer */}
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-10 shadow-xl shadow-blue-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-50 text-purple-500 rounded-3xl">
                                            <GitGraph className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">7-Day Plan</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Sync Outreach</p>
                                        </div>
                                    </div>

                                    <div className="relative pl-10 space-y-10 before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-gradient-to-b before:from-purple-500/40 before:to-transparent">
                                        {[
                                            { day: 'Day 1', action: 'LinkedIn Personal Connect', icon: Linkedin },
                                            { day: 'Day 3', action: 'Value-First Email Pitch', icon: Mail },
                                            { day: 'Day 5', action: 'Discovery Call (The Close)', icon: Phone },
                                            { day: 'Day 7', action: 'Video Strategy Loom', icon: Zap }
                                        ].map((step, i) => (
                                            <div key={i} className="relative group">
                                                <div className="absolute -left-[30.5px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-purple-500 shadow-lg z-10 group-hover:scale-125 transition-transform" />
                                                <div className="p-6 bg-white border border-border/40 rounded-3xl flex items-center justify-between group-hover:border-purple-300 transition-all shadow-sm">
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">{step.day}</span>
                                                        <p className="text-sm font-black text-maintext mt-2">{step.action}</p>
                                                    </div>
                                                    <step.icon className="w-5 h-5 text-purple-300" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {salesMode === 'Bot' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Card 1: Data Intel */}
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-blue-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-3xl">
                                            <FileSpreadsheet className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Data</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Prospect List</p>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => document.getElementById('excel-upload').click()}
                                        className="p-8 border-2 border-dashed border-emerald-500/20 hover:border-emerald-500/40 rounded-3xl bg-emerald-50/30 transition-all text-center cursor-pointer group"
                                    >
                                        <input
                                            id="excel-upload"
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            className="hidden"
                                            onChange={(e) => e.target.files[0] && setExcelFile(e.target.files[0])}
                                        />
                                        <div className="inline-flex p-3 bg-white shadow-sm rounded-3xl text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                                            <UploadCloud className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-black text-maintext">Upload Intel</p>
                                        <p className="text-[10px] text-subtext mt-1">XLSX, CSV supported</p>
                                        {excelFile && (
                                            <div className="mt-4 p-2 bg-emerald-500 text-white rounded-2xl text-[10px] font-bold truncate">
                                                {excelFile.name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card 2: Reminders */}
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-blue-500/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-500 rounded-3xl">
                                                <CalendarClock className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-maintext">Flow</h3>
                                                <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Follow-ups</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowReminderForm(!showReminderForm)}
                                            className="p-2 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-100 transition-colors"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                                        {followUpReminders.length === 0 ? (
                                            <div className="py-10 text-center border border-dashed border-border/40 rounded-3xl">
                                                <p className="text-[10px] text-subtext font-bold uppercase tracking-widest">Clear queue</p>
                                            </div>
                                        ) : (
                                            followUpReminders.map(rem => (
                                                <div key={rem.id} className="p-4 bg-[#f8fafc]/50 border border-border/30 rounded-3xl flex items-center justify-between group">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-black text-maintext truncate">{rem.text}</p>
                                                        <p className="text-[9px] text-subtext font-bold mt-1 uppercase">{rem.date}</p>
                                                    </div>
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Card 3: Market Monitor */}
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-blue-500/5 relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full" />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-amber-500 text-white rounded-3xl shadow-xl shadow-amber-200 ring-4 ring-amber-50">
                                                <Activity className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-maintext tracking-tight">Monitor</h3>
                                                <p className="text-[10px] font-bold text-subtext uppercase tracking-[0.2em]">Live Account Intel</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black text-amber-600 uppercase">Live</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {newsItems.map(news => (
                                            <div key={news.id} className="p-5 bg-white/60 border border-border/20 rounded-3xl group hover:border-amber-500/40 transition-all shadow-sm flex items-start gap-4">
                                                <div className={`p-2 rounded-lg shrink-0 ${news.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {news.sentiment === 'Positive' ? <TrendingUp className="w-4 h-4" /> : <Newspaper className="w-4 h-4" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black uppercase text-amber-600 tracking-wider">#{news.tag}</span>
                                                        <span className="text-[8px] text-subtext font-bold uppercase">• {news.time}</span>
                                                    </div>
                                                    <p className="text-[12px] font-black text-maintext leading-tight group-hover:text-amber-600 transition-colors">{news.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 bg-amber-50/50 rounded-3xl border border-amber-100/50 flex items-center gap-3">
                                        <Zap className="w-4 h-4 text-amber-500" />
                                        <p className="text-[10px] font-bold text-amber-700">AI is tracking 42 key accounts in real-time</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {salesMode === 'Scripts' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Left: Config */}
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-blue-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-500 rounded-3xl">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Dialer</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Script Config</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Script Type</label>
                                            <CustomSelect
                                                value={scriptType}
                                                onChange={(e) => setScriptType(e.target.value)}
                                                options={['Cold Call', 'Follow-up Call', 'Discovery Call']}
                                            />
                                        </div>
                                        <div className="p-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl text-white shadow-xl shadow-blue-500/20 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Predicted Win Rate</p>
                                            <h2 className="text-4xl font-black mt-2">74%</h2>
                                            <button
                                                onClick={() => handleAction(null, `Generate a ${scriptType} script`)}
                                                className="mt-6 w-full py-3 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all"
                                            >
                                                Draft Script
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Battlecards */}
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-blue-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-50 text-red-500 rounded-3xl">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Battlecards</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Pivot Logic</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { title: 'Too Expensive', hook: 'Redirect to ROI' },
                                            { title: 'Using Competitor', hook: 'Differentiate Value' },
                                            { title: 'No Time', hook: 'Lower Friction' }
                                        ].map((card, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAction(null, `Generate a rebuttal for: ${card.title}`)}
                                                className="p-5 bg-[#f8fafc]/50 border border-border/30 rounded-3xl flex items-center justify-between group hover:border-red-500/30 transition-all shadow-sm"
                                            >
                                                <div className="text-left">
                                                    <p className="text-[11px] font-black text-maintext">{card.title}</p>
                                                    <p className="text-[9px] text-subtext font-bold uppercase tracking-widest mt-1">{card.hook}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-red-300 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {salesMode === 'Network' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Card 1: Power Map */}
                                <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-blue-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-3xl">
                                            <Network className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Power Map</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Internal Org Intel</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {stakeholderMap.map(person => (
                                            <div key={person.id} className="p-6 bg-[#f8fafc]/50 border border-border/30 rounded-3xl flex items-center justify-between group hover:border-indigo-500/30 transition-all shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-2xl ${person.relationship === 'Positive' ? 'bg-emerald-100 text-emerald-600' :
                                                        person.relationship === 'Negative' ? 'bg-red-100 text-red-600' : 'bg-secondary/40 text-subtext'
                                                        }`}>
                                                        <User className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-maintext">{person.name}</p>
                                                        <p className="text-[10px] font-bold text-subtext uppercase">{person.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-indigo-600 uppercase">Influence</p>
                                                        <p className="text-xs font-black text-maintext">{person.influence}%</p>
                                                    </div>
                                                    <div className="w-1.5 h-10 bg-secondary/30 rounded-full overflow-hidden">
                                                        <div className="w-full bg-indigo-500" style={{ height: `${person.influence}%`, marginTop: `${100 - person.influence}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Card 2: Real-Time Signal Monitor */}
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-blue-500/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-500 text-white rounded-3xl shadow-lg shadow-indigo-200">
                                                <Activity className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-maintext">Signals</h3>
                                                <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Real-Time Monitor</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full border border-red-100">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Live Feed</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <AnimatePresence mode="popLayout">
                                            {liveSignals.map((signal) => (
                                                <motion.div
                                                    key={signal.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="p-4 bg-[#f8fafc]/50 border border-border/20 rounded-3xl space-y-2 relative overflow-hidden group"
                                                >
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-50" />
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${signal.intensity === 'High' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
                                                            }`}>
                                                            {signal.type}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-subtext">{signal.time}</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-maintext leading-relaxed">{signal.message}</p>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-subtext uppercase">
                                                        <Globe className="w-3 h-3" />
                                                        Source: {signal.source}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    <div className="pt-4 border-t border-border/20">
                                        <p className="text-[10px] text-subtext italic text-center">AI is currently scanning LinkedIn & CRM for new buying signals...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {salesMode === 'Value' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Left: Calculator */}
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-blue-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-3xl">
                                            <Calculator className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">ROI Config</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Savings Logic</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Current Cost (₹)</label>
                                            <input
                                                type="number"
                                                value={roiCalc.currentCost}
                                                onChange={(e) => setRoiCalc({ ...roiCalc, currentCost: parseInt(e.target.value) })}
                                                className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm font-black text-maintext focus:outline-none focus:border-emerald-500/30 transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Efficiency Gain (%)</label>
                                            <input
                                                type="number"
                                                value={roiCalc.expectedEfficiency}
                                                onChange={(e) => setRoiCalc({ ...roiCalc, expectedEfficiency: parseInt(e.target.value) })}
                                                className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm font-black text-maintext focus:outline-none focus:border-emerald-500/30 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Result */}
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[40px] p-10 text-white shadow-xl shadow-emerald-500/20 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="p-4 bg-white/20 rounded-full backdrop-blur-md">
                                        <Zap className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Predicted Annual Savings</p>
                                        <h2 className="text-5xl font-black mt-2">₹{(roiCalc.currentCost * roiCalc.expectedEfficiency / 100).toLocaleString()}</h2>
                                    </div>
                                    <div className="pt-6 border-t border-white/20 w-full">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Payback Period</p>
                                        <p className="text-xl font-black">{roiCalc.paybackPeriod} Months</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'AIWRITE':
                return (
                    <>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Content Type</label>
                            <CustomSelect
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value)}
                                options={['Blog Post', 'Landing Page', 'Ad Copy', 'Email Campaign']}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Objective</label>
                            <CustomSelect
                                value={objective}
                                onChange={(e) => setObjective(e.target.value)}
                                options={['Brand Awareness', 'Lead Generation', 'SEO Ranking', 'Direct Sale']}
                                className="w-full"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Tone</label>
                                <CustomSelect
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    options={['Professional', 'Casual', 'Bold', 'Friendly']}
                                    className="w-full"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Length</label>
                                <CustomSelect
                                    value={writingLength}
                                    onChange={(e) => setWritingLength(e.target.value)}
                                    options={['Short', 'Medium', 'Long']}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="col-span-full space-y-1.5">
                            <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Audience</label>
                            <input type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Target Audience" className="w-full bg-secondary/50 border border-border rounded-2xl px-3 py-2 text-sm text-maintext focus:outline-none focus:border-primary/50" />
                        </div>
                        <div className="col-span-full space-y-1.5">
                            <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Keyword & Context</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" value={seoKeyword} onChange={(e) => setSeoKeyword(e.target.value)} placeholder="SEO Keyword..." className="w-full bg-secondary/50 border border-border rounded-2xl px-3 py-2 text-sm text-maintext" />
                                <input type="text" value={brandPersonality} onChange={(e) => setBrandPersonality(e.target.value)} placeholder="Brand Personality..." className="w-full bg-secondary/50 border border-border rounded-2xl px-3 py-2 text-sm text-maintext" />
                            </div>
                            <textarea value={contentContext} onChange={(e) => setContentContext(e.target.value)} placeholder="Provide context..." className="w-full bg-secondary/50 border border-border rounded-2xl px-3 py-2 text-[11px] text-maintext min-h-[60px]" />
                        </div>
                        <div className="flex gap-4 pt-2">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={isSeoMode} onChange={(e) => setIsSeoMode(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                                <label className="text-[10px] font-bold text-subtext uppercase">SEO Mode</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={isConversionMode} onChange={(e) => setIsConversionMode(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                                <label className="text-[10px] font-bold text-subtext uppercase">Conversion</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={isRepurposeMode} onChange={(e) => setIsRepurposeMode(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                                <label className="text-[10px] font-bold text-subtext uppercase">Repurpose</label>
                            </div>
                        </div>
                    </>
                );
            case 'AIBIZ':
                return (
                    <div className="col-span-full space-y-10">
                        {/* Centered Tab Bar for AIBIZ */}
                        <div className="flex justify-center border-b border-border/20 pb-4">
                            <div className="flex gap-10">
                                {[
                                    { id: 'Market', label: 'Market' },
                                    { id: 'Strategy', label: 'Strategy' },
                                    { id: 'Financials', label: 'Financials' }
                                ].map((modeOption) => (
                                    <button
                                        key={modeOption.id}
                                        onClick={() => setAibizMode(modeOption.id)}
                                        className={`relative py-2 text-sm font-bold transition-all duration-300 ${aibizMode === modeOption.id
                                            ? 'text-red-500'
                                            : 'text-subtext hover:text-maintext'
                                            }`}
                                    >
                                        {modeOption.label}
                                        {aibizMode === modeOption.id && (
                                            <motion.div
                                                layoutId="activeTabBiz"
                                                className="absolute -bottom-4 left-0 right-0 h-1 bg-red-500 rounded-t-full"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {aibizMode === 'Market' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-6 shadow-xl shadow-red-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-50 text-red-500 rounded-3xl">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Landscape</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Industry & Type</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <CustomSelect
                                                value={industry}
                                                onChange={(e) => setIndustry(e.target.value)}
                                                options={['SaaS', 'Ecommerce', 'FinTech', 'Healthcare']}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <CustomSelect
                                                value={marketType}
                                                onChange={(e) => setMarketType(e.target.value)}
                                                options={['B2B', 'B2C', 'Marketplace']}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-6 shadow-xl shadow-red-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-3xl">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Company</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Stage & Profile</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <CustomSelect
                                                value={businessStage}
                                                onChange={(e) => setBusinessStage(e.target.value)}
                                                options={['Idea Stage', 'Early Startup', 'Growth Stage', 'Scaling']}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Business Description</label>
                                            <textarea value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} placeholder="Describe your business model..." className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-indigo-500/30 transition-all shadow-inner resize-none h-24" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {aibizMode === 'Strategy' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-red-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-50 text-amber-500 rounded-3xl">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Blueprint</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Growth Vectors</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <CustomSelect
                                                options={['Market Entry', 'Product Expansion', 'Cost Leadership', 'Differentiation']}
                                                placeholder="Select Focus"
                                            />
                                        </div>
                                        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 italic text-[10px] text-amber-800">
                                            "Strategy is about making choices, trade-offs; it's about deliberately choosing to be different." - Michael Porter
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-red-500/5 relative">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-500 text-white rounded-3xl shadow-lg">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Scale Plan</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">90-Day Roadmap</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { phase: 'Phase 1', task: 'Market Validation', color: 'bg-red-500' },
                                            { phase: 'Phase 2', task: 'Core Infrastructure', color: 'bg-red-400' },
                                            { phase: 'Phase 3', task: 'Aggressive Acquisition', color: 'bg-red-300' }
                                        ].map((p, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 bg-white/50 border border-border/20 rounded-3xl">
                                                <div className={`w-2 h-10 ${p.color} rounded-full`} />
                                                <div>
                                                    <p className="text-[9px] font-black text-red-600 uppercase">{p.phase}</p>
                                                    <p className="text-xs font-bold text-maintext">{p.task}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {aibizMode === 'Financials' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-6 shadow-xl shadow-red-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-3xl">
                                            <IndianRupee className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Revenue</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Model & Pricing</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] text-subtext uppercase pl-1">Target Annual Revenue (₹)</label>
                                            <input type="number" placeholder="0.00" className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-emerald-500/30 transition-all shadow-sm" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] text-subtext uppercase pl-1">Our Price (₹)</label>
                                                <input type="number" value={yourPrice} onChange={(e) => setYourPrice(e.target.value)} placeholder="0.00" className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-emerald-500/30 transition-all shadow-sm" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] text-subtext uppercase pl-1">Comp. Price (₹)</label>
                                                <input type="number" value={competitorPrice} onChange={(e) => setCompetitorPrice(e.target.value)} placeholder="0.00" className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-emerald-500/30 transition-all shadow-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[40px] p-10 text-white shadow-xl shadow-indigo-500/20 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="p-4 bg-white/20 rounded-full backdrop-blur-md">
                                        <TrendingUp className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Market Valuation Estimate</p>
                                        <h2 className="text-4xl font-black mt-2">Coming Soon</h2>
                                        <p className="text-[10px] font-bold mt-2 opacity-70 italic text-white/60">AI is currently analyzing sectoral data...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'AIHIRE':
                return (
                    <div className="col-span-full space-y-10">
                        <div className="flex justify-center border-b border-border/20 pb-4">
                            <div className="flex gap-10">
                                {[
                                    { id: 'Strategy', label: 'Strategy' },
                                    { id: 'Evaluation', label: 'Evaluation' },
                                    { id: 'Offer', label: 'Offer' },
                                    { id: 'Planning', label: 'Planning' },
                                    { id: 'Analytics', label: 'Analytics' }
                                ].map((modeOption) => (
                                    <button
                                        key={modeOption.id}
                                        onClick={() => setHiringMode(modeOption.id)}
                                        className={`relative py-2 text-sm font-bold transition-all duration-300 ${hiringMode === modeOption.id
                                            ? 'text-emerald-500'
                                            : 'text-subtext hover:text-maintext'
                                            }`}
                                    >
                                        {modeOption.label}
                                        {hiringMode === modeOption.id && (
                                            <motion.div
                                                layoutId="activeTabHire"
                                                className="absolute -bottom-4 left-0 right-0 h-1 bg-emerald-500 rounded-t-full"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {hiringMode === 'Strategy' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-emerald-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                            <GitGraph className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Strategy</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Sourcing & Risk</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Risk Tolerance</label>
                                            <CustomSelect value={hireRiskTolerance} onChange={(e) => setHireRiskTolerance(e.target.value)} options={['Conservative', 'Medium', 'Aggressive']} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Sourcing Channel</label>
                                            <CustomSelect value={hireSourcingChannels} onChange={(e) => setHireSourcingChannels(e.target.value)} options={['Direct Sourcing', 'Referrals', 'Agencies', 'Inbound only']} />
                                        </div>
                                        <div className="col-span-full space-y-2">
                                            <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Additional Strategy Notes</label>
                                            <textarea
                                                value={hireExtraNotes}
                                                onChange={(e) => setHireExtraNotes(e.target.value)}
                                                placeholder="e.g. Must have experience with scale, Python/Go expert..."
                                                className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[32px] px-6 py-5 text-sm text-maintext focus:outline-none focus:border-blue-500/30 transition-all font-medium h-32 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-6 shadow-xl shadow-emerald-500/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                                <Target className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-maintext">Role Profile</h3>
                                                <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Detail & Scope</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Target Role</label>
                                                <input type="text" value={hireRole} onChange={(e) => setHireRole(e.target.value)} placeholder="e.g. Senior Backend" className="w-full bg-secondary/50 border border-border rounded-2xl px-4 py-3 text-sm text-maintext" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Department</label>
                                                <CustomSelect value={hireDepartment} onChange={(e) => setHireDepartment(e.target.value)} options={['Engineering', 'Product', 'Sales', 'Design', 'Marketing']} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[40px] p-8 text-white shadow-xl shadow-emerald-500/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Budget Impact</p>
                                            <Zap className="w-5 h-5 opacity-80" />
                                        </div>
                                        <h2 className="text-4xl font-black">₹{hireBudget.toLocaleString()}</h2>
                                        <p className="text-[10px] font-bold mt-2 opacity-70">Projected annual cost for this hire</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {hiringMode === 'Evaluation' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-6 shadow-xl shadow-emerald-500/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-maintext uppercase">Candidates</h3>
                                                <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Resumes & Profiles</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => hireFileInputRef.current?.click()}
                                            className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors flex items-center gap-2"
                                        >
                                            <UploadCloud className="w-4 h-4" /> Upload
                                        </button>
                                        <input type="file" ref={hireFileInputRef} className="hidden" multiple onChange={(e) => handleResumeFiles(e.target.files)} />
                                    </div>

                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setHireUploadDragging(true); }}
                                        onDragLeave={() => setHireUploadDragging(false)}
                                        onDrop={(e) => { e.preventDefault(); setHireUploadDragging(false); handleResumeFiles(e.dataTransfer.files); }}
                                        className={`relative border-2 border-dashed rounded-[32px] p-6 transition-all ${hireUploadDragging ? 'border-emerald-500 bg-emerald-50/50' : 'border-border/40 bg-[#f8fafc]/30'}`}
                                    >
                                        <textarea
                                            value={hireCandidateProfiles}
                                            onChange={(e) => setHireCandidateProfiles(e.target.value)}
                                            placeholder="Drop resumes here or paste profiles..."
                                            className="w-full bg-transparent border-none focus:outline-none text-[13px] text-maintext font-medium h-48 resize-none"
                                        />
                                        {hireUploadedFiles.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {hireUploadedFiles.map(f => (
                                                    <div key={f} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border/40 rounded-full text-[10px] font-bold text-maintext">
                                                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                                                        {f}
                                                        <button onClick={() => {
                                                            setHireUploadedFiles(prev => prev.filter(x => x !== f));
                                                            setHireFileAttachments(prev => prev.filter(x => x.name !== f));
                                                        }} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-6 shadow-xl shadow-emerald-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext uppercase">Bias & Quality</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">JD Scrutiny</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Job Description</label>
                                            <textarea
                                                value={hireJobDescription}
                                                onChange={(e) => setHireJobDescription(e.target.value)}
                                                placeholder="Paste JD for bias scan..."
                                                className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[32px] px-5 py-4 text-[13px] text-maintext focus:outline-none focus:border-pink-500/30 h-48 resize-none shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Scorecard Criteria</label>
                                            <textarea
                                                value={hireScorecardCriteria}
                                                onChange={(e) => setHireScorecardCriteria(e.target.value)}
                                                placeholder="e.g. Technical Skills, Culture Fit, Communication..."
                                                className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[24px] px-5 py-3 text-[13px] text-maintext focus:outline-none focus:border-pink-500/30 h-20 resize-none shadow-inner"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-5 bg-secondary/30 rounded-3xl border border-border/20">
                                            <div className="flex items-center gap-3">
                                                <Bot className="w-6 h-6 text-primary" />
                                                <span className="text-xs font-bold text-maintext uppercase tracking-widest">Bias Detection</span>
                                            </div>
                                            <button
                                                onClick={() => setHireBiasCheck(!hireBiasCheck)}
                                                className={`w-14 h-7 rounded-full transition-all flex items-center px-1 ${hireBiasCheck ? 'bg-emerald-500' : 'bg-subtext/20'}`}
                                            >
                                                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${hireBiasCheck ? 'translate-x-7' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {hiringMode === 'Offer' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-emerald-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                                            <IndianRupee className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Compensation</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Package Design</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-subtext uppercase tracking-widest">Base Salary (₹)</label>
                                            <input type="number" value={hireOfferSalary} onChange={(e) => setHireOfferSalary(e.target.value)} className="w-full bg-secondary/30 border border-border rounded-2xl px-5 py-4 text-sm font-black text-maintext" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-subtext uppercase tracking-widest">Equity (%)</label>
                                            <input type="number" value={hireEquityPercent} onChange={(e) => setHireEquityPercent(e.target.value)} className="w-full bg-secondary/30 border border-border rounded-2xl px-5 py-4 text-sm font-black text-maintext" />
                                        </div>
                                        <div className="col-span-full space-y-2">
                                            <label className="text-[10px] font-bold text-subtext uppercase tracking-widest">Perks & Benefits</label>
                                            <textarea value={hireOfferPerks} onChange={(e) => setHireOfferPerks(e.target.value)} placeholder="e.g. Unlimited PTO, Health, Remote setup..." className="w-full bg-secondary/30 border border-border rounded-2xl px-5 py-4 text-sm h-32 resize-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-6 shadow-xl shadow-emerald-500/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                                <Activity className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-maintext">Market Bench</h3>
                                                <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Counter-Offer Context</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-subtext uppercase tracking-widest">Comp. Salary (₹)</label>
                                                <input type="number" value={hireCompetitorSalary} onChange={(e) => setHireCompetitorSalary(e.target.value)} className="w-full bg-secondary/30 border border-border rounded-2xl px-5 py-4 text-sm font-black text-maintext" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-subtext uppercase tracking-widest">Candidate Leverage</label>
                                                <CustomSelect value={hireCandidateLeverage} onChange={(e) => setHireCandidateLeverage(e.target.value)} options={['Low', 'Medium', 'High', 'Multiple Offers']} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(hiringMode === 'Planning' || hiringMode === 'Analytics') && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-8 shadow-xl shadow-emerald-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">{hiringMode === 'Planning' ? 'Org Planning' : 'Talent Analytics'}</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Scale & Performance</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        {hiringMode === 'Planning' ? (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-widest">Org Structure</label>
                                                    <CustomSelect value={hireOrgStructure} onChange={(e) => setHireOrgStructure(e.target.value)} options={['Flat', 'Matrix', 'Hierarchical']} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-widest">Core Values</label>
                                                    <textarea value={hireCulturalValues} onChange={(e) => setHireCulturalValues(e.target.value)} className="w-full bg-secondary/30 border border-border rounded-2xl px-5 py-4 text-sm h-32 resize-none" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-10 border-2 border-dashed border-emerald-500/20 rounded-[40px] text-center space-y-4">
                                                <div className="p-4 bg-emerald-50 text-emerald-500 inline-block rounded-full">
                                                    <BarChart3 className="w-8 h-8" />
                                                </div>
                                                <p className="text-sm font-bold text-maintext">Analysis request details go below</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-6 shadow-xl shadow-emerald-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-maintext">Insights</h3>
                                            <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">AI Requirements</p>
                                        </div>
                                    </div>
                                    <textarea
                                        value={hireExtraNotes}
                                        onChange={(e) => setHireExtraNotes(e.target.value)}
                                        placeholder={hiringMode === 'Planning' ? "Describe your scaling goals for next 12 months..." : "What talent metrics do you want to analyze?"}
                                        className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[32px] px-5 py-4 text-sm h-64 resize-none shadow-inner"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );


            case 'AIDESK':
                return (
                    <>
                        <div className="space-y-1.5 col-span-full">
                            <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Ticket Category</label>
                            <CustomSelect
                                value={ticketCategory}
                                onChange={(e) => setTicketCategory(e.target.value)}
                                options={['Technical', 'Billing', 'General']}
                            />
                        </div>
                        <div className="space-y-1.5 col-span-full">
                            <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Urgency</label>
                            <div className="flex gap-2">
                                {['Low', 'Medium', 'High'].map(level => (
                                    <button key={level} type="button" onClick={() => setUrgency(level)} className={`flex-1 py-2 text-[10px] font-bold rounded-2xl border transition-all ${urgency === level ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/50 border-border text-subtext'}`}>{level}</button>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-full space-y-1.5">
                            <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Audit Logs / Context</label>
                            <textarea value={auditLogs} onChange={(e) => setAuditLogs(e.target.value)} placeholder="Paste any error logs or customer data..." className="w-full bg-secondary/50 border border-border rounded-2xl px-3 py-2 text-[11px] text-maintext min-h-[60px]" />
                        </div>
                    </>
                );
            default: return <div className="text-xs text-subtext">Parameters loading...</div>;
        }
    };

    const renderAgentActions = () => {
        return (
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => handleAction(null, "Run full analysis.")}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary border border-primary/20 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all"
                >
                    <BarChart3 className="w-3.5 h-3.5" /> Quick Insights
                </button>
                {activeAgent.id === 'AISALES' && (
                    <button
                        type="button"
                        onClick={() => handleAction(null, "Predict win rate and suggest improvements.")}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all"
                    >
                        <Zap className="w-3.5 h-3.5" /> Predict Win Rate
                    </button>
                )}

                {activeAgent.id === 'AIWRITE' && (
                    <button
                        type="button"
                        onClick={() => handleAction(null, "Run SEO audit and content optimization.")}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 border border-pink-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all"
                    >
                        <FilePieChart className="w-3.5 h-3.5" /> SEO Analysis
                    </button>
                )}
                {activeAgent.id === 'AIBIZ' && (
                    <button
                        type="button"
                        onClick={() => handleAction(null, "Perform deep market SWOT analysis.")}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all"
                    >
                        <BarChart3 className="w-3.5 h-3.5" /> Market SWOT
                    </button>
                )}
                {activeAgent.id === 'AIHIRE' && (
                    <div className="flex gap-2">
                        {hiringMode === 'Strategy' && (
                            <>
                                <button type="button" onClick={() => handleAction(null, "Run a comprehensive Readiness Score and Gap Analysis.")} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all">
                                    <Target className="w-3.5 h-3.5" /> Readiness Score
                                </button>
                                <button type="button" onClick={() => handleAction(null, "Conduct a detailed Risk Audit for this role.")} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Risk Audit
                                </button>
                            </>
                        )}
                        {hiringMode === 'Evaluation' && (
                            <>
                                <button type="button" onClick={() => handleAction(null, "Evaluate and rank these candidates against the Scorecard.")} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all">
                                    <Users className="w-3.5 h-3.5" /> AI Scoring
                                </button>
                                <button type="button" onClick={() => handleAction(null, "Run a Bias and Inclusion check on the JD and profiles.")} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all">
                                    <Bot className="w-3.5 h-3.5" /> Bias Scan
                                </button>
                                <button type="button" onClick={() => handleAction(null, "Generate a custom Interview Framework for this role.")} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all">
                                    <MessageSquare className="w-3.5 h-3.5" /> Interview Guide
                                </button>
                            </>
                        )}
                        {hiringMode === 'Offer' && (
                            <>
                                <button type="button" onClick={() => handleAction(null, "Predict acceptance probability and suggest package optimizations.")} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all">
                                    <TrendingUp className="w-3.5 h-3.5" /> Acceptance Odds
                                </button>
                                <button type="button" onClick={() => handleAction(null, "Build a direct negotiation strategy for this candidate.")} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all">
                                    <Target className="w-3.5 h-3.5" /> Closing Script
                                </button>
                            </>
                        )}
                        {hiringMode === 'Planning' && (
                            <>
                                <button type="button" onClick={() => handleAction(null, "Run a Scalability and Capacity Audit.")} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all">
                                    <Activity className="w-3.5 h-3.5" /> Capacity Plan
                                </button>
                            </>
                        )}
                        {hiringMode === 'Analytics' && (
                            <>
                                <button type="button" onClick={() => handleAction(null, "Generate a Funnel Performance and Cost-per-hire report.")} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all">
                                    <BarChart3 className="w-3.5 h-3.5" /> Funnel Audit
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-full bg-background overflow-hidden font-sans">
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.aside initial={{ width: 0 }} animate={{ width: 260 }} exit={{ width: 0 }} className="bg-secondary/40 border-r border-border flex flex-col h-full shrink-0">
                        <div className="p-4 border-b border-border flex items-center justify-between h-16">
                            <h3 className="text-subtext text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><History className="w-3.5 h-3.5" /> History</h3>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/50 rounded-lg text-subtext"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-3">
                            <button onClick={handleNewChat} className="w-full h-10 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                                <Plus className="w-4 h-4" /> New Chat
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
                            {(() => {
                                const grouped = groupSessionsByDate(sessions);
                                return Object.entries(grouped).map(([label, items]) => {
                                    if (items.length === 0) return null;
                                    return (
                                        <div key={label} className="space-y-1.5">
                                            <h4 className="px-3 text-[9px] font-black text-subtext/60 uppercase tracking-[0.2em]">{label}</h4>
                                            <div className="space-y-0.5">
                                                {items.map(session => (
                                                    <div
                                                        key={session.sessionId}
                                                        onClick={() => navigate(`/dashboard/workspace/${session.sessionId}`)}
                                                        className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${currentSessionId === session.sessionId
                                                            ? 'bg-white shadow-sm border border-border/50'
                                                            : 'hover:bg-white/40 border border-transparent'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${currentSessionId === session.sessionId ? 'text-primary' : 'text-subtext/40'}`} />
                                                            <span className={`text-[11px] font-bold truncate w-36 ${currentSessionId === session.sessionId ? 'text-maintext' : 'text-subtext'}`}>
                                                                {session.title || 'New Chat'}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleDeleteSession(e, session.sessionId)}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-subtext/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <main className={`flex-1 flex flex-col relative overflow-hidden transition-all duration-700 ${activeAgent?.id === 'AISALES'
                ? 'bg-gradient-to-br from-blue-50/80 via-white to-sky-50/80'
                : activeAgent?.id === 'AIWRITE'
                    ? 'bg-gradient-to-br from-pink-50/80 via-white to-rose-50/80'
                    : activeAgent?.id === 'AIBIZ'
                        ? 'bg-gradient-to-br from-red-50/80 via-white to-orange-50/80'
                        : 'bg-secondary/30'
                }`}>
                <header className="h-16 border-b border-border bg-white/50 backdrop-blur-xl flex items-center justify-between px-6 z-20">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-2xl bg-primary/10 text-primary">
                            <activeAgent.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-maintext text-sm">{activeAgent.name}</h2>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">System Operational</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">{user.name.charAt(0)}</div></div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-10">
                        <div className="bg-card border border-border rounded-2xl shadow-sm relative">
                            <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between"><div className="flex items-center gap-2"><Settings className="w-3.5 h-3.5 text-maintext/50" /><h3 className="text-[10px] font-black text-maintext uppercase tracking-widest">Parameters</h3></div></div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{renderAgentInputs()}</div>
                                {activeAgent?.id !== 'AIHIRE' && (
                                    <form onSubmit={handleAction} className="space-y-4">
                                        <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Describe your objective..." className="w-full bg-secondary/20 border border-border focus:border-primary/50 focus:bg-white transition-all rounded-2xl p-4 min-h-[120px] text-sm text-maintext outline-none" />
                                        <div className="flex items-center justify-between border-t border-border pt-4"><div className="flex gap-2">{renderAgentActions()}</div><button type="submit" disabled={isProcessing || !inputValue.trim()} className="px-6 py-2 bg-primary text-white rounded-lg font-bold shadow-md hover:bg-primary/90 transition-all text-xs uppercase tracking-widest">{isProcessing ? 'Processing...' : 'Execute'}</button></div>
                                    </form>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            {messages.length > 0 && <div className="flex items-center gap-4"><div className="h-[1px] flex-1 bg-border/50"></div><span className="text-[10px] font-black text-subtext uppercase tracking-[0.3em]">Analysis</span><div className="h-[1px] flex-1 bg-border/50"></div></div>}
                            <AnimatePresence>
                                {[...messages].reverse().map((msg) => {
                                    if (msg.role === 'user') return null;
                                    const result = renderMessageAsCards(msg);
                                    if (!result) return null;
                                    return (
                                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {result.cards.map((card, idx) => {
                                                    const isWide = result.cards.length === 1 || (card.content && card.content.length > 500) || card.type === 'charts';
                                                    return (
                                                        <div key={idx} className={`bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow ${isWide ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                                                            <div className="flex items-center justify-between mb-4"><div className="p-2 rounded-lg bg-secondary"><card.icon className="w-4 h-4 text-primary" /></div></div>
                                                            <h4 className="font-bold text-maintext text-xs uppercase tracking-widest mb-3 opacity-70">{card.title}</h4>
                                                            <div className="flex-1">{renderCardContent(card)}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>



            <AnimatePresence>
                {showResultModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 ${isSidebarOpen ? 'pl-[260px]' : ''}`} onClick={() => setShowResultModal(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white flex flex-col h-[calc(100%-40px)] w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                            <div className="p-6 border-b border-border bg-white flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-3xl ${activeAgent?.id === 'AIWRITE' ? 'bg-pink-500/10' : activeAgent?.id === 'AIBIZ' ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                                        {activeAgent?.id === 'AIWRITE' ? <FileText className="w-6 h-6 text-pink-600" /> : activeAgent?.id === 'AIBIZ' ? <BarChart3 className="w-6 h-6 text-red-600" /> : <Target className="w-6 h-6 text-primary" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-maintext tracking-tight uppercase">
                                            {activeAgent?.id === 'AIWRITE' ? 'Content Intelligence' : activeAgent?.id === 'AIBIZ' ? 'Business Intelligence' : 'Deep Strategy Analysis'}
                                        </h3>
                                        <p className="text-[10px] text-subtext font-bold uppercase tracking-widest opacity-70">AI Business Intelligence Engine</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowResultModal(false)} className="p-2 hover:bg-secondary rounded-full transition-colors"><X className="w-6 h-6 text-subtext" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-secondary/10 custom-scrollbar">
                                <div className="space-y-6">

                                    {(() => {
                                        const lastMsg = messages[messages.length - 1];
                                        const result = renderMessageAsCards(lastMsg);
                                        if (!result) return <div className="text-center text-sm text-subtext">No content available.</div>;
                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {result.cards.map((card, idx) => {
                                                    const isWide = result.cards.length === 1 || (card.content && card.content.length > 300) || card.type === 'charts';
                                                    return (
                                                        <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col ${isWide ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                                                            <div className="flex items-center justify-between mb-4"><div className="p-2 rounded-lg bg-secondary"><card.icon className="w-4 h-4 text-primary" /></div></div>
                                                            <h4 className="font-bold text-maintext text-xs uppercase tracking-widest mb-3 opacity-70">{card.title}</h4>
                                                            <div className="flex-1">{renderCardContent(card)}</div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="p-4 border-t border-border bg-white flex justify-end gap-3 shrink-0">
                                <button
                                    onClick={() => setShowResultModal(false)}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeAgent?.id === 'AIHIRE'
                                        ? 'bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-500'
                                        : 'text-subtext hover:text-maintext'
                                        }`}
                                >
                                    Close View
                                </button>
                                {activeAgent?.id !== 'AIHIRE' && (
                                    <>
                                        <button onClick={() => {
                                            const lastMsg = messages[messages.length - 1];
                                            if (lastMsg) {
                                                const blob = new Blob([lastMsg.content], { type: 'text/plain' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `AIVA_${activeAgent?.id}_Report_${new Date().toISOString().slice(0, 10)}.txt`;
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            }
                                        }} className="px-6 py-2 bg-secondary text-maintext border border-border rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-secondary/80 flex items-center gap-2">
                                            <Download className="w-4 h-4" /> Download Report
                                        </button>
                                        <button onClick={() => setShowResultModal(false)} className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-md">
                                            Continue in Chat
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AISAWorkSpace;
