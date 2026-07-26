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
- `build_finalize.py` — splices the base64 weights/samples and reference
  logits into `cnn-learning-lab.html`, replacing the `__EMBEDDED_..._​__`
  placeholder tokens. Run this after any change to the two scripts above.
- `artifacts/` — output of the two scripts above (model checkpoints, encoded
  weights/samples, training log/summary, reference logits). Not shipped.
- `node_test/` — validation harnesses (Node.js + jsdom + Playwright/Chrome):
  - `run_check.js` — loads the finalized HTML in jsdom and runs the in-app
    self-test suite (`window.CNNLabSelfTest.run()`), including comparing the
    JavaScript inference engine's output against the PyTorch reference logits.
  - `browser_check.js` — drives real Google Chrome, opening the file via
    `file://`, walking the full Guided Mission, drawing and predicting digits,
    downloading generated PyTorch code, checking keyboard nav, reduced motion,
    and narrow-viewport layout (no horizontal page scroll).
  - `offline_check.js` — same, but with the browser context's network fully
    disabled, to prove no external resource is ever requested.
  - `overflow_diag.js` — one-off diagnostic used while fixing a responsive
    layout bug.

To rebuild after changing the model or architecture:

```
python3 dev/train_model.py
python3 dev/export_weights.py
python3 dev/build_finalize.py
node dev/node_test/run_check.js
node dev/node_test/browser_check.js
```
