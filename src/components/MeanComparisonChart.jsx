import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';

export default function MeanComparisonChart({ sampleMean, claimedMean, se, s, n }) {
  if (sampleMean === undefined || claimedMean === undefined) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-300 text-sm text-slate-400">
        No mean comparison data available
      </div>
    );
  }

  const numClaimed = Number(claimedMean);
  const numSample = Number(sampleMean);
  const diff = numSample - numClaimed;
  const percentDiff = numClaimed !== 0 ? ((diff / numClaimed) * 100).toFixed(2) : '0';

  const chartData = [
    {
      name: 'Claimed Mean (μ₀)',
      value: Number(numClaimed.toFixed(2)),
      color: '#475569', // slate-600
      type: 'Claimed Population Mean',
    },
    {
      name: 'Sample Mean (x̄)',
      value: Number(numSample.toFixed(2)),
      color: diff >= 0 ? '#2563eb' : '#0284c7', // brand blue
      type: 'Observed Sample Mean',
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-navy-900 text-white text-xs p-3 rounded-lg shadow-lg border border-navy-700">
          <p className="font-semibold text-brand-300">{data.name}</p>
          <p className="mt-1">
            Score: <span className="font-bold text-white font-mono">{data.value} marks</span>
          </p>
          <p className="text-slate-300 text-[11px]">{data.type}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Chart B: Mean Comparison Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparison between Claimed Mean (μ₀) and Observed Sample Mean (x̄)
          </p>
        </div>

        {/* Delta Callout Badge */}
        <div className="flex items-center space-x-2">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold font-mono border ${
              diff > 0
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : diff < 0
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            Δ = {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} marks ({diff >= 0 ? `+${percentDiff}%` : `${percentDiff}%`})
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
        {/* Recharts Bar Comparison */}
        <div className="h-64 lg:col-span-2 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }}
              />
              <YAxis
                domain={[Math.max(0, Math.floor(Math.min(numSample, numClaimed) - 10)), Math.min(100, Math.ceil(Math.max(numSample, numClaimed) + 10))]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{
                  value: 'Marks (out of 100)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  fontSize: 11,
                  fill: '#64748b',
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={70}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Statistical Metrics Breakdown */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Claimed Mean (μ₀):</span>
            <span className="font-bold text-slate-900 font-mono">{claimedMean} marks</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Sample Mean (x̄):</span>
            <span className="font-bold text-brand-700 font-mono">{sampleMean.toFixed(2)} marks</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Observed Difference (x̄ - μ₀):</span>
            <span className="font-bold font-mono text-slate-900">
              {diff > 0 ? `+${diff.toFixed(4)}` : diff.toFixed(4)}
            </span>
          </div>
          {se !== undefined && (
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-600 font-medium">Standard Error (s/√n):</span>
              <span className="font-mono text-slate-700 font-bold">±{se.toFixed(4)}</span>
            </div>
          )}
          {se !== undefined && (
            <div className="pt-1">
              <span className="text-slate-500 block mb-1">Standardized Effect:</span>
              <div className="font-mono text-slate-800 bg-white p-2 rounded border border-slate-200 text-[11px]">
                t = (x̄ - μ₀) / SE = {diff.toFixed(2)} / {se.toFixed(3)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
