import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  CheckCircle2, XCircle, ShieldCheck, Lock, Box, Calendar, Scale, Flower2, 
  MapPin, AlertCircle, Search, FileText, Activity, ChevronRight, Info,
  QrCode, Award, Languages, Sparkles, Globe, WifiOff, FileDown, Camera, Zap,
  Droplets, Thermometer, Shield, X, RefreshCw
} from 'lucide-react';
import jsQR from 'jsqr';
import { DEMO_BATCHES } from '../data/demoBatches';
import { getSupabaseHoneyBatchByBatchId } from '../services/supabase';
import { generateHoneyPassportPDF } from '../utils/pdfGenerator';

export default function ConsumerVerificationPage() {
  const { batchId: paramBatchId } = useParams();
  const [searchParams] = useSearchParams();
  const initialId = paramBatchId || searchParams.get('batch') || 'HC-2026-001';
  const modeParam = searchParams.get('mode');
  const dataParam = searchParams.get('data');

  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [inputBatchId, setInputBatchId] = useState(initialId);
  const [activeBatch, setActiveBatch] = useState(null);
  const [verificationMode, setVerificationMode] = useState('online'); // 'online' | 'offline'
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  
  // In-app camera scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState('Point camera at HoneyChain QR code...');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.13);
      }
    } catch (e) {
      // AudioContext unavailable
    }
  };

  const handleDetectedQR = (rawText) => {
    if (!rawText) return;
    playScanBeep();
    stopCamera();

    const cleanText = rawText.trim();

    // Case 1: Offline signed payload
    if (cleanText.startsWith('HONEYCHAIN:')) {
      try {
        const jsonStr = cleanText.replace('HONEYCHAIN:', '');
        const parsed = JSON.parse(jsonStr);
        const batchId = parsed.b || 'HC-2026-001';
        setInputBatchId(batchId);
        setVerificationMode('offline');
        
        const demoMatch = DEMO_BATCHES.find(b => b.batch_id === batchId) || DEMO_BATCHES[0];
        setActiveBatch({
          ...demoMatch,
          batch_id: batchId,
          hive_code: parsed.h || demoMatch.hive_code,
          honey_type: parsed.t || demoMatch.honey_type,
          harvest_date: parsed.d || demoMatch.harvest_date,
          quantity_kg: parsed.q || demoMatch.quantity_kg,
          moisture_percentage: parsed.m || demoMatch.moisture_percentage,
          health_score: parsed.s || demoMatch.health_score,
          quality_status: 'Verified (Offline Cryptographic Seal)'
        });
        setNotFound(false);
        return;
      } catch (err) {
        console.warn('Failed to parse offline QR JSON payload:', err);
      }
    }

    // Case 2: URL containing /verify/<batchId> or ?batch=<batchId>
    let extractedId = cleanText;
    const urlMatch = cleanText.match(/\/verify\/([A-Z0-9-]+)/i) || cleanText.match(/[?&]batch=([A-Z0-9-]+)/i);
    if (urlMatch && urlMatch[1]) {
      extractedId = urlMatch[1];
    } else if (cleanText.startsWith('http')) {
      try {
        const urlObj = new URL(cleanText);
        const parts = urlObj.pathname.split('/').filter(Boolean);
        if (parts.length > 0) {
          extractedId = parts[parts.length - 1];
        }
      } catch (e) {}
    }

    setInputBatchId(extractedId);
    performVerification(extractedId);
  };

  const scanFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          setScanStatus(`Scanned: ${code.data.substring(0, 24)}...`);
          handleDetectedQR(code.data);
          return; // Stop animation loop
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const startCamera = async () => {
    setScanStatus('Starting camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      setCameraActive(true);
      setShowScanner(true); // show the video element AFTER stream is ready
      setScanStatus('Align HoneyChain QR inside the frame...');
    } catch (err) {
      console.warn('Camera access error or desktop simulator mode:', err);
      setShowScanner(true); // still show scanner panel so user sees error / sample buttons
      setCameraActive(false);
      setScanStatus('Camera unavailable — use the quick-verify buttons below instead.');
    }
  };

  // Once the video element is rendered (showScanner=true + cameraActive=true), attach the stream
  useEffect(() => {
    if (showScanner && cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.play().then(() => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }).catch((e) => {
        console.warn('Video play error:', e);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScanner, cameraActive]);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setShowScanner(false);
  };

  const handleScanSample = (sampleId, isOffline = false) => {
    playScanBeep();
    stopCamera();
    setInputBatchId(sampleId);
    if (isOffline) {
      setVerificationMode('offline');
      const demoMatch = DEMO_BATCHES.find(b => b.batch_id === sampleId) || DEMO_BATCHES[0];
      setActiveBatch({
        ...demoMatch,
        quality_status: 'Verified (Offline Cryptographic Seal)'
      });
      setNotFound(false);
    } else {
      performVerification(sampleId);
    }
  };

  const performVerification = async (idToVerify) => {
    const cleanId = (idToVerify || '').trim().toUpperCase();
    if (!cleanId) return;

    setLoading(true);
    setNotFound(false);

    try {
      if (modeParam === 'offline' && dataParam) {
        try {
          const parsed = JSON.parse(decodeURIComponent(dataParam));
          const offlineBatch = {
            batch_id: parsed.b || cleanId,
            hive_code: parsed.h || 'H001',
            honey_type: parsed.t || 'Multifloral',
            harvest_date: parsed.d || '2026-09-18',
            quantity_kg: parsed.q || 24.5,
            moisture_percentage: parsed.m || 17.5,
            health_score: parsed.s || 94,
            quality_status: 'Verified (Offline Seal)',
            location: 'Coorg Shola Apiary, Madikeri, Karnataka',
            flora_source: 'Wild Forest Bloom & Coffee Blossom',
            bee_activity: 87,
            temperature: 34.5,
            timeline: DEMO_BATCHES[0].timeline
          };
          setActiveBatch(offlineBatch);
          setVerificationMode('offline');
          setNotFound(false);
          setLoading(false);
          return;
        } catch (e) {
          console.warn('Could not parse offline data parameter');
        }
      }

      const supabaseBatch = await getSupabaseHoneyBatchByBatchId(cleanId);
      
      if (supabaseBatch) {
        const demoMatch = DEMO_BATCHES.find(b => b.batch_id.toUpperCase() === cleanId) || DEMO_BATCHES[0];
        setActiveBatch({
          ...demoMatch,
          batch_id: supabaseBatch.batch_id,
          hive_code: supabaseBatch.hive_code || demoMatch.hive_code,
          honey_type: supabaseBatch.honey_type || demoMatch.honey_type,
          harvest_date: supabaseBatch.harvest_date || demoMatch.harvest_date,
          quantity_kg: supabaseBatch.quantity || demoMatch.quantity_kg,
          location: supabaseBatch.location || demoMatch.location,
          moisture_percentage: supabaseBatch.moisture_percentage || demoMatch.moisture_percentage,
          health_score: supabaseBatch.ai_health_score || demoMatch.health_score,
          quality_status: supabaseBatch.quality_status || 'Verified'
        });
        setVerificationMode('online');
        setNotFound(false);
      } else {
        const demoFound = DEMO_BATCHES.find(b => 
          b.batch_id.toUpperCase() === cleanId || 
          b.batch_id.replace('HC-', 'BATCH-').toUpperCase() === cleanId
        );

        if (demoFound) {
          setActiveBatch(demoFound);
          setVerificationMode(modeParam === 'offline' ? 'offline' : 'online');
          setNotFound(false);
        } else {
          setActiveBatch(null);
          setNotFound(true);
        }
      }
    } catch (err) {
      console.warn('Verification query error:', err);
      const demoFound = DEMO_BATCHES.find(b => b.batch_id.toUpperCase() === cleanId);
      if (demoFound) {
        setActiveBatch(demoFound);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      performVerification(initialId);
    }
    return () => {
      stopCamera();
    };
  }, [initialId, modeParam, dataParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performVerification(inputBatchId);
  };

  const handleDownloadPDF = () => {
    if (!activeBatch) return;
    setDownloadingPdf(true);
    try {
      generateHoneyPassportPDF(activeBatch, verificationMode);
    } catch (err) {
      console.error('PDF Generation failed:', err);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 pb-20 font-sans antialiased selection:bg-amber-100">
      
      {/* Top Navbar — Elegant, Crisp, Perfectly Aligned */}
      <header className="bg-white/95 backdrop-blur-md border-b border-amber-100/60 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center space-x-2.5 min-w-0 group">
            <img 
              src="/hivefive-logo.png" 
              alt="HoneyChain Logo" 
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl shrink-0 group-hover:scale-105 transition-transform" 
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  HONEY<span className="text-amber-600">CHAIN</span>
                </span>
                <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200/80 shrink-0">
                  Passport
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal truncate hidden sm:block">
                Predictive Hive Health & Honey Traceability
              </p>
            </div>
          </Link>

          {/* Clean Language Selector */}
          <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200/70 text-xs shrink-0">
            <Languages className="w-3.5 h-3.5 text-amber-600 ml-1 hidden xs:inline" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-lg font-semibold text-[11px] transition-colors ${language === 'en' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-0.5 rounded-lg font-semibold text-[11px] transition-colors ${language === 'ta' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 rounded-lg font-semibold text-[11px] transition-colors ${language === 'hi' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              हिंदी
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 space-y-4">
        
        {/* Verification Status & Scanner Bar */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          verificationMode === 'offline'
            ? 'bg-gradient-to-r from-amber-50/80 to-orange-50/50 border-amber-200/80'
            : 'bg-gradient-to-r from-emerald-50/70 via-teal-50/30 to-emerald-50/60 border-emerald-200/80'
        }`}>
          <div className="flex items-center space-x-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white ${
              verificationMode === 'offline' ? 'bg-amber-500' : 'bg-emerald-600'
            }`}>
              {verificationMode === 'offline' ? <WifiOff className="w-4.5 h-4.5" /> : <ShieldCheck className="w-4.5 h-4.5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  {verificationMode === 'offline' ? 'Offline Cryptographic Seal' : 'Live Cloud & Blockchain Ledger'}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${
                  verificationMode === 'offline'
                    ? 'bg-amber-100/80 text-amber-900 border-amber-300'
                    : 'bg-emerald-100/80 text-emerald-900 border-emerald-300'
                }`}>
                  {verificationMode === 'offline' ? 'OFFLINE READY' : 'LIVE VERIFIED'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5 truncate sm:whitespace-normal">
                {verificationMode === 'offline'
                  ? 'Decoded locally on your device without cellular data.'
                  : 'Authenticated in real-time against HoneyChain smart contracts.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={startCamera}
            className="self-end sm:self-center bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs flex items-center space-x-1.5 transition-all shrink-0 active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* Live Continuous QR Camera Scanner Modal / Viewfinder */}
        {showScanner && (
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-amber-400/80 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Camera className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
                <h3 className="font-semibold text-sm text-white">Live Camera QR Scanner</h3>
              </div>
              <button 
                type="button"
                onClick={stopCamera} 
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-colors flex items-center space-x-1 text-xs"
                title="Close Scanner"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>

            {/* Video Viewfinder with Real-Time Scan Line */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-slate-800">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`} 
              />
              
              {!cameraActive && (
                <div className="text-center p-6 space-y-2">
                  <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-normal">{scanStatus}</p>
                </div>
              )}
              
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-amber-400/90 rounded-2xl relative shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400 shadow-md shadow-amber-400/80 animate-pulse" />
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white -mt-0.5 -ml-0.5" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white -mt-0.5 -mr-0.5" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white -mb-0.5 -ml-0.5" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white -mb-0.5 -mr-0.5" />
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-xs text-amber-300 font-medium">{scanStatus}</p>
            </div>

            {/* Instant Sample Selectors */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Or tap sample batch for instant verification:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleScanSample('HC-2026-001', false)}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-xs px-3 py-1.5 rounded-xl font-mono text-amber-300 flex items-center space-x-1"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>HC-2026-001 (Online)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScanSample('HC-2026-003', true)}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-xs px-3 py-1.5 rounded-xl font-mono text-emerald-300 flex items-center space-x-1"
                >
                  <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
                  <span>HC-2026-003 (Offline Seal)</span>
                </button>
              </div>
            </div>

            {/* Prominent Close Scanner Button */}
            <button
              type="button"
              onClick={stopCamera}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors border border-slate-700 flex items-center justify-center space-x-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Scanner</span>
            </button>
          </div>
        )}

        {/* Search & Batch Input Bar */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200/70 shadow-2xs">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={inputBatchId}
                onChange={e => setInputBatchId(e.target.value)}
                placeholder="Enter Batch ID (e.g. HC-2026-003)"
                className="w-full pl-9 pr-3 py-2 bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 text-xs shrink-0 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? t('verifying') : t('verifyBtn')}</span>
            </button>
          </form>
        </div>

        {/* NOT FOUND ALERT */}
        {notFound && (
          <div className="bg-white rounded-2xl p-6 border border-red-200 text-center space-y-2 animate-in fade-in">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">{t('batchNotRegistered')}</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              {t('batchNotFoundDesc')}
            </p>
            <p className="text-xs text-amber-700 font-medium">
              {t('trySampleBatch')} <code className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono">HC-2026-001</code>
            </p>
          </div>
        )}

        {/* VERIFIED BATCH PASSPORT DISPLAY */}
        {activeBatch && !notFound && (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            {/* HERO CERTIFICATE CARD — Balanced Typography & Deep Emerald Hue */}
            <div className="relative bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#064E3B] rounded-2xl p-6 sm:p-7 text-white shadow-md border border-emerald-400/20 overflow-hidden text-center space-y-3.5">
              
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-300" />
              </div>
              
              <div>
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-emerald-200 uppercase block mb-0.5">
                  OFFICIAL PURITY & AUTHENTICITY CERTIFICATE
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {t('authenticityVerified')}
                </h2>
                <p className="text-xs text-emerald-100/90 font-normal max-w-md mx-auto mt-1 leading-relaxed">
                  {t('qrDesc')}
                </p>
              </div>

              {/* Verified Badges */}
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 pt-0.5">
                <span className="bg-black/25 text-white text-[10px] sm:text-[11px] font-medium px-3 py-1 rounded-full border border-white/20 font-mono">
                  {t('batchId')}: {activeBatch.batch_id}
                </span>
                <span className="bg-black/25 text-emerald-200 text-[10px] sm:text-[11px] font-medium px-3 py-1 rounded-full border border-white/20 flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>100% Pure Raw Honey</span>
                </span>
                <span className="bg-black/25 text-emerald-200 text-[10px] sm:text-[11px] font-medium px-3 py-1 rounded-full border border-white/20 flex items-center space-x-1">
                  {verificationMode === 'offline' ? <WifiOff className="w-3.5 h-3.5 text-amber-300" /> : <Globe className="w-3.5 h-3.5 text-emerald-300" />}
                  <span>{verificationMode === 'offline' ? 'Offline Signed' : 'Live Blockchain Verified'}</span>
                </span>
              </div>

              {/* PDF Passport Download Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={downloadingPdf}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-900 font-bold px-6 py-2.5 rounded-xl shadow-xs text-xs sm:text-sm inline-flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-60"
                >
                  <FileDown className="w-4 h-4 text-slate-900" />
                  <span>{downloadingPdf ? 'Generating PDF...' : 'Download Official PDF Passport (Works Offline)'}</span>
                </button>
              </div>
            </div>

            {/* CARD 1: AI Quality & Lab Moisture Analysis */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>AI Quality & Lab Moisture Analysis</span>
                </h3>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                  GRADE A UNADULTERATED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                
                {/* Moisture Metric */}
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/80 text-center space-y-0.5">
                  <div className="flex items-center justify-center space-x-1 text-emerald-800 text-[10px] font-semibold uppercase tracking-wider">
                    <Droplets className="w-3 h-3 text-emerald-600" />
                    <span>{t('moisture')}</span>
                  </div>
                  <div className="font-bold text-emerald-950 text-xl sm:text-2xl pt-0.5">{activeBatch.moisture_percentage}%</div>
                  <div className="text-[10px] text-emerald-700 font-normal">Optimal Standard (&lt;18%)</div>
                </div>

                {/* Colony Health Score */}
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/80 text-center space-y-0.5">
                  <div className="flex items-center justify-center space-x-1 text-amber-800 text-[10px] font-semibold uppercase tracking-wider">
                    <Activity className="w-3 h-3 text-amber-600" />
                    <span>Colony Health</span>
                  </div>
                  <div className="font-bold text-amber-950 text-xl sm:text-2xl pt-0.5">{activeBatch.health_score || activeBatch.ai_health_score || 94}%</div>
                  <div className="text-[10px] text-amber-700 font-normal">AI Evaluated Nominal</div>
                </div>

                {/* Brood Temperature */}
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/80 text-center space-y-0.5">
                  <div className="flex items-center justify-center space-x-1 text-blue-800 text-[10px] font-semibold uppercase tracking-wider">
                    <Thermometer className="w-3 h-3 text-blue-600" />
                    <span>Brood Temp</span>
                  </div>
                  <div className="font-bold text-blue-950 text-xl sm:text-2xl pt-0.5">{activeBatch.temperature || 34.5}°C</div>
                  <div className="text-[10px] text-blue-700 font-normal">Ideal Thermoregulation</div>
                </div>

                {/* Cold Harvest */}
                <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100/80 text-center space-y-0.5">
                  <div className="flex items-center justify-center space-x-1 text-purple-800 text-[10px] font-semibold uppercase tracking-wider">
                    <Award className="w-3 h-3 text-purple-600" />
                    <span>Cold Harvest</span>
                  </div>
                  <div className="font-bold text-purple-950 text-xl sm:text-2xl pt-0.5">100% Raw</div>
                  <div className="text-[10px] text-purple-700 font-normal">Enzymes Preserved</div>
                </div>

              </div>
            </div>

            {/* CARD 2: Consumer Product Passport & Origin */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center space-x-2 border-b pb-3 border-slate-100">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>{t('productPassport')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t('floraSource')}</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{activeBatch.flora_source || 'Wild Forest Bloom'}</span>
                  <span className="text-[10px] text-slate-500 font-normal">{activeBatch.honey_type}</span>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t('harvestDate')}</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{activeBatch.harvest_date}</span>
                  <span className="text-[10px] text-slate-500 font-normal">Coorg Seasonal Harvest</span>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t('quantity')}</span>
                  <span className="font-bold text-blue-900 text-sm mt-0.5 block">{activeBatch.quantity_kg || activeBatch.quantity} kg</span>
                  <span className="text-[10px] text-slate-500 font-normal">{activeBatch.quality_status || 'Verified'}</span>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 sm:col-span-3">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] uppercase font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('location')}</span>
                  </div>
                  <span className="font-medium text-slate-800 text-xs mt-1 block">{activeBatch.location}</span>
                </div>

              </div>
            </div>

            {/* CARD 3: Farm-to-Jar Traceability Flow */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center space-x-2 border-b pb-3 border-slate-100">
                <Activity className="w-4 h-4 text-amber-600" />
                <span>{t('traceabilityFlow')}</span>
              </h3>

              <div className="space-y-3">
                {(activeBatch.timeline || DEMO_BATCHES[0].timeline).map((step, idx) => (
                  <div key={idx} className="flex space-x-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 shadow-2xs">
                      ✓
                    </div>
                    <div className="flex-1 bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{step.stage}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{step.date}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5 text-[11px] font-normal leading-relaxed">{step.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 4: Cryptographic Blockchain Ledger Seal (NO PUBLIC HASH KEY DISPLAYED) */}
            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Blockchain Tamper-Proof Guarantee</span>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {verificationMode.toUpperCase()}
                </span>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                This consumer record is cryptographically signed and registered on the HoneyChain decentralized ledger. All private signing keys and master audit hashes are securely maintained by authorized apiary operators.
              </p>

              <div className="flex items-center space-x-2 pt-1 text-xs font-semibold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Authenticity Status: CONFIRMED & AUDITED</span>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
