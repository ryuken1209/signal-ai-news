import React, { useState } from 'react';
import { useHypothesis } from '../context/HypothesisContext';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function ErrorTypes() {
  const { significanceLevel, claimedMean } = useHypothesis();
  const [selectedCell, setSelectedCell] = useState('type1');

  const cells = {
    type1: {
      title: 'Type I Error (False Positive / False Alarm)',
      probability: `Probability = α (${significanceLevel} or ${(significanceLevel * 100).toFixed(0)}%)`,
      definition: 'Rejecting the Null Hypothesis (H₀) when H₀ is actually true in reality.',
      studentScenario: `The university concludes that students' average marks have significantly improved above ${claimedMean} marks (Rejecting H₀), when in reality the true population average is still exactly ${claimedMean} marks.`,
      practicalImpact:
        'Consequence: The college might mistakenly cancel supplemental tutoring labs, cut remedial teaching budgets, or raise course difficulty benchmarks under the false impression of mastery.',
      prevention:
        'Controlled directly by setting a smaller significance level α (e.g., choosing α = 0.01 instead of 0.05 reduces false alarm probability from 5% to 1%).',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    correctReject: {
      title: 'Correct Decision: True Discovery (Statistical Power)',
      probability: 'Probability = 1 − β (Power of the Test)',
      definition: 'Rejecting the Null Hypothesis (H₀) when H₀ is false in reality.',
      studentScenario: `The university concludes that student marks have genuinely changed from ${claimedMean} marks, and the true population average has indeed shifted.`,
      practicalImpact:
        'Consequence: The college correctly identifies meaningful changes in student learning and implements evidence-based academic policies.',
      prevention:
        'Maximizing power (1 - β) is achieved by increasing sample size n, reducing measurement error, or having larger genuine effect sizes.',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    correctAccept: {
      title: 'Correct Decision: Confidence / Non-Rejection',
      probability: `Probability = 1 − α (${(1 - significanceLevel).toFixed(2)} or ${((1 - significanceLevel) * 100).toFixed(0)}%)`,
      definition: 'Failing to reject the Null Hypothesis (H₀) when H₀ is indeed true in reality.',
      studentScenario: `The university concludes there is no sufficient evidence to say average student performance differs from ${claimedMean} marks, and in reality students indeed average ${claimedMean} marks.`,
      practicalImpact:
        'Consequence: Current curriculum standards and teaching benchmarks are maintained appropriately without unnecessary disruption.',
      prevention: 'Confidence level equals 1 - α (typically 95% or 99%).',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    type2: {
      title: 'Type II Error (False Negative / Missed Detection)',
      probability: 'Probability = β (Beta)',
      definition: 'Failing to reject the Null Hypothesis (H₀) when H₀ is actually false in reality.',
      studentScenario: `The university fails to detect a serious decline in performance (fails to reject H₀: μ = ${claimedMean}), when in reality the true average has dropped significantly to 60 marks.`,
      practicalImpact:
        'Consequence: Struggling students fail to receive urgent academic interventions or bridge courses because the test missed the true deterioration in academic performance.',
      prevention:
        'Beta (β) decreases as sample size n increases. Note: β cannot be computed without specifying an exact alternative mean μ₁ and population variance assumptions.',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            Statistical Decision Theory
          </span>
          <span className="text-xs text-slate-500 font-mono">Module VII – Testing of Hypothesis</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Type I and Type II Errors
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Understanding statistical risks, significance level (α), false negatives (β), and their consequences in evaluating student examination scores.
        </p>
      </div>

      {/* Decision Matrix Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Hypothesis Testing Decision Matrix (2 × 2 Contingency Table)
            </h2>
            <p className="text-xs text-slate-500">
              Click any cell in the table to explore its mathematical meaning and student performance case study.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200">
            Current α = {significanceLevel}
          </span>
        </div>

        {/* 2x2 Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-left">
            <thead>
              <tr>
                <th className="p-3 bg-slate-100 border border-slate-200 text-slate-700 font-bold w-1/4">
                  Statistical Decision
                </th>
                <th className="p-3 bg-slate-100 border border-slate-200 text-slate-800 font-bold text-center w-3/8">
                  H₀ is True in Reality
                  <span className="block text-xs font-normal text-slate-500 mt-0.5">
                    (True student average = {claimedMean} marks)
                  </span>
                </th>
                <th className="p-3 bg-slate-100 border border-slate-200 text-slate-800 font-bold text-center w-3/8">
                  H₀ is False in Reality
                  <span className="block text-xs font-normal text-slate-500 mt-0.5">
                    (True student average ≠ {claimedMean} marks)
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Reject H0 */}
              <tr>
                <td className="p-3 font-bold bg-slate-50 border border-slate-200 text-slate-800">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>Reject H₀</span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-500 block mt-0.5">
                    Conclude population mean differs
                  </span>
                </td>

                {/* Type I Error */}
                <td
                  onClick={() => setSelectedCell('type1')}
                  className={`p-4 border border-slate-200 cursor-pointer transition-all hover:bg-rose-50/80 ${
                    selectedCell === 'type1'
                      ? 'bg-rose-100/70 ring-2 ring-rose-500'
                      : 'bg-rose-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-rose-800 block text-base">
                        Type I Error
                      </span>
                      <span className="text-xs text-rose-700 font-medium mt-0.5 block">
                        False Alarm (α = {significanceLevel})
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-bold">
                      Risk = α
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Rejecting H₀ when it is actually true. Probability is controlled directly by α.
                  </p>
                </td>

                {/* Correct Decision (Power) */}
                <td
                  onClick={() => setSelectedCell('correctReject')}
                  className={`p-4 border border-slate-200 cursor-pointer transition-all hover:bg-emerald-50/80 ${
                    selectedCell === 'correctReject'
                      ? 'bg-emerald-100/70 ring-2 ring-emerald-500'
                      : 'bg-emerald-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-emerald-800 block text-base">
                        Correct Decision
                      </span>
                      <span className="text-xs text-emerald-700 font-medium mt-0.5 block">
                        Statistical Power (1 − β)
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                      1 − β
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Rejecting H₀ when H₀ is genuinely false. True discovery of real differences.
                  </p>
                </td>
              </tr>

              {/* Row 2: Fail to reject H0 */}
              <tr>
                <td className="p-3 font-bold bg-slate-50 border border-slate-200 text-slate-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Fail to Reject H₀</span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-500 block mt-0.5">
                    Insufficient evidence to reject
                  </span>
                </td>

                {/* Correct Decision (Confidence) */}
                <td
                  onClick={() => setSelectedCell('correctAccept')}
                  className={`p-4 border border-slate-200 cursor-pointer transition-all hover:bg-emerald-50/80 ${
                    selectedCell === 'correctAccept'
                      ? 'bg-emerald-100/70 ring-2 ring-emerald-500'
                      : 'bg-emerald-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-emerald-800 block text-base">
                        Correct Decision
                      </span>
                      <span className="text-xs text-emerald-700 font-medium mt-0.5 block">
                        Confidence Level (1 − α)
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                      1 − α
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Failing to reject H₀ when H₀ is true. Correctly maintaining the claim baseline.
                  </p>
                </td>

                {/* Type II Error */}
                <td
                  onClick={() => setSelectedCell('type2')}
                  className={`p-4 border border-slate-200 cursor-pointer transition-all hover:bg-amber-50/80 ${
                    selectedCell === 'type2'
                      ? 'bg-amber-100/70 ring-2 ring-amber-500'
                      : 'bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-amber-800 block text-base">
                        Type II Error
                      </span>
                      <span className="text-xs text-amber-700 font-medium mt-0.5 block">
                        Missed Detection (β)
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                      Risk = β
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Failing to reject H₀ when H₀ is false. Missing a genuine real-world effect.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Matrix Cell Deep Dive */}
      {selectedCell && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-card space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              {cells[selectedCell].title}
            </h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cells[selectedCell].badgeColor}`}>
              {cells[selectedCell].probability}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
            <div className="space-y-2">
              <p className="text-slate-600">
                <strong className="text-slate-800">Formal Definition: </strong>
                {cells[selectedCell].definition}
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                <strong className="text-slate-900 block mb-1">Student Examination Context:</strong>
                {cells[selectedCell].studentScenario}
              </div>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                <strong className="text-slate-900 block mb-1">Practical Real-World Impact:</strong>
                {cells[selectedCell].practicalImpact}
              </div>
              <p className="text-slate-600">
                <strong className="text-slate-800">Control Mechanism: </strong>
                {cells[selectedCell].prevention}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* In-depth Comparison Cards: Type I vs Type II */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type I Card */}
        <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-card space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold font-mono">
              α
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-900">
                Type I Error (Producer's Risk)
              </h3>
              <p className="text-xs text-rose-600">
                Probability of False Alarm = α = {significanceLevel}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              A <strong>Type I error</strong> occurs when we reject a null hypothesis that is true. In hypothesis testing, the probability of committing a Type I error is set in advance by the researcher as the <strong>level of significance (α)</strong>.
            </p>
            <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-100 text-rose-950 font-medium">
              Student Examination Example:
              <p className="font-normal text-rose-900 mt-1">
                A college samples 30 student marks and erroneously concludes that the average exam score has jumped above 70 marks (rejecting H₀), when in reality the broader student body still averages 70.
              </p>
            </div>
            <p>
              <strong>Statistical Significance:</strong> Setting α = 0.05 guarantees that if the college claim is true, we will falsely reject it at most 5% of the time.
            </p>
          </div>
        </div>

        {/* Type II Card */}
        <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-card space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold font-mono">
              β
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-900">
                Type II Error (Consumer's Risk)
              </h3>
              <p className="text-xs text-amber-600">
                Probability of Missed Detection = β
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              A <strong>Type II error</strong> occurs when we fail to reject a null hypothesis that is false. In simple language, this is failing to catch an effect that actually exists.
            </p>
            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100 text-amber-950 font-medium">
              Student Examination Example:
              <p className="font-normal text-amber-900 mt-1">
                Student marks have critically collapsed from 70 to an average of 58 marks due to a difficult new syllabus. However, due to high variance or a small sample, the test fails to reject H₀, leaving students without required help.
              </p>
            </div>
            <p>
              <strong>Calculation Note:</strong> β cannot be calculated without specifying an exact alternative mean (μ₁) and knowing the true population variance σ².
            </p>
          </div>
        </div>
      </div>

      {/* Trade-off and Sample Size Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Scale className="w-5 h-5 text-brand-600" />
          <h3 className="text-base font-bold text-slate-900">
            The Fundamental Trade-off: α vs β and the Role of Sample Size (n)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">1. The Inverse Trade-off</h4>
            <p className="text-slate-600 leading-relaxed">
              For a fixed sample size n, reducing the probability of Type I error (e.g., dropping α from 0.05 to 0.01) makes the test more conservative, which inevitably <strong>increases</strong> the probability of Type II error (β).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">2. Power of the Test (1 − β)</h4>
            <p className="text-slate-600 leading-relaxed">
              Statistical Power represents the probability of correctly rejecting a false null hypothesis. In academic studies, standard desired power is usually 80% (0.80) or higher.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">3. The Only Free Lunch: Larger n</h4>
            <p className="text-slate-600 leading-relaxed">
              The only way to decrease <strong>both</strong> Type I error (α) and Type II error (β) simultaneously is to collect a <strong>larger sample size (n)</strong>, which shrinks the standard error (s/√n).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
