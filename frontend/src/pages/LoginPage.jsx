import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Hexagon, Sparkles, Building2, UserCheck, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showDirectForm, setShowDirectForm] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  
  const { switchDemoRole, login, allowedEmail } = useAuth();
  const navigate = useNavigate();

  const handleDemoAccess = async (role = 'beekeeper') => {
    setLoading(true);
    setAuthError('');
    try {
      await switchDemoRole(role);
      navigate(role === 'beekeeper' ? '/dashboard' : '/admin');
    } catch (err) {
      console.error('Demo access failed:', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      await login(emailInput || allowedEmail, passwordInput);
      navigate('/dashboard');
    } catch (err) {
      setAuthError(t('errorMsg'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-amber-200/80 max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <img 
            src="/hivefive-logo.png" 
            alt="HiveFive Logo" 
            className="w-16 h-16 object-contain mx-auto drop-shadow-md hover:scale-105 transition-transform" 
          />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('sihDemoAccess')}</h2>
          <p className="text-xs text-slate-500 font-medium">
            {t('sihDemoSub')}
          </p>
        </div>

        {/* Demo Notice */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 text-xs space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t('zeroPasswordAccess')}</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            {t('zeroPasswordDesc')}
          </p>
        </div>

        {/* One-Click Continue Button */}
        <button
          onClick={() => handleDemoAccess('beekeeper')}
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold py-3 px-4 rounded-2xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50 active:scale-98"
        >
          <span>{loading ? t('enteringConsole') : t('continueToConsole')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Alternative Role Selector */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            {t('choosePerspective')}
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoAccess('beekeeper')}
              className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-left font-bold text-slate-800 flex items-center space-x-2"
            >
              <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('beekeeperMode')}</span>
            </button>

            <button
              onClick={() => handleDemoAccess('admin')}
              className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-left font-bold text-slate-800 flex items-center space-x-2"
            >
              <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('adminMode')}</span>
            </button>
          </div>
        </div>

        {/* Optional Direct Gmail Account Login Accordion */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDirectForm(!showDirectForm)}
            className="text-[11px] text-slate-500 hover:text-amber-700 font-semibold w-full text-center block"
          >
            {showDirectForm ? '▲ Hide Direct Login' : '▼ Operator Gmail Login'}
          </button>

          {showDirectForm && (
            <form onSubmit={handleDirectLogin} className="mt-3 space-y-3 pt-2 text-xs animate-in fade-in">
              {authError && (
                <div className="text-red-600 text-[11px] font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
                  {authError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gmail / Authorized Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder={allowedEmail}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2 rounded-xl text-xs transition-colors"
              >
                Sign In
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
