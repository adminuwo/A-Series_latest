import { MessageSquare, History, X, Trash2, Search as SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import CustomSelect from '../../Components/AISAWorkSpace/CustomSelect';

const AIDESKInputs = ({
    ticketCategory, setTicketCategory,
    urgency, setUrgency,
    auditLogs, setAuditLogs,
    sessions,
    currentSessionId,
    onDeleteSession,
    navigate,
    onClearWorkspace
}) => {
    const [isLocalHistoryOpen, setIsLocalHistoryOpen] = React.useState(false);
    const [historySearch, setHistorySearch] = React.useState('');

    const renderHistoryList = (isCompact = false) => {
        const filteredSessions = (sessions || []).filter(session =>
            session.agentType === 'AIDESK' &&
            (session.title || '').toLowerCase().includes(historySearch.toLowerCase())
        );

        if (filteredSessions.length === 0) return (
            <div className={`flex flex-col items-center justify-center ${isCompact ? 'py-10' : 'py-20'} bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200`}>
                <MessageSquare className={`${isCompact ? 'w-8 h-8' : 'w-12 h-12'} text-slate-100 mb-4`} />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No history found</p>
            </div>
        );

        return (
            <div className={isCompact ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {filteredSessions.map((session) => (
                    <motion.div
                        key={session.sessionId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`group bg-white rounded-[25px] ${isCompact ? 'p-4' : 'p-6'} border transition-all cursor-pointer relative shadow-sm hover:shadow-xl hover:shadow-primary/5 ${currentSessionId === session.sessionId ? 'border-primary ring-4 ring-primary/5' : 'border-slate-50 hover:border-primary/20'}`}
                        onClick={() => {
                            navigate(`/dashboard/workspace/AIDESK/${session.sessionId}`);
                            setIsLocalHistoryOpen(false);
                        }}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentSessionId === session.sessionId ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-50 text-slate-400'}`}>
                                    <MessageSquare size={14} />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className={`text-[11px] font-black tracking-tight truncate max-w-[120px] ${currentSessionId === session.sessionId ? 'text-slate-800' : 'text-slate-600'}`}>
                                        {session.title || 'Desk Query'}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
                                        {new Date(session.lastModified).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSession(e, session.sessionId);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <div className="col-span-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 col-span-full">
                    <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Ticket Category</label>
                    <CustomSelect
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        options={['Technical', 'Billing', 'General']}
                    />
                </div>
                <div className="space-y-1.5 col-span-full">
                    <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Urgency</label>
                    <div className="flex gap-2">
                        {['Low', 'Medium', 'High'].map(level => (
                            <button key={level} type="button" onClick={() => setUrgency(level)} className={`flex-1 py-2 text-[10px] font-bold rounded-2xl border transition-all ${urgency === level ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/50 border-border text-subtext'}`}>{level}</button>
                        ))}
                    </div>
                </div>
                <div className="col-span-full space-y-1.5">
                    <label className="text-[10px] font-bold text-subtext uppercase tracking-widest pl-1">Audit Logs / Context</label>
                    <textarea value={auditLogs} onChange={(e) => setAuditLogs(e.target.value)} placeholder="Paste any error logs or customer data..." className="w-full bg-secondary/50 border border-border rounded-2xl px-3 py-2 text-[11px] text-maintext min-h-[60px]" />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-center gap-4 py-8 border-t border-slate-100/50 mt-10 relative">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsLocalHistoryOpen(!isLocalHistoryOpen)}
                        className={`flex items-center gap-2 px-8 py-4 border rounded-[30px] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${isLocalHistoryOpen ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                        <History size={16} className={isLocalHistoryOpen ? 'text-white' : 'text-slate-400'} /> History
                    </button>

                    <AnimatePresence>
                        {isLocalHistoryOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsLocalHistoryOpen(false)}
                                    className="fixed inset-0 z-[190] bg-slate-900/10 backdrop-blur-sm md:hidden"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 15 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[90vw] md:w-[350px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-6 z-[200]"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Desk History</h4>
                                        <button onClick={() => setIsLocalHistoryOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="relative mb-5">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                            <SearchIcon size={12} />
                                        </div>
                                        <input
                                            type="text"
                                            value={historySearch}
                                            onChange={(e) => setHistorySearch(e.target.value)}
                                            placeholder="Search history..."
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-[10px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                                        />
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {renderHistoryList(true)}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
                <button
                    type="button"
                    onClick={onClearWorkspace}
                    className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-[30px] text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                    <Trash2 size={16} className="text-slate-400" /> CLEAR
                </button>
            </div>
        </div>
    );
};

export default AIDESKInputs;
