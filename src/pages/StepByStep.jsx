import React, { useState } from 'react';
import { useHypothesis } from '../context/HypothesisContext';
import {
  Printer,
  ChevronDown,
  ChevronUp,
  Table as TableIcon,
  CheckCircle2,
  Bookmark,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function StepByStep() {
  const { testResult, claimedMean, significanceLevel, testType } = useHypothesis();
  const [showDeviationsTable, setShowDeviationsTable] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  if (!testResult || testResult.isZeroVariance) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-card">
        <GraduationCap className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">
          Step-by-Step Mathematical Solution Unavailable
        </h2>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
          {testResult?.isZeroVariance
            ? 'The sample standard deviation is zero (all scores are identical). The t-statistic is mathematically undefined.'
            : 'Please enter valid student marks and perform a hypothesis test to generate the 14-step mathematical solution.'}
        </p>
      </div>
    );
  }

  const { steps, desc, marks, n, mean, s, se, df, t, pValue, criticalValues, isReject, decision, conclusion } = testResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              College Assignment Format
            </span>
            <span className="text-xs text-slate-500 font-mono">Module VII – Testing of Hypothesis – I</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Complete Step-by-Step Mathematical Solution
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Formal mathematical derivation with formula definitions, intermediate arithmetic, and substitutions.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="print-include inline-flex items-center space-x-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-sm font-medium shadow-sm transition-all flex-shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Assignment Cover Card / Problem Statement */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Problem Statement
            </h2>
            <p className="text-xs text-slate-500">
              Course: B.Tech Mathematics | Topic: Testing of Hypothesis for Single Mean
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200">
            One-Sample t-Test
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg text-sm leading-relaxed text-slate-800 border border-slate-200/80">
          <p className="font-semibold text-slate-900 mb-1">Question:</p>
          <p>
            A university administration claims that the average examination score of engineering students in Mathematics is <strong className="font-mono text-brand-700">{claimedMean} marks</strong>. A random sample of <strong className="font-mono text-brand-700">{n} students</strong> was drawn and their scores recorded. Test the hypothesis at a significance level of <strong className="font-mono text-brand-700">α = {significanceLevel}</strong> ({testType.replace('-', ' ')}) to determine whether the population mean differs from the claimed value.
          </p>
        </div>

        {/* Quick Parameters Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Claimed Mean (μ₀):</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{claimedMean} marks</span>
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Sample Size (n):</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{n} observations</span>
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Significance Level (α):</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{significanceLevel}</span>
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Degrees of Freedom:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">df = {df}</span>
          </div>
        </div>
      </div>

      {/* Deviations Table Accordion (Intermediate working table) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDeviationsTable(!showDeviationsTable)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <TableIcon className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Detailed Calculation Work Table: Σ(xᵢ − x̄)²
              </h3>
              <p className="text-xs text-slate-500">
                Shows all {n} student marks with individual deviations (xᵢ - x̄) and squared deviations (xᵢ - x̄)²
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600">
            <span>{showDeviationsTable ? 'Hide Table' : 'Show Work Table'}</span>
            {showDeviationsTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showDeviationsTable && (
          <div className="p-6 pt-0 border-t border-slate-100">
            <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 border-b border-slate-200">Student No. (i)</th>
                    <th className="py-2.5 px-3 border-b border-slate-200">Mark (xᵢ)</th>
                    <th className="py-2.5 px-3 border-b border-slate-200">Deviation (xᵢ − x̄)</th>
                    <th className="py-2.5 px-3 border-b border-slate-200 font-mono">Squared Deviation (xᵢ − x̄)²</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                  {desc.deviations.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold">{row.x}</td>
                      <td className="py-2 px-3 text-slate-600">
                        {row.dev >= 0 ? `+${row.dev.toFixed(4)}` : row.dev.toFixed(4)}
                      </td>
                      <td className="py-2 px-3 text-slate-900">{row.sqDev.toFixed(4)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100/90 font-bold text-slate-900">
                    <td className="py-2.5 px-3">Total (Σ)</td>
                    <td className="py-2.5 px-3">{desc.sum.toFixed(2)}</td>
                    <td className="py-2.5 px-3">0.0000</td>
                    <td className="py-2.5 px-3 text-brand-700 font-bold">{desc.sumSquaredDiffs.toFixed(4)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* The 14 Step-by-Step Sections */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <span>Detailed 14 Steps of Hypothesis Testing</span>
        </h2>

        {steps.map((st) => (
          <div
            key={st.step}
            className="bg-white rounded-xl border border-slate-200 shadow-card p-5 space-y-3 transition-all hover:border-slate-300"
          >
            {/* Step Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-lg bg-navy-900 text-white font-bold font-mono text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                  {st.step}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Step {st.step}: {st.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {st.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Formula Block */}
            {st.formula && (
              <div className="math-block text-xs text-slate-800">
                <span className="text-[11px] text-slate-500 font-sans block mb-0.5 uppercase tracking-wide font-semibold">
                  Standard Mathematical Formula:
                </span>
                <span className="font-mono text-brand-900 font-semibold">{st.formula}</span>
              </div>
            )}

            {/* Substitution & Intermediate Arithmetic */}
            {st.substitutions && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-line leading-relaxed">
                <span className="text-[11px] text-slate-500 font-sans block mb-1 uppercase tracking-wide font-semibold">
                  Values & Substitution:
                </span>
                {st.substitutions}
              </div>
            )}

            {/* Evaluated Result */}
            <div className="p-3 bg-brand-50/50 rounded-lg border border-brand-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Calculated Outcome:</span>
              <span className="font-bold text-brand-900 font-mono text-sm">{st.result}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Conclusion Seal */}
      <div className="p-6 bg-navy-900 text-white rounded-xl shadow-card space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-brand-300 uppercase tracking-wider">
          <GraduationCap className="w-5 h-5 text-amber-400" />
          <span>Final Academic Verdict</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-100 font-medium">
          {conclusion}
        </p>
        <div className="pt-2 border-t border-navy-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <span>Both p-value method and critical-value method confirm the decision: <strong className="text-white">{decision}</strong></span>
          <span className="font-mono text-brand-300">df = {df}, t_calc = {t.toFixed(4)}, α = {significanceLevel}</span>
        </div>
      </div>
    </div>
  );
}
