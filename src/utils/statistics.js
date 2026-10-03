import jstatPkg from 'jstat';
const jStat = jstatPkg.jStat || jstatPkg.default?.jStat || jstatPkg.default || jstatPkg;

export const DEFAULT_DATASET_STRING = '72, 68, 75, 71, 69, 73, 67, 74, 70, 76, 71, 72, 68, 75, 73, 69, 70, 74, 72, 71, 76, 68, 73, 70, 72, 69, 75, 74, 71, 73';

export const DEFAULT_PARAMETERS = {
  claimedMean: 70,
  significanceLevel: 0.05,
  testType: 'two-tailed', // 'two-tailed' | 'right-tailed' | 'left-tailed'
};

/**
 * Validates and parses student marks from a string input.
 * Supports comma, space, semicolon, tab, and newline delimiters.
 */
export function parseMarks(input) {
  if (!input || typeof input !== 'string' || input.trim() === '') {
    return {
      isValid: false,
      marks: [],
      error: 'Input cannot be empty. Please enter student marks separated by commas or newlines.',
    };
  }

  // Split by comma, semicolon, space, newline, or tab
  const rawTokens = input
    .split(/[\s,;\n\r\t]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  if (rawTokens.length === 0) {
    return {
      isValid: false,
      marks: [],
      error: 'No marks detected. Please enter at least 2 valid student marks.',
    };
  }

  const marks = [];
  const invalidTokens = [];
  const outOfRangeTokens = [];

  for (const token of rawTokens) {
    const val = Number(token);
    if (isNaN(val)) {
      invalidTokens.push(token);
    } else if (val < 0 || val > 100) {
      outOfRangeTokens.push(token);
    } else {
      marks.push(val);
    }
  }

  if (invalidTokens.length > 0) {
    return {
      isValid: false,
      marks: [],
      error: `Invalid non-numeric value(s) found: "${invalidTokens.slice(0, 5).join(', ')}"${invalidTokens.length > 5 ? '...' : ''}. Marks must be real numbers.`,
    };
  }

  if (outOfRangeTokens.length > 0) {
    return {
      isValid: false,
      marks: [],
      error: `Marks must be between 0 and 100. Out of range value(s): "${outOfRangeTokens.slice(0, 5).join(', ')}"${outOfRangeTokens.length > 5 ? '...' : ''}.`,
    };
  }

  if (marks.length < 2) {
    return {
      isValid: false,
      marks,
      error: `Hypothesis testing requires at least 2 observations to calculate sample variance (n = ${marks.length}).`,
    };
  }

  return {
    isValid: true,
    marks,
    error: null,
  };
}

/**
 * Validates all hypothesis test inputs comprehensively.
 */
export function validateHypothesisInputs({ marks, claimedMean, significanceLevel = 0.05, testType = 'two-tailed' }) {
  if (claimedMean === '' || claimedMean === null || claimedMean === undefined) {
    return {
      isValid: false,
      error: 'Claimed population mean (μ₀) cannot be empty. Please enter a benchmark mark between 0 and 100.',
    };
  }

  const mu0 = Number(claimedMean);
  if (isNaN(mu0) || !isFinite(mu0)) {
    return {
      isValid: false,
      error: 'Claimed population mean (μ₀) must be a valid real number.',
    };
  }

  if (mu0 < 0 || mu0 > 100) {
    return {
      isValid: false,
      error: `Claimed population mean (μ₀) must be between 0 and 100 marks (entered: ${mu0}).`,
    };
  }

  const alpha = Number(significanceLevel);
  if (isNaN(alpha) || alpha <= 0 || alpha >= 1) {
    return {
      isValid: false,
      error: 'Significance level (α) must be a valid probability between 0 and 1 (e.g., 0.01, 0.05, 0.10).',
    };
  }

  if (testType !== 'two-tailed' && testType !== 'right-tailed' && testType !== 'left-tailed') {
    return {
      isValid: false,
      error: `Invalid test type: "${testType}". Must be "two-tailed", "right-tailed", or "left-tailed".`,
    };
  }

  if (typeof marks === 'string') {
    const marksValidation = parseMarks(marks);
    if (!marksValidation.isValid) {
      return marksValidation;
    }
    return {
      isValid: true,
      marks: marksValidation.marks,
      mu0,
      alpha,
      testType,
      error: null,
    };
  } else if (Array.isArray(marks)) {
    if (marks.length < 2) {
      return {
        isValid: false,
        error: `Hypothesis testing requires at least 2 observations (n = ${marks.length}).`,
      };
    }
    for (const m of marks) {
      if (typeof m !== 'number' || isNaN(m) || m < 0 || m > 100) {
        return {
          isValid: false,
          error: `Marks must be valid numbers between 0 and 100 (encountered invalid value: ${m}).`,
        };
      }
    }
    return {
      isValid: true,
      marks,
      mu0,
      alpha,
      testType,
      error: null,
    };
  }

  return {
    isValid: false,
    error: 'Please provide student marks as a comma-separated string or array of numbers.',
  };
}

/**
 * Calculates descriptive statistics for an array of marks.
 */
export function calculateDescriptiveStats(marks) {
  const n = marks.length;
  const sum = marks.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / n;

  // Sorted copy for percentiles and median
  const sorted = [...marks].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  let median;
  const mid = Math.floor(n / 2);
  if (n % 2 === 0) {
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    median = sorted[mid];
  }

  // Sum of squared deviations: Σ(x_i - mean)^2
  const deviations = marks.map((x) => ({
    x,
    dev: x - mean,
    sqDev: Math.pow(x - mean, 2),
  }));

  const sumSquaredDiffs = deviations.reduce((acc, curr) => acc + curr.sqDev, 0);
  const variance = n > 1 ? sumSquaredDiffs / (n - 1) : 0;
  const s = Math.sqrt(variance);
  const se = s / Math.sqrt(n);

  return {
    n,
    sum,
    mean,
    min,
    max,
    median,
    variance,
    s,
    se,
    deviations,
    sumSquaredDiffs,
    sorted,
  };
}

/**
 * Performs a One-Sample Student's t-test.
 */
export function performTTest({ marks, claimedMean, significanceLevel = 0.05, testType = 'two-tailed' }) {
  const desc = calculateDescriptiveStats(marks);
  const { n, mean, s, se, sum, deviations, sumSquaredDiffs } = desc;
  const mu0 = Number(claimedMean);
  const alpha = Number(significanceLevel);
  const df = n - 1;

  if (claimedMean === '' || claimedMean === null || isNaN(mu0) || !isFinite(mu0) || mu0 < 0 || mu0 > 100) {
    return {
      isSuccess: false,
      isZeroVariance: false,
      error: `Invalid claimed population mean (μ₀): "${claimedMean}". Please enter a benchmark mark between 0 and 100.`,
      desc,
      mu0: isNaN(mu0) ? 70 : mu0,
      alpha,
      testType,
      df,
    };
  }

  // Check for zero variance edge case
  const isZeroVariance = s === 0;

  if (isZeroVariance) {
    return {
      isSuccess: false,
      isZeroVariance: true,
      error: `Sample standard deviation is zero (all ${n} student scores are identical: ${mean}). Division by zero occurs in standard error calculation (s/√n = 0). The Student's t-statistic is mathematically undefined.`,
      desc,
      mu0,
      alpha,
      testType,
      df,
    };
  }

  const t = (mean - mu0) / se;

  // Accurate Student's t distribution calculations using jStat
  let pValue = 0;
  let criticalValues = {};
  let isReject = false;
  let rejectionReason = '';

  if (testType === 'two-tailed') {
    // Two-tailed: H0: mu = mu0, H1: mu != mu0
    // Rejection rule: |t| > t(1 - alpha/2, df) OR p-value < alpha
    const tCrit = jStat.studentt.inv(1 - alpha / 2, df);
    pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));
    isReject = Math.abs(t) > tCrit;

    criticalValues = {
      positive: tCrit,
      negative: -tCrit,
      display: `±${tCrit.toFixed(4)}`,
      rule: `Reject H₀ if |t| > ${tCrit.toFixed(4)} (or t > ${tCrit.toFixed(4)} or t < -${tCrit.toFixed(4)})`,
    };

    if (isReject) {
      rejectionReason = `Calculated |t| = ${Math.abs(t).toFixed(4)} exceeds critical value ${tCrit.toFixed(4)} and p-value (${pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}) is less than α = ${alpha}.`;
    } else {
      rejectionReason = `Calculated |t| = ${Math.abs(t).toFixed(4)} does not exceed critical value ${tCrit.toFixed(4)} and p-value (${pValue.toFixed(4)}) is greater than or equal to α = ${alpha}.`;
    }
  } else if (testType === 'right-tailed') {
    // Right-tailed: H0: mu <= mu0, H1: mu > mu0
    // Rejection rule: t > t(1 - alpha, df) OR p-value < alpha
    const tCrit = jStat.studentt.inv(1 - alpha, df);
    pValue = 1 - jStat.studentt.cdf(t, df);
    isReject = t > tCrit;

    criticalValues = {
      positive: tCrit,
      display: `+${tCrit.toFixed(4)}`,
      rule: `Reject H₀ if t > ${tCrit.toFixed(4)}`,
    };

    if (isReject) {
      rejectionReason = `Calculated t = ${t.toFixed(4)} is greater than right-tail critical value ${tCrit.toFixed(4)} and p-value (${pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}) is less than α = ${alpha}.`;
    } else {
      rejectionReason = `Calculated t = ${t.toFixed(4)} is not greater than right-tail critical value ${tCrit.toFixed(4)} and p-value (${pValue.toFixed(4)}) is greater than or equal to α = ${alpha}.`;
    }
  } else if (testType === 'left-tailed') {
    // Left-tailed: H0: mu >= mu0, H1: mu < mu0
    // Rejection rule: t < -t(1 - alpha, df) OR p-value < alpha
    const tCrit = -jStat.studentt.inv(1 - alpha, df);
    pValue = jStat.studentt.cdf(t, df);
    isReject = t < tCrit;

    criticalValues = {
      negative: tCrit,
      display: `${tCrit.toFixed(4)}`,
      rule: `Reject H₀ if t < ${tCrit.toFixed(4)}`,
    };

    if (isReject) {
      rejectionReason = `Calculated t = ${t.toFixed(4)} is less than left-tail critical value ${tCrit.toFixed(4)} and p-value (${pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}) is less than α = ${alpha}.`;
    } else {
      rejectionReason = `Calculated t = ${t.toFixed(4)} is not less than left-tail critical value ${tCrit.toFixed(4)} and p-value (${pValue.toFixed(4)}) is greater than or equal to α = ${alpha}.`;
    }
  }

  // Cross-verify that p-value approach and critical-value approach agree
  const pValueReject = pValue < alpha;
  const methodsAgree = isReject === pValueReject;

  // Decision label
  const decision = isReject ? 'Reject H₀' : 'Fail to Reject H₀';

  // Plain-English statistical conclusions dynamically generated
  let conclusion = '';
  const alphaPercent = `${(alpha * 100).toFixed(0)}%`;
  const pDisplay = pValue < 0.0001 ? 'p < 0.0001' : `p = ${pValue.toFixed(4)}`;

  if (testType === 'two-tailed') {
    if (isReject) {
      conclusion = `At the ${alphaPercent} level of significance (α = ${alpha}), there is sufficient statistical evidence to conclude that the population mean examination score differs significantly from the claimed mean of ${mu0} marks (Sample Mean = ${mean.toFixed(2)}, t = ${t.toFixed(4)}, ${pDisplay}).`;
    } else {
      conclusion = `At the ${alphaPercent} level of significance (α = ${alpha}), the sample data does not provide sufficient statistical evidence to conclude that the population mean examination score differs from the claimed mean of ${mu0} marks (Sample Mean = ${mean.toFixed(2)}, t = ${t.toFixed(4)}, ${pDisplay}). We fail to reject the null hypothesis.`;
    }
  } else if (testType === 'right-tailed') {
    if (isReject) {
      conclusion = `At the ${alphaPercent} level of significance (α = ${alpha}), there is sufficient statistical evidence to conclude that the population mean examination score is significantly greater than the claimed mean of ${mu0} marks (Sample Mean = ${mean.toFixed(2)}, t = ${t.toFixed(4)}, ${pDisplay}).`;
    } else {
      conclusion = `At the ${alphaPercent} level of significance (α = ${alpha}), the sample data does not provide sufficient statistical evidence to conclude that the population mean examination score is greater than ${mu0} marks (Sample Mean = ${mean.toFixed(2)}, t = ${t.toFixed(4)}, ${pDisplay}). We fail to reject the null hypothesis.`;
    }
  } else if (testType === 'left-tailed') {
    if (isReject) {
      conclusion = `At the ${alphaPercent} level of significance (α = ${alpha}), there is sufficient statistical evidence to conclude that the population mean examination score is significantly less than the claimed mean of ${mu0} marks (Sample Mean = ${mean.toFixed(2)}, t = ${t.toFixed(4)}, ${pDisplay}).`;
    } else {
      conclusion = `At the ${alphaPercent} level of significance (α = ${alpha}), the sample data does not provide sufficient statistical evidence to conclude that the population mean examination score is less than ${mu0} marks (Sample Mean = ${mean.toFixed(2)}, t = ${t.toFixed(4)}, ${pDisplay}). We fail to reject the null hypothesis.`;
    }
  }

  // Step-by-step mathematical steps for college submission / assignment format
  const steps = generateStepByStepData({
    marks,
    desc,
    mu0,
    alpha,
    testType,
    df,
    t,
    pValue,
    criticalValues,
    isReject,
    decision,
    conclusion,
    rejectionReason,
  });

  return {
    isSuccess: true,
    isZeroVariance: false,
    marks,
    desc,
    n,
    mean,
    s,
    se,
    sum,
    sumSquaredDiffs,
    deviations,
    mu0,
    alpha,
    testType,
    df,
    t,
    pValue,
    criticalValues,
    isReject,
    methodsAgree,
    decision,
    rejectionReason,
    conclusion,
    steps,
  };
}

