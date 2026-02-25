import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
    Users, Target, TrendingUp, Mail, DollarSign, MessageSquare, Briefcase, ChevronDown, CheckCircle2, History, X, Plus, Sparkles, Building2, UserCircle2, Zap, BrainCircuit, Globe, Check, ShieldAlert, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { generateChatResponse } from '../../services/aivaService';
import { chatStorageService } from '../../services/chatStorageService';

export default function AiSales() {
    const navigate = useNavigate();
    const { sessionId } = useParams();

    const [salesMode, setSalesMode] = useState('OUTREACH');
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
        personality: 'The Consultative'
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

        const logs = [
            `[SYSTEM]: Scanning Linkedin...`,
            `[SYSTEM]: Found 3 recent job openings...`,
            `Analyzing Signals Request... Analysis Q3 Earnings Report...`
        ];

        for (let i = 0; i < logs.length; i++) {
            await new Promise(r => setTimeout(r, 800));
            setFetchLogs(prev => [...prev, logs[i]]);
        }

        setTimeout(() => setIsFetching(false), 800);
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
            
            PERSONALITY ARCHETYPE: ${strategyContext.personality}
            - If The Challenger: Be direct, data-driven, and provocative. Use strong verbs.
            - If The Consultative: Be insight-led, question-based, and adopt a soft-sell tone.
            - If The Relationship Builder: Prioritize rapport-building, trust, and warm openings.

            INSTRUCTIONS:
            Execute the ${salesMode} sequence perfectly based on the strategy context over. Provide tactical outputs (e.g., subject lines, scripts, rebuttal snippets) that reflect the chosen personality ${strategyContext.personality}. Organize into clear Markdown sections.
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

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const navItems = ['LEAD GEN', 'OUTREACH', 'PITCHING', 'CLOSING', 'CRM', 'MESSAGING'];

    const renderMessageContent = () => {
        if (messages.length === 0) {
            return (
                <div className="text-sm font-medium text-slate-700 leading-relaxed max-w-sm mt-8">
                    <p className="text-slate-500 mb-2">Subject: Quick thought on (_Company_)'s sales workflow...</p>
                    Hi noticed your team recently posted. Most scaling sales, struggle fragmented data. Our platform integrates with (CRM) to provide unified intelligence.
                </div>
            );
        }

        const lastModelMsg = [...messages].reverse().find(m => m.role === 'model');
        if (!lastModelMsg) return null;

        return (
            <div className="text-xs text-slate-700 leading-relaxed mt-6 h-48 overflow-y-auto custom-scrollbar pr-4 text-left">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {lastModelMsg.content.substring(0, 800) + (lastModelMsg.content.length > 800 ? '...' : '')}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#ebf3f9] p-4 lg:p-8 font-sans flex flex-col relative overflow-hidden">

            <div className="w-full max-w-screen-2xl mx-auto bg-white rounded-full py-4 px-6 md:px-10 flex flex-wrap items-center justify-between shadow-sm z-20 mb-8 border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">SALES INTELLIGENCE</h1>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                            <span className="text-blue-500">+</span> SYSTEM OPERATIONAL
                        </p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-8">
                    {navItems.map(item => (
                        <button
                            key={item}
                            onClick={() => setSalesMode(item)}
                            className={`text-[11px] font-black uppercase tracking-widest transition-all ${salesMode === item ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-slate-400 hover:text-slate-700'}`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-black uppercase tracking-widest">
                    <History className="w-4 h-4" /> HISTORY
                </button>
            </div>

            <div className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 z-20">
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">CAMPAIGN CONFIGURATION</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 w-full">
                                <div className="flex-1 bg-[#f4f7fb] rounded-xl flex items-center px-4 py-3 border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                    <Globe className="w-4 h-4 text-slate-400 mr-3" />
                                    <input
                                        type="text"
                                        value={strategyContext.companyUrl}
                                        onChange={(e) => setStrategyContext({ ...strategyContext, companyUrl: e.target.value })}
                                        placeholder="Company URL / Linkedin"
                                        className="bg-transparent w-full text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                                <button
                                    onClick={handleFetchIntelligence}
                                    className="px-6 py-3 rounded-xl border border-blue-300 text-blue-500 font-bold text-sm whitespace-nowrap hover:bg-blue-50 active:scale-95 transition-all"
                                >
                                    Fetch intelligence
                                </button>
                            </div>

                            <div className="bg-[#f4f7fb] rounded-xl flex items-center px-4 py-3 border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                <Building2 className="w-4 h-4 text-slate-400 mr-3" />
                                <input
                                    type="text"
                                    value={strategyContext.product}
                                    onChange={(e) => setStrategyContext({ ...strategyContext, product: e.target.value })}
                                    placeholder="Product"
                                    className="bg-transparent w-full text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                                />
                            </div>

                            <div className="bg-[#f4f7fb] rounded-xl flex items-center px-4 py-3 border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                <Target className="w-4 h-4 text-slate-400 mr-3" />
                                <input
                                    type="text"
                                    value={strategyContext.usp}
                                    onChange={(e) => setStrategyContext({ ...strategyContext, usp: e.target.value })}
                                    placeholder="The 'Hook' (USP)"
                                    className="bg-transparent w-full text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                                />
                            </div>
                            <div className="flex gap-2 pl-2">
                                <button onClick={() => setStrategyContext(p => ({ ...p, usp: 'Cost-saving optimization' }))} className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all">The "Hook" (USP)</button>
                                <button onClick={() => setStrategyContext(p => ({ ...p, usp: p.usp + ' + Eco Framework' }))} className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all">+ Eco Framework</button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {isFetching && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute bottom-6 right-6 w-[360px] bg-[#1e293b] rounded-xl shadow-2xl p-5 border border-slate-700 z-10 font-mono text-xs text-slate-300 leading-relaxed overflow-hidden"
                                >
                                    {fetchLogs.map((log, i) => (
                                        <p key={i} className={`mb-1 ${i === fetchLogs.length - 1 ? 'text-blue-300' : ''}`}>{log}</p>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Market Reconnaissance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#f4f7fb] rounded-xl flex items-center px-4 py-3 border border-slate-200">
                                <UserCircle2 className="w-4 h-4 text-slate-400 mr-3" />
                                <input type="text" value={strategyContext.icp} onChange={(e) => setStrategyContext({ ...strategyContext, icp: e.target.value })} placeholder="Ideal Customer Profile ICP" className="bg-transparent w-full text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400" />
                            </div>
                            <div className="bg-[#f4f7fb] rounded-xl flex items-center px-4 py-3 border border-slate-200">
                                <Users className="w-4 h-4 text-slate-400 mr-3" />
                                <input type="text" value={strategyContext.contact} onChange={(e) => setStrategyContext({ ...strategyContext, contact: e.target.value })} placeholder="VP, Sales" className="bg-transparent w-full text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400" />
                            </div>

                            <div className="space-y-3">
                                <div className="bg-[#f4f7fb] rounded-xl flex items-center px-4 py-3 border border-slate-200">
                                    <ShieldAlert className="w-4 h-4 text-slate-400 mr-3" />
                                    <input type="text" value={strategyContext.competitor} onChange={(e) => setStrategyContext({ ...strategyContext, competitor: e.target.value })} placeholder="Competitor to Beat" className="bg-transparent w-full text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setStrategyContext(p => ({ ...p, competitor: 'Enterprise Accounts' }))} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-200">+ Enterprise Accounts</button>
                                    <button onClick={() => setStrategyContext(p => ({ ...p, competitor: p.competitor + ' Integration Concerns' }))} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-200">+ Integration Concerns</button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-[#f4f7fb] rounded-xl flex items-center px-4 py-3 border border-slate-200">
                                    <Zap className="w-4 h-4 text-slate-400 mr-3" />
                                    <input type="text" value={strategyContext.objection} onChange={(e) => setStrategyContext({ ...strategyContext, objection: e.target.value })} placeholder="Primary Friction/Objection" className="bg-transparent w-full text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setStrategyContext(p => ({ ...p, objection: 'Too Expensive' }))} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-200">+ Too Expensive</button>
                                    <button onClick={() => setStrategyContext(p => ({ ...p, objection: 'Happy with xyz' }))} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-200">+ Happy With XYZ</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Agent Personality</h2>
                        <div className="flex flex-wrap items-center gap-8">
                            {[
                                { name: 'The Challenger', icon: <Zap className="w-8 h-8" />, color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-400', shadow: 'shadow-amber-400/30' },
                                { name: 'The Consultative', icon: <BrainCircuit className="w-8 h-8" />, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-400', shadow: 'shadow-blue-400/30' },
                                { name: 'The Relationship Builder', icon: <Users className="w-8 h-8" />, color: 'text-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-400', shadow: 'shadow-emerald-400/30' }
                            ].map(p => {
                                const isActive = strategyContext.personality === p.name;
                                return (
                                    <button
                                        key={p.name}
                                        onClick={() => setStrategyContext({ ...strategyContext, personality: p.name })}
                                        className={`flex flex-col items-center justify-center gap-3 transition-all ${isActive ? 'scale-110 opacity-100 relative z-10' : 'opacity-60 scale-95 hover:opacity-80'}`}
                                    >
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${p.bg} ${p.color} ${isActive ? `${p.border} ${p.shadow} shadow-2xl` : 'border-transparent'}`}>
                                            {p.icon}
                                        </div>
                                        <span className="text-xs font-black text-slate-700 tracking-tight">{p.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 h-full flex flex-col">
                    <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex-1 flex flex-col relative text-center items-center justify-center">
                        <h2 className="absolute top-8 left-8 text-xl font-black text-slate-800 tracking-tight">Real-Time<br />Strategy Preview</h2>
                        <div className="mt-16 mb-8 flex flex-col items-center justify-center relative">
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                                <circle cx="96" cy="96" r={radius} stroke={scoreColor} strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Confidence</span>
                                <span className="text-5xl font-black text-slate-800 tracking-tighter" style={{ marginLeft: '-4px' }}>{score}%</span>
                                <span className="text-[8px] font-bold uppercase mt-1" style={{ color: scoreColor }}>{scoreLabel}</span>
                            </div>
                            <p className="mt-6 font-black tracking-widest text-sm" style={{ color: scoreColor }}>{scoreLabel}</p>
                        </div>

                        <div className="w-full bg-white border-2 border-slate-100 p-6 rounded-3xl relative min-h-[180px] text-left">
                            {isProcessing ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                    <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating Strategy...</p>
                                </div>
                            ) : (
                                renderMessageContent()
                            )}
                        </div>

                        <div className="mt-auto pt-8 w-full flex flex-col items-center">
                            <button
                                onClick={handleAction}
                                disabled={isProcessing || score < 40}
                                className={`w-full max-w-sm py-5 rounded-full text-sm font-black uppercase tracking-widest text-white transition-all transform active:scale-95 flex items-center justify-center gap-2 ${score < 40 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/30'}`}
                            >
                                <Sparkles className="w-5 h-5" /> ACTIVATE SALES AGENT
                            </button>
                            <p className="text-[10px] font-bold text-slate-500 mt-4 max-w-[280px]">
                                Your strategy is currently {score}% optimized. Add {score < 100 ? 'more intel' : 'an integration'} to reach {Math.min(score + 15, 100)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isHistoryOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z[100]" onClick={() => setIsHistoryOpen(false)} />
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
