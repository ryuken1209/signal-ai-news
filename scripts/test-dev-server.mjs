const modules = [
  '/',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/context/HypothesisContext.jsx',
  '/src/components/Sidebar.jsx',
  '/src/components/StatCard.jsx',
  '/src/components/ResultPanel.jsx',
  '/src/components/MarksHistogram.jsx',
  '/src/components/MeanComparisonChart.jsx',
  '/src/components/DecisionRegionChart.jsx',
  '/src/pages/Dashboard.jsx',
  '/src/pages/HypothesisTest.jsx',
  '/src/pages/StepByStep.jsx',
  '/src/pages/Visualizations.jsx',
  '/src/pages/ErrorTypes.jsx',
  '/src/pages/LearnStatistics.jsx',
  '/src/pages/AboutProject.jsx',
  '/src/utils/statistics.js',
];

let failed = false;

for (const mod of modules) {
  try {
    const res = await fetch(`http://localhost:5173${mod}`);
    const text = await res.text();
    if (res.status !== 200) {
      console.error(`✗ ${mod} returned HTTP ${res.status}`);
      failed = true;
    } else if (text.includes('[vite] Internal server error') || text.includes('vite-error-overlay')) {
      console.error(`✗ ${mod} contains Vite compiler error:`, text.slice(0, 300));
      failed = true;
    } else {
      console.log(`✓ ${mod} loaded OK (${res.status}, ${text.length} bytes)`);
    }
  } catch (err) {
    console.error(`✗ Failed to fetch ${mod}:`, err.message);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log('\nALL 18 APP MODULES TRANSFORMED AND SERVED WITHOUT ERRORS!');
}
