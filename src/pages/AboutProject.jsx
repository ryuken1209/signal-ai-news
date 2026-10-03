import React from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Code,
  Layers,
  Award,
  ExternalLink,
  Target,
  Sparkles,
} from 'lucide-react';

export default function AboutProject() {
  const objectives = [
    'Understand hypothesis testing and its fundamental role in empirical decision-making.',
    'Formulate null (H₀) and alternative (H₁) hypotheses for academic benchmarks.',
    'Apply the level of significance (α) to strictly control the risk of Type I error.',
    'Perform a one-sample Student’s t-test when population standard deviation σ is unknown.',
    'Calculate and interpret critical values and exact p-values from Student’s t-distribution.',
    'Understand Type I and Type II errors with real-world student examination scenarios.',
    'Present mathematical results using interactive data visualizations (histograms, mean comparisons, and decision regions).',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            B.Tech Academic Curriculum
          </span>
          <span className="text-xs text-slate-500 font-mono">Documentation & Specifications</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          About Project: Student Performance Hypothesis Testing System
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Academic project specification, syllabus mapping, learning outcomes, and statistical architecture.
        </p>
      </div>

      {/* Primary Academic Details Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Curriculum Mapping & Identification
            </h2>
            <p className="text-xs text-slate-500">
              Standard B.Tech Engineering Mathematics syllabus framework
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <span className="text-slate-500 font-medium">Project Title:</span>
            <p className="text-sm font-bold text-slate-900">
              Student Performance Hypothesis Testing System
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <span className="text-slate-500 font-medium">Subject / Course:</span>
            <p className="text-sm font-bold text-slate-900">
              Mathematics (Probability, Statistics & Numerical Methods)
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <span className="text-slate-500 font-medium">Module / Unit:</span>
            <p className="text-sm font-bold text-brand-700">
              Module VII – Testing of Hypothesis – I
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <span className="text-slate-500 font-medium">Main Topic:</span>
            <p className="text-sm font-bold text-brand-700">
              Testing of Hypothesis for Population Mean (Single Sample t-Test)
            </p>
          </div>
        </div>
      </div>

      {/* Project Objectives */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-brand-600" />
          <h2 className="text-base font-bold text-slate-900">
            Project Objectives
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {objectives.map((obj, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 leading-relaxed font-medium">{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Real-World Case Study Narrative */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <span>Real-World Scenario: Analyzing University Student Performance</span>
        </h2>
        <div className="space-y-3 text-xs leading-relaxed text-slate-600">
          <p>
            In university administration, evaluating academic performance is essential for maintaining educational accreditation and ensuring teaching quality. A university claims that the historical benchmark examination score of engineering students in Mathematics is <strong className="text-slate-900 font-mono">70 marks</strong>.
          </p>
          <p>
            When a new semester cohort completes their examination, we collect a representative random sample of marks. Hypothesis testing allows us to rigorously determine whether the sample average differs from 70 marks due to genuine pedagogical shifts or merely due to random chance fluctuations in student scoring.
          </p>
          <div className="p-3 bg-brand-50/60 rounded-lg border border-brand-100 text-brand-900">
            <strong>Key Benefit of Statistical Testing:</strong> Rather than making subjective claims based on raw marks alone, hypothesis testing provides mathematical confidence, an exact p-value, and an objective decision boundary based on Student's t-distribution.
          </div>
        </div>
      </div>

      {/* Technology Stack & Statistical Integrity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Code className="w-4 h-4 text-brand-600" />
            <span>Software & Technology Architecture</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
              <span className="font-semibold text-slate-800">Framework:</span>
              <span className="font-mono text-slate-600">React 19 + Vite</span>
            </li>
            <li className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
              <span className="font-semibold text-slate-800">Charts Engine:</span>
              <span className="font-mono text-slate-600">Recharts (Responsive SVG)</span>
            </li>
            <li className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
              <span className="font-semibold text-slate-800">Statistics Library:</span>
              <span className="font-mono text-slate-600">jStat (Student's t cdf, inv, pdf)</span>
            </li>
            <li className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
              <span className="font-semibold text-slate-800">Styling & Icons:</span>
              <span className="font-mono text-slate-600">Tailwind CSS + Lucide Icons</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Mathematical Rigor & Validity</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <li className="p-2 bg-slate-50 rounded border border-slate-100">
              <strong className="text-slate-800 block">Exact Student's t CDF:</strong>
              No normal approximations are used; all p-values and critical values are evaluated using true Student's t integration.
            </li>
            <li className="p-2 bg-slate-50 rounded border border-slate-100">
              <strong className="text-slate-800 block">Dual Decision Cross-Check:</strong>
              Both critical-value method and p-value method are computed and verified to ensure full agreement.
            </li>
            <li className="p-2 bg-slate-50 rounded border border-slate-100">
              <strong className="text-slate-800 block">Safe Edge-Case Handling:</strong>
              Zero-variance cases (all scores identical) and small samples (n &lt; 2) are safely intercepted with clear mathematical explanations.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
