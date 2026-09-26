import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { Info } from 'lucide-react';

export default function MultiSignalChart({ readings = [] }) {
  if (!readings || readings.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No telemetry time-series recorded yet.
      </div>
    );
  }

  const formattedData = readings.map((r) => {
    const d = new Date(r.timestamp);
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      time: timeStr,
      temperature: r.temperature,
      humidity: r.humidity,
      weight: r.weight,
      net_traffic: r.net_bee_traffic,
      acoustics: r.acoustic_peak_hz
    };
  });

  return (
    <div className="space-y-4">
      
      {/* Recharts Render */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} />
            <YAxis yAxisId="temp" stroke="#EF4444" fontSize={11} domain={[25, 45]} unit="°C" />
            <YAxis yAxisId="hum" orientation="right" stroke="#3B82F6" fontSize={11} domain={[30, 95]} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '0.75rem',
                borderColor: '#FEF3C7',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              name="Brood Temp (°C)"
              stroke="#EF4444"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              yAxisId="hum"
              type="monotone"
              dataKey="humidity"
              name="Internal Humidity (%)"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="weight"
              name="Scale Weight (kg)"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="hum"
              type="monotone"
              dataKey="net_traffic"
              name="Flight Traffic (bees/min)"
              stroke="#F59E0B"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Judge-Friendly Explanation Box */}
      <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs space-y-1">
        <span className="font-extrabold text-amber-900 block flex items-center space-x-1">
          <Info className="w-4 h-4 text-amber-600" />
          <span>What this means</span>
        </span>
        <p className="text-slate-700 leading-relaxed font-medium">
          Temperature and humidity are monitored because environmental changes can directly affect hive activity and colony condition. Changes in hive weight indicate food stores or honey accumulation.
        </p>
      </div>

    </div>
  );
}
