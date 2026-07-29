# CNN Learning Lab

An offline, self-contained, single-file web app that teaches sixth-grade students how a
convolutional neural network recognizes handwritten MNIST digits — by building it,
experimenting with it, watching it "train" (simulated), and using a **genuinely
trained embedded model** to predict a digit the student draws themselves.

- **Runtime artifact:** [`cnn-learning-lab.html`](cnn-learning-lab.html) — open it directly
  in a browser (double-click it, or `File → Open`). No server, no build step, no install,
  no internet connection needed.
- **Spec it was built from:** [`CNN_Learning_Lab_Functional_Specification.md`](CNN_Learning_Lab_Functional_Specification.md)
  and [`Prompt_Implement_CNN_Learning_Lab.md`](Prompt_Implement_CNN_Learning_Lab.md).
- **Delivery report:** [`HANDOFF_REPORT.md`](HANDOFF_REPORT.md) — what was built, how it was
  validated, and known limitations.
- **Dev-only tooling:** [`dev/`](dev/README.md) — training/export/build/test scripts. None of
  it is required to run the app.

This document explains **how the app works**, for anyone who wants to use it, read the
source, or extend it.

---

## 1. Using the app

### Two modes

| | Guided Mission | Playground |
|---|---|---|
| Purpose | A structured ~20–30 minute walkthrough | Unlimited free exploration |
| Architecture | Reveals itself incrementally as you progress | Fully editable (add/remove/reorder/configure blocks) |
| Progress | Saved automatically; resumable across visits | Saved automatically; independent of Mission progress |

Switch between them anytime with the **Guided Mission / Playground** toggle in the top
navigation bar — neither mode's progress is lost by switching (they keep separate
architecture state on purpose, per the functional spec §6.2).

### Guided Mission — 8 steps

1. **Meet the Digit Mystery** — pick a mystery digit to follow through the mission.
2. **Images Are Numbers** — inspect the 28×28 pixel grid, raw/scaled/normalized values.
3. **Pattern Detectives** — step a convolution filter across a small 5×5 teaching grid.
4. **Keep & Shrink Clues** — predict ReLU and max-pooling outputs.
5. **Build the Full CNN** — reveal the real architecture block by block; a "repair the
   network" challenge intentionally breaks the flatten→dense connection and asks you to
   fix it.
6. **Teach the CNN** — run the (simulated) training trace; see loss/accuracy curves and
   the correct training-step order.
7. **Check the Learning** — dataset split (train/validation/test), data-leakage warning,
   canonical test result, per-class accuracy, and a real 10×10 confusion matrix measured
   from the app's own embedded model (not an invented illustration).
8. **Challenge the CNN** — draw an unseen digit and get a **genuine** prediction.

### Playground

A tabbed workspace (Overview, Pixels, Convolution, ReLU, Pooling, Batch Norm,
Flatten/Dense, Dropout, Train, Predict, Code, Builder, Challenges, Glossary) sitting
below a persistent **architecture canvas** that always shows the full CNN, its shapes,
its parameter counts, and whether it's currently valid.

The architecture canvas itself has three view modes (tabs above the diagram):
**Forward path** (the default boxed-layer strip), **Learning loop** (loss →
backprop → optimizer, shown separately from the forward path on purpose), and
**Illustrated Diagram** — a "textbook-style" illustration (offset/stacked
rectangles per conv layer suggesting channel depth, a slanted "Flattened"
bridge, and a node-and-edge graph for the dense layers with red 0–9 output
circles) built entirely from whichever architecture is currently active, so it
always matches — never a separate static picture. Every part of it is
clickable/keyboard-operable and opens the same universal explanation panel.

- **Builder**: add/remove/reorder/configure layers — drag a row by its ⠿ handle, or use
  the ↑/↓ buttons (both work; buttons are the accessible fallback) — plus undo/redo,
  "Restore canonical CNN," and the same repair challenge from the Mission.
- **Train**: switch the optimizer between **Adam** and **SGD** and watch both the
  matching trace and the generated PyTorch code update live.
- **Code**: PyTorch generated live from whatever architecture is currently on screen —
  never a separately hand-written version that could drift out of sync.
- **Predict**: draw with mouse/touch/pen, or pick a bundled sample digit; see the
  preprocessing pipeline, top-3 probabilities, confidence, and a few sampled feature maps.

### The explanation panel

