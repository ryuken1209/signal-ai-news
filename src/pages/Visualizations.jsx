import React, { useState } from 'react';
import { useHypothesis } from '../context/HypothesisContext';
import MarksHistogram from '../components/MarksHistogram';
import MeanComparisonChart from '../components/MeanComparisonChart';
import DecisionRegionChart from '../components/DecisionRegionChart';
import {
  BarChart3,
  HelpCircle,
  Eye,
  Info,
  Maximize2,
  CheckCircle2,
  AlertOctagon,
  Scale,
} from 'lucide-react';

export default function Visualizations() {
  const { testResult, claimedMean, significanceLevel, testType } = useHypothesis();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'distribution' | 'comparison' | 'decision-region'

  if (!testResult || testResult.isZeroVariance) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-card">
        <BarChart3 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">
          Visualizations Unavailable
        </h2>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
          {testResult?.isZeroVariance
            ? 'The sample standard deviation is zero. Please use a dataset with non-zero variation.'
            : 'Please enter student examination marks to generate statistical visualizations.'}
        </p>
      </div>
    );
  }

  const { marks, mean, s, se, n, df, t, pValue, criticalValues, isReject, decision } = testResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Graphical Analytics
            </span>
            <span className="text-xs text-slate-500 font-mono">Recharts Visualization Suite</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Data Visualization & Decision Region Mapping
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Interactive charts displaying mark frequencies, sample mean differences, and Student's t distribution tails.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Charts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('decision-region')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'decision-region'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chart C (t-Curve)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'comparison'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chart B (Means)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('distribution')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'distribution'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chart A (Histogram)
          </button>
        </div>
      </div>

      {/* Decision Region Banner Alert */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg flex items-center justify-center ${
              isReject ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {isReject ? <AlertOctagon className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Visual Test Conclusion
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                t = {t.toFixed(4)}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {decision} — Observed t-statistic falls {isReject ? 'inside the rejection tail region' : 'inside the non-rejection acceptance region'}.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">Critical Limit</span>
            <span className="font-bold text-slate-800">{criticalValues.display}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">p-Value</span>
            <span className="font-bold text-brand-700">
              {pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart C: Decision Region (Featured on top or according to tab) */}
      {(activeTab === 'all' || activeTab === 'decision-region') && (
        <div className="space-y-2">
          <DecisionRegionChart
            df={df}
            tObserved={t}
            testType={testType}
            alpha={significanceLevel}
            isReject={isReject}
            criticalValues={criticalValues}
          />
          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-blue-900 flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Mathematical Interpretation of Chart C:</strong> The shaded blue area represents the non-rejection (acceptance) zone containing (1 - α) of the probability mass. The crimson tails contain α probability mass. When the calculated t-statistic (bold black vertical line) falls past the critical threshold line, H₀ is rejected.
            </p>
          </div>
        </div>
      )}

      {/* Chart A: Histogram & Chart B: Mean Comparison */}
      {(activeTab === 'all' || activeTab === 'distribution' || activeTab === 'comparison') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(activeTab === 'all' || activeTab === 'distribution') && (
            <MarksHistogram
              marks={marks}
              sampleMean={mean}
              claimedMean={claimedMean}
            />
          )}

          {(activeTab === 'all' || activeTab === 'comparison') && (
            <MeanComparisonChart
              sampleMean={mean}
              claimedMean={claimedMean}
              se={se}
              s={s}
              n={n}
            />
          )}
        </div>
      )}

      {/* Descriptive Statistics Summary Card */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-card">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
          Statistical Summary of Plotted Data
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block">Total Sample (n)</span>
            <span className="font-mono font-bold text-slate-800 text-sm mt-0.5">{n} students</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block">Lowest Score (Min)</span>
            <span className="font-mono font-bold text-slate-800 text-sm mt-0.5">{testResult.desc.min} marks</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block">Highest Score (Max)</span>
            <span className="font-mono font-bold text-slate-800 text-sm mt-0.5">{testResult.desc.max} marks</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block">Median Score</span>
            <span className="font-mono font-bold text-slate-800 text-sm mt-0.5">{testResult.desc.median.toFixed(1)} marks</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block">Sample Variance (s²)</span>
            <span className="font-mono font-bold text-slate-800 text-sm mt-0.5">{testResult.desc.variance.toFixed(3)}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block">Standard Error (SE)</span>
            <span className="font-mono font-bold text-slate-800 text-sm mt-0.5">±{se.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
