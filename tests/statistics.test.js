import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  parseMarks,
  calculateDescriptiveStats,
  validateHypothesisInputs,
  performTTest,
  DEFAULT_DATASET_STRING,
  generateHistogramData,
  generateDistributionCurveData,
} from '../src/utils/statistics.js';

describe('Statistics Engine Tests for Student Performance Hypothesis Testing', () => {
  it('should parse valid comma and newline separated marks', () => {
    const raw = '72, 68\n75, 71';
    const res = parseMarks(raw);
    assert.strictEqual(res.isValid, true);
    assert.deepStrictEqual(res.marks, [72, 68, 75, 71]);
  });

  it('should reject non-numeric input', () => {
    const raw = '72, abc, 75';
    const res = parseMarks(raw);
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /Invalid non-numeric/);
  });

  it('should reject out of range marks (< 0 or > 100)', () => {
    const raw = '72, 105, -5';
    const res = parseMarks(raw);
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /between 0 and 100/);
  });

  it('should reject sample size less than 2', () => {
    const raw = '75';
    const res = parseMarks(raw);
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /at least 2 observations/);
  });

  it('should correctly calculate descriptive statistics on the default dataset', () => {
    const parsed = parseMarks(DEFAULT_DATASET_STRING);
    assert.strictEqual(parsed.marks.length, 30);

    const desc = calculateDescriptiveStats(parsed.marks);
    assert.strictEqual(desc.n, 30);
    assert.strictEqual(desc.sum, 2151);
    assert.strictEqual(Math.round(desc.mean * 10) / 10, 71.7);
    assert.strictEqual(desc.min, 67);
    assert.strictEqual(desc.max, 76);
    assert.ok(Math.abs(desc.s - 2.548) < 0.01);
  });

  it('should correctly perform two-tailed one-sample t-test on default dataset', () => {
    const parsed = parseMarks(DEFAULT_DATASET_STRING);
    const result = performTTest({
      marks: parsed.marks,
      claimedMean: 70,
      significanceLevel: 0.05,
      testType: 'two-tailed',
    });

    assert.strictEqual(result.isSuccess, true);
    assert.strictEqual(result.df, 29);
    assert.ok(Math.abs(result.t - 3.654) < 0.01);
    assert.ok(Math.abs(result.criticalValues.positive - 2.045) < 0.01);
    assert.ok(result.pValue < 0.002 && result.pValue > 0.0009);
    assert.strictEqual(result.decision, 'Reject H₀');
    assert.strictEqual(result.methodsAgree, true);
    assert.strictEqual(result.steps.length, 14);
  });

  it('should correctly evaluate right-tailed test', () => {
    const parsed = parseMarks(DEFAULT_DATASET_STRING);
    const result = performTTest({
      marks: parsed.marks,
      claimedMean: 70,
      significanceLevel: 0.05,
      testType: 'right-tailed',
    });

    assert.strictEqual(result.isSuccess, true);
    assert.ok(Math.abs(result.criticalValues.positive - 1.699) < 0.01);
    assert.ok(result.pValue < 0.001);
    assert.strictEqual(result.decision, 'Reject H₀');
    assert.strictEqual(result.methodsAgree, true);
  });

  it('should correctly evaluate left-tailed test with Fail to Reject H₀', () => {
    const parsed = parseMarks(DEFAULT_DATASET_STRING);
    const result = performTTest({
      marks: parsed.marks,
      claimedMean: 70,
      significanceLevel: 0.05,
      testType: 'left-tailed',
    });

    assert.strictEqual(result.isSuccess, true);
    assert.ok(result.t > 0);
    assert.ok(result.pValue > 0.99);
    assert.strictEqual(result.decision, 'Fail to Reject H₀');
    assert.strictEqual(result.methodsAgree, true);
  });

  it('should safely handle zero variance edge case', () => {
    const identicalMarks = [70, 70, 70, 70, 70];
    const result = performTTest({
      marks: identicalMarks,
      claimedMean: 70,
      significanceLevel: 0.05,
      testType: 'two-tailed',
    });

    assert.strictEqual(result.isSuccess, false);
    assert.strictEqual(result.isZeroVariance, true);
    assert.match(result.error, /standard deviation is zero/);
  });

  it('should generate valid histogram and curve data', () => {
    const parsed = parseMarks(DEFAULT_DATASET_STRING);
    const hist = generateHistogramData(parsed.marks, 5);
    assert.ok(hist.length > 0);
    const totalCount = hist.reduce((acc, h) => acc + h.count, 0);
    assert.strictEqual(totalCount, 30);

    const curve = generateDistributionCurveData(29, 3.654, 'two-tailed', 0.05, 50);
    assert.strictEqual(curve.curveData.length, 50);
    assert.ok(curve.leftCrit < 0);
    assert.ok(curve.rightCrit > 0);
  });

  it('should validate claimedMean properly', () => {
    const emptyClaim = validateHypothesisInputs({ marks: '70, 75', claimedMean: '' });
    assert.strictEqual(emptyClaim.isValid, false);
    assert.match(emptyClaim.error, /cannot be empty/);

    const negativeClaim = validateHypothesisInputs({ marks: '70, 75', claimedMean: -5 });
    assert.strictEqual(negativeClaim.isValid, false);
    assert.match(negativeClaim.error, /between 0 and 100/);

    const overClaim = validateHypothesisInputs({ marks: '70, 75', claimedMean: 105 });
    assert.strictEqual(overClaim.isValid, false);
    assert.match(overClaim.error, /between 0 and 100/);

    const validClaim = validateHypothesisInputs({ marks: '70, 75', claimedMean: 70 });
    assert.strictEqual(validClaim.isValid, true);
  });
});
