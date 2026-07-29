// DEV-ONLY. Drives real Google Chrome via Playwright to open cnn-learning-lab.html
// directly through the file:// scheme (no dev server), exercising the critical paths
// from section 21 of the implementation prompt.
const path = require("path");
const { chromium } = require("playwright-core");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const htmlPath = path.resolve(__dirname, "../../cnn-learning-lab.html");
const fileUrl = "file://" + htmlPath;

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const consoleErrors = [];
  const pageErrors = [];
  let requestsSeen = [];

  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("request", (req) => { if (!req.url().startsWith("file://")) requestsSeen.push(req.url()); });

  console.log("Opening", fileUrl);
  await page.goto(fileUrl, { waitUntil: "load" });
  await page.waitForTimeout(400);

  console.log("\n=== Network requests other than file:// (should be empty) ===");
  console.log(requestsSeen.length ? requestsSeen : "(none)");

  console.log("\n=== 1. Startup screen ===");
  const startupVisible = await page.isVisible("#startupScreen");
  console.log("startup screen visible:", startupVisible);
  const selfTestNote = await page.textContent("#startupSelfTestNote");
  console.log("self-test note:", selfTestNote);

  console.log("\n=== 2. Begin Guided Mission, walk all 8 steps ===");
  await page.click("#btnBeginMission");
  await page.waitForTimeout(150);
  for (let i = 0; i < 8; i++) {
    const title = await page.textContent("#viewBody h3").catch(() => "(none)");
    console.log(`step ${i + 1}:`, title);
    if (i === 4) {
      // build_cnn step: click "Add next block" until done, then try the repair challenge.
      for (let j = 0; j < 8; j++) {
        const addBtn = await page.$("button:has-text('Add next block')");
        if (!addBtn) break;
        await addBtn.click();
        await page.waitForTimeout(50);
      }
      const breakBtn = await page.$("button:has-text('Break it on purpose')");
      if (breakBtn) { await breakBtn.click(); await page.waitForTimeout(50); }
      const fixBtn = await page.$("button:has-text('Fix: change dense input size')");
      if (fixBtn) { await fixBtn.click(); await page.waitForTimeout(50); }
    }
    if (i === 5) {
      const startBtn = await page.$('button:text-is("▶ Start")');
      if (startBtn) { await startBtn.click(); await page.waitForTimeout(200); }
      else console.log("  (Start button not found, skipping)");
    }
    const nextBtn = await page.$("#btnActionNext");
    if (nextBtn) await nextBtn.click();
    await page.waitForTimeout(120);
  }
  const summaryVisible = await page.isVisible("text=Mission Complete");
  console.log("Mission completion summary shown:", summaryVisible);

  console.log("\n=== 3. Draw and predict 3 digits (including a blank check) ===");
  await page.click("#modePlaygroundBtn");
  await page.waitForTimeout(100);
  const predictTab = await page.$("#viewTabs button:has-text('Predict')");
  if (predictTab) await predictTab.click();
  else console.log("  (Predict tab not found!)");
  await page.waitForTimeout(150);

  // Blank predict
  await page.click("button:has-text('🔮 Predict')");
  await page.waitForTimeout(100);
  console.log("blank warning shown:", await page.isVisible("text=canvas looks blank"));

  // Draw a rough "1" and predict, three times with slightly different strokes.
  for (let t = 0; t < 3; t++) {
    const canvas = await page.$(".canvas-frame");
    const box = await canvas.boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy - 60);
    await page.mouse.down();
    for (let i = 0; i <= 10; i++) await page.mouse.move(cx + t * 3, cy - 60 + i * 12, { steps: 2 });
    await page.mouse.up();
    await page.click("button:has-text('🔮 Predict')");
    await page.waitForTimeout(150);
    const conf = await page.textContent("text=Confidence").catch(() => null);
    console.log(`draw+predict #${t + 1}: result panel present =`, await page.isVisible("text=Genuine embedded inference"));
  }

  console.log("\n=== 4. Generate & download PyTorch code ===");
  await page.click("#viewTabs button:has-text('Code')");
  await page.waitForTimeout(100);
  const [ download ] = await Promise.all([
    page.waitForEvent("download"),
    page.click("button:has-text('Download .py')"),
  ]);
  console.log("downloaded filename:", download.suggestedFilename());

  console.log("\n=== 5. Invalid architecture disables prediction/code download ===");
  await page.click("#viewTabs button:has-text('Builder')");
  await page.waitForTimeout(100);
  await page.click("button:has-text('Load repair challenge')");
  await page.waitForTimeout(100);
  await page.click("#viewTabs button:has-text('Code')");
  await page.waitForTimeout(100);
  const downloadDisabled = await page.isDisabled("button:has-text('Download .py')");
  console.log("download disabled while invalid:", downloadDisabled);
  await page.click("#viewTabs button:has-text('Builder')");
  await page.waitForTimeout(50);
  await page.click("button:has-text('Restore canonical CNN')");

  console.log("\n=== 4b. SGD optimizer control regenerates PyTorch code ===");
  await page.click("#viewTabs button:has-text('Train')");
  await page.waitForTimeout(100);
  await page.selectOption("#viewBody select >> nth=0", "sgd");
  await page.waitForTimeout(100);
  await page.click("#viewTabs button:has-text('Code')");
  await page.waitForTimeout(100);
  const viewBodyText = await page.textContent("#viewBody").catch(() => "");
  console.log("Code tab section title updates to SGD:", viewBodyText.includes("Loss & SGD optimizer"));
  console.log("Code tab body contains torch.optim.SGD:", viewBodyText.includes("torch.optim.SGD"));
  // switch back to Adam for subsequent steps
  await page.click("#viewTabs button:has-text('Train')");
  await page.waitForTimeout(100);
  await page.selectOption("#viewBody select >> nth=0", "adam");
  await page.waitForTimeout(50);

  console.log("\n=== 4c. Real confusion matrix renders in Train > Dataset & Evaluation ===");
  const cellCount = await page.evaluate(() => {
    const details = Array.from(document.querySelectorAll("#viewBody details")).find(d => d.textContent.includes("Confusion matrix"));
    return details ? details.querySelectorAll("tbody td").length : -1;
  });
  console.log("confusion matrix data cells found (expected 100):", cellCount);

  console.log("\n=== 4d. Drag-and-drop reordering in Builder (native HTML5 DnD) ===");
  await page.click("#viewTabs button:has-text('Builder')");
  await page.waitForTimeout(100);
  const beforeOrder = await page.evaluate(() => Array.from(document.querySelectorAll("#viewBody .panel-section strong")).map(s => s.textContent));
  try {
    const rows = page.locator("#viewBody [draggable='true']");
    const count = await rows.count();
    if (count >= 2) {
      await rows.nth(1).dragTo(rows.nth(0));
      await page.waitForTimeout(100);
    }
    const afterOrder = await page.evaluate(() => Array.from(document.querySelectorAll("#viewBody .panel-section strong")).map(s => s.textContent));
    console.log("order changed via native drag:", JSON.stringify(beforeOrder) !== JSON.stringify(afterOrder));
  } catch (e) {
    console.log("native drag simulation not supported headless (expected in some environments):", e.message.split("\n")[0]);
  }
  // Confirm the accessible button fallback still works regardless of drag support.
  const upBtn = await page.$("#viewBody button[aria-label*='Move']");
  if (upBtn) { await upBtn.click(); await page.waitForTimeout(50); console.log("↑/↓ button fallback: clicked without error"); }
  await page.click("button:has-text('Restore canonical CNN')");
  await page.waitForTimeout(50);

  console.log("\n=== 4e. Model Provenance panel: 3 downloads ===");
  await page.click("#btnSettings");
  await page.waitForTimeout(150);
  for (const label of ["Download training script (.py)", "Download export script (.py)", "Download training log (.json)"]) {
    const [dl] = await Promise.all([
      page.waitForEvent("download"),
      page.click(`button:has-text("${label}")`),
    ]);
    console.log(`${label} ->`, dl.suggestedFilename());
  }

  console.log("\n=== 4f. Sound toggle persists across reload (muted by default) ===");
  const soundCb = await page.$("#explainDialog label:has-text('Sound effects') input[type=checkbox]");
  console.log("sound off by default:", soundCb ? !(await soundCb.isChecked()) : "checkbox not found");
  if (soundCb) await soundCb.click();
  await page.waitForTimeout(50);
  await page.click("#btnCloseExplain");
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.click("#btnBeginMission").catch(() => {});
  await page.waitForTimeout(100);
  await page.click("#btnSettings");
  await page.waitForTimeout(100);
  const soundCbAfter = await page.$("#explainDialog label:has-text('Sound effects') input[type=checkbox]");
  console.log("sound setting persisted after reload:", soundCbAfter ? await soundCbAfter.isChecked() : "checkbox not found");
  await page.click("#btnCloseExplain");

  console.log("\n=== 6. Keyboard-only navigation smoke test ===");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement ? document.activeElement.tagName + (document.activeElement.textContent||"").slice(0,20) : null);
  console.log("focused element after 3 tabs:", focused);

  console.log("\n=== 7. Reduced motion setting ===");
  await page.click("#btnSettings");
  await page.waitForTimeout(100);
  await page.click("#explainDialog input[type=checkbox]");
  await page.waitForTimeout(50);
  const htmlClass = await page.evaluate(() => document.documentElement.className);
  console.log("html class after toggling reduced motion:", htmlClass);
  await page.click("#btnCloseExplain");

  console.log("\n=== 8. Responsive: narrow viewport ===");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(150);
  const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const bodyClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  console.log("body.scrollWidth:", bodyScrollWidth, " clientWidth:", bodyClientWidth, " (scrollWidth should not exceed clientWidth)");

  console.log("\n=== 9. Reload -> resume offer ===");
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(200);
  console.log("resume row visible:", await page.isVisible("#startupResumeRow"));

  console.log("\n=== Console errors ===");
  console.log(consoleErrors.length ? consoleErrors : "(none)");
  console.log("\n=== Page (uncaught) errors ===");
  console.log(pageErrors.length ? pageErrors : "(none)");

  await browser.close();
  process.exitCode = (consoleErrors.length || pageErrors.length || requestsSeen.length) ? 1 : 0;
})();