Click **any** dashed, underlined term anywhere in the app (a layer name, a code token, a
formula label) to open a standardized explanation with three depths — **Quick**,
**Explore**, **Deep dive** — definition, analogy, why it's here, a worked example, the
current live numbers from your architecture, PyTorch code, training-vs-prediction
behavior, common mistakes, and related concepts. Closing it never resets whatever you
were doing.

### Settings (⚙️ in the top nav)

Reduced motion, sound effects (short chimes for achievements/challenges/predictions —
muted by default), reset Guided Mission progress / Playground / all local data, export
or import a Playground project as JSON, a **Model provenance** panel (the exact
hyperparameters the embedded model was trained with, plus buttons to download the real
training/export scripts and training log — for transparency only; nothing here retrains
anything in your browser), and a "Run self-tests" button for a plain-language pass/fail
report of the app's internal checks.

Progress is stored **only** in `localStorage` in your browser — nothing is ever sent
anywhere.

---

## 2. How the code is organized

Everything lives in one `<script>` tag, inside a single IIFE (`(function(){ ... })();`)
so nothing leaks into the global scope except two intentionally-exposed hooks:
`window.CNNLabSelfTest` (dev/console self-test entry point) and, indirectly, nothing
else. Internally it's split into 20 labeled regions (search the file for `REGION <n>`):

| Region | Contents | Roughly at line |
|---:|---|---:|
| 1 | Semantic HTML structure (nav, architecture canvas, context panel, action bar, explanation dialog) | 331 |
| 2 | Design tokens & CSS (color roles, layout, responsive rules, reduced motion) | 10 |
| 3 | Embedded educational data (`EDU`: normalization constants, dataset split, canonical + comparison training traces, filter presets, achievements) | 445 |
| 4 | Concept registry (`CONCEPTS`, `CONCEPT_INDEX`, `getConcept`) — all 74 required concepts | 616 |
| 5 | Canonical architecture definition (`buildCanonicalLayers`, `CANONICAL_TOTAL_PARAMETERS`) | 1364 |
| 6 | State store (`AppState`, `defaultState`, undo/redo, mission/playground separation) | 1651 |
| 7 / 8 | Shape & parameter engine + validator (`Engine.propagateLayer`, `Engine.propagateArchitecture`, `Engine.repairFlattenDenseMismatch`, `Engine.groupStages` for the Illustrated Diagram) | 1444 |
| 9 | Guided Mission controller (`MISSION_CONTENT`, `renderMissionBody`, incremental reveal, repair challenge) | 5322 |
| 10 | Rendering helpers: architecture canvas (`renderArchitectureCanvas`, `renderIllustratedDiagram`) + explanation panel (`openExplanation`, `renderExplanation`) | 1945 |
| 11 | The 7 laboratories + Predict + Builder + Challenges (each a `Views.<name>` object) | 2335–4980 |
| 12 | Training-trace engine + Training Simulator view (`Views.train`, `lineChart`, `renderLearningRateLandscape`, `renderDatasetEvaluationSection`) | 3296 |
| 13 | Drawing / preprocessing (`preprocessDrawing`, bounding box → crop → resize → center-of-mass centering → normalize) | 4586 |
| 14 | Inference engine + embedded weights (`NN.*` pure-JS ops, `decodeEmbeddedWeights`, `ModelWeights`) | 3640 |
| 15 | PyTorch code generator (`CodeGen`, `buildFullPySource`, clickable-token highlighting) | 5002 |
| 16 | Persistence (`Persistence.save/load/clearAll/exportProject/importProject`) | 1768 |
| 17 | Accessibility helpers (`A11y`, DOM helpers `el`/`clearNode`, toasts) | 1890 |
| 17b | Sound (`Sound.playTone`/`correct`/`incorrect`/`achievement`/`predictDone` — Web Audio API, synthesized, muted by default) | 1934 |
| 18 | View router (`Views`, `Router.goToView`) + Settings dialog + top-nav/startup event binding | 2217, 5650 |
| 19 | Internal self-tests (`SelfTest.run`, exposed as `window.CNNLabSelfTest`) | 5557 |
| 20 | Application bootstrap (`bootstrap()`, wired to `DOMContentLoaded`) | 5801 |

### Key objects, at a glance

- **`AppState`** — the single source of truth: `mode` ("mission"/"playground"), separate
  `mission` and `playground` sub-states (so Mission progress never clobbers your
  Playground architecture), `runtime` (current view, selected layer, path/mode toggles),
  `a11y`, `conceptsViewed`, `achievements`.
