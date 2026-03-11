import React, { useState, useEffect } from 'react';
import {
    Activity, Users, BarChart3, Mail, MessageSquare, Zap,
    CheckCircle2, TrendingUp, Shield, Rocket, Settings,
    LayoutDashboard, Target, Layers, Plus, Search, Filter,
    ArrowRight, Sparkles, PieChart, Calendar, Bell, Download
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart as RePieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const AIBIZInputs = ({
    aibizMode, setAibizMode,
    businessDescription, setBusinessDescription,
    handleAction,
    isProcessing,
    onClearWorkspace,
    selectedCustomer, setSelectedCustomer,
    customers, interactions,
    healthScore, setHealthScore,
    goals, setGoals,
    revenueData, setRevenueData,
    segments, setSegments,
    leadMetrics, setLeadMetrics
}) => {
    // SaaS Dashboard States
    const [automationTab, setAutomationTab] = useState('crm');
    const [crmTab, setCrmTab] = useState('accounts'); // 'accounts' or 'leads'
    const [campaignGoal, setCampaignGoal] = useState('Upsell');
    const [campaignChannel, setCampaignChannel] = useState('Email');
    const [selectedSegmentId, setSelectedSegmentId] = useState(1);

    const segmentationData = (segments || []).map(seg => ({
        name: seg.name,
        value: seg.count,
        color: seg.color
    }));

    const currentMode = aibizMode || 'Dashboard';

    // Tabs for SaaS Navigation
    const tabs = [
        { id: 'Dashboard', icon: LayoutDashboard, label: 'Dash' },
        { id: 'Segments', icon: Layers, label: 'Segments' },
        { id: 'CRM', icon: Users, label: 'AI-CRM' },
        { id: 'Campaigns', icon: Mail, label: 'Campaigns' },
        { id: 'Automation', icon: Zap, label: 'Automation' },
    ];

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {/* SaaS Command Header */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[32px] shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-500/20">
                        <Rocket size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">SaaS Intelligence <span className="text-red-600">OS</span></h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Operational • Multi-Tenant Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setAibizMode(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${currentMode === tab.id
                                ? 'bg-white text-red-600 shadow-md ring-1 ring-slate-200'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dynamic Content Grid */}
            <div className="grid grid-cols-12 gap-8">

                {/* Left Panel: Context & Quick Actions */}
                <div className="col-span-full lg:col-span-4 space-y-8">
                    {/* SaaS Health Card */}
                    <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-red-500/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity size={120} className="text-red-600" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">SaaS Health Score</p>
                            <div className="flex items-end gap-3">
                                <span className="text-6xl font-black text-slate-800 tabular-nums">{healthScore.score}</span>
                                <div className="mb-2 flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <TrendingUp size={12} />
                                    <span className="text-[10px] font-bold">+4.2%</span>
                                </div>
                            </div>
                            <div className="mt-6 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${healthScore.score}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                                />
                            </div>
                            <p className="mt-4 text-[11px] text-slate-500 leading-relaxed font-medium">
                                Your product retention is in the <span className="text-red-500 font-bold italic text-[12px]">top 5%</span> of B2B SaaS in your category.
                            </p>
                        </div>
                    </div>

                    {/* AI Automation Prompt */}
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 blur-[80px]"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
                                    <Sparkles size={20} />
                                </div>
                                <h3 className="text-lg font-black tracking-tight">AI Command</h3>
                            </div>
                            <textarea
                                value={businessDescription}
                                onChange={(e) => setBusinessDescription(e.target.value)}
                                placeholder="Describe the automation objective or campaign goal..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-red-500/50 transition-all min-h-[140px] placeholder:text-slate-500 text-white"
                            />
                            <button
                                onClick={() => {
                                    if (currentMode === 'CRM') handleAction('aibiz_analyze_crm');
                                    else if (currentMode === 'Campaigns') handleAction('aibiz_generate_campaign');
                                    else if (currentMode === 'Automation') handleAction('aibiz_automation'); // Not fully implemented in backend yet but good to have
                                    else handleAction(); // Default for Dashboard
                                }}
                                disabled={isProcessing}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-600/20"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Executing...
                                    </>
                                ) : (
                                    <>
                                        Launch Intelligence
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Functional UI */}
                <div className="col-span-full lg:col-span-8">
                    <div className="bg-white rounded-[45px] border border-slate-100 shadow-xl shadow-slate-200/20 min-h-[600px] flex flex-col overflow-hidden">

                        {/* Area Charts / Dashboard Content */}
                        <AnimatePresence mode="wait">
                            {currentMode === 'Dashboard' && (
                                <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-10 space-y-10">
                                    {/* Top Row: Health Score & Growth Insights */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Business Health Score */}
                                        <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm relative overflow-hidden group">
                                            <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform">
                                                <Activity size={200} className="text-red-600" />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Business Health Score</h3>
                                                <div className="flex items-center gap-8">
                                                    <div className="relative w-28 h-28 flex items-center justify-center">
                                                        <svg className="w-full h-full -rotate-90">
                                                            <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50" />
                                                            <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={314} strokeDashoffset={314 - (314 * healthScore.score) / 100} className="text-red-600" strokeLinecap="round" />
                                                        </svg>
                                                        <span className="absolute text-2xl font-black text-slate-800 tabular-nums">{healthScore.score}%</span>
                                                    </div>
                                                    <div>
                                                        <p className={`text-[11px] font-black uppercase mb-1 ${healthScore.status === 'Stable' ? 'text-emerald-600' : 'text-amber-600'}`}>Status: {healthScore.status}</p>
                                                        <div className="space-y-1.5">
                                                            {healthScore.weakAreas.map((area, i) => (
                                                                <div key={i} className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                                                    {area}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Growth Insights */}
                                        <div className="lg:col-span-2 bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl group">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                                                <Sparkles size={100} />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Target size={14} /> Weekly Growth IQ
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                                            <p className="text-[10px] font-medium leading-relaxed italic text-slate-300">
                                                                "Your conversion rate improved **12%** this week, primarily driven by your active CRM triggers."
                                                            </p>
                                                        </div>
                                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                                            <p className="text-[10px] font-medium leading-relaxed italic text-slate-300">
                                                                "Cold leads increased by **18%**. Suggesting immediate re-engagement sequence."
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col justify-end">
                                                        <button onClick={() => handleAction('aibiz_weekly_report')} className="w-full py-4 bg-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                                            <Download size={16} /> Export Weekly Report
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Row: Revenue Tracker & AI Tasks */}
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                        <div className="xl:col-span-2 bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Revenue Intelligence</h4>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-bold text-slate-400">MRR:</span>
                                                            <span className="text-xs font-black text-slate-800">$38,400</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-bold text-slate-400">Growth:</span>
                                                            <span className="text-xs font-black text-emerald-600">+14.2%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <select className="bg-slate-50 border-none outline-none rounded-xl px-4 py-2 text-[9px] font-black uppercase text-slate-500">
                                                    <option>Monthly View</option>
                                                    <option>Yearly ARR</option>
                                                </select>
                                            </div>
                                            <div className="h-64 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={revenueData}>
                                                        <defs>
                                                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                                                        <YAxis hide />
                                                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                                                        <Area type="monotone" dataKey="mrr" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <Zap size={14} className="text-amber-500" /> AI Priority Tasks
                                            </h4>
                                            <div className="space-y-4">
                                                {[
                                                    { icon: Users, label: 'Follow up with Quantum', status: 'High' },
                                                    { icon: Target, label: 'Review Batch B Churn', status: 'Medium' },
                                                    { icon: Mail, label: 'A/B Test Diwali Offer', status: 'Action' },
                                                ].map((task, i) => (
                                                    <div key={i} className="group p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-red-100 hover:bg-white transition-all cursor-pointer">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-red-600 transition-colors shadow-sm">
                                                                <task.icon size={18} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-[11px] font-black text-slate-800">{task.label}</p>
                                                                    <span className="text-[8px] font-black text-red-500 uppercase">{task.status}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:border-red-200 hover:text-red-500 transition-all mt-4">
                                                    Manage All Tasks
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Goal Tracking */}
                                    <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm relative overflow-hidden">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">SaaS Goal Tracking <span className="text-red-600">v2.0</span></h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {goals.map(goal => (
                                                <div key={goal.id}>
                                                    <div className="flex items-end justify-between mb-4">
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{goal.label}</p>
                                                            <p className="text-xl font-black text-slate-800">{goal.unit}{goal.current.toLocaleString()} <span className="text-xs font-bold text-slate-300">/ {goal.unit}{goal.target.toLocaleString()}</span></p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-red-600">{Math.round((goal.current / goal.target) * 100)}%</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                                            className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                                                        />
                                                    </div>
                                                    <div className="mt-4 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                                                        <p className="text-[9px] text-amber-700 font-medium italic">
                                                            AI Prediction: On track for target by **Mar 18th**.
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentMode === 'Automation' && (
                                <motion.div
                                    key="automation"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-10 space-y-8"
                                >
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI Flow Orchestrator</h2>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-Step Automation Engine</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { title: 'Welcome Sequence', desc: 'Auto-onboard new signups with personalized logic', status: 'Active', color: 'emerald' },
                                            { title: 'Churn Prediction', desc: 'Identify at-risk users and trigger retention flows', status: 'Paused', color: 'amber' },
                                            { title: 'Expansion engine', desc: 'Upsell enterprise features based on usage data', status: 'Draft', color: 'slate' },
                                        ].map((flow, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[28px] hover:border-red-500/20 hover:shadow-xl hover:shadow-slate-200/40 transition-all cursor-pointer group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                                                        <Zap size={24} className="text-slate-400 group-hover:text-red-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-800 tracking-tight">{flow.title}</h4>
                                                        <p className="text-xs text-slate-500 mt-0.5">{flow.desc}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-current opacity-60 text-${flow.color}-500 bg-${flow.color}-50`}>
                                                        {flow.status}
                                                    </span>
                                                    <button className="p-3 rounded-xl hover:bg-slate-100 transition-colors">
                                                        <ArrowRight size={18} className="text-slate-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[30px] text-slate-400 font-black uppercase tracking-widest text-[11px] hover:border-red-500/50 hover:text-red-600 transition-all flex items-center justify-center gap-3">
                                        <Plus size={18} />
                                        Create New Automation Flow
                                    </button>
                                </motion.div>
                            )}

                            {currentMode === 'CRM' && (
                                <motion.div
                                    key="crm"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-10 space-y-10"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">CRM Intelligence</h2>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-Tenant AI Account Management</p>
                                        </div>
                                        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
                                            <button
                                                onClick={() => { setCrmTab('accounts'); setSelectedCustomer(null); }}
                                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${crmTab === 'accounts' ? 'bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <Users size={12} /> Accounts
                                            </button>
                                            <button
                                                onClick={() => { setCrmTab('leads'); setSelectedCustomer(null); }}
                                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${crmTab === 'leads' ? 'bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <Target size={12} /> Lead Scoring
                                            </button>
                                        </div>
                                    </div>

                                    {crmTab === 'accounts' && !selectedCustomer && (
                                        <div className="grid grid-cols-1 gap-4">
                                            {customers.map((customer) => (
                                                <div
                                                    key={customer.id}
                                                    onClick={() => setSelectedCustomer(customer)}
                                                    className="group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[30px] hover:border-red-500/30 hover:shadow-xl hover:shadow-red-500/5 transition-all cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black ${customer.health > 80 ? 'bg-emerald-50 text-emerald-600' :
                                                            customer.health > 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                                            }`}>
                                                            {customer.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-slate-800 tracking-tight text-lg">{customer.name}</h4>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{customer.industry}</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                                                <span className="text-[10px] font-bold text-slate-500 italic">{customer.contact}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-8 text-right">
                                                        <div>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Health Score</p>
                                                            <div className="flex items-center justify-end gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${customer.health > 80 ? 'bg-emerald-500' : customer.health > 50 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                                                <span className="text-xl font-black text-slate-800 tabular-nums">{customer.health}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-red-500 group-hover:bg-red-50 transition-all">
                                                            <ArrowRight size={20} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[30px] text-slate-400 font-black uppercase tracking-widest text-[11px] hover:border-red-500/50 hover:text-red-600 transition-all flex items-center justify-center gap-3 mt-4">
                                                <Plus size={18} /> Import Lead Data
                                            </button>
                                        </div>
                                    )}

                                    {crmTab === 'leads' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="grid grid-cols-1 gap-4">
                                                {leadMetrics.map((lead) => (
                                                    <div key={lead.id} className="p-6 bg-white border border-slate-100 rounded-[30px] hover:shadow-xl transition-all group overflow-hidden relative">
                                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                            <BarChart3 size={80} className="text-red-600" />
                                                        </div>
                                                        <div className="flex items-center justify-between relative z-10">
                                                            <div className="flex items-center gap-6">
                                                                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-lg font-black">
                                                                    {lead.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-black text-slate-800 tracking-tight text-lg">{lead.name}</h4>
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lead.industry}</span>
                                                                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                                                        <span className="text-[10px] font-bold text-red-600 uppercase">Budget: {lead.budget}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-10">
                                                                <div className="grid grid-cols-3 gap-6 text-center">
                                                                    <div>
                                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Frequency</p>
                                                                        <p className="text-sm font-black text-slate-800">{lead.frequency}x</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Opens</p>
                                                                        <p className="text-sm font-black text-slate-800">{lead.opens}%</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Visits</p>
                                                                        <p className="text-sm font-black text-slate-800">{lead.visits}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right border-l border-slate-100 pl-8">
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Score</p>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${lead.status === 'Hot' ? 'bg-red-50 text-red-600' : lead.status === 'Warm' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
                                                                            {lead.status}
                                                                        </span>
                                                                        <span className="text-2xl font-black text-slate-900 tabular-nums">{lead.score}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                                                            <p className="text-[10px] text-slate-500 italic font-medium">
                                                                AI Intel: {lead.score > 80 ? "High intent detected. Priority for immediate follow-up." : "Nurture required. Suggest low-commitment touchpoint."}
                                                            </p>
                                                            <button
                                                                onClick={() => handleAction('aibiz_score_lead')}
                                                                className="flex items-center gap-2 text-[10px] font-black uppercase text-red-600 hover:text-red-700 transition-colors"
                                                            >
                                                                Quick Score Analysis <ArrowRight size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedCustomer && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => setSelectedCustomer(null)}
                                                    className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-red-600 transition-all border-b border-transparent hover:border-red-600/30 pb-0.5"
                                                >
                                                    <ArrowRight size={14} className="rotate-180" /> Back to Accounts
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Intelligence Session</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                <div className="lg:col-span-2 space-y-8">
                                                    {/* Profile Header */}
                                                    <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[40px] p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                                                        <div className="flex items-center gap-8">
                                                            <div className="w-24 h-24 rounded-[32px] bg-slate-900 flex items-center justify-center text-4xl font-black text-white shadow-2xl relative group-hover:scale-105 transition-transform">
                                                                {selectedCustomer.name.charAt(0)}
                                                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white border-4 border-white">
                                                                    <Shield size={14} />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2">{selectedCustomer.name}</h2>
                                                                <div className="flex flex-wrap items-center gap-4">
                                                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200/50 rounded-full">
                                                                        <Layers size={12} className="text-slate-500" />
                                                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{selectedCustomer.industry}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-sm">
                                                                        <Users size={12} className="text-red-500" />
                                                                        <span className="text-[10px] font-bold text-slate-500 italic">POC: {selectedCustomer.contact}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right bg-slate-50/50 px-8 py-5 rounded-[30px] border border-slate-100">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Portfolio Health</p>
                                                            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[12px] font-black uppercase tracking-wider shadow-sm ${selectedCustomer.health > 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                                    selectedCustomer.health > 50 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                                        'bg-red-50 text-red-600 border border-red-100'
                                                                }`}>
                                                                {selectedCustomer.status} • {selectedCustomer.health}%
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Recent Interactions Table */}
                                                    <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm overflow-hidden">
                                                        <div className="flex items-center justify-between mb-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                                                                    <Calendar size={20} />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Timeline Activity</h3>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Last 30 Days Context</p>
                                                                </div>
                                                            </div>
                                                            <button className="px-5 py-2.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">Export Logs</button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {interactions.map((msg, i) => (
                                                                <div key={i} className="flex gap-6 p-6 bg-slate-50/30 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/20 rounded-[32px] transition-all group active:scale-[0.99]">
                                                                    <div className="text-center min-w-[70px]">
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{msg.date.split('-')[1]} MONTH</p>
                                                                        <p className="text-xl font-black text-slate-700 mt-1">{msg.date.split('-')[2]}</p>
                                                                        <div className="mt-3 w-10 h-10 mx-auto rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm group-hover:text-red-500 group-hover:bg-red-50 transition-all">
                                                                            {msg.type === 'Email' ? <Mail size={16} /> : msg.type === 'Call' ? <Activity size={16} /> : <MessageSquare size={16} />}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1 border-l border-slate-100/50 pl-6">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <h4 className="text-[15px] font-black text-slate-800 tracking-tight">{msg.subject}</h4>
                                                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${msg.sentiment === 'Positive' ? 'text-emerald-500 bg-emerald-50 border border-emerald-100' :
                                                                                    msg.sentiment === 'Negative' ? 'text-red-500 bg-red-50 border border-red-100' :
                                                                                        'text-slate-400 bg-slate-100 border border-slate-200'
                                                                                }`}>{msg.sentiment}</span>
                                                                        </div>
                                                                        <p className="text-[13px] text-slate-500 leading-relaxed font-medium mb-3">{msg.summary}</p>
                                                                        <div className="flex items-center gap-4">
                                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{msg.type} LOGGED</span>
                                                                            <span className="text-[10px] font-black text-red-500/50 uppercase tracking-widest hover:text-red-600 cursor-pointer">View Analysis</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-8">
                                                    {/* Deep Analysis Engine */}
                                                    <div className="bg-slate-900 rounded-[45px] p-8 text-white shadow-2xl relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/30 blur-[70px] group-hover:bg-red-600/40 transition-all duration-500"></div>
                                                        <div className="relative z-10 flex flex-col h-full min-h-[350px]">
                                                            <div className="mb-8">
                                                                <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-xl shadow-red-600/30 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                                                    <Sparkles size={28} />
                                                                </div>
                                                                <h3 className="text-2xl font-black tracking-tight leading-tight">Sync & Analyze Account Health</h3>
                                                                <p className="text-sm text-slate-400 mt-4 leading-relaxed font-medium">AISA will cross-reference interaction sentiment with health KPIs to detect churn patterns and draft a recovery strategy.</p>
                                                            </div>

                                                            <div className="space-y-4 mb-8">
                                                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                                                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Anomaly Detection: Enabled</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Personalization Index: 92%</span>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => handleAction('aibiz_analyze_crm')}
                                                                disabled={isProcessing}
                                                                className="mt-auto w-full py-5 bg-white text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all transform active:scale-95 shadow-2xl shadow-black/20 flex items-center justify-center gap-3"
                                                            >
                                                                {isProcessing ? 'Synchronizing Data...' : <><Zap size={16} className="text-amber-500" /> Deep Intelligence Sync</>}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Risk & Opportunity Micro-Charts */}
                                                    <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
                                                        <div className="flex items-center gap-3 mb-8">
                                                            <Activity size={18} className="text-red-600" />
                                                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Account Intelligence Metrics</h3>
                                                        </div>
                                                        <div className="space-y-8">
                                                            <div className="group">
                                                                <div className="flex justify-between items-end mb-3">
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Churn Probability Score</span>
                                                                    <span className="text-lg font-black text-red-500 tabular-nums">{100 - selectedCustomer.health}%</span>
                                                                </div>
                                                                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${100 - selectedCustomer.health}%` }}
                                                                        className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="group">
                                                                <div className="flex justify-between items-end mb-3">
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Expansion Readiness</span>
                                                                    <span className="text-lg font-black text-emerald-500 tabular-nums">{selectedCustomer.health > 70 ? 'High Potential' : 'Moderate'}</span>
                                                                </div>
                                                                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${selectedCustomer.health > 70 ? 88 : 42}%` }}
                                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-8 pt-6 border-t border-slate-50">
                                                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                                                "AISA Insight: Last interaction sentiment was {interactions[0].sentiment.toLowerCase()}, suggest {selectedCustomer.health < 60 ? 'retention sequence' : 'upsell outreach'}."
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {currentMode === 'Segments' && (
                                <motion.div key="segments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="col-span-full space-y-8">
                                    <div className="flex items-center justify-between bg-white/60 backdrop-blur-xl border border-white/60 p-8 rounded-[40px] shadow-sm">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Behavioral <span className="text-red-600">Segments</span></h2>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">AI-Driven RFM Clustering & Persona Generation</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-4">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600`}>U{i}</div>
                                                ))}
                                            </div>
                                            <button onClick={() => handleAction('aibiz_segment_customers')} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                <Zap size={14} className="text-amber-400" /> Refine Clusters
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                        {segments.map((segment) => (
                                            <div key={segment.id} className="bg-white border border-slate-100 rounded-[40px] p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                                    <Layers size={100} style={{ color: segment.color }} />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${segment.color}15`, color: segment.color }}>
                                                            <Users size={24} />
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RFM: {segment.rfm}</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-2">{segment.name}</h3>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Persona: <span style={{ color: segment.color }}>{segment.persona}</span></p>

                                                    <div className="flex items-end justify-between border-t border-slate-50 pt-6">
                                                        <div>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Users</p>
                                                            <p className="text-3xl font-black text-slate-800 tabular-nums">{segment.count}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Behavior</p>
                                                            <p className="text-xs font-black text-slate-600 uppercase">{segment.behavior}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 p-4 rounded-2xl bg-slate-50 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                                                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">"{segment.details}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                        <div className="xl:col-span-2 bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
                                            <div className="flex items-center justify-between mb-8">
                                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Monetary vs Frequency Matrix</h4>
                                                <div className="flex items-center gap-4">
                                                    {segments.map(s => (
                                                        <div key={s.id} className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                                                            <span className="text-[9px] font-bold text-slate-500 uppercase">{s.persona}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="h-80 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={revenueData}>
                                                        <defs>
                                                            <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v) => `$${v / 1000}k`} />
                                                        <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                                        <Area type="monotone" dataKey="mrr" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorMrr)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                                <Sparkles size={120} />
                                            </div>
                                            <div className="relative z-10 h-full flex flex-col">
                                                <h4 className="text-sm font-black text-red-500 uppercase tracking-widest mb-6">AI Segmentation Insight</h4>
                                                <div className="space-y-8 flex-1">
                                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                                        <p className="text-[12px] font-medium leading-relaxed italic text-slate-300">
                                                            "We've detected a significant migration of 'High-Value Buyers' toward the 'Enterprise Prospect' cluster. This suggests your last product update resonates well with larger teams."
                                                        </p>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase">Retention Health</span>
                                                            <span className="text-xs font-black text-emerald-400">92%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={handleAction} className="mt-10 w-full py-5 bg-red-600 rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-3">
                                                    <Settings size={18} /> Automate Segment Actions
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentMode === 'Campaigns' && (
                                <motion.div key="campaigns" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="col-span-full space-y-8">
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        {/* Campaign Configuration */}
                                        <div className="w-full lg:w-1/3 space-y-6">
                                            <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">Campaign <span className="text-red-600">Forge</span></h3>

                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Target Segment</label>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {segments.map(s => (
                                                                <button
                                                                    key={s.id}
                                                                    onClick={() => setSelectedSegmentId(s.id)}
                                                                    className={`p-4 rounded-2xl border text-left transition-all ${selectedSegmentId === s.id ? 'border-red-500 bg-red-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                                                                >
                                                                    <p className="text-xs font-black text-slate-800">{s.name}</p>
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{s.count} Users</p>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Channel</label>
                                                            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
                                                                <button onClick={() => setCampaignChannel('Email')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${campaignChannel === 'Email' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400'}`}>Email</button>
                                                                <button onClick={() => setCampaignChannel('WhatsApp')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${campaignChannel === 'WhatsApp' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400'}`}>WA</button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Goal</label>
                                                            <select
                                                                value={campaignGoal}
                                                                onChange={(e) => setCampaignGoal(e.target.value)}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[10px] font-bold outline-none focus:border-red-500 transition-all"
                                                            >
                                                                <option>Upsell</option>
                                                                <option>Re-engagement</option>
                                                                <option>Education</option>
                                                                <option>Churn Recovery</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <button onClick={handleAction} className="w-full py-5 bg-red-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all flex items-center justify-center gap-3">
                                                        <Sparkles size={18} /> Generate Campaign
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                                                    <Zap size={80} />
                                                </div>
                                                <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-4">AI Optimizer</h4>
                                                <p className="text-xs font-medium text-slate-300 leading-relaxed italic mb-6">
                                                    "Current segment engagement is highest on Tuesdays at 2 PM. I'll pre-schedule Variaint B for that window."
                                                </p>
                                                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                                                    <div>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Send Time</p>
                                                        <p className="text-sm font-black text-white uppercase">Tue, 14:00</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue Meta</p>
                                                        <p className="text-[10px] font-bold text-slate-400">BullMQ / Resend</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Campaign Preview & A/B Variants */}
                                        <div className="flex-1 space-y-8">
                                            <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                                                <div className="flex items-center justify-between mb-8">
                                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                        <Mail size={16} className="text-red-600" /> Variant Intelligence
                                                    </h4>
                                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                                        <span className="px-4 py-1.5 bg-white rounded-lg text-[9px] font-black text-red-600 shadow-sm uppercase">Variant A</span>
                                                        <span className="px-4 py-1.5 text-[9px] font-black text-slate-400 uppercase">Variant B</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Line</p>
                                                        <p className="text-lg font-black text-slate-800 leading-tight">🎁 Exclusive Early Access to SaaS Engine v2.0</p>
                                                    </div>

                                                    <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm relative">
                                                        <div className="absolute top-4 right-4 flex gap-1">
                                                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Message body</p>
                                                        <div className="prose prose-sm prose-slate max-w-none">
                                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                                Hi there,<br /><br />
                                                                As one of our **{segments.find(s => s.id === selectedSegmentId)?.name}**, we noticed you haven't explored the latest AI orchestration updates. We've built these specifically for teams like yours who focus on **{segments.find(s => s.id === selectedSegmentId)?.behavior}**...
                                                            </p>
                                                        </div>
                                                        <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                                                            <div className="px-6 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20">
                                                                Claim Free Upgrade
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Predicted CTR</p>
                                                                <p className="text-xl font-black text-emerald-600">8.4%</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                                        <div className="p-6 bg-emerald-50/30 border border-emerald-100 rounded-[28px]">
                                                            <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-3">CTA Suggestions</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className="px-3 py-1.5 bg-white border border-emerald-100 rounded-xl text-[9px] font-bold text-emerald-700">Start Free Trial</span>
                                                                <span className="px-3 py-1.5 bg-white border border-emerald-100 rounded-xl text-[9px] font-bold text-emerald-700">Book Demo</span>
                                                                <span className="px-3 py-1.5 bg-white border border-emerald-100 rounded-xl text-[9px] font-bold text-emerald-700">Upgrade Now</span>
                                                            </div>
                                                        </div>
                                                        <div className="p-6 bg-blue-50/30 border border-blue-100 rounded-[28px]">
                                                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-3">A/B AI Test Logic</p>
                                                            <p className="text-[11px] text-blue-800 leading-relaxed italic">
                                                                "Testing 'Fear of Missing Out' vs 'Direct Benefit' hooks to optimize conversions for this cluster."
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer Controls */}
                        <div className="mt-auto p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                            <div className="flex gap-3">
                                <button className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-all shadow-sm">
                                    <Bell size={20} />
                                </button>
                                <button className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-all shadow-sm">
                                    <Settings size={20} />
                                </button>
                            </div>
                            <button
                                onClick={onClearWorkspace}
                                className="px-8 py-3 rounded-2xl border border-slate-200 text-slate-400 hover:text-slate-800 text-[11px] font-black uppercase tracking-widest transition-all bg-white shadow-sm"
                            >
                                Reset Terminal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIBIZInputs;
