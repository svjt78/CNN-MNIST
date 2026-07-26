const path = require("path");
const { chromium } = require("playwright-core");
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const htmlPath = path.resolve(__dirname, "../../cnn-learning-lab.html");

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const context = await browser.newContext({ offline: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type()==="error") errors.push(m.text()); });
  await page.goto("file://" + htmlPath, { waitUntil: "load" });
  await page.waitForTimeout(500);
  const note = await page.textContent("#startupSelfTestNote");
  console.log("Loaded fully OFFLINE. Self-test note:", note);
  await page.click("#btnBeginMission");
  await page.waitForTimeout(300);
  console.log("Mission title after offline start:", await page.textContent("#viewBody h3"));
  console.log("Errors:", errors.length ? errors : "(none)");
  await browser.close();
  process.exitCode = errors.length ? 1 : 0;
})();
