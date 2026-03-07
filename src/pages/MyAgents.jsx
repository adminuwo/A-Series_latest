import React, { useEffect, useState } from 'react';
import { Plus, Settings, Trash2, Bot, Code, Edit3, Save, FileText, Download } from 'lucide-react';
import { apiService } from '../services/apiService';
import axios from 'axios';
import { apis, AppRoute } from '../types';
import { getUserData } from '../userStore/userData';
import { useNavigate, Link } from 'react-router';
import AgentModal from '../Components/AgentModal/AgentModal';
import { useLanguage } from '../context/LanguageContext';

const MyAgents = () => {
    const { t } = useLanguage();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [editedInstructions, setEditedInstructions] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Modal State
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const user = getUserData("user")
    const navigate = useNavigate()


    useEffect(() => {

        loadAgents();
    }, []);

    const loadAgents = async () => {
        setLoading(true);
        const userId = user?.id || user?._id;
        try {
            const res = await axios.post(apis.getUserAgents, { userId });
            console.log('[MY AGENTS] Loaded:', res.data.agents);
            setAgents(res.data.agents || []);
        } catch (err) {
            console.error('[MY AGENTS] Load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAgent = async () => {
        const newAgent = {
            name: t('myAgentsPage.defaultName'),
            description: t('myAgentsPage.defaultDescription'),
            type: 'general',
            instructions: t('myAgentsPage.defaultInstructions')
        };
        await apiService.createAgent(newAgent);
        loadAgents();
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm(t('myAgentsPage.deleteConfirm'))) {
            await apiService.deleteAgent(id);
            loadAgents();
        }
    };

    const toggleExpand = (agent) => {
        if (expandedId === agent._id) {
            setExpandedId(null);
        } else {
            setExpandedId(agent._id);
            setEditedInstructions(agent.instructions || '');
        }
    };

    const handleSaveInstructions = async (id) => {
        setIsSaving(true);
        await apiService.updateAgent(id, { instructions: editedInstructions });

        setAgents((prev) =>
            prev.map((a) => (a._id === id ? { ...a, instructions: editedInstructions } : a))
        );

        setIsSaving(false);
        setExpandedId(null);
    };

    const getIcon = (type) => {
        if (type === 'coder') return <Code className="w-6 h-6 text-blue-500" />;
        if (type === 'writer') return <Edit3 className="w-6 h-6 text-pink-500" />;
        return <Bot className="w-6 h-6 text-primary" />;
    };

    return (
        <div className="p-4 md:p-8 h-full bg-secondary overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-maintext mb-2">{t('myAgentsPage.title')}</h1>
                    <p className="text-sm md:text-base text-subtext">{t('myAgentsPage.subtitle')}</p>
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="text-subtext text-center">{t('myAgentsPage.loading')}</div>
            ) : (
                <div className="">
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {agents.filter(agent => agent !== null).map((agent) =>
                            <div
                                key={agent._id}
                                className=" group bg-card border border-border hover:border-primary/50 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 flex flex-col w-full shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="relative">
                                        <img
                                            src={agent.avatar || "/AGENTS_IMG/default.png"}
                                            alt={agent.agentName}
                                            className="w-20 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                                        />
                                        {agent.status && (
                                            <span className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${agent.status.toLowerCase() === 'live' || agent.status.toLowerCase() === 'active'
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                {t(`statusLabels.${agent.status?.toLowerCase().replace(/\s+/g, '')}`) || agent.status}
                                            </span>
                                        )}
                                    </div>

                                    <div className="bg-surface border border-border px-2 py-1 rounded-lg flex items-center gap-1">
                                        <span className="text-xs font-bold text-maintext">4.9</span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-maintext mb-1">{agent.agentName}</h3>

                                <span className="text-xs text-primary uppercase tracking-wider font-semibold mb-3">
                                    {(() => {
                                        const catKeyMap = {
                                            "Business OS": 'business_os',
                                            "Data & Intelligence": 'data_intelligence',
                                            "Sales & Marketing": 'sales_marketing',
                                            "HR & Finance": 'hr_finance',
                                            "Design & Creative": 'design_creative',
                                            "Medical & Health AI": 'medical_health'
                                        };
                                        return t(`marketplacePage.categories.${catKeyMap[agent.category] || 'all'}`) || agent.category;
                                    })()}
                                </span>

                                <p className="text-sm text-subtext mb-6 flex-1">{agent.description}</p>

                                {/* Use Button */}
                                <div className="flex gap-2 mt-auto">
                                    <button
                                        onClick={() => {
                                            const name = (agent.agentName || "").toUpperCase().replace(/\s+/g, '');
                                            // Agents that use the new AISAWorkSpace interface
                                            const workspaceAgents = ['AISALES', 'AIWRITE', 'AIBIZ', 'AIHIRE', 'AIDESK', 'AIHEALTH'];

                                            // Agents that use the generic Chat interface
                                            const chatAgents = [
                                                'AISA',
                                                'GENERATEIMAGE',
                                                'GENERATEVIDEO',
                                                'DEEPSEARCH',
                                                'CONVERTTOAUDIO',
                                                'UNIVERSALCONVERTER',
                                                'CODEWRITER',
                                                'IMAGEEDITING',
                                                'FASTVIDEOGENERATOR',
                                                'MUSICGENERATION',
                                                'LYRIAFORMUSIC'
                                            ];

                                            // Internal route agents
                                            const internalRouteAgents = {
                                                'AIPERSONALASSISTANT': '/dashboard/ai-personal-assistant',
                                            };

                                            if (workspaceAgents.includes(name)) {
                                                navigate(`${AppRoute.WORKSPACE}/${name}`);
                                            } else if (chatAgents.includes(name)) {
                                                navigate(AppRoute.CHAT, { state: { agentType: name, agent: agent } });
                                            } else if (internalRouteAgents[name]) {
                                                navigate(internalRouteAgents[name]);
                                            } else {
                                                const targetUrl = (!agent?.url || agent.url.trim() === "") ? AppRoute.agentSoon : agent.url;
                                                setSelectedAgent({ ...agent, url: targetUrl });
                                                setIsModalOpen(true);
                                            }
                                        }}
                                        className="flex-1 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:shadow-md"
                                    >
                                        {t('myAgentsPage.useAgent')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate(AppRoute.INVOICES);
                                        }}
                                        className="p-2.5 rounded-xl bg-surface border border-border text-subtext hover:text-primary transition-all"
                                        title={t('marketplacePage.viewInvoice')}
                                    >
                                        <FileText className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}


                    </div>
                </div>
            )}

            <AgentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                agent={selectedAgent}
            />
        </div>
    );
};

export default MyAgents;    