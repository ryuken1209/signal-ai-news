import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { generateHistogramData } from '../utils/statistics';

export default function MarksHistogram({ marks = [], sampleMean, claimedMean }) {
  const chartData = useMemo(() => {
    if (!marks || marks.length === 0) return [];
    return generateHistogramData(marks, 5);
  }, [marks]);

  if (!marks || marks.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-300 text-sm text-slate-400">
        No marks available for distribution chart
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-navy-900 text-white text-xs p-3 rounded-lg shadow-lg border border-navy-700">
          <p className="font-semibold text-brand-300">Score Range: {data.range} Marks</p>
          <p className="mt-1">Frequency: <span className="font-bold text-white">{data.count}</span> students</p>
          <p>Percentage: <span className="font-bold text-emerald-400">{data.percentage}%</span> of cohort</p>
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
            Chart A: Student Examination Marks Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Grouped frequency histogram of {marks.length} student scores (bin width = 5 marks)
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-brand-500 inline-block" />
            <span className="text-slate-600">Student Count</span>
          </div>
          {sampleMean !== undefined && (
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
              <span className="text-slate-600 font-mono">x̄ = {sampleMean.toFixed(1)}</span>
            </div>
          )}
          {claimedMean !== undefined && (
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-amber-500 inline-block border-t border-dashed border-amber-600" />
              <span className="text-slate-600 font-mono">μ₀ = {claimedMean}</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: 'Marks Range',
                position: 'insideBottom',
                offset: -15,
                fontSize: 11,
                fill: '#64748b',
                fontWeight: 600,
              }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: 'Number of Students',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                fontSize: 11,
                fill: '#64748b',
                fontWeight: 600,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              animationDuration={600}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
