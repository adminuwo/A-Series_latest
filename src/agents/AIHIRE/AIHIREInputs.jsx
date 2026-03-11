import React, { useState } from 'react';
import {
    GitGraph, Target, Zap, Users, UploadCloud, FileText, X, ShieldCheck,
    Bot, IndianRupee, Activity, Building2, BarChart3, History, Trash2, MessageSquare, Search as SearchIcon, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../../Components/AISAWorkSpace/CustomSelect';

const AIHIREInputs = ({
    hiringMode, setHiringMode,
    hireRiskTolerance, setHireRiskTolerance,
    hireSourcingChannels, setHireSourcingChannels,
    hireExtraNotes, setHireExtraNotes,
    hireRole, setHireRole,
    hireDepartment, setHireDepartment,
    hireSeniority, setHireSeniority,
    hireLocation, setHireLocation,
    hireUrgency, setHireUrgency,
    hireIndustry, setHireIndustry,
    hireBudget, setHireBudget,
    hireCandidateProfiles, setHireCandidateProfiles,
    hireUploadedFiles, setHireUploadedFiles,
    hireFileAttachments, setHireFileAttachments,
    hireUploadDragging, setHireUploadDragging,
    hireJobDescription, setHireJobDescription,
    hireScorecardCriteria, setHireScorecardCriteria,
    hireBiasCheck, setHireBiasCheck,
    hireOfferSalary, setHireOfferSalary,
    hireEquityPercent, setHireEquityPercent,
    hireOfferPerks, setHireOfferPerks,
    hireCompetitorSalary, setHireCompetitorSalary,
    hireCandidateLeverage, setHireCandidateLeverage,
    hireOrgStructure, setHireOrgStructure,
    hireCulturalValues, setHireCulturalValues,
    handleResumeFiles,
    hireFileInputRef,
    isProcessing,
    handleAction,
    onClearWorkspace,
    sessions,
    currentSessionId,
    onDeleteSession,
    navigate
}) => {
    const [isLocalHistoryOpen, setIsLocalHistoryOpen] = useState(false);
    const [historySearch, setHistorySearch] = useState('');

    const renderHistoryList = (isCompact = false) => {
        const filteredSessions = (sessions || []).filter(session =>
            (session.title || '').toLowerCase().includes(historySearch.toLowerCase())
        );

        if (filteredSessions.length === 0) return (
            <div className={`flex flex-col items-center justify-center ${isCompact ? 'py-10' : 'py-20'} bg-emerald-50/30 rounded-[40px] border border-dashed border-emerald-200/50`}>
                <MessageSquare className={`${isCompact ? 'w-8 h-8' : 'w-12 h-12'} text-emerald-100 mb-4`} />
                <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">No history for this segment</p>
            </div>
        );

        return (
            <div className={isCompact ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {filteredSessions.map((session) => (
                    <motion.div
                        key={session.sessionId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`group bg-white rounded-[35px] ${isCompact ? 'p-5' : 'p-8'} border transition-all cursor-pointer relative shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 ${currentSessionId === session.sessionId ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-50 hover:border-emerald-100'} `}
                        onClick={() => {
                            navigate(`/dashboard/workspace/AIHIRE/${session.sessionId}`);
                            setIsLocalHistoryOpen(false);
                        }}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentSessionId === session.sessionId ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-emerald-50 text-emerald-400'} `}>
                                    <MessageSquare size={16} />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className={`text-sm font-black tracking-tight truncate max-w-[150px] ${currentSessionId === session.sessionId ? 'text-slate-800' : 'text-slate-600'} `}>
                                        {session.title || 'New Hiring Plan'}
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
    return (
        <div className="col-span-full space-y-10">
            <div className="flex justify-center border-b border-border/20 pb-4">
                <div className="flex gap-10">
                    {[
                        { id: 'Strategy', label: 'Strategy', icon: GitGraph },
                        { id: 'Evaluation', label: 'Evaluation', icon: ShieldCheck },
                        { id: 'Offer', label: 'Offer', icon: Zap },
                        { id: 'Planning', label: 'Planning', icon: Building2 },
                        { id: 'Analytics', label: 'Analytics', icon: BarChart3 }
                    ].map((modeOption) => (
                        <button
                            key={modeOption.id}
                            onClick={() => setHiringMode(modeOption.id)}
                            className={`relative py - 3 px - 2 flex items - center gap - 2 text - [11px] font - black uppercase tracking - widest transition - all duration - 300 ${hiringMode === modeOption.id
                                    ? 'text-emerald-500'
                                    : 'text-slate-400 hover:text-slate-600'
                                } `}
                        >
                            <modeOption.icon className={`w - 3.5 h - 3.5 ${hiringMode === modeOption.id ? 'text-emerald-500' : 'text-slate-300'} `} />
                            {modeOption.label}
                            {hiringMode === modeOption.id && (
                                <motion.div
                                    layoutId="activeTabHire"
                                    className="absolute -bottom-[17px] left-0 right-0 h-1 bg-emerald-500 rounded-t-full"
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

                    <div className="space-y-8 flex flex-col h-full">
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
                                    <CustomSelect value={hireDepartment} onChange={(e) => setHireDepartment(e.target.value)} options={['Engineering', 'Product', 'Sales', 'Design', 'Marketing', 'HR', 'Finance']} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Seniority</label>
                                    <CustomSelect value={hireSeniority} onChange={(e) => setHireSeniority(e.target.value)} options={['Junior', 'Mid-Level', 'Senior', 'Lead', 'Director', 'VP', 'C-Level']} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Location</label>
                                    <CustomSelect value={hireLocation} onChange={(e) => setHireLocation(e.target.value)} options={['Remote', 'Hybrid', 'On-site', 'Global']} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Urgency</label>
                                    <CustomSelect value={hireUrgency} onChange={(e) => setHireUrgency(e.target.value)} options={['Low', 'Medium', 'High', 'Immediate']} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Industry</label>
                                    <CustomSelect value={hireIndustry} onChange={(e) => setHireIndustry(e.target.value)} options={['SaaS', 'FinTech', 'HealthTech', 'E-commerce', 'DeepTech', 'Services']} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[40px] p-8 text-white shadow-xl shadow-emerald-500/20 relative group">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Annual Budget Cap</p>
                                <Zap className="w-5 h-5 opacity-80" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black opacity-60">₹</span>
                                <input
                                    type="number"
                                    value={hireBudget}
                                    onChange={(e) => setHireBudget(Number(e.target.value))}
                                    className="bg-transparent border-none text-4xl font-black text-white outline-none w-full"
                                />
                            </div>
                            <p className="text-[10px] font-bold mt-2 opacity-70">Projected compensation & sourcing cost</p>
                        </div>

                        <div className="mt-auto pt-4">
                            <button
                                onClick={() => {
                                    if (hiringMode === 'Strategy') handleAction('aihire_generate_strategy');
                                    else if (hiringMode === 'Evaluation') handleAction('aihire_evaluate_candidates');
                                    else if (hiringMode === 'Offer') handleAction('aihire_generate_offer');
                                    else if (hiringMode === 'Planning') handleAction('aihire_generate_plan');
                                    else handleAction();
                                }}
                                disabled={isProcessing}
                                className="w-full py-6 bg-slate-900 text-white rounded-[32px] text-[12px] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Executing...
                                    </>
                                ) : (
                                    <>
                                        Launch Recruitment Engine
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
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
                            className={`relative border - 2 border - dashed rounded - [32px] p - 6 transition - all ${hireUploadDragging ? 'border-emerald-500 bg-emerald-50/50' : 'border-border/40 bg-[#f8fafc]/30'} `}
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
                                    className={`w - 14 h - 7 rounded - full transition - all flex items - center px - 1 ${hireBiasCheck ? 'bg-emerald-500' : 'bg-subtext/20'} `}
                                >
                                    <div className={`w - 5 h - 5 bg - white rounded - full shadow - md transition - transform ${hireBiasCheck ? 'translate-x-7' : 'translate-x-0'} `} />
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

            {/* History & Clear Navigation */}
            <div className="flex items-center justify-center gap-4 py-10 border-t border-slate-100/50 mt-10 relative">
                <div className="relative">
                    <button
                        onClick={() => setIsLocalHistoryOpen(!isLocalHistoryOpen)}
                        className={`flex items - center gap - 2 px - 8 py - 5 border rounded - [30px] text - [10px] font - black uppercase tracking - widest transition - all shadow - sm ${isLocalHistoryOpen ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'} `}
                    >
                        <History size={16} className={isLocalHistoryOpen ? 'text-white' : 'text-slate-400'} /> History
                    </button>

                    <AnimatePresence>
                        {isLocalHistoryOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 15 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[400px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-7 z-[100]"
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hiring History</h4>
                                    <button onClick={() => setIsLocalHistoryOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="relative mb-5">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200">
                                        <SearchIcon size={12} />
                                    </div>
                                    <input
                                        type="text"
                                        value={historySearch}
                                        onChange={(e) => setHistorySearch(e.target.value)}
                                        placeholder="Search history..."
                                        className="w-full bg-emerald-50/50 border border-emerald-100/50 rounded-xl py-3 pl-10 pr-4 text-[10px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                    />
                                </div>
                                <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {renderHistoryList(true)}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <button
                    onClick={onClearWorkspace}
                    className="flex items-center gap-2 px-8 py-5 bg-white border border-slate-200 rounded-[30px] text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                    <Trash2 size={16} className="text-slate-400" /> Clear
                </button>
            </div>
        </div>
    );
};

export default AIHIREInputs;
