import { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, Users, ClipboardList, Box, Package, Scale, UserCheck } from 'lucide-react';
import api from '../services/api';
import { getSupabaseHives, getSupabaseHoneyBatches, isSupabaseConfigured } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState(null);
  const [highRiskHives, setHighRiskHives] = useState([]);
  const [beekeepers, setBeekeepers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        let metricsData = null;
        let highRiskHivesData = [];

        if (isSupabaseConfigured()) {
          const hives = await getSupabaseHives();
          const batches = await getSupabaseHoneyBatches();
          if (hives && batches) {
            metricsData = {
              totalHives: hives.length,
              totalBeekeepers: 1,
              production: {
                totalBatches: batches.length,
                totalHarvestedKg: batches.reduce((sum, b) => sum + (b.quantity_kg || 0), 0)
              },
              verified_batches: batches.filter(b => b.quality_status === 'Verified').length,
              actions_this_month: 0
            };
            highRiskHivesData = hives
              .filter(h => h.status === 'ATTENTION' || h.status === 'RECOVERING')
              .map(h => ({
                hive_code: h.hive_code,
                health_score: h.status === 'ATTENTION' ? 65 : 72,
                risk_level: 'High'
              }));
          }
        }

        const [mRes, bRes, aRes] = await Promise.allSettled([
          !metricsData ? api.get('/admin/metrics') : Promise.resolve({ data: { metrics: metricsData, highRiskHives: highRiskHivesData } }),
          api.get('/admin/beekeepers'),
          api.get('/admin/audit-logs?limit=50'),
        ]);
        if (mRes.status === 'fulfilled') {
          setMetrics(mRes.value.data.metrics || mRes.value.data);
          setHighRiskHives(mRes.value.data.highRiskHives || []);
        }
        if (bRes.status === 'fulfilled') setBeekeepers(bRes.value.data.beekeepers || []);
        if (aRes.status === 'fulfilled') setAuditLogs(aRes.value.data.logs || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4 inline mr-1.5" /> },
    { id: 'hives', label: 'High-Risk Hives', icon: <AlertTriangle className="w-4 h-4 inline mr-1.5 text-red-500" /> },
    { id: 'beekeepers', label: 'Beekeepers', icon: <Users className="w-4 h-4 inline mr-1.5" /> },
    { id: 'audit', label: 'Audit Log', icon: <ClipboardList className="w-4 h-4 inline mr-1.5" /> },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('adminTitle')}</h1>
        <p className="text-gray-500 mt-1">{t('adminSub')}</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={'flex-1 px-4 py-2 rounded-md text-sm font-medium transition flex items-center justify-center ' + (activeTab === t.id ? 'bg-white shadow text-amber-700' : 'text-gray-600 hover:text-gray-900')}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Hives', value: metrics.totalHives ?? '—', icon: <Box className="w-6 h-6 text-amber-600" />, color: 'amber' },
              { label: 'Active Beekeepers', value: metrics.totalBeekeepers ?? '—', icon: <UserCheck className="w-6 h-6 text-blue-600" />, color: 'blue' },
              { label: 'Honey Batches', value: metrics.production?.totalBatches ?? '—', icon: <Package className="w-6 h-6 text-emerald-600" />, color: 'green' },
              { label: 'Total Harvest', value: metrics.production?.totalHarvestedKg != null ? metrics.production.totalHarvestedKg + ' kg' : '—', icon: <Scale className="w-6 h-6 text-red-600" />, color: 'red' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{c.label}</p>
                    <p className={'text-3xl font-bold text-' + c.color + '-600 mt-1'}>{c.value}</p>
                  </div>
                  {c.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Platform Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High-risk hives</span>
                  <span className="font-bold text-red-600">{highRiskHives.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Verified batches</span>
                  <span className="font-bold text-green-600">{metrics.verified_batches ?? '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Actions this month</span>
                  <span className="font-bold text-blue-600">{metrics.actions_this_month ?? '—'}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Alerts</h3>
              {highRiskHives.length === 0 ? (
                <p className="text-gray-500 text-sm">No high-risk alerts detected</p>
              ) : (
                <div className="space-y-2">
                  {highRiskHives.slice(0, 4).map((h, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{h.hive_code}</p>
                        <p className="text-xs text-gray-500">Score: {parseFloat(h.health_score || 0).toFixed(1)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* High-Risk Hives Tab */}
      {activeTab === 'hives' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hive</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {highRiskHives.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No high-risk hives detected</td></tr>
              ) : (
                highRiskHives.map((h, i) => (
                  <tr key={i} className="hover:bg-red-50">
                    <td className="px-6 py-4 font-medium">{h.hive_code}</td>
                    <td className="px-6 py-4">
                      <span className="text-red-600 font-bold">{parseFloat(h.health_score || 0).toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">{h.risk_level || 'High'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{h.owner || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Beekeepers Tab */}
      {activeTab === 'beekeepers' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hives</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {beekeepers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No beekeepers found</td></tr>
              ) : (
                beekeepers.map((bk, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{bk.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{bk.email}</td>
                    <td className="px-6 py-4 text-sm">{bk.hive_count ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (bk.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                        {bk.status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLogs.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No audit logs</td></tr>
                ) : (
                  auditLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-gray-50 text-sm">
                      <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{new Date(log.created_at || log.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-3 font-medium">{log.user_email || log.user_id || '—'}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{log.action}</span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">{log.resource_type} {log.resource_id ? '#' + log.resource_id : ''}</td>
                      <td className="px-6 py-3 text-gray-500 max-w-xs truncate">{log.details || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
