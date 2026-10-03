import React from 'react';
import { Link } from 'react-router-dom';
import { useHypothesis } from '../context/HypothesisContext';
import StatCard from '../components/StatCard';
import ResultPanel from '../components/ResultPanel';
import MarksHistogram from '../components/MarksHistogram';
import MeanComparisonChart from '../components/MeanComparisonChart';
import {
  Users,
  TrendingUp,
  Activity,
  Target,
  Percent,
  Compass,
  ArrowRight,
  Calculator,
  ListOrdered,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export default function Dashboard() {
  const { testResult, marksString, claimedMean, significanceLevel, testType } = useHypothesis();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Module VII: Testing of Hypothesis – I
            </span>
            <span className="text-xs text-slate-500 font-mono">B.Tech Mathematics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Student Performance Hypothesis Testing Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Statistical evaluation of university examination scores using Student's One-Sample t-Test.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/hypothesis-test"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <Calculator className="w-4 h-4" />
            <span>Interactive Test Form</span>
          </Link>
          <Link
            to="/step-by-step"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-medium shadow-sm transition-all"
          >
            <ListOrdered className="w-4 h-4 text-slate-500" />
            <span>Step-by-Step</span>
          </Link>
        </div>
      </div>

      {/* College Claim Scenario Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-brand-300 font-semibold tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Active Hypothesis Scenario</span>
          </div>
          <p className="text-sm md:text-base font-medium text-slate-100">
            A college claims that the average examination score of students is <span className="text-amber-300 font-bold font-mono">{claimedMean} marks</span>. We test whether the population mean differs significantly from {claimedMean}.
          </p>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-navy-800/80 border border-navy-700">
            <span className="text-slate-400 block text-[10px]">Claimed (μ₀)</span>
            <span className="font-bold text-emerald-400">{claimedMean} Marks</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-navy-800/80 border border-navy-700">
            <span className="text-slate-400 block text-[10px]">Alpha (α)</span>
            <span className="font-bold text-brand-300">{significanceLevel}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-navy-800/80 border border-navy-700">
            <span className="text-slate-400 block text-[10px]">Tail</span>
            <span className="font-bold text-amber-300 capitalize">{testType}</span>
          </div>
        </div>
      </div>

      {/* 8 Statistic Cards */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Statistical Parameters & Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Number of Observations"
            formula="n"
            value={testResult && !testResult.isZeroVariance ? testResult.n : '—'}
            subtitle="Total student examination scores analyzed"
            icon={Users}
            variant="navy"
            badge="Sample Size"
            to="/step-by-step"
          />
          <StatCard
            title="Sample Mean"
            formula="x̄ = Σxᵢ / n"
            value={
              testResult && !testResult.isZeroVariance
                ? `${testResult.mean.toFixed(2)}`
                : '—'
            }
            subtitle={`Sum of marks = ${testResult && !testResult.isZeroVariance ? Number(testResult.sum).toFixed(1) : 0}`}
            icon={TrendingUp}
            variant="blue"
            badge="Calculated"
            to="/step-by-step"
          />
          <StatCard
            title="Sample Standard Deviation"
            formula="s = √[Σ(xᵢ - x̄)² / (n - 1)]"
            value={
              testResult && !testResult.isZeroVariance
                ? `${testResult.s.toFixed(2)}`
                : testResult?.isZeroVariance
                  ? '0.00'
                  : '—'
            }
            subtitle={
              testResult && !testResult.isZeroVariance
                ? `Standard Error: ±${testResult.se.toFixed(3)}`
                : 'Degenerate variance'
            }
            icon={Activity}
            variant="default"
            badge={testResult && !testResult.isZeroVariance ? `df = ${testResult.df}` : 'df: —'}
            to="/step-by-step"
          />
          <StatCard
            title="Claimed Population Mean"
            formula="μ₀"
            value={`${claimedMean}`}
            subtitle="College benchmark examination score"
            icon={Target}
            variant="amber"
            badge="Null Value"
            to="/hypothesis-test"
          />
          <StatCard
            title="Significance Level"
            formula="α = P(Type I Error)"
            value={`${significanceLevel}`}
            subtitle={`Tolerance for Type I error: ${(significanceLevel * 100).toFixed(0)}%`}
            icon={Percent}
            variant="default"
            badge="Risk Threshold"
            to="/hypothesis-test"
          />
          <StatCard
            title="Calculated t-Statistic"
            formula="t = (x̄ - μ₀) / (s / √n)"
            value={
              testResult && !testResult.isZeroVariance
                ? `${testResult.t.toFixed(4)}`
                : 'Undefined'
            }
            subtitle={
              testResult && !testResult.isZeroVariance
                ? `Critical threshold: ${testResult.criticalValues.display}`
                : 'Division by zero variance'
            }
            icon={Compass}
            variant={
              testResult && !testResult.isZeroVariance
                ? testResult.isReject
                  ? 'rose'
                  : 'emerald'
                : 'default'
            }
            badge={testResult && !testResult.isZeroVariance ? `df = ${testResult.df}` : '—'}
            to="/visualizations"
          />
          <StatCard
            title="Calculated p-Value"
            formula="P(T ≥ |t| | H₀)"
            value={
              testResult && !testResult.isZeroVariance
                ? testResult.pValue < 0.0001
                  ? '< 0.0001'
                  : testResult.pValue.toFixed(4)
                : '—'
            }
            subtitle={
              testResult && !testResult.isZeroVariance
                ? testResult.pValue < significanceLevel
                  ? 'Significant: p < α'
                  : 'Not significant: p ≥ α'
                : 'Awaiting test'
            }
            icon={Percent}
            variant={
              testResult && !testResult.isZeroVariance
                ? testResult.pValue < significanceLevel
                  ? 'rose'
                  : 'emerald'
                : 'default'
            }
            badge="Exact Integral"
            to="/visualizations"
          />
          <StatCard
            title="Final Hypothesis Decision"
            formula="Decision Rule"
            value={testResult && !testResult.isZeroVariance ? testResult.decision : 'Pending'}
            subtitle={
              testResult && !testResult.isZeroVariance
                ? testResult.isReject
                  ? 'Reject H₀ in favor of H₁'
                  : 'Fail to Reject H₀'
                : 'Please run test'
            }
            icon={Target}
            variant={
              testResult && !testResult.isZeroVariance
                ? testResult.isReject
                  ? 'rose'
                  : 'emerald'
                : 'default'
            }
            badge={testResult && !testResult.isZeroVariance ? (testResult.isReject ? 'Significant' : 'Inconclusive') : '—'}
            to="/hypothesis-test"
          />
        </div>
      </div>

      {/* Result Panel Component */}
      <ResultPanel result={testResult} />

      {/* Visualizations Quick Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarksHistogram
          marks={testResult?.marks || []}
          sampleMean={testResult?.mean}
          claimedMean={claimedMean}
        />
        <MeanComparisonChart
          sampleMean={testResult?.mean}
          claimedMean={claimedMean}
          se={testResult?.se}
          s={testResult?.s}
          n={testResult?.n}
        />
      </div>

      {/* Quick Navigation Footer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Link
          to="/step-by-step"
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-elevated transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-semibold text-slate-800 text-sm group-hover:text-brand-600 transition-colors">
              Step-by-Step Mathematical Solution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              View all 14 steps with formulas and substitutions for assignment submission.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </Link>

        <Link
          to="/visualizations"
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-elevated transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-semibold text-slate-800 text-sm group-hover:text-brand-600 transition-colors">
              Interactive Decision Region Curve
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect Student's t distribution curve with critical values and rejection tails.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </Link>

        <Link
          to="/error-types"
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-elevated transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-semibold text-slate-800 text-sm group-hover:text-brand-600 transition-colors">
              Type I & Type II Error Analysis
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Understand α, β, and trade-offs in university exam score evaluations.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}
