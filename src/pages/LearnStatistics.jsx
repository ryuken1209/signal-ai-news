import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Calculator,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
} from 'lucide-react';

const STATS_TOPICS = [
  {
    id: 'hypothesis-testing',
    title: '1. What is Hypothesis Testing?',
    category: 'Foundations',
    summary:
      'A formal mathematical procedure to decide whether empirical sample evidence supports or refutes a conjecture about a population parameter.',
    formula: '\\text{Sample Data } X \\implies \\text{Inference about Population Parameter } \\mu',
    details:
      'In engineering and sciences, we rarely observe the entire population. Hypothesis testing allows us to make reliable probabilistic statements about a population parameter (like average marks of all college students) using only a finite sample, while strictly bounding the probability of making false conclusions.',
    example:
      'Example: Testing if an innovative AI-assisted teaching pedagogy actually elevates university examination scores beyond the baseline of 70 marks.',
  },
  {
    id: 'hypotheses',
    title: '2. What are H₀ and H₁?',
    category: 'Hypothesis Formulation',
    summary:
      'Null Hypothesis (H₀) asserts no significant difference or status quo. Alternative Hypothesis (H₁) represents the research claim.',
    formula: 'H_0: \\mu = \\mu_0 \\quad \\text{vs.} \\quad H_1: \\mu \\ne \\mu_0 \\; (\\text{or } >, <)',
    details:
      'H₀ is assumed true unless empirical evidence is strong enough to reject it beyond reasonable doubt. H₁ is the opposing claim we hope to substantiate. In a court of law analogy, H₀ is "innocent until proven guilty", and H₁ is "guilty".',
    example:
      'Two-tailed: H₀: μ = 70 marks (Average equals 70) vs H₁: μ ≠ 70 marks (Average differs from 70).',
  },
  {
    id: 'significance-level',
    title: '3. What is the Level of Significance (α)?',
    category: 'Risk Management',
    summary:
      'The maximum tolerated probability of rejecting a true null hypothesis (committing a Type I error).',
    formula: '\\alpha = P(\\text{Reject } H_0 \\mid H_0 \\text{ is true})',
    details:
      'Common choices are α = 0.05 (5%), α = 0.01 (1%), or α = 0.10 (10%). Choosing α = 0.05 means we accept at most a 5% chance of rejecting H₀ when H₀ is genuinely true. The corresponding confidence level is 1 − α = 95%.',
    example:
      'At α = 0.05, if we performed the test 100 times on true 70-average cohorts, we expect false rejection in at most 5 runs.',
  },
  {
    id: 'one-sample-t-test',
    title: '4. What is a One-Sample t-Test?',
    category: 'Test Selection',
    summary:
      "A parametric hypothesis test used when testing a single population mean and population standard deviation (σ) is unknown.",
    formula: 't = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}} \\sim t_{n-1}',
    details:
      "When the population standard deviation σ is known, we use a Z-test (Standard Normal). But in practice, σ is unknown and must be estimated using the sample standard deviation s. William Sealy Gosset ('Student') proved that substituting s introduces extra variability, requiring Student's t-distribution instead of the normal distribution.",
    example:
      'Evaluating marks of 30 engineering students when only sample SD s is known, not the university-wide variance σ².',
  },
  {
    id: 'test-statistic',
    title: '5. What is the Test Statistic?',
    category: 'Computation',
    summary:
      'A standardized numerical value calculated from sample observations that measures deviation from H₀ in units of standard error.',
    formula: 't_{\\text{calc}} = \\frac{\\text{Sample Mean} - \\text{Hypothesized Mean}}{\\text{Standard Error of the Mean}} = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}',
    details:
      'If t_calc is close to 0, sample mean x̄ is very close to claimed μ₀. Large positive or negative values of t indicate that the sample mean deviates substantially from what H₀ predicts.',
    example:
      'If x̄ = 71.70, μ₀ = 70, and SE = 0.465, then t = (71.70 - 70) / 0.465 = 3.654 standard errors above the claimed mean.',
  },
  {
    id: 'degrees-of-freedom',
    title: '6. What are Degrees of Freedom (df)?',
    category: 'Distribution Parameters',
    summary:
      'The number of independent values that are free to vary in a statistical calculation after estimating sample mean.',
    formula: 'df = n - 1',
    details:
      'Because the sample mean x̄ is fixed, once you know (n - 1) student scores, the final n-th score is mathematically determined. As df increases, the Student t-distribution approaches the standard normal distribution N(0, 1).',
    example:
      'For a sample of 30 student marks, degrees of freedom df = 30 - 1 = 29.',
  },
  {
    id: 'critical-value',
    title: '7. What is a Critical Value?',
    category: 'Decision Boundaries',
    summary:
      'The boundary value on the t-distribution dividing the acceptance region from the rejection region.',
    formula: 't_{\\text{crit}} = \\pm t_{1 - \\alpha/2, \\, df} \\; (\\text{Two-Tailed})',
    details:
      'Critical values depend exclusively on the degrees of freedom (df), significance level (α), and test directionality. If the calculated t exceeds the critical value, it enters the rejection region.',
    example:
      'For df = 29 and α = 0.05 in a two-tailed test, t_crit = ±2.0452. If |t| > 2.0452, we reject H₀.',
  },
  {
    id: 'p-value',
    title: '8. What is a p-Value?',
    category: 'Probability',
    summary:
      'The exact probability of obtaining a test statistic at least as extreme as the observed value, assuming H₀ is true.',
    formula: 'p = 2 \\times P(T \\ge |t|) \\; (\\text{Two-Tailed})',
    details:
      'A small p-value (p < α) indicates that the observed sample is very improbable under H₀, providing strong evidence against H₀. Common misconception: p-value is NOT the probability that H₀ is true.',
    example:
      'p = 0.0010 means there is only a 0.10% probability of getting marks this far from 70 purely by random sampling luck.',
  },
  {
    id: 'type-1-error',
    title: '9. What is a Type I Error?',
    category: 'Error Theory',
    summary:
      'Rejecting the null hypothesis when it is actually true (False Positive / False Alarm).',
    formula: 'P(\\text{Type I Error}) = \\alpha',
    details:
      'In university examinations: concluding that students have improved above 70 marks when in reality the population average remains 70 marks.',
    example:
      'Unnecessarily revamping a curriculum or cancelling tutorial support based on a lucky sample of students.',
  },
  {
    id: 'type-2-error',
    title: '10. What is a Type II Error?',
    category: 'Error Theory',
    summary:
      'Failing to reject the null hypothesis when it is actually false (False Negative / Missed Detection).',
    formula: 'P(\\text{Type II Error}) = \\beta, \\quad \\text{Power} = 1 - \\beta',
    details:
      'In university examinations: failing to detect that student performance has dropped from 70 to 60 marks, denying struggling students needed remedial classes.',
    example:
      'A small sample with wide spread fails to reject H₀ despite a true underlying academic slump.',
  },
];

