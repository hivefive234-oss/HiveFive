import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Cpu, ArrowRight, CheckCircle2, Search, Award, Activity, QrCode, Hexagon, Building2 } from 'lucide-react';

export default function LandingPage() {
  const { t } = useLanguage();
  const [searchBatchId, setSearchBatchId] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchBatchId.trim()) {
      navigate(`/consumer/verify/${searchBatchId.trim()}`);
    }
  };

  const stages = [
    { label: 'MONITOR', desc: 'Continuous multi-signal IoT telemetry' },
    { label: 'ANALYZE', desc: 'Colony thermoregulation & vibration analysis' },
    { label: 'PREDICT', desc: 'Time-to-risk trajectory forecasting' },
    { label: 'EXPLAIN', desc: 'Transparent 5-point XAI breakdown' },
    { label: 'SIMULATE', desc: 'Comparative intervention decision support' },
    { label: 'RECOMMEND', desc: 'Domain-guided non-chemical action advice' },
    { label: 'ACT', desc: 'Beekeeper field intervention logging' },
    { label: 'RECOVERY', desc: 'Longitudinal outcome tracking' },
    { label: 'PASSPORT', desc: 'Immutable lifetime digital profile' },
    { label: 'HARVEST', desc: 'Honey extraction record creation' },
    { label: 'TRACE', desc: 'SHA-256 canonical cryptographic seal' },
    { label: 'BLOCKCHAIN', desc: 'EIP-compatible on-chain ledger proof' },
    { label: 'VERIFY', desc: 'Zero-login public consumer QR verification' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-amber-100 bg-gradient-to-b from-amber-100/50 via-amber-50/20 to-transparent">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <img 
              src="/hivefive-logo.png" 
              alt="HiveFive Logo" 
              className="w-24 h-24 object-contain drop-shadow-md hover:scale-105 transition-transform" 
            />
            <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-semibold border border-amber-300 shadow-xs">
              <span>{t('landingHeroTitle')}</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Hive<span className="text-amber-500">Five</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {t('landingHeroSub')}
          </p>

          {/* Verification Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex items-center bg-white p-2 rounded-2xl shadow-lg shadow-amber-500/10 border border-amber-200">
            <Search className="w-5 h-5 text-amber-500 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Enter Batch ID (e.g. BATCH-2026-001) to verify..."
              value={searchBatchId}
              onChange={(e) => setSearchBatchId(e.target.value)}
              className="w-full px-3 py-2 text-sm focus:outline-hidden text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shrink-0 shadow-sm"
            >
              Verify Record
            </button>
          </form>

          {/* Quick Action Links */}
          <div className="flex flex-wrap justify-center items-center gap-3 pt-4">
            <Link
              to="/dashboard"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md flex items-center space-x-2 transition-transform active:scale-95"
            >
              <span>Launch Beekeeper Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/verify/BATCH-2026-001"
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold px-6 py-3 rounded-xl shadow-xs flex items-center space-x-2 transition-colors"
            >
              <QrCode className="w-4 h-4 text-amber-700" />
              <span>Consumer Verification Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 13-Stage Architecture Flow */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">The 13-Stage HoneyChain Architecture</h2>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto">
            A comprehensive, scientifically grounded lifecycle from hive sensor telemetry to immutable cryptographic consumer verification.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {stages.map((st, i) => (
            <div key={st.label} className="p-3 bg-white rounded-xl border border-amber-100 shadow-xs text-center space-y-1 hover:border-amber-400 transition-colors">
              <div className="text-[10px] font-mono font-bold text-amber-600">STEP {String(i + 1).padStart(2, '0')}</div>
              <div className="font-extrabold text-xs text-slate-900 tracking-tight">{st.label}</div>
              <div className="text-[10px] text-slate-500 leading-tight">{st.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-12 bg-white border-t border-amber-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Beekeeper */}
          <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg">
                <Hexagon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Beekeeper Console</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitor live telemetry across apiaries, predict risk trajectories, evaluate XAI factor breakdowns, simulate management actions, and register honey harvest batches.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="text-xs font-bold text-amber-700 flex items-center space-x-1 hover:text-amber-900 pt-2"
            >
              <span>Access Beekeeper Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Admin / KVIC */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Admin & KVIC Oversight</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Regional apiculture cluster monitoring, high-risk hive oversight, beekeeper certifications, honey batch verification audit logs, and anomaly detection.
              </p>
            </div>
            <Link
              to="/admin"
              className="text-xs font-bold text-slate-800 flex items-center space-x-1 hover:text-slate-900 pt-2"
            >
              <span>View KVIC Regional Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Consumer */}
          <div className="p-6 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Public Consumer Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero-login QR code verification proving batch record integrity, canonical cryptographic SHA-256 matching on blockchain, origin flora, and extraction journey.
              </p>
            </div>
            <Link
              to="/verify/BATCH-2026-001"
              className="text-xs font-bold text-emerald-800 flex items-center space-x-1 hover:text-emerald-950 pt-2"
            >
              <span>Scan Public Batch Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 text-xs text-center border-t border-slate-800">
        <p className="font-medium text-slate-300">
          HONEYCHAIN – Predictive Hive Health, Smart Beekeeping & Honey Traceability Platform
        </p>
        <p className="mt-1 text-slate-500">
          Academic & Hackathon Research Architecture. Decoupled ML Engine • EIP Blockchain Ledger • ESP32 Ingestion.
        </p>
      </footer>
    </div>
  );
}
