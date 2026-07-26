// DEV-ONLY. Loads the finalized cnn-learning-lab.html in jsdom, runs bootstrap,
// and reports internal self-test results plus any console errors encountered.
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const htmlPath = path.resolve(__dirname, "../../cnn-learning-lab.html");
const html = fs.readFileSync(htmlPath, "utf8");

const errors = [];

const dom = new JSDOM(html, {
  url: "file://" + htmlPath,
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
  virtualConsole: (() => {
    const { VirtualConsole } = require("jsdom");
    const vc = new VirtualConsole();
    vc.on("jsdomError", (e) => errors.push("jsdomError: " + e.message));
    vc.on("error", (...a) => errors.push("console.error: " + a.map(String).join(" ")));
    vc.on("warn", (...a) => console.log("console.warn:", ...a));
    vc.on("log", (...a) => console.log("console.log:", ...a));
    return vc;
  })(),
});

// jsdom doesn't implement canvas 2D rendering; stub getContext so calls don't throw.
dom.window.HTMLCanvasElement.prototype.getContext = function () {
  return {
    fillRect(){}, drawImage(){}, clearRect(){}, save(){}, restore(){}, translate(){}, rotate(){},
    beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, arc(){}, fill(){}, strokeRect(){},
    getImageData(x, y, w, h) { return { data: new Uint8ClampedArray((w||1) * (h||1) * 4).fill(255) }; },
    putImageData(){}, set fillStyle(v){}, set strokeStyle(v){}, set lineWidth(v){}, set lineJoin(v){}, set lineCap(v){},
    set imageSmoothingEnabled(v){},
  };
};

setTimeout(() => {
  try {
    const w = dom.window;
    const startupHidden = w.document.getElementById("startupScreen").hidden;
    const appHidden = w.document.getElementById("app").hidden;
    console.log("\n=== DOM state after bootstrap ===");
    console.log("startupScreen.hidden:", startupHidden, "(expected false initially, until Begin Mission clicked)");
    console.log("app.hidden:", appHidden, "(expected true initially)");

    if (!w.CNNLabSelfTest) {
      console.log("FAIL: window.CNNLabSelfTest is not defined — bootstrap likely threw before completing.");
      process.exitCode = 1;
      return;
    }
    const report = w.CNNLabSelfTest.run();
    console.log("\n=== Self-test report ===");
    report.results.forEach((r) => {
      console.log((r.pass ? "PASS" : "FAIL") + " - " + r.name + (r.detail ? "  (" + r.detail + ")" : ""));
    });
    console.log(`\n${report.pass}/${report.total} passed`);

    console.log("\n=== Captured console/jsdom errors ===");
    if (errors.length === 0) console.log("(none)");
    else errors.forEach((e) => console.log(e));

    // Simulate clicking "Start Guided Mission", switching to Playground, then clicking through
    // every view tab (by visible label) to catch render-time errors across the whole UI.
    w.document.getElementById("btnBeginMission").dispatchEvent(new w.Event("click", { bubbles: true }));
    w.document.getElementById("modePlaygroundBtn").dispatchEvent(new w.Event("click", { bubbles: true }));
    const tabLabels = ["Overview","Pixels","Convolution","ReLU","Pooling","Batch Norm","Flatten/Dense","Dropout","Train","Predict","Code","Builder","Challenges","Glossary"];
    tabLabels.forEach((label) => {
      const btn = Array.from(w.document.querySelectorAll("#viewTabs button")).find((b) => b.textContent.trim() === label);
      if (btn) btn.dispatchEvent(new w.Event("click", { bubbles: true }));
      else errors.push("Missing view tab button: " + label);
    });
    console.log("\n=== After exercising all views ===");
    console.log("Additional errors:", errors.length);
    errors.forEach((e) => console.log(e));

    process.exitCode = (report.allPassed && errors.length === 0) ? 0 : 1;
  } catch (e) {
    console.log("EXCEPTION during check:", e.stack);
    process.exitCode = 1;
  }
}, 500);
