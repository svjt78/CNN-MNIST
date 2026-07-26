// DEV-ONLY. Quick diagnostic: find which elements overflow the viewport at 390px width
// while on the Builder view (the view active during the responsive test in browser_check.js).
const path = require("path");
const { chromium } = require("playwright-core");
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const htmlPath = path.resolve(__dirname, "../../cnn-learning-lab.html");

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("file://" + htmlPath, { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.click("#btnOpenPlaygroundStartup");
  await page.waitForTimeout(150);
  await page.click("#viewTabs button:has-text('Builder')");
  await page.waitForTimeout(150);

  const offenders = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const results = [];
    document.querySelectorAll("body *").forEach((elm) => {
      const r = elm.getBoundingClientRect();
      if (r.right > vw + 1 && r.width > 0) {
        results.push({
          tag: elm.tagName, id: elm.id, cls: (elm.className||"").toString().slice(0,60),
          right: Math.round(r.right), width: Math.round(r.width), text: (elm.textContent||"").trim().slice(0,40)
        });
      }
    });
    return results;
  });
  console.log("Viewport width: 390");
  console.log(JSON.stringify(offenders.slice(0,25), null, 2));
  await browser.close();
})();
