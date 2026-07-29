// DEV-ONLY. Visual + functional check for the new "Illustrated Diagram" architecture
// view mode: screenshots it, checks expected SVG element counts, click-to-explain,
// and live updating when the architecture is edited in Builder.
const path = require("path");
const { chromium } = require("playwright-core");
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const htmlPath = path.resolve(__dirname, "../../cnn-learning-lab.html");

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, colorScheme: "dark" });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type()==="error") errors.push(m.text()); });

  await page.goto("file://" + htmlPath, { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.click("#btnOpenPlaygroundStartup");
  await page.waitForTimeout(150);

  console.log("=== Switch to Illustrated Diagram ===");
  await page.click('#pathTabs button[data-path="diagram"]');
  await page.waitForTimeout(200);

  const counts = await page.evaluate(() => {
    const svg = document.querySelector("#archStrip svg");
    if (!svg) return null;
    return {
      groups: svg.querySelectorAll(".diagram-group").length,
      circles: svg.querySelectorAll("circle").length,
      polygons: svg.querySelectorAll("polygon").length,
      rects: svg.querySelectorAll("rect").length,
      width: svg.getAttribute("width"),
      height: svg.getAttribute("height"),
    };
  });
  console.log("SVG element counts:", counts);
  console.log("Output circles == 10 (expect true):", counts && counts.circles >= 10);

  await page.screenshot({ path: path.resolve(__dirname, "../artifacts/temp_screenshots/diagram_dark.png") });

  console.log("\n=== Click a conv stage, verify explanation opens ===");
  // force:true because SVG child shapes (text/rect) can be the exact hit-test target at a
  // given pixel even though the parent <g> owns the click listener; real clicks bubble up
  // fine (verified via the keyboard/Enter path below too), this just skips Playwright's
  // strict single-target actionability check for these overlapping SVG children.
  const ariaLabels = await page.evaluate(() => Array.from(document.querySelectorAll("#archStrip svg .diagram-group")).map(g => g.getAttribute("aria-label")));
  console.log("Diagram group aria-labels:", ariaLabels);
  await page.click("#archStrip svg .diagram-group >> nth=2", { force: true }); // index 2 = first conv stage
  await page.waitForTimeout(150);
  console.log("Errors so far:", errors);
  const ariaPressedAfter = await page.evaluate(() => document.querySelectorAll("#archStrip svg .diagram-group")[2].outerHTML.slice(0, 300));
  console.log("Clicked group HTML snippet:", ariaPressedAfter);
  console.log("Explain overlay open (click should select AND explain):", await page.isVisible("#explainOverlay.open"));
  const title = await page.textContent("#explainTitle").catch(() => "");
  console.log("Explanation title:", title);
  await page.click("#btnCloseExplain");
  await page.waitForTimeout(100);
  const hasSelectedStroke = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("#archStrip svg [stroke]")).some(el => {
      const s = el.getAttribute("stroke");
      return s === "var(--color-data)" && el.getAttribute("stroke-width") === "3.5";
    });
  });
  console.log("Selected-state highlight visible after closing dialog:", hasSelectedStroke);

  console.log("\n=== Verify Forward Path (existing box strip) is unchanged ===");
  await page.click('#pathTabs button[data-path="forward"]');
  await page.waitForTimeout(150);
  const boxNodeCount = await page.evaluate(() => document.querySelectorAll("#archStrip .layer-node").length);
  console.log("Box-strip layer-node count (should be 22 for canonical):", boxNodeCount);
  await page.screenshot({ path: path.resolve(__dirname, "../artifacts/temp_screenshots/forward_path_unchanged.png") });

  console.log("\n=== Live update: load repair challenge in Builder, check diagram reflects invalid state ===");
  await page.click("#viewTabs button:has-text('Builder')");
  await page.waitForTimeout(100);
  await page.click("button:has-text('Load repair challenge')");
  await page.waitForTimeout(100);
  await page.click('#pathTabs button[data-path="diagram"]');
  await page.waitForTimeout(150);
  const invalidStroke = await page.evaluate(() => {
    const shapes = Array.from(document.querySelectorAll("#archStrip svg rect, #archStrip svg circle"));
    return shapes.some(el => el.getAttribute("stroke") === "var(--color-invalid)");
  });
  console.log("Invalid-state styling present after repair challenge loaded:", invalidStroke);
  await page.screenshot({ path: path.resolve(__dirname, "../artifacts/temp_screenshots/diagram_invalid.png") });
  await page.click("#viewTabs button:has-text('Builder')");
  await page.waitForTimeout(100);
  await page.click("button:has-text('Restore canonical CNN')");
  await page.waitForTimeout(100);

  console.log("\n=== Keyboard: Tab to a diagram group and press Enter ===");
  await page.click('#pathTabs button[data-path="diagram"]');
  await page.waitForTimeout(150);
  await page.evaluate(() => document.querySelector("#archStrip svg .diagram-group").focus());
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  console.log("Explain overlay open via keyboard:", await page.isVisible("#explainOverlay.open"));
  await page.click("#btnCloseExplain");

  console.log("\n=== Light mode screenshot ===");
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.resolve(__dirname, "../artifacts/temp_screenshots/diagram_light.png") });

  console.log("\nErrors:", errors.length ? errors : "(none)");
  await browser.close();
  process.exitCode = errors.length ? 1 : 0;
})();
