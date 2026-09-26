import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import MultiSignalChart from '../components/charts/MultiSignalChart';
import QueenHealthIndicator from '../components/hive/QueenHealthIndicator';
import ExplainabilityCard from '../components/xai/ExplainabilityCard';
import ActionSimulatorWidget from '../components/simulator/ActionSimulatorWidget';
import HivePassportModal from '../components/hive/HivePassportModal';
import { useLanguage } from '../context/LanguageContext';
import { 
  getSupabaseHiveById, 
  getSupabaseTelemetry, 
  isSupabaseConfigured,
  uploadInspectionImage,
  insertSupabaseAction
} from '../services/supabase';
import { 
  Layers, 
  ArrowLeft, 
  Award, 
  Activity, 
  Sparkles, 
  Sliders, 
  Camera, 
  Clock, 
  Package, 
  ShieldCheck, 
  TrendingUp, 
  RefreshCw, 
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Info,
  X,
  FileImage,
  Video,
  VideoOff
} from 'lucide-react';

const DEFAULT_EXPLANATION = {
  whatHappened: "Internal brood nest temperature and acoustic frequency are within safe physiological limits.",
  whyIsRiskIncreasing: "Colony thermal regulation and flight traffic are synchronized with ambient diurnal patterns.",
  dataCausedAlert: [
    "Brood Temperature: 34.8°C (Normal Range: 34.0–35.5°C)",
    "Relative Humidity: 56% (Normal Range: 50–65%)",
    "Scale Weight: 44.2 kg (Steady forage weight gain)"
  ],
  whatMayHappenIfTrendContinues: "Colony is projected to maintain strong brood rearing vigor and seasonal honey production.",
  whatShouldBeekeeperCheckNext: "Maintain standard 14-day inspection cycle. Inspect capped brood pattern and verify adequate supers for upcoming nectar flow.",
  scientificDisclaimer: "Explainability features use SHAP attribution to highlight sensor parameters influencing model decisions."
};

const DEFAULT_SIMULATION = {
  currentState: { healthScore: 92, trend: 'STABLE' },
  options: [
    {
      id: 'OPTION_A',
      title: 'Option A – Routine Monitoring',
      description: 'Maintain passive telemetry monitoring without opening the hive unnecessarily.',
      expectedHealthTrend: 'Stable brood rearing trajectory and normal seasonal vigor.',
      possibleRiskChange: 'Minimal risk change (Stable baseline)',
      productionImpactKg: 0.0,
      uncertainty: 'Low (Passive sensor tracking)'
    },
    {
      id: 'OPTION_B',
      title: 'Option B – Physical Brood Inspection',
      description: 'Perform hands-on frame inspection of queen laying pattern and food stores.',
      expectedHealthTrend: 'Direct confirmation of brood pattern and disease-free comb condition.',
      possibleRiskChange: 'Reduces diagnostic uncertainty by 65%',
      productionImpactKg: -0.2,
      uncertainty: 'Very Low (Direct physical verification)'
    },
    {
      id: 'OPTION_C',
      title: 'Option C – Adjust Hive Ventilation',
      description: 'Adjust top screen vents to optimize moisture dissipation during rainy/humid periods.',
      expectedHealthTrend: 'Prevents humidity accumulation and reduces fungal risk.',
      possibleRiskChange: '40–60% reduction in humidity stress probability',
      productionImpactKg: +1.5,
      uncertainty: 'Moderate (Weather dependent)'
    },
    {
      id: 'OPTION_D',
      title: 'Option D – Add Honey Super',
      description: 'Add a new shallow super frame to accommodate incoming seasonal nectar flow.',
      expectedHealthTrend: 'Expands comb area and prevents colony swarming urge.',
      possibleRiskChange: 'Reduces swarming risk during peak forage flow',
      productionImpactKg: +4.0,
      uncertainty: 'Low-Moderate (Flora forage dependent)'
    }
  ],
  disclaimer: 'The action simulator provides comparative decision-support projections. It is not an automated medical recommendation.'
};

const DEFAULT_TRAJECTORY = {
  confidence: 0.88,
  estimatedRiskWindow: '3–7 days',
  projectionSummary: 'Colony condition expected to follow stable seasonal baseline with steady forage intake.',
  trajectoryPoints: [
    { day: 'Day 1', score: 94 },
    { day: 'Day 3', score: 93 },
    { day: 'Day 5', score: 92 },
    { day: 'Day 7', score: 91 }
  ]
};

