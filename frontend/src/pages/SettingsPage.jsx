import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  User, 
  Globe, 
  ShieldCheck, 
  Bell, 
  MapPin, 
  Mail, 
  Phone, 
  Award, 
  Check, 
  Save, 
  Lock, 
  Languages, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: 'User', // STRICT COMPLIANCE: Display name must always be 'User'
    email: user?.email || 'beekeeper@honeychain.io',
    phone: '+91 98765 43210',
    role: user?.role === 'admin' ? 'KVIC Oversight Officer' : 'Lead Beekeeper & Hive Inspector',
    apiary: 'Coorg Shola Apiary, Madikeri, Karnataka',
    organization: user?.organization || 'KVIC Registered Honey Cooperative',
    memberId: 'HC-BEE-8821',
    certStatus: 'Active Certified Beekeeper',
  });

  const languagesOptions = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      subText: 'Default International Language',
      badge: 'EN'
    },
    {
      code: 'ta',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      subText: 'தமிழ் மொழி ஆதரவு (Tamil Support)',
      badge: 'தமிழ்'
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिंदी',
      subText: 'हिंदी भाषा सहायता (Hindi Support)',
      badge: 'हिंदी'
    }
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('settings')}</h1>
            <span className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
              SYSTEM CONFIG
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage user profile, multilingual preferences (English, Tamil, Hindi), and security credentials.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-2 bg-emerald-100 text-emerald-900 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: User Profile Details (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-6">

          {/* User Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-2xl border-2 border-white shadow-md">
                  U
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">User</h2>
                  <p className="text-xs text-amber-100 font-medium mt-0.5">{formData.role}</p>
                  <div className="mt-1 flex items-center space-x-2 text-[10px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/30 inline-flex">
                    <ShieldCheck className="w-3 h-3 text-amber-200" />
                    <span>{formData.certStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>{t('userProfile')}</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">ID: {formData.memberId}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Full Name - Strictly "User" */}
                <div>
                  <label className="block text-slate-600 font-bold uppercase text-[10px] tracking-wider mb-1">
                    {t('displayName')}
                  </label>
                  <input
                    type="text"
                    disabled
                    value="User"
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{t('standardProfileIdentity')}</span>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-slate-600 font-bold uppercase text-[10px] tracking-wider mb-1">
                    {t('emailAddress')}
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-slate-600 font-bold uppercase text-[10px] tracking-wider mb-1">
                    {t('contactPhone')}
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Role / Designation */}
                <div>
                  <label className="block text-slate-600 font-bold uppercase text-[10px] tracking-wider mb-1">
                    {t('roleDesignation')}
                  </label>
                  <div className="relative">
                    <Award className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Apiary Location */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-bold uppercase text-[10px] tracking-wider mb-1">
                    {t('primaryApiaryLoc')}
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.apiary}
                      onChange={e => setFormData({ ...formData, apiary: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Organization */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-bold uppercase text-[10px] tracking-wider mb-1">
                    {t('cooperativeOrg')}
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={e => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-2 text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('saveChanges')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Privacy & Security Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b pb-3 border-slate-100">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>{t('securityKeys')}</span>
            </h3>
            
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950">{t('cryptoSigningWallet')}</span>
                <span className="bg-emerald-200 text-emerald-900 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  {t('protectedPrivate')}
                </span>
              </div>
              <p className="text-slate-600 leading-snug">
                {t('privateKeyDesc')}
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Multilingual Language Options (English, Tamil, Hindi) */}
        <div className="space-y-6">

          {/* Language Selection Card */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow-xs p-6 space-y-4">
            <div className="border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                <Languages className="w-5 h-5 text-amber-600" />
                <span>{t('languageSupport')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('langDesc')}
              </p>
            </div>

            {/* Language Selector Cards */}
            <div className="space-y-3">
              {languagesOptions.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                        : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {lang.badge}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{lang.name}</span>
                          <span className="text-xs font-semibold text-amber-700">({lang.nativeName})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{lang.subText}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 text-xs space-y-1">
              <span className="font-bold text-amber-900 block flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('multilingualActive')}</span>
              </span>
              <p className="text-slate-600 text-[11px]">
                {t('multilingualDesc')}
              </p>
            </div>
          </div>

          {/* Quick Notification Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b pb-3 border-slate-100">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>{t('colonyHealthAlerts')}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50">
                <span className="font-semibold text-slate-700">{t('highRiskSms')}</span>
                <input type="checkbox" defaultChecked className="accent-amber-500 w-4 h-4 rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50">
                <span className="font-semibold text-slate-700">{t('dailyYieldSummary')}</span>
                <input type="checkbox" defaultChecked className="accent-amber-500 w-4 h-4 rounded" />
              </label>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
