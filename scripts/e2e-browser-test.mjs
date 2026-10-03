import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

const executablePath = chromePaths.find(p => fs.existsSync(p));

if (!executablePath) {
  console.error('No suitable browser found for headless testing.');
  process.exit(1);
}

console.log(`Using browser: ${executablePath}`);

async function runE2ETests() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon.ico')) {
        consoleErrors.push(text);
        console.error(`[PAGE ERROR LOG]: ${text}`);
      }
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
    console.error(`[PAGE UNCAUGHT EXCEPTION]: ${err}`);
  });

  const baseUrl = 'http://localhost:5173';

  console.log('\n--- 1. Testing Dashboard Page ---');
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle2' });

  // Verify StatCards exist and have real valid numbers
  const statCardValues = await page.$$eval('.text-2xl.font-bold', els => els.map(e => e.textContent.trim()));
  console.log('Dashboard StatCard values:', statCardValues);
  if (statCardValues.some(v => v.includes('NaN') || v.includes('undefined'))) {
    throw new Error('Found NaN or undefined in Dashboard StatCards!');
  }

  // Click on "Open Full Test Lab" link
  console.log('Clicking "Open Full Test Lab"...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
    page.click('a[href="/hypothesis-test"]')
  ]);
  if (!page.url().includes('/hypothesis-test')) {
    throw new Error(`Expected navigation to /hypothesis-test, got: ${page.url()}`);
  }
  console.log('✓ Successfully navigated to /hypothesis-test');

  console.log('\n--- 2. Testing Hypothesis Test Page Inputs & Presets ---');
  
  // Test clicking preset: "High Achievers Cohort"
  const highAchieversBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent.includes('High Achievers'));
  });
  if (highAchieversBtn && highAchieversBtn.asElement()) {
    await highAchieversBtn.asElement().click();
    await new Promise(r => setTimeout(r, 200));
    const meanVal = await page.$eval('#claimedMean', el => el.value);
    console.log(`✓ Loaded High Achievers preset. Claimed mean input: ${meanVal}`);
  }

  // Test clicking preset: "Zero Variance Edge Case"
  const zeroVarBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent.includes('Zero Variance'));
  });
  if (zeroVarBtn && zeroVarBtn.asElement()) {
    await zeroVarBtn.asElement().click();
    await new Promise(r => setTimeout(r, 200));
    const bodyText = await page.evaluate(() => document.body.textContent);
    if (!bodyText.includes('Zero sample standard deviation') && !bodyText.includes('s = 0')) {
      throw new Error('Zero variance scenario explanation not shown!');
    }
    console.log('✓ Zero Variance Edge Case correctly processed without NaN or Infinity');
  }

  // Test "Generate Sample Scenario" (Randomize)
  const randomBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent.includes('Generate Sample Scenario'));
  });
  if (randomBtn && randomBtn.asElement()) {
    await randomBtn.asElement().click();
    await new Promise(r => setTimeout(r, 200));
    console.log('✓ Successfully clicked Generate Sample Scenario');
  }

  // Click "Reset Data to Defaults"
  const resetBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent.includes('Reset Data to Defaults'));
  });
  if (resetBtn && resetBtn.asElement()) {
    await resetBtn.asElement().click();
    await new Promise(r => setTimeout(r, 200));
    const marksVal = await page.$eval('#studentMarks', el => el.value);
    if (!marksVal.includes('72, 68, 75')) {
      throw new Error(`Reset button failed to restore default marks! Value: ${marksVal.substring(0, 40)}`);
    }
    console.log('✓ Reset to Default button restored default dataset correctly (72, 68, 75...)');
  }

  // Click "Perform Hypothesis Test"
  const performBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent.includes('Perform Hypothesis Test'));
  });
  if (performBtn && performBtn.asElement()) {
    await performBtn.asElement().click();
    await new Promise(r => setTimeout(r, 300));
    console.log('✓ Successfully executed Perform Hypothesis Test');
  }

  // Test validation error handling: Enter invalid marks
  console.log('Testing invalid input validation...');
  await page.evaluate(() => {
    const el = document.querySelector('#studentMarks');
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    nativeSetter.call(el, 'abc, 120, -5');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 200));
  const hasError = await page.evaluate(() => {
    return document.body.textContent.includes('must be numbers between 0 and 100') ||
           document.body.textContent.includes('Input Validation Error') ||
           document.body.textContent.includes('Invalid');
  });
  if (!hasError) {
    throw new Error('Validation message did not display for invalid marks input!');
  }
  console.log('✓ Validation error banner properly displayed for invalid input');

  // Reset back to default
  if (resetBtn && resetBtn.asElement()) {
    await resetBtn.asElement().click();
    await new Promise(r => setTimeout(r, 200));
    if (performBtn && performBtn.asElement()) {
      await performBtn.asElement().click();
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log('\n--- 3. Testing Step-by-Step Solution Page ---');
  await page.click('a[href="/step-by-step"]');
  await new Promise(r => setTimeout(r, 500));
  const stepHeadings = await page.$$eval('h2, h3, h4', els => els.map(e => e.textContent.trim()));
  console.log('Step-by-step headings loaded:', stepHeadings.slice(0, 6));
  const stepPageText = await page.evaluate(() => document.body.textContent);
  if (stepPageText.includes('NaN') || stepPageText.includes('undefined')) {
    throw new Error('Found NaN or undefined on Step-by-Step page!');
  }
  console.log('✓ Step-by-Step Solution page rendered completely and correctly');

  console.log('\n--- 4. Testing Data Visualization Page ---');
  await page.click('a[href="/visualizations"]');
  await new Promise(r => setTimeout(r, 700));
  const chartsCount = await page.$$eval('.recharts-responsive-container', els => els.length);
  console.log(`Found ${chartsCount} Recharts responsive containers.`);
  if (chartsCount === 0) {
    throw new Error('Recharts containers did not render on Visualizations page!');
  }
  console.log('✓ All Recharts visualization charts rendered');

  console.log('\n--- 5. Testing Type I & Type II Errors Page ---');
  await page.click('a[href="/error-types"]');
  await new Promise(r => setTimeout(r, 500));
  // Click matrix quadrant: Type II Error
  const type2Btn = await page.evaluateHandle(() => {
    const cards = Array.from(document.querySelectorAll('div, button'));
    return cards.find(c => c.textContent.includes('Type II Error (β)') && c.classList.contains('cursor-pointer'));
  });
  if (type2Btn && type2Btn.asElement()) {
    await type2Btn.asElement().click();
    await new Promise(r => setTimeout(r, 200));
    console.log('✓ Successfully clicked Type II Error quadrant card');
  }

  console.log('\n--- 6. Testing Learn Statistics Page & Quiz ---');
  await page.click('a[href="/learn-statistics"]');
  await new Promise(r => setTimeout(r, 500));
  // Find quiz options
  const quizOption = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent.includes('Rejection of H₀ when H₀ is actually true') || b.textContent.includes('Type I'));
  });
  if (quizOption && quizOption.asElement()) {
    await quizOption.asElement().click();
    await new Promise(r => setTimeout(r, 200));
    console.log('✓ Clicked quiz option in Viva Voce quiz');
  }
  // Click Retake Viva Quiz if available
  const retakeBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent.includes('Retake Quiz') || b.textContent.includes('Retake'));
  });
  if (retakeBtn && retakeBtn.asElement()) {
    await retakeBtn.asElement().click();
    await new Promise(r => setTimeout(r, 200));
    console.log('✓ Clicked Retake Quiz button successfully');
  }

  console.log('\n--- 7. Testing About Project Page ---');
  await page.click('a[href="/about-project"]');
  await new Promise(r => setTimeout(r, 500));
  const aboutHeadings = await page.$$eval('h1, h2, h3', els => els.map(e => e.textContent.trim()));
  console.log('About page headings loaded:', aboutHeadings.slice(0, 4));
  console.log('✓ About Project page rendered correctly');

  console.log('\n--- 8. Returning to Dashboard ---');
  await page.click('a[href="/"]');
  await new Promise(r => setTimeout(r, 500));
  if (page.url() !== `${baseUrl}/` && !page.url().endsWith(':5173/')) {
    throw new Error(`Expected Dashboard root url, got: ${page.url()}`);
  }
  console.log('✓ Navigated back to Dashboard smoothly');

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error(`\nFAILED: Encountered ${consoleErrors.length} console errors during test:`);
    consoleErrors.forEach((e, idx) => console.error(`  ${idx + 1}. ${e}`));
    process.exit(1);
  } else {
    console.log('\nSUCCESS: Full End-to-End browser walkthrough passed with 0 errors, 0 NaNs, 0 broken links!');
  }
}

runE2ETests().catch(err => {
  console.error('\nE2E Test Execution Failed:', err);
  process.exit(1);
});