/**
 * Creates formatted mathematical step-by-step breakdown suitable for college assignments.
 */
function generateStepByStepData({
  marks,
  desc,
  mu0,
  alpha,
  testType,
  df,
  t,
  pValue,
  criticalValues,
  isReject,
  decision,
  conclusion,
  rejectionReason,
}) {
  const { n, sum, mean, s, se, sumSquaredDiffs } = desc;

  let h0Text = '';
  let h1Text = '';
  let testTypeLabel = '';

  if (testType === 'two-tailed') {
    testTypeLabel = 'Two-Tailed Test';
    h0Text = `H₀: μ = ${mu0} (The population average score equals ${mu0} marks)`;
    h1Text = `H₁: μ ≠ ${mu0} (The population average score differs from ${mu0} marks)`;
  } else if (testType === 'right-tailed') {
    testTypeLabel = 'Right-Tailed Test (Upper-tail)';
    h0Text = `H₀: μ ≤ ${mu0} (The population average score is at most ${mu0} marks)`;
    h1Text = `H₁: μ > ${mu0} (The population average score is greater than ${mu0} marks)`;
  } else {
    testTypeLabel = 'Left-Tailed Test (Lower-tail)';
    h0Text = `H₀: μ ≥ ${mu0} (The population average score is at least ${mu0} marks)`;
    h1Text = `H₁: μ < ${mu0} (The population average score is less than ${mu0} marks)`;
  }

  const sampleValuesPreview = marks.length <= 15
    ? marks.join(', ')
    : `${marks.slice(0, 10).join(', ')}, ..., ${marks.slice(-5).join(', ')} (total ${n} marks)`;

  return [
    {
      step: 1,
      title: 'Given Data & Problem Specification',
      description: 'Record the observed sample values and claimed population mean under test.',
      formula: 'X = \\{x_1, x_2, \\dots, x_n\\}, \\quad \\mu_0 = ' + mu0,
      substitutions: `Observed marks: [${sampleValuesPreview}]\nClaimed Population Mean (μ₀) = ${mu0} marks`,
      result: `Sample size n = ${n}, Claimed mean μ₀ = ${mu0}`,
    },
    {
      step: 2,
      title: 'Sample Size (n)',
      description: 'Count the total number of student observations in the sample.',
      formula: 'n = \\text{count of observations}',
      substitutions: `Counting individual student marks = ${n}`,
      result: `n = ${n}`,
    },
    {
      step: 3,
      title: 'Sample Mean (x̄)',
      description: 'Compute the arithmetic mean of the student marks.',
      formula: '\\bar{x} = \\frac{\\sum_{i=1}^n x_i}{n}',
      substitutions: `\\bar{x} = \\frac{${sum.toFixed(2)}}{${n}}`,
      result: `\\bar{x} = ${mean.toFixed(4)} marks`,
    },
    {
      step: 4,
      title: 'Sample Standard Deviation (s)',
      description: 'Calculate the unbiased sample standard deviation using (n - 1) degrees of freedom.',
      formula: 's = \\sqrt{\\frac{\\sum_{i=1}^n (x_i - \\bar{x})^2}{n - 1}}',
      substitutions: `\\sum (x_i - \\bar{x})^2 = ${sumSquaredDiffs.toFixed(4)}\ns = \\sqrt{\\frac{${sumSquaredDiffs.toFixed(4)}}{${n} - 1}} = \\sqrt{\\frac{${sumSquaredDiffs.toFixed(4)}}{${df}}} = \\sqrt{${(sumSquaredDiffs / df).toFixed(4)}}`,
      result: `s = ${s.toFixed(4)}, \\quad \\text{Standard Error } SE = \\frac{s}{\\sqrt{n}} = \\frac{${s.toFixed(4)}}{\\sqrt{${n}}} = ${se.toFixed(4)}`,
    },
    {
      step: 5,
      title: 'Null Hypothesis (H₀)',
      description: 'State the hypothesis of no significant difference or baseline status quo.',
      formula: testType === 'two-tailed' ? 'H_0: \\mu = \\mu_0' : testType === 'right-tailed' ? 'H_0: \\mu \\le \\mu_0' : 'H_0: \\mu \\ge \\mu_0',
      substitutions: h0Text,
      result: `H₀: μ ${testType === 'two-tailed' ? '=' : testType === 'right-tailed' ? '≤' : '≥'} ${mu0}`,
    },
    {
      step: 6,
      title: 'Alternative Hypothesis (H₁)',
      description: 'State the research hypothesis that contradicts the null hypothesis.',
      formula: testType === 'two-tailed' ? 'H_1: \\mu \\ne \\mu_0' : testType === 'right-tailed' ? 'H_1: \\mu > \\mu_0' : 'H_1: \\mu < \\mu_0',
      substitutions: `${h1Text} (${testTypeLabel})`,
      result: `H₁: μ ${testType === 'two-tailed' ? '≠' : testType === 'right-tailed' ? '>' : '<'} ${mu0}`,
    },
    {
      step: 7,
      title: 'Level of Significance (α)',
      description: 'Select the threshold for the probability of committing a Type I error (rejecting true H₀).',
      formula: '\\alpha = ' + alpha,
      substitutions: `Chosen significance level α = ${alpha} (${(alpha * 100).toFixed(0)}% risk of Type I error)`,
      result: `α = ${alpha}`,
    },
    {
      step: 8,
      title: 'Test Statistic Formula and Substitution (t)',
      description: "Apply Student's one-sample t-test statistic formula because population variance σ² is unknown.",
      formula: 't = \\frac{\\bar{x} - \\mu_0}{\\frac{s}{\\sqrt{n}}}',
      substitutions: `t = \\frac{${mean.toFixed(4)} - ${mu0}}{\\frac{${s.toFixed(4)}}{\\sqrt{${n}}}} = \\frac{${(mean - mu0).toFixed(4)}}{${se.toFixed(4)}}`,
      result: `t = ${t.toFixed(4)}`,
    },
    {
      step: 9,
      title: 'Degrees of Freedom (df)',
      description: 'Determine the degrees of freedom associated with the sample standard deviation estimation.',
      formula: 'df = n - 1',
      substitutions: `df = ${n} - 1`,
      result: `df = ${df}`,
    },
    {
      step: 10,
      title: 'Critical Value(s)',
      description: "Obtain critical value threshold(s) from Student's t-distribution for the specified tail and α.",
      formula: testType === 'two-tailed'
        ? 't_{\\text{crit}} = \\pm t_{1 - \\alpha/2, \\, df}'
        : testType === 'right-tailed'
          ? 't_{\\text{crit}} = +t_{1 - \\alpha, \\, df}'
          : 't_{\\text{crit}} = -t_{1 - \\alpha, \\, df}',
      substitutions: `For df = ${df} and α = ${alpha}: ${criticalValues.rule}`,
      result: `t_crit = ${criticalValues.display}`,
    },
    {
      step: 11,
      title: 'p-value Calculation',
      description: 'Calculate the probability of observing a test statistic as extreme as, or more extreme than, the observed value under H₀.',
      formula: testType === 'two-tailed'
        ? 'p = 2 \\times P(T \\ge |t|)'
        : testType === 'right-tailed'
          ? 'p = P(T \\ge t)'
          : 'p = P(T \\le t)',
      substitutions: `Computed using exact Student's t CDF for df = ${df} and t = ${t.toFixed(4)}`,
      result: `p-value = ${pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(6)}`,
    },
    {
      step: 12,
      title: 'Comparison of p-value with α',
      description: 'Compare the calculated p-value with the pre-selected significance level α.',
      formula: pValue < alpha ? 'p < \\alpha' : 'p \\ge \\alpha',
      substitutions: `${pValue.toFixed(6)} ${pValue < alpha ? '<' : '≥'} ${alpha}`,
      result: pValue < alpha ? `p-value (${pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}) is strictly less than α (${alpha}).` : `p-value (${pValue.toFixed(4)}) is greater than or equal to α (${alpha}).`,
    },
    {
      step: 13,
      title: 'Statistical Decision',
      description: 'Apply the formal decision criteria using both critical value and p-value methods.',
      formula: '\\text{Decision Criterion}: \\text{Reject } H_0 \\iff (p < \\alpha) \\text{ and } (t \\in \\text{Rejection Region})',
      substitutions: rejectionReason,
      result: `Decision: ${decision}`,
    },
    {
      step: 14,
      title: 'Final Plain-English Conclusion',
      description: 'Interpret the statistical result in the practical context of college student examination scores.',
      formula: '\\text{Practical Interpretation of Results}',
      substitutions: `Subject: Student Examination Marks Evaluation (μ₀ = ${mu0})`,
      result: conclusion,
    },
  ];
}

