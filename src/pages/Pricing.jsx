import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Rocket, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AppRoute } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getUserData } from '../userStore/userData';

const Pricing = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const user = getUserData();

    const plans = [
        {
            name: 'Basic',
            price: 'Free',
            period: '',
            desc: 'Perfect for exploring our AI capabilities at no cost.',
            features: [
                'Limited Chat generations',
                'Access to standard models',
                'Basic data persistence',
                'Community support'
            ],
            color: 'from-gray-500 to-gray-700',
            btnText: 'Get Started',
            popular: false
        },
        {
            name: 'Pro',
            price: '₹499',
            period: '/mo',
            desc: 'Unlock higher limits and more powerful AI tools.',
            features: [
                'Unlimited Chat generations',
                'Priority access to Gemini 1.5 Pro',
                'Enhanced image generation',
                'Agent custom instructions',
                'Faster processing'
            ],
            color: 'from-primary to-indigo-600',
            btnText: 'Unleash Power',
            popular: true
        },
        {
            name: 'Enterprise',
            price: '₹5,000',
            period: '/yr',
            desc: 'Full-scale AI solution for businesses and creators.',
            features: [
                'Everything in Pro',
                'Custom API integrations',
                'Advanced RAG knowledge bases',
                'Team collaboration features',
                'Dedicated support manager',
                'Early access to new models'
            ],
            color: 'from-purple-600 to-blue-600',
            btnText: 'Go Infinite',
            popular: false
        }
    ];

    const handleSelectPlan = (plan) => {
        if (!user) {
            navigate(AppRoute.LOGIN + "?redirect=" + AppRoute.MARKETPLACE);
        } else {
            navigate(AppRoute.MARKETPLACE);
        }
    };

    return (
        <div className="min-h-screen bg-secondary flex flex-col relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate(AppRoute.LANDING)}
                >
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                        <Rocket className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-maintext tracking-tighter">A-Series™</span>
                </div>
                <button 
                   onClick={() => navigate(user ? AppRoute.DASHBOARD : AppRoute.LOGIN)}
                   className="text-subtext font-bold hover:text-primary transition-colors"
                >
                    {user ? 'Dashboard' : 'Sign In'}
                </button>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-20 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-4"
                    >
                        <Zap size={14} className="fill-primary" />
                        Flexible Plans
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-maintext tracking-tight"
                    >
                        The Future of AI, <br />
                        <span className="text-primary italic">Priced Simple.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-subtext text-lg max-w-2xl mx-auto"
                    >
                        Choose the plan that fits your vision. Scale as you grow, with no hidden fees.
                    </motion.p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx + 0.2 }}
                            className={`relative group bg-card border ${plan.popular ? 'border-primary ring-4 ring-primary/5' : 'border-border'} rounded-[32px] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 py-2 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-[2px] rounded-bl-2xl">
                                    Most Popular
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="mb-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-subtext mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-maintext tracking-tighter">{plan.price}</span>
                                    <span className="text-subtext font-bold mb-1">{plan.period}</span>
                                </div>
                                <p className="text-sm text-subtext mt-4 font-medium leading-relaxed">
                                    {plan.desc}
                                </p>
                            </div>

                            {/* Features */}
                            <div className="flex-1 space-y-4 mb-10">
                                {plan.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                                            <Check size={12} className="text-white" />
                                        </div>
                                        <span className="text-sm font-semibold text-maintext/80">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Button */}
                            <button
                                onClick={() => handleSelectPlan(plan)}
                                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all group-hover:scale-[1.02] flex items-center justify-center gap-2 ${
                                    plan.popular 
                                    ? `bg-gradient-to-r ${plan.color} text-white shadow-xl shadow-primary/20` 
                                    : 'bg-secondary text-maintext border border-border hover:bg-surface'
                                }`}
                            >
                                {plan.btnText}
                                <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Trust Section */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-24 pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8"
                >
                    <div className="flex items-center gap-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <img src="/logo/Logo.png" alt="A-Series" className="h-8" />
                        <Shield className="w-8 h-8 text-indigo-500" />
                        <Zap className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-xs font-bold text-subtext uppercase tracking-widest mb-1">Secure Payments via Razorpay</p>
                        <p className="text-[10px] text-subtext/60">© {new Date().getFullYear()} A-Series Intelligence. All rights reserved.</p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Pricing;
