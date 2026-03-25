import React, { useState, useRef, useEffect } from 'react';
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
import TaskModal from '../../pages/AiPersonalAssistant/TaskModal';

const HEALTH_MODES = [
    { id: 'SYMPTOM CHECKER', label: 'Check Your Symptoms', icon: Activity },
    { id: 'REPORT ANALYZER', label: 'Analyze My Report', icon: ClipboardList },
    { id: 'WELLNESS PLANNER', label: 'My Wellness Plan', icon: Heart },
    { id: 'MENTAL SUPPORT', label: 'Mental Health Support', icon: Brain },
    { id: 'TREATMENT ADVISOR', label: 'Treatment Advisor', icon: Stethoscope },
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
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">No history for this segment</p>
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
                                <div className="flex flex-col min-w-0">
                                    <span className={`text-sm font-black tracking-tight truncate max-w-[120px] sm:max-w-[150px] ${currentSessionId === session.sessionId ? 'text-slate-800' : 'text-slate-600'}`}>
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
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 py-4 relative ${isLocalHistoryOpen ? 'z-[110]' : 'z-10'}`}>
            <div className="relative w-full sm:w-auto">
                <button
                    onClick={() => setIsLocalHistoryOpen(!isLocalHistoryOpen)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 border rounded-2xl md:rounded-[22px] text-[10px] md:text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${isLocalHistoryOpen ? 'bg-[#5865f2] border-[#5865f2] text-white' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                >
                    <History size={14} className={isLocalHistoryOpen ? 'text-white' : 'text-slate-300'} /> HISTORY
                </button>

                <AnimatePresence>
                    {isLocalHistoryOpen && (
                        <>
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
                                className="fixed top-1/2 left-1/2 w-[95%] max-w-[400px] bg-white rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-white p-6 md:p-8 z-[201]"
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

                                <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
                                    {renderHistoryList(true)}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
            <button
                onClick={onClearWorkspace}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-2xl md:rounded-[22px] text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
            >
                <Trash2 size={14} className="text-slate-300" /> CLEAR SYMMETRY
            </button>
        </div>
    );

    const bmi = (healthWeight && healthHeight)
        ? (healthWeight / ((healthHeight / 100) * (healthHeight / 100))).toFixed(1)
        : null;

    const renderSymptomCheckerUI = () => (
        <div className="space-y-6 md:space-y-8 pb-10 w-full">
            <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-3xl md:rounded-[40px] p-6 md:p-10 lg:p-12 shadow-xl shadow-blue-500/5 space-y-8 lg:space-y-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-5">
                    <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 rounded-xl md:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/5 border border-blue-100/50">
                        <Activity className="w-5 h-5 md:w-7 md:h-7" />
                    </div>
                    <div>
                        <h3 className="text-[8px] md:text-[10px] font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-0.5 md:py-1 rounded-full inline-block tracking-[0.2em] mb-1.5 md:mb-2 uppercase">Intelligence AI</h3>
                        <h3 className="text-lg md:text-3xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 bg-clip-text text-transparent leading-tight">Check Your Symptoms</h3>
                        <p className="hidden md:flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            Analysis & Intelligence
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-stretch">
                    <div className="lg:col-span-7 space-y-4 flex flex-col">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600">
                                <Activity className="w-5 h-5" />
                            </div>
                            <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Diagnostic Description</label>
                        </div>
                        <textarea
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="Describe your symptoms in detail (e.g., location, duration, triggers)..."
                            className="w-full flex-grow bg-white/60 border border-slate-100 rounded-3xl md:rounded-[35px] px-6 md:px-8 py-5 md:py-7 text-xs md:text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all shadow-sm placeholder:text-slate-300 min-h-[160px] md:min-h-[250px] resize-none leading-relaxed"
                        />
                    </div>

                    <div className="lg:col-span-5 space-y-6 md:space-y-8 bg-blue-50/20 border border-blue-100/30 p-6 md:p-10 rounded-3xl md:rounded-[45px] flex flex-col justify-between">
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

                        <div className="mt-4 p-6 bg-white border border-blue-100/50 rounded-[35px] shadow-sm">
                            <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Stability Trajectory</h5>
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
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Severity</label>
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
                                        <button key={level} onClick={() => setSymptomSeverity(level)} className={`text-[9px] font-black uppercase tracking-widest transition-colors ${symptomSeverity === level ? 'text-blue-700' : 'text-slate-300 hover:text-slate-400'}`}>{level}</button>
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
                        className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl md:rounded-[24px] text-xs md:text-[13px] font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(37,99,235,0.25)] hover:scale-[1.05] active:scale-[0.95] transition-all duration-500 flex items-center justify-center gap-4 group"
                    >
                        <Zap className="w-5 h-5 fill-white group-hover:animate-pulse" />
                        <span>Diagnostic Scan</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {symptomResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-3xl md:rounded-[40px] p-6 md:p-10 lg:p-12 shadow-xl shadow-blue-500/5 space-y-8 lg:space-y-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h4 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight">Clinical Report</h4>
                        <div className={`px-4 py-2 rounded-full flex items-center gap-2 border w-fit ${symptomResult.riskLevel === 'High' ? 'bg-rose-50 border-rose-100 text-rose-500' : symptomResult.riskLevel === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-emerald-50 border-emerald-100 text-emerald-500'}`}>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${symptomResult.riskLevel === 'High' ? 'bg-rose-500' : symptomResult.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Safety: {symptomResult.riskLevel}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50"><Activity className="w-4 h-4" /></div>
                                Potential Causes
                            </h5>
                            <div className="space-y-3">
                                {symptomResult.possibleCauses?.map((cause, i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 bg-white shadow-sm border border-slate-50 rounded-2xl text-[12px] md:text-[13px] font-bold text-slate-700 leading-snug">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                        {cause}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100/50"><Scale className="w-4 h-4" /></div>
                                Protocol
                            </h5>
                            <div className="space-y-3">
                                {symptomResult.recommendations?.map((rec, i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 bg-white shadow-sm border border-slate-50 rounded-2xl text-[12px] md:text-[13px] font-bold text-slate-700 leading-snug">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        {rec}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 md:p-8 bg-blue-900 rounded-3xl md:rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0"><Shield className="w-8 h-8 text-blue-300" /></div>
                            <div className="space-y-2">
                                <h6 className="text-[10px] font-black uppercase tracking-widest text-blue-300">Clinical Advisory</h6>
                                <p className="text-sm md:text-[14px] font-bold leading-relaxed text-blue-50/90 italic">"{symptomResult.doctorAdvice}"</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );

    const renderReportAnalyzerUI = () => (
        <div className="space-y-6 md:space-y-8 pb-10 w-full">
            <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-3xl md:rounded-[40px] p-6 md:p-10 lg:p-12 shadow-xl shadow-blue-500/5 space-y-8 lg:space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/5 border border-blue-100/50">
                            <ClipboardList className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <div className="space-y-0.5 md:space-y-1">
                            <h3 className="text-[8px] md:text-[10px] font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-0.5 md:py-1 rounded-full inline-block tracking-[0.2em] mb-1.5 md:mb-2 uppercase">Diagnostic AI</h3>
                            <h3 className="text-lg md:text-3xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 bg-clip-text text-transparent leading-tight">Analyze My Report</h3>
                            <p className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Biometric intelligence & pattern recognition.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-stretch">
                    <div className="lg:col-span-6 space-y-6">
                        <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Scientific Data (PDF)</label>
                        <div
                            className={`relative group border-2 border-dashed rounded-3xl md:rounded-[40px] p-6 md:p-10 flex flex-col items-center justify-center gap-4 transition-all duration-500 min-h-[220px] md:min-h-[300px] cursor-pointer ${reportFile ? 'bg-blue-50/50 border-blue-200' : isDraggingReport ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-100 hover:border-blue-500/30 hover:bg-blue-50/20'}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingReport(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDraggingReport(false); }}
                            onDrop={(e) => {
                                e.preventDefault(); setIsDraggingReport(false);
                                const file = e.dataTransfer.files[0];
                                if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) setReportFile(file);
                            }}
                        >
                            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file) setReportFile(file); }} />
                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-500 ${reportFile ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-50 text-slate-300 group-hover:scale-110'}`}>
                                {reportFile ? <FileText className="w-8 h-8 md:w-10 md:h-10" /> : <Upload className="w-8 h-8 md:w-10 md:h-10" />}
                            </div>
                            <div className="text-center">
                                <p className={`text-[13px] font-black tracking-tight ${reportFile ? 'text-blue-600' : 'text-slate-500'}`}>{reportFile ? reportFile.name : 'Drop Laboratory Report'}</p>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">{reportFile ? `Vectorizing Payload...` : 'Full Blood Work & Hormonal Profiles'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-6 space-y-6 bg-slate-50/50 border border-slate-100 p-6 md:p-10 rounded-3xl md:rounded-[45px]">
                        <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Manual Entry</label>
                        <div className="grid grid-cols-2 gap-4 md:gap-5">
                            {[
                                { id: 'glucose', label: 'Glucose', unit: 'mg/dL', icon: Activity },
                                { id: 'cholesterol', label: 'Cholester', unit: 'mg/dL', icon: Zap },
                                { id: 'haemoglobin', label: 'HB', unit: 'g/dL', icon: Heart },
                                { id: 'bp_systolic', label: 'Sys', unit: 'mmHg', icon: Activity }
                            ].map(field => (
                                <div key={field.id} className="space-y-2">
                                    <div className="flex justify-between items-center px-1"><span className="text-[8px] font-black text-slate-400 uppercase">{field.label}</span></div>
                                    <div className="relative"><input type="number" value={reportManualValues[field.id]} onChange={(e) => setReportManualValues({ ...reportManualValues, [field.id]: e.target.value })} placeholder="0.0" className="w-full bg-white border border-slate-100 rounded-xl md:rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-500/20" /></div>
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
                        className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl md:rounded-[32px] text-xs md:text-[13px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
                    >
                        <Zap className="w-5 h-5 fill-white group-hover:animate-pulse" />
                        <span>Health Insights</span>
                    </button>
                </div>
            </div>

            {reportResult && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                    <div className="lg:col-span-5 space-y-6">
                        <div className="p-8 md:p-10 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 text-white rounded-3xl md:rounded-[45px] shadow-2xl relative overflow-hidden">
                            <div className="relative z-10 space-y-6">
                                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Risk Summary</h4>
                                <p className="text-base md:text-xl font-black leading-snug">{reportResult.explanation}</p>
                                <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md"><Brain className="w-5 h-5 text-blue-300" /></div>
                                    <div><div className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Confidence</div><div className="text-xs font-black">98.4% Accuracy</div></div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Findings Trajectory</h5>
                            <div className="h-[150px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={reportHistory}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="date" hide /><Tooltip /><Area type="monotone" dataKey="anomalies" stroke="#2563eb" strokeWidth={3} fill="#eff6ff" /></AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-7 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-3"><Activity className="w-4 h-4" /> Flags</h5>
                                <div className="space-y-2">
                                    {reportResult.abnormalFindings?.map((finding, i) => (
                                        <div key={i} className="p-4 bg-white border border-rose-50 rounded-2xl flex items-center justify-between text-[11px] font-black">
                                            <span className="text-slate-600 truncate mr-2">{finding.parameter}</span>
                                            <span className="text-rose-500 whitespace-nowrap">{finding.value} {finding.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3"><Utensils className="w-4 h-4" /> Lifestyle</h5>
                                <div className="space-y-2">
                                    {reportResult.dietSuggestions?.map((diet, i) => (
                                        <div key={i} className="p-4 bg-white border border-emerald-50 rounded-2xl text-[11px] font-bold text-slate-600 flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />{diet}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );

    const renderWellnessPlannerUI = () => (
        <div className="w-full space-y-6 md:space-y-10 pb-20">
            <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-3xl md:rounded-[40px] p-6 md:p-10 lg:p-12 shadow-xl shadow-blue-500/5 space-y-8 lg:space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/5 border border-blue-100/50">
                            <Heart className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <div className="space-y-0.5 md:space-y-1">
                            <h3 className="text-[8px] md:text-[10px] font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-0.5 md:py-1 rounded-full inline-block tracking-[0.2em] mb-1.5 md:mb-2 uppercase">LIFESTYLE AI</h3>
                            <h3 className="text-lg md:text-3xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 bg-clip-text text-transparent leading-tight">Biometric Identity</h3>
                            <p className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personalized health blueprint & routing.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Clinical Name</label>
                        <input
                            type="text"
                            value={healthName}
                            onChange={(e) => setHealthName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full bg-white border border-slate-50 rounded-[28px] px-8 py-6 text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                        />
                    </div>
                    {[
                        { label: 'Weight (KG)', value: healthWeight, setter: setHealthWeight, icon: Scale },
                        { label: 'Height (CM)', value: healthHeight, setter: setHealthHeight, icon: Scale },
                        { label: 'Age (Years)', value: healthAge, setter: setHealthAge, icon: Clock }
                    ].map((field, i) => (
                        <div key={i} className="p-6 md:p-8 bg-white/60 border border-slate-100 rounded-3xl md:rounded-[35px] space-y-4 shadow-sm hover:border-blue-500/20 transition-all">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</span>
                                <field.icon className="w-4 h-4 text-blue-400" />
                            </div>
                            <input
                                type="number"
                                value={field.value}
                                onChange={(e) => field.setter(e.target.value)}
                                className="w-full text-xl md:text-2xl font-black text-slate-700 bg-transparent outline-none"
                                placeholder="0"
                            />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Gender Biology</label>
                        <CustomSelect value={healthGender} onChange={(e) => setHealthGender(e.target.value)} options={['Male', 'Female', 'Non-Binary', 'Prefer not to say']} className="premium-select" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Primary Goal</label>
                        <CustomSelect value={healthGoal} onChange={(e) => setHealthGoal(e.target.value)} options={['Weight Loss', 'Muscle Gain', 'Endurance', 'General Wellness', 'Flexibility']} className="premium-select" />
                    </div>
                </div>

                {renderActionControls()}

                <div className="pt-2 flex justify-center">
                    <button
                        onClick={() => handleAction('aihealth_generate_wellness_plan')}
                        disabled={!healthName || !healthWeight || !healthHeight}
                        className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl md:rounded-[32px] text-xs md:text-[13px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-4 group"
                    >
                        <Zap className="w-5 h-5 fill-white" />
                        <span>Build Wellness Roadmap</span>
                    </button>
                </div>
            </div>

            {wellnessPlanResult && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="bg-white border border-slate-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BMI Analysis</div>
                            <div className="text-4xl font-black text-blue-600">{wellnessPlanResult.bmiValue}</div>
                            <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${wellnessPlanResult.bmiValue < 25 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>Standard</div>
                        </div>
                        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl p-8 flex items-center gap-6 shadow-sm font-bold text-slate-600 italic text-sm md:text-base leading-relaxed">
                            "{wellnessPlanResult.bmiAnalysis}"
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'CALORIES', value: wellnessPlanResult.dailyStats?.calories, icon: Zap, bg: 'bg-amber-50', text: 'text-amber-500' },
                            { label: 'WATER', value: wellnessPlanResult.dailyStats?.water, icon: Droplets, bg: 'bg-blue-50', text: 'text-blue-500' },
                            { label: 'SLEEP', value: wellnessPlanResult.dailyStats?.sleep, icon: Moon, bg: 'bg-indigo-50', text: 'text-indigo-500' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between shadow-sm">
                                <div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                                    <div className="text-xl font-black text-slate-800">{stat.value}</div>
                                </div>
                                <div className={`w-12 h-12 ${stat.bg} ${stat.text} rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}><stat.icon className="w-5 h-5" /></div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                        <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm space-y-8">
                            <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Utensils className="w-5 h-5" /></div><h4 className="text-lg font-black text-slate-800 tracking-tight">Nutrition Schedule</h4></div>
                            <div className="space-y-4">
                                {wellnessPlanResult.mealPlan?.map((meal, i) => (
                                    <div key={i} className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3">
                                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{meal.day}</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><div className="text-[8px] font-black text-slate-400 uppercase mb-1">Breakfast</div><div className="text-[11px] font-bold text-slate-600">{meal.breakfast}</div></div>
                                            <div><div className="text-[8px] font-black text-slate-400 uppercase mb-1">Lunch</div><div className="text-[11px] font-bold text-slate-600">{meal.lunch}</div></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm space-y-8">
                            <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center"><Activity className="w-5 h-5" /></div><h4 className="text-lg font-black text-slate-800 tracking-tight">Activity Routine</h4></div>
                            <div className="space-y-4">
                                {wellnessPlanResult.workoutSchedule?.map((work, i) => (
                                    <div key={i} className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between">
                                        <div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase block">{work.day}</span><span className="text-xs font-bold text-slate-800">{work.activity}</span></div>
                                        <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-blue-600 uppercase">{work.duration}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );

    const renderMentalSupportUI = () => (
        <div className="w-full space-y-8 md:space-y-12 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                <div className="lg:col-span-12 xl:col-span-7 bg-white/40 backdrop-blur-3xl border border-white/50 rounded-3xl md:rounded-[40px] p-6 md:p-10 lg:p-12 shadow-xl shadow-blue-500/5 space-y-10">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/5 border border-blue-100/50">
                            <Brain className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <div className="space-y-0.5 md:space-y-1">
                            <h3 className="text-[8px] md:text-[10px] font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-0.5 md:py-1 rounded-full inline-block tracking-[0.2em] mb-1.5 md:mb-2 uppercase">EMPATHY AI</h3>
                            <h3 className="text-lg md:text-3xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 bg-clip-text text-transparent leading-tight">Mental Support</h3>
                            <p className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time emotional analysis & guided healing.</p>
                        </div>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">How are you feeling?</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { id: 'Happy', label: 'Radiant', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                    { id: 'Stressed', label: 'Tense', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                                    { id: 'Anxious', label: 'Anxious', icon: Wind, color: 'text-rose-500', bg: 'bg-rose-50' },
                                    { id: 'Tired', label: 'Low', icon: Coffee, color: 'text-blue-500', bg: 'bg-blue-50' }
                                ].map(mood => (
                                    <button
                                        key={mood.id}
                                        onClick={() => setHealthMood(mood.id)}
                                        className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all duration-500 ${healthMood === mood.id ? `${mood.bg} ${mood.color} border-current shadow-lg scale-[1.05]` : 'bg-white border-slate-50 text-slate-300 hover:border-slate-100 hover:text-slate-400'}`}
                                    >
                                        <mood.icon className="w-8 h-8" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{mood.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Emotional Journal</label>
                            <textarea
                                value={mentalNote}
                                onChange={(e) => setMentalNote(e.target.value)}
                                placeholder="What's weighing on your mind today?"
                                className="w-full bg-white border border-slate-100 rounded-3xl p-6 md:p-8 text-xs md:text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[160px] md:min-h-[220px] resize-none leading-relaxed"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
                            <button
                                onClick={() => handleAction('aihealth_get_mental_support')}
                                className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl md:rounded-[32px] text-xs md:text-[13px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-4 group"
                            >
                                <Heart className="w-5 h-5 fill-white" />
                                <span>Healing Scan</span>
                            </button>
                            {renderActionControls()}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-8">
                    <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm space-y-8 flex-grow">
                        <div><h4 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-2">Mood Trajectory</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bi-weekly pattern analysis</p></div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={moodHistory}><defs><linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="date" hide /><YAxis hide domain={[0, 6]} /><Tooltip /><Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorMood)" /></AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                            <div className="p-5 bg-emerald-50/50 rounded-2xl text-center"><div className="text-[9px] font-black text-emerald-600 uppercase mb-1">Status</div><div className="text-xl font-black text-slate-800">Stable</div></div>
                            <div className="p-5 bg-blue-50/50 rounded-2xl text-center"><div className="text-[9px] font-black text-blue-600 uppercase mb-1">Dominant</div><div className="text-xl font-black text-slate-800">Calm</div></div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {mentalResult && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[40px] p-8 md:p-12 shadow-xl space-y-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
                            <div className="space-y-4">
                                <h4 className="text-2xl font-black text-slate-800 tracking-tight">AI Empathy Response</h4>
                                <p className="text-base md:text-lg font-bold text-slate-600 leading-relaxed italic border-l-4 border-blue-500 pl-6">"{mentalResult.sentiment}"</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><Zap className="w-5 h-5" /></div><h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Affirmation</h5></div>
                                    <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl font-bold text-slate-700 leading-relaxed italic text-sm md:text-base">"{mentalResult.affirmation}"</div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><Heart className="w-5 h-5" /></div><h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Action Steps</h5></div>
                                    <div className="space-y-3">
                                        {mentalResult.actionSteps?.map((step, i) => (
                                            <div key={i} className="flex gap-4 p-4 bg-white border border-slate-50 rounded-2xl text-[12px] font-bold text-slate-600 shadow-sm items-center"><div className="w-6 h-6 rounded-lg bg-blue-100/50 text-blue-600 flex items-center justify-center text-[10px] shrink-0 font-black">{i + 1}</div>{step}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 bg-[#1a1c2e] text-white rounded-[40px] p-10 shadow-2xl space-y-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Wind className="w-10 h-10 text-blue-400 animate-pulse" />
                            <div className="space-y-4 relative z-10">
                                <h4 className="text-xl font-black tracking-tight">{mentalResult.breathingExercise?.name || 'Vagus Nerve Reset'}</h4>
                                <div className="flex flex-col gap-2 opacity-60">
                                    {mentalResult.breathingExercise?.steps?.map((step, i) => (
                                        <span key={i} className="text-[10px] font-bold uppercase tracking-widest">{step}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="relative h-32 w-32 flex items-center justify-center">
                                <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute w-full h-full bg-blue-500/20 rounded-full blur-2xl" />
                                <div className="w-20 h-20 border-2 border-blue-400/50 rounded-full flex items-center justify-center backdrop-blur-md"><Activity className="w-6 h-6 text-blue-400" /></div>
                            </div>
                            <button onClick={() => { const s = new SpeechSynthesisUtterance(mentalResult.affirmation); window.speechSynthesis.speak(s); }} className="w-full py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-white/5">Launch Session</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    const renderTreatmentAdvisorUI = () => (
        <div className="w-full space-y-8 md:space-y-12 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                <div className="lg:col-span-12 xl:col-span-5 bg-white/40 backdrop-blur-3xl border border-white/50 rounded-3xl md:rounded-[40px] p-6 md:p-10 lg:p-12 shadow-xl shadow-blue-500/5 space-y-10">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/5 border border-blue-100/50">
                            <Shield className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <div className="space-y-0.5 md:space-y-1">
                            <h3 className="text-[8px] md:text-[10px] font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-0.5 md:py-1 rounded-full inline-block tracking-[0.2em] mb-1.5 md:mb-2 uppercase">PHARMA AI</h3>
                            <h3 className="text-lg md:text-3xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 bg-clip-text text-transparent leading-tight">Treatment Advisor</h3>
                            <p className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dosage validation & therapeutic safely scan.</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Medication Identity</label>
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    value={medicineName}
                                    onChange={(e) => setMedicineName(e.target.value)}
                                    placeholder="e.g. Metformin or Ashwagandha"
                                    className="w-full bg-white border border-slate-50 rounded-[28px] md:rounded-[32px] py-5 md:py-6 pl-16 pr-8 text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">System</label>
                                <CustomSelect value={treatmentTypeChoice} onChange={(e) => setTreatmentTypeChoice(e.target.value)} options={['Allopathy', 'Ayurveda', 'Homeopathy']} className="premium-select" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Condition</label>
                                <input
                                    type="text"
                                    value={healthCondition}
                                    onChange={(e) => setHealthCondition(e.target.value)}
                                    placeholder="Target pathology..."
                                    className="w-full bg-white border border-slate-50 rounded-2xl md:rounded-[28px] px-6 py-4 text-[12px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => handleAction('aihealth_get_treatment_guide')}
                            disabled={!medicineName}
                            className="w-full py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-[28px] md:rounded-[32px] text-[13px] font-black uppercase tracking-[0.25em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-4 group"
                        >
                            <Activity className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span>Run Clinical Protocol</span>
                        </button>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex flex-col gap-6">
                        <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                            <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Neural Usage Analytics</h5>
                            <div className="h-[100px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={treatmentHistory}><Area type="monotone" dataKey="scans" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.05} /></AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        {renderActionControls()}
                    </div>
                </div>

                <div className="lg:col-span-12 xl:col-span-7 flex flex-col items-center justify-center text-center p-8 md:p-12 bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] shadow-sm min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {!treatmentResult ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 max-w-xs">
                                <div className="w-20 h-20 rounded-[30px] bg-blue-50 text-blue-500 flex items-center justify-center mx-auto shadow-inner"><Shield className="w-8 h-8" /></div>
                                <h4 className="text-xl font-black text-slate-800 tracking-tight">Clinical Buffer</h4>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Awaiting pharmacologic parameters to initiate neural scan & safety audit.</p>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-left space-y-10">
                                <div className="p-8 bg-gradient-to-br from-slate-900 to-blue-950 rounded-[35px] text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10"><Zap className="w-24 h-24" /></div>
                                    <div className="relative z-10 space-y-4">
                                        <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">Safety Protocol Active</span></div>
                                        <p className="text-lg font-black leading-snug">{treatmentResult.purpose}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h5 className="text-[11px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-3">Side Effects</h5>
                                        <div className="space-y-3">
                                            {treatmentResult.sideEffects?.map((effect, i) => (
                                                <div key={i} className="p-5 bg-white border border-rose-50 rounded-2xl text-[11px] font-black text-slate-700 shadow-sm">{effect}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h5 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">Safety Alerts</h5>
                                        <div className="space-y-3">
                                            {treatmentResult.precautions?.map((p, i) => (
                                                <div key={i} className="p-5 bg-white border border-emerald-50 rounded-2xl text-[11px] font-black text-slate-700 shadow-sm flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />{p}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );

    const renderAutomationUI = () => (
        <div className="w-full space-y-8 md:space-y-12 pb-20">
            <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-3xl md:rounded-[40px] p-6 md:p-10 lg:p-12 shadow-xl shadow-blue-500/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/5 border border-blue-100/50">
                            <Activity className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <div className="space-y-0.5 md:space-y-1">
                            <h3 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">Neural Vitals Input</h3>
                            <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Autonomous decision engine synchronization hub.</p>
                        </div>
                    </div>
                    <button onClick={() => handleAction('aihealth_log_data')} className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-500/20">Log & Audit Pipeline</button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { label: 'Sleep (Hrs)', value: healthSleepHours, setter: setHealthSleepHours, icon: Moon, color: 'text-indigo-500' },
                        { label: 'Water (L)', value: healthWaterIntake, setter: setHealthWaterIntake, icon: Droplets, color: 'text-blue-500' },
                        { label: 'Steps', value: healthSteps, setter: setHealthSteps, icon: Footprints, color: 'text-emerald-500' },
                        { label: 'Stress (1-10)', value: healthStressLevel, setter: setHealthStressLevel, icon: Activity, color: 'text-rose-500', isRange: true }
                    ].map((field, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-sm hover:border-blue-200 transition-all">
                            <div className="flex items-center justify-between"><field.icon className={`w-5 h-5 ${field.color}`} /><span className={`text-[10px] font-black ${field.color} uppercase tracking-widest`}>{field.label}</span></div>
                            {field.isRange ? (
                                <div className="space-y-2">
                                    <input type="range" min="1" max="10" value={field.value} onChange={(e) => field.setter(e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                                    <div className="text-center font-black text-rose-500 text-sm">{field.value}/10</div>
                                </div>
                            ) : (
                                <input type="number" value={field.value} onChange={(e) => field.setter(e.target.value)} className="w-full text-xl font-black text-slate-700 bg-transparent outline-none" placeholder="0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                <div className="lg:col-span-7 xl:col-span-8 bg-white/40 backdrop-blur-3xl border border-white/50 rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-sm space-y-8">
                    <div className="flex items-center justify-between"><h4 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3"><ShieldCheck className="text-blue-600" /> Risk Pipeline Logs</h4><div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase">Scanning Bio-Patterns</div></div>
                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                        {healthAutomationLogs.map((log) => (
                            <div key={log.id} className={`p-5 bg-white/60 border border-white rounded-2xl shadow-sm flex gap-5 transition-all hover:bg-white ${log.severity === 'High' ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-blue-500'}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${log.severity === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>{log.type === 'Detection' ? <Eye size={18} /> : <Brain size={18} />}</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1"><span className={`text-[9px] font-black uppercase ${log.severity === 'High' ? 'text-rose-500' : 'text-blue-500'}`}>{log.type} // {log.category}</span><span className="text-[8px] font-bold text-slate-300 uppercase">{log.time}</span></div>
                                    <p className="text-xs font-bold text-slate-700 leading-relaxed">{log.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
                    <div className="bg-[#1a1c2e] text-white rounded-[40px] p-8 md:p-10 shadow-2xl space-y-8 relative overflow-hidden group flex-grow">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="w-32 h-32" /></div>
                        <div className="relative z-10 space-y-8">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Autonomous Routing</h4>
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                                <h5 className="text-lg font-black">Daily Sync Strategy</h5>
                                <ul className="space-y-4">
                                    {['Early Solar Exposure', 'Cognitive Loading Phase', 'Deep Sleep Recovery Polling'].map((step, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-blue-100/60"><div className="w-5 h-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-black shrink-0">{i + 1}</div>{step}</li>
                                    ))}
                                </ul>
                            </div>
                            <button onClick={() => handleAction('aihealth_run_automation')} className="w-full py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Trigger Neural Refresh</button>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><BrainCircuit size={20} /></div><span className="text-sm font-black text-slate-800">Neural Sync</span></div>
                            <button onClick={() => { setEditingHealthTask(null); setIsAssistantModalOpen(true); }} className="p-2 bg-slate-900 text-white rounded-lg hover:scale-110 transition-all"><PenTool size={14} /></button>
                        </div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar text-[11px] font-bold text-slate-400 p-4 border-2 border-dashed border-slate-50 rounded-3xl text-center">Neural memory stream active. Syncing biological tasks...</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-12 min-h-screen">
            {/* Header & Logo Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 mb-10 md:mb-16">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-2xl md:rounded-[32px] flex items-center justify-center shadow-[0_15px_30px_rgba(37,99,235,0.25)] group hover:rotate-6 transition-all duration-500">
                        <Activity className="w-6 h-6 md:w-10 md:h-10 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                        <h1 className="text-2xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 bg-clip-text text-transparent leading-none">AIHEALTH <span className="text-blue-600">PRO</span></h1>
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                            <span className="text-[9px] md:text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-50 px-2.5 py-1 rounded-full whitespace-nowrap">Biological Intelligence</span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] md:text-[11px] font-black text-slate-300 uppercase tracking-widest leading-none whitespace-nowrap">Neural Link Active</span>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="flex items-center gap-2 md:gap-3 bg-white/60 p-1.5 md:p-2.5 rounded-2xl md:rounded-[32px] border border-white/50 shadow-xl shadow-blue-500/5 overflow-x-auto no-scrollbar max-w-full">
                    {HEALTH_MODES.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => {
                                setHealthMode(mode.id);
                                clearResults();
                            }}
                            className={`flex items-center gap-2 px-3.5 md:px-7 py-2.5 md:py-4 rounded-xl md:rounded-[24px] text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${healthMode === mode.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_10px_25px_rgba(37,99,235,0.25)] scale-[1.05]' : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        >
                            <mode.icon size={14} className="md:w-[15px] md:h-[15px]" />
                            <span>{mode.id}</span>
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={healthMode}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                >
                    {healthMode === 'SYMPTOM CHECKER' && renderSymptomCheckerUI()}
                    {healthMode === 'REPORT ANALYZER' && renderReportAnalyzerUI()}
                    {healthMode === 'WELLNESS PLANNER' && renderWellnessPlannerUI()}
                    {healthMode === 'MENTAL SUPPORT' && renderMentalSupportUI()}
                    {healthMode === 'TREATMENT ADVISOR' && renderTreatmentAdvisorUI()}
                    {healthMode === 'AUTOMATION' && renderAutomationUI()}
                </motion.div>
            </AnimatePresence>

            <TaskModal
                isOpen={isAssistantModalOpen}
                onClose={() => { setIsAssistantModalOpen(false); setEditingHealthTask(null); }}
                onSave={handleSaveHealthTask}
                task={editingHealthTask}
            />

        </div>
    );
};

export default AIHEALTHInputs;
