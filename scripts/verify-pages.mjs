import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HypothesisProvider } from '../src/context/HypothesisContext.jsx';
import Dashboard from '../src/pages/Dashboard.jsx';
import HypothesisTest from '../src/pages/HypothesisTest.jsx';
import StepByStep from '../src/pages/StepByStep.jsx';
import Visualizations from '../src/pages/Visualizations.jsx';
import ErrorTypes from '../src/pages/ErrorTypes.jsx';
import LearnStatistics from '../src/pages/LearnStatistics.jsx';
import AboutProject from '../src/pages/AboutProject.jsx';

const routes = [
  { path: '/', comp: Dashboard, name: 'Dashboard' },
  { path: '/hypothesis-test', comp: HypothesisTest, name: 'HypothesisTest' },
  { path: '/step-by-step', comp: StepByStep, name: 'StepByStep' },
  { path: '/visualizations', comp: Visualizations, name: 'Visualizations' },
  { path: '/error-types', comp: ErrorTypes, name: 'ErrorTypes' },
  { path: '/learn-statistics', comp: LearnStatistics, name: 'LearnStatistics' },
  { path: '/about-project', comp: AboutProject, name: 'AboutProject' },
];

let allPassed = true;

for (const route of routes) {
  try {
    const html = ReactDOMServer.renderToString(
      React.createElement(
        HypothesisProvider,
        null,
        React.createElement(
          MemoryRouter,
          { initialEntries: [route.path] },
          React.createElement(route.comp, null)
        )
      )
    );
    const hasNaN = html.includes('NaN');
    const hasUndefined = html.includes('undefined');
    const hasInfinity = html.includes('Infinity');

    if (hasNaN || hasUndefined || hasInfinity) {
      console.error(`Page ${route.name} has anomalous values: NaN=${hasNaN}, undefined=${hasUndefined}, Infinity=${hasInfinity}`);
      allPassed = false;
    } else {
      console.log(`✓ Page ${route.name} rendered cleanly (HTML: ${html.length} chars)`);
    }
  } catch (err) {
    console.error(`✗ Page ${route.name} threw error:`, err);
    allPassed = false;
  }
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log('ALL 7 PAGES RENDERED CLEANLY WITHOUT ERRORS, NAN, OR UNDEFINED.');
}
