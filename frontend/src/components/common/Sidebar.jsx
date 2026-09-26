import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  LayoutDashboard, 
  Layers, 
  MapPin, 
  Activity, 
  FileCheck, 
  Package, 
  Settings,
  ShieldCheck, 
  Cpu, 
  ExternalLink 
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'admin' || user?.role === 'kvic';

  const navItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/hives', label: t('hives'), icon: Layers },
    { to: '/apiaries', label: t('apiaries'), icon: MapPin },
    { to: '/recovery', label: t('recovery'), icon: Activity },
    { to: '/batches', label: t('batches'), icon: Package },
    { to: '/settings', label: t('settingsNav'), icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: t('adminNav'), icon: ShieldCheck });
  }

  return (
    <aside className="w-64 bg-white border-r border-amber-100 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Colony Health Platform
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20 font-semibold'
                        : 'text-slate-600 hover:bg-amber-50/70 hover:text-amber-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Public Consumer link */}
        <div className="pt-4 border-t border-slate-100">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {t('consumerNav')}
          </p>
          <NavLink
            to="/consumer/verify/HC-2026-001"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-amber-50 hover:text-amber-900 transition-colors border border-amber-200/50"
          >
            <div className="flex items-center space-x-2">
              <span className="text-amber-600 font-bold">QR</span>
              <span>Consumer Verification</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </NavLink>
        </div>
      </div>

      {/* Model & Architecture Badge */}
      <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 text-xs space-y-1">
        <div className="flex items-center justify-between font-bold text-amber-900">
          <span>AI & Blockchain</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
            SYNCED
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          Decoupled FastAPI ML Engine + Ethers.js SHA-256 Registry.
        </p>
      </div>
    </aside>
  );
}
