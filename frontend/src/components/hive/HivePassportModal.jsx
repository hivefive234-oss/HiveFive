import React from 'react';
import { X, ShieldCheck, Calendar, MapPin, Award, Layers, History, Activity } from 'lucide-react';

export default function HivePassportModal({ passport, isOpen, onClose }) {
  if (!isOpen || !passport) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-amber-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">HIVE DIGITAL PASSPORT</h3>
              <p className="text-xs text-amber-100 font-mono">{passport.passport_id} • Hive {passport.hive_code}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Passport Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Core Profile Card */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Bee Species</div>
              <div className="font-bold text-slate-800 text-sm mt-0.5">{passport.bee_species}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Box Architecture</div>
              <div className="font-bold text-slate-800 text-sm mt-0.5">{passport.box_type}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Installation Date</div>
              <div className="font-bold text-slate-800 text-sm mt-0.5">{passport.installation_date}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Current Health / Risk</div>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {passport.current_health_score}/100 ({passport.current_risk_level})
              </div>
            </div>
          </div>

          {/* Apiary & Geography */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Apiary Geographic Profile</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
              <div><strong>Name:</strong> {passport.apiary?.name}</div>
              <div><strong>Location:</strong> {passport.apiary?.location}</div>
              <div><strong>Flora:</strong> {passport.apiary?.flora_type}</div>
            </div>
          </div>

          {/* Longitudinal Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 text-center bg-white">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Queen Observations</div>
              <div className="text-lg font-extrabold text-amber-600 mt-1">
                {passport.longitudinal_summary?.total_queen_observations}
              </div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 text-center bg-white">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Brood Inspections</div>
              <div className="text-lg font-extrabold text-amber-600 mt-1">
                {passport.longitudinal_summary?.total_brood_inspections}
              </div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 text-center bg-white">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Actions Recorded</div>
              <div className="text-lg font-extrabold text-amber-600 mt-1">
                {passport.longitudinal_summary?.total_actions_recorded}
              </div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 text-center bg-white">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Lifetime Harvest</div>
              <div className="text-lg font-extrabold text-amber-600 mt-1">
                {passport.longitudinal_summary?.total_honey_yield_kg} kg
              </div>
            </div>
          </div>

          {/* Action & Recovery Timeline */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Intervention & Recovery History</span>
            </div>
            <div className="space-y-2">
              {passport.timeline?.actions_and_recoveries?.length > 0 ? (
                passport.timeline.actions_and_recoveries.map((act) => (
                  <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{act.action_type}</span>
                      <span className="text-slate-400">{act.action_date}</span>
                    </div>
                    <p className="text-slate-600">{act.reason}</p>
                    {act.recoveryRecords?.map((rec) => (
                      <div key={rec.id} className="mt-1 pl-3 border-l-2 border-emerald-500 text-[11px] text-emerald-900 bg-emerald-50/60 p-1.5 rounded">
                        <strong>Follow-up ({rec.follow_up_date}):</strong> Score: {rec.health_score} • Status: {rec.condition_status} • {rec.outcome_notes}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">No historical interventions recorded yet.</p>
              )}
            </div>
          </div>

          {/* Associated Honey Batches */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <History className="w-4 h-4 text-amber-600" />
              <span>Cryptographically Sealed Honey Batches</span>
            </div>
            <div className="space-y-2">
              {passport.timeline?.batches?.map((b) => (
                <div key={b.id} className="p-3 bg-amber-50/40 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{b.batch_id}</div>
                    <div className="text-slate-500 text-[11px]">{b.floral_source} • {b.quantity_kg} kg • Harvested {b.harvest_date}</div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 italic border-t border-slate-100 pt-3">
            {passport.scientific_disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
}