- **`Engine`** — pure functions that turn an array of layer objects into shapes,
  parameter counts, and validity, given only `type` + `config` per layer. Nothing in the
  UI hard-codes a shape or a parameter count; everything is computed here and re-run on
  every change (`Engine.propagateArchitecture`).
- **`Views`** — one object per screen (`Views.pixel`, `Views.conv`, `Views.train`,
  `Views.predict`, `Views.code`, `Views.builder`, …), each with a `render(container)`
  function. `Router.goToView(id)` swaps which one is mounted into `#viewBody`.
  Per-view interactive state (current animation step, brush size, chosen filter, etc.)
  lives directly on the `Views.<name>` object so it survives re-renders.
- **`NN`** — the inference engine: `conv2d`, `batchNormInfer`, `relu`, `maxPool2d`,
  `linear`, `softmax`, and `NN.forward()` which chains them into the full canonical
  network using `Float32Array`s throughout.
- **`CodeGen`** — walks the *same* layer array the architecture canvas renders and emits
  PyTorch source, grouping `Conv+BatchNorm+ReLU` triples back into `ConvBNReLU` calls.
  There is no second, hand-written copy of the model code anywhere.
- **`CONCEPTS`** — the universal explanation registry. Every clickable term in the app
  (`explainBtn(conceptId, label)`) looks itself up here; there are no ad-hoc tooltips.

### Rendering model

There's no virtual DOM. Every state-changing action calls `renderContextPanel()` (or the
narrower `renderArchitectureCanvas()` for header-toggle changes), which clears and
rebuilds the current view's DOM from `AppState`. It's simple and easy to reason about;
the trade-off is that per-view state must live outside the DOM (hence the pattern above).

---

## 3. The embedded model

The prediction you get in the Predict view (or Mission step 8) is **not** simulated. A
real CNN — matching the canonical architecture exactly (468,010 parameters) — was
trained once, offline, in PyTorch on real MNIST data, and its weights are embedded in
the HTML as a checksummed base64 blob (see `dev/train_model.py` and
`dev/export_weights.py`). At startup, `decodeEmbeddedWeights()`:

1. base64-decodes the blob into bytes,
2. verifies an FNV-1a checksum against `WEIGHTS_META.checksumFNV1a`,
3. reinterprets the bytes as a `Float32Array`,
4. slices it into named tensors (`conv1.weight`, `bn1.gamma`, `bn1.running_mean`, …)
   according to `WEIGHTS_META.tensors` (name/shape/offset/count).

`NN.forward()` then runs the exact same forward pass PyTorch would in `eval()` mode
(batch norm uses the stored running statistics, dropout is the identity). This is
verified against real PyTorch reference logits for 14 fixed samples at every startup —
see `window.CNNLabSelfTest.run()` and `HANDOFF_REPORT.md §3–4` for the numbers.

The training curves you see in the **Training Simulator** are a separate thing on
purpose: they replay the specification's exact recorded canonical experiment (or a
clearly-labeled educational simulation for unsupported hyperparameter combinations).
The app is explicit that training is simulated while prediction uses a genuinely,
separately trained model — it never implies one produced the other.

---

## 4. Rebuilding / extending

You don't need any of this to *use* the app — only to change the model or re-embed data.

```bash
python3 dev/train_model.py               # trains the canonical CNN on real MNIST (PyTorch, CPU)
python3 dev/export_weights.py            # exports weights + sample digits + reference logits
python3 dev/compute_confusion_matrix.py  # evaluates the trained checkpoint into a real confusion matrix
python3 dev/build_finalize.py            # splices all embedded data into cnn-learning-lab.html
node dev/node_test/run_check.js          # jsdom: self-tests + JS-vs-PyTorch inference check
node dev/node_test/browser_check.js      # real Chrome: full Guided Mission + predict + a11y
node dev/node_test/offline_check.js      # real Chrome with networking fully disabled
```

See [`dev/README.md`](dev/README.md) for details on each script and test harness.

To edit the HTML/JS/CSS directly: search for the `REGION <n>` comment matching what you
want to change (table above). Layer/shape/parameter logic belongs in `Engine`; anything
a student can click should get a `conceptId` and a registry entry in `CONCEPTS` rather
than a one-off tooltip; any new PyTorch text should come from `CodeGen`, not a hard-coded
string, so it can never drift from the visual architecture.
