const path = require("path");
const { chromium } = require("playwright-core");
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const htmlPath = path.resolve(__dirname, "../../cnn-learning-lab.html");

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage();
  await page.goto("file://" + htmlPath, { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.click("#btnOpenPlaygroundStartup");
  await page.waitForTimeout(150);

  console.log("Before:", await page.textContent("#btnModeTrainInfer"));
  await page.click("#btnModeTrainInfer");
  await page.waitForTimeout(50);
  console.log("After click:", await page.textContent("#btnModeTrainInfer"));
  const dropoutNote = await page.textContent("#archStrip");
  console.log("Arch strip mentions 'Active' (dropout) after switching to Training:", dropoutNote.includes("Active"));

  await page.click('#pathTabs button[data-path="learning"]');
  await page.waitForTimeout(50);
  console.log("Learning loop badge visible:", await page.isVisible("text=Learning loop (not part of forward inference)"));
  console.log("Backpropagation node visible:", await page.isVisible("#archStrip >> text=Backpropagation"));

  await page.click('#pathTabs button[data-path="forward"]');
  await page.waitForTimeout(50);
  console.log("Back to forward path, Conv node visible:", await page.isVisible("#archStrip >> text=Conv 1"));

  await browser.close();
})();
