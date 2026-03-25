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
    Heart,
    Utensils,
    Scale,
    Stethoscope,
    Dna,
    Salad,
    Minus,
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
    Download,
    BrainCircuit,
    GraduationCap,
    Rocket,
    UserCheck,
    Instagram,
    Facebook,
    PenTool,
    Sparkles,
    Twitter,
    Share2
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { getUserData } from '../userStore/userData';
import { generateChatResponse, generateAIWriteResponse, generateAIHealthSymptomCheck, generateAIHealthWellnessPlan, generateAIHealthMentalSupport, generateAIHealthTreatmentGuide, generateAIHealthReportAnalysis, generateAIHealthAutomation, generateAIHealthLogData, analyzeAIBizCRM, scoreAIBizLead, segmentAIBizCustomers, generateAIBizCampaign } from '../services/aisaService';
import { chatStorageService } from '../services/chatStorageService';
import axios from 'axios';
import { apis } from '../types';
import { useNavigate, useParams } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

// Import New Components
import CustomSelect from '../Components/AISAWorkSpace/CustomSelect.jsx';
import AISALESInputs from '../agents/AISALES/AiSales.jsx';
import AIWRITEInputs from '../agents/AIWRITE/AIWRITEInputs.jsx';
import AIBIZInputs from '../agents/AIBIZ/AIBIZInputs.jsx';
import AIHIREInputs from '../agents/AIHIRE/AiHire.jsx';
import AIHEALTHInputs from '../agents/AIHEALTH/AIHEALTHInputs.jsx';
import AIDESKInputs from '../agents/AIDESK/AIDESKInputs.jsx';
import AgentActions from '../Components/AISAWorkSpace/AgentActions.jsx';
import { buildAISalesPrompt } from '../agents/AISALES/promptBuilder.js';
import { AGENTS, DEAL_STAGES } from '../Components/AISAWorkSpace/constants.js';
import { PERSONAS } from '../agents/AISALES/constants.js';
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
const STAKEHOLDERS = [
    { role: 'CEO', priority: 'High' },
    { role: 'CTO', priority: 'High' },
    { role: 'CFO', priority: 'High' },
    { role: 'VP Sales', priority: 'Medium' },
    { role: 'VP Marketing', priority: 'Medium' }
];

const groupSessionsByDate = (sessions) => {
    if (!sessions || !Array.isArray(sessions)) return {};
    const groups = {
        'Today': [],
        'Yesterday': [],
        'Last 7 Days': [],
        'Older': []
    };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    sessions.forEach(s => {
        const date = new Date(s.timestamp || s.createdAt || Date.now());
        if (isNaN(date.getTime())) {
            groups['Older'].push(s);
            return;
        }
        if (date >= today) groups['Today'].push(s);
        else if (date >= yesterday) groups['Yesterday'].push(s);
        else if (date >= lastWeek) groups['Last 7 Days'].push(s);
        else groups['Older'].push(s);
    });
    return groups;
};