/**
 * Generates sample scenario datasets for quick user experimentation.
 */
export function generateScenario(scenarioType = 'random') {
  if (scenarioType === 'default') {
    return {
      claimedMean: 70,
      alpha: 0.05,
      testType: 'two-tailed',
      marks: parseMarks(DEFAULT_DATASET_STRING).marks,
      name: 'Default College Claim (μ₀ = 70)',
      description: 'Standard dataset of 30 student marks around 71.7, showing significant difference at α = 0.05.',
    };
  }

  if (scenarioType === 'high-achiever') {
    // High performing batch: Mean ~ 82, SD ~ 4
    const n = 28;
    const base = 82;
    const marks = [];
    for (let i = 0; i < n; i++) {
      const noise = (Math.random() - 0.5) * 12;
      const score = Math.round(Math.min(100, Math.max(0, base + noise)));
      marks.push(score);
    }
    return {
      claimedMean: 70,
      alpha: 0.01,
      testType: 'right-tailed',
      marks,
      name: 'Advanced Honors Cohort (High Performance)',
      description: 'Students scoring around 80-86 marks tested against claimed mean of 70 (Right-tailed).',
    };
  }

  if (scenarioType === 'underperforming') {
    // Struggling batch: Mean ~ 61, SD ~ 5
    const n = 25;
    const base = 61;
    const marks = [];
    for (let i = 0; i < n; i++) {
      const noise = (Math.random() - 0.5) * 14;
      const score = Math.round(Math.min(100, Math.max(0, base + noise)));
      marks.push(score);
    }
    return {
      claimedMean: 70,
      alpha: 0.05,
      testType: 'left-tailed',
      marks,
      name: 'Remedial Cohort (Low Performance)',
      description: 'Students scoring around 56-65 marks tested against standard college benchmark 70 (Left-tailed).',
    };
  }

  if (scenarioType === 'close-to-claim') {
    // Exactly conforming to claimed mean: Mean ~ 70.1, SD ~ 3
    const n = 32;
    const base = 70;
    const marks = [];
    for (let i = 0; i < n; i++) {
      const noise = (Math.random() - 0.5) * 8;
      const score = Math.round(Math.min(100, Math.max(0, base + noise)));
      marks.push(score);
    }
    return {
      claimedMean: 70,
      alpha: 0.05,
      testType: 'two-tailed',
      marks,
      name: 'Conforming Batch (Fail to Reject H₀)',
      description: 'Student scores closely matching 70 marks, illustrating Fail to Reject H₀.',
    };
  }

  if (scenarioType === 'zero-variance') {
    // Edge case: All 20 students scored exactly 70
    return {
      claimedMean: 70,
      alpha: 0.05,
      testType: 'two-tailed',
      marks: Array(20).fill(70),
      name: 'Zero Variance Edge Case (s = 0)',
      description: 'Edge case where all marks are identical (s = 0), demonstrating safe mathematical handling.',
    };
  }

  // General random realistic batch
  const n = 25 + Math.floor(Math.random() * 15);
  const targetMean = 65 + Math.random() * 15;
  const targetSpread = 4 + Math.random() * 6;
  const marks = [];
  for (let i = 0; i < n; i++) {
    const val = Math.round(targetMean + (Math.random() - 0.5) * targetSpread * 2);
    marks.push(Math.min(100, Math.max(0, val)));
  }
  return {
    claimedMean: 70,
    alpha: 0.05,
    testType: 'two-tailed',
    marks,
    name: 'Dynamically Generated Student Examination Cohort',
    description: `Generated ${n} realistic student marks with mean ~ ${targetMean.toFixed(1)}.`,
  };
}

