import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getSupabaseActions, getSupabaseHives, insertSupabaseAction } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import {
  Plus, CheckCircle2, AlertTriangle, Clock, ArrowRight,
  Activity, Leaf, X, TrendingUp, TrendingDown, Minus
} from 'lucide-react';

// Status badge config
const STATUS_CONFIG = {
  recovering: {
    label: 'Recovering',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: TrendingUp,
    dot: 'bg-blue-500'
  },
  stable: {
    label: 'Stable',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: CheckCircle2,
    dot: 'bg-emerald-500'
  },
  declining: {
    label: 'Needs Attention',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: TrendingDown,
    dot: 'bg-red-500'
  },
  default: {
    label: 'In Progress',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Clock,
    dot: 'bg-amber-500'
  }
};

// Map action types to plain beekeeper language
const ACTION_LABELS = {
  'Ventilation Screen Adjustment': 'Opened ventilation screens to reduce heat and humidity build-up inside the hive.',
  'Physical Brood Frame Inspection': 'Checked brood frames by hand to look at egg patterns and queen activity.',
  'Emergency Supplemental Syrup / Patty': 'Fed the colony sugar syrup or a protein patty to support their energy and numbers.',
  'Hive Shading & Entrance Reducer Cleared': 'Added shade cover and cleared any blockage at the hive entrance.',
  'Queen Cell / Brood Pattern Check': 'Inspected for new queen cells and looked at the brood pattern health.',
  'Ventilation Adjustment': 'Adjusted hive vents to improve airflow and moisture levels inside.',
};

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.default;
}