const QUIZ_QUESTIONS = [
  {
    question: 'Why do we use a Student’s t-test instead of a Z-test for this student marks project?',
    options: [
      'Because the sample size is always small (n < 30)',
      'Because the true population standard deviation σ is unknown and must be estimated by s',
      'Because marks cannot exceed 100',
      'Because the test is two-tailed',
    ],
    correct: 1,
    explanation:
      'A t-test is specifically used when population standard deviation σ is unknown and estimated using sample standard deviation s.',
  },
  {
    question: 'What is the correct decision rule when comparing p-value with significance level α?',
    options: [
      'Reject H₀ if p-value > α',
      'Accept H₀ if p-value < α',
      'Reject H₀ if p-value < α; otherwise fail to reject H₀',
      'Always reject H₀ if sample mean differs from μ₀',
    ],
    correct: 2,
    explanation:
      'If p-value < α, the observed data is statistically significant at level α, so we Reject H₀. Otherwise, we Fail to Reject H₀.',
  },
  {
    question: 'If a two-tailed test with df = 29 has t_crit = ±2.0452 and calculated t = 3.654, what is the conclusion?',
    options: [
      'Fail to reject H₀ because 3.654 is positive',
      'Reject H₀ because |3.654| > 2.0452',
      'Accept H₁ as proven beyond all doubt',
      'The test is inconclusive because t > 3',
    ],
    correct: 1,
    explanation:
      'Since |t| = 3.654 exceeds the critical value 2.0452, the statistic falls inside the rejection region, leading to Reject H₀.',
  },
  {
    question: 'What is the probability of committing a Type I error bounded by?',
    options: [
      '1 - β',
      'Degrees of freedom (n - 1)',
      'Significance level α',
      'Sample standard deviation s',
    ],
    correct: 2,
    explanation:
      'The level of significance α is chosen by the researcher to directly limit the maximum probability of committing a Type I error.',
  },
];

