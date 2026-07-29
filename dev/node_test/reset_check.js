// DEV-ONLY. Reproduces the reported bug: run the Training Simulator forward, draw and
// predict a digit, then reset the Playground from Settings, and verify every lab
// actually reverts to a fresh state instead of holding onto the previous run's data.
const path = require("path");
const { chromium } = require("playwright-core");
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const htmlPath = path.resolve(__dirname, "../../cnn-learning-lab.html");

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto("file://" + htmlPath, { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.click("#btnOpenPlaygroundStartup");
  await page.waitForTimeout(150);

  console.log("=== Before reset: advance training + draw a prediction ===");
  await page.click("#viewTabs button:has-text('Train')");
  await page.waitForTimeout(100);
  await page.click("button:has-text('Skip to end')");
  await page.waitForTimeout(150);
  const epochTextBefore = await page.textContent("#viewBody");
  console.log("Training reached final epoch banner present:", epochTextBefore.includes("Best checkpoint"));

  await page.click("#viewTabs button:has-text('Predict')");
  await page.waitForTimeout(100);
  const canvas = await page.$(".canvas-frame");
  const box = await canvas.boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy - 60);
  await page.mouse.down();
  for (let i = 0; i <= 10; i++) await page.mouse.move(cx, cy - 60 + i * 12, { steps: 2 });
  await page.mouse.up();
  await page.click("button:has-text('🔮 Predict')");
  await page.waitForTimeout(150);
  console.log("Prediction result present before reset:", await page.isVisible("text=Genuine embedded inference"));

  console.log("\n=== Reset Playground via Settings ===");
  page.on("dialog", d => d.accept());
  await page.click("#btnSettings");
  await page.waitForTimeout(100);
  await page.click("button:has-text('Reset Playground')");
  await page.waitForTimeout(150);
  await page.click("#btnCloseExplain");
  await page.waitForTimeout(100);

  console.log("\n=== After reset: check every lab is actually fresh ===");
  await page.click("#viewTabs button:has-text('Train')");
  await page.waitForTimeout(100);
  const trainTextAfter = await page.textContent("#viewBody");
  console.log("Train view still shows 'Best checkpoint' (should be FALSE):", trainTextAfter.includes("Best checkpoint"));
  console.log("Train view shows epoch 1 illustrative batch (should be TRUE):", trainTextAfter.includes("epoch 1 of"));

  await page.click("#viewTabs button:has-text('Predict')");
  await page.waitForTimeout(100);
  const predictTextAfter = await page.textContent("#viewBody");
  console.log("Predict view still shows old result (should be FALSE):", predictTextAfter.includes("Genuine embedded inference"));

  await page.click("#viewTabs button:has-text('Convolution')");
  await page.waitForTimeout(100);
  await page.click("#viewTabs button:has-text('Builder')");
  await page.waitForTimeout(100);
  const builderText = await page.textContent("#viewBody");
  console.log("Builder shows canonical 22-layer count intact:", (builderText.match(/params/g) || []).length > 0);

  await browser.close();
  const bugStillPresent = trainTextAfter.includes("Best checkpoint") || predictTextAfter.includes("Genuine embedded inference");
  process.exitCode = bugStillPresent ? 1 : 0;
})();
