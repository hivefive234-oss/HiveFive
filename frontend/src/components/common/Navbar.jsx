import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, Cpu, LogOut, User, CheckCircle, Settings, Languages } from 'lucide-react';

export default function Navbar({ onOpenSimulator }) {
  const { user, logout, switchDemoRole } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-amber-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Header with HoneyChain Official Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img 
            src="/hivefive-logo.png" 
            alt="HoneyChain Logo" 
            className="w-11 h-11 object-contain rounded-xl drop-shadow-xs group-hover:scale-105 transition-transform" 
          />
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center">
              HONEY<span className="text-amber-500">CHAIN</span>
            </span>
            <p className="text-[10px] text-slate-400 -mt-0.5 font-medium hidden sm:block">
              Predictive Hive Health & Honey Traceability
            </p>
          </div>
        </Link>

        {/* Right actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Quick Language Selector */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <Languages className="w-3.5 h-3.5 text-amber-600 ml-1" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded font-bold text-[11px] transition-colors ${language === 'en' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-1.5 py-0.5 rounded font-bold text-[11px] transition-colors ${language === 'ta' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Tamil தமிழ்"
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-1.5 py-0.5 rounded font-bold text-[11px] transition-colors ${language === 'hi' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Hindi हिंदी"
            >
              हिंदी
            </button>
          </div>

          {/* IoT Simulator Trigger Button */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-semibold shadow-xs transition-colors"
            title="Open IoT Sensor Simulator Controller"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="hidden md:inline">IoT Simulator</span>
          </button>

          {/* Role Indicator & Switcher */}
          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden lg:flex items-center space-x-1 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                <span className="text-slate-400">Role:</span>
                <span className="font-semibold uppercase tracking-wider text-amber-700">
                  {user.role === 'kvic' ? 'KVIC Officer' : user.role}
                </span>
              </div>

              {/* User badge - Explicitly "User" + Link to Settings */}
              <Link
                to="/settings"
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-amber-50 transition-colors"
                title="Settings & Profile"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs border border-amber-300">
                  U
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">User</div>
                  <div className="text-[10px] text-amber-700 leading-tight flex items-center space-x-1">
                    <Settings className="w-2.5 h-2.5 inline" />
                    <span>Settings</span>
                  </div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/consumer/verify/HC-2026-001"
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5"
              >
                Consumer Verify
              </Link>
              <Link
                to="/login"
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
