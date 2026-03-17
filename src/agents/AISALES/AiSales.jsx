import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
    Users, Target, TrendingUp, Mail, DollarSign, MessageSquare, Briefcase, ChevronDown, CheckCircle2, History, X, Plus, Sparkles, Building2, UserCircle2, Zap, BrainCircuit, Globe, Check, ShieldAlert, Cpu, Settings2, Search, Phone, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { generateChatResponse, performWebSearch } from '../../services/aivaService';
import { chatStorageService } from '../../services/chatStorageService';

export default function AiSales() {
    const navigate = useNavigate();
    const { sessionId } = useParams();

    const [salesMode, setSalesMode] = useState('LEAD GEN');
    const [messages, setMessages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(sessionId || 'new');

    const [strategyContext, setStrategyContext] = useState({
        companyUrl: '',
        product: '',
        usp: '',
        icp: '',
        contact: '',
        objection: '',
        competitor: '',
        regions: '',
        personality: 'The Consultative',
        // New mode-specific fields
        outreachChannel: 'Email',
        pProspectName: '',
        painPoints: '',
        dealValue: '',
        decisionMaker: '',
        crmStatus: 'New Lead',
        messagingPlatform: 'LinkedIn',
        leads: [] // New structured leads array
    });

    const [historySessions, setHistorySessions] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const [isFetching, setIsFetching] = useState(false);
    const [fetchLogs, setFetchLogs] = useState([]);

    useEffect(() => {
        if (sessionId && sessionId !== 'new') {
            loadSession(sessionId);
        }
        loadHistoryList();
    }, [sessionId]);

    const loadHistoryList = async () => {
        try {
            const sessions = await chatStorageService.getSessions('AISALES');
            setHistorySessions(sessions);
        } catch (err) {
            console.error('Failed to load history', err);
        }
    };

    const loadSession = async (sid) => {
        try {
            const history = await chatStorageService.getHistory(sid);
            if (history) setMessages(history);
            setCurrentSessionId(sid);
        } catch (err) {
            console.error('Load session error', err);
        }
    };

    const calculateScore = () => {
        let score = 0;
        if (strategyContext.companyUrl.length > 3) score += 20;
        if (strategyContext.product.length > 2) score += 15;
        if (strategyContext.usp.length > 5) score += 15;
        if (strategyContext.icp.length > 5) score += 20;
        if (strategyContext.objection.length > 5) score += 15;
        if (strategyContext.competitor.length > 2) score += 15;
        return Math.min(score, 100);
    };

    const handleFetchIntelligence = async () => {
        if (!strategyContext.companyUrl) return;
        setIsFetching(true);
        setFetchLogs([]);

        try {
            setFetchLogs(prev => [...prev, `[SYSTEM]: Initiating web search for ${strategyContext.companyUrl}...`]);
            
            // 1. Perform Web Search
            const searchQuery = `What does ${strategyContext.companyUrl} do? products, services, USP, target audience, competitors`;
            const searchResults = await performWebSearch(searchQuery);
            
            setFetchLogs(prev => [...prev, `[SYSTEM]: Analyzing market signals and web data...`]);

            // 2. Use AI to extract structured info
            const extractionPrompt = `
            Analyze the following search results for the company "${strategyContext.companyUrl}" and extract key sales parameters.
            
            SEARCH RESULTS:
            ${JSON.stringify(searchResults.results || searchResults)}
            
            MANDATORY: You must respond with a JSON object ONLY. No other text.
            JSON FORMAT:
            {
                "product": "Primary product or service description",
                "usp": "Unique Selling Proposition or key benefit",
                "icp": "Ideal Customer Profile / Target Audience",
                "competitor": "Main competitor name",
                "objection": "Common sales objection for this industry",
                "regions": "Top 3 countries or regions where this company operates"
            }
            `;

            const aiResponse = await generateChatResponse([], extractionPrompt, "You are a professional sales researcher. Extract data into raw JSON format.", [], 'English', null, null, { agentType: 'AISALES' });
            
            let extractedData;
            try {
                // Try to find JSON in the response
                const jsonMatch = aiResponse.reply.match(/\{[\s\S]*\}/);
                extractedData = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse.reply);
            } catch (pErr) {
                console.error("JSON Parse Error", pErr);
                throw new Error("Failed to parse extracted intelligence.");
            }

            setFetchLogs(prev => [...prev, `[SYSTEM]: Information synthesized. Updating blueprint...`]);

            // 3. Update State
            setStrategyContext(prev => ({
                ...prev,
                product: extractedData.product || prev.product,
                usp: extractedData.usp || prev.usp,
                icp: extractedData.icp || prev.icp,
                competitor: extractedData.competitor || prev.competitor,
                objection: extractedData.objection || prev.objection,
                regions: extractedData.regions || prev.regions
            }));

            await new Promise(r => setTimeout(r, 800));
            setFetchLogs(prev => [...prev, `[SYSTEM]: Fetch complete. Strategy optimized.`]);

        } catch (err) {
            console.error('[FETCH ERROR]', err);
            setFetchLogs(prev => [...prev, `[ERROR]: ${err.message || 'Intelligence fetch failed.'}`]);
        } finally {
            setTimeout(() => setIsFetching(false), 2000);
        }
    };

    const handleGenerateLeads = async () => {
        if (!strategyContext.companyUrl || !strategyContext.regions) {
            setFetchLogs(prev => [...prev, `[ERROR]: Please provide Company URL and Target Regions.`]);
            return;
        }

        setIsFetching(true);
        setFetchLogs([]);

        try {
            setFetchLogs(prev => [...prev, `[SYSTEM]: Initiating Lead Discovery Mission for ${strategyContext.regions}...`]);
            
            const leadQuery = `List of 10 real companies in ${strategyContext.regions} that are potential B2B customers for a platform like: ${strategyContext.product}. Specifically look for their official website URLs.`;
            const searchResults = await performWebSearch(leadQuery);
            
            setFetchLogs(prev => [...prev, `[SYSTEM]: Analyzing regional market signals...`]);

            const generationPrompt = `
            Based on the real-time research below, identify 5 VALID high-potential B2B leads for "${strategyContext.companyUrl}".
            
            OUR PRODUCT/USP:
            ${strategyContext.product} | ${strategyContext.usp}
            
            SEARCH RESULTS:
            ${JSON.stringify(searchResults.results || searchResults)}
            
            MANDATORY: 
            1. You MUST find and provide the REAL OFFICIAL WEBSITE URL for each lead. 
            2. Return a JSON array of objects ONLY.
            
            FORMAT:
            [{
                "companyName": "Name",
                "website": "Hand-verified URL from search results",
                "relevanceScore": 0-100,
                "reasoning": "Why they are a good fit",
                "decisionMaker": "Ideal Role to contact",
                "painPoint": "Specific problem our product solves for them"
            }]
            `;

            const aiResponse = await generateChatResponse([], generationPrompt, "You are a lead generation engine. Return raw JSON array only.", [], 'English', null, null, { agentType: 'AISALES' });
            
            let extractedLeads = [];
            try {
                const jsonMatch = aiResponse.reply.match(/\[[\s\S]*\]/);
                extractedLeads = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse.reply);
            } catch (err) {
                console.error("Lead JSON parse error", err);
                throw new Error("Failed to parse lead data.");
            }

            setStrategyContext(prev => ({
                ...prev,
                leads: extractedLeads
            }));

            setFetchLogs(prev => [...prev, `[SYSTEM]: Found ${extractedLeads.length} high-potential regional leads.`]);

        } catch (err) {
            console.error('[LEAD GEN ERROR]', err);
            setFetchLogs(prev => [...prev, `[ERROR]: ${err.message || 'Lead generation failed.'}`]);
        } finally {
            setTimeout(() => setIsFetching(false), 2000);
        }
    };

    const handleTransitionToOutreach = (lead) => {
        setSalesMode('OUTREACH');
        setStrategyContext(prev => ({
            ...prev,
            pProspectName: `${lead.companyName} (${lead.decisionMaker})`,
            painPoints: lead.painPoint || lead.reasoning,
            companyUrl: lead.website || lead.companyName
        }));
        
        const systemMsg = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `### 🎯 Lead Selected: ${lead.companyName}\n\nI have switched to **Outreach Mode** and pre-filled the target details for you. Ready to architect the perfect opening sequence?`
        };
        setMessages([systemMsg]);
    };

    const handleAction = async (e) => {
        if (e) e.preventDefault();

        const score = calculateScore();
        if (score < 40) return;

        if (isProcessing) return;

        setIsProcessing(true);
        try {
            let finalInput = `Execute a ${salesMode} strategy based on the configured blueprint.`;

            const userMsg = {
                id: Date.now().toString(),
                role: 'user',
                content: finalInput,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, userMsg]);

            let modeSpecificContext = "";
            if (salesMode === 'OUTREACH') {
                modeSpecificContext = `Target Prospect: ${strategyContext.pProspectName}\nOutreach Channel: ${strategyContext.outreachChannel}\nKey Pain Points: ${strategyContext.painPoints}`;
            } else if (salesMode === 'PITCHING') {
                modeSpecificContext = `Key Pain Points: ${strategyContext.painPoints}\nWinning Angle: ${strategyContext.usp}`;
            } else if (salesMode === 'CLOSING') {
                modeSpecificContext = `Deal Value: ${strategyContext.dealValue}\nDecision Maker: ${strategyContext.decisionMaker}\nFinal Barrier: ${strategyContext.objection}`;
            } else if (salesMode === 'CRM') {
                modeSpecificContext = `Current Status: ${strategyContext.crmStatus}`;
            } else if (salesMode === 'MESSAGING') {
                modeSpecificContext = `Platform: ${strategyContext.messagingPlatform}\nSequence Tone: ${strategyContext.painPoints}`;
            }

            const systemInstruction = `
            YOU ARE AN AGENTIC SALES COMMAND CENTER (AISALES).
            CURRENT MODE: ${salesMode}
            
            STRATEGY CONTEXT:
            Target URL / Company: ${strategyContext.companyUrl}
            Product/Service: ${strategyContext.product}
            Unique Selling Proposition (USP): ${strategyContext.usp}
            Ideal Customer Profile (ICP): ${strategyContext.icp}
            Primary Objection: ${strategyContext.objection}
            Main Competitor: ${strategyContext.competitor}
            Region: ${strategyContext.regions}
            
            MODE-SPECIFIC DETAILS:
            ${modeSpecificContext}
            
            PERSONALITY ARCHETYPE: ${strategyContext.personality}
            - If The Challenger: Be direct, data-driven, and provocative. Use strong verbs.
            - If The Consultative: Be insight-led, question-based, and adopt a soft-sell tone.
            - If The Relationship Builder: Prioritize rapport-building, trust, and warm openings.

            INSTRUCTIONS:
            Execute the ${salesMode} sequence perfectly based on the strategy context above. Provide tactical outputs (e.g., subject lines, scripts, rebuttal snippets, CRM sync notes) that reflect the chosen personality ${strategyContext.personality}. Organize into clear Markdown sections.
            MANDATORY: You must respond in English ONLY.
            `;

            const response = await generateChatResponse([...messages, userMsg], finalInput, systemInstruction, [], 'English', null, null, { agentType: 'AISALES' });
            let aiReply = response.reply || response;

            const modelMsg = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: aiReply,
                timestamp: Date.now(),
                agentName: 'AISALES',
                agentCategory: 'Sales'
            };

            setMessages(prev => [...prev, modelMsg]);

            let activeSessionId = currentSessionId;
            if (activeSessionId === 'new') {
                activeSessionId = await chatStorageService.createSession();
                setCurrentSessionId(activeSessionId);
            }
            await chatStorageService.saveMessage(activeSessionId, userMsg, `Sales: ${salesMode}`);
            await chatStorageService.saveMessage(activeSessionId, modelMsg, `Sales: ${salesMode}`);

            if (currentSessionId === 'new') {
                loadHistoryList();
            }

        } catch (err) {
            console.error('[AISALES ERROR]', err);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: `Error: ${err.message || 'Failed to process request.'}`,
                timestamp: Date.now(),
                agentName: 'AISALES'
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const score = calculateScore();
    let scoreColor = '#ef4444';
    let scoreLabel = 'LOW POTENTIAL';
    if (score >= 40 && score < 75) {
        scoreColor = '#f59e0b';
        scoreLabel = 'MEDIUM POTENTIAL';
    } else if (score >= 75) {
        scoreColor = '#10b981';
        scoreLabel = 'HIGH POTENTIAL';
    }

    const radius = 125;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const navItems = [
        { id: 'LEAD GEN', label: 'Lead Gen', icon: Target },
        { id: 'OUTREACH', label: 'Outreach', icon: Mail },
        { id: 'PITCHING', label: 'Pitching', icon: TrendingUp },
        { id: 'CLOSING', label: 'Closing', icon: CheckCircle2 },
        { id: 'CRM', label: 'CRM', icon: Users },
        { id: 'MESSAGING', label: 'Messaging', icon: MessageSquare }
    ];

    const renderMessageContent = () => {
        if (messages.length === 0) {
            return (
                <div className="space-y-6 text-xs font-bold text-slate-400 leading-relaxed italic">
                    <div className="border-b border-white/10 pb-4 mb-4">
                        <p className="text-white/80 not-italic uppercase tracking-widest text-[9px] mb-2">Subject Draft:</p>
                        <p className="text-blue-400 not-italic">Strategic Outreach Initiation for {strategyContext.companyUrl || '(Target)'}</p>
                    </div>
                    <p>Based on the provided intelligence, our agent will execute a {salesMode} sequence optimized for the {strategyContext.personality} archetype.</p>
                    <p className="opacity-60">Ready to synthesize market signals and generate high-conversion outreach assets once parameters are finalized.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6 w-full max-h-[450px] overflow-y-auto no-scrollbar pr-2">
                {messages.map((msg, i) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div className={`max-w-[90%] p-6 rounded-[30px] ${msg.role === 'user' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-800 border border-slate-700 text-slate-300 shadow-sm'}`}>
                            <div className="text-xs font-bold leading-relaxed prose prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-12 font-sans flex flex-col items-center relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="w-full max-w-screen-2xl relative z-10 flex flex-col gap-8">
                {/* Header Navigation */}
                <div className="flex items-center justify-between gap-8 py-5 px-10 bg-white border border-slate-200 rounded-[35px] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-[15px] flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-[#0f172a] tracking-tight uppercase leading-none mb-1">Sales Intelligence</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">+ System Operational</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setSalesMode(item.id)}
                                className={`relative py-2 text-[10px] font-black uppercase tracking-widest transition-all ${salesMode === item.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {item.label}
                                {salesMode === item.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsHistoryOpen(true)}
                            className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-[18px] text-[10px] font-black uppercase tracking-widest text-[#0f172a] hover:bg-slate-50 transition-all"
                        >
                            <History size={14} className="text-slate-400" />
                            History
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
                    <div className="lg:col-span-7 flex flex-col gap-10">
                        {/* Dynamic Input Modules */}
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={salesMode}
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="flex flex-col gap-10 relative"
                            >
                                {/* Intelligence Scraper Overlay */}
                                <AnimatePresence>
                                    {isFetching && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="absolute -right-4 top-24 w-80 bg-slate-900/95 backdrop-blur-2xl rounded-[40px] shadow-2xl p-8 border border-white/10 z-[100] font-mono text-[10px] text-blue-400 leading-relaxed overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20" />
                                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                                                <span className="uppercase tracking-[0.4em] font-black opacity-60">Scraping Logic...</span>
                                            </div>
                                            <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                                                {fetchLogs.map((log, i) => (
                                                    <p key={i} className={i === fetchLogs.length - 1 ? 'text-blue-100' : 'opacity-40'}>{`>> ${log}`}</p>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Module 1: Campaign Configuration (REUSED FOR MOST MODES) */}
                                {(['LEAD GEN', 'OUTREACH', 'PITCHING', 'MESSAGING'].includes(salesMode)) && (
                                    <div className="bg-white rounded-[35px] p-10 border border-slate-200 shadow-sm transition-all group">
                                        <h2 className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest mb-8">Campaign Configuration</h2>
                                        
                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                                    <Globe className="w-4 h-4 text-slate-400 mr-4" />
                                                    <input type="text" value={strategyContext.companyUrl} onChange={(e) => setStrategyContext({ ...strategyContext, companyUrl: e.target.value })} placeholder="Company URL / LinkedIn" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                                </div>
                                                <button onClick={handleFetchIntelligence} className="px-6 py-4 rounded-[18px] bg-white border border-blue-200 text-blue-600 font-bold text-[10px] uppercase tracking-wider hover:bg-blue-50 transition-all whitespace-nowrap">Fetch intelligence</button>
                                            </div>

                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                                <Briefcase className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.product} onChange={(e) => setStrategyContext({ ...strategyContext, product: e.target.value })} placeholder="Product/Solution Name" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                                    <Zap className="w-4 h-4 text-slate-400 mr-4" />
                                                    <input type="text" value={strategyContext.usp} onChange={(e) => setStrategyContext({ ...strategyContext, usp: e.target.value })} placeholder="The 'Hook' (USP)" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1.5 rounded-full bg-slate-100 text-[#64748b] text-[9px] font-black uppercase tracking-tight border border-slate-200">The 'Hook' (USP)</span>
                                                    <span className="px-3 py-1.5 rounded-full bg-slate-100 text-[#64748b] text-[9px] font-black uppercase tracking-tight border border-slate-200">+ Eco Framework</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Module 2: Market Reconnaissance (SPECIFIC TO LEAD GEN) */}
                                {(salesMode === 'LEAD GEN') && (
                                    <div className="bg-white rounded-[35px] p-10 border border-slate-200 shadow-sm transition-all">
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest">Market Reconnaissance</h2>
                                            <button 
                                                onClick={handleGenerateLeads}
                                                disabled={isFetching}
                                                className="px-5 py-2.5 rounded-[12px] bg-blue-600 text-white font-bold text-[9px] uppercase tracking-wider hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                <Target className="w-3 h-3" />
                                                Generate Lead List
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <Target className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.icp} onChange={(e) => setStrategyContext({ ...strategyContext, icp: e.target.value })} placeholder="Ideal Customer Profile ICP" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <Users className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.contact} onChange={(e) => setStrategyContext({ ...strategyContext, contact: e.target.value })} placeholder="VP, Sales" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <Globe className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.regions} onChange={(e) => setStrategyContext({ ...strategyContext, regions: e.target.value })} placeholder="Target Regions (e.g. USA, UK, India)" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <Search className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.competitor} onChange={(e) => setStrategyContext({ ...strategyContext, competitor: e.target.value })} placeholder="Competitor to Beat" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>
                                            <div className="col-span-2 bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <Zap className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.objection} onChange={(e) => setStrategyContext({ ...strategyContext, objection: e.target.value })} placeholder="Primary Friction/Objection" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {['+ Enterprise Accounts', '+ Integration Concerns', '+ Too Expensive', '+ Happy With XYZ'].map(tag => (
                                                <span key={tag} className="px-3 py-1.5 rounded-full bg-slate-100 text-[#64748b] text-[9px] font-black uppercase tracking-tight border border-slate-200 cursor-pointer hover:bg-slate-200 transition-all">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Module 3: Outreach Configuration */}
                                {(salesMode === 'OUTREACH') && (
                                    <div className="bg-white rounded-[35px] p-10 border border-slate-200 shadow-sm transition-all">
                                        <h2 className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest mb-8">Outreach Parameters</h2>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <UserCircle2 className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.pProspectName} onChange={(e) => setStrategyContext({ ...strategyContext, pProspectName: e.target.value })} placeholder="Prospect Name/Role" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <Mail className="w-4 h-4 text-slate-400 mr-4" />
                                                <select value={strategyContext.outreachChannel} onChange={(e) => setStrategyContext({ ...strategyContext, outreachChannel: e.target.value })} className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none">
                                                    <option value="Email">Email Outreach</option>
                                                    <option value="LinkedIn">LinkedIn Direct</option>
                                                    <option value="Twitter">Twitter DM</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <MessageSquare className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.painPoints} onChange={(e) => setStrategyContext({ ...strategyContext, painPoints: e.target.value })} placeholder="Key Pain Points to Touch Upon" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Module 4: Pitch Designer */}
                                {(salesMode === 'PITCHING') && (
                                    <div className="bg-white rounded-[35px] p-10 border border-slate-200 shadow-sm transition-all">
                                        <h2 className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest mb-8">Pitch Architecture</h2>
                                        <div className="space-y-6">
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <TrendingUp className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.painPoints} onChange={(e) => setStrategyContext({ ...strategyContext, painPoints: e.target.value })} placeholder="Target Pain Point (e.g. Low Conversion)" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <CheckCircle2 className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.usp} onChange={(e) => setStrategyContext({ ...strategyContext, usp: e.target.value })} placeholder="Winning Angle / Demo Goal" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Module 5: Closing Logic */}
                                {(salesMode === 'CLOSING') && (
                                    <div className="bg-white rounded-[35px] p-10 border border-slate-200 shadow-sm transition-all">
                                        <h2 className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest mb-8">Final Closing Strategy</h2>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <DollarSign className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.dealValue} onChange={(e) => setStrategyContext({ ...strategyContext, dealValue: e.target.value })} placeholder="Contract Value" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <Users className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.decisionMaker} onChange={(e) => setStrategyContext({ ...strategyContext, decisionMaker: e.target.value })} placeholder="Key Decision Maker" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>
                                            <div className="col-span-2 bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <ShieldAlert className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.objection} onChange={(e) => setStrategyContext({ ...strategyContext, objection: e.target.value })} placeholder="Final Barrier/Objection" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Module 6: CRM Bridge */}
                                {(salesMode === 'CRM') && (
                                    <div className="bg-white rounded-[35px] p-10 border border-slate-200 shadow-sm transition-all">
                                        <h2 className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest mb-8">CRM Automation & Sync</h2>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <Settings2 className="w-4 h-4 text-slate-400 mr-4" />
                                                <select value={strategyContext.crmStatus} onChange={(e) => setStrategyContext({ ...strategyContext, crmStatus: e.target.value })} className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none">
                                                    <option>New Lead</option>
                                                    <option>In Discussion</option>
                                                    <option>Demo Scheduled</option>
                                                    <option>Negotiation</option>
                                                    <option>Closed Won</option>
                                                </select>
                                            </div>
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <History className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" placeholder="Last Sync Action" disabled className="bg-transparent w-full text-sm font-bold text-slate-400 outline-none" value="Ready to Sync" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Module 7: Messaging Sequence */}
                                {(salesMode === 'MESSAGING') && (
                                    <div className="bg-white rounded-[35px] p-10 border border-slate-200 shadow-sm transition-all">
                                        <h2 className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest mb-8">Unified Messaging Stream</h2>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <MessageSquare className="w-4 h-4 text-slate-400 mr-4" />
                                                <select value={strategyContext.messagingPlatform} onChange={(e) => setStrategyContext({ ...strategyContext, messagingPlatform: e.target.value })} className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none">
                                                    <option>LinkedIn</option>
                                                    <option>WhatsApp</option>
                                                    <option>Telegram</option>
                                                    <option>SMS</option>
                                                </select>
                                            </div>
                                            <div className="bg-[#f1f5f9] rounded-[18px] flex items-center px-6 py-4 border border-slate-200">
                                                <Zap className="w-4 h-4 text-slate-400 mr-4" />
                                                <input type="text" value={strategyContext.painPoints} onChange={(e) => setStrategyContext({ ...strategyContext, painPoints: e.target.value })} placeholder="Sequence Tone" className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Module 3: Agent Archetype */}
                                {(salesMode === 'LEAD GEN') && (
                                    <div className="bg-white rounded-[35px] p-10 border border-slate-200 shadow-sm transition-all">
                                        <h2 className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest mb-10">Agent Personality</h2>
                                        
                                        <div className="flex gap-12 items-center justify-center">
                                            {[
                                                { name: 'The Challenger', icon: <Zap className="w-6 h-6" />, color: 'text-amber-500', bg: 'bg-amber-50' },
                                                { name: 'The Consultative', icon: <BrainCircuit className="w-6 h-6" />, color: 'text-blue-500', bg: 'bg-blue-50' },
                                                { name: 'The Relationship Builder', icon: <Users className="w-6 h-6" />, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                                            ].map(p => {
                                                const isActive = strategyContext.personality === p.name;
                                                return (
                                                    <button
                                                        key={p.name}
                                                        onClick={() => setStrategyContext({ ...strategyContext, personality: p.name })}
                                                        className={`flex flex-col items-center gap-4 transition-all ${isActive ? 'scale-105' : 'opacity-40 hover:opacity-60'}`}
                                                    >
                                                        <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isActive ? `border-blue-500 bg-white shadow-xl` : 'border-slate-100 bg-slate-50'}`}>
                                                            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isActive ? p.bg : 'bg-transparent'}`}>
                                                                <div className={isActive ? p.color : 'text-slate-400'}>{p.icon}</div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-[#1e293b] tracking-wider uppercase">{p.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Side: Simulation Command Center */}
                    <div className="lg:col-span-5 flex flex-col h-full sticky top-12">
                        <div className="bg-white rounded-[35px] p-10 border border-slate-200 shadow-sm h-full flex flex-col">
                            
                            <div className="flex flex-col h-full">
                                <div className="text-center mb-8">
                                    <h3 className="text-lg font-black text-[#1e293b] tracking-tight uppercase mb-1">Real-Time Strategy Preview</h3>
                                </div>

                                <div className="flex flex-col items-center justify-center mb-10">
                                    <div className="relative w-48 h-48">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="96" cy="96" r="80" className="text-slate-100" strokeWidth="12" stroke="currentColor" fill="transparent" />
                                            <motion.circle
                                                cx="96" cy="96" r="80"
                                                stroke={scoreColor}
                                                strokeWidth="12"
                                                strokeDasharray={2 * Math.PI * 80}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 80 - (score / 100) * (2 * Math.PI * 80) }}
                                                strokeLinecap="round"
                                                fill="transparent"
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</span>
                                            <span className="text-4xl font-black text-[#1e293b] tracking-tighter">{score}%</span>
                                            <span className="text-[7px] font-black text-red-500 uppercase mt-1">{scoreLabel}</span>
                                        </div>
                                    </div>
                                    <p className="text-[12px] font-black uppercase tracking-[0.2em] mt-6" style={{ color: scoreColor }}>{scoreLabel}</p>
                                </div>

                                <div className="flex-1 w-full p-8 bg-slate-50/50 rounded-[25px] border border-slate-100 overflow-hidden relative mb-8">
                                    <div className="h-full overflow-y-auto no-scrollbar">
                                        {isProcessing ? (
                                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                                <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Analyzing Signal...</p>
                                            </div>
                                        ) : (messages.length === 0 && (!strategyContext.leads || strategyContext.leads.length === 0)) ? (
                                            <div className="space-y-4 text-[11px] text-slate-500 leading-relaxed font-medium">
                                                <div className="border-b border-slate-200/60 pb-3 mb-3">
                                                    <p className="text-[#1e293b] font-black uppercase tracking-tight text-[10px] mb-1.5">Subject: Quick thought on {strategyContext.companyUrl || '(_Company_)'}'s sales workflow...</p>
                                                </div>
                                                <p>Hi noticed your team recently posted. Most scaling sales struggle fragmented data. Our platform integrates with (CRM) to provide unified intelligence.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 w-full">
                                                {/* Specialized Lead Display for LEAD GEN mode */}
                                                {salesMode === 'LEAD GEN' && strategyContext.leads?.length > 0 && (
                                                    <div className="grid gap-4 mb-8">
                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Discovered Opportunities</h4>
                                                        {strategyContext.leads.map((lead, idx) => (
                                                            <div key={idx} className="bg-white border border-slate-200 rounded-[22px] p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-3">
                                                                    <div className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-lg border border-blue-100">
                                                                        {lead.relevanceScore}% Match
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-3">
                                                                    <div>
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <h5 className="font-black text-[#1e293b] text-sm">{lead.companyName}</h5>
                                                                            {lead.website && (
                                                                                <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition-colors">
                                                                                    <ExternalLink size={14} />
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{lead.decisionMaker}</p>
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                                                        {lead.reasoning}
                                                                    </p>
                                                                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
                                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Targeting: {lead.painPoint?.substring(0, 30)}...</span>
                                                                        <button 
                                                                            onClick={() => handleTransitionToOutreach(lead)}
                                                                            className="flex items-center gap-2 bg-[#1e293b] text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-blue-600 transition-all active:scale-95"
                                                                        >
                                                                            <Mail size={12} />
                                                                            Automate Outreach
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {messages.map((msg, i) => (
                                                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                        <div className={`p-4 rounded-[18px] text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}`}>
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={handleAction}
                                        disabled={isProcessing || score < 15}
                                        className={`group relative w-full py-6 rounded-[20px] font-black text-[11px] uppercase tracking-widest transition-all ${score < 15 ? 'bg-[#f1f5f9] text-slate-400' : 'bg-[#1e293b] text-white hover:bg-black active:scale-[0.98]'}`}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            <Sparkles className="w-4 h-4" />
                                            {isProcessing ? 'Agent Engaging...' : 'Activate Sales Agent'}
                                        </span>
                                    </button>
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                                            Your strategy is currently {score}% optimized. Add more intel to reach {score + 15}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isHistoryOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]" onClick={() => setIsHistoryOpen(false)} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Op History</h2>
                                <button onClick={() => setIsHistoryOpen(false)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-4 flex-1 overflow-y-auto space-y-2">
                                <button onClick={() => { setCurrentSessionId('new'); setMessages([]); setIsHistoryOpen(false); }} className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-600 hover:border-slate-800 hover:text-slate-800 hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest mb-4">
                                    <Plus className="w-4 h-4" /> New Operation
                                </button>
                                {historySessions.map(session => (
                                    <div key={session.sessionId} onClick={() => loadSession(session.sessionId)} className={`p-4 rounded-3xl cursor-pointer border transition-all active:scale-95 ${currentSessionId === session.sessionId ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 hover:border-slate-400'}`}>
                                        <h3 className="text-xs font-black uppercase tracking-wider truncate mb-1">{session.title}</h3>
                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${currentSessionId === session.sessionId ? 'text-slate-400' : 'text-slate-400'}`}>{new Date(session.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
