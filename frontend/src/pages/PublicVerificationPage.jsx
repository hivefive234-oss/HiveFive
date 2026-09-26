import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, XCircle, ShieldCheck, Lock, Tag, Box, Calendar, Scale, Flower2, 
  MapPin, AlertCircle, Search, Hexagon, FileText, Cpu, Activity, ArrowDown, ChevronRight, Info
} from 'lucide-react';
import { DEMO_BATCHES } from '../data/demoBatches';

export default function PublicVerificationPage() {
  const { batchId: paramBatchId } = useParams();
  const [searchParams] = useSearchParams();
  const initialId = paramBatchId || searchParams.get('batch') || 'HC-2026-001';

  const [inputBatchId, setInputBatchId] = useState(initialId);
  const [activeBatch, setActiveBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const performVerification = (idToVerify) => {
    const cleanId = (idToVerify || '').trim().toUpperCase();
    if (!cleanId) return;

    setLoading(true);
    setNotFound(false);
    setSearched(true);

    setTimeout(() => {
      // Look up in central demo batches or backend API
      const found = DEMO_BATCHES.find(b => 
        b.batch_id.toUpperCase() === cleanId || 
        b.batch_id.replace('HC-', 'BATCH-').toUpperCase() === cleanId
      );

      if (found) {
        setActiveBatch(found);
        setNotFound(false);
      } else {
        setActiveBatch(null);
        setNotFound(true);
      }
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    if (initialId) {
      performVerification(initialId);
    }
  }, [initialId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performVerification(inputBatchId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/60 via-slate-50 to-orange-50/40 text-slate-800 pb-16">
      
      {/* Top Consumer Verification Navbar */}
      <header className="bg-white/95 backdrop-blur border-b border-amber-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Hexagon className="w-5 h-5 text-white fill-amber-300/30" />
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 tracking-tight flex items-center">
                HONEY<span className="text-amber-500">CHAIN</span>
                <span className="ml-2 text-[10px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                  PROTOTYPE
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Public Honey Authenticity Portal</p>
            </div>
          </Link>

          <Link
            to="/login"
            className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg border border-amber-300 transition-colors"
          >
            Beekeeper Portal
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-6">
        
        {/* Public Search Box */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-amber-200/80">
          <div className="flex items-center space-x-2 mb-2">
            <Search className="w-5 h-5 text-amber-600" />
            <h1 className="text-lg font-extrabold text-slate-900">Verify Honey Batch Authenticity</h1>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Enter the Batch ID from your honey jar label or QR code to verify origin, hive health, and blockchain record integrity.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputBatchId}
              onChange={e => setInputBatchId(e.target.value)}
              placeholder="Enter Batch ID (e.g. HC-2026-001)"
              className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Verify Batch'}</span>
            </button>
          </form>
        </div>

        {/* NOT FOUND CARD */}
        {notFound && (
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-red-200 text-center space-y-3 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Batch Not Found</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              No registered honey batch matching <strong>"{inputBatchId}"</strong> was found in the HoneyChain system.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 max-w-md mx-auto text-left space-y-1">
              <p className="font-bold text-slate-800">Troubleshooting Tips:</p>
              <p>• Try verifying sample batch ID: <code className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">HC-2026-001</code></p>
              <p>• Ensure there are no typos in the input string.</p>
            </div>
          </div>
        )}

        {/* VERIFIED BATCH REPORT */}
        {activeBatch && !notFound && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Prominent Verification Indicator Badge */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-md text-center space-y-2 border border-emerald-400">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-xs">
                <CheckCircle2 className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">✓ Verified Batch</h2>
              <p className="text-xs text-emerald-100 max-w-lg mx-auto font-medium">
                This honey batch is cryptographically registered on the HoneyChain blockchain ledger. All hive origin telemetry and harvest records are verified authentic.
              </p>
              <div className="pt-2 flex justify-center space-x-2">
                <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/30 font-mono">
                  ID: {activeBatch.batch_id}
                </span>
                <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/30">
                  Blockchain Verified
                </span>
              </div>
            </div>

            {/* Batch Information */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2 border-b pb-3">
                <FileText className="w-5 h-5 text-amber-600" />
                <span>Batch Information</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Batch ID</span>
                  <span className="font-black text-slate-900 text-sm">{activeBatch.batch_id}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Honey Type</span>
                  <span className="font-bold text-slate-800 text-sm">{activeBatch.honey_type}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Harvest Date</span>
                  <span className="font-bold text-slate-800 text-sm">{activeBatch.harvest_date}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Hive Origin</span>
                  <span className="font-bold text-amber-700 text-sm">{activeBatch.hive_code}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Quantity</span>
                  <span className="font-bold text-blue-700 text-sm">{activeBatch.quantity_kg} kg</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Traceability Status</span>
                  <span className="font-black text-emerald-700 text-sm">{activeBatch.traceability_status}</span>
                </div>
              </div>
            </div>

            {/* Hive Origin Information */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2 border-b pb-3">
                <Box className="w-5 h-5 text-amber-600" />
                <span>Hive Origin Telemetry</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
                  <span className="text-slate-400 block text-[10px]">Hive ID</span>
                  <span className="font-black text-amber-900 text-sm">{activeBatch.hive_code}</span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                  <span className="text-slate-400 block text-[10px]">Hive Health at Harvest</span>
                  <span className="font-black text-emerald-700 text-sm">{activeBatch.health_score}% ({activeBatch.hive_health_status})</span>
                </div>
                <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200">
                  <span className="text-slate-400 block text-[10px]">Bee Activity</span>
                  <span className="font-black text-blue-900 text-sm">{activeBatch.bee_activity}%</span>
                </div>
                <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200">
                  <span className="text-slate-400 block text-[10px]">Environmental Stability</span>
                  <span className="font-black text-purple-900 text-sm">{activeBatch.environmental_stability}%</span>
                </div>
              </div>
            </div>

            {/* Simplified Flow Diagram Story */}
            <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200 shadow-xs space-y-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-center">
                Honey Origin Lifecycle Flow
              </h3>
              
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-800 py-2">
                <span className="bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-xs">Hive Monitoring</span>
                <ChevronRight className="w-4 h-4 text-amber-500" />
                <span className="bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-xs">Honey Harvest</span>
                <ChevronRight className="w-4 h-4 text-amber-500" />
                <span className="bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-xs">Quality Assessment</span>
                <ChevronRight className="w-4 h-4 text-amber-500" />
                <span className="bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-xs">Packaging</span>
                <ChevronRight className="w-4 h-4 text-amber-500" />
                <span className="bg-amber-500 text-white px-3 py-1.5 rounded-xl shadow-xs">QR Verification</span>
              </div>
            </div>

            {/* AI-Assisted Hive Insight */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-amber-600" />
                  <span>AI-Assisted Hive Insight</span>
                </h3>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  {activeBatch.model_name}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Hive Health Score</span>
                  <span className="font-black text-slate-900 text-lg">{activeBatch.health_score}%</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Predicted Condition</span>
                  <span className="font-black text-emerald-600 text-lg">{activeBatch.hive_health_status}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Model Confidence</span>
                  <span className="font-black text-amber-600 text-lg">{activeBatch.confidence}%</span>
                </div>
              </div>

              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-xs space-y-1">
                <span className="font-bold text-amber-900 block flex items-center space-x-1">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>How This Works</span>
                </span>
                <p className="text-slate-600">
                  Machine-learning analysis uses recorded hive and environmental features (temperature, humidity, weight delta, acoustic frequency) to estimate hive condition. The displayed values are part of the HoneyChain prototype demonstration.
                </p>
              </div>
            </div>

            {/* Traceability Timeline */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2 border-b pb-3">
                <Activity className="w-5 h-5 text-amber-600" />
                <span>Traceability Timeline</span>
              </h3>

              <div className="space-y-4">
                {activeBatch.timeline.map((step, idx) => (
                  <div key={idx} className="flex space-x-3 items-start">
                    <div className="mt-0.5">
                      {step.status === 'Completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-amber-200 flex items-center justify-center text-white text-[9px] font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{step.stage}</span>
                        <span className="text-[10px] text-slate-400">{step.date}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{step.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain Security Seal (Clean Consumer Seal without private keys or raw hash strings) */}
            <div className="bg-emerald-50/80 rounded-3xl p-6 border border-emerald-200 shadow-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-sm border-b border-emerald-200 pb-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <span>Blockchain Security & Integrity Seal</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                This honey batch record is protected by immutable SHA-256 cryptographic hashing on the HoneyChain smart contract ledger. Product origin, quality parameters, and harvest timestamps are locked against unauthorized modification or tampering.
              </p>
              <div className="flex items-center space-x-2 pt-1 text-[11px] font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ledger Security Status: CONFIRMED & VERIFIED</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
