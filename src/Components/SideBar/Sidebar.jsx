import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import {
  User,
  LayoutGrid,
  MessageSquare,
  ShoppingBag,
  Bot,
  Settings,
  LogOut,
  Zap,
  X,
  FileText,
  Bell,

  DollarSign,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import HelpFAQModal from '../Help/HelpFAQModal.jsx';
import { apis, AppRoute } from '../../types';
import { faqs } from '../../constants';
import NotificationBar from '../NotificationBar/NotificationBar.jsx';
import { useRecoilState } from 'recoil';
import { clearUser, getUserData, setUserData, toggleState, userData, notificationsState } from '../../userStore/userData';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { t, language, region, regionFlags } = useLanguage();


  const getFlagUrl = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

  const navigate = useNavigate();
  const [notifiyTgl, setNotifyTgl] = useRecoilState(toggleState)
  const [currentUserData, setUserRecoil] = useRecoilState(userData);
  const [notifications, setNotifications] = useRecoilState(notificationsState);
  const user = currentUserData.user || getUserData() || { name: "Loading...", email: "...", role: "user" };
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [networkErrorShown, setNetworkErrorShown] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Reset avatar error state when user avatar changes
  useEffect(() => {
    setAvatarError(false);
  }, [user.avatar]);

  const issueOptions = [
    "General Inquiry",
    "Payment Issue",
    "Refund Request",
    "Technical Support",
    "Account Access",
    "Other"
  ];


  const handleLogout = () => {
    clearUser();
    navigate(AppRoute.LANDING);
  };
  const token = user?.token || localStorage.getItem('token')

  useEffect(() => {
    // User data
    if (token) {
      axios.get(apis.user, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((res) => {
        if (res.data) {
          setUserRecoil({ user: res.data });
          setUserData(res.data);
        }
      }).catch((err) => {
        console.error(err);
        if (err.status == 401) {
          clearUser()
          navigate(AppRoute.LOGIN)
        }
      })
    }

    // Notifications
    const fetchNotifications = async () => {
      // Check if notifications are enabled in settings
      const savedSettings = localStorage.getItem('user_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        // If emailNotif (acting as master toggle in Profile UI) is false, do not fetch
        if (settings.emailNotif === false) {
          setNotifications([]);
          return;
        }
      }

      try {
        const res = await axios.get(apis.notifications, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setNotifications(Array.isArray(res.data) ? res.data : []);
        if (networkErrorShown) setNetworkErrorShown(false); // Reset error flag on success
      } catch (err) {
        if (!err.response || err.code === 'ERR_NETWORK') {
          // Connection Refused / Network Error
          if (!networkErrorShown) {
            console.warn("Cannot connect to notification service (Backend likely down). Retrying silently...");
            setNetworkErrorShown(true);
          }
        } else {
          console.error("Notifications fetch failed", err);
        }
      }
    };

    if (token) {
      fetchNotifications();
      // Refresh every 5 seconds for "real-time" feel
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [token, networkErrorShown])
  if (notifiyTgl.notify) {
    setTimeout(() => {
      setNotifyTgl({ notify: false })
    }, 2000)
  }
  // Dynamic class for active nav items
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium border border-transparent ${isActive
      ? 'bg-primary/10 text-primary border-primary/10'
      : 'text-subtext hover:bg-surface hover:text-maintext'
    }`;



  const displayName = user.name === 'Admin' ? t('adminName') : (user.name || t('userRole'));

  return (
    <>
      <AnimatePresence>
        {/* The toast notification handles the display, so the motion.div for NotificationBar is removed */}
      </AnimatePresence>

      {/* Backdrop for Mobile/Tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-[100] w-[240px] max-w-[80vw] sm:w-72 lg:w-64 bg-secondary border-r border-border 
          flex flex-col transition-transform duration-300 ease-in-out 
          lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="p-4 flex items-center justify-between">
          <Link to="/">
            <h1 className="text-xl font-bold text-primary">{t('brandName')}</h1>
          </Link>


          <button
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 text-subtext hover:text-maintext rounded-lg hover:bg-surface"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">




          <NavLink to="/dashboard/chat" className={navItemClass} onClick={onClose}>
            <MessageSquare className="w-5 h-5" />
            <span>{t('chat') || 'Chat'}</span>
          </NavLink>

          <NavLink to={AppRoute.MY_AGENTS} className={navItemClass} onClick={onClose}>
            <Bot className="w-5 h-5" />
            <span>{t('myAgentsPage.title')}</span>
          </NavLink>

          <NavLink to={AppRoute.MARKETPLACE} className={navItemClass} onClick={onClose}>
            <ShoppingBag className="w-5 h-5" />
            <span>{t('marketplacePage.title')}</span>
          </NavLink>

          {/* Admin Dashboard Link - Only for admin users */}
          {user.role?.toLowerCase() === 'admin' && (
            <NavLink to={AppRoute.ADMIN} className={navItemClass} onClick={onClose}>
              <LayoutGrid className="w-5 h-5" />
              <span>{t('adminDashboard')}</span>
            </NavLink>
          )}
        </div>

        {/* Footer / Profile */}
        <div className="p-3 border-t border-border bg-secondary/30">
          {/* Updates Link */}
          <NavLink to={AppRoute.NOTIFICATIONS} className={navItemClass} onClick={onClose}>
            <div className="relative">
              <Bell className="w-5 h-5" />
              {(() => {
                const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;
                return unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 border-2 border-secondary flex items-center justify-center text-[10px] font-bold text-white shadow-sm hover:scale-110 transition-transform">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                );
              })()}
            </div>
            <span>{t('updates')}</span>
          </NavLink>




          {user && user.email ? (
            <div
              className="rounded-xl border border-transparent flex items-center gap-2 p-2 hover:bg-surface transition-colors cursor-pointer group"
              onClick={() => {
                navigate(AppRoute.PROFILE);
                onClose();
              }}
            >
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0 overflow-hidden border border-primary/10 group-hover:bg-primary/30 transition-colors">
                {user.avatar && !avatarError ? (
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-maintext truncate group-hover:text-primary transition-colors">{displayName}</p>
                <p className="text-[11px] text-subtext truncate">{user.email}</p>
              </div>

              <div className="text-subtext group-hover:text-primary transition-colors">
                <User className="w-4 h-4" />
              </div>
            </div>
          ) : (
            /* Guest / Login State */
            <div
              onClick={() => navigate(AppRoute.LOGIN)}
              className="rounded-xl border border-transparent hover:bg-secondary transition-all cursor-pointer flex items-center gap-3 px-3 py-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0 border border-primary/10 group-hover:bg-primary/20 transition-colors">
                <User className="w-4 h-4" />
              </div>
              {t('auth.login')}
            </div>
          )}

          <div className="mt-1 flex flex-col gap-1">


            {/* FAQ Button */}
            <button
              onClick={() => setIsFaqOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg text-subtext hover:bg-secondary hover:text-maintext transition-all text-xs border border-transparent hover:border-border"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t('helpFaq')}</span>
            </button>
          </div>
        </div>
      </div >

      {/* FAQ Modal */}
      < HelpFAQModal
        isOpen={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
        user={user}
      />
    </>
  );
};

export default Sidebar;