function HealthBar({ score, colorClass }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-500">Health</span>
        <span className={colorClass}>{score}/100</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function RecoveryTrackingPage() {
  const { t } = useLanguage();
  const [actions, setActions] = useState([]);
  const [hives, setHives] = useState([]);
  const [showActionForm, setShowActionForm] = useState(false);
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  // New action form
  const [targetHiveId, setTargetHiveId] = useState('');
  const [actionType, setActionType] = useState('Ventilation Screen Adjustment');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Recovery form
  const [recoveryScore, setRecoveryScore] = useState(80);
  const [conditionStatus, setConditionStatus] = useState('recovering');
  const [outcomeNotes, setOutcomeNotes] = useState('');

  const fetchData = async () => {
    try {
      let actionsData = await getSupabaseActions();
      let hivesData = await getSupabaseHives();
      
      if (actionsData) {
        actionsData = actionsData.map(a => ({
          ...a,
          hive: a.hives ? { hive_code: a.hives.hive_code } : null,
          action_date: a.action_timestamp ? new Date(a.action_timestamp).toLocaleDateString() : '2026-09-18',
          recoveryRecords: a.recoveryRecords || []
        }));
      }
      
      if (hivesData) {
        hivesData = hivesData.map(h => ({
          ...h,
          current_risk_level: h.status === 'ACTIVE' ? 'LOW' : (h.status === 'ATTENTION' || h.status === 'RECOVERING' ? 'MEDIUM' : 'LOW'),
          current_health_score: h.status === 'ACTIVE' ? 90 : (h.status === 'ATTENTION' ? 65 : (h.status === 'RECOVERING' ? 72 : 90)),
          queen_status: 'Active – laying pattern observed',
          apiary: { name: h.location }
        }));
      }

      if (!actionsData || !hivesData) {
        const [actRes, hiveRes] = await Promise.all([
          !actionsData ? api.get('/actions') : Promise.resolve(null),
          !hivesData ? api.get('/hives') : Promise.resolve(null)
        ]);
        if (!actionsData) actionsData = actRes?.data?.actions || [];
        if (!hivesData) hivesData = hiveRes?.data?.hives || [];
      }

      setActions(actionsData);
      setHives(hivesData);
      if (hivesData?.length > 0) {
        setTargetHiveId(hivesData[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRecordAction = async (e) => {
    e.preventDefault();
    try {
      const inserted = await insertSupabaseAction({ hive_id: targetHiveId, action_type: actionType, observation: reason, notes });
      if (!inserted) {
        await api.post('/actions', { hive_id: targetHiveId, action_type: actionType, reason, notes });
      }
      setShowActionForm(false);
      setReason('');
      setNotes('');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleRecordRecovery = async (e) => {
    e.preventDefault();
    try {
      const targetAction = actions.find(a => a.id === selectedActionId);
      await api.post('/actions/recovery', {
        action_id: selectedActionId,
        hive_id: targetAction?.hive_id,
        health_score: recoveryScore,
        condition_status: conditionStatus,
        outcome_notes: outcomeNotes
      });
      setShowRecoveryForm(false);
      setOutcomeNotes('');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const openFollowUp = (actionId) => {
    setSelectedActionId(actionId);
    setRecoveryScore(80);
    setConditionStatus('recovering');
    setOutcomeNotes('');
    setShowRecoveryForm(true);
  };

  // Summary counts
  const totalActions = actions.length;
  const recovering = actions.filter(a =>
    a.recoveryRecords?.some(r => r.condition_status === 'recovering')
  ).length;
  const recovered = actions.filter(a =>
    a.recoveryRecords?.some(r => r.condition_status === 'stable')
  ).length;
  const needsAttention = actions.filter(a =>
    a.recoveryRecords?.some(r => r.condition_status === 'declining')
  ).length;

  return (
    <div className="space-y-6 pb-12">

      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('recoveryTitle')}</h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {t('recoverySub')}
          </p>
        </div>
        <button
          onClick={() => setShowActionForm(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('logNewAction')}</span>
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('totalActions'), value: totalActions, color: 'text-slate-900', border: 'border-slate-200' },
          { label: t('recovering'), value: recovering, color: 'text-blue-600', border: 'border-blue-200' },
          { label: t('stableRecovered'), value: recovered, color: 'text-emerald-600', border: 'border-emerald-200' },
          { label: t('needsAttention'), value: needsAttention, color: 'text-red-600', border: 'border-red-200' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`bg-white p-4 rounded-2xl border ${border} shadow-xs text-center`}>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="space-y-4">
        {actions.length === 0 && (
          <div className="bg-white p-10 rounded-2xl border border-dashed border-amber-300 text-center space-y-2">
            <Leaf className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-sm font-bold text-slate-600">{t('emptyStateMsg')}</p>
            <p className="text-xs text-slate-400">{t('logNewAction')}</p>
          </div>
        )}

        {actions.map((act) => {
          const latestRecord = act.recoveryRecords?.slice(-1)[0];
          const statusCfg = getStatusConfig(latestRecord?.condition_status);
          const StatusIcon = statusCfg.icon;
          const isExpanded = expandedCard === act.id;
          const plainActionLabel = ACTION_LABELS[act.action_type] || act.notes || act.action_type;
          const beforeScore = 55;
          const afterScore = latestRecord?.health_score ?? null;

          return (
            <div key={act.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">

              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5">
                <div className="flex items-center space-x-3">
                  {/* Hive badge */}
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-extrabold text-sm border border-amber-200 shrink-0">
                    {act.hive?.hive_code || 'H001'}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-bold text-slate-900 text-sm">{act.action_type}</span>
                      <span className={`inline-flex items-center space-x-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusCfg.label}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Logged on {act.action_date} &nbsp;·&nbsp; {act.recoveryRecords?.length || 0} check{act.recoveryRecords?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <button
                    onClick={() => openFollowUp(act.id)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
                  >
                    {t('logFollowUp')}
                  </button>
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : act.id)}
                    className="text-slate-400 hover:text-amber-600 p-1.5 rounded-lg border border-slate-200 transition-colors"
                    title={isExpanded ? 'Collapse' : 'View details'}
                  >
                    <ArrowRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50/60">

                  {/* What happened + what beekeeper did */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('whyActionTaken')}</span>
                      <p className="text-sm font-medium text-slate-800 leading-snug">{act.observation || act.reason || 'Colony showed signs of stress or declining health.'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('whatBeekeeperDid')}</span>
                      <p className="text-sm font-medium text-slate-800 leading-snug">{plainActionLabel}</p>
                    </div>
                  </div>

                  {/* Health change visual */}
                  {afterScore !== null && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('healthProgress')}</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-500">{t('beforeIntervention')}</span>
                          <HealthBar score={beforeScore} colorClass="text-amber-600" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-500">{t('afterFollowUp')}</span>
                          <HealthBar score={afterScore} colorClass={afterScore >= 75 ? 'text-emerald-600' : afterScore >= 50 ? 'text-amber-600' : 'text-red-600'} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Follow-up records */}
                  {act.recoveryRecords?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Follow-up Checks ({act.recoveryRecords.length})</span>
                      </span>

                      {act.recoveryRecords.map((rec) => {
                        const recCfg = getStatusConfig(rec.condition_status);
                        return (
                          <div
                            key={rec.id}
                            className="bg-white p-3.5 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold text-slate-800">
                                Check date: {rec.follow_up_date} &nbsp;·&nbsp; Health score: <span className="text-emerald-700">{rec.health_score}/100</span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-snug">{rec.outcome_notes}</p>
                            </div>
                            <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border whitespace-nowrap ${recCfg.color}`}>
                              {recCfg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {act.recoveryRecords?.length === 0 && (
                    <div className="text-xs text-slate-400 italic text-center py-2">
                      No follow-up checks logged yet. Click "+ Log Follow-up" to add one.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── New Action Modal ── */}
      {showActionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-amber-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">{t('logNewAction')}</h3>
              <button onClick={() => setShowActionForm(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordAction} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Which hive?</label>
                <select
                  value={targetHiveId}
                  onChange={e => setTargetHiveId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-amber-500 focus:outline-none"
                >
                  {hives.map(h => (
                    <option key={h.id} value={h.id}>{h.hive_code} — {h.current_risk_level} Risk</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('whatBeekeeperDid')}</label>
                <select
                  value={actionType}
                  onChange={e => setActionType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-amber-500 focus:outline-none"
                >
                  <option value="Ventilation Screen Adjustment">Ventilation Screen Adjustment</option>
                  <option value="Physical Brood Frame Inspection">Brood Frame Inspection</option>
                  <option value="Emergency Supplemental Syrup / Patty">Emergency Feeding (Syrup / Patty)</option>
                  <option value="Hive Shading & Entrance Reducer Cleared">Hive Shading & Entrance Clear</option>
                  <option value="Queen Cell / Brood Pattern Check">Queen Cell & Brood Check</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('whyActionTaken')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Colony showed high humidity and bees clustering near entrance"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Additional notes <span className="font-normal text-slate-400">(optional)</span></label>
                <textarea
                  rows="2"
                  placeholder="e.g. Cleared debris from bottom board, added upper vent spacer..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button type="button" onClick={() => setShowActionForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">{t('cancel')}</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors">{t('saveAction')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Follow-up Recovery Modal ── */}
      {showRecoveryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-emerald-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">{t('logFollowUp')}</h3>
              <button onClick={() => setShowRecoveryForm(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordRecovery} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Colony Health Score (0–100)</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={recoveryScore}
                    onChange={e => setRecoveryScore(Number(e.target.value))}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="font-black text-emerald-700 text-base w-10 text-right">{recoveryScore}</span>
                </div>
                <div className="mt-1">
                  <HealthBar score={recoveryScore} colorClass={recoveryScore >= 75 ? 'text-emerald-600' : recoveryScore >= 50 ? 'text-amber-600' : 'text-red-600'} />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Colony Condition</label>
                <select
                  value={conditionStatus}
                  onChange={e => setConditionStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="recovering">Recovering — colony is improving</option>
                  <option value="stable">Stable — problem has been resolved</option>
                  <option value="declining">Needs Attention — still declining</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Observation Notes</label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Temperature back to 35°C. Bees are flying actively again."
                  value={outcomeNotes}
                  onChange={e => setOutcomeNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button type="button" onClick={() => setShowRecoveryForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">{t('cancel')}</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors">{t('saveCheck')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
