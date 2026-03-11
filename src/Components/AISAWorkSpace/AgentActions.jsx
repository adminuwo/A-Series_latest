import React from 'react';
import { BarChart3, Zap, FilePieChart, Trophy } from 'lucide-react';

const AgentActions = ({ activeAgent, hiringMode, handleAction }) => {
    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => handleAction(null, "Run full analysis.")}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary border border-primary/20 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all"
            >
                <BarChart3 className="w-3.5 h-3.5" /> Quick Insights
            </button>
            {activeAgent.id === 'AISALES' && (
                <button
                    type="button"
                    onClick={() => handleAction(null, "Predict win rate and suggest improvements.")}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all"
                >
                    <Zap className="w-3.5 h-3.5" /> Predict Win Rate
                </button>
            )}

            {activeAgent.id === 'AIWRITE' && (
                <button
                    type="button"
                    onClick={() => handleAction(null, "Run SEO audit and content optimization.")}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 border border-pink-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all"
                >
                    <FilePieChart className="w-3.5 h-3.5" /> SEO Analysis
                </button>
            )}
            {activeAgent.id === 'AIBIZ' && (
                <button
                    type="button"
                    onClick={() => handleAction(null, "Perform deep market SWOT analysis.")}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all"
                >
                    <BarChart3 className="w-3.5 h-3.5" /> Market SWOT
                </button>
            )}
            {activeAgent.id === 'AIHIRE' && (
                <button
                    type="button"
                    onClick={() => handleAction(null, `Run comprehensive ${hiringMode} analysis.`)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-white transition-all"
                >
                    <Trophy className="w-3.5 h-3.5" /> Start Audit
                </button>
            )}
        </div>
    );
};

export default AgentActions;
