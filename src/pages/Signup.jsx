import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Cpu, Mail, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';
import { AppRoute, apis } from '../types';
import axios from 'axios';
import { setUserData } from '../userStore/userData.js';
import { logo } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { GoogleLogin } from '@react-oauth/google';
import { useSetRecoilState } from 'recoil';
import { userData as userDataAtom } from '../userStore/userData';


import PolicyModal from '../Components/PolicyModal';

const Signup = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const setUserRecoil = useSetRecoilState(userDataAtom);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(null);

  const handleGoogleSuccess = async (response) => {
    try {
      setIsLoading(true);
      const res = await axios.post(apis.googleAuth, {
        credential: response.credential
      });
      setUserData(res.data);
      setUserRecoil({ user: res.data });
      localStorage.setItem("userId", res.data.id);
      localStorage.setItem("token", res.data.token);
      navigate(AppRoute.DASHBOARD);
    } catch (err) {
      console.error("Google Signup Error:", err);
      setError(err.response?.data?.error || "Google registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const payLoad = {
    name, email, password
  }
  const handleSubmit = (e) => {
    setIsLoading(true)
    e.preventDefault();
    axios.post(apis.signUp, payLoad).then((res) => {
      setUserData(res.data)
      navigate(AppRoute.E_Verification);

    }).catch((err) => {
      console.log(err);
      setError(err.response.data.error)
    }).finally(() => {
      setIsLoading(false)

    })

  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-surface">
      <div className="relative z-10 w-full max-w-md">

        {/* Title */}
        <div className=" text-center">
          <div className="inline-block rounded-full  w-25 ">
            {/* <Cpu className="w-8 h-8 text-primary" /> */}
            <img src={logo} alt="" />
          </div>
          <h2 className="text-3xl font-bold text-maintext mb-2">{t('auth.createAccount')}</h2>
          <p className="text-subtext">{t('auth.joinSubtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border p-8 rounded-3xl shadow-xl">

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-maintext ml-1">{t('auth.fullName')}</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-subtext" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                  className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-maintext ml-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-subtext" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-maintext ml-1">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-subtext" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>


            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-2">
              <div className="relative flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary/25"
                />
              </div>
              <label htmlFor="terms" className="text-sm text-subtext leading-tight">
                {t('auth.agreeToTerms').split('{terms}')[0]}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setPolicyOpen('terms'); }}
                  className="text-primary hover:underline font-medium"
                >
                  {t('policies.terms.title')}
                </button>
                {t('auth.agreeToTerms').split('{terms}')[1]?.split('{privacy}')[0] || ' and '}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setPolicyOpen('privacy'); }}
                  className="text-primary hover:underline font-medium"
                >
                  {t('policies.privacy.title')}
                </button>
                {t('auth.agreeToTerms').split('{privacy}')[1] || '.'}
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !agreedToTerms}
              className="w-full py-3.5 bg-primary rounded-xl font-bold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? t('auth.creatingAccount') : t('auth.signUp')}
            </button>

            {/* Google Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-subtext">{t('auth.orContinueWith')}</span>
              </div>
            </div>

            {/* Google Signup Button */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError("Google Signup Failed");
                }}
                useOneTap
                theme="filled_blue"
                shape="pill"
                size="large"
                text="signup_with"
                width={380}
              />
            </div>
          </form>

          {/* Footer Login Link */}
          <div className="mt-8 text-center text-sm text-subtext">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('auth.signIn')}
            </Link>
          </div>
        </div>

        <Link
          to="/"
          className="mt-8 flex items-center justify-center gap-2 text-subtext hover:text-maintext transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('auth.backToHome')}
        </Link>

        {/* Policy Modal */}
        <PolicyModal
          isOpen={!!policyOpen}
          onClose={() => setPolicyOpen(null)}
          type={policyOpen}
        />
      </div>
    </div>
  );
};

export default Signup;