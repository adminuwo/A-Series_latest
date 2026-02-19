import React, { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Mail, Loader, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { apis } from '../types';
import { useLanguage } from '../context/LanguageContext';

const ForgotPassword = () => {
    const { t, language } = useLanguage();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState(''); // Token received after OTP verify
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            // Pass language code to backend
            await axios.post(apis.sendForgotOTP, { email, lang: language });
            // setMessage(response.data.message); 
            setMessage(t('auth.otpSentSuccess'));
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const response = await axios.post(apis.verifyForgotOTP, { email, otp });
            // setMessage(response.data.message);
            setMessage(t('auth.otpVerifiedSuccess'));
            setResetToken(response.data.resetToken);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            await axios.post(apis.resetPasswordOTP, {
                email,
                resetToken,
                newPassword,
                lang: language
            });
            // setMessage(response.data.message);
            setMessage(t('auth.passwordResetSuccess'));

            // Redirect after success (optional delay)
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-surface">
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white border border-border p-8 rounded-3xl shadow-xl">
                    <Link to="/login" className="inline-flex items-center text-subtext hover:text-maintext mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('auth.signIn')}
                    </Link>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-maintext mb-2">
                            {step === 1 && t('auth.forgotPassword')}
                            {step === 2 && t('auth.verifyOTP')}
                            {step === 3 && t('auth.resetPassword')}
                        </h1>
                        <p className="text-subtext">
                            {step === 1 && t('auth.enterEmail')}
                            {step === 2 && `${t('auth.otpSent')} ${email}`}
                            {step === 3 && t('auth.createPassword')}
                        </p>
                    </div>

                    {message && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm text-center">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Email Form */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-maintext mb-2 ml-1">{t('auth.email')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-subtext" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-primary rounded-xl font-bold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? <><Loader className="w-5 h-5 animate-spin mr-2" /> {t('auth.sendingOTP')}</> : t('auth.sendOTP')}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Form */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-maintext mb-2 ml-1">OTP</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-center text-2xl tracking-[0.5em] font-mono text-maintext focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-primary rounded-xl font-bold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? <><Loader className="w-5 h-5 animate-spin mr-2" /> {t('auth.verifying')}</> : t('auth.verifyOTP')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-sm text-primary hover:underline font-semibold"
                            >
                                {t('auth.changeEmail')}
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password Form */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-maintext mb-2 ml-1">{t('auth.newPassword')}</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 pr-10 text-maintext focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                        placeholder={t('auth.newPassword')}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-subtext hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-maintext mb-2 ml-1">{t('auth.confirmPassword')}</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 pr-10 text-maintext focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                        placeholder={t('auth.confirmPassword')}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3.5 text-subtext hover:text-primary transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-primary rounded-xl font-bold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? <><Loader className="w-5 h-5 animate-spin mr-2" /> {t('auth.resetting')}</> : t('auth.resetPassword')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ForgotPassword;
