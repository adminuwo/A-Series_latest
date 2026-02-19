import React from 'react';
import { motion } from 'framer-motion';
import {
    CircleUser,
    Settings,
    Shield,
    ChevronRight,
    LogOut,
    Camera,
    Pencil,
    Check,
    Bell,
    Lock,
    Trash2,
    Eye,
    EyeOff,
    X,
    Moon,
    Sun,
    Globe,
    FileText,
    Crown,
    Star,
    AlertTriangle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { AppRoute, apis } from '../types';
import axios from 'axios';
import { getUserData, clearUser, setUserData, userData, resetUserDataState } from '../userStore/userData';
import { useRecoilState } from 'recoil';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

// Profile Component
const Profile = () => {
    const navigate = useNavigate();
    const [currentUserData, setUserRecoil] = useRecoilState(userData);
    const user = currentUserData?.user || getUserData() || { name: 'Gauhar', email: 'gauhar@example.com' };
    const [avatarError, setAvatarError] = React.useState(false);

    // Settings State
    const [userSettings, setUserSettings] = React.useState(() => {
        const saved = localStorage.getItem('user_settings');
        return saved ? JSON.parse(saved) : {
            emailNotif: true,
            pushNotif: true,
            publicProfile: true,
            twoFactor: true
        };
    });

    // Fetch latest settings from backend
    React.useEffect(() => {
        const fetchSettings = async () => {
            if (!user?.token) return;
            try {
                const res = await axios.get(apis.user, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (res.data.settings) {
                    setUserSettings(res.data.settings);
                    localStorage.setItem('user_settings', JSON.stringify(res.data.settings));

                    // Sync Language and Region from Backend
                    if (res.data.settings.language) setLanguage(res.data.settings.language);
                    if (res.data.settings.region) setRegion(res.data.settings.region);
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []); // Only on mount

    // Password Modal State
    const [showPasswordModal, setShowPasswordModal] = React.useState(false);
    const [passwordForm, setPasswordForm] = React.useState({ current: '', new: '', confirm: '' });
    const [showAllPasswords, setShowAllPasswords] = React.useState(false);

    const _toggleSetting = async (key) => {
        const oldSettings = { ...userSettings };
        const newState = { ...userSettings, [key]: !userSettings[key] };

        setUserSettings(newState);
        localStorage.setItem('user_settings', JSON.stringify(newState));

        const value = newState[key] ? "Enabled" : "Disabled";
        const labelMap = {
            emailNotif: t('notifications'),
            pushNotif: t('notifications'),
            publicProfile: t('publicProfile'),
            twoFactor: t('twoFactorAuthentication')
        };
        toast.success(`${labelMap[key]} ${value === "Enabled" ? t('enabled') : t('disabled')}`);

        try {
            if (user?.token) {
                await axios.put(apis.user, { settings: newState }, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
            }
        } catch (error) {
            console.error("Failed to save setting", error);
            toast.error("Failed to save setting");
            setUserSettings(oldSettings);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.new !== passwordForm.confirm) {
            toast.error(t('passwordMismatch'));
            return;
        }
        if (passwordForm.new.length < 6) {
            toast.error(t('passwordTooShort'));
            return;
        }

        const loadingToast = toast.loading(t('profilePage.updatingPassword'));
        try {
            await axios.post(apis.resetPasswordEmail, {
                email: user.email,
                currentPassword: passwordForm.current,
                newPassword: passwordForm.new
            });
            toast.dismiss(loadingToast);
            toast.success(t('passwordUpdated'));
            setShowPasswordModal(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || t('failedToUpdate'));
        }
    };

    const handleLogout = () => {
        clearUser();
        setUserRecoil(resetUserDataState());
        navigate(AppRoute.LANDING);
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(t('profilePage.deletionConfirmation'));
        if (!confirmDelete) return;

        const loadingToast = toast.loading(t('profilePage.deletingAccount'));
        try {
            const token = user?.token || localStorage.getItem('token');
            if (!user?.id || !token) {
                toast.error(t('profilePage.failedToUpdate'));
                toast.dismiss(loadingToast);
                return;
            }

            await axios.delete(`${apis.user}/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            toast.dismiss(loadingToast);
            toast.success(t('profilePage.accountDeleted'));

            // Cleanup and Logout
            clearUser();
            setUserRecoil(resetUserDataState());
            navigate(AppRoute.LANDING);
            window.location.reload(); // Ensure all state is cleared
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Failed to delete account", error);
            toast.error(error.response?.data?.error || t('profilePage.failedToDelete'));
        }
    };

    const { language, setLanguage, t, region, setRegion, regions: _regions, languages: _languages, regionFlags: _regionFlags, allTimezones, regionTimezones } = useLanguage();
    const { theme, setTheme } = useTheme();

    const _getFlagUrl = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

    const [isEditing, setIsEditing] = React.useState(false);
    const [editForm, setEditForm] = React.useState({ name: user.name, email: user.email });



    const handleSaveProfile = async () => {
        const loadingToast = toast.loading(t('profilePage.updatingProfile'));
        try {
            const updatedUser = { ...user, name: editForm.name };

            // 1. Update Backend
            const token = user?.token || localStorage.getItem('token');
            if (token) {
                await axios.put(apis.user, { name: editForm.name }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            // 2. Update Local Storage
            setUserData(updatedUser);

            // 3. Update Recoil Atom (Triggers Sidebar update)
            setUserRecoil(prev => ({ ...prev, user: updatedUser }));

            setIsEditing(false);
            toast.dismiss(loadingToast);
            toast.success(t('profilePage.profileUpdated'));

        } catch (error) {
            console.error("Failed to update profile", error);
            toast.dismiss(loadingToast);

            // Revert changes if needed or show error
            toast.error(t('profilePage.failedToSave'));

            // Optional: If backend fails, we might want to revert the local change? 
            // For now, we'll assume the user wants to keep their edit locally or try again.
        }
    };

    // Avatar Upload State and Handler
    const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
    const avatarInputRef = React.useRef(null);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error(t('profilePage.invalidFile'));
            return;
        }

        // Validate file size (50MB)
        if (file.size > 50 * 1024 * 1024) {
            toast.error(t('profilePage.fileTooLarge'));
            return;
        }

        // Check if user is logged in and has a valid token
        const token = user?.token || localStorage.getItem('token');
        if (!user || !token) {
            toast.error(t('profilePage.loginRequired'));
            navigate(AppRoute.LOGIN);
            return;
        }

        setIsUploadingAvatar(true);
        const loadingToast = toast.loading(t('profilePage.uploadingAvatar'));

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            console.log("Uploading with token:", user.token ? "Token exists" : "No token");

            const response = await axios.put(apis.uploadAvatar, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Get avatar URL from response
            const avatarUrl = response.data.avatarUrl || response.data.avatar;

            if (!avatarUrl) {
                throw new Error("No avatar URL returned from server");
            }

            // Update with cache-busting timestamp
            const separator = avatarUrl.includes('?') ? '&' : '?';
            const avatarWithCacheBusting = `${avatarUrl}${separator}t=${Date.now()}`;

            // Update user object
            const updatedUser = { ...user, avatar: avatarWithCacheBusting };

            // 1. Update localStorage
            setUserData(updatedUser);

            // 2. Update Recoil state (triggers all component updates)
            setUserRecoil(prev => ({ ...prev, user: updatedUser }));

            toast.dismiss(loadingToast);
            toast.success(t('profilePage.avatarUploaded'));

        } catch (error) {
            console.error("Failed to upload avatar", error);
            console.error("Error details:", error.response?.data);
            toast.dismiss(loadingToast);

            // Better error messages based on status
            if (error.response?.status === 401) {
                toast.error(t('profilePage.sessionExpired'));
                setTimeout(() => navigate(AppRoute.LOGIN), 2000);
            } else if (error.response?.status === 400) {
                toast.error(error.response?.data?.error || "Invalid file format");
            } else {
                toast.error(error.response?.data?.error || t('profilePage.failedToUpdate'));
            }
        } finally {
            setIsUploadingAvatar(false);
            // Reset input
            if (avatarInputRef.current) {
                avatarInputRef.current.value = '';
            }
        }
    };

    const [preferences, setPreferences] = React.useState({
        timezone: regionTimezones[region] || (language === 'Hindi' ? 'India (GMT+5:30)' : 'India (GMT+5:30)'),
        currency: 'INR (₹)'
    });

    // Update timezone when region changes
    React.useEffect(() => {
        if (regionTimezones[region]) {
            setPreferences(prev => ({ ...prev, timezone: regionTimezones[region] }));
        }
    }, [region, regionTimezones]);

    const [activeSection, setActiveSection] = React.useState(null);
    const [_selectionMode, setSelectionMode] = React.useState('language'); // 'language' or 'region'

    const location = useLocation();

    const _handleLanguageChange = async (lang) => {
        setLanguage(lang);
        setActiveSection(null);

        // Update Local Profile Settings State
        const newState = { ...userSettings, language: lang };
        setUserSettings(newState);
        localStorage.setItem('user_settings', JSON.stringify(newState));

        // Update Backend
        if (user?.token) {
            try {
                // Update Backend
                await axios.put(apis.user, { settings: newState }, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });

                // Update Global User State (Recoil + LocalStorage) to keep everything in sync
                const updatedUser = { ...user, settings: newState };
                setUserData(updatedUser); // Updates localStorage 'user'
                setUserRecoil(prev => ({ ...prev, user: updatedUser })); // Updates Recoil

            } catch (error) {
                console.error("Failed to save language preference", error);
            }
        }
    };

    // Automatically open language section if navigated from Sidebar indicator
    React.useEffect(() => {
        if (location.state?.openLanguage) {
            setActiveSection('language');
            setSelectionMode('language');
        }
    }, [location.state]);

    const currencies = ["USD ($)", "EUR (€)", "GBP (£)", "INR (₹)", "JPY (¥)", "CNY (¥)", "AUD (A$)", "CAD (C$)"];

    const handlePreferenceClick = (key) => {
        setActiveSection(activeSection === key ? null : key);
        if (key === 'language') setSelectionMode('language');
    };

    const nativeLanguageNames = {
        "English": "English - EN",
        "Hindi": "हिन्दी - HI",
        "Spanish": "Español - ES",
        "French": "Français - FR",
        "German": "Deutsch - DE",
        "Arabic": "العربية - AR",
        "Mandarin Chinese": "中文 (简体) - ZH",
        "Portuguese": "Português - PT",
        "Russian": "Русский - RU",
        "Japanese": "日本語 - JA",
        "Korean": "한국어 - KO",
        "Tamil": "தமிழ் - TA",
        "Bengali": "বাংলা - BN",
        "Gujarati": "ગુજરાતી - GU",
        "Turkish": "Türkçe - TR"
    };

    const _getNativeName = (lang) => nativeLanguageNames[lang] || lang;

    const translateTimezone = (tz) => {
        const keywords = t('timezoneKeywords');
        if (!keywords || typeof keywords !== 'object') return tz;

        let translated = tz;
        Object.entries(keywords).forEach(([en, local]) => {
            const regex = new RegExp(`\\b${en}\\b`, 'g');
            translated = translated.replace(regex, local);
        });
        return translated;
    };

    const preferenceItems = [
        { key: 'theme', label: t('theme'), value: theme === 'light' ? t('lightMode') : t('darkMode') },
        { key: 'timezone', label: t('timezone'), value: translateTimezone(preferences.timezone) },
        { key: 'currency', label: t('currency'), value: preferences.currency }
    ];

    return (
        <div className="h-full flex flex-col bg-secondary p-4 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full space-y-8 pb-12">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Identity & Profile */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card border border-border p-6 rounded-2xl md:rounded-[32px] shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                            {/* Avatar */}
                            <div className="relative mb-4 mt-4">
                                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-card shadow-xl overflow-hidden text-4xl font-bold">
                                    {user.avatar && !avatarError ? (
                                        <img
                                            src={user.avatar}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={() => setAvatarError(true)}
                                        />
                                    ) : (
                                        user.name ? user.name.charAt(0).toUpperCase() : <CircleUser className="w-16 h-16" />
                                    )}
                                </div>
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center shadow-lg border-2 border-border transition-all disabled:cursor-not-allowed"
                                >
                                    {isUploadingAvatar ? (
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Camera className="w-5 h-5 text-primary" />
                                    )}
                                </button>
                                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                            </div>

                            {/* Name & Email */}
                            <div className="w-full">
                                {isEditing ? (
                                    <div className="space-y-3 w-full">
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full text-center text-xl font-bold bg-secondary/50 border border-border rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-maintext"
                                        />
                                        <div className="flex justify-center gap-2">
                                            <button onClick={handleSaveProfile} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-2">
                                                <Check className="w-3 h-3" /> {t('save')}
                                            </button>
                                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-surface text-maintext border border-border rounded-lg text-xs font-bold flex items-center gap-2">
                                                <X className="w-3 h-3" /> {t('cancel')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="group relative inline-block text-center w-full">
                                        <h1 className="text-2xl font-black text-maintext flex items-center justify-center gap-2">
                                            {user.name}
                                            <button onClick={() => setIsEditing(true)} className="p-1 text-subtext hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </h1>
                                        <p className="text-subtext font-medium text-sm">{user.email}</p>
                                    </div>
                                )}
                            </div>

                            {/* Role Badge - Merged from Account Overview */}
                            <div className="mt-6 w-full pt-6 border-t border-border/50">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full border border-blue-500/20">
                                    <Crown className="w-4 h-4" />
                                    <span className="text-sm font-bold uppercase tracking-wide">
                                        {(user.role?.toLowerCase() === 'admin') ? t('adminRole') : (user.role?.toLowerCase() === 'developer') ? t('developerRole') : t('userRole')}
                                    </span>
                                </div>
                            </div>

                            {/* Logout Action */}
                            <div className="mt-8 w-full">
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-5 h-5" />
                                    {t('logout') || "Log Out"}
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Right Column: Settings Panel */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* 1. Account Preferences */}
                        <div className="bg-card border border-border rounded-2xl md:rounded-[32px] p-6 md:p-8">
                            <h2 className="text-lg font-bold text-maintext mb-6 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-primary" />
                                {t('accountPreferences')}
                            </h2>
                            <div className="space-y-2">
                                {preferenceItems.map((item) => (
                                    <div key={item.key} className={`relative ${activeSection === item.key ? 'z-20' : 'z-0'}`}>
                                        <div onClick={() => handlePreferenceClick(item.key)} className="flex justify-between items-center py-4 px-4 bg-secondary/30 border border-transparent hover:border-border/50 hover:bg-secondary/50 rounded-xl transition-all cursor-pointer group">
                                            <span className="text-sm font-semibold text-subtext group-hover:text-maintext transition-colors">{item.label}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-maintext">{item.value}</span>
                                                <ChevronRight className={`w-4 h-4 text-subtext group-hover:text-primary transition-all ${activeSection === item.key ? 'rotate-90' : ''}`} />
                                            </div>
                                        </div>

                                        {/* Dropdowns (Logic preserved) */}
                                        {item.key === 'theme' && activeSection === 'theme' && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                                                {['light', 'dark'].map(mode => (
                                                    <button key={mode} onClick={() => { setTheme(mode); setActiveSection(null); }} className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors flex justify-between items-center ${theme === mode ? 'bg-primary/5 text-primary' : 'text-maintext'}`}>
                                                        <span className="flex items-center gap-2">{mode === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}{mode === 'light' ? t('lightMode') : t('darkMode')}</span>
                                                        {theme === mode && <Star className="w-3 h-3 fill-primary" />}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}

                                        {item.key === 'timezone' && activeSection === 'timezone' && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden min-w-[300px]">
                                                <div className="p-3 bg-secondary/30 border-b border-border">
                                                    <h3 className="text-xs font-bold text-subtext uppercase">{t('selectTimezone')}</h3>
                                                </div>
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                    {allTimezones.map(tz => (
                                                        <button
                                                            key={tz}
                                                            onClick={() => {
                                                                setPreferences(prev => ({ ...prev, timezone: tz }));
                                                                setActiveSection(null);
                                                            }}
                                                            className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors flex justify-between items-center ${preferences.timezone === tz ? 'bg-primary/5 text-primary' : 'hover:bg-primary/5 text-maintext hover:text-primary'}`}
                                                        >
                                                            <span>{translateTimezone(tz)}</span>
                                                            {preferences.timezone === tz && (
                                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {item.key === 'currency' && activeSection === 'currency' && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                                                <div className="p-3 bg-secondary/30 border-b border-border">
                                                    <h3 className="text-xs font-bold text-subtext uppercase">{t('selectCurrency')}</h3>
                                                </div>
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                    {currencies.map(curr => (
                                                        <button
                                                            key={curr}
                                                            onClick={() => {
                                                                setPreferences(prev => ({ ...prev, currency: curr }));
                                                                setActiveSection(null);
                                                            }}
                                                            className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors flex justify-between items-center ${preferences.currency === curr ? 'bg-primary/5 text-primary' : 'hover:bg-primary/5 text-maintext hover:text-primary'}`}
                                                        >
                                                            <span>{curr}</span>
                                                            {preferences.currency === curr && (
                                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Security & Billing */}
                        <div className="bg-card border border-border rounded-2xl md:rounded-[32px] p-6 md:p-8">
                            <h2 className="text-lg font-bold text-maintext mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                {t('securityStatus')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button onClick={() => setShowPasswordModal(true)} className="p-5 bg-secondary/30 rounded-2xl border border-transparent hover:border-border/50 hover:bg-secondary/50 transition-all text-left group">
                                    <div className="flex justify-between items-start mb-2">
                                        <Lock className="w-5 h-5 text-subtext group-hover:text-primary transition-colors" />
                                        <ChevronRight className="w-4 h-4 text-subtext/50 group-hover:text-primary transition-colors" />
                                    </div>
                                    <p className="text-sm font-bold text-maintext">{t('changePassword')}</p>
                                    <p className="text-xs text-subtext mt-1">{t('passwordLastChanged') || "Update your password"}</p>
                                </button>

                                <button onClick={() => navigate(AppRoute.USER_TRANSACTIONS)} className="p-5 bg-secondary/30 rounded-2xl border border-transparent hover:border-border/50 hover:bg-secondary/50 transition-all text-left group">
                                    <div className="flex justify-between items-start mb-2">
                                        <FileText className="w-5 h-5 text-subtext group-hover:text-primary transition-colors" />
                                        <ChevronRight className="w-4 h-4 text-subtext/50 group-hover:text-primary transition-colors" />
                                    </div>
                                    <p className="text-sm font-bold text-maintext">{t('transactions')}</p>
                                    <p className="text-xs text-subtext mt-1">View billing history</p>
                                </button>
                            </div>
                        </div>

                        {/* 3. Danger Zone (Delete Account) */}
                        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl md:rounded-[32px] p-6 md:p-8">
                            <h2 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                {t('profilePage.dangerZone') || "Danger Zone"}
                            </h2>
                            <p className="text-sm text-subtext mb-6 max-w-xl leading-relaxed">
                                {t('profilePage.deleteAccountDescription') || "Permanently delete your account and all associated data. This action cannot be undone."}
                            </p>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center gap-2 font-bold text-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t('deleteAccount')}
                            </button>
                        </div>

                    </div>
                </div>
            </div >

            {/* Password Modal */}
            {
                showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-md rounded-3xl p-6 border border-border shadow-2xl relative">
                            <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full"><X className="w-5 h-5 text-subtext" /></button>

                            <div className="flex items-center justify-between mb-6 mr-8">
                                <h2 className="text-xl font-bold text-maintext">{t('changePassword')}</h2>
                                {/* Single Toggle for All Password Fields */}
                                <button
                                    type="button"
                                    onClick={() => setShowAllPasswords(!showAllPasswords)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all border border-border group"
                                >
                                    {showAllPasswords ? (
                                        <>
                                            <EyeOff className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-semibold text-maintext">{t('hideAll')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-semibold text-maintext">{t('showAll')}</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-subtext mb-2 block">{t('currentPassword')}</label>
                                    <input
                                        type={showAllPasswords ? 'text' : 'password'}
                                        placeholder={t('enterCurrentPassword')}
                                        required
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-maintext focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={passwordForm.current}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-subtext mb-2 block">{t('newPassword')}</label>
                                    <input
                                        type={showAllPasswords ? 'text' : 'password'}
                                        placeholder={t('enterNewPassword')}
                                        required
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-maintext focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={passwordForm.new}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-subtext mb-2 block">{t('confirmPassword')}</label>
                                    <input
                                        type={showAllPasswords ? 'text' : 'password'}
                                        placeholder={t('confirmNewPassword')}
                                        required
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-maintext focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={passwordForm.confirm}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 bg-secondary text-maintext font-bold rounded-xl hover:bg-secondary/80 transition-all">{t('cancel')}</button>
                                    <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all">{t('update')}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
};

export default Profile;
