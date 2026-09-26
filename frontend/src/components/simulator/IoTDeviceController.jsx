import React, { useState } from 'react';
import api from '../../services/api';
import { Cpu, Play, CheckCircle, AlertTriangle, X, RefreshCw } from 'lucide-react';

export default function IoTDeviceController({ isOpen, onClose, onDataUpdated }) {
  const [selectedHive, setSelectedHive] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleTriggerTick = async () => {
    setLoading(true);
    try {
      const res = await api.post('/simulator/tick', {
        hiveCode: selectedHive || undefined
      });
      setLastResult(res.data);
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      console.error('Failed to trigger simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  const scenarios = [
    { code: 'H001', label: 'H001 – Healthy', desc: '34.8°C brood temp, steady traffic, gaining weight' },
    { code: 'H002', label: 'H002 – Stable', desc: 'Standard baseline thermoregulation' },
    { code: 'H003', label: 'H003 – Increasing Risk', desc: 'Rising humidity >76%, flight decline, weight loss' },
    { code: 'H004', label: 'H004 – High Risk', desc: 'Dysregulation 38.5°C, high acoustic distress hum (345Hz)' },
    { code: 'H005', label: 'H005 – Recovery', desc: 'Post-intervention stabilizing towards 35.2°C' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-amber-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 animate-pulse" />
            <h3 className="font-bold text-base">IoT ESP32 Sensor Simulator Controller</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Emulate physical ESP32 nodes streaming multi-signal telemetry (temperature, humidity, weight scale, acoustic mic FFT, and optical flight counter) directly to the backend API.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Target Hive / Scenario</label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedHive('')}
                className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                  selectedHive === ''
                    ? 'border-amber-500 bg-amber-50 font-semibold text-amber-900'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="font-bold">All 5 Hives (Global Telemetry Tick)</div>
                <div className="text-[11px] text-slate-500">Streams simultaneous realistic multi-sensor telemetry</div>
              </button>

              {scenarios.map((sc) => (
                <button
                  key={sc.code}
                  type="button"
                  onClick={() => setSelectedHive(sc.code)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    selectedHive === sc.code
                      ? 'border-amber-500 bg-amber-50 font-semibold text-amber-900'
                      : 'border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{sc.label}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {sc.code}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{sc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleTriggerTick}
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Ingesting Telemetry...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Trigger Telemetry Stream Now</span>
              </>
            )}
          </button>

          {/* Last Result Box */}
          {lastResult && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 animate-fadeIn">
              <div className="font-bold text-slate-800 flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lastResult.message}</span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                {lastResult.results?.map((r) => (
                  <div key={r.hive_code} className="flex justify-between border-b border-slate-200/50 pb-0.5">
                    <span>{r.hive_code}: Score {r.score}/100</span>
                    <span className={r.risk_level === 'HIGH' ? 'text-red-600 font-bold' : (r.risk_level === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600')}>
                      {r.risk_level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
