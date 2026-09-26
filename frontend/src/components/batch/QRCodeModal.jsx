import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, ExternalLink, Copy, Check, Download, Printer, ShieldCheck, Wifi, Smartphone, Info, Lock, Globe, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { generateHoneyPassportPDF } from '../../utils/pdfGenerator';

export default function QRCodeModal({ batch, onClose }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [qrMode, setQrMode] = useState('online'); // 'online' | 'offline'
  const [lanIp, setLanIp] = useState('127.0.0.1');
  const [customHost, setCustomHost] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const qrRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch local LAN IP from backend for phone accessibility over Wi-Fi
    api.get('/network-info')
      .then(res => {
        if (res.data?.lanIp && res.data.lanIp !== '127.0.0.1') {
          setLanIp(res.data.lanIp);
          setCustomHost(`${res.data.lanIp}:5173`);
        }
      })
      .catch(err => console.log('Network info fetch skipped:', err.message));
  }, []);

  if (!batch) return null;

  const batchId = batch.batch_id || batch.batchId || 'HC-2026-001';

  // Construct online verification URL (Uses VITE_PUBLIC_APP_URL in production, or LAN IP in dev)
  const publicAppUrl = import.meta.env.VITE_PUBLIC_APP_URL;
  let baseUrl = publicAppUrl || window.location.origin;
  if (!publicAppUrl || publicAppUrl.includes('your-public-domain')) {
    if (customHost.trim()) {
      const cleanHost = customHost.trim();
      baseUrl = cleanHost.startsWith('http') ? cleanHost : `http://${cleanHost}`;
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      baseUrl = `http://${lanIp}:5173`;
    } else {
      baseUrl = window.location.origin;
    }
  }

  const onlineVerificationUrl = `${baseUrl}/verify/${batchId}`;

  // Construct compact signed offline payload
  const offlinePayloadObj = {
    v: '1',
    b: batchId,
    h: batch.hive_code || 'H001',
    t: batch.honey_type || 'Multifloral',
    d: batch.harvest_date || '2026-09-18',
    q: batch.quantity_kg || batch.quantity || 24.5,
    m: batch.moisture_percentage || 17.5,
    s: batch.health_score || batch.ai_health_score || 94,
    sig: (batch.canonical_hash || '0xe8b47f31920ac458d91c28741005b637a91bf2095f462a8d4b3c91e127389ab4').slice(0, 10)
  };

  const offlineQrValue = `HONEYCHAIN:${JSON.stringify(offlinePayloadObj)}`;

  const activeQrValue = qrMode === 'online' ? onlineVerificationUrl : offlineQrValue;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeQrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    onClose();
    if (qrMode === 'offline') {
      navigate(`/consumer/verify/${batchId}?mode=offline&data=${encodeURIComponent(JSON.stringify(offlinePayloadObj))}`);
    } else {
      navigate(`/consumer/verify/${batchId}`);
    }
  };

  const handleDownload = () => {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 80;

      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#1E293B';
        ctx.textAlign = 'center';
        ctx.fillText(batchId, canvas.width / 2, canvas.height - 35);

        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#D97706';
        ctx.fillText(`HoneyChain ${qrMode === 'offline' ? 'Offline Seal' : 'Live Verification'}`, canvas.width / 2, canvas.height - 15);
      }

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${batchId}-HoneyChain-${qrMode}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code — ${batchId}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 40px; }
            .card { border: 2px solid #F59E0B; border-radius: 16px; padding: 30px; display: inline-block; background: #FFFBEB; }
            h2 { margin: 10px 0 5px; color: #0F172A; }
            p { margin: 0 0 15px; color: #D97706; font-weight: bold; }
            .url { font-family: monospace; font-size: 11px; color: #64748B; word-break: break-all; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="card">
            ${qrRef.current?.innerHTML}
            <h2>${batchId}</h2>
            <p>HoneyChain Authenticity Verified (${qrMode.toUpperCase()})</p>
            <div class="url">${activeQrValue}</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPdf = () => {
    generateHoneyPassportPDF(batch, qrMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-amber-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3.5 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-amber-100" />
            <div>
              <h3 className="font-bold text-base leading-tight">{t('batchQRTitle')}</h3>
              <p className="text-[11px] text-amber-100">{t('officialMobileTag')}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-white hover:bg-black/20 p-1.5 rounded-xl transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setQrMode('online')}
            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all ${
              qrMode === 'online'
                ? 'bg-white text-amber-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('qrModeOnline')}</span>
          </button>

          <button
            type="button"
            onClick={() => setQrMode('offline')}
            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all ${
              qrMode === 'offline'
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('qrModeOffline')}</span>
          </button>
        </div>

        {/* QR Display Container */}
        <div className="p-5 sm:p-6 text-center space-y-3.5 overflow-y-auto flex-1">
          
          {/* Mode Explanation Notice */}
          <div className={`p-3 rounded-xl text-left space-y-1 text-xs border ${
            qrMode === 'online' ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}>
            <div className="font-bold flex items-center space-x-1">
              {qrMode === 'online' ? <Globe className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{qrMode === 'online' ? 'Mode A: Live Online Verification' : 'Mode B: Offline Cryptographic Stamp'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {qrMode === 'online' ? t('onlineQRDesc') : t('offlineQRDesc')}
            </p>
          </div>

          {/* Mobile Wi-Fi Config (Online Mode only) */}
          {qrMode === 'online' && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                  <Wifi className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Phone Wi-Fi Host IP</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-[10px] font-bold text-amber-700 hover:underline flex items-center space-x-0.5"
                >
                  <Info className="w-3 h-3 inline" />
                  <span>Help</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-500 font-semibold shrink-0">Host:</span>
                <input
                  type="text"
                  value={customHost}
                  onChange={(e) => setCustomHost(e.target.value)}
                  placeholder="e.g. 192.168.1.15:5173"
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {showHelp && (
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1 animate-in fade-in">
                  <p className="font-bold text-slate-800">Phone Scanning Checklist:</p>
                  <p>1. Connect phone & PC to the same Wi-Fi.</p>
                  <p>2. Verify PC IP address: <code className="bg-slate-100 font-mono px-1">{lanIp}:5173</code>.</p>
                  <p>3. In production, set <code className="bg-slate-100 font-mono px-1">VITE_PUBLIC_APP_URL</code>.</p>
                </div>
              )}
            </div>
          )}

          {/* QR Code SVG */}
          <div className="inline-block p-4 bg-amber-50/80 rounded-2xl border-2 border-amber-200 shadow-inner" ref={qrRef}>
            <QRCodeSVG
              value={activeQrValue}
              size={190}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23D97706'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>",
                x: undefined,
                y: undefined,
                height: 32,
                width: 32,
                excavate: true,
              }}
            />
          </div>

          <div className="space-y-0.5">
            <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md font-mono text-sm font-bold border border-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>{batchId}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {batch.honey_type || batch.flora_source || 'Multifloral Honey'} • {batch.quantity_kg || 24.5} kg
            </p>
          </div>

          {/* Verification Value Pill */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-600 truncate max-w-[210px] text-left text-[11px]">{activeQrValue}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-white rounded-lg transition-colors shrink-0 flex items-center space-x-1"
              title="Copy"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] text-emerald-600 font-bold">{t('copiedText')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">{t('copyLink')}</span>
                </>
              )}
            </button>
          </div>

          {/* Download Official Offline PDF Passport Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <FileDown className="w-4 h-4 text-emerald-200" />
            <span>Download Official PDF Passport (Works Offline)</span>
          </button>

          {/* Instant Mobile Scan Simulation Button */}
          <button
            type="button"
            onClick={handleSimulateScan}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>{t('simulateMobileScan')}</span>
          </button>

          {/* Action buttons (Download, Print, Open Link) */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleDownload}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>{t('downloadQR')}</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>{t('printQR')}</span>
            </button>
            {qrMode === 'online' ? (
              <a
                href={onlineVerificationUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1 shadow-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t('openLink')}</span>
              </a>
            ) : (
              <button
                onClick={handleSimulateScan}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1 shadow-xs transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify</span>
              </button>
            )}
          </div>

          {/* Explicit Close Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl text-xs transition-colors border border-slate-200"
            >
              ✕ Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
