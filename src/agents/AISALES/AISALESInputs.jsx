import React from 'react';
import {
    Target, ShieldCheck, Zap, Award, AlertCircle, Mail, IndianRupee,
    TrendingUp, GitGraph, Linkedin, Phone, FileSpreadsheet, Plus,
    CalendarClock, CheckCircle2, Activity, UploadCloud, Newspaper,
    ChevronRight, Network, User, Globe, Calculator, MessageSquare, Users,
    History, X, Trash2, Search as SearchIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../../Components/AISAWorkSpace/CustomSelect';
import { PERSONAS, DEAL_STAGES } from './constants';

const AISALESInputs = ({
    salesMode, setSalesMode,
    targetAccount, setTargetAccount,
    targetPersona, setTargetPersona,
    dealValue, setDealValue,
    mainCompetitor, setMainCompetitor,
    competitorStrength, setCompetitorStrength,
    playbookType, setPlaybookType,
    dealStage, setDealStage,
    lastContactDate, setLastContactDate,
    outreachChannel, setOutreachChannel,
    personaGoals, setPersonaGoals,
    personaPainPoints, setPersonaPainPoints,
    prospectReply, setProspectReply,
    prospectObjection, setProspectObjection,
    engagementLevel, setEngagementLevel,
    yourPrice, setYourPrice,
    competitorPrice, setCompetitorPrice,
    valueProps, setValueProps,
    excelFile, setExcelFile,
    showReminderForm, setShowReminderForm,
    followUpReminders,
    newsItems,
    liveSignals,
    stakeholderMap,
    roiCalc, setRoiCalc,
    scriptType, setScriptType,
    handleAction,
    sessions,
    currentSessionId,
    onDeleteSession,
    navigate,
    onClearWorkspace
}) => {
    const [isLocalHistoryOpen, setIsLocalHistoryOpen] = React.useState(false);
    const [historySearch, setHistorySearch] = React.useState('');

    const renderHistoryList = (isCompact = false) => {
        const filteredSessions = (sessions || []).filter(session =>
            session.agentType === 'AISALES' &&
            (session.title || '').toLowerCase().includes(historySearch.toLowerCase())
        );

        if (filteredSessions.length === 0) return (
            <div className={`flex flex-col items-center justify-center ${isCompact ? 'py-10' : 'py-20'} bg-blue-50/30 rounded-[40px] border border-dashed border-blue-200/50`}>
                <MessageSquare className={`${isCompact ? 'w-8 h-8' : 'w-12 h-12'} text-blue-100 mb-4`} />
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">No history found</p>
            </div>
        );

        return (
            <div className={isCompact ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {filteredSessions.map((session) => (
                    <motion.div
                        key={session.sessionId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`group bg-white rounded-[25px] ${isCompact ? 'p-4' : 'p-6'} border transition-all cursor-pointer relative shadow-sm hover:shadow-xl hover:shadow-blue-500/5 ${currentSessionId === session.sessionId ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-slate-50 hover:border-blue-100'}`}
                        onClick={() => {
                            navigate(`/dashboard/workspace/AISALES/${session.sessionId}`);
                            setIsLocalHistoryOpen(false);
                        }}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentSessionId === session.sessionId ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-blue-50 text-blue-400'}`}>
                                    <MessageSquare size={14} />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className={`text-[11px] font-black tracking-tight truncate max-w-[120px] ${currentSessionId === session.sessionId ? 'text-slate-800' : 'text-slate-600'}`}>
                                        {session.title || 'Sales Analysis'}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
                                        {new Date(session.lastModified).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSession(e, session.sessionId);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <div className="col-span-full space-y-10">
            {/* Centered Tab Bar */}
            <div className="flex justify-start md:justify-center border-b border-border/20 pb-4 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-6 md:gap-10 shrink-0">
                    {[
                        { id: 'Write Email', label: 'Email', icon: Mail },
                        { id: 'Analyze Reply', label: 'Reply', icon: MessageSquare },
                        { id: 'Strategy', label: 'Strategy', icon: TrendingUp },
                        { id: 'Bot', label: 'Bot', icon: Zap },
                        { id: 'Scripts', label: 'Calls', icon: Phone },
                        { id: 'Network', label: 'People', icon: Users },
                        { id: 'Value', label: 'Savings', icon: IndianRupee }
                    ].map((modeOption) => (
                        <button
                            key={modeOption.id}
                            onClick={() => setSalesMode(modeOption.id)}
                            className={`relative py-3 px-1 flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${salesMode === modeOption.id
                                ? 'text-primary'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <modeOption.icon className={`w-3.5 h-3.5 ${salesMode === modeOption.id ? 'text-primary' : 'text-slate-300'}`} />
                            {modeOption.label}
                            {salesMode === salesMode && salesMode === modeOption.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -bottom-[17px] left-0 right-0 h-1 bg-primary rounded-t-full"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {salesMode === 'Write Email' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Card 1: Deal Profile */}
                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 space-y-6 lg:space-y-8 shadow-xl shadow-blue-500/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-[30px]">
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
                                    className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[30px] px-8 py-5 text-sm text-maintext focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
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
                                    className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[30px] px-8 py-5 text-sm text-maintext focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
 
                    {/* Card 2: Strategic Intel */}
                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 space-y-6 lg:space-y-8 shadow-xl shadow-blue-500/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-[30px]">
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
                                    className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[30px] px-8 py-5 text-sm text-maintext focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
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
                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 space-y-6 lg:space-y-8 shadow-xl shadow-blue-500/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-[30px]">
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
                                    className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[30px] px-8 py-5 text-sm text-maintext focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm [color-scheme:light]"
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
                    <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 space-y-4 shadow-xl shadow-blue-500/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Sales Goals</h4>
                            </div>
                            <textarea
                                value={personaGoals}
                                onChange={(e) => setPersonaGoals(e.target.value)}
                                placeholder="What specific outcome are you helping them achieve?"
                                className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-2xl lg:rounded-[30px] p-6 lg:p-8 text-sm text-maintext h-40 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner resize-none shadow-sm"
                            />
                        </div>
                        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 space-y-4 shadow-xl shadow-blue-500/5">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Pain Points</h4>
                            </div>
                            <textarea
                                value={personaPainPoints}
                                onChange={(e) => setPersonaPainPoints(e.target.value)}
                                placeholder="What is their single biggest problem right now?"
                                className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[30px] p-8 text-sm text-maintext h-40 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner resize-none shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            )}

            {salesMode === 'Analyze Reply' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Left Side: Text Input */}
                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 space-y-6 shadow-xl shadow-blue-500/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-[30px]">
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
                            className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[30px] p-8 text-sm text-maintext h-64 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner resize-none shadow-sm"
                        />
                    </div>

                    {/* Right Side: Objection Intel */}
                    <div className="space-y-6 lg:space-y-8">
                        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 space-y-6 shadow-xl shadow-blue-500/5">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-50 text-red-500 rounded-[30px]">
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
                                        className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[30px] px-8 py-5 text-sm text-maintext focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
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
                                <div className="p-3 bg-amber-50 text-amber-500 rounded-[30px]">
                                    <IndianRupee className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-maintext">Value Architecture</h3>
                                    <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Pricing & Impact</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Our Price (₹)</label>
                                    <input
                                        type="number"
                                        value={yourPrice}
                                        onChange={(e) => setYourPrice(e.target.value)}
                                        className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-2xl lg:rounded-[30px] px-6 lg:px-8 py-5 text-sm font-black text-maintext focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Comp. Price (₹)</label>
                                    <input
                                        type="number"
                                        value={competitorPrice}
                                        onChange={(e) => setCompetitorPrice(e.target.value)}
                                        className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-2xl lg:rounded-[30px] px-6 lg:px-8 py-5 text-sm font-black text-maintext focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-6 shadow-xl shadow-blue-500/5">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-pink-50 text-pink-500 rounded-[30px]">
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
                                className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-[30px] p-8 text-sm text-maintext h-40 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner resize-none shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Right: Cadence Visualizer */}
                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 space-y-10 shadow-xl shadow-blue-500/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 text-purple-500 rounded-[30px]">
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
                                    <div className="p-6 bg-white border border-border/40 rounded-[30px] flex items-center justify-between group-hover:border-purple-300 transition-all shadow-sm">
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
                            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-[30px]">
                                <FileSpreadsheet className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-maintext">Data</h3>
                                <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Prospect List</p>
                            </div>
                        </div>

                        <div
                            onClick={() => document.getElementById('excel-upload').click()}
                            className="p-8 border-2 border-dashed border-emerald-500/20 hover:border-emerald-500/40 rounded-[30px] bg-emerald-50/30 transition-all text-center cursor-pointer group"
                        >
                            <input
                                id="excel-upload"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={(e) => e.target.files[0] && setExcelFile(e.target.files[0])}
                            />
                            <div className="inline-flex p-3 bg-white shadow-sm rounded-[30px] text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
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
                                <div className="p-3 bg-blue-50 text-blue-500 rounded-[30px]">
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
                                <div className="py-10 text-center border border-dashed border-border/40 rounded-[30px]">
                                    <p className="text-[10px] text-subtext font-bold uppercase tracking-widest">Clear queue</p>
                                </div>
                            ) : (
                                followUpReminders.map(rem => (
                                    <div key={rem.id} className="p-4 bg-[#f8fafc]/50 border border-border/30 rounded-[30px] flex items-center justify-between group">
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
                                <div className="p-4 bg-amber-500 text-white rounded-[30px] shadow-xl shadow-amber-200 ring-4 ring-amber-50">
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
                                <div key={news.id} className="p-5 bg-white/60 border border-border/20 rounded-[30px] group hover:border-amber-500/40 transition-all shadow-sm flex items-start gap-4">
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

                        <div className="p-4 bg-amber-50/50 rounded-[30px] border border-amber-100/50 flex items-center gap-3">
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
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-[30px]">
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
                            <div className="p-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[30px] text-white shadow-xl shadow-blue-500/20 text-center">
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
                            <div className="p-3 bg-red-50 text-red-500 rounded-[30px]">
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
                                    className="p-5 bg-[#f8fafc]/50 border border-border/30 rounded-[30px] flex items-center justify-between group hover:border-red-500/30 transition-all shadow-sm"
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
                            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-[30px]">
                                <Network className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-maintext">Power Map</h3>
                                <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Internal Org Intel</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {stakeholderMap.map(person => (
                                <div key={person.id} className="p-6 bg-[#f8fafc]/50 border border-border/30 rounded-[30px] flex items-center justify-between group hover:border-indigo-500/30 transition-all shadow-sm">
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
                                <div className="p-3 bg-indigo-500 text-white rounded-[30px] shadow-lg shadow-indigo-200">
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
                                        className="p-4 bg-[#f8fafc]/50 border border-border/20 rounded-[30px] space-y-2 relative overflow-hidden group"
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
                            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-[30px]">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-maintext">ROI Config</h3>
                                <p className="text-[10px] font-bold text-subtext uppercase tracking-widest">Savings Logic</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Current Cost (₹)</label>
                                <input
                                    type="number"
                                    value={roiCalc.currentCost}
                                    onChange={(e) => setRoiCalc({ ...roiCalc, currentCost: parseInt(e.target.value) })}
                                    className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-2xl lg:rounded-[30px] px-6 lg:px-8 py-5 text-sm font-black text-maintext focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-1">Efficiency Gain (%)</label>
                                <input
                                    type="number"
                                    value={roiCalc.expectedEfficiency}
                                    onChange={(e) => setRoiCalc({ ...roiCalc, expectedEfficiency: parseInt(e.target.value) })}
                                    className="w-full bg-[#f8fafc]/50 border border-border/40 rounded-2xl lg:rounded-[30px] px-6 lg:px-8 py-5 text-sm font-black text-maintext focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
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
            {/* Footer Actions */}
            <div className="flex items-center justify-center gap-4 py-10 border-t border-slate-100/50 mt-10 relative">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsLocalHistoryOpen(!isLocalHistoryOpen)}
                        className={`flex items-center gap-2 px-8 py-4 border rounded-[30px] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${isLocalHistoryOpen ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                        <History size={16} className={isLocalHistoryOpen ? 'text-white' : 'text-slate-400'} /> History
                    </button>

                    <AnimatePresence>
                        {isLocalHistoryOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 15 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[350px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-6 z-[100]"
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sales History</h4>
                                    <button onClick={() => setIsLocalHistoryOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="relative mb-5">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                        <SearchIcon size={12} />
                                    </div>
                                    <input
                                        type="text"
                                        value={historySearch}
                                        onChange={(e) => setHistorySearch(e.target.value)}
                                        placeholder="Search history..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-[10px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                                    />
                                </div>
                                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {renderHistoryList(true)}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <button
                    type="button"
                    onClick={onClearWorkspace}
                    className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-[30px] text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                    <Trash2 size={16} className="text-slate-400" /> CLEAR
                </button>
            </div>
        </div>
    );
};

export default AISALESInputs;
