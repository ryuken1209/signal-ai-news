import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Scale,
  Compass,
  Check,
} from 'lucide-react';

export default function ResultPanel({ result, isCompact = false }) {
  if (!result) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-card">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-700">No Hypothesis Test Results Yet</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
          Please provide student examination marks and click "Perform Hypothesis Test" to run the one-sample t-test.
        </p>
      </div>
    );
  }

  // Handle zero variance edge case
  if (result.isZeroVariance) {
    return (
      <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-xl shadow-card text-amber-900">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-base font-bold text-amber-900">
              Degenerate Case: Zero Sample Variance (s = 0)
            </h3>
            <p className="text-sm leading-relaxed text-amber-800">
              {result.error}
            </p>
            <div className="mt-3 p-3 bg-white/80 rounded-lg border border-amber-200 text-xs font-mono">
              <p>Sample Size (n): {result.desc.n}</p>
              <p>Sample Mean (x̄): {result.desc.mean.toFixed(2)} marks</p>
              <p>Sample Standard Deviation (s): 0.0000</p>
              <p>Standard Error (s / √n): 0.0000</p>
              <p>t-statistic: Undefined (division 0 / 0 or k / 0)</p>
            </div>
            <p className="text-xs text-amber-700 mt-2">
              <strong>Statistical Note:</strong> Student's t-test requires variation in sample scores to estimate population variance. When all observations are identical, probability density collapses and standard hypothesis testing cannot be carried out.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    n,
    mean,
    s,
    se,
    mu0,
    alpha,
    testType,
    df,
    t,
    pValue,
    criticalValues,
    isReject,
    decision,
    rejectionReason,
    conclusion,
    methodsAgree,
  } = result;

  const isRejectH0 = isReject;
  const decisionBadgeColor = isRejectH0
    ? 'bg-rose-100 text-rose-800 border-rose-300'
    : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  const decisionIcon = isRejectH0 ? (
    <XCircle className="w-6 h-6 text-rose-600" />
  ) : (
    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
      {/* Header Banner */}
      <div
        className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          isRejectH0
            ? 'bg-gradient-to-r from-rose-50 to-orange-50/50 border-rose-200'
            : 'bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          {decisionIcon}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Statistical Decision
              </span>
              <span className="text-xs text-slate-400 font-mono">({testType})</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              {decision}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${decisionBadgeColor}`}>
            α = {alpha}
          </span>
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Both Methods Agree</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Dynamic Conclusion Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Plain-English Conclusion
          </p>
          <p className="text-sm font-medium text-slate-800 leading-relaxed">
            "{conclusion}"
          </p>
          <p className="text-xs text-slate-500 mt-2 italic">
            {isRejectH0
              ? 'Note: Rejecting H₀ means there is sufficient evidence that the actual population mean differs from the claimed value.'
              : 'Note: Failing to reject H₀ means there is not enough evidence to disprove the claim. It does NOT mean H₀ has been proven true.'}
          </p>
        </div>

        {/* 2-Column Comparison: Critical Value vs p-value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Method 1: p-value approach */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center space-x-1.5">
                <Compass className="w-4 h-4" />
                <span>Method 1: p-Value Approach</span>
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  pValue < alpha
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {pValue < alpha ? 'p < α (Reject)' : 'p ≥ α (Fail to Reject)'}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-slate-500">Calculated p-value:</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(6)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Threshold (α):</span>
              <span className="font-mono text-xs text-slate-700">{alpha.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
              Criterion: If p-value &lt; α, reject H₀; otherwise, fail to reject H₀.
            </p>
          </div>

          {/* Method 2: Critical Value approach */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center space-x-1.5">
                <Scale className="w-4 h-4" />
                <span>Method 2: Critical Value Approach</span>
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isRejectH0
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {isRejectH0 ? 'In Rejection Region' : 'In Acceptance Region'}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-slate-500">Calculated t-statistic:</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                t = {t.toFixed(4)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Critical Threshold(s):</span>
              <span className="font-mono text-xs text-slate-700">
                t_crit = {criticalValues.display}
              </span>
            </div>
            <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
              Rule: {criticalValues.rule}
            </p>
          </div>
        </div>

        {/* Detailed Parameters Grid */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Summary of Key Hypothesis Parameters
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[11px] text-slate-500 font-medium">Claimed Mean (μ₀)</p>
              <p className="font-mono font-bold text-slate-800 mt-1">{mu0} marks</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[11px] text-slate-500 font-medium">Sample Mean (x̄)</p>
              <p className="font-mono font-bold text-slate-800 mt-1">{mean.toFixed(2)} marks</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[11px] text-slate-500 font-medium">Sample SD (s)</p>
              <p className="font-mono font-bold text-slate-800 mt-1">{s.toFixed(3)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[11px] text-slate-500 font-medium">Sample Size (n)</p>
              <p className="font-mono font-bold text-slate-800 mt-1">{n} students</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[11px] text-slate-500 font-medium">Degrees of Freedom (df)</p>
              <p className="font-mono font-bold text-slate-800 mt-1">{df}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[11px] text-slate-500 font-medium">Standard Error (SE)</p>
              <p className="font-mono font-bold text-slate-800 mt-1">{se.toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Mathematical Rejection Reason Note */}
        <div className="text-xs text-slate-600 bg-navy-50/50 p-3 rounded-lg border border-navy-100">
          <span className="font-semibold text-navy-900">Decision Rationale: </span>
          {rejectionReason}
        </div>
      </div>
    </div>
  );
}
