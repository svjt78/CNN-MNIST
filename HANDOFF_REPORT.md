# CNN Learning Lab — Final Handoff Report

**Date:** 2026-07-25
**Runtime artifact:** [`cnn-learning-lab.html`](cnn-learning-lab.html)
**Size:** 2.74 MB (well under the ~8 MB target) — a single self-contained HTML file with no adjacent runtime files.

---

## 1. Confirmation of single-file, offline operation

- The complete application is one file: `cnn-learning-lab.html`. No other file is required at runtime.
- Verified via real Google Chrome, opened directly through the `file://` scheme, with the browser context's **network connection fully disabled** (Playwright `offline: true`): the app loads, the Guided Mission runs, and prediction works with **zero external requests** and **zero console/page errors**.
- No `fetch()`, no `XMLHttpRequest`, no CDN `<script src>`, no external fonts/images, no service worker, no backend.

## 2. What was implemented

- **Canonical CNN engine**: full layer model (input → normalization → 4×(conv+BN+ReLU) with two max-pools → flatten → linear(3136→128) → ReLU → dropout(0.3) → linear(128→10)), shape/parameter propagation, an architecture validator, and canonical reset. A startup self-test asserts the total is exactly **468,010** trainable parameters, computed from the layers (not hard-coded).
- **Universal concept registry**: 76 concepts — every one required by the functional specification (§9.2) and the master prompt (§7), plus a couple extra — each with quick/explore/deep-dive depth, analogy, worked example, formula, PyTorch snippet, common mistake, training-vs-inference behavior, and related concepts. Explanations pull **live numbers** from the current architecture state rather than only static text.
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
- The dense-layer connection diagram is explicitly labeled as an abstraction, per specification. (The confusion matrix is no longer illustrative-only — see §8 below.)
- ~~Sound, SGD as an active training-simulator control, and full drag-and-drop reordering~~ — all three were added in the enhancement round described in §8; see there for details.

## 7. Development-only tooling

Everything needed to reproduce or re-validate the build lives in `dev/` (see `dev/README.md`) and is **not** required to run the shipped file:

- `dev/train_model.py`, `dev/export_weights.py`, `dev/build_finalize.py` — train the canonical model, export/checksum weights + sample digits + reference logits, and splice them into `cnn-learning-lab.html`.
- `dev/artifacts/` — model checkpoints, encoded weights/samples, training log and summary.
- `dev/node_test/` — validation harnesses: `run_check.js` (jsdom self-test + JS-vs-PyTorch inference comparison), `browser_check.js` (real-Chrome end-to-end walkthrough), `offline_check.js` (network-disabled load test).

---

## 8. Enhancement round: closing 5 known gaps (2026-07-25)

Following a functionality analysis, five known gaps were closed — all confirmed
single-file-safe beforehand (no new runtime dependency, no server, no adjacent files):

1. **Sound** — a small `Sound` module (Web Audio API oscillators, no embedded audio
   files) with a Settings toggle, **muted by default**. Hooked into achievements,
   challenge answers, and prediction completion.
2. **SGD as an active training-simulator control** — a real optimizer selector (Adam/SGD)
   in the Training Simulator, a new labeled-`simulated` SGD comparison trace, and a
   `CodeGen` branch emitting `torch.optim.SGD(..., momentum=0.9, ...)`. Also fixed a
   pre-existing bug where the trace lookup silently ignored the optimizer and always
   matched against `"adam"`.
3. **Drag-and-drop reordering in the Builder** — native HTML5 drag-and-drop, additive to
   (not a replacement for) the existing ↑/↓ buttons, which remain the accessible/keyboard
   fallback exactly as the original spec allows ("drag interaction where reliable; button/
   keyboard alternatives to drag").
4. **A real confusion matrix** — `dev/compute_confusion_matrix.py` evaluates the existing
   trained checkpoint against all 10,000 real MNIST test images (no retraining) and
   embeds the genuine 10×10 result. **Framing note:** this matrix's diagonal sums to
   9,931 — the actual embedded model's measured count — not 9,911 (the specification's
   mandated reference headline figure, still shown as-is elsewhere per §6 above). The UI
   captions the matrix as "measured from this app's embedded model" specifically to keep
   these two honestly distinct rather than silently reconciling them.
5. **Model provenance / transparency panel** — Settings now shows the real training
   hyperparameters and offers "download the training script / export script / training
   log" buttons (`Blob`-based, same mechanism as the PyTorch Code Studio's `.py`
   download). Explicitly download-only — no in-browser retraining, which would have
   required a Python/PyTorch runtime and directly contradicted the app's own "training
   is simulated, never faked" design.

### Additional bug found and fixed during this round

The shared `el(tag, attrs, children)` DOM-builder helper passed `disabled: <boolean>`
through `setAttribute`, which sets the attribute **whenever called, regardless of the
boolean's value** — `disabled="false"` still disables an element in HTML, since presence
(not value) controls the disabled state. This silently broke the new Model Provenance
download buttons (permanently disabled). Fixed by special-casing `disabled`/`checked`/
`readOnly`/`selected` to set the DOM property instead of the attribute. The Code
Studio's download/copy buttons had the same latent bug but were masked by a second,
unrelated pass (`updateActionAvailability`) that happened to correct them via direct
property assignment — they now work correctly from first render too, not by accident.

