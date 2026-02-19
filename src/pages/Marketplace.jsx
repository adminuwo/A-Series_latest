import React, { useEffect, useState } from 'react';
import { Search, Download, Check, Star, FileText, Play, X, Calendar, Users } from 'lucide-react';
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

        {loading ? <h1>{t('myAgentsPage.loading')}</h1> : filteredAgents.map(agent => (
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

            {/* Install / Launch Buttons */}
            <div className="flex gap-2">
              {userAgent.some((ag) => ag && agent._id == ag._id) ? (
                <div className="flex-1 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const name = (agent.agentName || "").toUpperCase().replace(/\s+/g, '');
                      // Workspace agents
                      const workspaceAgents = ['AISALES', 'AIWRITE', 'AIBIZ', 'AIDESK'];
                      if (workspaceAgents.includes(name)) {
                        navigate(`${AppRoute.WORKSPACE}/${name}`);
                      } else if (name === 'AIHIRE') {
                        navigate('/agents/aihire');
                      } else {
                        const targetUrl = agent.url || AppRoute.agentSoon;
                        window.location.href = targetUrl;
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl font-semibold bg-emerald-600 text-white hover:opacity-90 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" /> {t('marketplacePage.launch') || 'Launch'}
                  </button>
                  <button
                    className="px-3 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 opacity-70 cursor-default"
                    title={t('marketplacePage.subscribed')}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (agent.status && agent.status.toLowerCase() !== 'live' && agent.status.toLowerCase() !== 'active' && agent.status.toLowerCase() !== 'coming soon') ? (
                <button
                  disabled
                  className="flex-1 py-2.5 rounded-xl font-semibold bg-border text-subtext cursor-not-allowed opacity-50 flex items-center justify-center gap-2"
                >
                  {t('marketplacePage.unavailable')}
                </button>
              ) : (
                <button
                  onClick={() => toggleBuy(agent._id)}
                  className="flex-1 py-2.5 rounded-xl font-semibold bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" /> {t('marketplacePage.subscribe')}
                </button>
              )}
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
        ))}

      </div >
    </div >
  );
};

export default Marketplace;