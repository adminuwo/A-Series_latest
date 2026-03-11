import React from 'react';
import { motion } from 'framer-motion';
import { History, X, Plus, MessageSquare, Trash2 } from 'lucide-react';

const Sidebar = ({
    isSidebarOpen,
    setIsSidebarOpen,
    sessions,
    currentSessionId,
    handleNewChat,
    handleDeleteSession,
    groupSessionsByDate,
    navigate,
    AGENTS = [],
    activeAgent = null
}) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [agentFilter, setAgentFilter] = React.useState('ALL');

    const filteredSessions = sessions?.filter(session => {
        const matchesSearch = session.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAgent = agentFilter === 'ALL' || session.agentType === agentFilter;
        return matchesSearch && matchesAgent;
    });

    return (
        <motion.aside
            initial={{ width: 0 }}
            animate={{ width: isSidebarOpen ? 260 : 0 }}
            exit={{ width: 0 }}
            className="bg-secondary/40 border-r border-border flex flex-col h-full shrink-0 overflow-hidden"
        >
            <div className="p-4 border-b border-border flex items-center justify-between h-16">
                <h3 className="text-subtext text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> History
                </h3>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/50 rounded-lg text-subtext">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="p-3 space-y-3">
                <button
                    onClick={handleNewChat}
                    className="w-full h-10 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> New Chat
                </button>

                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-subtext/40 group-focus-within:text-primary transition-colors">
                        <History className="w-3 h-3" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 bg-white border border-border/50 rounded-xl pl-9 pr-3 text-[10px] font-bold text-maintext outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                </div>

                {/* Agent Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => setAgentFilter('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${agentFilter === 'ALL' ? 'bg-primary text-white shadow-sm' : 'bg-white/50 text-subtext hover:bg-white border border-border/40'}`}
                    >
                        All
                    </button>
                    {AGENTS.map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => setAgentFilter(agent.id)}
                            className={`p-1.5 rounded-lg transition-all flex items-center justify-center min-w-[32px] ${agentFilter === agent.id ? 'bg-primary text-white shadow-sm' : 'bg-white/50 text-subtext hover:bg-white border border-border/40'}`}
                            title={agent.name}
                        >
                            {agent.icon ? <agent.icon className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
                {(() => {
                    const grouped = groupSessionsByDate(filteredSessions || []);
                    if (filteredSessions?.length === 0) {
                        return (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center px-4">
                                <History className="w-8 h-8 mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest leading-tight">No matching<br />history found</p>
                            </div>
                        );
                    }
                    return Object.entries(grouped).map(([label, items]) => {
                        if (items.length === 0) return null;
                        return (
                            <div key={label} className="space-y-1.5">
                                <h4 className="px-3 text-[9px] font-black text-subtext/60 uppercase tracking-[0.2em]">{label}</h4>
                                <div className="space-y-0.5">
                                    {items.map(session => (
                                        <div
                                            key={session.sessionId}
                                            onClick={() => navigate(`/dashboard/workspace/${session.agentType || 'AISA'}/${session.sessionId}`)}
                                            className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${currentSessionId === session.sessionId
                                                ? 'bg-white shadow-sm border border-border/50'
                                                : 'hover:bg-white/40 border border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${currentSessionId === session.sessionId ? 'text-primary' : 'text-subtext/40'}`} />
                                                <span className={`text-[11px] font-bold truncate w-36 ${currentSessionId === session.sessionId ? 'text-maintext' : 'text-subtext'}`}>
                                                    {session.title || 'New Chat'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteSession(e, session.sessionId)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-subtext/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    });
                })()}
            </div>
        </motion.aside>
    );
};

export default Sidebar;
