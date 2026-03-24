import React, { useState, useEffect } from 'react';
import { Search, Download, Check, Star, FileText, Play, X, Calendar, Users, Image as ImageIcon, Headphones, Code, Video, Edit, Zap, Music, EyeOff, Eye, Bot, MessageSquare, Cpu, Activity, Heart, TrendingUp, ShieldCheck, ShoppingBag, Globe, DollarSign, Target, Database, Brain, Briefcase, Megaphone, Headset, GraduationCap, Bug, MapPin, Mic, Sparkles, BookOpen, PenTool, BarChart3, Stethoscope } from 'lucide-react';
import axios from 'axios';
import { apis, AppRoute } from '../types';
import { getUserData, toggleState } from '../userStore/userData';
import SubscriptionForm from '../Components/SubscriptionForm/SubscriptionForm';
import { useRecoilState } from 'recoil';
import { useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import NotificationBar from '../Components/NotificationBar/NotificationBar';
import { useLanguage } from '../context/LanguageContext';


const HARDCODED_AGENTS = [
  {
    agentName: "AI Hire",
    slug: "tool-aihire",
    description: "Streamline your recruitment process with AI-powered candidate sourcing and screening.",
    category: "HR & Finance",
    icon: Briefcase,
    avatar: "/AGENTS_IMG/AIHIRE.png",
    bgGradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
    rating: "4.9",
    path: "/dashboard/workspace/AIHIRE"
  },
  {
    agentName: "AI Biz",
    slug: "tool-aibiz",
    description: "Automate business workflows and generate professional documents with ease.",
    category: "Business OS",
    icon: Database,
    avatar: "/AGENTS_IMG/AIBIZ.png",
    bgGradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    rating: "4.8",
    path: "/agents/aibiz"
  },
  {
    agentName: "AI Base",
    slug: "tool-aibase",
    description: "The foundation for your enterprise AI solutions, providing robust data management.",
    category: "Business OS",
    icon: Cpu,
    avatar: "/AGENTS_IMG/AIBASE.png",
    bgGradient: "bg-gradient-to-br from-orange-500 to-red-600",
    rating: "4.9",
    path: "/agents/aibase"
  },
  {
    agentName: "AI Sales",
    slug: "tool-aisales",
    description: "Boost your revenue with AI-driven sales intelligence and outreach strategies.",
    category: "Sales & Marketing",
    icon: TrendingUp,
    avatar: "/AGENTS_IMG/AISALES.png",
    bgGradient: "bg-gradient-to-br from-fuchsia-500 to-rose-600",
    rating: "5.0",
    path: "/dashboard/workspace/AISALES"
  },
  {
    agentName: "AI Health",
    slug: "tool-aihealth",
    description: "Personal Wellness and Diagnostic Suite. Analyze symptoms, track metrics, and run health automation routines.",
    category: "Medical & Health AI",
    icon: Heart,
    avatar: "/AGENTS_IMG/AIHEALTH.png",
    bgGradient: "bg-gradient-to-br from-pink-500 to-rose-500",
    rating: "4.9",
    path: "/dashboard/workspace/AIHEALTH"
  },
  {
    agentName: "AI Write",
    slug: "tool-aiwrite",
    description: "AI-Powered Content Generation and Curation Workspace. Create marketing copy and optimize text efficiently.",
    category: "Sales & Marketing",
    icon: PenTool,
    avatar: "/AGENTS_IMG/AIWRITE.png",
    bgGradient: "bg-gradient-to-br from-violet-500 to-purple-600",
    rating: "4.8",
    path: "/dashboard/workspace/AIWRITE"
  }
];

const catKeyMap = {
  'all': 'all',
  "Business OS": 'business_os',
  "Data & Intelligence": 'data_intelligence',
  "Sales & Marketing": 'sales_marketing',
  "HR & Finance": 'hr_finance',
  "Design & Creative": 'design_creative',
  "Medical & Health AI": 'medical_health',
  "Search & Research": 'search_research',
  "Productivity & Office": 'productivity_office',
  "Developer Tools": 'developer_tools',
  "Audio & Voice": 'audio_voice'
};

const categories = ['all', ...Object.keys(catKeyMap).filter(k => k !== 'all')];

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
  const [showComingSoon, setShowComingSoon] = useState(null);
  const navigate = useNavigate()

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      // Find the key in catKeyMap that matches the slug in the URL
      const matchingKey = categories.find(cat => catKeyMap[cat] === categoryParam);
      if (matchingKey) {
        setFilter(matchingKey);
      } else {
        setFilter('all');
      }
    } else {
      setFilter('all');
    }
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [searchParams, categories]);

  useEffect(() => {
    const fetchData = async () => {
      // Only visualize loading on initial fetch to prevent flashing
      if (agents.length === 0) {
        setLoading(true);
      }
      const userId = user?.id || user?._id;

      try {
        const [userAgentsRes, agentsRes] = await Promise.allSettled([
          axios.post(apis.getUserAgents, { userId }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
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

  const allAvailableAgents = [
    ...HARDCODED_AGENTS.map(a => ({ ...a, isHardcoded: true, _id: a.slug })),
    ...agents.filter(a => ![
      'tool-dito', 'DiTo',
      'tool-aihealth', 'AIHEALTH',
      'tool-aiwrite', 'AIWRITE',
      'tool-vertex-stt', 'tool-audio-convert', 'tool-universal-converter', 'tool-image-edit', 
      'tool-image-understanding-claude', 'tool-pixel-segmentor-sam', 'tool-openai-vision',
      'tool-openai-search-preview', 'tool-openai-search-pro', 'tool-openai-search-lite', 'tool-openai-search-realtime',
      'tool-openai-content', 'tool-openai-chat', 'tool-openai-tts', 'tool-openai-stt', 'tool-openai-code',
      'tool-openai-document', 'tool-openai-translator', 'tool-openai-extractor', 'tool-openai-embeddings',
      'tool-ai-personal-assistant', 'tool-image-gen', 'tool-deep-search', 'tool-video-gen', 'tool-vertex-music-gen'
    ].includes(a.slug) && ![
      'DiTo', 'AIHEALTH', 'AIWRITE',
      'AI Web Search Preview', 'AI Web Search Pro', 'AI Web Search Lite', 'AI Real-time Search Assistant',
      'Smart Content Writer', 'AI Chat Assistant', 'Voice Narration Studio', 'Audio Transcriber',
      'AI Code Assistant', 'Document Intelligence', 'Professional Translator', 'Structured Data Extractor',
      'Semantic AI Embeddinger', 'AI Personal Assistant', 'AI Image Generator', 'Deep Search',
      'AI Video Generator', 'Music Generation',
      'Image Editing', 'AI Voice Generator', 'AI Document Converter', 'Image Understanding', 'AI Pixel Segmentor',
      'Vision Analyzer'
    ].includes(a.agentName)).map(a => ({ ...a, isHardcoded: false }))
  ];

  const filteredAgents = allAvailableAgents.filter(agent => {
    // Robust category matching
    const agentCat = (agent.category || "").trim().toLowerCase();
    const filterCat = (filter || "all").trim().toLowerCase();

    const matchesCategory = filterCat === 'all' || agentCat === filterCat;

    // Improved search with safety checks
    const name = (agent.agentName || agent.name || "").toLowerCase();
    const desc = (agent.description || "").toLowerCase();
    const q = (searchQuery || "").toLowerCase().trim();

    const matchesSearch = !q || name.includes(q) || desc.includes(q);

    return matchesCategory && matchesSearch;
  });


  const groupedAgents = categories.reduce((acc, cat) => {
    if (cat === 'all') return acc;
    const agentsInCat = filteredAgents.filter(a => a.category === cat);
    if (agentsInCat.length > 0) {
      acc[cat] = agentsInCat;
    }
    return acc;
  }, {});

  const getToolIcon = (slug) => {
    if (!slug) return ImageIcon;
    const s = slug.startsWith('tool-') ? slug : `tool-${slug}`;
    switch (s) {
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
      case 'tool-ai-personal-assistant': return Calendar;
      case 'tool-openai-content': return Edit;
      case 'tool-openai-chat': return MessageSquare;
      case 'tool-openai-image': return ImageIcon;
      case 'tool-openai-tts': return Headphones;
      case 'tool-openai-stt': return Mic;
      case 'tool-openai-code': return Code;
      case 'tool-openai-document': return FileText;
      case 'tool-openai-vision': return Eye;
      case 'tool-openai-video': return Video;
      case 'tool-openai-search-preview': return Globe;
      case 'tool-openai-search-pro': return Globe;
      case 'tool-openai-search-lite': return Globe;
      case 'tool-openai-search-realtime': return Globe;
      case 'tool-openai-video-standard': return Video;
      case 'tool-openai-video-max': return Video;
      case 'tool-openai-image-standard': return ImageIcon;
      case 'tool-openai-image-lite': return ImageIcon;
      case 'tool-openai-image-edit': return Edit;
      case 'tool-openai-image-edit-standard': return Edit;
      case 'tool-openai-image-edit-lite': return Edit;
      case 'tool-vertex-music-gen': return Music;
      case 'tool-image-understanding-claude': return Brain;
      case 'tool-pathology-medgemma': return Stethoscope;
      case 'tool-derm-foundation': return Activity;
      case 'tool-geospatial-sensing': return MapPin;
      case 'tool-cxr-foundation': return ShieldCheck;
      case 'tool-pixel-segmentor-sam': return Target;
      case 'tool-vertex-stt': return Mic;

      // Workspace Agents
      case 'tool-aibiz': return BarChart3;
      case 'tool-aihire': return Users;
      case 'tool-aihealth': return Heart;
      case 'tool-aiwrite': return FileText;
      case 'tool-aisales': return Target;
      case 'tool-aidesk': return MessageSquare;
      default: return ImageIcon;
    }
  };

  const renderAgentCard = (agent) => {
    // A tool is either hardcoded or has a slug that matches our tool list
    const isSystemTool = agent.isHardcoded || (agent.slug && agent.slug.startsWith('tool-'));
    // Actually, for marketplace seeded agents, we want them to behave like tools (open popup)
    const ToolIcon = getToolIcon(agent.slug);
    const isAgentActive = userAgent.some((ag) => {
      if (!ag) return false;
      const agId = typeof ag === 'string' ? ag : ag._id;
      const agSlug = typeof ag === 'object' ? ag.slug : null;
      
      const targetId = agent._id;
      const targetSlug = agent.slug;

      if (!targetId && !targetSlug) return false;

      return (agId && targetId && String(agId) === String(targetId)) || 
             (agSlug && targetSlug && agSlug === targetSlug) ||
             (ag === targetId);
    });

    const handleCardClick = () => {
      if (agent.isHardcoded) {
        navigate(agent.path);
      } else if (isSystemTool) {
        setSelectedTool({ ...agent, icon: ToolIcon });
      }
    };

    const handleActionButtonClick = (e) => {
      e.stopPropagation(); // Prevent card click from firing
      if (agent.isHardcoded) {
        navigate(agent.path);
      } else if (isSystemTool) {
        if (!isAgentActive) {
          setSelectedTool({ ...agent, icon: ToolIcon });
        } else {
          // If already active, show "Coming Soon" for the standalone workspace
          setShowComingSoon(agent);
        }
      } else {
        toggleBuy(agent._id);
      }
    };

    const getActionButtonContent = () => {
      if (agent.isHardcoded) {
        return (
          <>
            {t('marketplacePage.openApp') || 'Open App'}
          </>
        );
      } else if (isSystemTool) {
        return isAgentActive ? (
          <>
            <Check className="w-4 h-4" /> Active
          </>
        ) : (
          <>
            <Download className="w-4 h-4" /> {t('marketplacePage.subscribe') || 'Subscribe'}
          </>
        );
      } else {
        return isAgentActive ? (
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
        );
      }
    };

    const getActionButtonClasses = () => {
      if (agent.isHardcoded) {
        return "bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20";
      } else if (isSystemTool) {
        return isAgentActive
          ? 'bg-emerald-500 text-white hover:opacity-90 shadow-lg shadow-emerald-500/20'
          : 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20';
      } else {
        return isAgentActive
          ? 'bg-primary/10 text-subtext border border-primary/20 cursor-not-allowed opacity-70'
          : (agent.status && agent.status.toLowerCase() !== 'live' && agent.status.toLowerCase() !== 'active' && agent.status.toLowerCase() !== 'coming soon')
            ? 'bg-border text-subtext cursor-not-allowed opacity-50'
            : 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20';
      }
    };

    const isButtonDisabled = !agent.isHardcoded && !isSystemTool && (isAgentActive || (agent.status && agent.status.toLowerCase() !== 'live' && agent.status.toLowerCase() !== 'active' && agent.status.toLowerCase() !== 'coming soon'));

    return (
      <div
        key={agent._id}
        onClick={handleCardClick}
        className={`group bg-card border border-border hover:border-primary/50 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 flex flex-col h-full shadow-sm relative overflow-hidden ${agent.isHardcoded || isSystemTool ? 'cursor-pointer' : ''}`}
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
            <span className="text-xs font-bold text-maintext">{agent.rating || '5.0'}</span>
          </div>
        </div>

        <div className="mb-1 relative z-10">
          <h3 className="text-lg font-bold text-maintext">{agent.agentName} {agent.isHardcoded || !isSystemTool ? <sup className='text-sm'>TM</sup> : ''}</h3>
        </div>

        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-xs text-primary uppercase tracking-wider font-semibold">
            {(() => {
              const displayCategory = agent.category;
              return t(`marketplacePage.categories.${catKeyMap[displayCategory] || 'all'}`) || displayCategory;
            })()}
          </span>
          {isSystemTool && agent.provider === 'openai' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
              <span className="text-[9px] font-bold text-emerald-500 uppercase">OpenAI</span>
            </div>
          )}
        </div>

        <p className="text-sm text-subtext mb-6 flex-1 relative z-10 line-clamp-3">
          {agent.description}
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleActionButtonClick}
            disabled={isButtonDisabled}
            className={`flex-1 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 relative z-10 transition-all ${getActionButtonClasses()}`}
          >
            {getActionButtonContent()}
          </button>
          {!agent.isHardcoded && !isSystemTool && isAgentActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(AppRoute.INVOICES);
              }}
              className="p-2.5 rounded-xl bg-surface border border-border text-subtext hover:text-primary transition-all"
              title={t('marketplacePage.viewInvoice')}
            >
              <FileText className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-background">

      <AnimatePresence>
        {subToggle.subscripPgTgl && <SubscriptionForm id={agentId} />}
        
        {/* Coming Soon Modal */}
        {showComingSoon && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-3xl p-8 max-w-lg w-full shadow-2xl relative text-center overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />

              <div className="flex flex-col items-center gap-6">
                <div className={`w-24 h-24 rounded-2xl ${showComingSoon.bgGradient || 'bg-gradient-to-br from-primary to-indigo-600'} flex items-center justify-center shadow-xl animate-pulse`}>
                  {React.createElement(getToolIcon(showComingSoon.slug), { className: "w-12 h-12 text-white", strokeWidth: 2 })}
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-maintext tracking-tight uppercase">Coming Soon</h2>
                  <p className="text-subtext max-w-xs mx-auto">
                    The standalone **{showComingSoon.agentName} Workspace** is currently in development.
                  </p>
                </div>

                <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl w-full">
                  <p className="text-sm font-medium text-primary">
                    🚀 **Good News!**
                    <br />
                    This tool is already active in your **AI Choice Magic Tools** menu within the chat.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => navigate('/dashboard/chat')}
                    className="flex-1 py-3 px-6 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20"
                  >
                    Go to Chat
                  </button>
                  <button
                    onClick={() => setShowComingSoon(null)}
                    className="flex-1 py-3 px-6 bg-secondary text-subtext rounded-xl font-bold hover:bg-border transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowComingSoon(null)}
                className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-all text-subtext"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}

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
        )}
      </AnimatePresence>

      {/* Tool Detail Modal */}
      <AnimatePresence>
        {selectedTool && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface border border-border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative max-h-[85vh] flex flex-col"
            >
              <button
                onClick={() => setSelectedTool(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-secondary text-subtext hover:text-maintext hover:bg-border transition-all z-50 backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative overflow-y-auto flex-1 scrollbar-none">
                {/* Header Section */}
                <div className="h-40 relative overflow-hidden bg-surface">
                  {selectedTool.avatar ? (
                    <div className="absolute inset-0">
                      <img
                        src={selectedTool.avatar}
                        className="w-full h-full object-cover blur-md opacity-40 scale-110"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className={`absolute inset-0 ${selectedTool.bgGradient || 'bg-gradient-to-br from-primary to-indigo-600'} opacity-80`} />
                  )}
                  <div className="absolute inset-0 bg-black/10" />

                  <div className="absolute -bottom-8 left-8">
                    <div className={`w-24 h-24 rounded-3xl border-4 border-surface shadow-2xl flex items-center justify-center overflow-hidden ${!selectedTool.avatar ? (selectedTool.bgGradient || 'bg-primary') : 'bg-card'}`}>
                      {selectedTool.avatar ? (
                        <img src={selectedTool.avatar} alt={selectedTool.agentName} className="w-full h-full object-cover" />
                      ) : selectedTool.icon ? (
                        <selectedTool.icon className="w-12 h-12 text-white" />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-white" />
                      )}
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
                        const workspaceAgents = ['AIBIZ', 'AIHIRE', 'AIHEALTH', 'AIWRITE', 'AISALES', 'AIDESK'];

                        if (name === 'AIPERSONALASSISTANT') {
                          navigate('/dashboard/ai-personal-assistant');
                        } else if (workspaceAgents.includes(name)) {
                          navigate(`/dashboard/workspace/${name}`);
                        } else {
                          navigate('/dashboard/chat', { state: { agentType: name, agent: selectedTool } });
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-secondary text-maintext hover:bg-border font-medium text-sm transition-colors"
                    >
                      Open App
                    </button>
                  </div>

                  <p className="text-subtext leading-relaxed mb-6 whitespace-pre-wrap text-sm">
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value) {
                newParams.set('q', e.target.value);
              } else {
                newParams.delete('q');
              }
              navigate(`/dashboard/marketplace?${newParams.toString()}`, { replace: true });
            }}
            className="w-full bg-surface border border-border rounded-xl py-2.5 pl-10 pr-4 text-maintext focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none bg-background z-20 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setFilter(cat);
              const newParams = new URLSearchParams(searchParams);
              const slug = catKeyMap[cat] || 'all';
              if (cat === 'all' || slug === 'all') {
                newParams.delete('category');
              } else {
                newParams.set('category', slug);
              }
              navigate(`/dashboard/marketplace?${newParams.toString()}`, { replace: true });
            }}
            className={`px-6 py-2.5 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all border shadow-sm ${filter === cat
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
              : 'bg-card text-subtext border-border hover:bg-surface hover:text-maintext'
              }`}
          >
            {t(`marketplacePage.categories.${catKeyMap[cat] || 'all'}`)}
          </button>
        ))}
      </div>

      {/* Agents Grid/Segmented View */}
      <div className="space-y-12">
        <div className="animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map(agent => renderAgentCard(agent))}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-subtext font-medium text-sm">Discovering best agents...</p>
            </div>
          )}

          {!loading && filteredAgents.length === 0 && (
            <div className="text-center py-20 bg-surface/30 rounded-[2.5rem] border border-dashed border-border flex flex-col items-center gap-4 mt-8">
              <div className="p-4 bg-surface rounded-2xl shadow-sm">
                <ImageIcon className="w-12 h-12 text-subtext/40" />
              </div>
              <div>
                <p className="text-xl font-bold text-maintext">No agents found</p>
                <p className="text-subtext">Try refining your search or exploring other categories.</p>
              </div>
              <button
                onClick={() => {
                  setFilter('all');
                  setSearchQuery('');
                  navigate('/dashboard/marketplace');
                }}
                className="text-primary font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
