import React, { useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router';
import { Search, Menu, CheckCircle, Info, LayoutDashboard } from 'lucide-react';

const Navbar = ({ setIsSidebarOpen }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const isDashboard = location.pathname === '/agents/aibase';

    const handleSearch = (e) => {
        const term = e.target.value;
        if (term) {
            navigate(`/agents/aibase?search=${encodeURIComponent(term)}`);
        } else {
            navigate('/agents/aibase');
        }
    };

    return (
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 hover:bg-surface rounded-lg text-subtext"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {isDashboard ? (
                    <div className="relative w-full max-w-md hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
                        <input
                            type="text"
                            placeholder="Search knowledge base..."
                            value={searchParams.get('search') || ''}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 bg-surface rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-sm text-maintext"
                        />
                    </div>
                ) : (
                    <div className="flex items-center">
                        <span className="text-sm md:text-lg font-medium text-subtext truncate">
                            Chat with your Knowledge Base
                        </span>
                    </div>
                )}
            </div>

            {isDashboard && (
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-2 md:gap-3 md:pl-6 md:border-l border-border">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-maintext">Admin User</p>
                            <p className="text-xs text-subtext">admin@aibase.com</p>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5">
                            <div className="w-full h-full bg-white rounded-full p-0.5">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="User" className="w-full h-full rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
