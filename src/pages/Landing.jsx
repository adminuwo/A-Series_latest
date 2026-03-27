import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight, Bot, Zap, Shield, CircleUser,
  Github, X,
  Mail, MapPin, Phone, MessageSquare, MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { logo, name } from '../constants';
import { getUserData } from '../userStore/userData';
import { AppRoute } from '../types';
import { Link } from 'react-router';
import LanguageSwitcher from '../Components/LanguageSwitcher/LanguageSwitcher';
import PolicyModal from '../Components/PolicyModal';
import HelpFAQModal from '../Components/Help/HelpFAQModal';
import { apiService } from '../services/apiService';
import { useLanguage } from '../context/LanguageContext';


import SecurityModal from '../Components/Security/SecurityModal';
import ContactUsModal from '../Components/Contact/ContactUsModal';
// Added Link import which was missing

const Landing = () => {
  const navigate = useNavigate();
  const user = getUserData();
  const { t } = useLanguage();

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isContactUsModalOpen, setIsContactUsModalOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(null); // 'privacy' | 'terms' | 'cookie'
  const btnClass = "px-8 py-4 bg-surface border border-border rounded-2xl font-bold text-lg text-maintext hover:bg-secondary transition-all duration-300 flex items-center justify-center gap-2";

  const [contactInfo, setContactInfo] = useState({
    email: 'admin@uwo24.com',
    phone: '+91 83598 90909'
  });

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await apiService.getPublicSettings();
        setContactInfo(prev => ({
          email: settings.contactEmail || prev.email,
          phone: settings.supportPhone || prev.phone
        }));
      } catch (e) {
        console.warn('Failed to load contact info', e);
      }
    };
    fetchSettings();
  }, []);

  // ... (rest of code)

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-secondary">

      {/* Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100 dark:bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 px-4 py-4 md:px-6 md:py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 md:gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10 md:w-14 md:h-14 object-contain" />
          <span className="hidden sm:block text-xl md:text-3xl font-black tracking-tighter text-maintext">{t('brandName')}</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSwitcher variant="landing" />






          {user ? <Link to={AppRoute.PROFILE}><CircleUser className='h-6 w-6 md:h-7 md:w-7 text-maintext' /></Link> : <div className="flex gap-2 md:gap-4 items-center">
            <button
              onClick={() => navigate(AppRoute.PRICING)}
              className="text-sm md:text-base text-subtext hover:text-primary font-medium transition-colors whitespace-nowrap"
            >
              Pricing
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-sm md:text-base text-subtext hover:text-primary font-medium transition-colors whitespace-nowrap"
            >
              {t('landing.signIn')}
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="bg-primary text-white px-4 py-2 md:px-5 md:py-2 text-sm md:text-base rounded-full font-semibold hover:opacity-90 transition-colors shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              {t('landing.getStarted')}
            </button>
          </div>}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 py-20">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-sm text-subtext mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {t('landing.poweredBy')}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-maintext"
        >
          {t('landing.heroTitle1')} <br />
          <span className="text-primary">{t('landing.heroTitle2')}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-subtext max-w-2xl mb-10 leading-relaxed"
        >
          {t('landing.heroSubtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-2xl"
        >

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard/chat/new")}
            className="px-8 py-4 bg-primary rounded-2xl font-bold text-lg text-white shadow-xl shadow-primary/30 hover:translate-y-[-2px] transition-all duration-300 flex items-center justify-center gap-2"
          >
            {t('landing.startNow')} <ArrowRight className="w-5 h-5" />
          </motion.button>



          {!user && (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
              className={btnClass}
            >
              {t('landing.existingUser')}
            </motion.button>
          )}
        </motion.div>






        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left"
        >
          <div className="p-6 rounded-3xl bg-background border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-maintext">{t('landing.features.smartAgents.title')}</h3>
            <p className="text-subtext">
              {t('landing.features.smartAgents.desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-background border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-maintext">{t('landing.features.realTime.title')}</h3>
            <p className="text-subtext">
              {t('landing.features.realTime.desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-background border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-maintext">{t('landing.features.secure.title')}</h3>
            <p className="text-subtext">
              {t('landing.features.secure.desc')}
            </p>
          </div>
        </motion.div>

        {/* Quick Pricing Section Preview */}
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-32 w-full max-w-5xl py-20 px-8 rounded-[3rem] bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10 text-center relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 py-2 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-[2px] rounded-bl-3xl">Limited Offer</div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-maintext mb-4">Start for Free, <br/><span className="text-primary italic">Pay as you Grow.</span></h2>
            <p className="text-subtext mb-10 max-w-lg mx-auto">Get unlimited access to AI tools for just ₹499/mo. Sign up now and supercharge your workflow.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => navigate(AppRoute.PRICING)}
                  className="px-10 py-5 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-3xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                  View All Plans
                </button>
                <div className="flex items-center gap-2 text-xs font-bold text-subtext/60">
                    <Shield size={16} className="text-emerald-500" />
                    Encrypted via Razorpay
                </div>
            </div>
        </motion.div>

      </main>

      {/* Footer Section */}
      <footer className="w-full bg-background border-t border-border mt-20 relative z-[100]">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                <span className="text-2xl font-black tracking-tighter text-maintext">{name}</span>
              </div>
              <p className="text-sm text-subtext leading-relaxed max-w-sm">
                {t('landing.footer.description')} <br />
                {t('landing.footer.appCount')}<br />
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t('landing.footer.poweredBy')}
                </span>
              </p>
              <div className="flex items-center gap-3 sm:gap-5 relative z-[200]">
                {[
                  {
                    icon: <img src="/social-icons/linkedin.svg" alt="LinkedIn" className="w-9 h-9 object-contain" />,
                    href: "https://www.linkedin.com/authwall?trk=bf&trkInfo=AQF3pSWm3RFcZQAAAZtzxKHoH3Gk0Is5rVSKn-E57xtOi8yVUop7C1hlM2loZWRfEP9RIwqwNjjt4PjJQMmAxxwNqIw5YDwxftwn5e_z7XccQBdXFipFYgZgnb9UscYZ4BTGo3o=&original_referer=&sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fin%2Faimall-global%2F",
                  },
                  {
                    icon: (
                      <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center overflow-hidden">
                        <img src="/social-icons/x.svg" alt="X" className="w-5 h-5 invert" />
                      </div>
                    ),
                    href: "https://x.com/aimallglobal",
                  },
                  {
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-9 h-9">
                        <circle cx="12" cy="12" r="12" fill="#1877F2" />
                        <path
                          fill="white"
                          d="M16 12h-3v9h-3.5v-9h-2v-3h2v-2c0-2 1.2-3.5 3.5-3.5 1 0 1.8.1 2 .1v2.4h-1.4c-1 0-1.1.5-1.1 1.1v1.9h2.5l-.5 3z"
                        />
                      </svg>
                    ),
                    href: "https://www.facebook.com/aimallglobal/",
                  },
                  {
                    icon: <img src="/social-icons/instagram.svg" alt="Instagram" className="w-9 h-9 object-contain" />,
                    href: "https://www.instagram.com/aimall.global/",
                  },
                  {
                    icon: <img src="/social-icons/youtube.svg" alt="YouTube" className="w-9 h-9 object-contain" />,
                    href: "https://www.youtube.com/@aimallglobal",
                  },
                  {
                    icon: (
                      <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center overflow-hidden">
                        <img src="/social-icons/threads.svg" alt="Threads" className="w-6 h-6 invert" />
                      </div>
                    ),
                    href: "https://www.threads.net/@aimall.global",
                  },
                  {
                    icon: <img src="/social-icons/whatsapp.svg" alt="WhatsApp" className="w-9 h-9 object-contain" />,
                    href: "https://api.whatsapp.com/send?phone=918359890909",
                    isWhatsApp: true
                  }
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-all duration-300 hover:scale-110 hover:opacity-100 shrink-0 cursor-pointer relative z-[300] active:scale-95 flex items-center justify-center p-0.5 pointer-events-auto"
                    style={{ pointerEvents: 'auto' }}
                    onClick={() => {
                      if (social.isWhatsApp) {
                        // Force open if standard link fails
                        window.open(social.href, "_blank");
                      }
                    }}
                    title={social.isWhatsApp ? "Chat on WhatsApp" : ""}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Explore Column */}
            <div>
              <h4 className="text-sm font-bold text-maintext uppercase tracking-widest mb-6">{t('landing.footer.explore')}</h4>
              <ul className="space-y-4">
                {[
                  { label: t('landing.footer.marketplace'), onClick: () => navigate(AppRoute.DASHBOARD + "/marketplace") },
                  { label: t('landing.footer.myAgents'), onClick: () => navigate(AppRoute.DASHBOARD + "/agents") },
                  { label: 'Pricing Plans', onClick: () => navigate(AppRoute.PRICING) },
                ].map((link, i) => (
                  <li key={i}>
                    <button
                      onClick={link.onClick}
                      className="text-sm text-subtext hover:text-primary transition-colors font-medium"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="text-sm font-bold text-maintext uppercase tracking-widest mb-6">{t('landing.footer.support')}</h4>
              <ul className="space-y-4">
                {[
                  { label: t('landing.footer.helpCenter'), onClick: () => setIsHelpModalOpen(true) },
                  { label: t('landing.footer.securityGuidelines'), onClick: () => setIsSecurityModalOpen(true) },
                  { label: t('landing.footer.contactUs'), onClick: () => setIsContactUsModalOpen(true) },
                ].map((link, i) => (
                  <li key={i}>
                    {link.onClick ? (
                      <button
                        onClick={link.onClick}
                        className="text-sm text-subtext hover:text-primary transition-colors font-medium"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.path}
                        className="text-sm text-subtext hover:text-primary transition-colors font-medium"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-maintext uppercase tracking-widest mb-6">{t('landing.footer.contact')}</h4>
              <div className="space-y-4">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Jabalpur+Madhya+Pradesh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-subtext leading-relaxed group-hover:text-primary transition-colors">
                    {t('landing.footer.location')}
                  </p>
                </a>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-3 group"
                >
                  <Mail className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-subtext group-hover:text-primary transition-colors font-medium">
                    {contactInfo.email}
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-subtext font-medium">
              © {new Date().getFullYear()} {name}. {t('landing.footer.allRightsReserved')}
            </p>
            <div className="flex items-center gap-8">
              <button onClick={() => setPolicyOpen('privacy')} className="text-xs text-subtext hover:text-maintext transition-colors font-medium">{t('landing.footer.privacyPolicy')}</button>
              <button onClick={() => setPolicyOpen('terms')} className="text-xs text-subtext hover:text-maintext transition-colors font-medium">{t('landing.footer.termsOfService')}</button>
              <button onClick={() => setPolicyOpen('cookie')} className="text-xs text-subtext hover:text-maintext transition-colors font-medium">{t('landing.footer.cookiePolicy')}</button>
            </div>
          </div>
        </div>
      </footer >

      <HelpFAQModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        user={user}
      />

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      <ContactUsModal
        isOpen={isContactUsModalOpen}
        onClose={() => setIsContactUsModalOpen(false)}
      />

      {/* Policy Modal */}
      <PolicyModal
        isOpen={!!policyOpen}
        onClose={() => setPolicyOpen(null)}
        type={policyOpen}
        contactInfo={contactInfo}
      />
    </div >
  );
};


export default Landing;