const path = require("path");
const { chromium } = require("playwright-core");
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const htmlPath = path.resolve(__dirname, "../../cnn-learning-lab.html");
(async () => {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, colorScheme: "light" });
  await page.goto("file://" + htmlPath, { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.click("#btnOpenPlaygroundStartup");
  await page.waitForTimeout(150);
  await page.click("#viewTabs button:has-text('Train')");
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.resolve(__dirname, "../artifacts/temp_screenshots/light_mode_train.png") });
  await browser.close();
})();
