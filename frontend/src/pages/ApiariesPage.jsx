import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { getSupabaseHives } from '../services/supabase';
import { 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Info, 
  CheckCircle2, 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Scale, 
  ArrowRight,
  Sparkles,
  Layers,
  TrendingUp,
  Compass
} from 'lucide-react';

export default function ApiariesPage() {
  const { t } = useLanguage();
  const [selectedApiaryIndex, setSelectedApiaryIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Rich Apiaries Data
  const apiariesData = [
    {
      id: 'apiary-coorg',
      name: 'Coorg Shola Apiary A',
      location: 'Madikeri, Kodagu, Karnataka (Western Ghats)',
      altitude: '1,150 m AMSL',
      flora: 'Wild Shola Forest & Coffee Blossom',
      sunlightHours: '6.8 hrs/day',
      ambientTemp: 27.5,
      ambientHumidity: 68.0,
      hivesCount: 3,
      avgHealth: 92,
      patternDetected: false,
      correlationMessage: 'Micro-climate and colony telemetry indicate normal localized variation across hives.',
      recommendation: 'All 3 colonies in Coorg Shola Apiary A show synchronized thermal regulation. Maintain standard 14-day inspection cycle.',
      hives: [
        {
          id: '1',
          hive_code: 'H001',
          bee_species: 'Apis cerana indica',
          health_score: 94,
          risk_level: 'LOW',
          temp: 34.5,
          humidity: 55.0,
          weight: 44.2,
          flight_activity: 87,
          anomalyNote: 'Normal brood nest thermal homeostasis',
          status: 'Healthy'
        },
        {
          id: '2',
          hive_code: 'H002',
          bee_species: 'Apis cerana indica',
          health_score: 91,
          risk_level: 'LOW',
          temp: 34.8,
          humidity: 56.2,
          weight: 48.0,
          flight_activity: 84,
          anomalyNote: 'Strong nectar intake & foraging flights',
          status: 'Healthy'
        },
        {
          id: '3',
          hive_code: 'H003',
          bee_species: 'Apis dorsata',
          health_score: 88,
          risk_level: 'LOW',
          temp: 35.1,
          humidity: 57.5,
          weight: 41.5,
          flight_activity: 80,
          anomalyNote: 'Optimal brood rearing & acoustic stability',
          status: 'Healthy'
        }
      ]
    },
    {
      id: 'apiary-nilgiri',
      name: 'Nilgiri Mist Apiary B',
      location: 'Kotagiri, Nilgiris District, Tamil Nadu',
      altitude: '1,790 m AMSL',
      flora: 'Mountain Eucalyptus & Wild Rhododendron',
      sunlightHours: '5.4 hrs/day',
      ambientTemp: 22.0,
      ambientHumidity: 78.0,
      hivesCount: 2,
      avgHealth: 72,
      patternDetected: true,
      correlationMessage: 'Correlated micro-climate dampness: 2 hives show elevated humidity stress.',
      recommendation: 'High mountain mist and rainfall dampness detected. Check ventilation spacers and clear bottom-board moisture in Hive H004 & H005.',
      hives: [
        {
          id: '4',
          hive_code: 'H004',
          bee_species: 'Apis mellifera',
          health_score: 65,
          risk_level: 'MEDIUM',
          temp: 37.2,
          humidity: 72.0,
          weight: 38.5,
          flight_activity: 45,
          anomalyNote: 'Elevated internal humidity & thermal clustering',
          status: 'Attention'
        },
        {
          id: '5',
          hive_code: 'H005',
          bee_species: 'Apis cerana indica',
          health_score: 78,
          risk_level: 'MEDIUM',
          temp: 35.6,
          humidity: 68.5,
          weight: 40.2,
          flight_activity: 62,
          anomalyNote: 'Recovering post ventilation adjustment',
          status: 'Recovering'
        }
      ]
    }
  ];

  const currentApiary = apiariesData[selectedApiaryIndex];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('apiariesTitle')}</h1>
            <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-0.5 rounded-md border border-amber-300">
              REGIONAL CLUSTERS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {t('apiariesSub')}
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 text-center">
            <span className="text-[10px] text-amber-800 font-bold block">{t('totalApiaries')}</span>
            <span className="font-black text-amber-950 text-base">{apiariesData.length}</span>
          </div>
          <div className="bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 text-center">
            <span className="text-[10px] text-emerald-800 font-bold block">{t('activeHivesCount')}</span>
            <span className="font-black text-emerald-950 text-base">5</span>
          </div>
          <div className="bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 text-center">
            <span className="text-[10px] text-blue-800 font-bold block">{t('avgHealthScore')}</span>
            <span className="font-black text-blue-950 text-base">84%</span>
          </div>
        </div>
      </div>

      {/* Apiary Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {apiariesData.map((ap, idx) => (
          <button
            key={ap.id}
            onClick={() => setSelectedApiaryIndex(idx)}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
              selectedApiaryIndex === idx
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{ap.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              selectedApiaryIndex === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {ap.hivesCount} Hives
            </span>
          </button>
        ))}
      </div>

      {/* Apiary Environmental & Microclimate Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="font-black text-slate-900 text-base">{currentApiary.name}</h2>
              <p className="text-xs text-slate-500">{currentApiary.location} • Altitude: {currentApiary.altitude}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
              Avg Health: {currentApiary.avgHealth}%
            </span>
          </div>
        </div>

        {/* Environmental Microclimate Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-[11px]">
              <CloudSun className="w-4 h-4" />
              <span>Ambient Weather</span>
            </div>
            <div className="font-black text-slate-900 text-base">{currentApiary.ambientTemp}°C</div>
            <div className="text-[10px] text-slate-500">{currentApiary.sunlightHours} direct sunlight</div>
          </div>

          <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-1">
            <div className="flex items-center space-x-1.5 text-blue-800 font-bold text-[11px]">
              <Droplets className="w-4 h-4" />
              <span>Ambient Humidity</span>
            </div>
            <div className="font-black text-slate-900 text-base">{currentApiary.ambientHumidity}%</div>
            <div className="text-[10px] text-slate-500">Forest microclimate</div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-[11px]">
              <Sparkles className="w-4 h-4" />
              <span>Flora Source</span>
            </div>
            <div className="font-extrabold text-slate-900 text-xs truncate" title={currentApiary.flora}>
              {currentApiary.flora}
            </div>
            <div className="text-[10px] text-slate-500">Nectar forage zone</div>
          </div>

          <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-1">
            <div className="flex items-center space-x-1.5 text-purple-800 font-bold text-[11px]">
              <Layers className="w-4 h-4" />
              <span>Cluster Colony Size</span>
            </div>
            <div className="font-black text-slate-900 text-base">{currentApiary.hivesCount} Colonies</div>
            <div className="text-[10px] text-slate-500">Telemetry nodes synced</div>
          </div>
        </div>
      </div>

      {/* Regional Correlation Intelligence Banner */}
      <div className={`p-5 rounded-3xl border shadow-xs flex items-start space-x-3.5 ${
        currentApiary.patternDetected
          ? 'bg-amber-50 border-amber-300 text-amber-950'
          : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
      }`}>
        {currentApiary.patternDetected ? (
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-sm">{currentApiary.correlationMessage}</h3>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
              currentApiary.patternDetected ? 'bg-amber-200 text-amber-900 border-amber-400' : 'bg-emerald-200 text-emerald-900 border-emerald-400'
            }`}>
              {currentApiary.patternDetected ? 'ATTENTION PATTERN' : 'OPTIMAL SYNCHRONY'}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {currentApiary.recommendation}
          </p>
        </div>
      </div>

      {/* Comparative Colony Cards Grid */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
          <Layers className="w-4 h-4 text-amber-600" />
          <span>Colonies in {currentApiary.name} ({currentApiary.hives.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentApiary.hives.map((h) => {
            const isHigh = h.risk_level === 'HIGH';
            const isMed = h.risk_level === 'MEDIUM';

            return (
              <div 
                key={h.id} 
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-lg text-slate-900">{h.hive_code}</span>
                      <p className="text-[11px] text-slate-500 font-mono">({h.bee_species})</p>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                      isHigh ? 'bg-red-100 text-red-800 border-red-200' :
                      (isMed ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200')
                    }`}>
                      {h.risk_level} RISK
                    </span>
                  </div>

                  {/* Health Bar */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">{t('healthIndex')}</span>
                      <span className={isHigh ? 'text-red-600' : (isMed ? 'text-amber-600' : 'text-emerald-600')}>
                        {h.health_score}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isHigh ? 'bg-red-500' : (isMed ? 'bg-amber-500' : 'bg-emerald-500')
                        }`}
                        style={{ width: `${h.health_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Sensor Vitals Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Temp</span>
                      <span className="font-black text-slate-800">{h.temp}°C</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Humidity</span>
                      <span className="font-black text-slate-800">{h.humidity}%</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Weight</span>
                      <span className="font-black text-slate-800">{h.weight} kg</span>
                    </div>
                  </div>

                  {/* Observation Note */}
                  <div className="mt-3 text-[11px] bg-amber-50/60 p-2.5 rounded-xl text-amber-900 border border-amber-200/60">
                    <strong>Telemetry Correlation:</strong> {h.anomalyNote}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Status: {h.status}</span>
                  <Link
                    to={`/hives/${h.id}`}
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

      {/* Scientific Disclaimer */}
      <div className="text-[11px] text-slate-400 italic bg-white p-3.5 rounded-2xl border border-slate-200">
        *Regional Correlation Notice: Cross-colony telemetry identifies synchronous micro-climatic patterns and shared environmental factors across the Western Ghats apiary clusters.
      </div>
    </div>
  );
}
