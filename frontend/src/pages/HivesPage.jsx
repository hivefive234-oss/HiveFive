import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getSupabaseHives } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import { Layers, ArrowRight, Filter, Search } from 'lucide-react';

export default function HivesPage() {
  const { t } = useLanguage();
  const [hives, setHives] = useState([]);
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHives = async () => {
      try {
        let hivesData = await getSupabaseHives();
        if (hivesData) {
          hivesData = hivesData.map(h => ({
            ...h,
            current_risk_level: h.status === 'ACTIVE' ? 'LOW' : (h.status === 'ATTENTION' || h.status === 'RECOVERING' ? 'MEDIUM' : 'LOW'),
            current_health_score: h.status === 'ACTIVE' ? 90 : (h.status === 'ATTENTION' ? 65 : (h.status === 'RECOVERING' ? 72 : 90)),
            queen_status: 'Active – laying pattern observed',
            apiary: { name: h.location }
          }));
        }

        if (!hivesData) {
          const res = await api.get('/hives');
          hivesData = res.data.hives || [];
        }
        setHives(hivesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHives();
  }, []);

  const filteredHives = hives.filter(h => {
    const matchesRisk = filterRisk === 'ALL' || h.current_risk_level === filterRisk;
    const matchesSearch = h.hive_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.apiary?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('activeColonyProfiles')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t('telemetryChartSub')}</p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search hive code or apiary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 text-slate-800"
          />

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 bg-slate-50 focus:outline-hidden"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">{t('lowRiskStatus')}</option>
            <option value="MEDIUM">{t('medRiskAlerts')}</option>
            <option value="HIGH">{t('inspectionNeeded')}</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHives.map((hive) => {
          const isHigh = hive.current_risk_level === 'HIGH';
          const isMed = hive.current_risk_level === 'MEDIUM';

          return (
            <div
              key={hive.id}
              className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">{hive.hive_code}</h3>
                    <p className="text-[11px] text-slate-500">{hive.apiary?.name} • {hive.bee_species}</p>
                  </div>
                  <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                    isHigh ? 'bg-red-100 text-red-800 border-red-200' :
                    (isMed ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200')
                  }`}>
                    {hive.current_risk_level}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">{t('healthIndex')}</span>
                    <span className={isHigh ? 'text-red-600' : (isMed ? 'text-amber-600' : 'text-emerald-600')}>
                      {hive.current_health_score}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isHigh ? 'bg-red-500' : (isMed ? 'bg-amber-500' : 'bg-emerald-500')}`}
                      style={{ width: `${hive.current_health_score}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 text-[11px] bg-slate-50 p-2.5 rounded-xl text-slate-600 border border-slate-100">
                  <strong className="text-slate-800">{t('colonyState')}:</strong> {hive.queen_status}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">{t('installedDate')}: {hive.installation_date}</span>
                <Link
                  to={`/hives/${hive.id}`}
                  className="font-bold text-amber-600 hover:text-amber-800 flex items-center space-x-1"
                >
                  <span>{t('intelligenceConsole')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