### Validation

- Internal self-tests: **19/19 passing** (16 previous + 3 new: confusion-matrix
  invariant, SGD code generation, dev-script transparency decode).
- Real Chrome via `file://`, network fully disabled: SGD switch regenerates code
  correctly; confusion matrix renders exactly 100 real cells; native drag-and-drop
  reorder confirmed working (plus the button fallback independently confirmed); all 3
  Model Provenance downloads fire; sound setting off by default and persists across
  reload; zero console/page errors; zero external requests.
- Final file size: 2.72 MB (grew ~33 KB from the new embedded data/scripts).

---

## 9. New feature: Illustrated Diagram view (2026-07-28)

Added a third architecture-canvas view mode — "Illustrated Diagram" — alongside the
existing "Forward path" and "Learning loop" tabs, per a reference image the user
shared (a classic textbook-style CNN illustration: stacked/offset rectangles per conv
layer suggesting channel depth, a slanted "Flattened" bridge, and a node-and-edge
graph for the dense layers with red 0–9 output circles). The existing Forward-path box
strip was explicitly required to stay unchanged — verified byte-for-byte identical
before/after (same 22 `.layer-node` elements, same rendering code path untouched).

Built entirely from whichever architecture is currently active (`getActiveLayers()`,
the same source the existing strip uses) via a new shared `Engine.groupStages(layers)`
utility that collapses Conv+BatchNorm+ReLU(+Pool) groups into "stages" — mirroring the
grouping logic `CodeGen.modelLines` already used, extracted once rather than
re-implemented a third time. Every stage is a focusable, clickable SVG group that both
selects/highlights the layer (syncing the Code tab, same as the existing strip) and
opens the universal explanation panel for its concept, with a visible "selected"
outline and red invalid-state borders when the architecture is broken. The diagram
updates live: editing channels in the Builder, or loading the flatten/dense repair
challenge, is reflected immediately (verified end-to-end, including that the invalid
styling correctly appears on the specific stage whose batch-norm — not necessarily its
convolution — became mismatched).

Verified: 20/20 self-tests (one new check on `Engine.groupStages`'s canonical
grouping); real-Chrome checks in both dark and light color-scheme emulation
(screenshots), click-to-explain and keyboard (Tab+Enter) operability, live updates on
architecture edits, no horizontal overflow at a 390px viewport, and the full existing
regression suite (browser/offline/contrast/reset checks) still green.

One real bug found and fixed along the way (not by the reviewer — by re-checking my
own test's assumptions): the conv-stage invalid-state check only inspected the Conv
layer's own validity, not its paired BatchNorm's, which meant the specific mismatch
produced by the repair challenge (a valid conv followed by a now-mismatched
batch-norm) wouldn't have shown as invalid in the new diagram. Fixed to check both.

Final file size: 2.74 MB (pure code addition — no new embedded binary/base64 data).

---

## 10. Weights & biases made explicit in the Illustrated Diagram (2026-07-29)

The user pointed out that the Illustrated Diagram showed channel counts and shapes but
never distinguished **weights** from **biases** — a real pedagogical gap, since e.g.
the canonical conv layers deliberately use `bias=False` (batch norm already re-centers
the output) while the dense layers do have biases, and that distinction is exactly the
kind of thing this app is supposed to make concrete rather than gloss over.

Added, under every learnable stage (each conv and each dense/linear layer):
- **Weights** — the real computed count and its shape factorization, e.g.
  `Weights: 9,216 (32×32×3×3)` for a conv layer, `Weights: 401,408` / `(3,136×128)`
  for a dense layer. Computed directly from the layer's own config
  (`outChannels×inChannels×kernel×kernel`, or `inFeatures×outFeatures`) — the same
  arithmetic the shape/parameter engine already does elsewhere, not a new estimate.
- **Bias** — `Bias: none (bias=False)` for the canonical conv layers, or the real
  count (`Biases: 128`, `Biases: 10`) for the dense layers, which do have bias enabled.

Both labels are individually clickable/keyboard-operable and open the `weight` / `bias`
concept explanations directly — they're distinct, explicitly-requested "important
learning concepts," not just decoration on the parent layer's label.

Found and fixed a real layout bug while verifying visually (not something the text-only
Playwright checks would have caught): the new labels are wider than the original
spacing between stages, and initially overlapped each other. Fixed by widening the
inter-stage gap and center-anchoring the new labels under each stack/column, verified
via fresh screenshots at both the initial scroll position and scrolled to the
fully-connected layers.

Verified: syntax check, 20/20 self-tests, full real-Chrome regression suite
(browser/offline/contrast/reset/responsive checks) all still green, plus a targeted
visual re-check confirming no more label overlap in either the conv-stack section or
the dense-layer section.
