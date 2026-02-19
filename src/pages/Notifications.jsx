import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Bell, Check, Trash2, Clock, ShieldAlert, BadgeInfo, BadgeCheck } from 'lucide-react';
import { getUserData, notificationsState } from '../userStore/userData';
import { useRecoilState } from 'recoil';
import apiService from '../services/apiService';

const Notifications = () => {
    const { t } = useLanguage();
    const [notifications, setNotifications] = useRecoilState(notificationsState);
    const [loading, setLoading] = useState(true);
    const token = getUserData()?.token;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await apiService.getNotifications();
                setNotifications(data);
            } catch (err) {
                console.error('Error fetching notifications:', err);
                // On error, we still clear loading to show the demo fallback
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchNotifications();
        }
    }, [token, setNotifications]);

    const markAsRead = async (id) => {
        try {
            await apiService.markNotificationRead(id);
            // Update global state immediately
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await apiService.deleteNotification(id);
            // Update global state immediately
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'ALERT': return <ShieldAlert className="w-6 h-6 text-red-500" />;
            case 'SUCCESS': return <BadgeCheck className="w-6 h-6 text-green-500" />;
            default: return <BadgeInfo className="w-6 h-6 text-blue-500" />;
        }
    };

    // Mapping for Legacy (Hardcoded in DB) Notifications to New Keys
    const legacyTranslationMap = {
        "New Subscriber": "notificationsPage.newSubscriber.title",
        "System Maintenance": "notificationsPage.systemMaintenance.title",
        "The system is currently in maintenance mode.": "notificationsPage.systemMaintenance.message",
        "System Restored": "notificationsPage.systemRestored.title",
        "Maintenance is complete. System is fully operational.": "notificationsPage.systemRestored.message",
        "Critical Alert": "notificationsPage.criticalAlert.title",
        "Global Kill-Switch Activated. All AI services are momentarily suspended.": "notificationsPage.criticalAlert.message",
        "Services Restored": "notificationsPage.servicesRestored.title",
        "Global Kill-Switch Deactivated. All AI services are now active.": "notificationsPage.servicesRestored.message",
    };

    const translateContent = (content) => {
        if (!content) return "";

        // 1. Check if it's already a valid key or in our legacy map
        const key = legacyTranslationMap[content] || content;
        const translated = t(key);

        // If translation happened (it's different from the key and doesn't look like a key path), return it
        if (translated !== key && !translated.startsWith('notificationsPage.')) {
            return translated;
        }

        // 2. Handle Dynamic Legacy Strings (e.g. "A user has subscribed to 'Manychats'")
        // Matches: "New Subscriber: A user has subscribed to 'Manychats'" OR "A user has subscribed to 'Manychats'"
        if (content.includes("A user has subscribed to")) {
            const prefix = "A user has subscribed to";
            // Extract the agent name by removing known prefixes and cleaning up quotes
            let agentName = content
                .replace("New Subscriber:", "")
                .replace("New Subscriber", "")
                .replace(prefix, "")
                .trim()
                .replace(/^'|'$/g, '')
                .replace(/^\.|.$/g, ''); // Remove trailing/leading dots if any

            const translatedPrefix = t("notificationsPage.newSubscriber.messagePrefix");

            // If we have a translation for the prefix, reconstruct the sentence
            if (translatedPrefix !== "notificationsPage.newSubscriber.messagePrefix") {
                return `${translatedPrefix} '${agentName}'`;
            }
        }

        // 3. Fallback: Return original
        return content;
    };

    return (
        <div className="p-4 md:p-8 h-full bg-secondary overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-maintext mb-2">{t("notificationsPage.title")}</h1>
                <p className="text-sm md:text-base text-subtext">{t("notificationsPage.subtitle")}</p>
            </div>

            <div className="grid gap-4 max-w-3xl">
                {/* 1. Welcome Notification - ALWAYS SHOW IMMEDIATELY */}
                <div className="bg-card p-6 rounded-2xl border border-primary/20 ring-1 ring-primary/5 shadow-sm flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                        <BadgeInfo className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-maintext">{t("notificationsPage.welcomeTitle")}</h3>
                        <p className="text-sm text-subtext leading-relaxed">
                            {t("notificationsPage.welcomeMessage")}
                        </p>
                    </div>
                </div>

                {/* 2. Real Notifications from Backend */}
                {notifications.map((notif) => (
                    <div
                        key={notif._id}
                        className={`bg-card p-5 rounded-2xl border transition-all flex items-start gap-4 shadow-sm hover:shadow-md ${!notif.isRead ? 'border-primary/30 ring-1 ring-primary/5' : 'border-border'
                            }`}
                    >
                        <div className={`p-3 rounded-xl ${notif.type === 'ALERT' ? 'bg-red-500/10' :
                            notif.type === 'SUCCESS' ? 'bg-green-500/10' : 'bg-blue-500/10'
                            }`}>
                            {getIcon(notif.type)}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-bold ${!notif.isRead ? 'text-maintext' : 'text-subtext'}`}>
                                    {translateContent(notif.title)}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-subtext flex items-center gap-1 bg-surface px-2 py-1 rounded-full border border-border">
                                        <Clock className="w-3 h-3" />
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={() => deleteNotification(notif._id)}
                                        className="p-1.5 hover:bg-red-500/10 text-subtext hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                        title={t("notificationsPage.delete")}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className={`text-sm leading-relaxed ${!notif.isRead ? 'text-subtext' : 'text-subtext/70'}`}>
                                {translateContent(notif.message)}
                            </p>

                            {!notif.isRead && (
                                <button
                                    onClick={() => markAsRead(notif._id)}
                                    className="mt-3 text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                                >
                                    <Check className="w-3 h-3" /> {t("notificationsPage.markRead")}
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* 3. Loading State (Subtle Spinner at bottom if needed) */}
                {loading && (
                    <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary/30"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