const AISAWorkSpace = () => {
    const navigate = useNavigate();
    const { agentId, sessionId } = useParams();
    const { language } = useLanguage();
    // 1. Initialize Active Agent directly from URL to avoid initial state mismatch
    const getInitialAgent = () => {
        if (agentId) {
            const found = AGENTS.find(a => a.id === agentId.toUpperCase());
            if (found) return found;
        }
        return AGENTS[0]; // Default to AISALES if nothing else
    };
    const [activeAgent, setActiveAgent] = useState(getInitialAgent);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(sessionId || 'new');
    const [sessions, setSessions] = useState([]);
    const [showResultModal, setShowResultModal] = useState(false);
    useEffect(() => {
        if (agentId) {
            const found = AGENTS.find(a => a.id === agentId.toUpperCase());
            if (found && found.id !== activeAgent?.id) {
                setActiveAgent(found);
            }
        }
        if (sessionId !== currentSessionId) {
            setCurrentSessionId(sessionId || 'new');
        }
    }, [agentId, sessionId, currentSessionId, activeAgent?.id]);
    // AIHEALTH Specialized States
    const [healthMode, setHealthMode] = useState('WELLNESS PLANNER');
    const HEALTH_MODES = [
        'SYMPTOM CHECKER',
        'REPORT ANALYZER',
        'WELLNESS PLANNER',
        'MENTAL SUPPORT',
        'TREATMENT ADVISOR',
        'AUTOMATION'
    ];
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

    useEffect(() => {
        // Real-Time Signal Simulation Engine
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
    const [writeSegment, setWriteSegment] = useState('students');
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

    // AIWRITE - Student Mode
    const [studentSubject, setStudentSubject] = useState('');
    const [studentTopic, setStudentTopic] = useState('');
    const [studentWordCount, setStudentWordCount] = useState('1000');
    const [studentTone, setStudentTone] = useState('Academic');
    const [isAcademicFormat, setIsAcademicFormat] = useState(true);
    const [studentFeature, setStudentFeature] = useState('assignment_writer');
    // AIWRITE - Agency Mode
    const [agencyClientName, setAgencyClientName] = useState('Client A');
    const [agencyIndustry, setAgencyIndustry] = useState('Tech & AI');
    const [agencyTargetAudience, setAgencyTargetAudience] = useState('Business Owner');
    const [agencySocialGoal, setAgencySocialGoal] = useState('Brand Awareness');
    const [agencyPlatforms, setAgencyPlatforms] = useState(['Instagram']);
    const [agencyMonth, setAgencyMonth] = useState('February');
    const [agencyFrequency, setAgencyFrequency] = useState('3x per week');
    const [agencyTone, setAgencyTone] = useState('Professional');
    const [agencyView, setAgencyView] = useState('planner');
    const [agencyUSP, setAgencyUSP] = useState('');
    const [agencyKeyword, setAgencyKeyword] = useState('');
    const [agencyWordCount, setAgencyWordCount] = useState('1000');
    const [agencyPageDescription, setAgencyPageDescription] = useState('');
    // AIWRITE - Startup Mode
    const [startupName, setStartupName] = useState('');
    const [startupProduct, setStartupProduct] = useState('');
    const [startupProblem, setStartupProblem] = useState('');
    const [startupSolution, setStartupSolution] = useState('');
    const [startupTone, setStartupTone] = useState('Energetic');
    const [startupPlatform, setStartupPlatform] = useState('Google/Facebook Ads');
    const [startupFeature, setStartupFeature] = useState('ad_copy');
    const [startupAudience, setStartupAudience] = useState('Business Owner');
    // AIWRITE - Freelancer Mode
    const [freelancerService, setFreelancerService] = useState('');
    const [freelancerClientType, setFreelancerClientType] = useState('');
    const [freelancerBudget, setFreelancerBudget] = useState('');
    const [freelancerTone, setFreelancerTone] = useState('Professional');
    const [freelancerFeature, setFreelancerFeature] = useState('proposal_generator');
    // AIWRITE - Influencer Mode
    const [influencerNiche, setInfluencerNiche] = useState('Fitness');
    const [influencerMood, setInfluencerMood] = useState('Motivational');
    const [useEmojis, setUseEmojis] = useState(true);
    const [hashtagCount, setHashtagCount] = useState('10');
    const [influencerFeature, setInfluencerFeature] = useState('insta_caption');
    // AIWRITE - Author Mode
    const [authorStoryTopic, setAuthorStoryTopic] = useState('');
    const [authorGenre, setAuthorGenre] = useState('Fiction');
    const [authorTone, setAuthorTone] = useState('Creative');
    const [authorFeature, setAuthorFeature] = useState('manuscript_editor');
    const [authorTheme, setAuthorTheme] = useState('');
    const [authorMood, setAuthorMood] = useState('Mysterious');
    const [authorStyle, setAuthorStyle] = useState('Free Verse');
    const [authorRhyme, setAuthorRhyme] = useState(false);
    const [authorCharacters, setAuthorCharacters] = useState('');
    const [authorScript, setAuthorScript] = useState('');
    const [authorContext, setAuthorContext] = useState('');
    const [authorLength, setAuthorLength] = useState('Medium');
    const [authorLanguage, setAuthorLanguage] = useState('English');
    const [authorFile, setAuthorFile] = useState(null);
    // AIWRITE - Agency Feature
    const [agencyFeature, setAgencyFeature] = useState('daily_ideas');
    // AIWRITE - Automation Mode
    const [automationWorkflows, setAutomationWorkflows] = useState([
        { id: 1, title: 'Monday Assignment Draft', schedule: 'Every Monday', active: true, type: 'draft' },
        { id: 2, title: 'Auto-Write New Topics', schedule: 'On Topic Added', active: false, type: 'auto' }
    ]);
    const [automationDeadlines, setAutomationDeadlines] = useState([
        { id: 1, topic: 'Machine Learning Ethics', date: '2026-03-05', status: 'Pending' }
    ]);
    const [isMultiOutputEnabled, setIsMultiOutputEnabled] = useState(false);

    // AIDESK Specialized States
    const [ticketCategory, setTicketCategory] = useState('Technical');
    const [urgency, setUrgency] = useState('Medium');

    // AIHEALTH Specialized States
    const [healthName, setHealthName] = useState('');
    const [healthAge, setHealthAge] = useState(25);
    const [healthGender, setHealthGender] = useState('Male');
    const [healthWeight, setHealthWeight] = useState(70);
    const [healthHeight, setHealthHeight] = useState(170);
    const [healthGoal, setHealthGoal] = useState('Weight Loss');
    const [healthDietaryType, setHealthDietaryType] = useState('Vegetarian');
    const [healthAllergies, setHealthAllergies] = useState('');
    const [healthCuisine, setHealthCuisine] = useState('');
    const [healthActiveMonth, setHealthActiveMonth] = useState('March 2026');
    const [includeAyurveda, setIncludeAyurveda] = useState(true);

    // AIHEALTH Symptom Intel States
    const [symptoms, setSymptoms] = useState('');
    const [symptomDuration, setSymptomDuration] = useState('1-3 Days');
    const [symptomSeverity, setSymptomSeverity] = useState('Medium');
    const [symptomTreatmentType, setSymptomTreatmentType] = useState('Ayurveda');
    const [symptomResult, setSymptomResult] = useState(null);
    // AIHEALTH Report Analysis States
    const [reportManualValues, setReportManualValues] = useState({
        glucose: '',
        cholesterol: '',
        bp_systolic: '',
        bp_diastolic: '',
        haemoglobin: ''
    });
    const [reportResult, setReportResult] = useState(null);
    const [reportFile, setReportFile] = useState(null);
    // AIHEALTH Wellness Plan States
    const [healthActivityLevel, setHealthActivityLevel] = useState('Moderate');
    const [wellnessPlanResult, setWellnessPlanResult] = useState(null);
    // AIHEALTH Mental Wellness States
    const [healthMood, setHealthMood] = useState('Happy');
    const [mentalNote, setMentalNote] = useState('');
    const [mentalResult, setMentalResult] = useState(null);
    const [moodHistory, setMoodHistory] = useState([
        { date: 'Mon', score: 3 },
        { date: 'Tue', score: 2 },
        { date: 'Wed', score: 4 },
        { date: 'Thu', score: 3 },
        { date: 'Fri', score: 5 },
        { date: 'Sat', score: 4 }
    ]);
    const [wellnessHistory, setWellnessHistory] = useState([
        { date: 'W1', value: 85 },
        { date: 'W2', value: 84.2 },
        { date: 'W3', value: 83.5 },
        { date: 'W4', value: 82.8 }
    ]);
    const [reportHistory, setReportHistory] = useState([
        { date: 'Jan', anomalies: 2 },
        { date: 'Feb', anomalies: 4 },
        { date: 'Mar', anomalies: 1 }
    ]);
    const [symptomHistory, setSymptomHistory] = useState([
        { date: 'Mon', risk: 2 },
        { date: 'Tue', risk: 3 },
        { date: 'Wed', risk: 1 },
        { date: 'Thu', risk: 4 }
    ]);
    const [treatmentHistory, setTreatmentHistory] = useState([
        { date: 'W1', scans: 2 },
        { date: 'W2', scans: 5 },
        { date: 'W3', scans: 3 },
        { date: 'W4', scans: 8 }
    ]);
    // AIHEALTH Treatment Advisor States
    const [medicineName, setMedicineName] = useState('');
    const [treatmentTypeChoice, setTreatmentTypeChoice] = useState('Allopathy');
    const [healthCondition, setHealthCondition] = useState('');
    const [treatmentResult, setTreatmentResult] = useState(null);
    // AIHEALTH Automation States
    const [healthAutomationActive, setHealthAutomationActive] = useState(true);
    const [healthAutomationLogs, setHealthAutomationLogs] = useState([
        { id: 1, type: 'Detection', message: 'Sleep pattern irregularity detected (Avg: 5.5h)', time: '6h ago', severity: 'Medium' },
        { id: 2, type: 'Action', message: 'Generated hydration reminder for 2:00 PM', time: '1h ago', severity: 'Low' },
        { id: 3, type: 'Decision', message: 'Scheduled preventative report analysis based on recent glucose logs', time: 'Just now', severity: 'High' }
    ]);
    const [healthAlerts, setHealthAlerts] = useState([
        { id: 1, title: 'Health Risk Warning', message: 'High sodium intake detected from recent dinner logs.', date: '2026-02-25', status: 'unread' }
    ]);
    const [automationResult, setAutomationResult] = useState(null);
    // AIHEALTH Monitoring States
    const [healthSleepHours, setHealthSleepHours] = useState(0);
    const [healthWaterIntake, setHealthWaterIntake] = useState(0);
    const [healthSteps, setHealthSteps] = useState(0);
    const [healthHeartRate, setHealthHeartRate] = useState(0);
    const [healthStressLevel, setHealthStressLevel] = useState(5);
    const [healthRoutine, setHealthRoutine] = useState(null);
    // AIBIZ Specialized States
    const [industry, setIndustry] = useState('SaaS');
    const [businessStage, setBusinessStage] = useState('Idea Stage');
    const [marketType, setMarketType] = useState('B2B');
    const [businessDescription, setBusinessDescription] = useState('');
    const [aibizMode, setAibizMode] = useState('Dashboard');

    const [aiWriteResult, setAiWriteResult] = useState(null);

    // AIBIZ CRM States (Lifted from AIBIZInputs)
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customers, setCustomers] = useState([
        { id: 1, name: 'CloudScale Inc.', industry: 'Enterprise SaaS', health: 92, status: 'Stable', contact: 'Sarah Chen' },
        { id: 2, name: 'TechFlow Systems', industry: 'FinTech', health: 45, status: 'At Risk', contact: 'Mark Jensen' },
        { id: 3, name: 'Alpha Logistics', industry: 'Logistics', health: 78, status: 'Growth', contact: 'James Wilson' },
    ]);
    const [interactions, setInteractions] = useState([
        { date: '2024-02-20', type: 'Email', subject: 'Support Ticket #829', sentiment: 'Negative', summary: 'Customer complaining about latency in the dashboard.' },
        { date: '2024-02-18', type: 'Call', subject: 'Quarterly Review', sentiment: 'Neutral', summary: 'Discussed scaling tiers but budget is a concern.' },
        { date: '2024-02-15', type: 'Chat', subject: 'Feature Request', sentiment: 'Positive', summary: 'Interested in AI automation for their marketing team.' },
    ]);

    // Lifted AIBIZ Dashboard States
    const [aibizHealthScore, setAibizHealthScore] = useState({ score: 72, status: 'Stable', weakAreas: ['Lead conversion', 'Follow-up delays'] });
    const [aibizGoals, setAibizGoals] = useState([
        { id: 1, label: 'Monthly Revenue', target: 50000, current: 38400, unit: '$' },
        { id: 2, label: 'Lead Target', target: 500, current: 320, unit: '' },
    ]);
    const [aibizRevenueData, setAibizRevenueData] = useState([
        { month: 'Jan', mrr: 12000, churn: 2.1 },
        { month: 'Feb', mrr: 15000, churn: 1.8 },
        { month: 'Mar', mrr: 19000, churn: 1.5 },
        { month: 'Apr', mrr: 24000, churn: 1.2 },
        { month: 'May', mrr: 32000, churn: 0.9 },
        { month: 'Jun', mrr: 45000, churn: 0.7 },
    ]);
    const [aibizSegments, setAibizSegments] = useState([
        { id: 1, name: 'High-Value Repeat Buyers', rfm: '5-5-5', count: 124, behavior: 'Daily Active', persona: 'Power User', color: '#10b981', details: 'Core revenue drivers. High upsell potential for enterprise tiers.' },
        { id: 2, name: 'At-Risk Customers', rfm: '1-2-4', count: 42, behavior: 'Declining', persona: 'Frustrated Veteran', color: '#ef4444', details: 'Decreased login frequency in last 30 days. Needs immediate engagement.' },
        { id: 3, name: 'Enterprise Prospects', rfm: '4-3-1', count: 18, behavior: 'Evaluating', persona: 'Decision Maker', color: '#3b82f6', details: 'Focused on security and scalability features. High monetary potential.' },
        { id: 4, name: 'Cold Leads', rfm: '1-1-1', count: 850, behavior: 'Inactive', persona: 'Window Shopper', color: '#94a3b8', details: 'Low engagement. Suggest long-term nurture sequence.' },
    ]);
    const [aibizLeadMetrics, setAibizLeadMetrics] = useState([
        { id: 1, name: 'Quantum Leap Labs', frequency: 12, opens: 85, visits: 24, industry: 'DeepTech', budget: '$50k+', score: 94, status: 'Hot' },
        { id: 2, name: 'Green Horizon', frequency: 4, opens: 20, visits: 5, industry: 'AgriTech', budget: '$10k', score: 32, status: 'Cold' },
        { id: 3, name: 'FinEdge Solutions', frequency: 8, opens: 60, visits: 12, industry: 'FinTech', budget: '$25k', score: 68, status: 'Warm' },
    ]);


    const [isSidebarOpen, setIsSidebarOpen] = useState(true);


    const user = getUserData() || { name: 'Super User', email: 'user@a-series.ai', plan: 'Business' };

    // Load Sessions History
    useEffect(() => {
        let isMounted = true;
        const loadSessions = async () => {
            if (activeAgent?.id) {
                try {
                    const data = await chatStorageService.getSessions(activeAgent.id);
                    setSessions(data || []);
                } catch (error) {
                    console.error("Failed to load sessions:", error);
                    if (isMounted) setSessions([]);
                }
            }
        };
        loadSessions();
    }, [activeAgent.id, currentSessionId, messages.length]);

    // Clear all previously set alerts/results (Done in useEffect below)



    const handleClearWorkspace = () => {
        setShowClearConfirm(true);
    };

    const executeClearWorkspace = () => {
        setShowClearConfirm(false);
        setMessages([]);
        setCurrentSessionId('new');
        setInputValue('');
        setAiWriteResult(null);
        setSymptomResult(null);
        setReportResult(null);
        setWellnessPlanResult(null);
        setMentalResult(null);
        setTreatmentResult(null);

        // Reset AIHEALTH Inputs
        setHealthName('');
        setHealthAge(25);
        setHealthGender('Male');
        setHealthWeight(70);
        setHealthHeight(170);
        setHealthGoal('Weight Loss');
        setHealthDietaryType('Vegetarian');
        setHealthAllergies('');
        setHealthCuisine('');
        setHealthActiveMonth('March 2026');
        setIncludeAyurveda(true);
        setSymptoms('');
        setSymptomDuration('1-3 Days');
        setSymptomSeverity('Medium');
        setSymptomTreatmentType('Ayurveda');
        setReportManualValues({
            glucose: '',
            cholesterol: '',
            bp_systolic: '',
            bp_diastolic: '',
            haemoglobin: ''
        });
        setReportFile(null);
        setHealthActivityLevel('Moderate');
        setHealthMood('Happy');
        setMentalNote('');
        setMedicineName('');
        setTreatmentTypeChoice('Allopathy');
        setStudentSubject('');
        setStudentTopic('');
        setStudentWordCount('1000');
        setStudentTone('Academic');
        setIsAcademicFormat(true);
        setStudentFeature('assignment_writer');
        setHealthCondition('');
        setHealthAutomationActive(true);
        setHealthAutomationLogs([
            { id: 1, type: 'Detection', message: 'Sleep pattern irregularity detected (Avg: 5.5h)', time: '6h ago', severity: 'Medium' },
            { id: 2, type: 'Action', message: 'Generated hydration reminder for 2:00 PM', time: '1h ago', severity: 'Low' },
            { id: 3, type: 'Decision', message: 'Scheduled preventative report analysis based on recent glucose logs', time: 'Just now', severity: 'High' }
        ]);
        setHealthAlerts([
            { id: 1, title: 'Health Risk Warning', message: 'High sodium intake detected from recent dinner logs.', date: '2026-02-25', status: 'unread' }
        ]);
        setAutomationResult(null);
        setAuthorLanguage('English');
        setAuthorFile(null);

        // Reset AIBIZ States
        setAibizMode('Dashboard');
        setIndustry('SaaS');
        setBusinessStage('Idea Stage');
        setMarketType('B2B');
        setBusinessDescription('');
        setSelectedCustomer(null);
        setAibizHealthScore({ score: 72, status: 'Stable', weakAreas: ['Lead conversion', 'Follow-up delays'] });

        // Reset AIHIRE States
        setHiringMode('Strategy');
        setHireRole('');
        setHireDepartment('Engineering');
        setHireSeniority('Senior');
        setHireLocation('Remote');
        setHireBudget(1500000);
        setHireUrgency('Medium');
        setHireTradeoff(50);
        setHireExtraNotes('');
        setHireCandidateProfiles('');
        setHireJobDescription('');
        setHireScorecardCriteria('Technical Skills, Culture Fit, Communication');
        setHireBiasCheck(true);
        setHireUploadedFiles([]);
        setHireFileAttachments([]);
        setHireOfferSalary('');
        setHireEquityPercent('');
        setHireCompetitorSalary('');
        setHireOfferPerks('');
        setHireCandidateLeverage('Medium');
        setHireOrgStructure('Flat');
        setHireCulturalValues('Speed, Ownership, Transparency');

        navigate(`/dashboard/workspace/${activeAgent.id}/new`);
    };

    const handleDeleteSession = (e, id) => {
        e.stopPropagation();
        setSessionToDelete(id);
        setShowDeleteConfirm(true);
    };

    const executeDeleteSession = async () => {
        if (!sessionToDelete) return;
        await chatStorageService.deleteSession(sessionToDelete);
        setSessions(prev => prev.filter(s => s.sessionId !== sessionToDelete));
        if (currentSessionId === sessionToDelete) {
            navigate(`/dashboard/workspace/${activeAgent.id}/new`);
            setCurrentSessionId('new');
            setMessages([]);
        }
        setShowDeleteConfirm(false);
        setSessionToDelete(null);
    };

    useEffect(() => {
        const initWorkspace = async () => {
            // 1. Clear all previous result states to prevent stale data showing in the new session
            setMessages([]);
            setAiWriteResult(null);
            setSymptomResult(null);
            setReportResult(null);
            setWellnessPlanResult(null);
            setMentalResult(null);
            setTreatmentResult(null);

            if (!sessionId || sessionId === 'new') {
                setCurrentSessionId('new');
                // Ensure agent is synced with the agentId param even if no session
                if (agentId) {
                    const agent = AGENTS.find(a => a.id === agentId.toUpperCase());
                    if (agent) setActiveAgent(agent);
                }
            } else {
                // Load existing session history
                const history = await chatStorageService.getHistory(sessionId);
                setMessages(history || []);
                setCurrentSessionId(sessionId);

                // 2. Sync Agent based on most recent message or URL param
                const lastModelMsg = [...(history || [])].reverse().find(m => m.role === 'model' && m.agentName);
                if (lastModelMsg) {
                    const agent = AGENTS.find(a => a.id === lastModelMsg.agentName);
                    if (agent) setActiveAgent(agent);
                } else if (agentId) {
                    const agent = AGENTS.find(a => a.id === agentId.toUpperCase());
                    if (agent) setActiveAgent(agent);
                }

                // 3. Restore Structured Result State from Metadata (Find last message with data)
                const lastDataMsg = [...(history || [])].reverse().find(m => m.role === 'model' && m.metadata?.parsedData);
                if (lastDataMsg && lastDataMsg.metadata?.parsedData) {
                    const { parsedData, healthMode: hMode, writeSegment: wSeg } = lastDataMsg.metadata;
                    const msgAgent = lastDataMsg.agentName || activeAgent.id;

                    if (msgAgent === 'AIHEALTH' && parsedData) {
                        if (hMode) setHealthMode(hMode);
                        // Populate the correct result slot based on clinical mode stored in metadata
                        if (hMode === 'SYMPTOM CHECKER') setSymptomResult(parsedData);
                        else if (hMode === 'REPORT ANALYZER') setReportResult(parsedData);
                        else if (hMode === 'WELLNESS PLANNER') setWellnessPlanResult(parsedData);
                        else if (hMode === 'MENTAL SUPPORT') setMentalResult(parsedData);
                        else if (hMode === 'TREATMENT ADVISOR') setTreatmentResult(parsedData);
                    } else if (msgAgent === 'AIWRITE' && parsedData) {
                        if (wSeg) setWriteSegment(wSeg);
                        setAiWriteResult(parsedData);
                    }
                }
            }
        };
        initWorkspace();
    }, [sessionId, agentId]); // Trigger on any navigation change

    const handleAction = async (e, optionalPrompt = null) => {
        let actionTrigger = null;
        if (e && typeof e === 'string') {
            actionTrigger = e;
        } else if (e && e.preventDefault) {
            e.preventDefault();
        }

        // 1. Unify Input Construction
        let finalInput = "";
        let isSpecialMode = false;

        const customPrompt = actionTrigger || optionalPrompt;

        if (customPrompt && typeof customPrompt === 'object') {
            // AIWRITE Execute Strategy
            finalInput = `Execute strategy: Generate ${customPrompt.type} for ${customPrompt.segment}.`;
            isSpecialMode = true;
        } else if (customPrompt && typeof customPrompt === 'string' && (customPrompt.startsWith('aihealth_') || customPrompt.startsWith('aibiz_'))) {
            // Specialized agent triggers
            finalInput = `Handle ${customPrompt.replace('aihealth_', '').replace('aibiz_', '').replace(/_/g, ' ')} for my current profile.`;
            isSpecialMode = true;
        } else {
            finalInput = customPrompt || inputValue;
        }

        if (!finalInput || (!finalInput.trim() && !isSpecialMode) || isProcessing) return;

        setIsProcessing(true);
        try {
            const userMsg = {
                id: Date.now().toString(),
                role: 'user',
                content: finalInput,
                timestamp: Date.now(),
                agentName: activeAgent.id,
                agentCategory: activeAgent.category,
                metadata: (() => {
                    switch(activeAgent.id) {
                        case 'AISALES': return { leadType, tone, outreachChannel, accountSize, dealValue, dealStage, mainCompetitor, competitorStrength, salesMode };
                        case 'AIWRITE': return { contentType, seoKeyword, targetAudience, tone, contentContext, brandPersonality, writingLength, objective, isSeoMode, isConversionMode, isRepurposeMode };
                        case 'AIDESK': return { ticketCategory, urgency, auditLogs };
                        case 'AIBIZ': return { industry, businessStage, marketType, businessDescription };
                        case 'AIHIRE': return { hiringMode, hireRole, hireDepartment, hireSeniority, hireLocation, hireBudget, hireUrgency, hireTradeoff, hireTeamSize, hireIndustry, hireBusinessStage, hireRiskTolerance, hireTimelineWeeks, hireSourcingChannels, hireScorecardCriteria, hireBiasCheck, hireOfferSalary, hireEquityPercent, hireCompetitorSalary, hireCandidateLeverage, hireOrgStructure, hireCulturalValues };
                        case 'AIHEALTH': return { healthName, healthAge, healthGender, healthWeight, healthHeight, healthGoal, healthDietaryType, healthAllergies, healthCuisine, healthActiveMonth, symptoms, symptomDuration, symptomSeverity };
                        default: return {};
                    }
                })()
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
                if (writeSegment === 'students') {
                    agentSpecificInstruction = `
                SPECIALIZED STUDENT ASSISTANT MODE
                FEATURE: ${studentFeature}
                TOPIC: ${studentTopic}
                LENGTH: ${studentWordCount}
                TONE: ${studentTone}
                FORMAT: ${isAcademicFormat ? 'Academic Standard (APA/MLA)' : 'Standard Personal/Professional'}
                
                Your Task:
                Act as a specialized Academic Writing Assistant and Content Creator for Students.
                ${studentFeature === 'assignment_writer' ? 'Write a comprehensive academic assignment.' :
                            studentFeature === 'essay_generator' ? 'Generate a well-structured essay.' :
                                studentFeature === 'linkedin_creator' ? 'Create a professional LinkedIn post sharing academic/career insights.' :
                                    studentFeature === 'ppt_generator' ? 'Outline a set of presentation slides with speaker notes.' :
                                        studentFeature === 'sop_writer' ? 'Write a compelling Statement of Purpose (SOP) for university or job applications.' :
                                            studentFeature === 'paraphraser' ? 'Rewrite the input text to improve clarity and flow while maintaining the original meaning.' :
                                                studentFeature === 'plagiarism_rewrite' ? 'Rewrite the following content to be 100% original and plagiarism-free.' :
                                                    studentFeature === 'citation_generator' ? 'Generate formal citations based on the provided source information.' :
                                                        'Process the requested academic content.'}

                MANDATORY STRUCTURE:
                - Use a ${studentTone} tone.
                - Ensure the content is approximately ${studentWordCount}.
                - Always ensure plagiarism-safe results and high structural integrity.
                
                MANDATORY OUTPUT FORMAT:
                SECTION 1: INTRODUCTION
                SECTION 2: CORE ANALYSIS (3 distinct body sections)
                SECTION 3: CONCLUSION
                SECTION 4: REFERENCES (3 APA/MLA style citations ${isAcademicFormat ? 'are mandatory' : 'if applicable'})
                `;
                } else if (writeSegment === 'startups') {
                    agentSpecificInstruction = `
                SPECIALIZED STARTUP PITCH MODE
                COMPANY: ${startupName}
                PRODUCT: ${startupProduct}
                PROBLEM: ${startupProblem}
                SOLUTION: ${startupSolution}
                FEATURE: ${startupFeature}
                TONE: ${startupTone}
                PLATFORM: ${startupPlatform}
                AUDIENCE: ${startupAudience}
                
                You are a Y-Combinator level Startup Advisor.
                Generate: ${startupFeature} for ${startupPlatform}.
                
                Structure:
                SECTION 1: THE HOOK (Grabbing Attention)
                SECTION 2: THE VALUE PROP (Product/Solution)
                SECTION 3: THE STRATEGY (Market/Problem)
                SECTION 4: CALL TO ACTION
                `;
                } else if (writeSegment === 'freelancers') {
                    agentSpecificInstruction = `
                SPECIALIZED FREELANCER CONTENT MODE
                FEATURE: ${freelancerFeature}
                SERVICE: ${freelancerService}
                CLIENT TYPE: ${freelancerClientType}
                BUDGET/RATE context: ${freelancerBudget}
                TONE: ${freelancerTone}
                
                You are a top-tier Freelance Business Consultant.
                Write specialized content for: ${freelancerFeature}.
                
                Structure:
                SECTION 1: PERSONALIZED HOOK
                SECTION 2: CORE VALUE PROPOSITION
                SECTION 3: PRICING & CALL TO ACTION
                `;
                } else if (writeSegment === 'influencers') {
                    agentSpecificInstruction = `
                SPECIALIZED INFLUENCER CONTENT MODE
                FEATURE: ${influencerFeature}
                NICHE: ${influencerNiche}
                MOOD: ${influencerMood}
                EMOJIS: ${useEmojis ? 'ENABLED' : 'DISABLED'}
                HASHTAG COUNT: ${hashtagCount}
                
                You are a Viral Content Strategist.
                Generate optimized content for: ${influencerFeature}.
                
                Structure:
                SECTION 1: SCROLL-STOPPING HOOK
                SECTION 2: ENGAGING NARRATIVE / VALUE
                SECTION 3: CTA & HASHTAG LIST
                `;
                } else if (writeSegment === 'authors') {
                    agentSpecificInstruction = `
                SPECIALIZED CREATIVE WRITER MODE
                TOPIC: ${authorStoryTopic}
                GENRE: ${authorGenre}
                TONE: ${authorTone}
                
                You are a Best-selling Novelist and Creative Writer.
                Write a compelling entry for: ${authorStoryTopic}.
                
                Structure:
                SECTION 1: THE OPENING (Scene Setting)
                SECTION 2: THE CORE STORY (Narrative Flow)
                SECTION 3: THE CLIMAX / RESOLUTION
                `;
                } else if (writeSegment === 'agencies') {
                    if (agencyView === 'planner') {
                        if (finalInput.toLowerCase().includes('calendar')) {
                            agentSpecificInstruction = `
                SPECIALIZED AGENCY SOCIAL PLANNER - CALENDAR MODE
                COMPANY: ${agencyClientName}
                INDUSTRY: ${agencyIndustry}
                TARGET AUDIENCE: ${agencyTargetAudience}
                GOAL: ${agencySocialGoal}
                PLATFORMS: ${agencyPlatforms.join(', ')}
                MONTH: ${agencyMonth}
                FREQUENCY: ${agencyFrequency}

                TASK: Generate a ${agencyFrequency} social media calendar for ${agencyMonth}.
                
                MANDATORY OUTPUT FORMAT (STRICT JSON-ONLY for Calendar):
                You must output a JSON array of objects inside a code block.
                [
                    { 
                      "date": "Feb 3", 
                      "phase": "Pre-Launch", 
                      "platform": "Instagram", 
                      "format": "Reel", 
                      "postType": "Curiosity", 
                      "heading": "This is not a book", 
                      "subHeading": "installs", 
                      "shortCaption": "Not a book. A system.", 
                      "longCaption": "moment. EFV installs a system for...", 
                      "hashtags": "#BookLaunch", 
                      "breakdown": "kinetic text" 
                    },
                    ...
                ]
                
                WRAP THE JSON IN \`\`\`json CODE BLOCK.
                After the table, provide a "Strategy Summary".
                `;
                        } else {
                            agentSpecificInstruction = `
                SPECIALIZED AGENCY CONTENT MODE
                FEATURE: ${agencyFeature}
                COMPANY: ${agencyClientName}
                INDUSTRY: ${agencyIndustry}
                TONE: ${agencyTone}
                PLATFORMS: ${agencyPlatforms.join(', ')}
                
                TASK: Write high-converting content for ${agencyFeature} on ${agencyPlatforms[0]}.
                
                Structure:
                1. Hook
                2. Value
                3. CTA
                `;
                        }
                    } else if (agencyView === 'branding') {
                        agentSpecificInstruction = `
                SPECIALIZED AGENCY BRANDING MODE
                COMPANY: ${agencyClientName}
                INDUSTRY: ${agencyIndustry}
                AUDIENCE: ${agencyTargetAudience}
                USP: ${agencyUSP || 'Not specified'}
                TONE PREFERENCE: ${agencyTone}

                TASK: Create a comprehensive Brand Voice Guide.
                
                MANDATORY SECTIONS:
                SECTION 1: BRAND ARCHETYPE
                SECTION 2: VOICE & TONE GUIDELINES
                SECTION 3: SAMPLE MESSAGING
                SECTION 4: BIOS
                SECTION 5: COLOR PALETTE SUGGESTIONS
                `;
                    }
                } else {
                    // Standard fallback
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
                ` : ''}
                ${isSeoMode ? `
                SEO INSTRUCTIONS (CRITICAL):
                - Integrate primary keyword: "${seoKeyword}" naturally.
                - Use H1, H2, H3 structure for readability and SEO.
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
                }
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
                if (aibizMode === 'CRM') {
                    agentSpecificInstruction = `
                SPECIALIZED AIBIZ CRM INTELLIGENCE MODE
                CUSTOMER: ${selectedCustomer?.name || 'Bulk Accounts'}
                INDUSTRY: ${selectedCustomer?.industry || industry}
                HEALTH SCORE: ${selectedCustomer?.health || 'N/A'}%
                CONTACT: ${selectedCustomer?.contact || 'N/A'}
                
                INTERACTION HISTORY SUMMARY:
                ${interactions.map(msg => `- ${msg.date}: ${msg.type} (${msg.sentiment}) - ${msg.subject}: ${msg.summary}`).join('\n')}

                TASK: 
                Analyze the customer health, churn risk, and upsell potential. 
                If the user asked to generate a draft, write a hyper-personalized response based on the latest interaction sentiment and strategic suggestion.

                MANDATORY OUTPUT FORMAT:
                SECTION 1: ACCOUNT INTELLIGENCE (Churn risk, Health breakdown)
                SECTION 2: GROWTH DYNAMICS (Upsell opportunities)
                SECTION 3: STRATEGIC RECOMMENDATION
                SECTION 4: PERSONALIZED DRAFT (If requested)
                SECTION 5: CRM_DATA_JSON
                (MANDATORY: Provide JSON inside Section 5)
                {
                    "healthTrend": [{"date": "Jan", "score": 80}, {"date": "Feb", "score": 84}],
                    "riskAnalysis": {"score": 15, "priority": "Low"},
                    "upsellIntent": 72
                }
                `;
                } else if (aibizMode === 'Dashboard' || aibizMode === 'Automation' || aibizMode === 'Campaigns') {
                    agentSpecificInstruction = `
                SPECIALIZED AIBIZ SaaS INTELLIGENCE MODE: ${aibizMode}
                CONTEXT: ${businessDescription}
                
                ${aibizMode === 'Dashboard' ? `
                FOCUS: SaaS Growth Metrics, Revenue Dynamics, and Portfolio Health.
                - Analyze provided MRR, Churn, and ARPU signals.
                - Project 12-month growth based on current health score.
                ` : aibizMode === 'Automation' ? `
                FOCUS: Workflow Orchestration and AI-Driven Efficiencies.
                - Design automation blueprints for user journeys (Onboarding, Retention, Upsell).
                - Identify bottlenecks in the current operational flow.
                ` : `
                FOCUS: Strategic Outreach and Conversion Engineering.
                - Design omnichannel campaign structures (Email, Social, Ads).
                - Optimize copy for specific conversion goals.
                `}

                MANDATORY OUTPUT STRUCTURE (SaaS Executive Standard):
                SECTION 1: SaaS HEALTH SUMMARY (Key KPIs and immediate insights)
                SECTION 2: STRATEGIC OPPORTUNITY (Where the highest growth potential lies)
                SECTION 3: AUTOMATION BLUEPRINT (Step-by-step technical or operational workflow)
                SECTION 4: REVENUE PROJECTION (Financial impact of implementing these changes)
                SECTION 5: DATA VISUALIZATIONS (MANDATORY: Provide JSON data for charts. Do not use code blocks.)

                JSON STRUCTURE FOR SECTION 5:
                {
                  "marketShare": [{"name": "Churned", "value": 5, "color": "#ef4444"}, {"name": "Active", "value": 85, "color": "#10b981"}, {"name": "Expansion", "value": 10, "color": "#3b82f6"}],
                  "growthProjection": [{"year": "Next Mo", "revenue": 1200}, {"year": "3 Mo", "revenue": 4500}, {"year": "6 Mo", "revenue": 12000}, {"year": "12 Mo", "revenue": 35000}],
                  "mindMap": [{"id": "1", "label": "${aibizMode} Logic", "children": ["Lead Scoring", "Auto-Flow", "Revenue Tier", "API Hooks"]}]
                }
                `;
                } else {
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
                }
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
                ` : hiringMode === 'Planning' ? `
                GOAL: Org design and headcount forecasting. 
                CONTEXT: ${hireExtraNotes}
                STRUCTURE: ${hireOrgStructure}. Values: ${hireCulturalValues}.
                SECTIONS: SCALABILITY AUDIT, CAPACITY PLANNING, REPORTING LINES, SUCCESSION PLAN, VISUALIZATIONS.
                ` : `
                GOAL: Talent Analytics and Funnel Optimization. 
                ANALYSIS_REQUEST: ${hireExtraNotes || 'General funnel efficiency and cost-per-hire analysis.'}
                SECTIONS: FUNNEL PERFORMANCE, BUDGET ATTRIBUTION, TURNOVER PREDICTION, DATA VISUALIZATIONS.
                ` }
                
                MANDATORY OUTPUT FORMAT:
                SECTION 1: EXECUTIVE SUMMARY
                SECTION 2: DETAILED ANALYSIS
                SECTION 3: ACTIONABLE STEPS
                SECTION 4: RISK & MITIGATION
                SECTION 5: VISUALIZATIONS
                (MANDATORY: Provide JSON data for charts inside Section 5. Do not use code blocks.)
                {
                    "marketShare": [{"name": "Talent Pool", "value": 70, "color": "#10b981"}],
                    "growthProjection": [{"year": "Week 1", "revenue": 10}, {"year": "Week 4", "revenue": 50}],
                    "mindMap": [{"id": "1", "label": "Hiring Funnel", "children": ["Sourcing", "Screening", "Offer"]}]
                }

                ${hiringMode === 'Evaluation' ? 'MANDATORY: For Evaluation mode, you MUST include a SCORECARD_JSON_START ... SCORECARD_JSON_END block after Section 2 containing the parsed scores for visualizations.' : ''}
                `;
            } else if (activeAgent.id === 'AIHEALTH') {
                if (healthMode === 'SYMPTOM CHECKER' || (typeof customPrompt === 'string' && (customPrompt?.includes('symptom_check') || customPrompt?.includes('check_symptoms')))) {
                    agentSpecificInstruction = `
                SPECIALIZED AIHEALTH MODE: Symptom Analysis & Risk Assessment
                USER SYMPTOMS: ${symptoms}
                DURATION: ${symptomDuration}
                SEVERITY: ${symptomSeverity}
                TREATMENT PREFERENCE: ${symptomTreatmentType}
                
                MANDATORY: Return a JSON object inside Section 5 with this structure:
                {
                  "possibleCauses": ["Cause 1", "Cause 2"],
                  "riskLevel": "Low | Medium | High",
                  "recommendations": ["Step 1", "Step 2", "Step 3"],
                  "doctorAdvice": "Professional medical disclaimer and actionable advice based on treatment preference"
                }
                `;
                } else if (healthMode === 'REPORT ANALYZER' || (typeof customPrompt === 'string' && (customPrompt?.includes('analyze_report') || customPrompt?.includes('report_analysis')))) {
                    agentSpecificInstruction = `
                SPECIALIZED AIHEALTH MODE: Lab Report & Vital Analysis
                MANUAL VALUES: ${JSON.stringify(reportManualValues)}
                
                MANDATORY: Return a JSON object inside Section 5 with this structure:
                {
                  "healthScore": "Value out of 10 (e.g. 8.5)",
                  "summary": "High-level overview of the health report",
                  "abnormalFindings": [
                    { "parameter": "Glucose", "value": "150", "unit": "mg/dL", "status": "High" }
                  ],
                  "explanation": "Summarized explanation of findings",
                  "dietSuggestions": ["Diet tip 1", "Diet tip 2"],
                  "lifestyleTips": ["Life tip 1", "Life tip 2"]
                }
                `;
                } else if (healthMode === 'MENTAL SUPPORT' || (typeof customPrompt === 'string' && customPrompt?.includes('get_mental_support'))) {
                    agentSpecificInstruction = `
                SPECIALIZED AIHEALTH MODE: Mental Wellness & Emotional Support
                USER MOOD: ${healthMood}
                USER NOTE: ${mentalNote}
                
                MANDATORY: Return a JSON object inside Section 5 with this structure:
                {
                  "sentiment": "Empathetic emotional analysis",
                  "breathingExercise": {
                    "name": "Box Breathing",
                    "steps": ["Inhale 4s", "Hold 4s", "Exhale 4s", "Hold 4s"],
                    "duration": "16"
                  },
                  "affirmation": "Daily positive affirmation",
                  "actionSteps": ["Action 1", "Action 2"],
                  "supportColor": "#f0f7ff"
                }
                `;
                } else if (healthMode === 'TREATMENT ADVISOR' || (typeof customPrompt === 'string' && (customPrompt?.includes('get_treatment_guide') || customPrompt?.includes('treatment_guide')))) {
                    agentSpecificInstruction = `
                SPECIALIZED AIHEALTH MODE: Medicine & Treatment Advisor
                MEDICINE/CONDITION: ${medicineName || healthCondition}
                TREATMENT PREFERENCE: ${treatmentTypeChoice}
                
                {
                  "purpose": "Precise usage/purpose of treatment",
                  "sideEffects": ["Effect 1", "Effect 2"],
                  "precautions": ["Precaution 1", "Precaution 2"],
                  "alternatives": ["Alternative 1", "Alternative 2"],
                  "safetyWarning": "Critical safety alert",
                  "medicalDisclaimer": "Standard disclaimer text"
                }
                `;
                } else if (healthMode === 'AUTOMATION' || (typeof customPrompt === 'string' && (customPrompt?.includes('run_automation') || customPrompt?.includes('health_automation')))) {
                    agentSpecificInstruction = `
                SPECIALIZED AIHEALTH MODE: Autonomous Health Monitoring (Automation)
                STATUS: ${healthAutomationActive ? 'Active' : 'Paused'}
                RECENT LOGS: ${JSON.stringify(healthAutomationLogs)}
                ACTIVE ALERTS: ${JSON.stringify(healthAlerts)}
                
                DEFINITION OF AI AUTOMATION: "AI detects, AI decides, AI acts".
                
                MANDATORY: Return a JSON object inside Section 5 with this structure:
                {
                  "detections": "Summary of what the AI detected (e.g. irregular sleep, low hydration)",
                  "decisions": "Summary of what the AI decided to do (e.g. schedule analysis, trigger alert)",
                  "actions": "Summary of actions taken (e.g. sent notification, updated calendar)",
                  "newLogs": [
                    { "id": "101", "type": "Detection|Decision|Action", "message": "Detail", "time": "Just now", "severity": "Low|Medium|High" }
                  ],
                  "newAlerts": [
                    { "id": "201", "title": "Alert Title", "message": "Alert detail", "date": "Date", "status": "unread" }
                  ]
                }
                `;
                } else {
                    // Personalized Wellness Planner
                    agentSpecificInstruction = `
                SPECIALIZED AIHEALTH MODE: Holistic Wellness and Ayurvedic Planning
                USER PROFILE: ${JSON.stringify({ healthName, healthAge, healthGender, healthWeight, healthHeight, healthGoal, healthDietaryType, healthAllergies, healthCuisine, healthActiveMonth, includeAyurveda })}
                
                MANDATORY: Return a JSON object inside Section 5 with this structure:
                {
                  "bmiValue": "24.2",
                  "bmiAnalysis": "Explanation of BMI and health status",
                  "dailyStats": {
                    "calories": "2200 kcal",
                    "water": "3L",
                    "sleep": "8 Hours"
                  },
                  "mealPlan": [
                    { "day": "Monday", "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." }
                  ],
                  "workoutSchedule": [
                    { "day": "Monday", "activity": "...", "duration": "30 mins" }
                  ],
                  "progressMilestones": ["Indicator 1", "Indicator 2"]
                }
                `;
                }

                // Append visualization instructions - Consolidated with Health Data
                agentSpecificInstruction += `
                IMPORTANT: Section 5 must contain exactly one JSON object. This object should include all the health fields requested above PLUS these mandatory visualization fields:
                "marketShare": [{"name": "Proteins", "value": 30, "color": "#ef4444"}, {"name": "Carbs", "value": 40, "color": "#f59e0b"}, {"name": "Fats", "value": 30, "color": "#10b981"}],
                "growthProjection": [{"year": "Day 1", "revenue": 100}, {"year": "Day 7", "revenue": 95}],
                "mindMap": [{"id": "1", "label": "Health Path", "children": ["Nutrition", "Fitness", "Routine", "Recovery"]}]
                
                Do not use markdown code blocks inside Section 5.
                `;
            }

            const systemInstruction = `You are ${activeAgent.name}, part of the A - Series AI Business OS.

                    Focus: ${activeAgent.category}.
                ${agentSpecificInstruction}
                MANDATORY: You must respond in ${language || 'English'}.
                Use Markdown formatting effectively.`;

            let activeSessionId = currentSessionId;
            let firstPromptTitle = null;

            if (activeSessionId === 'new') {
                const segmentPrefix = activeAgent.id === 'AIWRITE' ? `[${writeSegment?.toUpperCase() || 'GENERAL'}] ` :
                    activeAgent.id === 'AIHEALTH' ? `[${healthMode?.toUpperCase() || 'WELLNESS'}] ` : '';

                let specificDetail = finalInput;
                if (activeAgent.id === 'AIHEALTH') {
                    if (customPrompt === 'aihealth_check_symptoms') specificDetail = symptoms || "Symptom Check";
                    else if (customPrompt === 'aihealth_analyze_report') specificDetail = "Lab Report Analysis";
                    else if (customPrompt === 'aihealth_generate_wellness_plan') specificDetail = `Wellness: ${healthGoal}`;
                    else if (customPrompt === 'aihealth_get_mental_support') specificDetail = `Mood: ${healthMood}`;
                    else if (customPrompt === 'aihealth_get_treatment_guide') specificDetail = `Treatment: ${medicineName}`;
                }

                const sessionTitle = `${segmentPrefix}${specificDetail.substring(0, 30)}${specificDetail.length > 30 ? '...' : ''}`;
                firstPromptTitle = sessionTitle;

                // createSession in chatStorageService.js returns a string (ID)
                const newId = await chatStorageService.createSession(activeAgent.id, sessionTitle);
                activeSessionId = newId;
                setCurrentSessionId(activeSessionId);

                // Add to sessions list for immediate UI update
                const newSessionObj = {
                    sessionId: newId,
                    title: sessionTitle,
                    lastModified: Date.now(),
                    agentType: activeAgent.id
                };
                setSessions(prev => [newSessionObj, ...prev]);
            }

            // Critical: Pass title to saveMessage to ensure backend and local DB reflect the clinical search
            await chatStorageService.saveMessage(activeSessionId, userMsg, firstPromptTitle);

            // Handle Attachments
            let finalAttachments = activeAgent.id === 'AIHIRE' ? [...hireFileAttachments] : [];

            // Add AIHEALTH Report File if present
            if (activeAgent.id === 'AIHEALTH' && reportFile && typeof reportFile !== 'string') {
                try {
                    const base64Content = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.onerror = (e) => reject(e);
                        reader.readAsDataURL(reportFile);
                    });
                    finalAttachments.push({
                        url: base64Content,
                        name: reportFile.name,
                        type: reportFile.type
                    });
                    console.log("[ATTACHMENT] Added health report file:", reportFile.name);
                } catch (attachErr) {
                    console.error("[ATTACHMENT ERROR]", attachErr);
                }
            }

            let response;
            if (activeAgent.id === 'AIWRITE' && typeof customPrompt === 'object' && customPrompt.segment) {
                // Use specialized AIWRITE service for strategy execution
                let payload = customPrompt;

                // If it's a manuscript editor with a file, use FormData
                if (customPrompt.type === 'manuscript_editor' && authorFile) {
                    const formData = new FormData();
                    formData.append('segment', customPrompt.segment);
                    formData.append('type', customPrompt.type);
                    formData.append('inputs', JSON.stringify(customPrompt.inputs));
                    formData.append('file', authorFile);
                    payload = formData;
                }

                response = await generateAIWriteResponse(payload);
            } else if (activeAgent.id === 'AIHEALTH' && customPrompt === 'aihealth_check_symptoms') {
                // Optimized Path: Use specialized symptom checker backend route
                response = await generateAIHealthSymptomCheck({
                    symptoms: symptoms,
                    duration: symptomDuration,
                    severity: symptomSeverity,
                    treatmentType: symptomTreatmentType
                });
            } else if (activeAgent.id === 'AIHEALTH' && customPrompt === 'aihealth_analyze_report') {
                // Optimized Path: Use specialized report analyzer backend route
                const formData = new FormData();
                if (reportFile) formData.append('file', reportFile);
                formData.append('manualValues', JSON.stringify(reportManualValues));
                response = await generateAIHealthReportAnalysis(formData);
            } else if (activeAgent.id === 'AIHEALTH' && customPrompt === 'aihealth_generate_wellness_plan') {
                // Optimized Path: Use specialized wellness planner backend route
                response = await generateAIHealthWellnessPlan({
                    age: healthAge,
                    height: healthHeight,
                    weight: healthWeight,
                    goal: healthGoal,
                    activityLevel: healthActivityLevel,
                    dietaryType: healthDietaryType,
                    allergies: healthAllergies,
                    cuisine: healthCuisine,
                    includeAyurveda
                });
            } else if (activeAgent.id === 'AIHEALTH' && customPrompt === 'aihealth_get_mental_support') {
                // Optimized Path: Use specialized mental support backend route
                response = await generateAIHealthMentalSupport({
                    mood: healthMood,
                    note: mentalNote
                });
            } else if (activeAgent.id === 'AIHEALTH' && customPrompt === 'aihealth_get_treatment_guide') {
                // Optimized Path: Use specialized treatment guide backend route
                response = await generateAIHealthTreatmentGuide({
                    medicineName,
                    treatmentType: treatmentTypeChoice,
                    condition: healthCondition
                });
            } else if (activeAgent.id === 'AIHEALTH' && customPrompt === 'aihealth_run_automation') {
                response = await generateAIHealthAutomation({
                    active: healthAutomationActive,
                    logs: healthAutomationLogs,
                    alerts: healthAlerts
                });
            } else if (activeAgent.id === 'AIHEALTH' && customPrompt === 'aihealth_log_data') {
                response = await generateAIHealthLogData({
                    sleepHours: healthSleepHours,
                    waterIntake: healthWaterIntake,
                    steps: healthSteps,
                    heartRate: healthHeartRate,
                    stressLevel: healthStressLevel,
                    weight: healthWeight,
                    height: healthHeight,
                    mood: healthMood,
                    notes: mentalNote
                });
            } else if (activeAgent.id === 'AIBIZ' && typeof customPrompt === 'string' && customPrompt.startsWith('aibiz_')) {
                const aibizAction = customPrompt.replace('aibiz_', '');
                if (aibizAction === 'analyze_crm') {
                    response = await analyzeAIBizCRM({
                        customer: selectedCustomer,
                        interactions: interactions,
                        industry: industry,
                        businessDescription: businessDescription
                    });
                } else if (aibizAction === 'score_lead') {
                    response = await scoreAIBizLead({
                        lead: selectedCustomer,
                        industry: industry
                    });
                } else if (aibizAction === 'segment_customers') {
                    response = await segmentAIBizCustomers({
                        customers: customers,
                        industry: industry
                    });
                } else if (aibizAction === 'generate_campaign') {
                    response = await generateAIBizCampaign({
                        goal: campaignGoal,
                        channel: campaignChannel,
                        segment: selectedSegmentId,
                        businessDescription: businessDescription
                    });
                }
            } else if (activeAgent.id === 'AIHIRE' && typeof customPrompt === 'string' && customPrompt.startsWith('aihire_')) {
                // Use standard chat response but with the optimized hire instruction
                response = await generateChatResponse(updatedMessages, finalInput, agentSpecificInstruction, finalAttachments, language || 'English', null, null, { agentType: activeAgent.id });
            } else {
                // Use standard chat response for general queries or other agents
                response = await generateChatResponse(updatedMessages, finalInput, systemInstruction, finalAttachments, language || 'English', null, null, { agentType: activeAgent.id });
            }

            // Handle error response objects (like LIMIT_REACHED)
            if (response && (response.error === 'LIMIT_REACHED' || response.status === 403 || response.error === 'ERROR')) {
                const errorMsg = response.message || response.reason || response.error || "You have reached your usage limit or an error occurred.";
                alert(`Agent Status: ${errorMsg}`);
                setIsProcessing(false);
                return;
            }

            // Extract the core reply - direct routes return data nested in .data
            const aiReply = (typeof customPrompt === 'string' && customPrompt.startsWith('aihealth_') && response.success)
                ? response.data
                : (response.data || response.reply || response.message || response.details || response.error || (typeof response === 'string' ? response : 'No response from engine.'));

            // --- Pre-Processing: Extract Metrics & Results for Metadata Persistance ---
            let parsedData = null;
            try {
                if (typeof aiReply === 'object' && aiReply !== null) {
                    parsedData = aiReply;
                } else if (typeof aiReply === 'string' && aiReply.includes('{')) {
                    const jsonMatch = aiReply.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        parsedData = JSON.parse(jsonMatch[0].trim());
                    }
                }
            } catch (pErr) {
                console.warn("[RESULT PARSE ERROR] Failed to derive structured data from response:", pErr);
            }

            const modelMsg = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: typeof aiReply === 'string' ? aiReply : 'Analysis completed. View results in the dashboard.',
                timestamp: Date.now(),
                agentName: activeAgent.id,
                agentCategory: activeAgent.category,
                metadata: {
                    parsedData: parsedData,
                    healthMode: activeAgent.id === 'AIHEALTH' ? healthMode : null,
                    writeSegment: activeAgent.id === 'AIWRITE' ? writeSegment : null
                }
            };
            setMessages(prev => [...prev, modelMsg]);

            setShowResultModal(true);
            await chatStorageService.saveMessage(activeSessionId, modelMsg);
            // --- Post-Processing: Update Dashboard Metrics ---
            try {
                // If it's an error response or no parsed data, skip metric update
                if (response?.error || response?.details || !parsedData) {
                    console.log("[WORKSPACE] Skipping metric update for error or empty response");
                } else {
                    if (activeAgent.id === 'AIHEALTH') {
                        const inputLower = finalInput.toLowerCase();
                        if (healthMode.includes('Intelligence') || healthMode === 'SYMPTOM CHECKER' || inputLower.includes('symptom')) {
                            setSymptomResult(parsedData);
                            // Dynamic Symptom History (Risk Tracking)
                            const riskMap = { 'Low': 1, 'Medium': 3, 'High': 5 };
                            const riskScore = riskMap[parsedData.riskLevel] || 2;
                            const day = new Date().toLocaleDateString('en-US', { weekday: 'short' });
                            setSymptomHistory(prev => {
                                const newHistory = [...prev];
                                if (newHistory.length >= 7) newHistory.shift();
                                newHistory.push({ date: day, risk: riskScore });
                                return newHistory;
                            });
                        }
                        else if (healthMode.includes('Report') || healthMode === 'REPORT ANALYZER' || inputLower.includes('report')) {
                            setReportResult(parsedData);
                            // Dynamic Report History Update
                            const anomalyCount = parsedData.abnormalFindings?.length || 0;
                            const month = new Date().toLocaleDateString('en-US', { month: 'short' });
                            setReportHistory(prev => {
                                const newHistory = [...prev];
                                if (newHistory.length >= 6) newHistory.shift();
                                newHistory.push({ date: month, anomalies: anomalyCount });
                                return newHistory;
                            });
                        }
                        else if (healthMode.includes('Wellness') || healthMode === 'WELLNESS PLANNER' || inputLower.includes('wellness')) {
                            setWellnessPlanResult(parsedData);
                            // Dynamic Wellness History Update
                            const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            setWellnessHistory(prev => {
                                const newHistory = [...prev];
                                if (newHistory.length >= 6) newHistory.shift();
                                newHistory.push({ date: today, value: parseFloat(healthWeight) });
                                return newHistory;
                            });
                        }
                        else if (healthMode.includes('Mental') || healthMode === 'MENTAL SUPPORT' || inputLower.includes('mental')) {
                            setMentalResult(parsedData);
                            // Dynamic Mood History Update
                            const moodScores = { 'Happy': 5, 'Stressed': 2, 'Anxious': 1, 'Tired': 3 };
                            const newScore = moodScores[healthMood] || 4;
                            const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
                            setMoodHistory(prev => {
                                const newHistory = [...prev];
                                if (newHistory.length >= 7) newHistory.shift();
                                newHistory.push({ date: today, score: newScore });
                                return newHistory;
                            });
                        }
                        else if (healthMode === 'AUTOMATION' || (typeof customPrompt === 'string' && customPrompt?.includes('automation'))) {
                            setAutomationResult(parsedData);
                            if (parsedData.newLogs) setHealthAutomationLogs(prev => [...parsedData.newLogs, ...prev].slice(0, 10));
                            if (parsedData.newAlerts) setHealthAlerts(prev => [...parsedData.newAlerts, ...prev].slice(0, 5));
                        }
                        else if (healthMode.includes('Treatment') || healthMode === 'TREATMENT ADVISOR' || inputLower.includes('treatment')) {
                            setTreatmentResult(parsedData);
                            // Dynamic Treatment history (Consultation Volume)
                            const week = `W${Math.ceil(new Date().getDate() / 7)}`;
                            setTreatmentHistory(prev => {
                                const newHistory = [...prev];
                                const lastIndex = newHistory.length - 1;
                                const last = newHistory[lastIndex];
                                if (last && last.date === week) {
                                    newHistory[lastIndex] = { ...last, scans: (last.scans || 0) + 1 };
                                } else {
                                    if (newHistory.length >= 6) newHistory.shift();
                                    newHistory.push({ date: week, scans: 1 });
                                }
                                return newHistory;
                            });
                        }
                    } else if (activeAgent.id === 'AIBIZ') {
                        if (parsedData.healthScore) setAibizHealthScore(parsedData.healthScore);
                        if (parsedData.goals) setAibizGoals(parsedData.goals);
                        if (parsedData.revenueData) setAibizRevenueData(parsedData.revenueData);
                        if (parsedData.segments) setAibizSegments(parsedData.segments);
                        if (parsedData.leadMetrics) setAibizLeadMetrics(parsedData.leadMetrics);
                        if (parsedData.selectedCustomer && (typeof customPrompt === 'string' && customPrompt.includes('analyze_crm'))) {
                            setSelectedCustomer(parsedData.selectedCustomer);
                        }
                    }
                }
            } catch (err) {
                console.error("[POST-PROCESS ERROR] Metric update failed:", err);
            }

            if (activeAgent.id === 'AIWRITE') {
                setAiWriteResult(aiReply);
            }

            // Pass the same title for model message to ensure it sticks if there was a race
            await chatStorageService.saveMessage(activeSessionId, modelMsg, firstPromptTitle);
        } catch (err) {
            console.error('[WORKSPACE ERROR]', err);
        } finally {
            setIsProcessing(false);
        }
    };



    const renderAIWriteResult = () => {
        if (!aiWriteResult) return null;

        const isCalendar = Array.isArray(aiWriteResult.calendar) || (Array.isArray(aiWriteResult) && aiWriteResult[0]?.date);
        const data = Array.isArray(aiWriteResult.calendar) ? aiWriteResult.calendar : (Array.isArray(aiWriteResult) ? aiWriteResult : null);

        if (isCalendar && data) {
            const handleExportCSV = () => {
                const headers = ["Date", "Phase", "Platform", "Format", "Post Type", "Heading", "Sub-Heading", "Short Caption", "Long Caption", "Hashtags", "Breakdown"];
                const rows = data.map(item => [
                    item.date, item.phase, item.platform, item.format, item.postType,
                    `"${(item.heading || '').replace(/"/g, '""')}"`,
                    `"${(item.subHeading || '').replace(/"/g, '""')}"`,
                    `"${(item.shortCaption || '').replace(/"/g, '""')}"`,
                    `"${(item.longCaption || '').replace(/"/g, '""')}"`,
                    item.hashtags,
                    `"${(item.slideOrReelBreakdown || '').replace(/"/g, '""')}"`
                ]);
                const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `content_calendar_${currentSessionId}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            return (
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">4-Week Strategy Calendar</h4>
                        </div>
                        <button onClick={handleExportCSV} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all">Export CSV</button>
                    </div>
                    <div className="overflow-x-auto rounded-[32px] border border-slate-100 shadow-xl shadow-blue-500/5 bg-white">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Phase</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Platform</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Format</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Topic</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Hook</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Sub Hook</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Short Cap</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Copy</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Hashtags</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Breakdown</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, idx) => (
                                    <tr key={idx} className="border-t border-slate-50 hover:bg-blue-50/10 transition-colors">
                                        <td className="px-6 py-5 text-[11px] font-black text-slate-800">{item.date}</td>
                                        <td className="px-6 py-5 text-[9px] font-bold text-blue-500 uppercase tracking-tight">{item.phase || 'Strategy'}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    {item.platform?.toLowerCase().includes('instagram') ? <Instagram size={12} className="text-pink-500" /> :
                                                        item.platform?.toLowerCase().includes('linkedin') ? <Linkedin size={12} className="text-blue-600" /> :
                                                            item.platform?.toLowerCase().includes('facebook') ? <Facebook size={12} className="text-blue-700" /> :
                                                                item.platform?.toLowerCase().includes('twitter') ? <Twitter size={12} className="text-sky-500" /> :
                                                                    <Share2 size={12} className="text-slate-400" />}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase">{item.platform}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-[9px] text-slate-400 font-bold uppercase">{item.format || 'Standard'}</td>
                                        <td className="px-6 py-5 text-[10px] font-black text-slate-700">{item.post_type || item.postType || 'Social Post'}</td>
                                        <td className="px-6 py-5 min-w-[150px] text-[11px] font-black text-slate-800 leading-tight border-l-2 border-blue-500 pl-2">{item.heading}</td>
                                        <td className="px-6 py-5 min-w-[150px] text-[10px] text-slate-400 font-bold">{item.subHeading || ''}</td>
                                        <td className="px-6 py-5 min-w-[150px] text-[10px] text-slate-600 italic font-medium">"{item.shortCaption}"</td>
                                        <td className="px-6 py-5 min-w-[250px] text-[10px] text-slate-600 font-medium">{item.longCaption || item.shortCaption}</td>
                                        <td className="px-6 py-5 text-[10px] text-blue-600 font-bold">{item.hashtags || '#marketing'}</td>
                                        <td className="px-6 py-5 min-w-[200px] text-[9px] text-slate-400 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">{item.slideOrReelBreakdown || 'Follow brand template'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        // Standard Structured Response (Students, Authors, etc)
        // Convert object entries to cards
        const entries = Object.entries(aiWriteResult).filter(([k]) => k !== 'status' && k !== 'success');

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entries.map(([key, value], idx) => {
                    const isFullWidth = entries.length === 1 || String(value).length > 400;
                    return (
                        <div key={idx} className={`bg-white border border-slate-100 rounded-[32px] p-8 shadow-xl shadow-blue-500/5 ${isFullWidth ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 blur-none">{key.replace(/_/g, ' ')}</h4>
                            <div className="prose prose-slate max-w-none text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleNewChat = () => {
        if (activeAgent?.id) {
            navigate(`/ dashboard / workspace / ${activeAgent.id} `);
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
        if (t.includes('PRICE') || t.includes('COST') || t.includes('ROI') || t.includes('SAVINGS')) return IndianRupee;
        if (t.includes('COMPETITOR')) return Shield;
        if (t.includes('STAKEHOLDER') || t.includes('MAP')) return Network;
        if (t.includes('SEQUENCE') || t.includes('AUTOMATION')) return Zap;
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

        if (card.type === 'calendar-table') {
            return (
                <div className="overflow-x-auto w-full -mx-4 px-4 mt-4">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-secondary/30 text-[9px] uppercase tracking-widest text-subtext font-black">
                            <tr>
                                <th className="px-4 py-2 rounded-l-lg">Date</th>
                                <th className="px-4 py-2">Platform</th>
                                <th className="px-4 py-2">Topic</th>
                                <th className="px-4 py-2 rounded-r-lg">Hook</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {Array.isArray(card.content) && card.content.map((row, i) => (
                                <tr key={i} className="group hover:bg-secondary/10 transition-colors">
                                    <td className="px-4 py-3 font-bold text-maintext whitespace-nowrap">{row.date}</td>
                                    <td className="px-4 py-3 font-bold text-pink-500 uppercase text-[9px]">{row.platform || row.Platform}</td>
                                    <td className="px-4 py-3 font-medium text-maintext">{row.topic}</td>
                                    <td className="px-4 py-3 text-subtext text-[10px] italic">"{row.hook}"</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        const safeContent = typeof card.content === 'string'
            ? card.content
            : card.content != null
                ? JSON.stringify(card.content, null, 2)
                : '';
        return <div className="text-xs text-subtext leading-relaxed whitespace-pre-wrap font-medium">{safeContent}</div>;
    };

    const renderMessageAsCards = (msg) => {
        if (!msg || msg.role === 'user') return null;

        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);

        // Special handling for Agency Calendar JSON
        if (content.includes('```json') && content.includes('"date": ')) {
            const jsonMatch = content.match(/```json([\s\S]*?)```/);
            if (jsonMatch && jsonMatch[1]) {
                try {
                    const calendarData = JSON.parse(jsonMatch[1]);
                    return {
                        title: 'Social Media Calendar',
                        cards: [{
                            title: `Content Plan: ${agencyMonth}`,
                            content: calendarData,
                            icon: CalendarDays,
                            type: 'calendar-table'
                        }]
                    };
                } catch (e) {
                    console.error('Calendar parse error', e);
                }
            }
        }
        try {
            let sections = content.split(/SECTION \d+:/).filter(s => s.trim());

            // If Agency Branding Mode
            if (content.includes('BRAND ARCHETYPE') || content.includes('BIOS')) {
                sections = content.split(/SECTION \d+:/).filter(s => s.trim());
                const cards = sections.map(sec => {
                    const firstNewLine = sec.indexOf('\n');
                    let title = firstNewLine !== -1 ? sec.substring(0, firstNewLine).trim() : 'Branding Asset';
                    let content = firstNewLine !== -1 ? sec.substring(firstNewLine).trim() : sec;

                    // Specific Icon Mapping
                    let icon = PenTool;
                    if (title.includes('ARCHETYPE')) icon = TargetIcon;
                    if (title.includes('VOICE')) icon = MessageSquare;
                    if (title.includes('BIOS')) icon = UserCheck;
                    if (title.includes('COLOR')) icon = Layout;

                    return { title, content, icon, type: 'default' };
                });
                return { title: 'Brand Identity Package', cards };
            }

            if (sections.length <= 1) {
                const headerSplit = content.split(/#{2,3}\s/).filter(s => s.trim());
                if (headerSplit.length > 1) {
                    sections = headerSplit;
                } else {
                    const titleSplit = content.split(/\n([A-Z\s]{5,}):?\n/).filter(s => s.trim());
                    if (titleSplit.length > 1) {
                        sections = titleSplit;
                    } else {
                        sections = [content];
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
                        // ignore
                    }
                }

                return { title, content, icon, type, chartData };
            });
            return { title: `Deep Intelligence Result`, cards };
            return { title: `Content Generation Results`, cards };
        } catch (err) {
            console.error('[renderMessageAsCards error]', err);
            return { title: 'Analysis Result', cards: [{ title: 'Result', content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content), icon: Zap, type: 'default', chartData: null }] };
        }
    };

    const renderAgentInputs = () => {
        switch (activeAgent.id) {
            case 'AISALES':
                return (
                    <AISALESInputs />
                );
            case 'AIWRITE':
                return (
                    <AIWRITEInputs
                        writeSegment={writeSegment} setWriteSegment={setWriteSegment}
                        agencyClientName={agencyClientName} setAgencyClientName={setAgencyClientName}
                        agencyIndustry={agencyIndustry} setAgencyIndustry={setAgencyIndustry}
                        agencyTargetAudience={agencyTargetAudience} setAgencyTargetAudience={setAgencyTargetAudience}
                        agencyMonth={agencyMonth} setAgencyMonth={setAgencyMonth}
                        agencyFrequency={agencyFrequency} setAgencyFrequency={setAgencyFrequency}
                        agencySocialGoal={agencySocialGoal} setAgencySocialGoal={setAgencySocialGoal}
                        agencyTone={agencyTone} setAgencyTone={setAgencyTone}
                        agencyPlatforms={agencyPlatforms} setAgencyPlatforms={setAgencyPlatforms}
                        agencyView={agencyView} setAgencyView={setAgencyView}
                        agencyUSP={agencyUSP} setAgencyUSP={setAgencyUSP}
                        agencyKeyword={agencyKeyword} setAgencyKeyword={setAgencyKeyword}
                        agencyWordCount={agencyWordCount} setAgencyWordCount={setAgencyWordCount}
                        agencyPageDescription={agencyPageDescription} setAgencyPageDescription={setAgencyPageDescription}
                        studentSubject={studentSubject} setStudentSubject={setStudentSubject}
                        studentTopic={studentTopic} setStudentTopic={setStudentTopic}
                        studentWordCount={studentWordCount} setStudentWordCount={setStudentWordCount}
                        studentTone={studentTone} setStudentTone={setStudentTone}
                        isAcademicFormat={isAcademicFormat} setIsAcademicFormat={setIsAcademicFormat}
                        studentFeature={studentFeature} setStudentFeature={setStudentFeature}
                        startupName={startupName} setStartupName={setStartupName}
                        startupProduct={startupProduct} setStartupProduct={setStartupProduct}
                        startupProblem={startupProblem} setStartupProblem={setStartupProblem}
                        startupSolution={startupSolution} setStartupSolution={setStartupSolution}
                        startupTone={startupTone} setStartupTone={setStartupTone}
                        startupPlatform={startupPlatform} setStartupPlatform={setStartupPlatform}
                        startupFeature={startupFeature} setStartupFeature={setStartupFeature}
                        startupAudience={startupAudience} setStartupAudience={setStartupAudience}
                        freelancerService={freelancerService} setFreelancerService={setFreelancerService}
                        freelancerClientType={freelancerClientType} setFreelancerClientType={setFreelancerClientType}
                        freelancerBudget={freelancerBudget} setFreelancerBudget={setFreelancerBudget}
                        freelancerTone={freelancerTone} setFreelancerTone={setFreelancerTone}
                        freelancerFeature={freelancerFeature} setFreelancerFeature={setFreelancerFeature}
                        influencerNiche={influencerNiche} setInfluencerNiche={setInfluencerNiche}
                        influencerMood={influencerMood} setInfluencerMood={setInfluencerMood}
                        useEmojis={useEmojis} setUseEmojis={setUseEmojis}
                        hashtagCount={hashtagCount} setHashtagCount={setHashtagCount}
                        influencerFeature={influencerFeature} setInfluencerFeature={setInfluencerFeature}
                        authorStoryTopic={authorStoryTopic} setAuthorStoryTopic={setAuthorStoryTopic}
                        authorGenre={authorGenre} setAuthorGenre={setAuthorGenre}
                        authorTone={authorTone} setAuthorTone={setAuthorTone}
                        authorFeature={authorFeature} setAuthorFeature={setAuthorFeature}
                        authorTheme={authorTheme} setAuthorTheme={setAuthorTheme}
                        authorMood={authorMood} setAuthorMood={setAuthorMood}
                        authorStyle={authorStyle} setAuthorStyle={setAuthorStyle}
                        authorRhyme={authorRhyme} setAuthorRhyme={setAuthorRhyme}
                        authorCharacters={authorCharacters} setAuthorCharacters={setAuthorCharacters}
                        authorScript={authorScript} setAuthorScript={setAuthorScript}
                        authorContext={authorContext} setAuthorContext={setAuthorContext}
                        authorLength={authorLength} setAuthorLength={setAuthorLength}
                        authorLanguage={authorLanguage} setAuthorLanguage={setAuthorLanguage}
                        authorFile={authorFile} setAuthorFile={setAuthorFile}
                        agencyFeature={agencyFeature} setAgencyFeature={setAgencyFeature}
                        contentType={contentType} setContentType={setContentType}
                        objective={objective} setObjective={setObjective}
                        tone={tone} setTone={setTone}
                        writingLength={writingLength} setWritingLength={setWritingLength}
                        targetAudience={targetAudience} setTargetAudience={setTargetAudience}
                        seoKeyword={seoKeyword} setSeoKeyword={setSeoKeyword}
                        brandPersonality={brandPersonality} setBrandPersonality={setBrandPersonality}
                        contentContext={contentContext} setContentContext={setContentContext}
                        isSeoMode={isSeoMode} setIsSeoMode={setIsSeoMode}
                        isConversionMode={isConversionMode} setIsConversionMode={setIsConversionMode}
                        isRepurposeMode={isRepurposeMode} setIsRepurposeMode={setIsRepurposeMode}
                        isMultiOutputEnabled={isMultiOutputEnabled} setIsMultiOutputEnabled={setIsMultiOutputEnabled}
                        automationWorkflows={automationWorkflows} setAutomationWorkflows={setAutomationWorkflows}
                        automationDeadlines={automationDeadlines} setAutomationDeadlines={setAutomationDeadlines}
                        isProcessing={isProcessing}
                        handleAction={handleAction}
                        onClearWorkspace={handleClearWorkspace}
                        aiWriteResult={aiWriteResult}
                        setAiWriteResult={setAiWriteResult}
                        sessions={sessions}
                        currentSessionId={currentSessionId}
                        onDeleteSession={handleDeleteSession}
                        navigate={navigate}
                    />
                );
            case 'AIBIZ':
                return (
                    <AIBIZInputs
                        aibizMode={aibizMode} setAibizMode={setAibizMode}
                        industry={industry} setIndustry={setIndustry}
                        marketType={marketType} setMarketType={setMarketType}
                        businessStage={businessStage} setBusinessStage={setBusinessStage}
                        businessDescription={businessDescription} setBusinessDescription={setBusinessDescription}
                        yourPrice={yourPrice} setYourPrice={setYourPrice}
                        competitorPrice={competitorPrice} setCompetitorPrice={setCompetitorPrice}
                        isProcessing={isProcessing}
                        handleAction={handleAction}
                        onClearWorkspace={handleClearWorkspace}
                        selectedCustomer={selectedCustomer}
                        setSelectedCustomer={setSelectedCustomer}
                        customers={customers}
                        interactions={interactions}
                        healthScore={aibizHealthScore}
                        setHealthScore={setAibizHealthScore}
                        goals={aibizGoals}
                        setGoals={setAibizGoals}
                        revenueData={aibizRevenueData}
                        setRevenueData={setAibizRevenueData}
                        segments={aibizSegments}
                        setSegments={setAibizSegments}
                        leadMetrics={aibizLeadMetrics}
                        setLeadMetrics={setAibizLeadMetrics}
                        sessions={sessions}
                        currentSessionId={currentSessionId}
                        onDeleteSession={handleDeleteSession}
                        navigate={navigate}
                    />
                );
            case 'AIHIRE':
                return (
                    <AIHIREInputs />
                );
            case 'AIHEALTH':
                return (
                    <AIHEALTHInputs
                        healthMode={healthMode} setHealthMode={setHealthMode}
                        healthName={healthName} setHealthName={setHealthName}
                        healthAge={healthAge} setHealthAge={setHealthAge}
                        healthGender={healthGender} setHealthGender={setHealthGender}
                        healthWeight={healthWeight} setHealthWeight={setHealthWeight}
                        healthHeight={healthHeight} setHealthHeight={setHealthHeight}
                        healthGoal={healthGoal} setHealthGoal={setHealthGoal}
                        healthDietaryType={healthDietaryType} setHealthDietaryType={setHealthDietaryType}
                        healthAllergies={healthAllergies} setHealthAllergies={setHealthAllergies}
                        healthCuisine={healthCuisine} setHealthCuisine={setHealthCuisine}
                        healthActiveMonth={healthActiveMonth} setHealthActiveMonth={setHealthActiveMonth}
                        includeAyurveda={includeAyurveda} setIncludeAyurveda={setIncludeAyurveda}
                        wellnessHistory={wellnessHistory} setWellnessHistory={setWellnessHistory}
                        reportHistory={reportHistory} setReportHistory={setReportHistory}
                        symptoms={symptoms} setSymptoms={setSymptoms}
                        symptomDuration={symptomDuration} setSymptomDuration={setSymptomDuration}
                        symptomSeverity={symptomSeverity} setSymptomSeverity={setSymptomSeverity}
                        symptomTreatmentType={symptomTreatmentType} setSymptomTreatmentType={setSymptomTreatmentType}
                        symptomResult={symptomResult} setSymptomResult={setSymptomResult}
                        reportManualValues={reportManualValues} setReportManualValues={setReportManualValues}
                        reportResult={reportResult} setReportResult={setReportResult}
                        reportFile={reportFile} setReportFile={setReportFile}
                        healthActivityLevel={healthActivityLevel} setHealthActivityLevel={setHealthActivityLevel}
                        wellnessPlanResult={wellnessPlanResult} setWellnessPlanResult={setWellnessPlanResult}
                        healthMood={healthMood} setHealthMood={setHealthMood}
                        mentalNote={mentalNote} setMentalNote={setMentalNote}
                        mentalResult={mentalResult} setMentalResult={setMentalResult}
                        moodHistory={moodHistory} setMoodHistory={setMoodHistory}
                        medicineName={medicineName} setMedicineName={setMedicineName}
                        treatmentTypeChoice={treatmentTypeChoice} setTreatmentTypeChoice={setTreatmentTypeChoice}
                        healthCondition={healthCondition} setHealthCondition={setHealthCondition}
                        treatmentResult={treatmentResult} setTreatmentResult={setTreatmentResult}
                        symptomHistory={symptomHistory} setSymptomHistory={setSymptomHistory}
                        treatmentHistory={treatmentHistory} setTreatmentHistory={setTreatmentHistory}
                        healthAutomationActive={healthAutomationActive} setHealthAutomationActive={setHealthAutomationActive}
                        healthAutomationLogs={healthAutomationLogs} setHealthAutomationLogs={setHealthAutomationLogs}
                        healthAlerts={healthAlerts} setHealthAlerts={setHealthAlerts}
                        automationResult={automationResult} setAutomationResult={setAutomationResult}
                        healthSleepHours={healthSleepHours} setHealthSleepHours={setHealthSleepHours}
                        healthWaterIntake={healthWaterIntake} setHealthWaterIntake={setHealthWaterIntake}
                        healthSteps={healthSteps} setHealthSteps={setHealthSteps}
                        healthHeartRate={healthHeartRate} setHealthHeartRate={setHealthHeartRate}
                        healthStressLevel={healthStressLevel} setHealthStressLevel={setHealthStressLevel}
                        healthRoutine={healthRoutine} setHealthRoutine={setHealthRoutine}
                        isProcessing={isProcessing}
                        handleAction={handleAction}
                        onClearWorkspace={handleClearWorkspace}
                        sessions={sessions}
                        currentSessionId={currentSessionId}
                        onDeleteSession={handleDeleteSession}
                        navigate={navigate}
                    />
                );


            case 'AIDESK':
                return (
                    <AIDESKInputs
                        ticketCategory={ticketCategory} setTicketCategory={setTicketCategory}
                        urgency={urgency} setUrgency={setUrgency}
                        auditLogs={auditLogs} setAuditLogs={setAuditLogs}
                        isProcessing={isProcessing}
                        handleAction={handleAction}
                        sessions={sessions}
                        currentSessionId={currentSessionId}
                        onDeleteSession={handleDeleteSession}
                        navigate={navigate}
                    />
                );
            default: return <div className="text-xs text-subtext">Parameters loading...</div>;
        }
    };

    const renderAgentActions = () => (
        <AgentActions
            activeAgent={activeAgent}
            hiringMode={hiringMode}
            handleAction={handleAction}
        />
    );
    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans relative">
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -260, width: 260 }}
                            animate={{ x: 0, width: 260 }}
                            exit={{ x: -260, width: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed lg:relative inset-y-0 left-0 bg-white lg:bg-secondary/40 border-r border-border flex flex-col h-full shrink-0 z-50 shadow-2xl lg:shadow-none"
                        >
                            <div className="p-4 border-b border-border flex items-center justify-between h-16">
                                <h3 className="text-subtext text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><History className="w-3.5 h-3.5" /> History</h3>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-subtext"><X className="w-4 h-4" /></button>
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
                                                            onClick={() => {
                                                                navigate(`/dashboard/workspace/${session.sessionId}`);
                                                                if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                                            }}
                                                            className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${currentSessionId === session.sessionId
                                                                ? 'bg-slate-50 lg:bg-white shadow-sm border border-border/50'
                                                                : 'hover:bg-slate-50 border border-transparent'
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
                    </>
                )}
            </AnimatePresence>


            <main className={`flex-1 flex flex-col relative overflow-hidden transition-all duration-700 min-w-0 ${activeAgent?.id === 'AISALES'
                ? 'bg-gradient-to-br from-blue-50/80 via-white to-sky-50/80'
                : activeAgent?.id === 'AIWRITE'
                    ? 'bg-gradient-to-b from-blue-50/20 to-white'
                    : activeAgent?.id === 'AIHEALTH'
                        ? 'bg-[#f8faff]'
                        : 'bg-secondary/30'
                }`}>
                <header className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-4 lg:px-8 z-20 shrink-0">
                    <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 lg:mr-2"
                                title="Open history"
                            >
                                <History size={20} />
                            </button>
                        )}
                        {activeAgent?.id === 'AIHEALTH' ? (
                            <>
                                <div className="w-9 h-9 lg:w-12 lg:h-12 shrink-0 bg-[#f0f4ff] rounded-lg lg:rounded-xl shadow-sm border border-[#e0e8ff] flex items-center justify-center p-1">
                                    <Activity className="w-5 h-5 lg:w-6 lg:h-6 text-[#5865f2]" />
                                </div>
                                <div className="space-y-0.5 min-w-0 overflow-hidden">
                                    <h2 className="text-xs lg:text-sm font-black text-slate-800 tracking-tight truncate">AIHEALTH Agent</h2>
                                    <p className="hidden md:block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Holistic Wellness</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={`w-9 h-9 lg:w-12 lg:h-12 shrink-0 ${activeAgent?.id === 'AIWRITE' ? 'bg-blue-50' : activeAgent?.id === 'AISALES' ? 'bg-indigo-50' : 'bg-slate-50'} rounded-lg lg:rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden p-1`}>
                                    <img
                                        src={`/AGENTS_IMG/${activeAgent?.id}.png`}
                                        alt={activeAgent?.id}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                    <div style={{ display: 'none' }}>
                                        {activeAgent?.id === 'AIWRITE' ? <Sparkles className="w-6 h-6 text-blue-600" /> : activeAgent?.id === 'AISALES' ? <TargetIcon className="w-6 h-6 text-indigo-600" /> : activeAgent?.icon ? <activeAgent.icon className="w-6 h-6 text-slate-600" /> : <Zap className="w-6 h-6 text-slate-600" />}
                                    </div>
                                </div>
                                <div className="space-y-0.5 min-w-0 overflow-hidden">
                                    <h2 className="text-xs lg:text-sm font-black text-slate-800 tracking-tight truncate">
                                        {activeAgent?.id === 'AIWRITE' ? 'AIWRITE Agent' : activeAgent?.id === 'AISALES' ? 'AISALES Agent' : activeAgent?.name || 'A.I. Engine'}
                                    </h2>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">{user.name.charAt(0)}</div></div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10">
                        <div className={`${['AIWRITE', 'AIHEALTH', 'AIHIRE', 'AIBIZ', 'AISALES'].includes(activeAgent?.id) ? '' : 'bg-card border border-border rounded-2xl shadow-sm relative'}`}>
                            {!['AIWRITE', 'AIHEALTH', 'AIHIRE', 'AIBIZ', 'AISALES'].includes(activeAgent?.id) && (
                                <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between"><div className="flex items-center gap-2"><Settings className="w-3.5 h-3.5 text-maintext/50" /><h3 className="text-[10px] font-black text-maintext uppercase tracking-widest">Parameters</h3></div></div>
                            )}
                            <div className={`${['AIWRITE', 'AIHEALTH', 'AIHIRE', 'AIBIZ', 'AISALES'].includes(activeAgent?.id) ? '' : 'p-6 space-y-6'}`}>
                                <div className={`${['AIWRITE', 'AIHEALTH', 'AIHIRE', 'AIBIZ', 'AISALES'].includes(activeAgent?.id) ? '' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}`}>{renderAgentInputs()}</div>
                                {!['AIWRITE', 'AIHEALTH', 'AIHIRE', 'AIBIZ', 'AISALES'].includes(activeAgent?.id) && (
                                    <form onSubmit={handleAction} className="space-y-4">
                                        <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Describe your objective..." className="w-full bg-secondary/20 border border-border focus:border-primary/50 focus:bg-white transition-all rounded-2xl p-4 min-h-[120px] text-sm text-maintext outline-none" />
                                        <div className="flex items-center justify-between border-t border-border pt-4"><div className="flex gap-2">{renderAgentActions()}</div><button type="submit" disabled={isProcessing || !inputValue.trim()} className="px-6 py-2 bg-primary text-white rounded-lg font-bold shadow-md hover:bg-primary/90 transition-all text-xs uppercase tracking-widest">{isProcessing ? 'Processing...' : 'Execute'}</button></div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {!['AIWRITE', 'AIHEALTH', 'AIHIRE', 'AIBIZ', 'AISALES'].includes(activeAgent?.id) && messages.length > 0 && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] flex-1 bg-border/50"></div>
                                    <span className="text-[10px] font-black text-subtext uppercase tracking-[0.3em]">Analysis</span>
                                    <div className="h-[1px] flex-1 bg-border/50"></div>
                                </div>
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
                        )}
                    </div>
                </div>
            </main>



            <AnimatePresence>
                {showResultModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6`} onClick={() => setShowResultModal(false)}>
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
                                        if (activeAgent.id === 'AIWRITE' && aiWriteResult) {
                                            return renderAIWriteResult();
                                        }
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

                            <div className="p-4 border-t border-border bg-white flex flex-wrap justify-between items-center gap-3 shrink-0">
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2">
                                        <PenTool size={14} /> Improve
                                    </button>
                                    <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2">
                                        <Zap size={14} /> Regenerate
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowResultModal(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-subtext hover:text-maintext">Close</button>
                                    <button className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
                                        <Plus size={14} /> Save to Workspace
                                    </button>
                                    <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all flex items-center gap-2">
                                        <FileText size={14} /> Download PDF
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {showClearConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl border border-slate-100 space-y-8"
                        >
                            <div className="w-20 h-20 rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600 mx-auto">
                                <AlertCircle className="w-10 h-10" />
                            </div>
                            <div className="text-center space-y-3">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Clear Workspace?</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-loose">
                                    This will start a new session but keep previous work in history.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className="py-5 rounded-[25px] border border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all font-sans"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeClearWorkspace}
                                    className="py-5 rounded-[25px] bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all font-sans"
                                >
                                    Clear Now
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl border border-slate-100 space-y-8"
                        >
                            <div className="w-20 h-20 rounded-[30px] bg-blue-50 flex items-center justify-center text-blue-600 mx-auto">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <div className="text-center space-y-3">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Delete History?</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-loose">
                                    This action cannot be undone. This session will be permanently removed.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setSessionToDelete(null);
                                    }}
                                    className="py-5 rounded-[25px] border border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all font-sans"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeDeleteSession}
                                    className="py-5 rounded-[25px] bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all font-sans"
                                >
                                    Delete Now
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default AISAWorkSpace;