/**
 * Computes frequency histogram data bins for student marks.
 */
export function generateHistogramData(marks, binWidth = 5) {
  if (!marks || marks.length === 0) return [];
  const minVal = Math.floor(Math.min(...marks) / binWidth) * binWidth;
  const maxVal = Math.ceil((Math.max(...marks) + 1) / binWidth) * binWidth;

  const bins = [];
  for (let lower = minVal; lower < maxVal; lower += binWidth) {
    const upper = lower + binWidth;
    bins.push({
      range: `${lower}-${upper}`,
      lower,
      upper,
      mid: (lower + upper) / 2,
      count: 0,
      percentage: 0,
    });
  }

  for (const score of marks) {
    for (const bin of bins) {
      if (score >= bin.lower && score < bin.upper) {
        bin.count += 1;
        break;
      }
      if (score === bin.upper && bin === bins[bins.length - 1]) {
        bin.count += 1;
        break;
      }
    }
  }

  const n = marks.length;
  for (const bin of bins) {
    bin.percentage = Number(((bin.count / n) * 100).toFixed(1));
  }

  return bins;
}

/**
 * Generates points for visualizing the Student's t distribution curve and decision regions.
 */
export function generateDistributionCurveData(df, tObserved, testType, alpha, pointsCount = 120) {
  // Determine range of x axis: at least [-4.5, 4.5], or wider if |tObserved| is large
  const maxAbsT = Math.max(4.5, Math.abs(tObserved || 0) + 1);
  const minX = -maxAbsT;
  const maxX = maxAbsT;
  const step = (maxX - minX) / (pointsCount - 1);

  // Compute critical values
  let leftCrit = null;
  let rightCrit = null;

  if (testType === 'two-tailed') {
    const crit = jStat.studentt.inv(1 - alpha / 2, df);
    leftCrit = -crit;
    rightCrit = crit;
  } else if (testType === 'right-tailed') {
    rightCrit = jStat.studentt.inv(1 - alpha, df);
  } else if (testType === 'left-tailed') {
    leftCrit = -jStat.studentt.inv(1 - alpha, df);
  }

  const data = [];

  for (let i = 0; i < pointsCount; i++) {
    const x = minX + i * step;
    const density = jStat.studentt.pdf(x, df);

    let isRejection = false;
    if (testType === 'two-tailed') {
      if (x <= leftCrit || x >= rightCrit) isRejection = true;
    } else if (testType === 'right-tailed') {
      if (x >= rightCrit) isRejection = true;
    } else if (testType === 'left-tailed') {
      if (x <= leftCrit) isRejection = true;
    }

    data.push({
      x: Number(x.toFixed(3)),
      density: Number(density.toFixed(5)),
      acceptanceDensity: isRejection ? 0 : Number(density.toFixed(5)),
      rejectionDensity: isRejection ? Number(density.toFixed(5)) : 0,
      isRejection,
    });
  }

  return {
    curveData: data,
    leftCrit,
    rightCrit,
    minX,
    maxX,
    df,
    tObserved,
  };
}
