# Development-only tooling (not part of the shipped application)

Everything in this `dev/` folder is used **only** to build and validate
`../cnn-learning-lab.html`. None of it is required to run the finished
application — the shipped HTML file is fully self-contained.

- `train_model.py` — trains the canonical CNN on real MNIST data (PyTorch, CPU),
  using the exact architecture and hyperparameters from the functional spec.
  Produces `artifacts/canonical_model_final.pt` / `canonical_model_best.pt`.
- `export_weights.py` — flattens the trained weights into a single float32 buffer
  in a fixed tensor order, base64-encodes it, computes an FNV-1a integrity
  checksum, and curates 14 real MNIST **test**-set sample digits (genuinely
  unseen by training) plus PyTorch reference logits for validation.
- `compute_confusion_matrix.py` — loads the existing trained checkpoint (no
  retraining) and evaluates it once against the real MNIST test set to produce a
  genuine 10×10 confusion matrix, written to `artifacts/confusion_matrix.json`.
  This is what powers the app's real (not illustrative) confusion matrix table.
- `build_finalize.py` — splices the base64 weights/samples/reference logits, the
  confusion matrix, the training log, and base64-encoded copies of
  `train_model.py`/`export_weights.py` (embedded for in-app transparency/download
  only — never executed) into `cnn-learning-lab.html`, replacing each
  `__EMBEDDED_..._​__` placeholder token. Idempotent: run it again any time after
  changing an upstream script/artifact — tokens already resolved in a previous
  run are silently skipped rather than erroring.
- `artifacts/` — output of the scripts above (model checkpoints, encoded
  weights/samples, training log/summary, reference logits, confusion matrix).
  Not shipped.
- `node_test/` — validation harnesses (Node.js + jsdom + Playwright/Chrome):
  - `run_check.js` — loads the finalized HTML in jsdom and runs the in-app
    self-test suite (`window.CNNLabSelfTest.run()`), including comparing the
    JavaScript inference engine's output against the PyTorch reference logits,
    the confusion matrix invariant, and SGD code generation.
  - `browser_check.js` — drives real Google Chrome, opening the file via
    `file://`, walking the full Guided Mission, drawing and predicting digits,
    downloading generated PyTorch code, switching the optimizer to SGD,
    drag-and-drop reordering a Builder row, downloading the 3 Model Provenance
    files, checking the sound setting persists (muted by default), keyboard nav,
    reduced motion, and narrow-viewport layout (no horizontal page scroll).
  - `offline_check.js` — same, but with the browser context's network fully
    disabled, to prove no external resource is ever requested.
  - `contrast_check.js` — computes real color-vs-background contrast ratios for
    every select/input across the main views, in both dark and light
    color-scheme emulation (guards against the invisible-text bug once found).
  - `reset_check.js` — runs training to completion, draws and predicts a digit,
    resets the Playground, then verifies every lab actually reverted to fresh
    (guards against per-lab state surviving a reset).
  - `diagram_check.js` — screenshots and functionally verifies the Illustrated
    Diagram view mode: expected SVG element counts, click-to-explain, the
    "selected" highlight, live updates when the architecture is edited (incl.
    the invalid-state border), keyboard operability, and that the existing
    Forward-path box strip is untouched.
  - `diagram_responsive_check.js` — confirms the Illustrated Diagram's wider
    SVG doesn't cause whole-page horizontal scroll at a 390px viewport.
  - `light_mode_check.js` / `overflow_diag.js` — one-off diagnostics used while
    fixing the invisible-form-control and responsive-overflow bugs.

To rebuild after changing the model or architecture:

```
python3 dev/train_model.py
python3 dev/export_weights.py
python3 dev/compute_confusion_matrix.py
python3 dev/build_finalize.py
node dev/node_test/run_check.js
node dev/node_test/browser_check.js
node dev/node_test/offline_check.js
```