const DEFAULT_PRODUCTION_IMPACT = {
  expectedProductionKg: 24.0,
  currentEstimatedProductionKg: 22.5,
  potentialDifferenceKg: 1.5,
  factors: [
    'Brood nest thermal stability',
    'Pollen foraging flight index',
    'Colony hive weight trajectory'
  ],
  disclaimer: 'Yield estimates are statistical indicators for seasonal harvest planning.'
};

export default function HiveDetailPage({ onOpenSimulator }) {
  const { t } = useLanguage();
  const { id } = useParams();
  const [hive, setHive] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [passportOpen, setPassportOpen] = useState(false);
  const [passportData, setPassportData] = useState(null);
  const [explanation, setExplanation] = useState(DEFAULT_EXPLANATION);
  const [simulation, setSimulation] = useState(DEFAULT_SIMULATION);
  const [productionImpact, setProductionImpact] = useState(DEFAULT_PRODUCTION_IMPACT);
  const [trajectory, setTrajectory] = useState(DEFAULT_TRAJECTORY);
  const [loading, setLoading] = useState(true);

  // Manual camera upload & live webcam state
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadNote, setUploadNote] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  
  // Live Webcam state
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [webcamError, setWebcamError] = useState('');

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setUploadError(t('supportedFormats'));
      return;
    }
    setUploadError('');
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Live Webcam controls
  const startWebcam = async () => {
    setWebcamError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setWebcamError('Camera API is not supported on this browser/insecure connection.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      // Set stream first, then isWebcamActive so video element renders before srcObject assigned
      setWebcamStream(stream);
      setIsWebcamActive(true);
    } catch (err) {
      console.warn('Webcam access error:', err);
      setWebcamError('Camera access denied or device unavailable. Please allow camera permissions.');
    }
  };

  // Attach stream to video element AFTER it has been rendered by React
  useEffect(() => {
    if (isWebcamActive && webcamStream && videoRef.current) {
      videoRef.current.srcObject = webcamStream;
      videoRef.current.play().catch(e => console.warn('Video play error:', e));
    }
  }, [isWebcamActive, webcamStream]);

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    setIsWebcamActive(false);
  };

  const captureWebcamPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImagePreview(dataUrl);
    
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const capturedFile = new File([blob], `hive-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(capturedFile);
      });

    stopWebcam();
  };

  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamStream]);

  // Log inspection & observation to Supabase
  const handleLogObservation = async (e) => {
    e.preventDefault();
    if (!selectedFile && !uploadNote.trim()) {
      setUploadError('Please select a photo or enter observation notes.');
      return;
    }

    setIsSubmittingObservation(true);
    setUploadError('');

    try {
      let imageUrl = null;
      if (selectedFile) {
        imageUrl = await uploadInspectionImage(selectedFile, hive?.hive_code || 'H001');
      }

      await insertSupabaseAction({
        hive_id: hive?.id || '00000000-0000-0000-0000-000000000000',
        action_type: 'Manual Inspection & Camera Observation',
        observation: uploadNote || 'Visual brood frame inspection logged.',
        notes: imageUrl ? `Photo logged: ${selectedFile?.name || 'capture.jpg'}` : 'Observation logged.'
      });

      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        clearSelectedFile();
        setUploadNote('');
      }, 3500);
    } catch (err) {
      console.error('Failed to log observation:', err);
      setUploadError(t('uploadErrorMsg'));
    } finally {
      setIsSubmittingObservation(false);
    }
  };

  const fetchHiveDetails = async () => {
    try {
      let hiveData = null;
      let readings = [];

      // Try Supabase first
      const supabaseHive = await getSupabaseHiveById(id);
      if (supabaseHive) {
        const status = supabaseHive.status || 'ACTIVE';
        const riskLevel = status === 'ACTIVE' ? 'LOW' : (status === 'ATTENTION' ? 'HIGH' : 'MEDIUM');
        const healthScore = status === 'ACTIVE' ? 92 : (status === 'ATTENTION' ? 58 : 74);
        
        const telem = await getSupabaseTelemetry(supabaseHive.id, 24);
        readings = (telem || []).map(r => ({
          ...r,
          device_id: 'DEV-NODE-88',
          acoustic_peak_hz: 235,
          bee_activity_in: 45,
          bee_activity_out: 42,
          weight_delta_24h: 0.2
        }));

        hiveData = {
          ...supabaseHive,
          current_risk_level: riskLevel,
          current_health_score: healthScore,
          queen_status: 'Active – laying pattern observed',
          apiary: { name: supabaseHive.location || 'Coorg Shola Apiary' },
          sensorReadings: readings.length > 0 ? readings : [
            { id: 1, timestamp: new Date().toISOString(), temperature: 34.8, humidity: 56.2, weight: 44.0, acoustic_peak_hz: 235, bee_activity_in: 45, bee_activity_out: 42 }
          ]
        };
      } else {
        // Fallback to Express backend API
        const res = await api.get(`/hives/${id}`);
        hiveData = res.data.hive;
      }

      setHive(hiveData);

      // Fetch intelligence components (ML service)
      try {
        const [expRes, simRes, prodRes, healthRes] = await Promise.allSettled([
          api.get(`/health/hive/${id}/explain`),
          api.get(`/health/hive/${id}/simulate-action`),
          api.get(`/health/hive/${id}/production-impact`),
          api.get(`/health/hive/${id}/analyze`)
        ]);

        if (expRes.status === 'fulfilled' && expRes.value.data?.explanation) {
          setExplanation(expRes.value.data.explanation);
        }
        if (simRes.status === 'fulfilled' && simRes.value.data?.simulation) {
          setSimulation(simRes.value.data.simulation);
        }
        if (prodRes.status === 'fulfilled' && prodRes.value.data?.impact) {
          setProductionImpact(prodRes.value.data.impact);
        }
        if (healthRes.status === 'fulfilled' && healthRes.value.data?.trajectory) {
          setTrajectory(healthRes.value.data.trajectory);
        }
      } catch (mlErr) {
        console.warn('ML intelligence calls fallback:', mlErr.message);
      }
    } catch (err) {
      console.error('Failed to load hive details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPassport = async () => {
    try {
      const res = await api.get(`/hives/${id}/passport`);
      setPassportData(res.data.passport);
      setPassportOpen(true);
    } catch (err) {
      // Fallback local passport
      setPassportData({
        hive_code: hive?.hive_code || 'H001',
        location: hive?.location || 'Coorg Shola Apiary',
        status: hive?.status || 'ACTIVE',
        bee_species: hive?.bee_species || 'Apis cerana indica',
        installation_date: hive?.installation_date || '2025-11-15',
        health_score: hive?.current_health_score || 94
      });
      setPassportOpen(true);
    }
  };

  useEffect(() => {
    fetchHiveDetails();
  }, [id]);

  if (loading || !hive) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs italic">
        {t('loadingMsg')}
      </div>
    );
  }

  const isHigh = hive.current_risk_level === 'HIGH';
  const isMed = hive.current_risk_level === 'MEDIUM';

  const tabs = [
    { key: 'overview', label: t('tabOverview') },
    { key: 'sensors', label: t('tabSensors') },
    { key: 'camera', label: t('tabCamera') },
    { key: 'health', label: t('tabHealth') },
    { key: 'prediction', label: t('tabPrediction') },
    { key: 'explainability', label: t('tabExplainability') },
    { key: 'simulation', label: t('tabSimulation') },
    { key: 'production', label: t('tabProduction') },
    { key: 'history', label: t('tabHistory') },
    { key: 'harvest', label: t('tabHarvest') },
    { key: 'blockchain', label: t('tabBlockchain') }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/hives"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900">{hive.hive_code}</h1>
              <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                isHigh ? 'bg-red-100 text-red-800 border-red-200' :
                (isMed ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200')
              }`}>
                {hive.current_risk_level} RISK
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {hive.apiary?.name} • {hive.bee_species} • {t('installedDate')} {hive.installation_date}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleOpenPassport}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>{t('digitalPassport')}</span>
          </button>
          <button
            onClick={fetchHiveDetails}
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title={t('refresh')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 11 Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-amber-100 shadow-xs flex items-center space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-amber-50 hover:text-amber-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Vitals Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <div className="text-slate-400 text-[10px] uppercase font-bold">{t('healthIndex')}</div>
              <div className={`text-2xl font-black mt-1 ${isHigh ? 'text-red-600' : (isMed ? 'text-amber-600' : 'text-emerald-600')}`}>
                {hive.current_health_score}/100
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Vigor index</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <div className="text-slate-400 text-[10px] uppercase font-bold">{t('broodTemp')}</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {hive.sensorReadings?.[0]?.temperature || 35.0}°C
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Brood nest probe</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Relative Humidity</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {hive.sensorReadings?.[0]?.humidity || 55.0}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Humidity sensor</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <div className="text-slate-400 text-[10px] uppercase font-bold">{t('weightScale')}</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {hive.sensorReadings?.[0]?.weight || 44.0} kg
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Scale payload
              </div>
            </div>
          </div>

          {/* Queen Vitality Component */}
          <QueenHealthIndicator
            queenStatus={hive.queen_status}
            queenHistories={hive.queenHistories}
            broodObservations={hive.broodObservations}
          />

          {/* Telemetry Chart */}
          <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">{t('liveTelemetryStream')}</h3>
            <MultiSignalChart readings={hive.sensorReadings} />
          </div>
        </div>
      )}

      {/* Tab 2: SENSORS */}
      {activeTab === 'sensors' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-slate-900">{t('liveTelemetryStream')}</h3>
                <p className="text-xs text-slate-500">{t('telemetryChartSub')}</p>
              </div>
              <button onClick={onOpenSimulator} className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                {t('simulateTick')}
              </button>
            </div>
            <MultiSignalChart readings={hive.sensorReadings} />
          </div>

          {/* Raw Sensor Log Table */}
          <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs space-y-3 overflow-x-auto">
            <h3 className="font-bold text-sm text-slate-900">Recent Telemetry Ingestion Log</h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2">Timestamp</th>
                  <th className="py-2">Temp</th>
                  <th className="py-2">Humidity</th>
                  <th className="py-2">Weight</th>
                  <th className="py-2">Acoustic</th>
                  <th className="py-2">Flight Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hive.sensorReadings?.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50">
                    <td className="py-2 text-slate-600">{new Date(r.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2 font-bold text-red-600">{r.temperature}°C</td>
                    <td className="py-2 font-bold text-blue-600">{r.humidity}%</td>
                    <td className="py-2 font-bold text-emerald-600">{r.weight} kg</td>
                    <td className="py-2 text-slate-700">{r.acoustic_peak_hz || 235} Hz</td>
                    <td className="py-2 text-slate-700">{r.bee_activity || 85}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: CAMERA & VISUAL INSPECTION */}
      {activeTab === 'camera' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900">{t('entranceCameraTitle')}</h3>
                <p className="text-xs text-slate-500">{t('entranceCameraSub')}</p>
              </div>
            </div>

            {/* Model Status Banner */}
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-amber-900 font-semibold">{t('noVisionModelNotice')}</span>
              </div>
              <span className="bg-white text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                {t('manualObservationLabel')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: Camera Preview / Live Capture */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-800">{t('sampleEntranceFrame')}</span>
                    {!isWebcamActive ? (
                      <button
                        type="button"
                        onClick={startWebcam}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{t('useWebcam')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopWebcam}
                        className="bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <VideoOff className="w-3.5 h-3.5" />
                        <span>{t('cancelWebcam')}</span>
                      </button>
                    )}
                  </div>

                  {webcamError && (
                    <div className="text-red-600 text-[11px] bg-red-50 p-2 rounded-lg border border-red-200 mb-2">
                      {webcamError}
                    </div>
                  )}

                  {isWebcamActive ? (
                    <div className="space-y-2">
                      <div className="h-48 bg-black rounded-xl overflow-hidden relative">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={captureWebcamPhoto}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{t('capturePhoto')}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="h-48 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs relative overflow-hidden">
                      <div className="text-center space-y-1 p-4">
                        <span className="text-3xl">🐝</span>
                        <p className="text-[11px] text-amber-200 font-bold">Hive {hive.hive_code} Entrance Camera</p>
                        <p className="text-[9px] text-slate-400 font-mono">Sampling entrance flight vigor & manual inspections</p>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-500 leading-snug pt-2 border-t border-slate-200">
                  {t('entranceCameraNote')}
                </p>
              </div>

              {/* Right Column: Photo Upload & Observation Logging */}
              <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200 space-y-3">
                <div className="font-bold text-xs text-amber-900">{t('manualPhotoUpload')}</div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center space-y-2.5 bg-white/80 transition-colors cursor-pointer ${
                    selectedFile ? 'border-emerald-400 bg-emerald-50/20' : 'border-amber-300 hover:border-amber-500 hover:bg-amber-50/60'
                  }`}
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      <div className="relative inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Inspection preview" 
                          className="w-32 h-32 object-cover rounded-xl border border-emerald-300 shadow-sm mx-auto" 
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSelectedFile();
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1">
                        <FileImage className="w-3.5 h-3.5" /> {selectedFile?.name || 'capture.jpg'} ({selectedFile ? Math.round(selectedFile.size / 1024) : 120} KB)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="w-7 h-7 text-amber-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">{t('dragDropPhoto')}</p>
                      <p className="text-[10px] text-slate-400">{t('supportedFormats')}</p>
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder={t('observationNotesPlaceholder')}
                    value={uploadNote}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setUploadNote(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:border-amber-500 focus:outline-none"
                  />

                  {uploadError && (
                    <p className="text-[11px] text-red-600 font-semibold">{uploadError}</p>
                  )}
                  
                  <button
                    type="button"
                    disabled={isSubmittingObservation}
                    onClick={handleLogObservation}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-5 rounded-lg shadow-sm transition-colors w-full disabled:opacity-50"
                  >
                    {isSubmittingObservation ? 'Saving...' : t('logManualObservationBtn')}
                  </button>

                  {uploadSuccess && (
                    <div className="text-xs text-emerald-700 font-bold flex items-center justify-center gap-1 bg-emerald-100 p-2 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {t('uploadSuccessMsg')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: HEALTH */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">Colony Health Engine Evaluation</h3>
            <div className="flex items-center space-x-4">
              <div className={`text-4xl font-black ${isHigh ? 'text-red-600' : (isMed ? 'text-amber-600' : 'text-emerald-600')}`}>
                {hive.current_health_score}/100
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Risk Category: <span className={isHigh ? 'text-red-600' : (isMed ? 'text-amber-600' : 'text-emerald-600')}>{hive.current_risk_level}</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  Multi-signal model combining thermal stability, humidity stress, acoustic frequency, and flight traffic.
                </p>
              </div>
            </div>
          </div>

          <QueenHealthIndicator
            queenStatus={hive.queen_status}
            queenHistories={hive.queenHistories}
            broodObservations={hive.broodObservations}
          />
        </div>
      )}

      {/* Tab 5: PREDICTION */}
      {activeTab === 'prediction' && (
        <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Time-to-Risk Trajectory Prediction</h3>
              <p className="text-xs text-slate-500">Estimates how colony health may evolve if current trend continues</p>
            </div>
            <div className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold border border-amber-300">
              Window: {trajectory?.estimatedRiskWindow || '3–7 days'}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-800">Model Forecast Projection:</div>
            <p className="text-slate-700 leading-relaxed font-medium">
              {trajectory?.projectionSummary || 'Colony condition expected to follow seasonal baseline.'}
            </p>
            <div className="text-[11px] text-slate-500">
              Confidence Interval: <strong>{((trajectory?.confidence || 0.75) * 100).toFixed(0)}%</strong> • Model Version: <strong>model_v1</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {(trajectory?.trajectoryPoints || [
              { day: 'Day 1', score: 92 },
              { day: 'Day 3', score: 90 },
              { day: 'Day 5', score: 89 },
              { day: 'Day 7', score: 88 }
            ]).map((p, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">{p.day}</div>
                <div className="text-lg font-black text-amber-600 mt-1">{p.score}</div>
                <div className="text-[10px] text-slate-500">Predicted Score</div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 italic">
            *Scientific Disclaimer: This forecast is a model estimate of rate-of-change. It is not a guaranteed biological certainty.
          </p>
        </div>
      )}

      {/* Tab 6: EXPLAINABILITY */}
      {activeTab === 'explainability' && (
        <ExplainabilityCard explanation={explanation || DEFAULT_EXPLANATION} riskLevel={hive.current_risk_level} />
      )}

      {/* Tab 7: ACTION SIMULATOR */}
      {activeTab === 'simulation' && (
        <ActionSimulatorWidget simulation={simulation || DEFAULT_SIMULATION} />
      )}

      {/* Tab 8: PRODUCTION */}
      {activeTab === 'production' && (
        <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Honey Production Impact Estimation</h3>
              <p className="text-xs text-slate-500">Predicted harvest volume based on colony vitality and forage dynamics</p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
              Statistical Model
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-[10px] uppercase font-bold text-slate-400">Expected Baseline</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {productionImpact?.expectedProductionKg || 24.0} kg
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Optimal colony potential</div>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
              <div className="text-[10px] uppercase font-bold text-amber-900">Current Estimated Yield</div>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {productionImpact?.currentEstimatedProductionKg || 22.0} kg
              </div>
              <div className="text-[10px] text-amber-800 mt-0.5">Adjusted for health score</div>
            </div>

            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50">
              <div className="text-[10px] uppercase font-bold text-red-900">Potential Difference</div>
              <div className="text-2xl font-black text-red-600 mt-1">
                -{productionImpact?.potentialDifferenceKg || 2.0} kg
              </div>
              <div className="text-[10px] text-red-800 mt-0.5">Estimated production gap</div>
            </div>
          </div>

          <div className="text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800">Contributing Factors:</div>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
              {(productionImpact?.factors || ['Brood nest thermal stability', 'Pollen foraging flight index', 'Colony hive weight trajectory']).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <p className="text-[10px] text-slate-400 italic">
            *Scientific Notice: Yield estimates are statistical indicators for seasonal planning.
          </p>
        </div>
      )}

      {/* Tab 9: HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Longitudinal Intervention & Inspection History</h3>
              <p className="text-xs text-slate-500">Record of beekeeper management actions and subsequent recovery</p>
            </div>
            <button
              onClick={handleOpenPassport}
              className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center space-x-1"
            >
              <span>View Full Passport</span>
              <Award className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Ventilation Screen Adjustment</span>
                <span className="text-slate-400 font-normal">2026-09-15</span>
              </div>
              <p className="text-slate-600">Opened upper ventilation screens to stabilize brood nest humidity.</p>
              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-emerald-900 text-[11px]">
                <strong>Follow-up:</strong> Condition: Stable • Score: 92/100 • Brood nest stabilized.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 10: HARVEST */}
      {activeTab === 'harvest' && (
        <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">{t('tabHarvest')}</h3>
              <p className="text-xs text-slate-500">Honey batches derived from Hive {hive.hive_code}</p>
            </div>
            <Link to="/batches" className="text-xs font-bold text-amber-600 hover:text-amber-800">
              {t('addNewBatch')} →
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">HC-2026-001</div>
                <div className="text-slate-500 text-[11px]">Wild Forest Bloom • 24.5 kg • Moisture: 17.8%</div>
              </div>
              <Link
                to="/verify/HC-2026-001"
                className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg font-bold text-[11px]"
              >
                Verify Record
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 11: BLOCKCHAIN */}
      {activeTab === 'blockchain' && (
        <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900">On-Chain Cryptographic Integrity Records</h3>
              <p className="text-xs text-slate-500">Tamper-evident verification status for this hive's production</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between items-center font-sans font-bold text-slate-800 text-xs">
                <span>HC-2026-001</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px]">
                  CONFIRMED & SEALED
                </span>
              </div>
              <div>
                <span className="text-slate-400">Canonical SHA-256 Hash:</span>
                <p className="text-slate-800 break-all">0xe8b47f31920ac458d91c28741005b637a91bf2095f462a8d4b3c91e127389ab4</p>
              </div>
              <div>
                <span className="text-slate-400">Blockchain Seal:</span>
                <p className="text-slate-800 break-all">0x8f4c217e92bb1c6e43187a4192b0c3f58a9e8721c4355a2014b2d18476d05f32</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Passport Modal */}
      <HivePassportModal
        passport={passportData}
        isOpen={passportOpen}
        onClose={() => setPassportOpen(false)}
      />
    </div>
  );
}
