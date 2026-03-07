import React, { useState } from 'react';
import { Routes, Route, Outlet, Navigate, BrowserRouter, useNavigate, useLocation } from 'react-router';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerificationForm from './pages/VerificationForm';
import Chat from './pages/Chat';
import Sidebar from './Components/SideBar/Sidebar.jsx';
import Navbar from './Components/Navbar/Navbar.jsx';
import Marketplace from './pages/Marketplace';
import MyAgents from './pages/MyAgents';
import DashboardOverview from './pages/DashboardOverview';
import Automations from './pages/Automations';
import Admin from './pages/Admin';
import Invoices from './pages/Invoices';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AiPersonalAssistantDashboard from './pages/AiPersonalAssistant/Dashboard';
import UserTransactions from './pages/UserTransactions';
import ContactUs from './pages/ContactUs';
import AISAWorkSpace from './pages/AISAWorkSpace';

import { AppRoute } from './types';
import AiBiz from './agents/AIBIZ/AiBiz.jsx';
import AiBase from './agents/AIBASE/AiBase.jsx';
import ComingSoon from './Components/ComingSoon/ComingSoon.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

import { lazy, Suspense } from 'react';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute.jsx';
import { useLanguage } from './context/LanguageContext';
import UserDropdown from './Components/Navbar/UserDropdown';
import { Menu } from 'lucide-react';
import { useRecoilState } from 'recoil';
import { toggleState } from './userStore/userData';


const SecurityAndGuidelines = lazy(() => import('./pages/SecurityAndGuidelines'));
const TrustSafetyCompliance = lazy(() => import('./pages/TrustSafetyCompliance'));
const TransactionHistory = lazy(() => import('./Components/Admin/TransactionHistory'));



const AuthenticatRoute = ({ children }) => {
  return children;
}

// ------------------------------
// Dashboard Layout (Auth pages)
// ------------------------------

import AnnouncementBanner from './Components/Banner/AnnouncementBanner.jsx';

const DashboardLayout = () => {
  const [tglState, setTglState] = useRecoilState(toggleState);
  const isSidebarOpen = tglState.sidebarOpen;
  const setIsSidebarOpen = (val) => setTglState(prev => ({ ...prev, sidebarOpen: val }));
  const location = useLocation();
  const isFullScreen = location.pathname.includes('/ai-personal-assistant') || location.pathname.includes('/workspace');
  const isAisaWorkspace = location.pathname.includes('/workspace');

  const user = JSON.parse(
    localStorage.getItem('user') || '{"name":"User"}'
  );

  const navigate = useNavigate();
  const { setLanguage, setRegion, t } = useLanguage();

  // Sync Language from User Settings on Mount
  React.useEffect(() => {
    const currentLang = localStorage.getItem('user-language');
    // Only set from user object if no explicit language choice has been made in this browser session
    if (!currentLang && user?.settings?.language) {
      setLanguage(user.settings.language);
    }
    if (user?.settings?.region) {
      setRegion(user.settings.region);
    }
  }, []);

  return (
    <div className="fixed inset-0 flex bg-background text-maintext overflow-hidden font-sans">
      {/* Background Dreamy Orbs Removed */}

      {(!isAisaWorkspace) && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}


      <div className="flex-1 flex flex-col min-w-0 bg-transparent h-full relative">
        {/* Outlet for pages */}

        {/* Desktop Navbar */}
        {!isFullScreen && !location.pathname.toLowerCase().includes('/chat') && (
          <div className="hidden lg:flex items-center justify-end shrink-0 z-50 bg-secondary border-b border-border w-full h-14 px-4">
            <Navbar />
          </div>
        )}

        {/* Mobile Header - Hidden on Chat to avoid double headers */}
        {!isFullScreen && !location.pathname.toLowerCase().includes('/chat') && (
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-secondary shrink-0 z-50 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg hover:bg-surface text-maintext active:bg-surface/80 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="font-bold text-lg text-primary">{t('brandName')}</span>
            </div>

            <div className="flex items-center gap-3">
              <UserDropdown isMobile={true} />
            </div>
          </div>
        )}

        {/* Back Button for Full Screen Mode (Desktop/Mobile) */}
        {isFullScreen && (
          <div className="absolute top-4 left-4 z-50">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-medium"
            >
              <Menu className="w-4 h-4" />
              <span>{t('navigation.menu')}</span>
            </button>
          </div>
        )}

        {/* Outlet for pages */}
        <main className={`flex-1 overflow-y-auto relative w-full scroll-smooth ${isFullScreen ? 'p-0' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ------------------------------
// Placeholder Page
// ------------------------------

const PlaceholderPage = ({ title }) => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center h-full text-subtext flex-col">
      <h2 className="text-2xl font-bold mb-2 text-maintext">{title}</h2>
      <p>{t('navigation.comingSoon')}</p>
    </div>
  );
};

// ------------------------------
// App Router
// ------------------------------

import { Toaster } from 'react-hot-toast';

const NavigateProvider = () => {
  const { t } = useLanguage();
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path={AppRoute.LANDING} element={<Landing />} />
        <Route path={AppRoute.LOGIN} element={<Login />} />
        <Route path={AppRoute.SIGNUP} element={<Signup />} />
        <Route path={AppRoute.E_Verification} element={<VerificationForm />} />
        <Route path={AppRoute.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={AppRoute.RESET_PASSWORD} element={<ResetPassword />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/agentsoon" element={<ComingSoon />}></Route>
        {/* agents */}
        <Route path='/agents/aibiz' element={<AiBiz />}></Route>
        <Route path='/agents/aibase/*' element={<AiBase />}></Route>
        {/* Dashboard (Protected) */}
        <Route
          path={AppRoute.DASHBOARD}
          element={<DashboardLayout />}
        >
          <Route index element={<Navigate to="marketplace" replace />} />
          <Route path="chat" element={<Chat />} />
          <Route path="chat/:sessionId" element={<Chat />} />
          <Route path="workspace" element={<AISAWorkSpace />} />
          <Route path="workspace/:agentId" element={<AISAWorkSpace />} />
          <Route path="workspace/:agentId/:sessionId" element={<AISAWorkSpace />} />
          <Route path="overview" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="ai-personal-assistant" element={<ProtectedRoute><AiPersonalAssistantDashboard /></ProtectedRoute>} />
          <Route path="agents" element={<ProtectedRoute><MyAgents /></ProtectedRoute>} />
          <Route path="automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
          <Route path="admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
          <Route path="invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="transactions" element={<ProtectedRoute><UserTransactions /></ProtectedRoute>} />
          <Route path="security" element={
            <Suspense fallback={<div className="flex items-center justify-center h-full">{t('navigation.loading')}</div>}>
              <SecurityAndGuidelines />
            </Suspense>
          } />
          <Route path="trust-safety-compliance" element={
            <Suspense fallback={<div className="flex items-center justify-center h-full">{t('navigation.loading')}</div>}>
              <TrustSafetyCompliance />
            </Suspense>
          } />
        </Route>


        {/* Catch All */}
        <Route path="*" element={<Navigate to={AppRoute.LANDING} replace />} />
      </Routes>
    </BrowserRouter >
  );
};

export default NavigateProvider;