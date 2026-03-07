import React, { useState, useRef } from 'react';
import {
    Activity, User, Minus, Plus, Scale, Utensils, Salad, Zap,
    FileText, BarChart3, ChevronRight, Heart, Brain, Stethoscope, ClipboardList,
    PenTool, Upload, Smile, Frown, Coffee, Wind, Play, Pause, Volume2, AlertCircle,
    Search, History, Trash2, Sparkles, MessageSquare, X, Shield, Bell, ShieldCheck, Eye,
    Moon, Droplets, Footprints, Thermometer, Clock8, Clock, BrainCircuit, FilePieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../../Components/AISAWorkSpace/CustomSelect';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import TaskModal from '../../pages/AiPersonalAssistant/TaskModal';

const HEALTH_MODES = [
    { id: 'SYMPTOM CHECKER', label: 'Check Your Symptoms', icon: Activity },
    { id: 'REPORT ANALYZER', label: 'Analyze My Report', icon: ClipboardList },
    { id: 'WELLNESS PLANNER', label: 'My Wellness Plan', icon: Heart },
    { id: 'MENTAL SUPPORT', label: 'Mental Health Support', icon: Brain },
    { id: 'TREATMENT ADVISOR', label: 'Treatment & Medicine Advisor', icon: Stethoscope },
    { id: 'AUTOMATION', label: 'AI Automation', icon: Zap }
];

const AIHEALTHInputs = ({
    healthMode, setHealthMode,
    healthName, setHealthName,
    healthAge, setHealthAge,
    healthGender, setHealthGender,
    healthWeight, setHealthWeight,
    healthHeight, setHealthHeight,
    healthGoal, setHealthGoal,
    healthDietaryType, setHealthDietaryType,
    healthAllergies, setHealthAllergies,
    healthCuisine, setHealthCuisine,
    healthActiveMonth, setHealthActiveMonth,
    symptoms, setSymptoms,
    symptomDuration, setSymptomDuration,
    symptomSeverity, setSymptomSeverity,
    symptomTreatmentType, setSymptomTreatmentType,
    symptomResult, setSymptomResult,
    reportManualValues, setReportManualValues,
    reportResult, setReportResult,
    reportFile, setReportFile,
    healthActivityLevel, setHealthActivityLevel,
    wellnessPlanResult, setWellnessPlanResult,
    healthMood, setHealthMood,
    mentalNote, setMentalNote,
    mentalResult, setMentalResult,
    moodHistory, setMoodHistory,
    medicineName, setMedicineName,
    treatmentTypeChoice, setTreatmentTypeChoice,
    healthCondition, setHealthCondition,
    treatmentResult, setTreatmentResult,
    healthAutomationActive, setHealthAutomationActive,
    healthAutomationLogs, setHealthAutomationLogs,
    healthAlerts, setHealthAlerts,
    automationResult, setAutomationResult,
    handleAction,
    onClearWorkspace,
    includeAyurveda,
    setIncludeAyurveda,
    wellnessHistory, setWellnessHistory,
    healthSleepHours, setHealthSleepHours,
    healthWaterIntake, setHealthWaterIntake,
    healthSteps, setHealthSteps,
    healthHeartRate, setHealthHeartRate,
    healthStressLevel, setHealthStressLevel,
    healthRoutine, setHealthRoutine,
    reportHistory,
    setReportHistory,
    symptomHistory,
    setSymptomHistory,
    treatmentHistory,
    setTreatmentHistory,
    sessions,
    currentSessionId,
    onDeleteSession,
    navigate
}) => {
    const [isLocalHistoryOpen, setIsLocalHistoryOpen] = useState(false);
    const [isDraggingReport, setIsDraggingReport] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const fileInputRef = useRef(null);

    // --- HEALTH TASKS (INTEGRATION) ---
    const [healthTasks, setHealthTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
    const [editingHealthTask, setEditingHealthTask] = useState(null);

    useEffect(() => {
        if (healthMode === 'AUTOMATION') {
            fetchHealthTasks();
        }
    }, [healthMode]);

    const fetchHealthTasks = async () => {
        setLoadingTasks(true);
        try {
            const tasks = await apiService.getPersonalTasks({ category: 'Health' });
            setHealthTasks(tasks.filter(t => t.category === 'Health'));
        } catch (err) {
            console.error("Failed to load health tasks:", err);
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleSaveHealthTask = async (taskData) => {
        try {
            if (editingHealthTask) {
                await apiService.updatePersonalTask(editingHealthTask._id, taskData);
                toast.success("Task Updated");
            } else {
                await apiService.createPersonalTask({ ...taskData, category: 'Health' });
                toast.success("Task Created");
            }
            setIsAssistantModalOpen(false);
            setEditingHealthTask(null);
            fetchHealthTasks();
        } catch (err) {
            toast.error("Failed to save task");
        }
    };

    const handleDeleteHealthTask = async (id) => {
        if (!window.confirm("Delete this reminder?")) return;
        try {
            await apiService.deletePersonalTask(id);
            setHealthTasks(prev => prev.filter(t => t._id !== id));
            toast.success("Task Deleted");
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const toggleTaskComplete = async (task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        try {
            await apiService.updatePersonalTask(task._id, { status: newStatus });
            setHealthTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
            toast.success("Status Updated");
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const renderHistoryList = (isCompact = false) => {
        const filteredSessions = sessions?.filter(session => {
            const isHealth = (session.agentType || '').toUpperCase() === 'AIHEALTH';
            const matchesSearch = session.title?.toLowerCase().includes(historySearch.toLowerCase());
            return isHealth && matchesSearch;
        });

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
                        className={`group bg-white rounded-[35px] ${isCompact ? 'p-5' : 'p-8'} border transition-all cursor-pointer relative shadow-sm hover:shadow-xl hover:shadow-blue-500/5 ${currentSessionId === session.sessionId ? 'border-[#5865f2] ring-4 ring-[#5865f2]/5' : 'border-slate-50 hover:border-[#5865f2]/20'}`}
                        onClick={() => {
                            navigate(`/dashboard/workspace/AIHEALTH/${session.sessionId}`);
                            setIsLocalHistoryOpen(false);
                        }}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentSessionId === session.sessionId ? 'bg-[#5865f2] text-white shadow-lg shadow-[#5865f2]/30' : 'bg-[#f0f4ff] text-[#5865f2]'}`}>
                                    <MessageSquare size={16} />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className={`text-sm font-black tracking-tight truncate max-w-[150px] ${currentSessionId === session.sessionId ? 'text-slate-800' : 'text-slate-600'}`}>
                                        {session.title || 'New Wellness Plan'}
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

    const renderActionControls = () => (
        <div className={`flex items-center justify-center gap-4 py-4 relative ${isLocalHistoryOpen ? 'z-[110]' : 'z-10'}`}>
            <div className="relative">
                <button
                    onClick={() => setIsLocalHistoryOpen(!isLocalHistoryOpen)}
                    className={`flex items-center gap-2 px-6 py-3.5 border rounded-[22px] text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${isLocalHistoryOpen ? 'bg-[#5865f2] border-[#5865f2] text-white' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                >
                    <History size={14} className={isLocalHistoryOpen ? 'text-white' : 'text-slate-300'} /> HISTORY
                </button>

                <AnimatePresence>
                    {isLocalHistoryOpen && (
                        <>
                            {/* Full-screen Backdrop Blur for maximum visibility */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsLocalHistoryOpen(false)}
                                className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                style={{ x: '-50%', y: '-50%' }}
                                className="fixed top-1/2 left-1/2 w-[90%] max-w-[400px] bg-white rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-white p-8 z-[201]"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <History size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Health Records</h4>
                                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Search History</h3>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsLocalHistoryOpen(false)}
                                        className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all flex items-center justify-center"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="relative mb-6">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                        <Search size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={historySearch}
                                        onChange={(e) => setHistorySearch(e.target.value)}
                                        placeholder="Search medical history..."
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-[22px] py-4 pl-12 pr-6 text-[11px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                                    />
                                </div>

                                <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {renderHistoryList(true)}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
            <button
                onClick={onClearWorkspace}
                className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-100 rounded-[22px] text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
            >
                <Trash2 size={14} className="text-slate-300" /> CLEAR
            </button>
        </div>
    );
    // Basic BMI Calculation
    const bmi = (healthWeight && healthHeight)
        ? (healthWeight / ((healthHeight / 100) * (healthHeight / 100))).toFixed(1)
        : null;

    return (
        <div className="col-span-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 w-full">

            {/* Clinical Elite Header */}
            <div className="bg-white border border-slate-200/60 rounded-[20px] p-4 flex flex-col xl:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4 pl-2">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-blue-600 fill-blue-600/10" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-[16px] font-black tracking-tight leading-none bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase">AIHEALTH <span className="text-slate-300 font-light ml-1">SYSTEMS</span></h2>
                            <div className="px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-900 to-slate-900 text-[8px] font-black text-white uppercase tracking-[0.1em]">
                                Verified Pro
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1.5 flex items-center gap-2">
                            Quantum Analysis <span className="w-1 h-1 rounded-full bg-slate-200"></span> Bio-Intelligence Engine
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap lg:flex-nowrap items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    {HEALTH_MODES.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setHealthMode(mode.id)}
                            className={`flex items-center gap-3 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${healthMode === mode.id
                                ? 'bg-white text-blue-600 shadow-xl shadow-blue-500/10 ring-1 ring-blue-100/50 scale-[1.02]'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
                                }`}
                        >
                            <mode.icon className={`w-4 h-4 transition-transform duration-500 ${healthMode === mode.id ? 'scale-110 text-blue-500' : 'text-slate-300'}`} />
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            {healthMode === 'SYMPTOM CHECKER' && (
                <div className="space-y-8 pb-10 w-full">
                    <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-8 lg:p-12 shadow-xl shadow-blue-500/5 space-y-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/5 border border-blue-100/50">
                                <Activity className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 rounded-full inline-block tracking-[0.2em] mb-2 uppercase">Intelligence AI</h3>
                                <h3 className="text-3xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 bg-clip-text text-transparent">Check Your Symptoms</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    Real-time symptom analysis and health intelligence
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                            {/* Left Column: Symptom Entry */}
                            <div className="lg:col-span-7 space-y-4 flex flex-col">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Diagnostic Description</label>
                                </div>
                                <textarea
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder="Describe your symptoms in detail (e.g., location, duration, triggers)..."
                                    className="w-full flex-grow bg-white/60 border border-slate-100 rounded-[35px] px-8 py-7 text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all shadow-sm placeholder:text-slate-300 min-h-[250px] resize-none leading-relaxed"
                                />
                            </div>

                            {/* Right Column: Parameters Dashboard */}
                            <div className="lg:col-span-5 space-y-8 bg-blue-50/20 border border-blue-100/30 p-10 rounded-[45px] flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-blue-600/60 uppercase tracking-[0.2em] px-2 leading-none">Onset Timeline</label>
                                        <CustomSelect
                                            value={symptomDuration}
                                            onChange={(e) => setSymptomDuration(e.target.value)}
                                            options={['Just Started', '1-3 Days', '1 Week', 'Chronic (1 Month+)']}
                                            className="premium-select"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-blue-600/60 uppercase tracking-[0.2em] px-2 leading-none">Treatment Goal</label>
                                        <CustomSelect
                                            value={symptomTreatmentType}
                                            onChange={(e) => setSymptomTreatmentType(e.target.value)}
                                            options={['Allopathy', 'Ayurveda', 'Homeopathy', 'Holistic/Natural']}
                                            className="premium-select"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Symptom Trajectory Chart */}
                                <div className="mt-4 p-6 bg-white border border-blue-100/50 rounded-[35px] shadow-sm">
                                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Health Stability Trajectory</h5>
                                    <div className="h-[100px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={symptomHistory}>
                                                <defs>
                                                    <linearGradient id="colorSymptom" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="date" hide />
                                                <YAxis hide domain={[0, 6]} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', fontSize: '10px' }} />
                                                <Area type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSymptom)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-blue-100/60 mt-auto">
                                    <div className="flex justify-between items-center px-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Symptom Severity</label>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${symptomSeverity === 'High' ? 'bg-rose-50 text-rose-500' : symptomSeverity === 'Medium' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                            {symptomSeverity}
                                        </span>
                                    </div>
                                    <div className="relative h-2 bg-white/60 rounded-full cursor-pointer group shadow-inner">
                                        <div
                                            className={`absolute h-full rounded-full transition-all duration-500 ${symptomSeverity === 'High' ? 'bg-rose-500' : symptomSeverity === 'Medium' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                                            style={{ width: symptomSeverity === 'High' ? '100%' : symptomSeverity === 'Medium' ? '50%' : '15%' }}
                                        />
                                        <div className="flex justify-between absolute -bottom-6 w-full px-1">
                                            {['Low', 'Medium', 'High'].map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => setSymptomSeverity(level)}
                                                    className={`text-[9px] font-black uppercase tracking-widest transition-colors ${symptomSeverity === level ? 'text-blue-700' : 'text-slate-300 hover:text-slate-400'}`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {renderActionControls()}

                        <div className="pt-2 flex justify-center">
                            <button
                                onClick={() => handleAction('aihealth_check_symptoms')}
                                className="px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] text-[13px] font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(37,99,235,0.25)] hover:scale-[1.05] active:scale-[0.95] transition-all duration-500 flex items-center justify-center gap-4 group"
                            >
                                <Zap className="w-5 h-5 fill-white group-hover:animate-pulse" />
                                <span>Initiate Diagnostic Scan</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {symptomResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-8 lg:p-12 shadow-xl shadow-blue-500/5 space-y-10"
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="text-2xl font-black text-slate-800 tracking-tight">Clinical Intelligence Report</h4>
                                <div className={`px-5 py-2 rounded-full flex items-center gap-3 border ${symptomResult.riskLevel === 'High' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                                    symptomResult.riskLevel === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                                        'bg-emerald-50 border-emerald-100 text-emerald-500'
                                    }`}>
                                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${symptomResult.riskLevel === 'High' ? 'bg-rose-500' :
                                        symptomResult.riskLevel === 'Medium' ? 'bg-amber-500' :
                                            'bg-emerald-500'
                                        }`} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Safety Index: {symptomResult.riskLevel}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        Potential Causes
                                    </h5>
                                    <div className="space-y-3">
                                        {symptomResult.possibleCauses?.map((cause, i) => (
                                            <div key={i} className="flex items-center gap-5 p-6 bg-white/60 border border-white rounded-[30px] text-[13px] font-bold text-slate-700 shadow-sm border-l-[6px] border-l-blue-500/20 hover:border-l-blue-500 transition-all">
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                </div>
                                                {cause}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100/50">
                                            <Scale className="w-5 h-5" />
                                        </div>
                                        Recommended Protocol
                                    </h5>
                                    <div className="space-y-3">
                                        {symptomResult.recommendations?.map((rec, i) => (
                                            <div key={i} className="flex items-center gap-5 p-6 bg-white/60 border border-white rounded-[30px] text-[13px] font-bold text-slate-700 shadow-sm border-l-[6px] border-l-emerald-500/20 hover:border-l-emerald-500 transition-all">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                </div>
                                                {rec}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-blue-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-1/2 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-20 h-20 rounded-[28px] bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                                        <Shield className="w-10 h-10 text-blue-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <h6 className="text-[11px] font-black uppercase tracking-widest text-blue-300">Clinical Advisory Overview</h6>
                                        <p className="text-[14px] font-bold leading-relaxed text-blue-50/90 italic">
                                            "{symptomResult.doctorAdvice}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {
                healthMode === 'REPORT ANALYZER' && (
                    <div className="space-y-8 pb-10 w-full">
                        <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-8 lg:p-12 shadow-xl shadow-blue-500/5 space-y-12">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/5 border border-blue-100/50">
                                        <ClipboardList className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-[10px] font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 rounded-full inline-block tracking-[0.2em] mb-2 uppercase">Diagnostic AI</h3>
                                        <h3 className="text-3xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 bg-clip-text text-transparent leading-tight">Analyze My Report</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                            Medical report interpretation and biometric intelligence
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                                {/* Left Column: PDF Upload Area */}
                                <div className="lg:col-span-6 space-y-6">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Upload Scientific Data (PDF)</label>
                                    <div
                                        className={`relative group border-2 border-dashed rounded-[40px] p-10 flex flex-col items-center justify-center gap-4 transition-all duration-500 min-h-[300px] cursor-pointer ${reportFile ? 'bg-blue-50/50 border-blue-200' : isDraggingReport ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-100 hover:border-blue-500/30 hover:bg-blue-50/20'}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDraggingReport(true);
                                        }}
                                        onDragEnter={(e) => {
                                            e.preventDefault();
                                            setIsDraggingReport(true);
                                        }}
                                        onDragLeave={(e) => {
                                            e.preventDefault();
                                            setIsDraggingReport(false);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDraggingReport(false);
                                            const file = e.dataTransfer.files[0];
                                            if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
                                                setReportFile(file);
                                            }
                                        }}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) setReportFile(file);
                                            }}
                                        />
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${reportFile ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-50 text-slate-300 group-hover:scale-110'}`}>
                                            {reportFile ? <FileText className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-sm font-black ${reportFile ? 'text-blue-600' : 'text-slate-500'}`}>
                                                {reportFile ? reportFile.name : isDraggingReport ? 'Drop to Vectorize' : 'Drop Laboratory Report'}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 px-6">
                                                {reportFile ? `Vectorizing ${(reportFile.size / 1024 / 1024).toFixed(2)} MB Payload` : 'Support for full blood work & hormonal profiles'}
                                            </p>
                                        </div>
                                        {reportFile && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setReportFile(null);
                                                }}
                                                className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-md text-slate-400 hover:text-rose-500 transition-all border border-slate-100"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Manual Entry Form */}
                                <div className="lg:col-span-6 space-y-6 bg-slate-50/50 border border-slate-100 p-10 rounded-[45px]">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Manual Sensor Data</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {[
                                            { id: 'glucose', label: 'Glucose', unit: 'mg/dL', icon: Activity },
                                            { id: 'cholesterol', label: 'Cholesterol', unit: 'mg/dL', icon: Zap },
                                            { id: 'haemoglobin', label: 'HB (Blood)', unit: 'g/dL', icon: Heart },
                                            { id: 'bp_systolic', label: 'Systolic', unit: 'mmHg', icon: Activity },
                                            { id: 'bp_diastolic', label: 'Diastolic', unit: 'mmHg', icon: Activity }
                                        ].map(field => (
                                            <div key={field.id} className="space-y-3">
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[9px] font-black text-slate-400 tracking-tight uppercase">{field.label}</span>
                                                    <span className="text-[8px] font-bold text-blue-400 italic bg-blue-50 px-2 py-0.5 rounded-lg">{field.unit}</span>
                                                </div>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                                        <field.icon className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={reportManualValues[field.id]}
                                                        onChange={(e) => setReportManualValues({ ...reportManualValues, [field.id]: e.target.value })}
                                                        placeholder="0.00"
                                                        className="w-full bg-white border border-slate-100 rounded-[24px] py-4 pl-12 pr-6 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {renderActionControls()}

                            <div className="pt-2 flex justify-center">
                                <button
                                    onClick={() => handleAction('aihealth_analyze_report')}
                                    disabled={!reportFile && !Object.values(reportManualValues).some(v => v)}
                                    className="px-16 py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-[32px] text-[13px] font-black uppercase tracking-[0.25em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-4 group"
                                >
                                    <Zap className="w-5 h-5 fill-white group-hover:animate-pulse" />
                                    <span>Generate Health Insights</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {reportResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-8 lg:p-12 shadow-xl shadow-blue-500/5 space-y-12"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                                    {/* Risk Summary Card */}
                                    <div className="lg:col-span-5 space-y-8">
                                        <div className="p-10 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 text-white rounded-[45px] relative overflow-hidden shadow-2xl">
                                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                                <Activity className="w-32 h-32" />
                                            </div>
                                            <div className="relative z-10 space-y-6">
                                                <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Health Risk Summary</h4>
                                                <p className="text-xl font-black leading-snug">
                                                    {reportResult.explanation}
                                                </p>
                                                <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                                        <Brain className="w-6 h-6 text-blue-300" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-black text-blue-300 uppercase tracking-widest">AI Confidence</div>
                                                        <div className="text-sm font-black">98.4% Accuracy Scan</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Visual Metrics & History Dashboard */}
                                        <div className="space-y-6">
                                            <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Diagnostic Trends</h5>
                                                <div className="h-[180px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={reportHistory}>
                                                            <defs>
                                                                <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                                                            <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                                                            <Area type="monotone" dataKey="anomalies" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorReport)" />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Current Flagged Intensity</h5>
                                                <div className="h-[150px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={reportResult.abnormalFindings?.map((f, i) => ({ name: f.parameter, intensity: (f.status === 'High' || f.status === 'Critical') ? 90 : 45 })) || []}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                            <XAxis dataKey="name" hide />
                                                            <Tooltip />
                                                            <Area type="step" dataKey="intensity" stroke="#f43f5e" strokeWidth={2} fill="#fff1f2" />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Findings & Suggestions */}
                                    <div className="lg:col-span-7 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <h5 className="text-[11px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                                        <Activity className="w-4 h-4" />
                                                    </div>
                                                    Abnormal Findings
                                                </h5>
                                                <div className="space-y-3">
                                                    {reportResult.abnormalFindings?.map((finding, i) => (
                                                        <div key={i} className="p-5 bg-white border border-rose-100 rounded-3xl flex items-center justify-between shadow-sm hover:border-rose-300 transition-colors">
                                                            <span className="text-xs font-black text-slate-700">{finding.parameter}</span>
                                                            <span className="text-[11px] font-black text-rose-500 py-1.5 px-3 bg-rose-50 rounded-xl shadow-inner">{finding.value} {finding.unit}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <h5 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                        <Utensils className="w-4 h-4" />
                                                    </div>
                                                    Smart Suggestions
                                                </h5>
                                                <div className="space-y-3">
                                                    {reportResult.dietSuggestions?.map((diet, i) => (
                                                        <div key={i} className="p-5 bg-white border border-emerald-100 rounded-3xl text-[12px] font-bold text-slate-700 flex gap-4 shadow-sm group hover:border-emerald-300 transition-colors">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                                                            {diet}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[35px] space-y-4">
                                            <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-3">
                                                <Zap className="w-4 h-4" /> Lifestyle Protocols
                                            </h5>
                                            <div className="flex flex-wrap gap-3">
                                                {reportResult.lifestyleTips?.map((tip, i) => (
                                                    <div key={i} className="px-5 py-3 bg-white border border-blue-200 rounded-[20px] text-[11px] font-black text-blue-700 shadow-sm">
                                                        #{tip}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )
            }

            {
                healthMode === 'WELLNESS PLANNER' && (
                    <div className="w-full space-y-10 pb-20">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Phase 1: Biometric Identity */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-10 shadow-xl shadow-blue-500/5 space-y-8 flex flex-col hover:border-blue-200 transition-colors"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50/50 flex items-center justify-center text-blue-600 shadow-md border border-blue-100/50">
                                        <User className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Identity</h3>
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Profile & Demographics</p>
                                    </div>
                                </div>

                                <div className="space-y-8 flex-1">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Clinical Name</label>
                                        <input
                                            type="text"
                                            value={healthName}
                                            onChange={(e) => setHealthName(e.target.value)}
                                            placeholder="Full Name"
                                            className="w-full bg-white border border-slate-50 rounded-[28px] px-8 py-6 text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all shadow-sm placeholder:text-slate-200"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Chronology</label>
                                            <div className="relative group">
                                                <input
                                                    type="number"
                                                    value={healthAge}
                                                    onChange={(e) => setHealthAge(parseInt(e.target.value) || 0)}
                                                    className="w-full bg-white border border-slate-50 rounded-[28px] px-8 py-6 text-[13px] font-bold text-slate-700 outline-none transition-all shadow-sm"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                                    <button onClick={() => setHealthAge(Math.max(0, healthAge - 1))} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all"><Minus size={12} /></button>
                                                    <button onClick={() => setHealthAge(healthAge + 1)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all"><Plus size={12} /></button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Gender</label>
                                            <CustomSelect
                                                value={healthGender}
                                                onChange={(e) => setHealthGender(e.target.value)}
                                                options={['Male', 'Female', 'Other']}
                                                className="premium-select"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Assessment Month</label>
                                        <CustomSelect
                                            value={healthActiveMonth}
                                            onChange={(e) => setHealthActiveMonth(e.target.value)}
                                            options={['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']}
                                            className="premium-select"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Phase 2: Biological Metrics */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-10 shadow-xl shadow-blue-500/5 space-y-8 flex flex-col hover:border-blue-200 transition-colors"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50/50 flex items-center justify-center text-blue-600 shadow-md border border-blue-100/50">
                                        <Activity className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Bio-Metrics</h3>
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Clinical Vitals</p>
                                    </div>
                                </div>

                                <div className="space-y-8 flex-1">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Body Weight (KG)</label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                value={healthWeight}
                                                onChange={(e) => setHealthWeight(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-slate-50 rounded-[28px] px-8 py-6 text-[13px] font-bold text-slate-700 outline-none transition-all shadow-sm"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                                <button onClick={() => setHealthWeight(Math.max(0, healthWeight - 1))} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all"><Minus size={12} /></button>
                                                <button onClick={() => setHealthWeight(healthWeight + 1)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all"><Plus size={12} /></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Height (CM)</label>
                                            <span className="text-[10px] font-black text-blue-600 uppercase">BMI Scan <span className="ml-1 text-slate-900 bg-blue-50 px-2 py-0.5 rounded-lg">{bmi || '--'}</span></span>
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                value={healthHeight}
                                                onChange={(e) => setHealthHeight(parseInt(e.target.value) || 0)}
                                                className="w-full bg-white border border-slate-50 rounded-[28px] px-8 py-6 text-[13px] font-bold text-slate-700 outline-none transition-all shadow-sm"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                                <button onClick={() => setHealthHeight(Math.max(0, healthHeight - 1))} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all"><Minus size={12} /></button>
                                                <button onClick={() => setHealthHeight(healthHeight + 1)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all"><Plus size={12} /></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Primary Goal</label>
                                            <CustomSelect
                                                value={healthGoal}
                                                onChange={(e) => setHealthGoal(e.target.value)}
                                                options={['Weight Loss', 'Muscle Gain', 'Stress Relief', 'Endurance']}
                                                className="premium-select"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Active Level</label>
                                            <CustomSelect
                                                value={healthActivityLevel}
                                                onChange={(e) => setHealthActivityLevel(e.target.value)}
                                                options={['Sedentary', 'Light', 'Moderate', 'Very Active', 'Athlete']}
                                                className="premium-select"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Phase 3: Nutritional Blueprint */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-10 shadow-xl shadow-blue-500/5 space-y-8 flex flex-col hover:border-blue-200 transition-colors"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50/50 flex items-center justify-center text-blue-600 shadow-md border border-blue-100/50">
                                        <Utensils className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Nutrition</h3>
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Dietary Strategy</p>
                                    </div>
                                </div>

                                <div className="space-y-8 flex-1">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Dietary Protocol</label>
                                        <CustomSelect
                                            value={healthDietaryType}
                                            onChange={(e) => setHealthDietaryType(e.target.value)}
                                            options={['Vegetarian', 'Vegan', 'Paleo', 'Keto', 'Omnivore']}
                                            className="premium-select"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Diagnostic Allergies</label>
                                        <input
                                            type="text"
                                            value={healthAllergies}
                                            onChange={(e) => setHealthAllergies(e.target.value)}
                                            placeholder="e.g. Peanuts, Dairy"
                                            className="w-full bg-white border border-slate-50 rounded-[28px] px-8 py-6 text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all shadow-sm placeholder:text-slate-200"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Cuisine Specialization</label>
                                        <input
                                            type="text"
                                            value={healthCuisine}
                                            onChange={(e) => setHealthCuisine(e.target.value)}
                                            placeholder="e.g. Mediterranean, Asian"
                                            className="w-full bg-white border border-slate-50 rounded-[28px] px-8 py-6 text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all shadow-sm placeholder:text-slate-200"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Centered Action Button */}
                        <div className="flex flex-col items-center gap-8 pt-8">
                            <div className="flex items-center gap-4 p-4 bg-white/40 backdrop-blur-xl rounded-[28px] border border-white/50 shadow-sm">
                                <button
                                    onClick={() => setIncludeAyurveda(!includeAyurveda)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${includeAyurveda ? 'bg-blue-600' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${includeAyurveda ? 'left-7' : 'left-1'}`} />
                                </button>
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Enable Ayurvedic Intelligence</span>
                            </div>

                            {renderActionControls()}

                            <button
                                onClick={() => handleAction('aihealth_generate_wellness_plan')}
                                disabled={!healthName || !healthWeight || !healthHeight}
                                className="px-16 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[32px] text-[13px] font-black uppercase tracking-[0.25em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-4 group"
                            >
                                <Sparkles className="w-5 h-5 fill-white group-hover:animate-spin transition-all" />
                                <span>Build Wellness Roadmap</span>
                            </button>
                        </div>
                    </div>
                )
            }

            {
                wellnessPlanResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* BMI & Stats Overview */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[32px] p-6 lg:col-span-1 flex flex-col items-center justify-center text-center space-y-3 shadow-xl shadow-blue-500/5">
                                <div className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">BMI Score Meter</div>
                                <div className="text-4xl font-black text-[#5865f2] leading-none">{wellnessPlanResult.bmiValue}</div>
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${wellnessPlanResult.bmiValue < 18.5 ? 'bg-amber-50 text-amber-500' : wellnessPlanResult.bmiValue < 25 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                    {wellnessPlanResult.bmiValue < 18.5 ? 'Underweight' : wellnessPlanResult.bmiValue < 25 ? 'Normal' : 'Overweight'}
                                </div>
                                <div className="w-full h-1.5 bg-slate-50 rounded-full mt-4 overflow-hidden shadow-inner border border-slate-100/50">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (wellnessPlanResult.bmiValue / 40) * 100)}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`h-full ${wellnessPlanResult.bmiValue < 18.5 ? 'bg-amber-400' : wellnessPlanResult.bmiValue < 25 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                                    />
                                </div>
                            </div>
                            <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[32px] p-6 lg:col-span-3 flex items-center gap-6 shadow-xl shadow-blue-500/5">
                                <div className="w-12 h-12 bg-[#5865f2] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                                    "{wellnessPlanResult.bmiAnalysis}"
                                </p>
                            </div>
                        </div>

                        {/* Daily Targets */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'CALORIES', value: wellnessPlanResult.dailyStats?.calories, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                                { label: 'WATER GOAL', value: wellnessPlanResult.dailyStats?.water, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { label: 'SLEEP', value: wellnessPlanResult.dailyStats?.sleep, icon: Brain, color: 'text-[#5865f2]', bg: 'bg-[#f0f4ff]' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[32px] p-6 flex items-center justify-between shadow-xl shadow-blue-500/5">
                                    <div>
                                        <div className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest mb-1">{stat.label}</div>
                                        <div className="text-xl font-black text-slate-800">{stat.value}</div>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Meal Plan & Workout Schedule */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-8 shadow-xl shadow-blue-500/5">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                        <Utensils className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-800 tracking-tight">Weekly Meal Chart</h4>
                                </div>
                                <div className="space-y-4">
                                    {wellnessPlanResult.mealPlan?.map((meal, i) => (
                                        <div key={i} className="p-5 bg-white/50 border border-white/60 rounded-2xl group hover:border-[#5865f2]/20 transition-all shadow-sm">
                                            <div className="flex items-center justify-between mb-3 px-1">
                                                <span className="text-[11px] font-black text-[#5865f2] uppercase tracking-widest">{meal.day}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="px-1">
                                                    <div className="text-[8px] font-black text-[#94a3b8] uppercase tracking-tighter mb-1">Breakfast</div>
                                                    <div className="text-[11px] font-bold text-slate-600 leading-tight">{meal.breakfast}</div>
                                                </div>
                                                <div className="px-1">
                                                    <div className="text-[8px] font-black text-[#94a3b8] uppercase tracking-tighter mb-1">Lunch</div>
                                                    <div className="text-[11px] font-bold text-slate-600 leading-tight">{meal.lunch}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-8 shadow-xl shadow-blue-500/5">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-800 tracking-tight">Exercise Schedule</h4>
                                </div>
                                <div className="space-y-4">
                                    {wellnessPlanResult.workoutSchedule?.map((work, i) => (
                                        <div key={i} className="p-5 bg-white/50 border border-white/60 rounded-2xl flex items-center justify-between group hover:border-rose-100 transition-all shadow-sm">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block px-1">{work.day}</span>
                                                <span className="text-[13px] font-bold text-slate-800 tracking-tight px-1">{work.activity}</span>
                                            </div>
                                            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-tight shadow-md">
                                                {work.duration}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 p-6 bg-slate-50/50 rounded-[32px] border border-slate-100">
                                    <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Progress Tracker</h5>

                                    <div className="h-[180px] w-full mb-8">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={wellnessHistory}>
                                                <defs>
                                                    <linearGradient id="colorWellness" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                                                />
                                                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                                />
                                                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWellness)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {wellnessPlanResult.progressMilestones?.map((m, i) => (
                                            <div key={i} className="px-3 py-2 bg-white border border-slate-100 rounded-xl text-[11px] font-bold text-slate-600 shadow-sm">
                                                #{m}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )
            }

            {
                healthMode === 'MENTAL SUPPORT' && (
                    <div className="space-y-8 pb-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Mood & Entry Section */}
                            <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-8 lg:p-10 shadow-xl shadow-blue-500/5 space-y-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/5 border border-blue-100/50">
                                        <Brain className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-[10px] font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 rounded-full inline-block tracking-[0.2em] mb-2 uppercase">Wellness AI</h3>
                                        <h3 className="text-3xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 bg-clip-text text-transparent leading-tight">Mental Health Support</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Empathetic AI-driven wellness companion and emotional analyzer.</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">How are you feeling right now?</label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {[
                                                { id: 'Happy', label: 'Radiant', icon: Smile, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                                { id: 'Stressed', label: 'Stressed', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
                                                { id: 'Anxious', label: 'Anxious', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
                                                { id: 'Tired', label: 'Exhausted', icon: Coffee, color: 'text-blue-600', bg: 'bg-blue-50' }
                                            ].map(mood => (
                                                <button
                                                    key={mood.id}
                                                    onClick={() => setHealthMood(mood.id)}
                                                    className={`flex flex-col items-center gap-3 p-6 rounded-[32px] border-2 transition-all duration-500 ${healthMood === mood.id ? `${mood.bg} ${mood.color} border-current shadow-lg shadow-blue-500/5 scale-[1.02]` : 'bg-white border-slate-50 text-slate-400 opacity-60 hover:opacity-100 hover:border-slate-100'}`}
                                                >
                                                    <mood.icon className={`w-8 h-8 transition-transform duration-500 ${healthMood === mood.id ? 'scale-110' : ''}`} />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{mood.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Anything on your mind?</label>
                                        <textarea
                                            value={mentalNote}
                                            onChange={(e) => setMentalNote(e.target.value)}
                                            placeholder="I've been feeling a bit overwhelmed with work lately..."
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-[32px] p-6 text-sm font-medium text-slate-600 outline-none focus:ring-4 focus:ring-[#5865f2]/5 focus:border-[#5865f2]/20 transition-all min-h-[140px] resize-none"
                                        />
                                    </div>

                                    <div className="flex flex-col items-center gap-4">
                                        <button
                                            onClick={() => handleAction('aihealth_get_mental_support')}
                                            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(37,99,235,0.25)] hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-3"
                                        >
                                            <Heart className="w-4 h-4 fill-white animate-pulse" />
                                            <span>Get Support</span>
                                        </button>
                                        {renderActionControls()}
                                    </div>
                                </div>
                            </div>

                            {/* History & Trends Section */}
                            <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-8 lg:p-10 shadow-xl shadow-blue-500/5 flex flex-col gap-8">
                                <div>
                                    <h4 className="text-lg font-black text-slate-800 tracking-tight mb-1">Your Mood Trends</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Weekly emotional trajectory</p>
                                </div>

                                <div className="h-[220px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={moodHistory}>
                                            <defs>
                                                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
                                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                                dy={10}
                                            />
                                            <YAxis hide domain={[0, 6]} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', fontSize: '12px', fontWeight: 'bold' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#2563eb"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorMood)"
                                                animationDuration={2500}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="mt-auto grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-50/50 rounded-[28px] p-6 border border-emerald-100/50 flex flex-col gap-1">
                                        <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Weekly Avg</div>
                                        <div className="text-2xl font-black text-slate-800">Stable</div>
                                    </div>
                                    <div className="bg-blue-50/50 rounded-[28px] p-6 border border-blue-100/50 flex flex-col gap-1">
                                        <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Top Feeling</div>
                                        <div className="text-2xl font-black text-slate-800">Calm</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {mentalResult && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                                >
                                    {/* Results Logic... (to be added) */}
                                    <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[40px] p-10 shadow-xl space-y-10" style={{ borderTop: `8px solid ${mentalResult.supportColor || '#5865f2'}` }}>
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-4">Empathetic Analysis</h4>
                                            <p className="text-lg font-medium text-slate-500 leading-relaxed italic">
                                                "{mentalResult.sentiment}"
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                                        <Zap className="w-5 h-5" />
                                                    </div>
                                                    <h5 className="font-black text-slate-700 uppercase tracking-widest text-xs">Your Affirmation</h5>
                                                </div>
                                                <div className="bg-slate-50 p-6 rounded-[32px] border-l-4 border-amber-400 italic font-bold text-slate-600 leading-relaxed">
                                                    "{mentalResult.affirmation}"
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                                        <Heart className="w-5 h-5" />
                                                    </div>
                                                    <h5 className="font-black text-slate-700 uppercase tracking-widest text-xs">Small Action Steps</h5>
                                                </div>
                                                <ul className="space-y-3">
                                                    {mentalResult.actionSteps?.map((step, i) => (
                                                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] shrink-0">{i + 1}</div>
                                                            {step}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Animated Breathing Guide Card */}
                                    <div className="bg-[#1a1c2e] text-white rounded-[40px] p-10 shadow-2xl flex flex-col items-center justify-center text-center space-y-8 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#5865f2]/20 to-transparent opacity-30" />

                                        <div className="relative z-10 w-full">
                                            <div className="flex items-center justify-center gap-3 mb-8">
                                                <Wind className="w-5 h-5 text-blue-400" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">Guided Breathing</span>
                                            </div>

                                            <div className="h-48 flex items-center justify-center">
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.5, 1],
                                                        opacity: [0.5, 0.8, 0.5]
                                                    }}
                                                    transition={{
                                                        duration: mentalResult.breathingExercise?.duration ? parseInt(mentalResult.breathingExercise.duration) / 2 : 4,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="w-24 h-24 bg-blue-500/30 rounded-full flex items-center justify-center blur-2xl relative"
                                                >
                                                    <div className="absolute inset-0 bg-blue-400/20 rounded-full scale-110" />
                                                </motion.div>
                                                <motion.div
                                                    animate={{ scale: [1, 1.3, 1] }}
                                                    transition={{
                                                        duration: mentalResult.breathingExercise?.duration ? parseInt(mentalResult.breathingExercise.duration) / 2 : 4,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="absolute w-20 h-20 border-2 border-blue-400/50 rounded-full flex items-center justify-center"
                                                >
                                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                                                        <Wind className="w-6 h-6 text-white" />
                                                    </div>
                                                </motion.div>
                                            </div>

                                            <div className="mt-8 space-y-4">
                                                <h4 className="text-xl font-black tracking-tight">{mentalResult.breathingExercise?.name}</h4>
                                                <div className="flex flex-col gap-2">
                                                    {mentalResult.breathingExercise?.steps?.map((step, i) => (
                                                        <span key={i} className="text-[11px] font-bold text-blue-200/60 uppercase tracking-widest">{step}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-10 flex justify-center gap-4">
                                                <button
                                                    onClick={() => {
                                                        const speech = new SpeechSynthesisUtterance(`${mentalResult.breathingExercise?.name}. ${mentalResult.breathingExercise?.steps?.join('. ')}`);
                                                        speech.rate = 0.8;
                                                        window.speechSynthesis.speak(speech);
                                                    }}
                                                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
                                                >
                                                    <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const speech = new SpeechSynthesisUtterance(mentalResult.affirmation);
                                                        window.speechSynthesis.speak(speech);
                                                    }}
                                                    className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-110 transition-all group"
                                                >
                                                    <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            }

            {
                healthMode === 'TREATMENT ADVISOR' && (
                    <div className="space-y-10 pb-20">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                            {/* Advisor Input Panel */}
                            <div className="lg:col-span-12 xl:col-span-5 bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-10 shadow-xl shadow-blue-500/5 space-y-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/5 border border-blue-100/50">
                                        <Shield className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-[10px] font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 rounded-full inline-block tracking-[0.2em] mb-2 uppercase">Pharmacology AI</h3>
                                        <h3 className="text-3xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 bg-clip-text text-transparent leading-tight">Treatment Advisor</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Alternative therapy & dosage validator.</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Medication Identity</label>
                                        <div className="relative group">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                                <Search className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                value={medicineName}
                                                onChange={(e) => setMedicineName(e.target.value)}
                                                placeholder="e.g. Metformin or Ashwagandha"
                                                className="w-full bg-white border border-slate-50 rounded-[32px] py-6 pl-16 pr-8 text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all shadow-sm placeholder:text-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Clinical System</label>
                                            <CustomSelect
                                                value={treatmentTypeChoice}
                                                onChange={(e) => setTreatmentTypeChoice(e.target.value)}
                                                options={['Allopathy', 'Ayurveda', 'Homeopathy', 'Naturopathy']}
                                                className="premium-select"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Pathology Focus</label>
                                            <input
                                                type="text"
                                                value={healthCondition}
                                                onChange={(e) => setHealthCondition(e.target.value)}
                                                placeholder="e.g. Type 2 Diabetes"
                                                className="w-full bg-white border border-slate-50 rounded-[28px] px-6 py-4 text-[12px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all shadow-sm placeholder:text-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleAction('aihealth_get_treatment_guide')}
                                        disabled={!medicineName}
                                        className="w-full py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-[32px] text-[13px] font-black uppercase tracking-[0.25em] shadow-[0_20px_40_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-4 group"
                                    >
                                        <Activity className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        <span>Initiate Protocol Scan</span>
                                    </button>

                                    {/* Consultation Analytics Chart */}
                                    <div className="pt-6 border-t border-slate-100/50">
                                        <div className="bg-slate-50/80 rounded-[35px] p-6 border border-slate-100">
                                            <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Consultation Analytics</h5>
                                            <div className="h-[90px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={treatmentHistory}>
                                                        <defs>
                                                            <linearGradient id="colorTreatment" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <XAxis dataKey="date" hide />
                                                        <Tooltip />
                                                        <Area type="monotone" dataKey="scans" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTreatment)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                    {renderActionControls()}
                                </div>
                            </div>

                            {/* Analysis Panel */}
                            <div className="lg:col-span-12 xl:col-span-7 bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-10 shadow-xl shadow-blue-500/5 relative overflow-hidden flex flex-col justify-center items-center text-center">
                                <AnimatePresence mode="wait">
                                    {!treatmentResult ? (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="space-y-6 max-w-sm"
                                        >
                                            <div className="w-24 h-24 rounded-[32px] bg-blue-50 text-blue-500 flex items-center justify-center mx-auto shadow-inner border border-blue-100/50">
                                                <Shield className="w-10 h-10" />
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="text-xl font-black text-slate-800 tracking-tight">Diagnostic Buffer</h4>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                                    Awaiting clinical parameters to initiate pharmacological analysis & safety verification.
                                                </p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="result"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="w-full text-left space-y-10"
                                        >
                                            <div className="p-8 bg-gradient-to-br from-slate-900 to-blue-950 rounded-[35px] text-white shadow-2xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                                    <Zap className="w-24 h-24" />
                                                </div>
                                                <div className="relative z-10 space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">Safety Verification Scan</span>
                                                    </div>
                                                    <p className="text-lg font-black leading-snug">
                                                        {treatmentResult.purpose}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <h5 className="text-[11px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                                            <Minus className="w-4 h-4" />
                                                        </div>
                                                        Side Effects
                                                    </h5>
                                                    <div className="space-y-3">
                                                        {treatmentResult.sideEffects?.map((effect, i) => (
                                                            <div key={i} className="p-5 bg-white border border-rose-50 rounded-[28px] text-[11px] font-black text-slate-700 shadow-sm hover:border-rose-200 transition-colors">
                                                                {effect}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <h5 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                            <Shield className="w-4 h-4" />
                                                        </div>
                                                        Safety Alerts
                                                    </h5>
                                                    <div className="space-y-3">
                                                        {treatmentResult.precautions?.map((p, i) => (
                                                            <div key={i} className="p-5 bg-white border border-emerald-50 rounded-[28px] text-[11px] font-black text-slate-700 shadow-sm flex gap-3 hover:border-emerald-200 transition-colors">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                                                                {p}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 bg-amber-50/50 rounded-[35px] border border-amber-100 flex items-start gap-5">
                                                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                                                <div className="space-y-2">
                                                    <h6 className="text-[11px] font-black text-amber-600 uppercase tracking-widest leading-none">Global Clinical Advisory</h6>
                                                    <p className="text-[11px] font-bold text-amber-700/80 leading-relaxed italic">
                                                        {treatmentResult.medicalDisclaimer}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                healthMode === 'AUTOMATION' && (
                    <div className="space-y-10 pb-20">
                        {/* ⚙️ 1. Health Monitoring & Vitals Input */}
                        <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-10 shadow-xl shadow-blue-500/5">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/5 border border-blue-100/50">
                                        <Activity className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Vitals Input Engine</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Feed the AI Health Twin to trigger autonomous decisions.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAction('aihealth_log_data')}
                                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Log & Audit
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 bg-white border border-slate-100 rounded-[30px] space-y-4 shadow-sm hover:border-blue-200 transition-all">
                                    <div className="flex items-center justify-between">
                                        <Moon className="w-5 h-5 text-indigo-500" />
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sleep (Hrs)</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={healthSleepHours}
                                        onChange={(e) => setHealthSleepHours(e.target.value)}
                                        className="w-full text-2xl font-black text-slate-700 bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-indigo-500/20"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="p-6 bg-white border border-slate-100 rounded-[30px] space-y-4 shadow-sm hover:border-blue-200 transition-all">
                                    <div className="flex items-center justify-between">
                                        <Droplets className="w-5 h-5 text-blue-500" />
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Water (L)</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={healthWaterIntake}
                                        onChange={(e) => setHealthWaterIntake(e.target.value)}
                                        className="w-full text-2xl font-black text-slate-700 bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-blue-500/20"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="p-6 bg-white border border-slate-100 rounded-[30px] space-y-4 shadow-sm hover:border-blue-200 transition-all">
                                    <div className="flex items-center justify-between">
                                        <Footprints className="w-5 h-5 text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Steps</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={healthSteps}
                                        onChange={(e) => setHealthSteps(e.target.value)}
                                        className="w-full text-2xl font-black text-slate-700 bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-emerald-500/20"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="p-6 bg-white border border-slate-100 rounded-[30px] space-y-4 shadow-sm hover:border-blue-200 transition-all">
                                    <div className="flex items-center justify-between">
                                        <Thermometer className="w-5 h-5 text-rose-500" />
                                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Stress (1-10)</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={healthStressLevel}
                                        onChange={(e) => setHealthStressLevel(e.target.value)}
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500 mt-6"
                                    />
                                    <div className="text-center font-black text-rose-600">{healthStressLevel}/10</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* 🚨 2. Risk Detection Automation & Dashboard */}
                            <div className="lg:col-span-8 space-y-10">
                                <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-10 shadow-xl shadow-blue-500/5">
                                    <div className="flex items-center justify-between mb-8">
                                        <h4 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                            <ShieldCheck className="text-blue-600" /> Risk Detection AI
                                        </h4>
                                        <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                                            Scanning Multi-Pattern Trends
                                        </div>
                                    </div>

                                    <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                        {healthAutomationLogs.map((log) => (
                                            <div key={log.id} className={`p-6 bg-white/60 border border-white rounded-[32px] shadow-sm flex items-start gap-6 transition-all hover:translate-x-1 ${log.severity === 'High' ? 'border-l-[6px] border-l-rose-500' : 'border-l-[6px] border-l-blue-500'}`}>
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${log.severity === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                                                    {log.type === 'Detection' ? <Eye size={20} /> : log.type === 'Decision' ? <Brain size={20} /> : <Zap size={20} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${log.severity === 'High' ? 'text-rose-500' : 'text-blue-500'}`}>{log.type} // {log.category || 'System'}</span>
                                                        <span className="text-[9px] font-bold text-slate-300 uppercase italic">{log.time || 'New'}</span>
                                                    </div>
                                                    <p className="text-[14px] font-bold text-slate-700 leading-relaxed">{log.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 🧪 5. Health Score Auto Update Chart (Mocking trend) */}
                                <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-10 shadow-xl shadow-blue-500/5">
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
                                        <BarChart3 className="text-emerald-500" /> Autonomous Score Trends
                                    </h4>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={[
                                                { day: 'Mon', score: 72 },
                                                { day: 'Tue', score: 68 },
                                                { day: 'Wed', score: 75 },
                                                { day: 'Thu', score: 80 },
                                                { day: 'Fri', score: 78 },
                                                { day: 'Sat', score: 85 },
                                                { day: 'Today', score: 82 }
                                            ]}>
                                                <defs>
                                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                                />
                                                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* 🤖 3. Auto Routine Generator & Smart Reminders */}
                            <div className="lg:col-span-4 space-y-10">
                                <div className="bg-gradient-to-br from-[#1a1c2e] to-[#252849] rounded-[45px] p-10 text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Clock8 className="w-32 h-32" />
                                    </div>
                                    <div className="relative z-10 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">Next-Day Routing</h4>
                                            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                                        </div>
                                        <div className="space-y-6">
                                            <div className="p-6 bg-white/5 border border-white/10 rounded-[30px] space-y-4">
                                                <h5 className="text-lg font-black text-white">Sleep-Fix Recovery</h5>
                                                <ul className="space-y-4">
                                                    <li className="flex items-center gap-3 text-xs font-bold text-blue-200">
                                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">1</div>
                                                        Morning Sunlight Exposure
                                                    </li>
                                                    <li className="flex items-center gap-3 text-xs font-bold text-blue-200">
                                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">2</div>
                                                        Caffeine Cutoff after 2 PM
                                                    </li>
                                                    <li className="flex items-center gap-3 text-xs font-bold text-blue-200">
                                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">3</div>
                                                        Nootropic Magnesium at 9 PM
                                                    </li>
                                                </ul>
                                            </div>
                                            <button
                                                onClick={() => handleAction('aihealth_run_automation')}
                                                className="w-full py-5 bg-white text-[#1a1c2e] rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-white/5"
                                            >
                                                Refresh Strategy
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 🧬 6. AI Health Twin & Assistant Neural Sync */}
                                <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <BrainCircuit size={24} />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-black text-slate-800 tracking-tight">Neural Sync Engine</h5>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Linked with Personal Assistant</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setEditingHealthTask(null); setIsAssistantModalOpen(true); }}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-slate-200"
                                        >
                                            Add New Task
                                        </button>
                                    </div>

                                    {/* Active Automation Tasks */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Schedule</h6>
                                            <div className="flex items-center gap-3">
                                                <button onClick={fetchHealthTasks} className={`text-slate-300 hover:text-blue-500 transition-all ${loadingTasks ? 'animate-spin' : ''}`}>
                                                    <Zap size={12} />
                                                </button>
                                                <button onClick={() => navigate('/dashboard/workspace/AiPersonalAssistant')} className="text-slate-300 hover:text-rose-500 transition-all">
                                                    <History size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                            {loadingTasks ? (
                                                <div className="py-10 text-center text-slate-300 font-bold text-[9px] uppercase tracking-widest">Syncing Neural Memory...</div>
                                            ) : healthTasks.length === 0 ? (
                                                <div className="py-10 text-center border-2 border-dashed border-slate-50 rounded-[30px]">
                                                    <p className="text-slate-300 font-bold text-[9px] uppercase tracking-widest leading-relaxed px-4">No active autonomous tasks</p>
                                                </div>
                                            ) : (
                                                healthTasks.map((task) => (
                                                    <div key={task._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
                                                        <button
                                                            onClick={() => toggleTaskComplete(task)}
                                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent hover:border-emerald-500'}`}
                                                        >
                                                            <ShieldCheck size={12} />
                                                        </button>
                                                        <div className="flex-1 min-w-0">
                                                            <h6 className={`text-[11px] font-black truncate ${task.status === 'completed' ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                                                                {task.title}
                                                            </h6>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg">
                                                                    {new Date(task.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => { setEditingHealthTask(task); setIsAssistantModalOpen(true); }}
                                                                className="p-1.5 text-slate-400 hover:text-blue-500"
                                                            >
                                                                <PenTool size={10} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteHealthTask(task._id)}
                                                                className="p-1.5 text-slate-400 hover:text-rose-500"
                                                            >
                                                                <Trash2 size={10} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-50">
                                        {[
                                            { label: 'Neural Habit Tracking', active: true, desc: 'Syncing behavioral patterns' },
                                            { label: 'Autonomous Scheduling', active: true, desc: 'AI-managed reminders active' }
                                        ].map((sys, i) => (
                                            <div key={i} className="p-4 bg-slate-50/50 border border-slate-100 rounded-[24px] space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{sys.label}</span>
                                                    <div className={`w-7 h-3.5 rounded-full relative transition-colors ${sys.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                        <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all ${sys.active ? 'right-0.5' : 'left-0.5'}`} />
                                                    </div>
                                                </div>
                                                <p className="text-[8px] font-medium text-slate-400 italic">{sys.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Smart Notifications Preview */}
                                <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-[40px] space-y-5">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-5 h-5 text-amber-500" />
                                        <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Autonomous Nudges</h5>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="text-[11px] font-bold text-amber-700 leading-relaxed bg-white/50 p-4 rounded-2xl border border-amber-100">
                                            "You skipped your last 2 workouts. Let's start with a light 15-min yoga session today?"
                                        </div>
                                        <div className="text-[11px] font-bold text-amber-700 leading-relaxed bg-white/50 p-4 rounded-2xl border border-amber-100">
                                            "Your hydration trend is down 30% this week. I've sent a priority alert to your watch."
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Audit Result Display */}
                        {automationResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-10 shadow-xl shadow-blue-500/5 space-y-10"
                            >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                                    <div className="space-y-1">
                                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">Intelligence Audit Findings</h4>
                                        <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Generation Timestamp: {new Date().toLocaleTimeString()}</p>
                                    </div>
                                    <Sparkles className="text-blue-500 w-8 h-8" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><Eye size={20} /></div>
                                            <h6 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Detections</h6>
                                        </div>
                                        <p className="text-md font-bold text-slate-700 leading-relaxed italic border-l-4 border-blue-500 pl-4">"{automationResult.detections}"</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center"><Brain size={20} /></div>
                                            <h6 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Decisions</h6>
                                        </div>
                                        <p className="text-md font-bold text-slate-700 leading-relaxed italic border-l-4 border-indigo-500 pl-4">"{automationResult.decisions}"</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Zap size={20} /></div>
                                            <h6 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Actions</h6>
                                        </div>
                                        <p className="text-md font-bold text-slate-700 leading-relaxed italic border-l-4 border-emerald-500 pl-4">"{automationResult.actions}"</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Weekly Report Section */}
                        <div className="bg-gradient-to-br from-indigo-900 to-purple-950 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden text-center space-y-8">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                            <div className="relative z-10 space-y-4">
                                <FilePieChart className="w-16 h-16 text-indigo-300 mx-auto animate-bounce" />
                                <h3 className="text-4xl font-black tracking-tight">Weekly Health Intelligence Report</h3>
                                <p className="text-lg text-indigo-100/70 max-w-2xl mx-auto font-medium">Your digital doctor has analyzed 168 hours of your life. Get the full breakdown of your behavioral trends and predicted health trajectory.</p>
                            </div>
                            <div className="relative z-10 pt-4">
                                <button className="px-12 py-6 bg-white text-indigo-900 rounded-full text-sm font-black uppercase tracking-[0.2em] hover:scale-110 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.2)]">Download Weekly PDF Analysis</button>
                            </div>
                        </div>
                    </div>
                )
            }

            <TaskModal
                isOpen={isAssistantModalOpen}
                onClose={() => { setIsAssistantModalOpen(false); setEditingHealthTask(null); }}
                onSave={handleSaveHealthTask}
                task={editingHealthTask}
            />

        </div >
    );
};

export default AIHEALTHInputs;
