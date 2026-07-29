// DEV-ONLY. Verifies the select/input visibility fix: emulates dark color-scheme
// (matching the user's reported bug), navigates to Teach the CNN / Training Simulator,
// checks computed styles of every select/input for a real color-vs-background contrast,
// and saves a screenshot for visual confirmation.
const path = require("path");
const { chromium } = require("playwright-core");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const htmlPath = path.resolve(__dirname, "../../cnn-learning-lab.html");

function luminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function contrastRatio(rgb1, rgb2) {
  const L1 = luminance(...rgb1), L2 = luminance(...rgb2);
  const [lighter, darker] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (lighter + 0.05) / (darker + 0.05);
}
function parseRgb(str) {
  const m = str.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
  return m ? [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])] : [255, 255, 255];
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, colorScheme: "dark" });
  await page.goto("file://" + htmlPath, { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.click("#btnOpenPlaygroundStartup");
  await page.waitForTimeout(150);

  async function checkView(label, tabText) {
    const tab = await page.$(`#viewTabs button:has-text('${tabText}')`);
    if (tab) { await tab.click(); await page.waitForTimeout(150); }
    const results = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("#viewBody select, #viewBody input:not([type=checkbox]):not([type=range])"));
      return els.map(el => {
        const cs = getComputedStyle(el);
        return { tag: el.tagName, type: el.type || "", value: el.value, color: cs.color, background: cs.backgroundColor };
      });
    });
    let localFailures = 0;
    results.forEach(r => {
      const ratio = contrastRatio(parseRgb(r.color), parseRgb(r.background));
      if (ratio < 3.0) { localFailures++; console.log(`  FAIL [${label}] <${r.tag.toLowerCase()}${r.type ? ' type="'+r.type+'"' : ""}> value="${r.value}" color=${r.color} bg=${r.background} ratio=${ratio.toFixed(2)}`); }
    });
    console.log(`[${label}] ${results.length - localFailures}/${results.length} controls OK`);
    return { total: results.length, failures: localFailures };
  }

  let totalAll = 0, failAll = 0;
  for (const [label, tabText] of [["Pixels","Pixels"],["Convolution","Convolution"],["Pooling","Pooling"],["Train","Train"],["Predict","Predict"],["Builder","Builder"],["Glossary","Glossary"]]) {
    const r = await checkView(label, tabText);
    totalAll += r.total; failAll += r.failures;
  }
  console.log(`\nTOTAL: ${totalAll - failAll}/${totalAll} controls across all checked views have adequate contrast.`);

  // Re-navigate to Train for the screenshot (matches the user's originally reported screen)
  await page.click("#viewTabs button:has-text('Train')");
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.resolve(__dirname, "../artifacts/temp_screenshots/after_fix_teach_the_cnn.png"), fullPage: false });
  console.log("Screenshot saved.");

  await browser.close();
  process.exitCode = failAll > 0 ? 1 : 0;
})();
