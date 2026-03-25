import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    BarChart3,
    FileText,
    Zap,
    ChevronDown,
    Target,
    Users,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    FilePieChart,
    Search as SearchIcon,
    X,
    Trash2,
    IndianRupee,
    Globe,
    Building2,
    CalendarDays,
    GitGraph,
    ShieldCheck,
    Bot,
    UploadCloud,
    Target as TargetIcon,
    Activity,
    Mail,
    Linkedin,
    Trash,
    MessageSquare,
    Trophy,
    Download,
    Upload,
    History,
    Plus
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserData } from '../../userStore/userData';
import { generateChatResponse } from '../../services/aisaService';
import { chatStorageService } from '../../services/chatStorageService';
import { useNavigate, useParams } from 'react-router';
import { useLanguage } from '../../context/LanguageContext';

// Reusable Custom Select Component
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
        ? (options.find(o => o.value === value)?.label || options.find(o => o === value) || value)
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
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 mt-2 bg-white border border-border/40 rounded-2xl shadow-xl overflow-hidden z-50 py-2"
                    >
                        {options.map((opt) => {
                            const val = typeof opt === 'object' ? opt.value : opt;
                            const label = typeof opt === 'object' ? opt.label : opt;
                            return (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => {
                                        onChange(val);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-5 py-3 text-sm hover:bg-secondary/50 text-maintext transition-colors flex items-center justify-between transition-all"
                                >
                                    {label}
                                    {value === val && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Offer Letter Templates
const OFFER_TEMPLATES = {
    Standard: `UNIFIED WEB OPTIONS AND SERVICES (UWO)
3 Floor, 5G Square near PNB Bank, Rampur Chowk, Jabalpur MP (482008)
Contact: 8358990909

OFFER OF EMPLOYMENT

Date: [Date]
Candidate Name: [Candidate Name]
Position: [Job Title]
Reporting: [Manager Name]

Dear [Candidate Name],

We are pleased to offer you the position of [Job Title] with Unified Web Options and Services.

1. START DATE: Your employment will begin on [Start Date].
2. COMPENSATION: Your annual base salary will be ₹[Salary], payable monthly.
3. BENEFITS: [Benefits]
4. LOCATION: [Location]

Acceptance:
Please sign below to acknowledge your acceptance.

Sincerely,
[Manager Name]`,

    Startup: `🚀 JOIN THE UWO MISSION
Unified Web Options and Services (UWO)
3 Floor, 5G Square, Jabalpur (482008)

Hi [Candidate Name],

We're excited to invite you to join Unified Web Options and Services (UWO) as our newest [Job Title]!

THE PACKAGE:
- ROLE: [Job Title]
- START DATE: [Start Date]
- CASH: ₹[Salary] / year
- EQUITY: [Equity %]
- PERKS: [Benefits]

YOUR MISSION:
Reporting to [Manager Name], you'll help build the future of our AI ecosystem.

Accepted By: __________________  Date: __________`,

    Executive: `CONFIDENTIAL EXECUTIVE APPOINTMENT
UNIFIED WEB OPTIONS AND SERVICES (UWO)

Date: [Date]
For: [Candidate Name]
Position: [Job Title]

Dear [Candidate Name],

We are pleased to appoint you as [Job Title] at Unified Web Options and Services.

I. REMUNERATION
Base Salary: ₹[Salary] per annum.
Performance Bonus: [Bonus %].

II. REPORTING
You will report directly to [Reporting To].

III. TERMS
Start Date: [Start Date]
Location: [Location]

This offer stands until [Deadline].

Best Regards,
[Manager Name]
Unified Web Options and Services (UWO)`
};

export default function AiHire() {
    const navigate = useNavigate();
    const { sessionId } = useParams();
    const { language } = useLanguage();
    const user = getUserData() || { name: 'Super User', email: 'user@a-series.ai', plan: 'Business' };

    // --- STATES ---
    const [hiringMode, setHiringMode] = useState('Strategy');
    const [messages, setMessages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [scorecardData, setScorecardData] = useState(null);
    const [currentSessionId, setCurrentSessionId] = useState(sessionId || 'new');
    const [isEditingResult, setIsEditingResult] = useState(false);
    const [editedReply, setEditedReply] = useState("");

    // AIHIRE Specialized States — Global
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
    const [uploadedFileName, setUploadedFileName] = useState(null);

    // History state
    const [historySessions, setHistorySessions] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Mode Specifics
    const [hireRiskTolerance, setHireRiskTolerance] = useState('Medium');
    const [hireTimelineWeeks, setHireTimelineWeeks] = useState(8);
    const [hireSourcingChannels, setHireSourcingChannels] = useState('LinkedIn');

    // Evaluation state
    const [hireCandidateProfiles, setHireCandidateProfiles] = useState('');
    const [hireJobDescription, setHireJobDescription] = useState('');
    const [hireScorecardCriteria, setHireScorecardCriteria] = useState('Technical Skills, Culture Fit, Communication');
    const [hireBiasCheck, setHireBiasCheck] = useState(true);
    const [hireUploadedFiles, setHireUploadedFiles] = useState([]);
    const [hireUploadDragging, setHireUploadDragging] = useState(false);
    const [hireFileAttachments, setHireFileAttachments] = useState([]);
    const hireFileInputRef = React.useRef(null);

    // Offer state
    const [hireCandidateName, setHireCandidateName] = useState('');
    const [hireOfferSalary, setHireOfferSalary] = useState('');
    const [hireEquityPercent, setHireEquityPercent] = useState('');
    const [hireCompetitorSalary, setHireCompetitorSalary] = useState('');
    const [hireOfferPerks, setHireOfferPerks] = useState('');
    const [hireCandidateLeverage, setHireCandidateLeverage] = useState('Medium');
    const [hireOfferStartDate, setHireOfferStartDate] = useState('');
    const [hireOfferManager, setHireOfferManager] = useState('');

    // Planning state
    const [hireOrgStructure, setHireOrgStructure] = useState('Flat');
    const [hireCulturalValues, setHireCulturalValues] = useState('Execution, Transparency, Speed');

    // --- HANDLERS ---

    useEffect(() => {
        if (sessionId && sessionId !== 'new') {
            loadSession(sessionId);
        }
        loadHistoryList();
    }, [sessionId]);

    const loadHistoryList = async () => {
        try {
            const sessions = await chatStorageService.getSessions('AIHIRE');
            setHistorySessions(sessions);
        } catch (err) {
            console.error('Failed to load history', err);
        }
    };

    const loadSession = async (sid) => {
        try {
            const history = await chatStorageService.getSessionMessages(sid);
            if (history) setMessages(history);
            setCurrentSessionId(sid);
        } catch (err) {
            console.error('Load session error', err);
        }
    };

    const handleResumeFiles = async (files) => {
        const allowed = ['application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

        for (const file of Array.from(files)) {
            const isDocx = file.name.match(/\.docx$/i) ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            const isTxt = file.type === 'text/plain' || file.name.match(/\.txt$/i);
            const isPdf = file.type === 'application/pdf' || file.name.match(/\.pdf$/i);
            const isDoc = file.type === 'application/msword' || file.name.match(/\.doc$/i);

            if (!isDocx && !isTxt && !isPdf && !isDoc) continue;

            setHireUploadedFiles(prev => [...prev, file.name]);

            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Content = e.target.result;

                // Add to attachments
                setHireFileAttachments(prev => [...prev, {
                    url: base64Content,
                    name: file.name,
                    type: file.type
                }]);

                if (isDocx) {
                    try {
                        const arrayBuffer = await file.arrayBuffer();
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        const text = result.value.trim();
                        const extracted = text.length > 5 ? text : `[${file.name}] — Could not extract text. Please paste manually.`;
                        setHireCandidateProfiles(prev => prev ? `${prev}\n---\n📄 ${file.name}:\n${extracted}` : `📄 ${file.name}:\n${extracted}`);
                    } catch (err) {
                        console.error('mammoth error', err);
                        setHireCandidateProfiles(prev => prev ? `${prev}\n---\n📄 ${file.name}: [Failed to extract]` : `📄 ${file.name}: [Failed to extract]`);
                    }
                } else if (isTxt) {
                    const textReader = new FileReader();
                    textReader.onload = (ev) => {
                        const text = (ev.target.result || '').trim();
                        setHireCandidateProfiles(prev => prev ? `${prev}\n---\n📄 ${file.name}:\n${text}` : `📄 ${file.name}:\n${text}`);
                    };
                    textReader.readAsText(file);
                } else if (isPdf || isDoc) {
                    setHireCandidateProfiles(prev => prev
                        ? `${prev}\n---\n📄 ${file.name}:\n[File uploaded — PDF content is sent as attachment to AI]`
                        : `📄 ${file.name}:\n[File uploaded — PDF content is sent as attachment to AI]`);
                }
            };
            reader.readAsDataURL(file);
        }
    };


    const handleTemplateUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PDF or an Image (JPEG/PNG).');
            return;
        }

        setIsProcessing(true);
        try {
            const data = await extractTemplateText(file);
            if (data.success && data.data.text && data.data.text.trim().length > 0) {
                setHireExtraNotes(data.data.text);
                setUploadedFileName(file.name);
            } else {
                alert("The uploaded document appears to be empty or unreadable. Please check the file.");
            }
        } catch (error) {
            console.error("Upload failed", error);
            const errMsg = error.response?.data?.message || error.message || "Unknown error";
            alert(`Failed to extract text: ${errMsg}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAction = async (e, customPrompt = null, overrideMode = null) => {
        if (e) e.preventDefault();

        let finalInput = customPrompt || `Run a full ${overrideMode || hiringMode} analysis for the role: ${hireRole || 'the specified position'}.`;

        if (!finalInput || !finalInput.trim() || isProcessing) return;

        setIsProcessing(true);
        try {
            const userMsg = {
                id: Date.now().toString(),
                role: 'user',
                content: finalInput,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, userMsg]);

            let aiReply = "";
            let responseData = null;

            // --- SPECIALIZED AGENT CALLS ---
            const currentMode = overrideMode || hiringMode;

            // ROUTING LOGIC
            // 1. Strategy Mode -> Job Description
            if (currentMode === 'Strategy' && finalInput.toLowerCase().includes('job description')) {
                const jdPayload = {
                    jobTitle: hireRole || "the specified position",
                    companyName: "Unified Web Options and Services",
                    location: hireDepartment || "Remote",
                    jobType: "Full-time",
                    experienceLevel: hireSeniority || "Mid-Level",
                    skills: [hireScorecardCriteria].filter(Boolean),
                    salaryRange: hireBudget ? `₹${hireBudget}` : "",
                    extraNotes: hireExtraNotes
                };
                console.log("Calling JD Service...");
                const res = await generateJobDescription(jdPayload);
                aiReply = res.data.document;
            }
            // 1. Offer Mode -> generateOfferLetter
            if (currentMode === 'Offer' && (finalInput.toLowerCase().includes('offer letter') || finalInput.toLowerCase().includes('generate offer'))) {
                const offerPayload = {
                    candidateName: hireCandidateName || "Candidate",
                    jobTitle: hireRole || "Employee",
                    companyName: "Unified Web Options and Services",
                    salary: hireOfferSalary || "TBD",
                    equity: hireEquityPercent || "TBD",
                    startDate: hireOfferStartDate || "TBD",
                    managerName: hireOfferManager || "Hiring Manager",
                    benefits: hireOfferPerks || "Standard Benefits",
                    extraNotes: hireExtraNotes
                };
                console.log("Calling Offer Service...");
                const res = await generateOfferLetter(offerPayload);
                aiReply = res.data.document;
            }
            // 2. Evaluation Mode (Interview Questions) -> generateInterviewQuestions
            else if (currentMode === 'Evaluation' && finalInput.includes('Question')) {
                const questionPayload = {
                    jobTitle: hireRole,
                    skills: [hireScorecardCriteria], // simplistic
                    experienceLevel: hireSeniority,
                    questionCount: 10,
                    extraNotes: hireExtraNotes
                };
                console.log("Calling Interview Service...");
                const res = await generateInterviewQuestions(questionPayload);
                aiReply = res.data.document;
            }
            // 3. Fallback to Generic Chat for Strategy/Planning/Analytics
            else {
                const systemInstruction = `
                YOU ARE THE AIHIRE AGENT — A PROFESSIONAL TALENT STRATEGIST.
                CURRENT MODE: ${currentMode}
    
                GLOBAL CONTEXT:
                - Role: ${hireRole}
                - Dept: ${hireDepartment}
                - Seniority: ${hireSeniority}
                - Budget: ₹${hireBudget}
                - High Quality Priority: ${hireTradeoff}%
                - Industry: ${hireIndustry}
                - Business Stage: ${hireBusinessStage}
    
                ${currentMode === 'Strategy' ? `
                GOAL: Create a hiring roadmap. Timeline: ${hireTimelineWeeks} weeks. Risk: ${hireRiskTolerance}. Sourcing: ${hireSourcingChannels}.
                NOTES: ${hireExtraNotes}
                SECTIONS: READINESS SCORE, TRADE-OFF ANALYSIS, RISK RADAR, COST FORECAST, VISUALIZATIONS.
                ` : currentMode === 'Evaluation' ? `
                GOAL: Rank candidates and check bias. Criteria: ${hireScorecardCriteria}. Bias Check: ${hireBiasCheck}.
                JD: ${hireJobDescription}
                PROFILES: ${hireCandidateProfiles}
                SECTIONS: SCORECARD FRAMEWORK, CANDIDATE RANKING (with SCORECARD_JSON), BIAS REPORT, INTERVIEW FRAMEWORK, VISUALIZATIONS.
                ` : currentMode === 'Offer' ? `
                GOAL: Generate a formal offer letter and closing strategy. 
                STRICT TEMPLATE ADHERENCE: If CANDIDATE_DETAILS contains a template (legal clauses, formal structure), use it EXCLUSIVELY. Do not rewrite or rephrase the template. Only fill in placeholders.
                CANDIDATE_DETAILS: ${hireExtraNotes || 'Use the candidate details provided in the prompt.'}
                TARGET_OFFER: Salary: ₹${hireOfferSalary || 'TBD'}, Equity: ${hireEquityPercent || 'TBD'}%, Perks: ${hireOfferPerks || 'Standard Benefits'}.
                MARKET_CONTEXT: Competitor: ₹${hireCompetitorSalary}, Leverage: ${hireCandidateLeverage}.
                SECTIONS: FORMAL OFFER LETTER (Strictly follows template if provided), MARKET BENCHMARK, ACCEPTANCE PROBABILITY, NEGOTIATION PLAYBOOK, VISUALIZATIONS.
                ` : currentMode === 'Planning' ? `
                GOAL: Org design and headcount forecasting. 
                CONTEXT: ${hireExtraNotes}
                STRUCTURE: ${hireOrgStructure}. Values: ${hireCulturalValues}.
                SECTIONS: SCALABILITY AUDIT, CAPACITY PLANNING, REPORTING LINES, SUCCESSION PLAN, VISUALIZATIONS.
                ` : `
                GOAL: Talent Analytics and Funnel Optimization. 
                ANALYSIS_REQUEST: ${hireExtraNotes || 'General funnel efficiency and cost-per-hire analysis.'}
                SECTIONS: FUNNEL PERFORMANCE, BUDGET ATTRIBUTION, TURNOVER PREDICTION, DATA VISUALIZATIONS.
                `}
    
                IMPORTANT: The user has requested a specific function: "${finalInput}".
                You must ONLY provide the analysis/output for this specific function. Do not provide a generic overview of other modes.
                Maintain the context of "${currentMode}" but focus exclusively on the requested task.
    
                MANDATORY: Use SECTION N: TITLE format. 
                
                MANDATORY FOR SECTION 5 VISUALIZATIONS: You must provide a JSON block representing the chart data at the very end. Use EXACTLY this structure, substituting the values logically based on the scenario:
                \`\`\`json
                {
                   "candidateDistribution": [
                       { "name": "Strong Match", "value": 45, "color": "#10b981" },
                       { "name": "Average", "value": 35, "color": "#3b82f6" },
                       { "name": "Weak", "value": 20, "color": "#ef4444" }
                   ],
                   "hiringTimeline": [
                       { "stage": "Sourcing", "count": 150 },
                       { "stage": "Screening", "count": 45 },
                       { "stage": "Interviews", "count": 12 },
                       { "stage": "Offers", "count": 2 }
                   ]
                }
                \`\`\`

                ${currentMode === 'Evaluation' ? 'MANDATORY: For Evaluation mode, you MUST include a SCORECARD_JSON_START ... SCORECARD_JSON_END block after Section 2.' : ''}
                MANDATORY: You must respond in English. Absolutely NO HINDI or other languages allowed. Every single word of your response must be in English.
                `;

                const response = await generateChatResponse([...messages, userMsg], finalInput, systemInstruction, hireFileAttachments, 'English', null, null, { agentType: 'AIHIRE' });
                aiReply = response.reply || response;
            }

            const modelMsg = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: aiReply,
                timestamp: Date.now(),
                agentName: 'AIHIRE',
                agentCategory: 'Human Resources'
            };

            setMessages(prev => [...prev, modelMsg]);

            // Clear extra notes after generation if it was a one-time thing?
            // setHireExtraNotes(""); // Optional: keep for user to edit?

            // Parse scorecard
            if (hiringMode === 'Evaluation') {
                try {
                    const scMatch = aiReply.match(/SCORECARD_JSON_START([\s\S]*?)SCORECARD_JSON_END/);
                    if (scMatch) setScorecardData(JSON.parse(scMatch[1].trim()));
                    else setScorecardData(null);
                } catch (e) {
                    console.error('Scorecard parse error', e);
                    setScorecardData(null);
                }
            } else {
                setScorecardData(null);
            }

            setShowResultModal(true);

            // Save session
            let activeSessionId = currentSessionId;
            if (activeSessionId === 'new') {
                const newSession = await chatStorageService.createSession('AIHIRE', `Hire: ${hireRole || hiringMode}`);
                activeSessionId = newSession.sessionId;
                setCurrentSessionId(activeSessionId);
            }
            await chatStorageService.saveMessage(activeSessionId, userMsg);
            await chatStorageService.saveMessage(activeSessionId, modelMsg);

            // Re-load sidebar history after new session is saved
            if (currentSessionId === 'new') {
                loadHistoryList();
            }

        } catch (err) {
            console.error('[AIHIRE ERROR]', err.response?.data || err);
            // Fallback error handling
            const errorDetails = err.response?.data?.error || err.response?.data?.details || err.message || "Failed to process request.";
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: `Error: ${errorDetails}`,
                timestamp: Date.now(),
                agentName: 'AIHIRE'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsProcessing(false);
        }
    };

    // --- RENDER HELPERS ---

    const renderCardContent = (card) => {
        if (card.type === 'charts' && card.chartData) {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {card.chartData.marketShare && (
                        <div className="h-64">
                            <p className="text-[10px] font-bold text-center mb-2 uppercase opacity-60">Distribution</p>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={card.chartData.marketShare} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {card.chartData.marketShare.map((entry, i) => <Cell key={i} fill={entry.color || '#10b981'} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {card.chartData.growthProjection && (
                        <div className="h-64">
                            <p className="text-[10px] font-bold text-center mb-2 uppercase opacity-60">Timeline Progress</p>
                            <ResponsiveContainer>
                                <BarChart data={card.chartData.growthProjection}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="year" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            );
        }

        const safeContent = typeof card.content === 'string'
            ? card.content
            : card.content != null ? JSON.stringify(card.content, null, 2) : '';

        return <div className="text-xs text-subtext leading-relaxed whitespace-pre-wrap font-medium">{safeContent}</div>;
    };

    const renderMessageAsCards = (msg) => {
        if (!msg || msg.role === 'user') return null;
        try {
            // Remove the raw JSON block from displayed content
            const displayContent = msg.content.replace(/SCORECARD_JSON_START[\s\S]*?SCORECARD_JSON_END/g, '').trim();
            let sections = displayContent.split(/SECTION \d+:/).filter(s => s.trim());
            const cards = sections.map((sec, idx) => {
                const firstNewLine = sec.indexOf('\n');
                let title = firstNewLine !== -1 ? sec.substring(0, firstNewLine).trim() : `Insight ${idx + 1}`;
                let content = firstNewLine !== -1 ? sec.substring(firstNewLine).trim() : sec;

                title = title.replace(/\*+/g, '').replace(/[:#]/g, '').trim();
                content = content.replace(/```(json|JSON)?/g, '').replace(/```/g, '').trim();

                let type = 'default';
                let chartData = null;
                if (title.toUpperCase().includes('VISUALIZATIONS') || content.trim().startsWith('{')) {
                    const isVisual = title.toUpperCase().includes('VISUALIZATIONS');
                    type = isVisual ? 'charts' : 'analysis_data';
                    try {
                        const jsonStr = content.match(/\{[\s\S]*\}/)?.[0];
                        if (jsonStr) chartData = JSON.parse(jsonStr);
                    } catch (e) { }
                }
                return { title, content, type, chartData };
            });
            return { cards };
        } catch (err) {
            return { cards: [{ title: 'Result', content: String(msg.content), type: 'default' }] };
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Card */}
                <div className="bg-white rounded-3xl md:rounded-[40px] p-5 md:p-8 border border-border/40 shadow-xl shadow-emerald-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-black text-maintext tracking-tight uppercase">Hire Intelligence</h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">System Operational</span>
                                    </div>
                                    <span className="text-subtext/40 text-[10px] font-bold uppercase tracking-widest">• Talent OS v2.4</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Navigation */}
                        <div className="flex overflow-x-auto scrollbar-none bg-secondary/50 p-1.5 rounded-3xl border border-border/40 max-w-full">
                            {['Strategy', 'Evaluation', 'Offer', 'Planning', 'Analytics'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setHiringMode(mode)}
                                    className={`px-4 md:px-6 py-2 md:py-2.5 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${hiringMode === mode ? 'bg-white text-emerald-600 shadow-md shadow-emerald-500/5 translate-y-[-1px]' : 'text-subtext hover:text-maintext'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Panel: Primary Inputs */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Global Config Card */}
                        <div className="bg-white rounded-3xl md:rounded-[40px] p-5 md:p-8 border border-border/40 shadow-xl shadow-emerald-500/5 space-y-6 md:space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                    <Target className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-maintext uppercase tracking-tight">Role Configuration</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-subtext font-black uppercase tracking-[0.2em] ml-1">Target Role</label>
                                    <input
                                        type="text"
                                        value={hireRole}
                                        onChange={(e) => setHireRole(e.target.value)}
                                        placeholder="e.g. Senior Frontend Engineer"
                                        className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-emerald-500/30 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-subtext font-black uppercase tracking-[0.2em] ml-1">Seniority</label>
                                    <CustomSelect
                                        value={hireSeniority}
                                        onChange={setHireSeniority}
                                        options={['Junior', 'Mid-Level', 'Senior', 'Staff', 'Director', 'C-Suite']}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-subtext font-black uppercase tracking-[0.2em] ml-1">Department</label>
                                    <CustomSelect
                                        value={hireDepartment}
                                        onChange={setHireDepartment}
                                        options={['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Ops', 'HR']}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-subtext font-black uppercase tracking-[0.2em] ml-1">Work Location</label>
                                    <CustomSelect
                                        value={hireLocation}
                                        onChange={setHireLocation}
                                        options={['On-site', 'Remote', 'Hybrid', 'Flexible']}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mode Specific Inputs */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={hiringMode}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                {hiringMode === 'Strategy' && (
                                    <div className="bg-white rounded-3xl md:rounded-[40px] p-5 md:p-8 border border-border/40 shadow-xl shadow-emerald-500/5 space-y-6 md:space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                                <GitGraph className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-black text-maintext uppercase tracking-tight">Sourcing Strategy</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Risk Tolerance</label>
                                                <CustomSelect value={hireRiskTolerance} onChange={setHireRiskTolerance} options={['Conservative', 'Medium', 'Aggressive']} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Sourcing Channel</label>
                                                <CustomSelect value={hireSourcingChannels} onChange={setHireSourcingChannels} options={['Direct Sourcing', 'Referrals', 'Agencies', 'Inbound only']} />
                                            </div>
                                            <div className="col-span-full space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Additional Strategy Notes</label>
                                                <textarea
                                                    value={hireExtraNotes}
                                                    onChange={(e) => setHireExtraNotes(e.target.value)}
                                                    placeholder="e.g. Must have experience with scale, Python/Go expert..."
                                                    className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[32px] px-6 py-5 text-sm text-maintext focus:outline-none focus:border-blue-500/30 transition-all font-medium h-32"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {hiringMode === 'Evaluation' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-white rounded-3xl md:rounded-[40px] p-5 md:p-8 border border-border/40 shadow-xl shadow-emerald-500/5 space-y-6 md:space-y-8">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                                        <Users className="w-6 h-6" />
                                                    </div>
                                                    <h3 className="text-lg font-black text-maintext uppercase">Candidates</h3>
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

                                        <div className="bg-white rounded-3xl md:rounded-[40px] p-5 md:p-8 border border-border/40 shadow-xl shadow-emerald-500/5 space-y-6 md:space-y-8">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl">
                                                    <ShieldCheck className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-lg font-black text-maintext uppercase">Bias & Quality</h3>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Job Description</label>
                                                    <textarea
                                                        value={hireJobDescription}
                                                        onChange={(e) => setHireJobDescription(e.target.value)}
                                                        placeholder="Paste JD for bias scan..."
                                                        className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[32px] px-5 py-4 text-[13px] text-maintext focus:outline-none focus:border-pink-500/30 h-32 resize-none"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-3xl border border-border/20">
                                                    <div className="flex items-center gap-3">
                                                        <Bot className="w-5 h-5 text-primary" />
                                                        <span className="text-xs font-bold text-maintext uppercase tracking-widest">Bias Detection</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setHireBiasCheck(!hireBiasCheck)}
                                                        className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${hireBiasCheck ? 'bg-emerald-500' : 'bg-subtext/20'}`}
                                                    >
                                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${hireBiasCheck ? 'translate-x-6' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {hiringMode === 'Offer' && (
                                    <div className="bg-white rounded-3xl md:rounded-[40px] p-5 md:p-8 border border-border/40 shadow-xl shadow-emerald-500/5 space-y-6 md:space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                                                <IndianRupee className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-lg font-black text-maintext uppercase">Compensation Design</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Candidate Name</label>
                                                <input type="text" value={hireCandidateName} onChange={(e) => setHireCandidateName(e.target.value)} placeholder="e.g. Jane Doe" className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-red-500/30 font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Hiring Manager</label>
                                                <input type="text" value={hireOfferManager} onChange={(e) => setHireOfferManager(e.target.value)} placeholder="e.g. Sarah Chen (CEO)" className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-red-500/30 font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Base Salary (Annual)</label>
                                                <input type="text" value={hireOfferSalary} onChange={(e) => setHireOfferSalary(e.target.value)} placeholder="e.g. 25,00,000" className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-red-500/30 font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Equity %</label>
                                                <input type="text" value={hireEquityPercent} onChange={(e) => setHireEquityPercent(e.target.value)} placeholder="e.g. 0.1%" className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-red-500/30 font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Expected Start Date</label>
                                                <input type="text" value={hireOfferStartDate} onChange={(e) => setHireOfferStartDate(e.target.value)} placeholder="e.g. Oct 1, 2024" className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-red-500/30 font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Candidate Leverage</label>
                                                <CustomSelect value={hireCandidateLeverage} onChange={setHireCandidateLeverage} options={['Low', 'Medium', 'High', 'Multiple Offers']} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Competitor Benchmark</label>
                                                <input type="text" value={hireCompetitorSalary} onChange={(e) => setHireCompetitorSalary(e.target.value)} placeholder="e.g. 28,00,000" className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-red-500/30 font-bold" />
                                            </div>
                                            <div className="col-span-full space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Perks & Benefits</label>
                                                <textarea value={hireOfferPerks} onChange={(e) => setHireOfferPerks(e.target.value)} placeholder="e.g. Remote setup, Health insurance, Learning budget..." className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[32px] px-6 py-5 text-sm text-maintext focus:outline-none focus:border-red-500/30 h-24 resize-none font-medium" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {hiringMode === 'Planning' && (
                                    <div className="bg-white rounded-3xl md:rounded-[40px] p-5 md:p-8 border border-border/40 shadow-xl shadow-emerald-500/5 space-y-6 md:space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                                <Building2 className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-lg font-black text-maintext uppercase">Org Planning</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Org Structure</label>
                                                <CustomSelect value={hireOrgStructure} onChange={setHireOrgStructure} options={['Flat', 'Matrix', 'Functional', 'Divisional']} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Cultural Values</label>
                                                <input type="text" value={hireCulturalValues} onChange={(e) => setHireCulturalValues(e.target.value)} className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-3xl px-5 py-4 text-sm text-maintext focus:outline-none focus:border-purple-500/30 font-bold" />
                                            </div>
                                            <div className="col-span-full space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Headcount Context</label>
                                                <textarea value={hireExtraNotes} onChange={(e) => setHireExtraNotes(e.target.value)} placeholder="Describe your expansion goals, team gaps, or reporting structure needs..." className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[32px] px-6 py-5 text-sm text-maintext focus:outline-none focus:border-purple-500/30 h-32 resize-none font-medium" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {hiringMode === 'Analytics' && (
                                    <div className="bg-white rounded-3xl md:rounded-[40px] p-5 md:p-8 border border-border/40 shadow-xl shadow-emerald-500/5 space-y-6 md:space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                                <BarChart3 className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-lg font-black text-maintext uppercase">Talent Analytics</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-xs text-subtext font-medium leading-relaxed">
                                                Analyze your hiring funnel, cost-per-hire, and time-to-fill metrics. AIHIRE will simulate performance based on your current inputs.
                                            </p>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-subtext font-black uppercase tracking-widest ml-1">Analytics Focus / Custom Query</label>
                                                <textarea value={hireExtraNotes} onChange={(e) => setHireExtraNotes(e.target.value)} placeholder="e.g. Audit our funnel conversion rate, or predict turnover for this role..." className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[32px] px-6 py-5 text-sm text-maintext focus:outline-none focus:border-amber-500/30 h-40 resize-none font-medium" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Panel: Advanced Parameters */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-[#1e293b] rounded-3xl md:rounded-[40px] p-5 md:p-8 border border-white/5 shadow-2xl space-y-6 md:space-y-8 text-white">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 text-white rounded-2xl">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Market Logic</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[11px] font-black uppercase tracking-widest opacity-60">Quality Target</label>
                                        <span className="text-emerald-400 font-bold">{hireTradeoff}%</span>
                                    </div>
                                    <div className="relative h-2 bg-white/10 rounded-full">
                                        <motion.div
                                            className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                                            animate={{ width: `${hireTradeoff}%` }}
                                        />
                                        <input
                                            type="range" value={hireTradeoff} onChange={(e) => setHireTradeoff(e.target.value)}
                                            className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] font-bold uppercase opacity-40">
                                        <span>Speed Focus</span>
                                        <span>Elite Quality</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest opacity-60">Revenue Impact</label>
                                    <CustomSelect
                                        value={hireBusinessStage}
                                        onChange={setHireBusinessStage}
                                        options={['Early Startup', 'Growth Phase', 'Late Stage', 'Enterprise Redeployment']}
                                        className="!bg-white/5 !border-white/10 !text-white"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest opacity-60">Annual Budget (₹)</label>
                                    <div className="bg-white/5 border border-white/10 rounded-3xl px-5 py-4 flex items-center justify-between">
                                        <span className="text-sm font-bold">₹{Number(hireBudget).toLocaleString()}</span>
                                        <IndianRupee className="w-4 h-4 opacity-40" />
                                    </div>
                                    <input
                                        type="range" min="300000" max="20000000" step="100000"
                                        value={hireBudget} onChange={(e) => setHireBudget(Number(e.target.value))}
                                        className="w-full accent-blue-500 opacity-60"
                                    />
                                </div>

                                <div className="pt-4 space-y-3">
                                    {hiringMode === 'Strategy' && (
                                        <div className="grid grid-cols-1 gap-3">
                                            <button onClick={() => handleAction(null, "Run a comprehensive Readiness Score and Gap Analysis.")} disabled={isProcessing} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-[24px] font-black uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[11px]"><Target className="w-4 h-4" /> Readiness Score</button>
                                            <button onClick={() => handleAction(null, "Generate a Job Description based on the current context.")} disabled={isProcessing} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[11px]"><FileText className="w-4 h-4" /> Generate Job Description</button>
                                            <button onClick={() => handleAction(null, "Conduct a detailed Risk Audit for this role.")} disabled={isProcessing} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-[24px] font-black uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[11px]"><ShieldCheck className="w-4 h-4" /> Risk Audit</button>
                                        </div>
                                    )}
                                    {hiringMode === 'Evaluation' && (
                                        <div className="grid grid-cols-1 gap-3">
                                            <button onClick={() => handleAction(null, "Evaluate and rank these candidates against the Scorecard.")} disabled={isProcessing} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[11px]"><Users className="w-4 h-4" /> AI Scoring</button>
                                            <button onClick={() => handleAction(null, "Run a Bias and Inclusion check on the JD and profiles.")} disabled={isProcessing} className="w-full py-4 bg-pink-600/20 hover:bg-pink-600/30 text-pink-100 border border-pink-500/20 rounded-[24px] font-black uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[11px]"><Bot className="w-4 h-4" /> Bias Scan</button>
                                            <button onClick={() => handleAction(null, "Generate a custom Interview Framework.")} disabled={isProcessing} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-[24px] font-black uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[11px]"><MessageSquare className="w-4 h-4" /> Interview Guide</button>
                                        </div>
                                    )}
                                    {hiringMode === 'Offer' && (
                                        <div className="grid grid-cols-1 gap-3">
                                            {/* Template Selector */}
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-3">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-60 block">Select Template</label>
                                                    <select
                                                        className="w-full bg-[#0f172a] text-white text-xs p-2 rounded-xl border border-white/10 outline-none focus:border-blue-500/50"
                                                        onChange={(e) => {
                                                            const selected = e.target.value;
                                                            if (selected && OFFER_TEMPLATES[selected]) {
                                                                setHireExtraNotes(OFFER_TEMPLATES[selected]);
                                                            } else {
                                                                setHireExtraNotes("");
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Custom / Blank</option>
                                                        <option value="Standard">Standard Professional</option>
                                                        <option value="Startup">High-Growth Startup</option>
                                                        <option value="Executive">Executive Leadership</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-60 block">Editor (Auto-Reads content)</label>
                                                    <textarea
                                                        value={hireExtraNotes}
                                                        onChange={(e) => setHireExtraNotes(e.target.value)}
                                                        placeholder="Select a template above or paste your own..."
                                                        className="w-full bg-transparent text-xs text-white placeholder:text-white/20 outline-none resize-none h-80 custom-scrollbar font-mono leading-relaxed"
                                                    />

                                                    <div className="relative group pt-2">
                                                        <input
                                                            type="file"
                                                            accept="application/pdf, image/jpeg, image/png, image/webp"
                                                            onChange={handleTemplateUpload}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <button className={`w-full py-2 border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${uploadedFileName ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-[#94a3b8] group-hover:bg-white/10 group-hover:text-white'}`}>
                                                            {uploadedFileName ? (
                                                                <><CheckCircle2 className="w-3 h-3" /> {uploadedFileName}</>
                                                            ) : (
                                                                <><Upload className="w-3 h-3" /> Upload Template (PDF/Image)</>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleAction(null, "Predict acceptance probability and suggest package optimizations.")} disabled={isProcessing} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[11px]"><TrendingUp className="w-4 h-4" /> Acceptance Odds</button>
                                            <button onClick={() => handleAction(null, "Generate a formal offer letter for the Candidate.")} disabled={isProcessing} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[11px]"><FileText className="w-4 h-4" /> Generate Offer Letter</button>
                                            <button onClick={() => handleAction(null, "Build a direct negotiation strategy.")} disabled={isProcessing} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-[24px] font-black uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[11px]"><Target className="w-4 h-4" /> Closing Script</button>
                                        </div>
                                    )}
                                    {hiringMode === 'Planning' && (
                                        <button onClick={() => handleAction(null, "Run a Scalability and Capacity Audit.")} disabled={isProcessing} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[11px]"><Activity className="w-5 h-5" /> Capacity Plan</button>
                                    )}
                                    {hiringMode === 'Analytics' && (
                                        <button onClick={() => handleAction(null, "Generate a Funnel Performance and Cost-per-hire report.")} disabled={isProcessing} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[11px]"><BarChart3 className="w-5 h-5" /> Funnel Audit</button>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleAction}
                                        disabled={isProcessing}
                                        className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        <Zap className="w-5 h-5 fill-current" />
                                        Execute {hiringMode}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tips or Stats */}
                        <div className="bg-emerald-600 rounded-3xl md:rounded-[40px] p-6 md:p-8 text-white space-y-4 shadow-xl shadow-emerald-600/20">
                            <TrendingUp className="w-8 h-8 opacity-60" />
                            <h4 className="text-lg font-black uppercase leading-tight">AIHIRE Advantage</h4>
                            <p className="text-xs opacity-80 leading-relaxed font-medium">
                                Companies using AIHIRE reduce time-to-hire by <span className="font-bold underline">64%</span> while increasing talent quality retention.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AIHIRE Loading Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex flex-col items-center gap-8">
                            <div className="relative w-32 h-32">
                                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
                                <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-teal-400 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap className="w-10 h-10 text-emerald-400 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center space-y-3">
                                <h3 className="text-white text-2xl font-black uppercase tracking-widest italic">Calculating {hiringMode}</h3>
                                <div className="flex items-center gap-2 justify-center">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                                <p className="text-emerald-400/60 text-[10px] font-bold uppercase tracking-[0.4em]">Proprietary Talent Logic Engine</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Result Modal */}
            <AnimatePresence>
                {showResultModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 lg:p-12 overflow-hidden" onClick={() => setShowResultModal(false)}>
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-[#f8fafc] flex flex-col h-full w-full max-w-6xl rounded-3xl md:rounded-[48px] overflow-hidden shadow-2xl border border-white/20">

                            {/* Modal Header */}
                            <div className="p-5 md:p-8 border-b border-border/40 bg-white flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-emerald-500 rounded-3xl shadow-lg shadow-emerald-500/20">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-black text-maintext tracking-tight uppercase italic">{hiringMode} Intelligence</h3>
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em] opacity-80">Autonomous Talent Strategy Outcome</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowResultModal(false)} className="p-3 hover:bg-secondary rounded-full transition-all group active:scale-95">
                                    <X className="w-8 h-8 text-subtext group-hover:text-red-500 transition-colors" />
                                </button>
                            </div>

                             <div className="flex-1 overflow-y-auto p-5 md:p-10 custom-scrollbar space-y-8 md:space-y-12">

                                {/* Scorecard — Evaluation only */}
                                {hiringMode === 'Evaluation' && scorecardData?.candidates?.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-emerald-500 text-white rounded-xl"><Trophy className="w-4 h-4" /></div>
                                            <h4 className="text-xs font-black text-maintext uppercase tracking-[0.3em]">Talent Scorecard</h4>
                                            <div className="h-px flex-1 bg-border/40" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {scorecardData.candidates.map((c, i) => {
                                                const score = Number(c.overall) || 0;
                                                const vStyle = c.verdict === 'HIRE' ? 'bg-emerald-500 ring-[#10b981]' : c.verdict === 'REJECT' ? 'bg-red-500 ring-[#ef4444]' : 'bg-amber-400 ring-[#f59e0b]';
                                                return (
                                                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                                        className="bg-white rounded-3xl md:rounded-[40px] border border-border/40 p-5 md:p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                                                        <div className="relative">
                                                            <div className="flex justify-between items-start mb-6">
                                                                <div>
                                                                    <p className="text-lg font-black text-maintext">{c.name}</p>
                                                                    <p className="text-[9px] font-black text-subtext uppercase tracking-widest">Candidate #{i + 1}</p>
                                                                </div>
                                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest ${vStyle.split(' ')[0]}`}>{c.verdict}</span>
                                                            </div>
                                                            <div className="flex items-center gap-6 mb-8">
                                                                <div className="relative w-24 h-24">
                                                                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                                                        <circle cx="50" cy="50" r="45" fill="none" stroke={vStyle.split(' ')[1].replace('ring-[', '').replace(']', '')} strokeWidth="8"
                                                                            strokeDasharray={`${(score / 100) * 282.7} 282.7`} strokeLinecap="round" />
                                                                    </svg>
                                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                        <span className="text-2xl font-black text-maintext">{score}</span>
                                                                        <span className="text-[9px] font-bold text-subtext">MATCH</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 space-y-3">
                                                                    {Object.entries(c.criteria || {}).slice(0, 3).map(([key, val]) => (
                                                                        <div key={key}>
                                                                            <div className="flex justify-between mb-1">
                                                                                <span className="text-[8px] font-bold text-subtext uppercase truncate max-w-[60px]">{key}</span>
                                                                                <span className="text-[9px] font-black text-maintext">{val}/10</span>
                                                                            </div>
                                                                            <div className="h-1 bg-secondary rounded-full overflow-hidden">
                                                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${val * 10}%` }} />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                                                                <div>
                                                                    <p className="text-[9px] font-black text-emerald-600 uppercase mb-2">Strengths</p>
                                                                    {c.strengths?.map((s, j) => <p key={j} className="text-[10px] text-maintext leading-tight mb-1">• {s}</p>)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-black text-red-500 uppercase mb-2">Gaps</p>
                                                                    {c.gaps?.map((g, j) => <p key={j} className="text-[10px] text-maintext leading-tight mb-1">• {g}</p>)}
                                                                </div>
                                                            </div>
                                                            {score > 65 && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setHiringMode('Offer');
                                                                        setShowResultModal(false);
                                                                        handleAction(null, `Generate a formal offer letter for candidate "${c.name}" for the role of ${hireRole || 'the specified position'}. Their match score is ${score}%. Structure it professionally and include placeholders for compensation details if not provided.`, 'Offer');
                                                                    }}
                                                                    className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                                                >
                                                                    <FileText className="w-4 h-4" /> Generate Offer Letter
                                                                </button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Main Analysis Cards */}
                                <div className="space-y-12">
                                    {(() => {
                                        const lastMsg = messages[messages.length - 1];

                                        if (isEditingResult && hiringMode === 'Offer') {
                                            return (
                                                <div className="bg-white rounded-[40px] p-10 border border-blue-500/30 shadow-sm relative overflow-hidden">
                                                    <h3 className="text-xl font-black text-maintext tracking-tight uppercase italic mb-8">Edit Offer Letter</h3>
                                                    <textarea
                                                        value={editedReply !== "" ? editedReply : lastMsg?.content}
                                                        onChange={(e) => setEditedReply(e.target.value)}
                                                        className="w-full h-[600px] p-6 bg-white border border-border/50 rounded-3xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y shadow-inner whitespace-pre-wrap leading-relaxed text-maintext focus:outline-none custom-scrollbar"
                                                    />
                                                </div>
                                            );
                                        }

                                        const result = renderMessageAsCards(lastMsg);
                                        return result?.cards?.map((card, idx) => (
                                            <motion.div key={idx} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + idx * 0.1 }}
                                                className="bg-white rounded-3xl md:rounded-[40px] p-5 md:p-10 border border-border/40 shadow-sm relative overflow-hidden group">
                                                <div className="flex items-center gap-5 mb-8">
                                                    <div className="p-3 bg-secondary/50 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                                                        <SearchIcon className="w-6 h-6" />
                                                    </div>
                                                    <h3 className="text-xl font-black text-maintext tracking-tight uppercase italic">{card.title}</h3>
                                                </div>
                                                <div className="relative">
                                                    {renderCardContent(card)}
                                                </div>
                                            </motion.div>
                                        ));
                                    })()}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-border/40 bg-white flex items-center justify-center gap-6 shrink-0">
                                <button onClick={() => setShowResultModal(false)} className="px-10 py-4 bg-secondary text-maintext rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-border transition-all">Close View</button>
                                <button onClick={() => { setShowResultModal(false); navigate(`/dashboard/chat/${currentSessionId}`); }} className="px-10 py-4 bg-emerald-600 text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Continue in Chat</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* History Sidebar Panel */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
                            onClick={() => setIsHistoryOpen(false)}
                        />
                        {/* Slide Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-border/40 shadow-2xl z-[101] flex flex-col"
                        >
                            <div className="p-6 border-b border-border/40 flex items-center justify-between bg-secondary/30">
                                <h2 className="text-xs font-black text-maintext uppercase tracking-widest">AIHIRE Sessions</h2>
                                <button onClick={() => setIsHistoryOpen(false)} className="p-2 text-subtext hover:bg-white rounded-xl transition-all"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                <button
                                    onClick={() => {
                                        setCurrentSessionId('new');
                                        setMessages([]);
                                        setIsHistoryOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-blue-500/50 text-blue-600 hover:bg-blue-50/50 transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> New Session
                                </button>

                                {historySessions.length === 0 ? (
                                    <p className="text-xs text-subtext text-center pt-8">No previous sessions found.</p>
                                ) : (
                                    historySessions.map(session => (
                                        <div
                                            key={session.sessionId}
                                            onClick={() => {
                                                loadSession(session.sessionId);
                                                setIsHistoryOpen(false);
                                            }}
                                            className="p-4 rounded-2xl border border-border/40 hover:border-blue-500/50 hover:bg-blue-50/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-blue-500/10 transition-colors" />
                                            <h3 className="text-[11px] font-black text-maintext truncate group-hover:text-blue-600 transition-colors uppercase tracking-wider relative z-10">{session.title || 'Hire Strategy'}</h3>
                                            <p className="text-[9px] text-subtext mt-1.5 font-bold uppercase relative z-10">{new Date(session.lastModified).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}