# CNN Learning Lab — Final Handoff Report

**Date:** 2026-07-25
**Runtime artifact:** [`cnn-learning-lab.html`](cnn-learning-lab.html)
**Size:** 2.7 MB (well under the ~8 MB target) — a single self-contained HTML file with no adjacent runtime files.

---

## 1. Confirmation of single-file, offline operation

- The complete application is one file: `cnn-learning-lab.html`. No other file is required at runtime.
- Verified via real Google Chrome, opened directly through the `file://` scheme, with the browser context's **network connection fully disabled** (Playwright `offline: true`): the app loads, the Guided Mission runs, and prediction works with **zero external requests** and **zero console/page errors**.
- No `fetch()`, no `XMLHttpRequest`, no CDN `<script src>`, no external fonts/images, no service worker, no backend.

## 2. What was implemented

- **Canonical CNN engine**: full layer model (input → normalization → 4×(conv+BN+ReLU) with two max-pools → flatten → linear(3136→128) → ReLU → dropout(0.3) → linear(128→10)), shape/parameter propagation, an architecture validator, and canonical reset. A startup self-test asserts the total is exactly **468,010** trainable parameters, computed from the layers (not hard-coded).
- **Universal concept registry**: 74 concepts — every one required by the functional specification (§9.2) and the master prompt (§7) — each with quick/explore/deep-dive depth, analogy, worked example, formula, PyTorch snippet, common mistake, training-vs-inference behavior, and related concepts. Explanations pull **live numbers** from the current architecture state rather than only static text.
- **7 interactive laboratories**:
  - Pixel & normalization (paint/erase, brush size, row/col/raw/scaled/normalized inspection, normalization toggle)
  - Convolution (5×5 teaching grid, filter presets + custom kernel, manual/auto stepping, stride/padding/bias, feature-map framing)
  - ReLU (predict-then-reveal per cell)
  - Pooling (max vs. average, window/stride, canonical 28→14→7 example)
  - Batch normalization (before / centered-scaled / after learned scale+shift, training vs. inference statistics)
  - Flatten & Dense (64×7×7→3,136 animation, abstracted dense-connection visualization, parameter calculations)
  - Dropout (live random masks on a 128-neuron grid, training vs. inference state)
- **Architecture Builder**: add/remove/reorder/configure supported blocks, one-step undo/redo, "Restore canonical CNN," and the explicit flatten/dense repair challenge (1,568 vs. 3,136 mismatch) with two guided fixes.
- **Guided Mission**: all 8 steps (Meet the Mystery → Images Are Numbers → Pattern Detectives → Keep & Shrink → Build the CNN → Teach the CNN → Check the Learning → Challenge the CNN), incremental architecture reveal, inline challenges, a completion summary, and localStorage-backed resume.
- **Training simulator**: the exact canonical recorded trace (5 epochs, epoch-2 best checkpoint) plus 5 additional comparison traces, each explicitly labeled "recorded experiment result" or "educational simulation" — no invented precision for unsupported combinations. Includes the 5-step training-order display, a learning-rate landscape animation (with a step-based reduced-motion alternative), dataset split visualization with a data-leakage warning, canonical test result (99.11% / 9,911 correct), and per-class accuracy table.
- **Genuine embedded inference** (see §3 below).
- **PyTorch Code Studio**: code generated live from the architecture model (never a separately hard-coded version), beginner/clean modes, shape comments, clickable tokens (`Conv2d`, `Adam`, `lr`, etc.) that open concept explanations, bidirectional block↔code highlighting, copy-section/copy-all/download `.py`, disabled whenever the architecture is invalid.
- **Persistence**: localStorage schema v1 covering mission progress, Playground architecture/hyperparameters, concepts viewed, achievements, and accessibility settings; safe handling of corrupt or incompatible stored state (never crashes, resets cleanly); JSON project export/import (parsed only via `JSON.parse`, never evaluated as code).
- **Accessibility**: keyboard operability throughout, visible focus, semantic controls, screen-reader labels and a text-alternative architecture table, WCAG-AA-oriented contrast, `prefers-reduced-motion` support plus a manual toggle, and step-based alternatives to animation.

## 3. Inference implementation and validation

