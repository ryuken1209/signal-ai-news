import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { generateDistributionCurveData } from '../utils/statistics';
import { CheckCircle2, AlertOctagon } from 'lucide-react';

export default function DecisionRegionChart({
  df = 29,
  tObserved = 0,
  testType = 'two-tailed',
  alpha = 0.05,
  isReject = false,
  criticalValues = {},
}) {
  const { curveData, leftCrit, rightCrit, minX, maxX } = useMemo(() => {
    return generateDistributionCurveData(df, tObserved, testType, alpha, 100);
  }, [df, tObserved, testType, alpha]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pt = payload[0].payload;
      return (
        <div className="bg-navy-900 text-white text-xs p-3 rounded-lg shadow-lg border border-navy-700">
          <p className="font-semibold text-brand-300">t = {pt.x.toFixed(3)}</p>
          <p>Density f(t): <span className="font-mono text-slate-200">{pt.density.toFixed(4)}</span></p>
          <p className="mt-1">
            Region:{' '}
            <span
              className={`font-semibold ${
                pt.isRejection ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {pt.isRejection ? 'Rejection Region (Critical)' : 'Non-Rejection / Acceptance'}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Chart C: Student's t-Distribution & Decision Regions
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-200">
              df = {df}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Probability density function f(t, {df}) with shaded rejection region(s) at α = {alpha}
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center space-x-2">
          {isReject ? (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span>Observed t falls in Rejection Region</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Observed t falls in Non-Rejection Region</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend & Parameters Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200/80 mb-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-brand-200 border border-brand-400 inline-block" />
            <span className="text-slate-700 font-medium">Acceptance Region (1 - α)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-400 border border-rose-500 inline-block" />
            <span className="text-slate-700 font-medium">Rejection Region (α)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 bg-rose-600 inline-block" />
            <span className="text-slate-700 font-mono">Critical Value: {criticalValues.display}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 bg-navy-950 inline-block border-t-2 border-navy-950" />
            <span className="text-slate-900 font-mono font-bold">Observed t: {tObserved.toFixed(4)}</span>
          </div>
        </div>

        <div className="font-mono text-slate-500 text-[11px]">
          Test Type: <span className="font-semibold text-slate-800 capitalize">{testType}</span>
        </div>
      </div>

      {/* Recharts Area Curve */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={curveData}
            margin={{ top: 20, right: 30, left: -10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
            <XAxis
              dataKey="x"
              type="number"
              domain={[minX, maxX]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: "Student's t-Statistic",
                position: 'insideBottom',
                offset: -15,
                fontSize: 11,
                fill: '#64748b',
                fontWeight: 600,
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: 'Probability Density f(t)',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                fontSize: 11,
                fill: '#64748b',
                fontWeight: 600,
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Non-rejection / Acceptance area */}
            <Area
              type="monotone"
              dataKey="acceptanceDensity"
              stroke="#3b82f6"
              fill="#bfdbfe"
              fillOpacity={0.6}
              isAnimationActive={false}
            />

            {/* Rejection area */}
            <Area
              type="monotone"
              dataKey="rejectionDensity"
              stroke="#e11d48"
              fill="#f43f5e"
              fillOpacity={0.7}
              isAnimationActive={false}
            />

            {/* Reference Line for Left Critical Value */}
            {leftCrit !== null && (
              <ReferenceLine
                x={Number(leftCrit.toFixed(3))}
                stroke="#e11d48"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `-t_crit (${leftCrit.toFixed(2)})`,
                  position: 'top',
                  fill: '#be123c',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            )}

            {/* Reference Line for Right Critical Value */}
            {rightCrit !== null && (
              <ReferenceLine
                x={Number(rightCrit.toFixed(3))}
                stroke="#e11d48"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `+t_crit (${rightCrit.toFixed(2)})`,
                  position: 'top',
                  fill: '#be123c',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            )}

            {/* Reference Line for Center Zero */}
            <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="2 2" />

            {/* Reference Line for Observed t */}
            <ReferenceLine
              x={Number(tObserved.toFixed(3))}
              stroke="#0f172a"
              strokeWidth={3}
              label={{
                value: `t_calc = ${tObserved.toFixed(2)}`,
                position: 'insideTopRight',
                fill: '#0f172a',
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: '#ffffff',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Decision Summary Footer */}
      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="text-slate-600">
          <span className="font-semibold text-slate-800">Decision Condition: </span>
          {testType === 'two-tailed' && (
            <span>Reject H₀ if |t| &gt; {Math.abs(rightCrit || 0).toFixed(4)}</span>
          )}
          {testType === 'right-tailed' && (
            <span>Reject H₀ if t &gt; {(rightCrit || 0).toFixed(4)}</span>
          )}
          {testType === 'left-tailed' && (
            <span>Reject H₀ if t &lt; {(leftCrit || 0).toFixed(4)}</span>
          )}
        </div>
        <div className="font-mono font-semibold">
          Observed t = {tObserved.toFixed(4)} →{' '}
          <span className={isReject ? 'text-rose-700' : 'text-emerald-700'}>
            {isReject ? 'Falls in Rejection Region (Reject H₀)' : 'Falls in Acceptance Region (Fail to Reject H₀)'}
          </span>
        </div>
      </div>
    </div>
  );
}
