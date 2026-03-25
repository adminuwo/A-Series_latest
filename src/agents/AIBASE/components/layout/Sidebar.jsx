import React from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/agents/aibase' },
        { icon: MessageSquare, label: 'Chat', path: '/agents/aibase/chat' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-border h-screen flex flex-col z-[60] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center justify-start gap-3">
                        <img src="/AGENTS_IMG/AIBASE.png" alt="AIBASE Logo" className="w-10 h-10 object-cover rounded-xl shadow-sm shrink-0" />
                        <span className="font-extrabold text-lg text-maintext tracking-tight truncate">AI Base</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-2 hover:bg-surface rounded-lg text-subtext"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'text-subtext hover:bg-surface hover:text-maintext'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-border">
                    {/* Footers removed */}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
