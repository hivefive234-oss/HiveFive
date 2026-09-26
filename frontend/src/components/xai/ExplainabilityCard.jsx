import React from 'react';
import { HelpCircle, AlertTriangle, ArrowRight, ShieldAlert, Sparkles, Stethoscope } from 'lucide-react';

export default function ExplainabilityCard({ explanation, riskLevel = 'LOW' }) {
  if (!explanation) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs italic bg-white rounded-2xl border border-slate-200">
        Loading explainable AI reasoning...
      </div>
    );
  }

  const {
    whatHappened,
    whyIsRiskIncreasing,
    dataCausedAlert,
    whatMayHappenIfTrendContinues,
    whatShouldBeekeeperCheckNext,
    scientificDisclaimer
  } = explanation;

  return (
    <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Explainable AI (XAI) Recommendation Analysis</h4>
            <p className="text-[11px] text-slate-400">Transparent rationale for model-estimated risk alerts</p>
          </div>
        </div>
        <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${
          riskLevel === 'HIGH' ? 'bg-red-100 text-red-800 border-red-200' :
          (riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200')
        }`}>
          Risk: {riskLevel}
        </span>
      </div>

      {/* 5 Core Explainability Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        {/* 1. WHAT HAPPENED? */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-slate-700">
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">1</span>
            <span>WHAT HAPPENED?</span>
          </div>
          <p className="text-slate-600 leading-relaxed">{whatHappened}</p>
        </div>

        {/* 2. WHY IS THE RISK INCREASING? */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-amber-900">
            <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px]">2</span>
            <span>WHY IS THE RISK INCREASING?</span>
          </div>
          <p className="text-slate-700 leading-relaxed">{whyIsRiskIncreasing}</p>
        </div>

        {/* 3. WHAT DATA CAUSED THE ALERT? */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-slate-700">
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">3</span>
            <span>WHAT DATA CAUSED THE ALERT?</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pt-0.5">
            {Array.isArray(dataCausedAlert) && dataCausedAlert.map((d, idx) => (
              <li key={idx} className="font-mono text-[11px]">{d}</li>
            ))}
          </ul>
        </div>

        {/* 4. WHAT MAY HAPPEN IF THE TREND CONTINUES? */}
        <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/70 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-red-900">
            <span className="w-4 h-4 rounded-full bg-red-200 text-red-800 flex items-center justify-center text-[10px]">4</span>
            <span>WHAT MAY HAPPEN IF TREND CONTINUES?</span>
          </div>
          <p className="text-slate-700 leading-relaxed">{whatMayHappenIfTrendContinues}</p>
        </div>
      </div>

      {/* 5. WHAT SHOULD THE BEEKEEPER CHECK NEXT? */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
        <div className="flex items-center space-x-2 font-bold text-emerald-950">
          <Stethoscope className="w-4 h-4 text-emerald-700" />
          <span>5. WHAT SHOULD THE BEEKEEPER CHECK NEXT?</span>
        </div>
        <p className="text-slate-800 leading-relaxed font-medium bg-white/80 p-3 rounded-lg border border-emerald-100">
          {whatShouldBeekeeperCheckNext}
        </p>
      </div>

      {/* Scientific Disclaimer */}
      <div className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start space-x-2">
        <span className="font-bold shrink-0">DISCLAIMER:</span>
        <span>{scientificDisclaimer}</span>
      </div>
    </div>
  );
}
