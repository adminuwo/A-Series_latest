import React, { useState, useEffect } from 'react';
import {
    Activity, User, Minus, Plus, Scale, Utensils, Salad, Zap,
    FileText, BarChart3, ChevronRight, Heart, Brain, Stethoscope, ClipboardList,
    PenTool, Upload, Smile, Frown, Coffee, Wind, Play, Pause, Volume2, AlertCircle,
    ChevronDown, Trash2, Clock, Calendar, CheckCircle,
    Search as SearchIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/apiService';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import axios from 'axios';
import { apis } from '../../types';
import { getUserData } from '../../userStore/userData';
import CustomSelect from '../../Components/AISAWorkSpace/CustomSelect.jsx';

const TABS = [
    { id: 'SymptomChecker', label: 'Symptom Checker', icon: Activity, endpoint: '/api/aihealth/symptom-check' },
    { id: 'ReportAnalyzer', label: 'Report Analyzer', icon: ClipboardList, endpoint: '/api/aihealth/report-analysis' },
    { id: 'WellnessPlanner', label: 'Wellness Planner', icon: Heart, endpoint: '/api/aihealth/wellness-plan' },
    { id: 'MentalSupport', label: 'Mental Support', icon: Brain, endpoint: '/api/aihealth/mental-support' },
    { id: 'TreatmentGuide', label: 'Treatment Guide', icon: Stethoscope, endpoint: '/api/aihealth/treatment-guide' },
    { id: 'HealthTasks', label: 'Health Tasks', icon: Clock }
];

const AIHealthDashboard = () => {
    const [activeTab, setActiveTab] = useState('SymptomChecker');
    const [isProcessing, setIsProcessing] = useState(false);
    const user = getUserData() || {};

    // --- SHARED STATES ---
    const [healthAge, setHealthAge] = useState(28);
    const [healthGender, setHealthGender] = useState('Male');
    const [healthHeight, setHealthHeight] = useState(175);
    const [healthWeight, setHealthWeight] = useState(70);

    // --- SYMPTOM CHECKER STATES ---
    const [symptoms, setSymptoms] = useState('');
    const [symptomDuration, setSymptomDuration] = useState('2-3 Days');
    const [symptomSeverity, setSymptomSeverity] = useState('Moderate');
    const [symptomTreatmentType, setSymptomTreatmentType] = useState('Allopathy');
    const [symptomResult, setSymptomResult] = useState(null);

    // --- REPORT ANALYZER STATES ---
    const [reportManualValues, setReportManualValues] = useState({
        bp_systolic: '',
        bp_diastolic: '',
        sugar_fasting: '',
        cholesterol: '',
        hemoglobin: ''
    });
    const [reportResult, setReportResult] = useState(null);
    const [reportFile, setReportFile] = useState(null);

    // --- WELLNESS PLANNER STATES ---
    const [healthGoal, setHealthGoal] = useState('Weight Loss');
    const [healthActivityLevel, setHealthActivityLevel] = useState('Moderate');
    const [healthDietaryType, setHealthDietaryType] = useState('Non-Vegetarian');
    const [healthAllergies, setHealthAllergies] = useState('');
    const [healthCuisine, setHealthCuisine] = useState('Any');
    const [wellnessPlanResult, setWellnessPlanResult] = useState(null);

    // --- MENTAL SUPPORT STATES ---
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

    // --- TREATMENT GUIDE STATES ---
    const [medicineName, setMedicineName] = useState('');
    const [treatmentTypeChoice, setTreatmentTypeChoice] = useState('Allopathy');
    const [healthCondition, setHealthCondition] = useState('');
    const [treatmentResult, setTreatmentResult] = useState(null);

    // --- HEALTH TASKS STATES ---
    const [healthTasks, setHealthTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    useEffect(() => {
        if (activeTab === 'HealthTasks') {
            fetchHealthTasks();
        }
    }, [activeTab]);

    const fetchHealthTasks = async () => {
        setLoadingTasks(true);
        try {
            const tasks = await apiService.getPersonalTasks({ category: 'Health' });
            setHealthTasks(tasks.filter(t => t.category === 'Health'));
        } catch (err) {
            toast.error("Failed to load health tasks");
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleAddToAssistant = async (type, name, metadata = {}) => {
        try {
            const taskData = {
                title: type === 'Medicine' ? `Take ${name}` : `Health: ${name}`,
                description: type === 'Medicine' ? `Dosage reminder for ${name}` : (metadata.description || `Health routine for ${name}`),
                category: 'Health',
                datetime: new Date().setHours(9, 0, 0, 0) + (24 * 60 * 60 * 1000), // Default to 9 AM tomorrow
                recurring: type === 'Medicine' ? 'daily' : 'none',
                isUrgent: type === 'Medicine'
            };
            await apiService.createPersonalTask(taskData);
            toast.success(`"${taskData.title}" added to Personal Assistant!`);
        } catch (err) {
            toast.error("Failed to add task");
        }
    };

    const toggleTaskComplete = async (task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        try {
            await apiService.updatePersonalTask(task._id, { status: newStatus });
            setHealthTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const handleAction = async (actionType) => {
        setIsProcessing(true);
        const backendUrl = apis.backendUrl || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://backend-ttl8.onrender.com');

        try {
            let endpoint = '';
            let payload = {};
            let config = { withCredentials: true };

            if (actionType === 'aihealth_symptom_check') {
                endpoint = `${backendUrl}/api/aihealth/symptom-check`;
                payload = {
                    age: healthAge,
                    gender: healthGender,
                    symptoms,
                    duration: symptomDuration,
                    severity: symptomSeverity,
                    treatmentType: symptomTreatmentType
                };
            } else if (actionType === 'aihealth_analyze_report') {
                endpoint = `${backendUrl}/api/aihealth/report-analysis`;
                const formData = new FormData();
                if (reportFile) formData.append('reportFile', reportFile);
                formData.append('manualValues', JSON.stringify(reportManualValues));
                payload = formData;
                config.headers = { 'Content-Type': 'multipart/form-data' };
            } else if (actionType === 'aihealth_generate_wellness_plan') {
                endpoint = `${backendUrl}/api/aihealth/wellness-plan`;
                payload = {
                    age: healthAge,
                    height: healthHeight,
                    weight: healthWeight,
                    goal: healthGoal,
                    activityLevel: healthActivityLevel,
                    dietaryType: healthDietaryType,
                    allergies: healthAllergies,
                    cuisine: healthCuisine
                };
            } else if (actionType === 'aihealth_get_mental_support') {
                endpoint = `${backendUrl}/api/aihealth/mental-support`;
                payload = {
                    mood: healthMood,
                    note: mentalNote
                };
            } else if (actionType === 'aihealth_get_treatment_guide') {
                endpoint = `${backendUrl}/api/aihealth/treatment-guide`;
                payload = {
                    medicineName,
                    treatmentType: treatmentTypeChoice,
                    condition: healthCondition
                };
            }

            const response = await axios.post(endpoint, payload, config);

            if (response.data.success) {
                if (actionType === 'aihealth_symptom_check') setSymptomResult(response.data.data);
                if (actionType === 'aihealth_analyze_report') setReportResult(response.data.data);
                if (actionType === 'aihealth_generate_wellness_plan') setWellnessPlanResult(response.data.data);
                if (actionType === 'aihealth_get_mental_support') {
                    setMentalResult(response.data.data);
                    const moodScores = { 'Happy': 5, 'Tired': 3, 'Stressed': 2, 'Anxious': 1 };
                    const newEntry = { date: 'Today', score: moodScores[healthMood] || 3 };
                    setMoodHistory(prev => [...prev.slice(1), newEntry]);
                }
                if (actionType === 'aihealth_get_treatment_guide') setTreatmentResult(response.data.data);
            }
        } catch (err) {
            console.error('[AIHEALTH DASHBOARD ERROR]', err);
            alert("Action failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8">
            <div className="w-full space-y-8">
                {/* Header Section */}
                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                            <Heart className="w-8 h-8 text-white fill-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                AIHEALTH <span className="text-xs bg-rose-50 text-rose-500 px-3 py-1 rounded-full uppercase tracking-widest font-black">Professional</span>
                            </h1>
                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Quantum Health Intelligence Systems</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-50 p-2 rounded-3xl border border-slate-100 overflow-x-auto no-scrollbar max-w-full">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-rose-500 shadow-md translate-y-[-1px]' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 gap-8">
                    {/* --- SYMPTOM CHECKER --- */}
                    {activeTab === 'SymptomChecker' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Input Grid */}
                            <div className="bg-white border border-slate-100 rounded-[40px] p-8 lg:p-10 shadow-sm space-y-10">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    {/* Medical Profile Section */}
                                    <div className="lg:col-span-4 space-y-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <User className="w-5 h-5 text-rose-500" />
                                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Patient Profile</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Age</label>
                                                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
                                                    <span className="text-lg font-black text-slate-700">{healthAge}</span>
                                                    <div className="flex flex-col gap-1">
                                                        <button onClick={() => setHealthAge(prev => prev + 1)} className="hover:text-rose-500"><Plus size={14} /></button>
                                                        <button onClick={() => setHealthAge(prev => Math.max(1, prev - 1))} className="hover:text-rose-500"><Minus size={14} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biological Gender</label>
                                                <CustomSelect value={healthGender} onChange={setHealthGender} options={['Male', 'Female', 'Other']} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clinical Data Section */}
                                    <div className="lg:col-span-8 space-y-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <ClipboardList className="w-5 h-5 text-rose-500" />
                                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Clinical Observation</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Describe Symptoms</label>
                                            <textarea
                                                value={symptoms}
                                                onChange={(e) => setSymptoms(e.target.value)}
                                                placeholder="Describe your symptoms in detail (e.g., stabbing chest pain, recurring migranes)..."
                                                className="w-full bg-slate-50 border border-slate-100 rounded-[32px] p-6 text-sm font-medium text-slate-600 outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 transition-all min-h-[140px]"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                                                <CustomSelect value={symptomDuration} onChange={setSymptomDuration} options={['Just Started', '2-3 Days', '1 Week', 'Chronic']} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Severity</label>
                                                <CustomSelect value={symptomSeverity} onChange={setSymptomSeverity} options={['Mild', 'Moderate', 'Severe', 'Critical']} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical System</label>
                                                <CustomSelect value={symptomTreatmentType} onChange={setSymptomTreatmentType} options={['Allopathy', 'Ayurveda', 'Homeopathy']} />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAction('aihealth_symptom_check')}
                                            className="w-full py-5 bg-rose-500 text-white rounded-[28px] text-[12px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                        >
                                            <Zap className="w-4 h-4 fill-white" />
                                            Run Clinical Analysis
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Result Area */}
                            {symptomResult && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-xl space-y-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center"><Activity className="w-5 h-5" /></div>
                                                <h5 className="font-black text-slate-700 uppercase tracking-widest text-xs">Probable Diagnosis</h5>
                                            </div>
                                            <div className="p-6 bg-slate-50 rounded-[32px] border-l-4 border-rose-500">
                                                <p className="text-lg font-bold text-slate-800 leading-tight">{symptomResult.diagnosis}</p>
                                                <p className="text-sm font-medium text-slate-500 mt-2">{symptomResult.explanation}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><AlertCircle className="w-5 h-5" /></div>
                                                <h5 className="font-black text-slate-700 uppercase tracking-widest text-xs">Recommended Actions</h5>
                                            </div>
                                            <ul className="space-y-3">
                                                {symptomResult.recommendations?.map((rec, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                                        <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" /> {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* --- REPORT ANALYZER --- */}
                    {activeTab === 'ReportAnalyzer' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm space-y-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Upload Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><Upload className="w-6 h-6" /></div>
                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Upload PDF Report</h3>
                                        </div>
                                        <div
                                            onClick={() => document.getElementById('report-upload').click()}
                                            className="border-2 border-dashed border-slate-100 rounded-[32px] p-10 flex flex-col items-center justify-center text-center space-y-4 hover:bg-slate-50/50 cursor-pointer transition-all"
                                        >
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shadow-sm"><FileText className="w-8 h-8" /></div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{reportFile ? reportFile.name : 'Drop your lab report here'}</p>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">PDF Format only (Max 5MB)</p>
                                            </div>
                                            <input
                                                id="report-upload"
                                                type="file"
                                                className="hidden"
                                                accept="application/pdf"
                                                onChange={(e) => setReportFile(e.target.files[0])}
                                            />
                                        </div>
                                    </div>

                                    {/* Manual Form Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl"><PenTool className="w-6 h-6" /></div>
                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Manual Entry</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'BP (SYSTOLIC)', key: 'bp_systolic', placeholder: '120' },
                                                { label: 'BP (DIASTOLIC)', key: 'bp_diastolic', placeholder: '80' },
                                                { label: 'BLOOD SUGAR (F)', key: 'sugar_fasting', placeholder: '95' },
                                                { label: 'CHOLESTEROL', key: 'cholesterol', placeholder: '180' },
                                                { label: 'HEMOGLOBIN', key: 'hemoglobin', placeholder: '14.5' }
                                            ].map((field) => (
                                                <div key={field.key} className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">{field.label}</label>
                                                    <input
                                                        type="text"
                                                        value={reportManualValues[field.key]}
                                                        onChange={(e) => setReportManualValues({ ...reportManualValues, [field.key]: e.target.value })}
                                                        placeholder={field.placeholder}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAction('aihealth_analyze_report')}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[28px] text-[12px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                                >
                                    <Activity className="w-4 h-4" />
                                    Launch Report Analysis
                                </button>
                            </div>

                            {/* Report Result Area */}
                            {reportResult && (
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Clinical Report Analysis</h4>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                        <div className="lg:col-span-3">
                                            <p className="text-lg font-medium text-slate-600 leading-relaxed italic">"{reportResult.summary}"</p>
                                        </div>
                                        <div className="bg-rose-50 border border-rose-100/50 rounded-[32px] p-6 text-center space-y-2">
                                            <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Health Score</div>
                                            <div className="text-4xl font-black text-rose-600">{reportResult.healthScore || '8.5'}/10</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* --- WELLNESS PLANNER --- */}
                    {activeTab === 'WellnessPlanner' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Shared Profile & Plan Inputs */}
                            <div className="bg-white border border-slate-100 rounded-[40px] p-8 lg:p-10 shadow-sm space-y-10">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    {/* Physical Profile Section */}
                                    <div className="lg:col-span-4 space-y-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Scale className="w-5 h-5 text-[#5865f2]" />
                                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Physical Profile</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Height (cm)</label>
                                                <input
                                                    type="number"
                                                    value={healthHeight}
                                                    onChange={(e) => setHealthHeight(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-lg font-black text-slate-700 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                                                <input
                                                    type="number"
                                                    value={healthWeight}
                                                    onChange={(e) => setHealthWeight(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-lg font-black text-slate-700 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Strategy Engine Section */}
                                    <div className="lg:col-span-8 space-y-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Zap className="w-5 h-5 text-[#5865f2]" />
                                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Strategy Engine</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Goal</label>
                                                <CustomSelect value={healthGoal} onChange={setHealthGoal} options={['Weight Loss', 'Muscle Gain', 'Endurance', 'Ayurvedic Detox']} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Activity Level</label>
                                                <CustomSelect value={healthActivityLevel} onChange={setHealthActivityLevel} options={['Sedentary', 'Moderate', 'Active', 'Athlete']} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dietary Type</label>
                                                <CustomSelect value={healthDietaryType} onChange={setHealthDietaryType} options={['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Keto', 'Paleo']} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Allergies (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={healthAllergies}
                                                    onChange={(e) => setHealthAllergies(e.target.value)}
                                                    placeholder="Peanuts, Dairy..."
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Cuisine</label>
                                                <CustomSelect value={healthCuisine} onChange={setHealthCuisine} options={['Any', 'Indian', 'Mediterranean', 'Fast Food (Healthy)', 'Japanese']} />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAction('aihealth_generate_wellness_plan')}
                                            className="w-full py-5 bg-[#5865f2] text-white rounded-[28px] text-[12px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#5865f2]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                        >
                                            <Activity className="w-4 h-4 fill-white" />
                                            Build Wellness Roadmap
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Wellness Result Area */}
                            {wellnessPlanResult && (
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                        <div className="bg-white border border-slate-100 rounded-[32px] p-6 lg:col-span-1 flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">BMI Score</div>
                                            <div className="text-4xl font-black text-[#5865f2] leading-none">{wellnessPlanResult.bmiValue}</div>
                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${wellnessPlanResult.bmiValue < 18.5 ? 'bg-amber-50 text-amber-500' : wellnessPlanResult.bmiValue < 25 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                                {wellnessPlanResult.bmiValue < 18.5 ? 'Underweight' : wellnessPlanResult.bmiValue < 25 ? 'Normal' : 'Overweight'}
                                            </div>
                                        </div>
                                        <div className="bg-[#f0f4ff]/40 border border-[#e0e8ff] rounded-[32px] p-6 lg:col-span-3 flex items-center gap-6 shadow-sm">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#5865f2] shadow-sm shrink-0"><Heart className="w-6 h-6" /></div>
                                            <p className="text-sm font-bold text-slate-600 leading-relaxed italic">"{wellnessPlanResult.bmiAnalysis}"</p>
                                        </div>
                                    </div>

                                    {/* Daily Targets - Simplified Representation */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { label: 'CALORIES', value: wellnessPlanResult.dailyStats?.calories, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                                            { label: 'HYDRATION', value: wellnessPlanResult.dailyStats?.water, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
                                            { label: 'SLEEP', value: wellnessPlanResult.dailyStats?.sleep, icon: Brain, color: 'text-[#5865f2]', bg: 'bg-[#f0f4ff]' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white border border-slate-100 rounded-[32px] p-6 flex items-center justify-between shadow-sm">
                                                <div>
                                                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{stat.label}</div>
                                                    <div className="text-xl font-black text-slate-700">{stat.value}</div>
                                                </div>
                                                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}><stat.icon className="w-5 h-5" /></div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleAddToAssistant('Wellness', healthGoal, { description: wellnessPlanResult.bmiAnalysis })}
                                        className="w-full py-4 mt-4 bg-emerald-500 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Sync Goal to Personal Assistant
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* --- MENTAL SUPPORT --- */}
                    {activeTab === 'MentalSupport' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Mood & Entry Section */}
                                <div className="bg-white border border-slate-100 rounded-[40px] p-8 lg:p-10 shadow-sm space-y-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-[#f0f4ff] text-[#5865f2] flex items-center justify-center shadow-sm"><Brain className="w-7 h-7" /></div>
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Mental Health Support</h3>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Empathetic AI-driven wellness companion.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">How are you feeling right now?</label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {[
                                                    { id: 'Happy', label: 'Happy', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                                    { id: 'Stressed', label: 'Stressed', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                                                    { id: 'Anxious', label: 'Anxious', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
                                                    { id: 'Tired', label: 'Tired', icon: Coffee, color: 'text-blue-500', bg: 'bg-blue-50' }
                                                ].map(mood => (
                                                    <button
                                                        key={mood.id}
                                                        onClick={() => setHealthMood(mood.id)}
                                                        className={`flex flex-col items-center gap-3 p-5 rounded-[28px] border transition-all duration-300 ${healthMood === mood.id ? `${mood.bg} ${mood.color} border-current shadow-sm scale-[1.05]` : 'bg-slate-50 border-transparent text-slate-400 grayscale'}`}
                                                    >
                                                        <mood.icon className="w-7 h-7" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{mood.label}</span>
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
                                        <button
                                            onClick={() => handleAction('aihealth_get_mental_support')}
                                            className="w-full py-5 bg-[#5865f2] text-white rounded-[28px] text-[12px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                        >
                                            <Heart className="w-4 h-4 fill-white" />
                                            Get AI-Powered Support
                                        </button>
                                    </div>
                                </div>

                                {/* History Tracker */}
                                <div className="bg-white border border-slate-100 rounded-[40px] p-8 lg:p-10 shadow-sm flex flex-col gap-8">
                                    <div>
                                        <h4 className="text-lg font-black text-slate-800 tracking-tight mb-1">Your Mood Trends</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Weekly emotional trajectory</p>
                                    </div>
                                    <div className="h-[220px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={moodHistory}>
                                                <defs>
                                                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#5865f2" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#5865f2" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#cbd5e1' }} dy={10} />
                                                <YAxis hide domain={[0, 6]} />
                                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                                                <Area type="monotone" dataKey="score" stroke="#5865f2" strokeWidth={4} fillOpacity={1} fill="url(#colorMood)" animationDuration={2000} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-auto grid grid-cols-2 gap-4">
                                        <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-100/50">
                                            <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Weekly Avg</div>
                                            <div className="text-2xl font-black text-emerald-700">Stable</div>
                                        </div>
                                        <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100/50">
                                            <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Top Feeling</div>
                                            <div className="text-2xl font-black text-blue-700">Calm</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mental Result */}
                            {mentalResult && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-xl space-y-10" style={{ borderTop: `8px solid ${mentalResult.supportColor || '#5865f2'}` }}>
                                    <p className="text-lg font-medium text-slate-500 leading-relaxed italic">"{mentalResult.sentiment}"</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="bg-slate-50 p-6 rounded-[32px] border-l-4 border-amber-400 italic font-bold text-slate-600 leading-relaxed">"{mentalResult.affirmation}"</div>
                                        <ul className="space-y-3">
                                            {mentalResult.actionSteps?.map((step, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-500 font-bold">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] shrink-0">{i + 1}</div> {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* --- TREATMENT GUIDE --- */}
                    {activeTab === 'TreatmentGuide' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="bg-white border border-slate-100 rounded-[40px] p-8 lg:p-10 shadow-sm space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medicine Name</label>
                                        <input type="text" value={medicineName} onChange={(e) => setMedicineName(e.target.value)} placeholder="e.g. Metformin" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-6 text-sm font-bold text-slate-700 outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Treatment System</label>
                                        <CustomSelect value={treatmentTypeChoice} onChange={setTreatmentTypeChoice} options={['Allopathy', 'Ayurveda', 'Homeopathy', 'Naturopathy']} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Condition</label>
                                        <input type="text" value={healthCondition} onChange={(e) => setHealthCondition(e.target.value)} placeholder="e.g. Type 2 Diabetes" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-6 text-sm font-bold text-slate-700 outline-none" />
                                    </div>
                                </div>
                                <button onClick={() => handleAction('aihealth_get_treatment_guide')} className="w-full py-5 bg-slate-900 text-white rounded-[28px] text-[12px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                                    <SearchIcon className="w-4 h-4" /> Search Treatment Guidance
                                </button>
                            </div>

                            {treatmentResult && (
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                    <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center"><FileText className="w-4 h-4" /></div> Purpose
                                            </h4>
                                            <button
                                                onClick={() => handleAddToAssistant('Medicine', medicineName)}
                                                className="px-4 py-2 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 transition-all flex items-center gap-2"
                                            >
                                                <Clock className="w-3 h-3" />
                                                Add Dosage Reminder
                                            </button>
                                        </div>
                                        <p className="text-sm font-bold text-slate-500 leading-relaxed italic">"{treatmentResult.purpose}"</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
                                            <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-6">Side Effects</h5>
                                            <ul className="space-y-4">
                                                {treatmentResult.sideEffects?.map((effect, i) => (
                                                    <li key={i} className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" /> <span className="text-sm font-bold text-slate-600">{effect}</span></li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
                                            <h5 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-6">Precautions</h5>
                                            <ul className="space-y-4">
                                                {treatmentResult.precautions?.map((pre, i) => (
                                                    <li key={i} className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" /> <span className="text-sm font-bold text-slate-600">{pre}</span></li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-amber-50 rounded-[32px] border border-amber-100/50 flex items-start gap-5">
                                        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                                        <p className="text-[12px] font-bold text-amber-700/70 leading-relaxed italic">{treatmentResult.medicalDisclaimer}</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* --- HEALTH TASKS (PERSONAL ASSISTANT INTEGRATION) --- */}
                    {activeTab === 'HealthTasks' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="bg-white border border-slate-100 rounded-[40px] p-8 lg:p-10 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Smart Health Reminders</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tasks synced with your AI Personal Assistant</p>
                                    </div>
                                    <button
                                        onClick={fetchHealthTasks}
                                        className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                        <Zap className={`w-5 h-5 ${loadingTasks ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>

                                {loadingTasks ? (
                                    <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Neural Database...</div>
                                ) : healthTasks.length === 0 ? (
                                    <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[32px]">
                                        <Clock className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold">No health tasks scheduled.</p>
                                        <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-2">Add reminders from the Treatment or Wellness tabs.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {healthTasks.map((task) => (
                                            <div key={task._id} className="group bg-slate-50 border border-slate-100 p-6 rounded-[32px] flex items-center gap-5 hover:bg-white hover:shadow-xl hover:scale-[1.01] transition-all">
                                                <button
                                                    onClick={() => toggleTaskComplete(task)}
                                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent hover:border-emerald-500'}`}
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <div className="flex-1">
                                                    <h4 className={`text-lg font-black tracking-tight ${task.status === 'completed' ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                                                        {task.title}
                                                    </h4>
                                                    <p className="text-xs font-medium text-slate-400 mt-1">{task.description}</p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full text-[10px] font-black text-rose-500 uppercase tracking-widest shadow-sm">
                                                            <Clock size={12} />
                                                            {new Date(task.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest shadow-sm">
                                                            <Calendar size={12} />
                                                            {new Date(task.datetime).toLocaleDateString()}
                                                        </div>
                                                        {task.recurring !== 'none' && (
                                                            <div className="px-3 py-1 bg-amber-50 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                                                🔄 {task.recurring}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Global Loader Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-slate-100 border-t-rose-500 rounded-full" />
                        <p className="mt-8 text-[11px] font-black text-rose-500 uppercase tracking-[0.3em] animate-pulse">Running Diagnostic AI...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIHealthDashboard;

