import React, { useState } from 'react';
import { Sliders, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export default function ActionSimulatorWidget({ simulation }) {
  const [selectedOption, setSelectedOption] = useState('OPTION_B');

  if (!simulation || !simulation.options) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs italic bg-white rounded-2xl border border-slate-200">
        Loading action decision simulator...
      </div>
    );
  }

  const { currentState, options, disclaimer } = simulation;

  return (
    <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Action Decision Simulator</h4>
            <p className="text-[11px] text-slate-400">Evaluate comparative outcomes before taking intervention</p>
          </div>
        </div>

        {/* Current State Pill */}
        <div className="text-xs bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-slate-700 font-semibold flex items-center space-x-2">
          <span>Current Score: <strong>{currentState?.healthScore}</strong></span>
          <span>•</span>
          <span>Trend: <strong className={currentState?.trend === 'DECLINING' ? 'text-red-600' : 'text-emerald-600'}>{currentState?.trend}</strong></span>
        </div>
      </div>

      {/* Options Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              className={`cursor-pointer p-4 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{opt.title}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{opt.description}</p>
                
                <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Expected Trend:</span>
                    <p className="font-medium text-slate-800 leading-tight">{opt.expectedHealthTrend}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Risk Delta:</span>
                    <p className="font-medium text-slate-800 leading-tight">{opt.possibleRiskChange}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Production Impact:</span>
                    <p className={`font-bold ${opt.productionImpactKg >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {opt.productionImpactKg >= 0 ? `+${opt.productionImpactKg} kg` : `${opt.productionImpactKg} kg`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>Uncertainty:</span>
                <span className="font-semibold text-slate-700">{opt.uncertainty}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        *Scientific Safety Rule: {disclaimer}
      </p>
    </div>
  );
}
