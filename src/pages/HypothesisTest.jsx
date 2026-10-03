import React, { useState, useMemo, useEffect } from 'react';
import { useHypothesis } from '../context/HypothesisContext';
import ResultPanel from '../components/ResultPanel';
import MarksHistogram from '../components/MarksHistogram';
import {
  DEFAULT_DATASET_STRING,
  DEFAULT_PARAMETERS,
  validateHypothesisInputs,
} from '../utils/statistics';
import {
  RotateCcw,
  Sparkles,
  Play,
  AlertCircle,
  CheckCircle2,
  FileText,
  Sliders,
  HelpCircle,
  Flame,
  TrendingDown,
  Scale,
  ShieldAlert,
} from 'lucide-react';

export default function HypothesisTest() {
  const {
    marksString,
    setMarksString,
    claimedMean,
    setClaimedMean,
    significanceLevel,
    setSignificanceLevel,
    testType,
    setTestType,
    validation,
    testResult,
    resetData,
    loadScenario,
    activePreset,
  } = useHypothesis();

  // Local draft state for form so user can edit and then click Perform Hypothesis Test or have live feedback
  const [localMarks, setLocalMarks] = useState(marksString);
  const [localClaimedMean, setLocalClaimedMean] = useState(claimedMean);
  const [localAlpha, setLocalAlpha] = useState(significanceLevel);
  const [localTestType, setLocalTestType] = useState(testType);
  const [notification, setNotification] = useState(null);

  // Sync if reset or preset is loaded externally
  useEffect(() => {
    setLocalMarks(marksString);
    setLocalClaimedMean(claimedMean);
    setLocalAlpha(significanceLevel);
    setLocalTestType(testType);
  }, [marksString, claimedMean, significanceLevel, testType]);

  // Live validation on current form fields
  const currentValidation = useMemo(() => {
    return validateHypothesisInputs({
      marks: localMarks,
      claimedMean: localClaimedMean,
      significanceLevel: localAlpha,
      testType: localTestType,
    });
  }, [localMarks, localClaimedMean, localAlpha, localTestType]);

  const handlePerformTest = (e) => {
    if (e) e.preventDefault();
    if (!currentValidation.isValid) {
      setNotification({
        type: 'error',
        message: currentValidation.error || 'Please correct the validation errors before performing the test.',
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    setMarksString(localMarks);
    setClaimedMean(Number(localClaimedMean));
    setSignificanceLevel(Number(localAlpha));
    setTestType(localTestType);

    setNotification({
      type: 'success',
      message: 'Hypothesis test calculated successfully with updated inputs.',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReset = () => {
    resetData();
    setLocalMarks(DEFAULT_DATASET_STRING);
    setLocalClaimedMean(DEFAULT_PARAMETERS.claimedMean);
    setLocalAlpha(DEFAULT_PARAMETERS.significanceLevel);
    setLocalTestType(DEFAULT_PARAMETERS.testType);
    setNotification({
      type: 'info',
      message: 'Reset to default college benchmark scenario (μ₀ = 70 marks, α = 0.05, 30 marks).',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLoadScenario = (key) => {
    const sc = loadScenario(key);
    if (sc) {
      setLocalMarks(sc.marks.join(', '));
      setLocalClaimedMean(sc.claimedMean);
      setLocalAlpha(sc.alpha);
      setLocalTestType(sc.testType);
    }
    setNotification({
      type: 'info',
      message: `Loaded scenario: "${sc?.name || key}".`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            Formulation & Computation
          </span>
          <span className="text-xs text-slate-500 font-mono">One-Sample Student's t-Test</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Perform Hypothesis Test for Population Mean
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Enter custom student examination marks, set the claimed benchmark mean, choose significance level α, and select the hypothesis tail.
        </p>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div
          className={`p-3 rounded-lg border flex items-center space-x-2 text-xs font-medium animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Preset Quick-Load Scenarios */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pre-built Academic Case Studies
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Click to instantly test specific hypotheses</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleLoadScenario('default')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1.5 ${
              activePreset === 'Default College Claim'
                ? 'bg-brand-50 text-brand-700 border-brand-300 font-semibold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-brand-600" />
            <span>Default 30 Students (μ₀ = 70)</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoadScenario('high-achiever')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 transition-all flex items-center space-x-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>High Achievers Cohort (Mean ~ 82, Right-tail)</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoadScenario('underperforming')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 transition-all flex items-center space-x-1.5"
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Remedial Batch (Mean ~ 61, Left-tail)</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoadScenario('close-to-claim')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 transition-all flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Conforming Cohort (Fail to Reject H₀)</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoadScenario('zero-variance')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 transition-all flex items-center space-x-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            <span>Zero Variance Edge Case (s = 0)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Form Card */}
      <form onSubmit={handlePerformTest} className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900">
              Hypothesis Test Input Parameters
            </h2>
          </div>
          <span className="text-xs text-slate-400">All fields required</span>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Claimed Mean μ₀ */}
          <div className="space-y-1.5">
            <label htmlFor="claimedMean" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Claimed Population Mean (μ₀)
            </label>
            <div className="relative">
              <input
                id="claimedMean"
                type="number"
                step="any"
                min="0"
                max="100"
                required
                value={localClaimedMean}
                onChange={(e) => setLocalClaimedMean(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-mono text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
                placeholder="e.g. 70"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                marks
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Null hypothesis claim baseline (0 – 100 marks). Default: 70 marks.
            </p>
          </div>

          {/* Significance Level α */}
          <div className="space-y-1.5">
            <label htmlFor="alpha" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Significance Level (α)
            </label>
            <select
              id="alpha"
              value={localAlpha}
              onChange={(e) => setLocalAlpha(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-mono text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
            >
              <option value="0.01">0.01 (1% significance - strict test)</option>
              <option value="0.05">0.05 (5% significance - standard B.Tech standard)</option>
              <option value="0.10">0.10 (10% significance - lenient test)</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Maximum tolerated risk of committing a Type I error.
            </p>
          </div>

          {/* Test Direction Type */}
          <div className="space-y-1.5">
            <label htmlFor="testType" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Test Type (Alternative Hypothesis)
            </label>
            <select
              id="testType"
              value={localTestType}
              onChange={(e) => setLocalTestType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
            >
              <option value="two-tailed">Two-Tailed (H₁: μ ≠ μ₀) [Differs]</option>
              <option value="right-tailed">Right-Tailed (H₁: μ &gt; μ₀) [Greater than]</option>
              <option value="left-tailed">Left-Tailed (H₁: μ &lt; μ₀) [Less than]</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Directionality of the research hypothesis to be proven.
            </p>
          </div>
        </div>

        {/* Student Marks Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="studentMarks" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Student Examination Marks (Dataset)
            </label>
            <span className="text-[11px] text-slate-400">
              Separated by commas, spaces, or newlines (0 to 100 marks)
            </span>
          </div>
          <textarea
            id="studentMarks"
            rows={5}
            required
            value={localMarks}
            onChange={(e) => setLocalMarks(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-mono text-sm leading-relaxed focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
            placeholder="e.g. 72, 68, 75, 71, 69, 73, 67, 74, 70, 76..."
          />
        </div>

        {/* Validation Error Alert */}
        {!currentValidation.isValid && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-3 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-900">Input Validation Error:</p>
              <p className="leading-relaxed">{currentValidation.error}</p>
            </div>
          </div>
        )}

        {/* Form Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={!currentValidation.isValid}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Perform Hypothesis Test</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadScenario('random')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Generate Sample Scenario</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 rounded-lg text-sm font-medium transition-all"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Reset Data to Defaults</span>
          </button>
        </div>
      </form>

      {/* Calculated Results Display */}
      {testResult && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Hypothesis Test Calculation Results
            </h2>
            <span className="text-xs text-slate-500">
              Evaluated with Student's t-Distribution
            </span>
          </div>

          <ResultPanel result={testResult} />

          <MarksHistogram
            marks={testResult.marks}
            sampleMean={testResult.mean}
            claimedMean={claimedMean}
          />
        </div>
      )}
    </div>
  );
}
