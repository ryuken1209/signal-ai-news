import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  DEFAULT_DATASET_STRING,
  DEFAULT_PARAMETERS,
  parseMarks,
  validateHypothesisInputs,
  performTTest,
  generateScenario,
} from '../utils/statistics';

const HypothesisContext = createContext(null);

export function HypothesisProvider({ children }) {
  const [marksString, setMarksString] = useState(DEFAULT_DATASET_STRING);
  const [claimedMean, setClaimedMean] = useState(DEFAULT_PARAMETERS.claimedMean);
  const [significanceLevel, setSignificanceLevel] = useState(DEFAULT_PARAMETERS.significanceLevel);
  const [testType, setTestType] = useState(DEFAULT_PARAMETERS.testType);
  const [activePreset, setActivePreset] = useState('Default College Claim');

  // Input validation
  const validation = useMemo(() => {
    return validateHypothesisInputs({
      marks: marksString,
      claimedMean,
      significanceLevel,
      testType,
    });
  }, [marksString, claimedMean, significanceLevel, testType]);

  // Compute test results automatically or safely handle errors
  const testResult = useMemo(() => {
    if (!validation.isValid) {
      return null;
    }
    return performTTest({
      marks: validation.marks,
      claimedMean: Number(claimedMean),
      significanceLevel: Number(significanceLevel),
      testType,
    });
  }, [validation, claimedMean, significanceLevel, testType]);

  // Actions
  const resetData = useCallback(() => {
    setMarksString(DEFAULT_DATASET_STRING);
    setClaimedMean(DEFAULT_PARAMETERS.claimedMean);
    setSignificanceLevel(DEFAULT_PARAMETERS.significanceLevel);
    setTestType(DEFAULT_PARAMETERS.testType);
    setActivePreset('Default College Claim');
  }, []);

  const loadScenario = useCallback((scenarioKey) => {
    const sc = generateScenario(scenarioKey);
    setMarksString(sc.marks.join(', '));
    setClaimedMean(sc.claimedMean);
    setSignificanceLevel(sc.alpha);
    setTestType(sc.testType);
    setActivePreset(sc.name);
    return sc;
  }, []);

  const value = {
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
    activePreset,
    setActivePreset,
    resetData,
    loadScenario,
  };

  return (
    <HypothesisContext.Provider value={value}>
      {children}
    </HypothesisContext.Provider>
  );
}

export function useHypothesis() {
  const context = useContext(HypothesisContext);
  if (!context) {
    throw new Error('useHypothesis must be used within a HypothesisProvider');
  }
  return context;
}