- The model was **genuinely trained** in PyTorch (dev-only, offline step) on real MNIST data with the exact canonical architecture and hyperparameters (Adam, lr 0.001, 5 epochs, batch 128, dropout 0.30, weight decay 0.0001, 54k/6k/10k split).
- Trained weights (plus batch-norm running statistics) are embedded as a checksummed (FNV-1a) base64 blob decoded in memory at startup — no weight download at runtime.
- Inference is a **pure-JavaScript forward pass** (`conv2d`, inference-mode batch norm, ReLU, max pool, flatten, linear, stable softmax) operating on `Float32Array`s.
- Drawing preprocessing follows the standard MNIST pipeline: bounding-box detection → crop → aspect-preserving resize → center-of-mass centering in a 28×28 frame → `[0,1]` scaling → normalization (mean 0.1307, std 0.3081). Warnings are shown for blank, faint, multi-blob, or unusually-shaped input.
- **Validation result:** JavaScript inference vs. PyTorch reference logits on 14 fixed samples (one per digit 0–9, plus 4 harder/misclassified cases) — **maximum absolute logit difference: 0.0000**, **top-1 match: 14/14**, and repeated predictions on identical input are verified deterministic.
- The app explicitly discloses that training is simulated (replayed recorded/educational results) while prediction uses a genuine, separately-trained embedded model — it never implies the simulated training session produced the prediction model.

## 4. Internal self-test results

`window.CNNLabSelfTest.run()` — **16 / 16 checks pass**, covering: canonical architecture validity, the 468,010 parameter total, output shape, convolution/pooling formulas, per-layer parameter counts, invalid flatten/dense detection, softmax numerical stability and normalization, generated-PyTorch correctness (32/64 channels, never the broken 16/32 version), corrupt-localStorage handling, embedded-weight integrity, and the JS-vs-PyTorch inference validation described above.

## 5. Browser / viewport / accessibility checks performed

Using Playwright driving real Google Chrome, and a Node+jsdom harness for the self-test suite:

- Opened directly via `file://`, including with the browser's network connection **fully disabled** — no external requests, no console/page errors.
- Walked the complete Guided Mission (all 8 steps, including the incremental architecture build and the repair challenge).
- Drew and predicted 3 digits (genuine inference each time) plus a blank-canvas check (correctly asks the student to draw rather than showing a misleading prediction).
- Generated and downloaded PyTorch code (`.py`).
- Confirmed prediction/code-download are disabled while the architecture is invalid, and re-enabled after "Restore canonical CNN."
- Keyboard-only tab navigation reaches interactive controls.
- Reduced-motion manual toggle applies (`<html class="reduced-motion">`).
- Narrow viewport (390×844, a common mobile size): **no whole-page horizontal scroll** (`scrollWidth === clientWidth`).
- Reload → the app correctly offers to resume the Guided Mission from saved progress.
- Verified the "Forward path / Learning loop" tabs and the "Training/Inference" mode toggle in the architecture header actually change the displayed state (dropout/batch-norm behavior notes, learning-loop diagram).

### Bugs found and fixed during this testing pass
1. `hidden` attribute on the startup screen was overridden by an explicit `display:flex` rule, leaving it intercepting clicks after being "hidden."
2. Training/convolution auto-play timers kept re-rendering the active view after the user navigated away, risking disruption of unrelated views.
3. The architecture strip and the top navigation bar both caused whole-page horizontal overflow on narrow screens (a classic flexbox/grid `min-width:auto` trap) — fixed with `min-width:0` and a responsive top-nav layout.
4. The mobile "bottom sheet" panel had no way to open (CSS existed, JS trigger did not) — simplified to a stacked single-column layout instead, which fully satisfies "no horizontal scroll" without the added interaction risk.
5. The "Forward path / Learning loop" tabs and "Mode: Training/Inference" button were unwired dead controls — now fully functional.

## 6. Known limitations

- My own from-scratch PyTorch training run (needed to obtain genuine embedded weights) reached 99.31% test accuracy with its best checkpoint at epoch 5 — close to, but not bit-identical with, the specification's exact recorded trace (99.11% test accuracy, best checkpoint at epoch 2), since the original notebook/run isn't available to reproduce exactly. The app displays the specification's exact numbers as the labeled "recorded experiment" trace in the Training Simulator, and uses my own genuinely-trained weights for live inference — the two are never conflated, and the app is explicit that training is simulated while prediction uses a separately, genuinely trained model.
- The dense-layer connection diagram and the confusion matrix are explicitly labeled as abstractions/illustrations, per specification.
- Sound, SGD as an active training-simulator control, and full drag-and-drop reordering in the Builder (button/keyboard reorder is implemented instead) were treated as optional ("could have" / explicitly-not-required) per the specification's own prioritization and were not built, to keep effort focused on the "must have" list.

## 7. Development-only tooling

Everything needed to reproduce or re-validate the build lives in `dev/` (see `dev/README.md`) and is **not** required to run the shipped file:

- `dev/train_model.py`, `dev/export_weights.py`, `dev/build_finalize.py` — train the canonical model, export/checksum weights + sample digits + reference logits, and splice them into `cnn-learning-lab.html`.
- `dev/artifacts/` — model checkpoints, encoded weights/samples, training log and summary.
- `dev/node_test/` — validation harnesses: `run_check.js` (jsdom self-test + JS-vs-PyTorch inference comparison), `browser_check.js` (real-Chrome end-to-end walkthrough), `offline_check.js` (network-disabled load test).