export default function LearnStatistics() {
  const [expandedId, setExpandedId] = useState('hypothesis-testing');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSelectAnswer = (qIdx, optIdx) => {
    setQuizAnswers({
      ...quizAnswers,
      [qIdx]: optIdx,
    });
  };

  const score = Object.keys(quizAnswers).reduce((acc, qIdx) => {
    return acc + (quizAnswers[qIdx] === QUIZ_QUESTIONS[qIdx].correct ? 1 : 0);
  }, 0);

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setShowResults(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            Study Guide & Theory
          </span>
          <span className="text-xs text-slate-500 font-mono">B.Tech Mathematics – Module VII</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Learn Statistics: Hypothesis Testing Essentials
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Comprehensive explanations, mathematical formulas, and student examination examples designed for engineering students.
        </p>
      </div>

      {/* Core Concepts Accordion Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <span>Core Mathematical Concepts</span>
        </h2>

        {STATS_TOPICS.map((topic) => {
          const isExpanded = expandedId === topic.id;
          return (
            <div
              key={topic.id}
              className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleExpand(topic.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {topic.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {topic.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{topic.summary}</p>
                </div>
                <div className="p-1 rounded-md text-slate-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-100 space-y-3 text-xs leading-relaxed text-slate-700">
                  <p className="pt-3">{topic.details}</p>

                  {topic.formula && (
                    <div className="math-block">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans font-semibold mb-0.5">
                        Mathematical Formula:
                      </span>
                      <span className="font-mono text-brand-900 font-semibold">{topic.formula}</span>
                    </div>
                  )}

                  <div className="p-3 bg-brand-50/60 rounded-lg border border-brand-100 text-brand-950 font-medium">
                    <span className="font-bold text-brand-900 block mb-0.5">Practical Example:</span>
                    {topic.example}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Self-Assessment Quiz */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Interactive Self-Assessment Quiz (B.Tech Viva Preparation)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">4 Questions</span>
        </div>

        <div className="space-y-6">
          {QUIZ_QUESTIONS.map((q, qIdx) => {
            const selectedOpt = quizAnswers[qIdx];
            const isAnswered = selectedOpt !== undefined;
            const isCorrect = selectedOpt === q.correct;

            return (
              <div key={qIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="text-sm font-semibold text-slate-900">
                  {qIdx + 1}. {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isOptionSelected = selectedOpt === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(qIdx, optIdx)}
                        className={`w-full p-3 rounded-lg text-left text-xs transition-all flex items-center justify-between border ${
                          isOptionSelected
                            ? 'bg-brand-50 border-brand-300 font-semibold text-brand-900 ring-1 ring-brand-400'
                            : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{opt}</span>
                        {showResults && isOptionSelected && (
                          isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          )
                        )}
                      </button>
                    );
                  })}
                </div>

                {showResults && (
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed ${
                      isCorrect
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-50 text-rose-900 border border-rose-200'
                    }`}
                  >
                    <p className="font-bold mb-0.5">
                      {isCorrect ? 'Correct!' : `Incorrect (Correct answer is: "${q.options[q.correct]}")`}
                    </p>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quiz Actions */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowResults(!showResults)}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              {showResults ? 'Hide Explanations' : 'Check Answers & Show Explanations'}
            </button>

            {Object.keys(quizAnswers).length > 0 && (
              <button
                type="button"
                onClick={handleResetQuiz}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-all"
              >
                Retake Quiz
              </button>
            )}
          </div>

          {showResults && (
            <div className="text-xs font-mono font-bold text-slate-800">
              Your Score: <span className="text-brand-600 text-sm">{score} / {QUIZ_QUESTIONS.length}</span> (
              {((score / QUIZ_QUESTIONS.length) * 100).toFixed(0)}%)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
