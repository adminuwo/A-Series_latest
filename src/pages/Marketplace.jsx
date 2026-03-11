import React, { useState, useEffect } from 'react';
import { Search, Download, Check, Star, FileText, Play, X, Calendar, Users, Image as ImageIcon, Headphones, Code, Video, Edit, Zap, Music, EyeOff, Eye, Bot, MessageSquare, Cpu, Activity, Heart, TrendingUp, ShieldCheck, ShoppingBag, Globe, DollarSign, Target, Database, Brain, Briefcase, Megaphone, Headset, GraduationCap, Bug, MapPin, Mic, Sparkles } from 'lucide-react';
import axios from 'axios';
import { apis, AppRoute } from '../types';
import { getUserData, toggleState } from '../userStore/userData';
import SubscriptionForm from '../Components/SubscriptionForm/SubscriptionForm';
import { useRecoilState } from 'recoil';
import { useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import NotificationBar from '../Components/NotificationBar/NotificationBar';
import { useLanguage } from '../context/LanguageContext';


const Marketplace = () => {
  const { t } = useLanguage();
  const [agents, setAgents] = useState([]);
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const [filter, setFilter] = useState(initialCategory || 'all');
  const [userAgent, setUserAgent] = useState([])
  const [loading, setLoading] = useState(false)
  const [subToggle, setSubToggle] = useRecoilState(toggleState)
  const user = getUserData("user")
  const [agentId, setAgentId] = useState("")
  const [searchQuery, setSearchQuery] = useState("");
  const [showDemo, setShowDemo] = useState(false)
  const [demoUrl, setDemoUrl] = useState("")
  const [selectedTool, setSelectedTool] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setFilter(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      // Only visualize loading on initial fetch to prevent flashing
      if (agents.length === 0) {
        setLoading(true);
      }
      const userId = user?.id || user?._id;

      try {
        const [userAgentsRes, agentsRes] = await Promise.allSettled([
          axios.post(apis.getUserAgents, { userId }),
          axios.get(apis.agents)
        ]);

        if (userAgentsRes.status === 'fulfilled') {
          setUserAgent(userAgentsRes.value.data?.agents || []);
        } else {
          console.error("Failed to fetch user agents:", userAgentsRes.reason);
        }

        if (agentsRes.status === 'fulfilled') {
          const rawAgents = Array.isArray(agentsRes.value.data) ? agentsRes.value.data : [];
          console.log('[MARKETPLACE] Agents from API:', rawAgents.length, rawAgents.map(a => a.agentName));
          setAgents(rawAgents);
        } else {
          console.error("Failed to fetch agents:", agentsRes.reason);
          setAgents([]);
        }
      } catch (error) {
        console.error("Error fetching marketplace data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [agentId, user?.id, user?._id, subToggle]);


  const toggleBuy = (id) => {
    if (!user) {
      navigate(AppRoute.LOGIN)
      return
    }
    setSubToggle({ ...subToggle, subscripPgTgl: true })
    setAgentId(id)
  };

  const filteredAgents = agents.filter(agent => {
    const matchesCategory = filter === 'all' || agent.category === filter;
    const matchesSearch = (agent.agentName || agent.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', "Business OS",
    "Data & Intelligence",
    "Sales & Marketing",
    "HR & Finance",
    "Design & Creative",
    "Medical & Health AI",];

  const getToolIcon = (slug) => {
    switch (slug) {
      case 'tool-image-gen': return ImageIcon;
      case 'tool-image-editing-customization': return Edit;
      case 'tool-deep-search': return Search;
      case 'tool-audio-convert': return Headphones;
      case 'tool-universal-converter': return FileText;
      case 'tool-code-writer': return Code;
      case 'tool-video-gen': return Video;
      case 'tool-fast-video-generator': return Zap;
      case 'tool-lyria-for-music': return Music;
      case 'tool-ai-document': return FileText;
      case 'tool-ai-blur': return EyeOff;
      case 'tool-ai-detector': return Eye;
      case 'tool-claude-sonnet-4-5': return Bot;
      case 'tool-blip2': return MessageSquare;
      case 'tool-nvidia-nemotron-nano-12b': return Cpu;
      case 'tool-path-foundation': return Activity;
      case 'tool-derm-foundation': return Heart;
      case 'tool-time-series-forecasting': return TrendingUp;
      case 'tool-llm-auditor': return ShieldCheck;
      case 'tool-personalized-shopping': return ShoppingBag;
      case 'tool-brand-search-optimization': return Globe;
      case 'tool-fomc-research': return DollarSign;
      case 'tool-image-scoring': return Target;
      case 'tool-data-science': return Database;
      case 'tool-rag-engine': return Brain;
      case 'tool-financial-advisor': return Briefcase;
      case 'tool-marketing-agency': return Megaphone;
      case 'tool-customer-service': return Headset;
      case 'tool-academic-research': return GraduationCap;
      case 'tool-bug-assistant': return Bug;
      case 'tool-travel-concierge': return MapPin;
      case 'tool-ai-personal-assistant': return Calendar;
      case 'tool-openai-content': return Edit;
      case 'tool-openai-chat': return MessageSquare;
      case 'tool-openai-image': return ImageIcon;
      case 'tool-openai-tts': return Headphones;
      case 'tool-openai-stt': return Mic;
      case 'tool-openai-code': return Code;
      case 'tool-openai-document': return FileText;
      case 'tool-openai-vision': return Eye;
      default: return ImageIcon;
    }
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-background">

      <AnimatePresence>
        {subToggle.subscripPgTgl && <SubscriptionForm id={agentId} />}
        {showDemo && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-3xl p-6 w-full max-w-4xl shadow-2xl relative"
            >
              <button
                onClick={() => setShowDemo(false)}
                className="absolute -top-4 -right-4 bg-card p-2 rounded-full shadow-lg hover:bg-surface transition-colors"
                title={t('chatPage.cancel')}
              >
                <X className="w-5 h-5" />
              </button>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={demoUrl}
                  title="Agent Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-maintext">{t('marketplacePage.productDemo')}</h3>
                <button
                  onClick={() => setShowDemo(false)}
                  className="bg-primary text-white px-6 py-2 rounded-xl font-semibold"
                >
                  {t('marketplacePage.gotIt')}
                </button>
              </div>
            </motion.div>
          </div>
        )
        }
      </AnimatePresence >

      {/* Tool Detail Modal */}
      <AnimatePresence>
        {selectedTool && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface border border-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative"
            >
              <button
                onClick={() => setSelectedTool(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-secondary text-subtext hover:text-maintext hover:bg-border transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative">
                {/* Header Section */}
                <div className={`h-32 ${selectedTool.bgGradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute -bottom-10 left-8">
                    <div className={`w-24 h-24 rounded-2xl ${selectedTool.bgGradient} border-4 border-surface shadow-xl flex items-center justify-center`}>
                      {selectedTool.icon ? <selectedTool.icon className="w-12 h-12 text-white" /> : <ImageIcon className="w-12 h-12 text-white" />}
                    </div>
                  </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-maintext mb-1">{selectedTool.agentName}</h2>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                          AI Tool
                        </span>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-sm font-bold">5.0</span>
                        </div>
                      </div>
                    </div>
                    {selectedTool.provider === 'openai' && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">OpenAI</span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        const name = (selectedTool.agentName || "").toUpperCase().replace(/\s+/g, '');
                        setSelectedTool(null);
                        if (name === 'AIPERSONALASSISTANT') {
                          navigate('/dashboard/ai-personal-assistant');
                        } else {
                          navigate('/dashboard/chat', { state: { agentType: name, agent: selectedTool } });
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-secondary text-maintext hover:bg-border font-medium text-sm transition-colors"
                    >
                      Open App
                    </button>
                  </div>

                  <p className="text-subtext leading-relaxed mb-6">
                    {selectedTool.fullDesc || selectedTool.description}
                  </p>

                  <div className="bg-secondary/30 rounded-2xl p-5 mb-8 border border-border/50">
                    <h3 className="text-sm font-bold text-maintext uppercase tracking-wider mb-4">Key Capabilities</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedTool.features?.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span className="text-sm text-subtext/90 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                    <div className="flex-1">
                      <p className="text-xs text-subtext mb-1 uppercase font-bold tracking-wider">Subscription</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-maintext">Free</span>
                        <span className="text-sm text-subtext">/ basic use</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTool(null);
                        toggleBuy(selectedTool._id);
                      }}
                      className="flex-1 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl py-3 px-6 font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Star className="w-5 h-5" />
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      < div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4" >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-maintext mb-2">
            {t('marketplacePage.title')}
          </h1>
          <p className="text-sm md:text-base text-subtext">
            {t('marketplacePage.subtitle')}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-subtext" />
          <input
            type="text"
            placeholder={t('marketplacePage.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl py-2.5 pl-10 pr-4 text-maintext focus:outline-none focus:border-primary transition-colors shadow-sm"
          />
        </div>
      </div >

      {/* Categories */}
      < div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none" >
        {
          categories.map(cat => {
            const catKeyMap = {
              'all': 'all',
              "Business OS": 'business_os',
              "Data & Intelligence": 'data_intelligence',
              "Sales & Marketing": 'sales_marketing',
              "HR & Finance": 'hr_finance',
              "Design & Creative": 'design_creative',
              "Medical & Health AI": 'medical_health'
            };
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all border ${filter === cat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-card text-subtext border-border hover:bg-surface'
                  }`}
              >
                {t(`marketplacePage.categories.${catKeyMap[cat] || 'all'}`)}
              </button>
            )
          })
        }
      </div >

      {/* Agents Grid */}
      < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" >
        {/* Personal Assistant App Card */}
        {(filter === 'all' || filter === 'Business OS') && (
          <div className="group bg-card border border-border hover:border-primary/50 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 flex flex-col h-full shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <div className="bg-surface border border-border px-2 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-maintext">5.0</span>
              </div>
            </div>

            <div className="mb-1 relative z-10">
              <h3 className="text-lg font-bold text-maintext">{t('marketplacePage.aiPersonalAssistant')}</h3>
            </div>

            <span className="text-xs text-primary uppercase tracking-wider font-semibold mb-3 relative z-10">{t('marketplacePage.productivity')}</span>

            <p className="text-sm text-subtext mb-6 flex-1 relative z-10">
              {t('marketplacePage.personalAssistantDesc')}
            </p>

            <button
              onClick={() => navigate('/dashboard/ai-personal-assistant')}
              className="w-full py-2.5 rounded-xl font-semibold bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 relative z-10"
            >
              {t('marketplacePage.openApp')}
            </button>
          </div>
        )}

        {/* AI Hire Card */}
        {(filter === 'all' || filter === 'Business OS') && (
          <div className="group bg-card border border-border hover:border-primary/50 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 flex flex-col h-full shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <div className="bg-surface border border-border px-2 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-maintext">4.9</span>
              </div>
            </div>
            <div className="mb-1 relative z-10">
              <h3 className="text-lg font-bold text-maintext">AI Hire <sup className='text-sm'>TM</sup></h3>
            </div>
            <span className="text-xs text-primary uppercase tracking-wider font-semibold mb-3 relative z-10">Business OS</span>
            <p className="text-sm text-subtext mb-6 flex-1 relative z-10">
              Streamline your recruitment process with AI-powered candidate sourcing and screening.
            </p>
            <button
              onClick={() => navigate('/agents/aihire')}
              className="w-full py-2.5 rounded-xl font-semibold bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 relative z-10"
            >
              {t('marketplacePage.openApp')}
            </button>
          </div>
        )}

        {/* AI Biz Card */}
        {(filter === 'all' || filter === 'Business OS') && (
          <div className="group bg-card border border-border hover:border-primary/50 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 flex flex-col h-full shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Database className="w-10 h-10 text-white" />
              </div>
              <div className="bg-surface border border-border px-2 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-maintext">4.8</span>
              </div>
            </div>
            <div className="mb-1 relative z-10">
              <h3 className="text-lg font-bold text-maintext">AI Biz <sup className='text-sm'>TM</sup></h3>
            </div>
            <span className="text-xs text-primary uppercase tracking-wider font-semibold mb-3 relative z-10">Business OS</span>
            <p className="text-sm text-subtext mb-6 flex-1 relative z-10">
              Automate business workflows and generate professional documents with ease.
            </p>
            <button
              onClick={() => navigate('/agents/aibiz')}
              className="w-full py-2.5 rounded-xl font-semibold bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 relative z-10"
            >
              {t('marketplacePage.openApp')}
            </button>
          </div>
        )}

        {/* AI Base Card */}
        {(filter === 'all' || filter === 'Business OS') && (
          <div className="group bg-card border border-border hover:border-primary/50 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 flex flex-col h-full shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <Cpu className="w-10 h-10 text-white" />
              </div>
              <div className="bg-surface border border-border px-2 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-maintext">4.9</span>
              </div>
            </div>
            <div className="mb-1 relative z-10">
              <h3 className="text-lg font-bold text-maintext">AI Base <sup className='text-sm'>TM</sup></h3>
            </div>
            <span className="text-xs text-primary uppercase tracking-wider font-semibold mb-3 relative z-10">Business OS</span>
            <p className="text-sm text-subtext mb-6 flex-1 relative z-10">
              The foundation for your enterprise AI solutions, providing robust data management.
            </p>
            <button
              onClick={() => navigate('/agents/aibase')}
              className="w-full py-2.5 rounded-xl font-semibold bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 relative z-10"
            >
              {t('marketplacePage.openApp')}
            </button>
          </div>
        )}

        {/* AI Sales Card */}
        {(filter === 'all' || filter === 'Business OS') && (
          <div className="group bg-card border border-border hover:border-primary/50 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 flex flex-col h-full shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-fuchsia-500 to-rose-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div className="bg-surface border border-border px-2 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-maintext">5.0</span>
              </div>
            </div>
            <div className="mb-1 relative z-10">
              <h3 className="text-lg font-bold text-maintext">AI Sales <sup className='text-sm'>TM</sup></h3>
            </div>
            <span className="text-xs text-primary uppercase tracking-wider font-semibold mb-3 relative z-10">Business OS</span>
            <p className="text-sm text-subtext mb-6 flex-1 relative z-10">
              Boost your revenue with AI-driven sales intelligence and outreach strategies.
            </p>
            <button
              onClick={() => navigate('/agents/aisales')}
              className="w-full py-2.5 rounded-xl font-semibold bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 relative z-10"
            >
              {t('marketplacePage.openApp')}
            </button>
          </div>
        )}

        {loading ? <h1>{t('myAgentsPage.loading')}</h1> : filteredAgents.map(agent => {
          const isSystemTool = agent.slug?.startsWith('tool-');
          const ToolIcon = isSystemTool ? getToolIcon(agent.slug) : null;

          if (isSystemTool) {
            return (
              <div
                key={agent._id}
                onClick={() => setSelectedTool({ ...agent, icon: ToolIcon })}
                className="group bg-card border border-border hover:border-primary/50 p-5 hover:shadow-xl transition-all duration-300 flex flex-col h-full shadow-sm relative overflow-hidden rounded-2xl cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`w-20 h-20 rounded-xl ${agent.bgGradient || 'bg-gradient-to-br from-gray-500 to-gray-600'} flex items-center justify-center shadow-lg overflow-hidden`}>
                    {agent.avatar ? (
                      <img src={agent.avatar} alt={agent.agentName} className="w-full h-full object-cover" />
                    ) : ToolIcon ? (
                      <ToolIcon className="w-10 h-10 text-white" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <div className="bg-surface border border-border px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-maintext">5.0</span>
                  </div>
                </div>

                <div className="mb-1 relative z-10">
                  <h3 className="text-lg font-bold text-maintext">{agent.agentName}</h3>
                </div>

                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-xs text-primary uppercase tracking-wider font-semibold">AI Tool</span>
                  {agent.provider === 'openai' && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                      <span className="text-[9px] font-bold text-emerald-500 uppercase">OpenAI</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-subtext mb-6 flex-1 relative z-10 line-clamp-3">
                  {agent.description}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (userAgent.some((ag) => ag && agent._id == ag._id)) return;
                    setSelectedTool({ ...agent, icon: ToolIcon });
                  }}
                  className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 relative z-10 transition-all ${userAgent.some((ag) => ag && agent._id == ag._id)
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                    : 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20'
                    }`}
                >
                  {userAgent.some((ag) => ag && agent._id == ag._id) ? (
                    <>
                      <Check className="w-4 h-4" /> Active
                    </>
                  ) : (
                    t('marketplacePage.subscribe') || 'Subscribe'
                  )}
                </button>
              </div>
            );
          }

          return (
            <div
              key={agent._id}
              className="group bg-card border border-border hover:border-primary/50 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 flex flex-col h-full shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="relative">
                  <img
                    src={agent.avatar}
                    alt={agent.agentName}
                    className="w-20 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="bg-surface border border-border px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-maintext">4.9</span>
                </div>
              </div>

              <div className="mb-1">
                <h3 className="text-lg font-bold text-maintext text-2xl font-bold">{agent.agentName} <sup className='text-sm'>TM</sup></h3>
              </div>

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

              {/* Install Button */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleBuy(agent._id)}
                  disabled={userAgent.some((ag) => ag && agent._id == ag._id) || (agent.status && agent.status.toLowerCase() !== 'live' && agent.status.toLowerCase() !== 'active' && agent.status.toLowerCase() !== 'coming soon')}
                  className={`flex-1 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${userAgent.some((ag) => ag && agent._id == ag._id)
                    ? 'bg-primary/10 text-subtext border border-primary/20 cursor-not-allowed opacity-70'
                    : (agent.status && agent.status.toLowerCase() !== 'live' && agent.status.toLowerCase() !== 'active' && agent.status.toLowerCase() !== 'coming soon')
                      ? 'bg-border text-subtext cursor-not-allowed opacity-50'
                      : 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20'
                    }`}
                >
                  {userAgent.some((ag) => ag && agent._id == ag._id) ? (
                    <>
                      <Check className="w-4 h-4" /> Active
                    </>
                  ) : (agent.status && agent.status.toLowerCase() !== 'live' && agent.status.toLowerCase() !== 'active' && agent.status.toLowerCase() !== 'coming soon') ? (
                    <>
                      {t('marketplacePage.unavailable')}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> {t('marketplacePage.subscribe')}
                    </>
                  )}
                </button>
                {userAgent.some((ag) => ag && agent._id == ag._id) && (
                  <button
                    onClick={() => {
                      navigate(AppRoute.INVOICES);
                    }}
                    className="p-2.5 rounded-xl bg-surface border border-border text-subtext hover:text-primary transition-all"
                    title={t('marketplacePage.viewInvoice')}
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div >
          )
        })}
      </div >
    </div>
  );
};

export default Marketplace;
