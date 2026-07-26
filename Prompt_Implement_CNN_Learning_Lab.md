# Claude Code Master Implementation Prompt: CNN Learning Lab

Copy this entire prompt into Claude Code. Place the accompanying functional specification, `CNN_Learning_Lab_Functional_Specification.md`, in the working directory before starting.

---

## Prompt begins

You are a senior educational-product engineer, interaction designer, accessibility specialist, vanilla JavaScript architect, and numerical-computing developer. Your task is to implement a polished experimental learning application called **CNN Learning Lab**.

The application teaches sixth-grade students how a convolutional neural network recognizes handwritten MNIST digits. It must teach through direct manipulation, animation, prediction questions, experimentation, and synchronized PyTorch code—not through long passive explanations.

Work autonomously through implementation, validation, and final handoff. Do not stop for routine technical choices. Ask me only when a genuine blocker requires product authority or when completing the requirement would otherwise require pretending that something works when it does not.

---

# 1. Authoritative inputs

Before making changes:

1. Inspect the working directory.
2. Read `CNN_Learning_Lab_Functional_Specification.md` completely.
3. Read any repository-level instructions such as `CLAUDE.md`, `AGENTS.md`, or equivalent.
4. Inspect existing application files, if any.
5. Preserve unrelated user work.

The functional specification is the authoritative product document. This prompt supplies implementation priorities and constraints but does not weaken any requirement in the specification.

If `CNN_Learning_Lab_Functional_Specification.md` is missing, stop and ask me to provide it. Do not invent a smaller replacement specification.

---

# 2. Non-negotiable single-file deliverable

The finished runtime application must be exactly one self-contained file:

```text
cnn-learning-lab.html
```

This requirement is non-negotiable.

The HTML file must contain everything required at runtime:

- semantic HTML;
- all CSS inside `<style>`;
- all JavaScript inside `<script>`;
- all icons as inline SVG, CSS, Unicode, or programmatically drawn graphics;
- all educational content;
- all concept definitions;
- all guided-mission content;
- all sample pixel data;
- all recorded training traces;
- all architecture configuration;
- all inference code;
- all pretrained weights if genuine inference is implemented;
- all fallback logic.

The runtime application must not require:

- any adjacent JavaScript, CSS, JSON, image, font, model, WASM, or data file;
- React, Vue, Svelte, Angular, Next.js, or another application framework;
- npm, Node.js, a bundler, a compilation step, or a package installation;
- a CDN;
- external fonts;
- external images;
- a backend;
- a web server;
- a database;
- PyTorch or Python at runtime;
- an internet connection after the HTML file is downloaded;
- `fetch()` to read its own assets;
- a service worker;
- cross-origin isolation.

The application must work when opened directly through `file://` in a current desktop browser. Test that scenario explicitly.

Do not build a conventional multi-file web project and then claim it is portable. Do not leave source modules that are required to rebuild the application. The final runtime artifact is the HTML file itself.

Development-only scripts or temporary files are permitted when needed to train/export weights, generate embedded data, or test calculations. They must not be required by the final application. Keep them outside the final runtime artifact, identify them clearly as development-only, and do not remove pre-existing user files.

Avoid `<script type="module">`, external imports, and runtime module loading because behavior under `file://` varies. Use one classic embedded script organized internally with an IIFE, namespaces, classes, or clearly separated code regions.

---

# 3. Product goal and audience

The primary learner is approximately 11–12 years old and knows:

- basic multiplication;
- rows and columns;
- simple coordinates;
- basic programming concepts such as variables and functions.

The application is:

- self-guided;
- experimental;
- intended for independent, on-demand use;
- designed around a 20–30 minute Guided Mission;
- supplemented by an unlimited CNN Playground;
- focused only on MNIST;
- limited to PyTorch for code generation.

The experience should feel intelligent, visual, playful, and technically honest. Do not make it babyish. Use real CNN vocabulary alongside concise child-friendly explanations.

Adopt this learning loop:

> See → Predict → Manipulate → Observe → Explain → Reveal the code

Frequently ask the learner to predict what will happen before revealing a transformation.

---

# 4. Required product modes

Implement two connected modes.

## 4.1 Guided Mission

Provide a resumable 20–30 minute sequence:

1. **Meet the digit mystery**
   - Draw or select a digit.
   - Introduce the goal: how does a CNN recognize it?

2. **Images are numbers**
   - Inspect a `28 × 28` grayscale image.
   - Explore pixels, coordinates, intensity, and the one input channel.
   - Compare raw, tensor-scaled, and normalized pixel values.

3. **Pattern detectives**
   - Teach convolution on a small grid such as `5 × 5`.
   - Slide a `3 × 3` filter manually.
   - Show each multiplication, sum, and output cell.
   - Explain filters, kernels, feature maps, and channels.

4. **Keep and shrink clues**
   - Apply ReLU.
   - Apply max pooling.
   - Ask the learner to predict outputs.

5. **Build the full CNN**
   - Add components incrementally.
   - Propagate shapes.
   - Calculate parameters.
   - Include a repair-the-network shape-mismatch challenge.

6. **Teach the CNN**
   - Explain training, loss, backpropagation, optimizer, Adam, learning rate, epoch, batch, dropout, normalization, batch normalization, and weight decay.
   - Run the training simulation.

7. **Check the learning**
   - Teach training/validation/test roles.
   - Show learning curves.
   - Identify the best checkpoint and mild overfitting.

8. **Challenge the CNN**
   - Draw a genuinely unseen digit.
   - Preprocess it visibly.
   - Predict it.
   - Show the top three classes, confidence, and selected feature maps.

The learner may leave and return without losing progress.

## 4.2 CNN Playground

Provide open exploration with:

- complete architecture explorer;
- incremental architecture builder;
- layer and hyperparameter controls;
- live tensor-shape calculations;
- live parameter calculations;
- convolution, ReLU, pooling, normalization, batch-normalization, and dropout labs;
- training simulation;
- run comparison;
- drawing and prediction;
- PyTorch Code Studio;
- reset to the canonical CNN;
- one-step undo and redo where practical.

---

# 5. Canonical CNN

Use the corrected architecture below. Do not reproduce the inconsistent `16/32` source version from the analyzed notebook.

```text
Input: 1 × 28 × 28
Input normalization: mean 0.1307, standard deviation 0.3081

Conv2d: 1 → 32, kernel 3, stride 1, padding 1, bias false
BatchNorm2d: 32
ReLU

Conv2d: 32 → 32, kernel 3, stride 1, padding 1, bias false
BatchNorm2d: 32
ReLU
MaxPool2d: kernel 2, stride 2

Conv2d: 32 → 64, kernel 3, stride 1, padding 1, bias false
BatchNorm2d: 64
ReLU

Conv2d: 64 → 64, kernel 3, stride 1, padding 1, bias false
BatchNorm2d: 64
ReLU
MaxPool2d: kernel 2, stride 2

Flatten: 64 × 7 × 7 = 3,136
Linear: 3,136 → 128
ReLU
Dropout: p = 0.30
Linear: 128 → 10
Output: 10 logits for digits 0–9
```

The canonical trainable-parameter total must be exactly:

```text
468,010
```

Implement a startup self-test that asserts this value from the architecture engine. Do not hard-code only the displayed total; calculate it from layers and reconcile it.

The layer totals are:

| Component | Parameters |
|---|---:|
| Conv `1 → 32` | 288 |
| BatchNorm 32 | 64 |
| Conv `32 → 32` | 9,216 |
| BatchNorm 32 | 64 |
| Conv `32 → 64` | 18,432 |
| BatchNorm 64 | 128 |
| Conv `64 → 64` | 36,864 |
| BatchNorm 64 | 128 |
| Linear `3,136 → 128` | 401,536 |
| Linear `128 → 10` | 1,290 |
| **Total** | **468,010** |

---

# 6. Essential conceptual distinction

Do not place the optimizer, learning rate, loss, or backpropagation in the forward inference architecture as though they were layers.

Show two visually connected but distinct systems:

## Forward prediction path

```text
Image → Input normalization → CNN layers → Logits → Softmax for display → Prediction
```

## Learning loop

```text
Prediction → Cross-entropy loss → Backpropagation → Gradients → Optimizer → Updated weights
```

Clearly show that:

- dropout is active only during training;
- dropout is inactive during validation, testing, and prediction;
- batch normalization uses batch statistics during training;
- batch normalization uses stored running statistics during validation, testing, and inference;
- softmax is used to display probabilities and is not inserted before `CrossEntropyLoss`;
- the optimizer updates weights but does not process an unseen image during inference.

---

# 7. Universal click-to-explain system

Every meaningful technical concept visible in the interface must be clickable and keyboard-selectable. A conventional tooltip is not sufficient.

Implement a centralized concept registry. Each concept should support:

```javascript
{
  id,
  displayName,
  childFriendlyName,
  oneSentenceDefinition,
  analogy,
  purposeInThisCNN,
  inputDescription,
  outputDescription,
  workedExample,
  formula,
  pytorchSnippet,
  commonMistake,
  trainingBehavior,
  inferenceBehavior,
  relatedConceptIds,
  challengeId
}
```

The explanation panel must consistently provide:

1. What is it?
2. Why is it here?
3. Watch it work.
4. Try it.
5. See the numbers.
6. See the PyTorch.
7. Common mistake.
8. Related concepts.

Support three depths:

- **Quick:** one sentence and an analogy;
- **Explore:** visual and worked example;
- **Deep dive:** formulas, edge cases, and code.

At minimum, include every concept listed in the functional specification’s concept registry. Do not omit optimizer, Adam, learning rate, weight decay, input normalization, batch normalization, dropout, loss, backpropagation, gradient, batch, epoch, training set, validation set, test set, overfitting, logits, softmax, and confidence.

Selecting a concept must not reset the current experiment.

---

# 8. Visual and interaction design

Use a friendly technical-workspace design with a subtle “digit detective” narrative. Prioritize clarity and delight over decorative complexity.

## 8.1 Visual direction

- Bright, modern, high-contrast interface.
- Rounded panels and clear grouping.
- System font stack; no external fonts.
- Smooth but restrained animation.
- Consistent visual encoding:
  - blue for data/tensors;
  - purple for learnable transformations;
  - green for correct/improving;
  - orange for uncertainty or validation;
  - red for invalid state;
  - gray for inactive behavior.
- Never rely on color alone.

## 8.2 Layout

Desktop:

- top navigation;
- central architecture canvas;
- right-side explanation/controls panel;
- bottom guided-action bar.

Narrow screens:

- architecture remains primary;
- explanation opens as a bottom sheet;
- internal horizontal architecture scrolling is acceptable;
- avoid whole-page horizontal scrolling.

## 8.3 Architecture visualization

Show:

- technical and child-friendly names;
- input/output shapes;
- trainable parameters;
- grouped `Conv + BatchNorm + ReLU` blocks;
- expandable individual operations;
- current tensor location;
- forward animation;
- training-versus-inference state;
- total parameters;
- model-validity indicator.

Do not attempt to render all dense-layer connections or all 64 feature maps simultaneously. Use abstraction, sampling, and a feature-map selector.

## 8.4 Accessibility

Implement:

- semantic HTML controls;
- keyboard navigation;
- visible focus;
- screen-reader labels;
- textual alternatives for Canvas/SVG;
- WCAG AA contrast;
- `prefers-reduced-motion`;
- manual reduced-motion setting;
- step-based alternatives to animation;
- touch targets near 44 × 44 CSS pixels;
- no timed interactions required for success.

---

# 9. Architecture engine and builder

Create an internal architecture model rather than manually coding every displayed shape.

Each layer should contain data similar to:

```javascript
{
  id,
  type,
  displayName,
  enabled,
  config,
  inputShape,
  outputShape,
  trainableParameters,
  activationCount,
  valid,
  validationMessages,
  conceptIds
}
```

Implement:

- forward shape propagation;
- trainable-parameter calculation;
- activation-count calculation;
- architecture validation;
- canonical reset;
- bounded parameter editing;
- add, remove, insert, and reorder for supported blocks;
- drag interaction where reliable;
- button/keyboard alternatives to drag.

Supported blocks:

- input;
- input normalization;
- convolution;
- batch normalization;
- ReLU;
- max pooling;
- flatten;
- linear/dense;
- dropout;
- output/logits.

Validate:

- positive integer dimensions;
- supported kernels;
- valid stride;
- nonnegative padding;
- positive convolution output;
- channel compatibility;
- pooling output;
- flatten/linear compatibility;
- final output size of ten;
- dropout in `[0,1)`;
- batch-normalization channels.

When invalid:

- retain the learner’s attempted change;
- mark the exact broken connection;
- state expected and actual shapes;
- explain why;
- offer concrete repair choices;
- disable prediction and runnable-code download;
- do not crash.

Include the explicit repair challenge:

```text
Actual flattened values: 32 × 7 × 7 = 1,568
Dense layer expects: 64 × 7 × 7 = 3,136
```

---

# 10. Required interactive laboratories

## 10.1 Pixel and normalization laboratory

Implement:

- inspectable `28 × 28` grayscale digit;
- row and column;
- original grayscale value;
- `[0,1]` tensor-scaled value;
- normalized value;
- paint, erase, brush size, clear, and undo;
- input normalization toggle;
- formula:

```text
normalized pixel = (pixel − 0.1307) ÷ 0.3081
```

Explain that normalized values may be negative or greater than one.

## 10.2 Convolution laboratory

Begin with a small grid such as `5 × 5`.

Implement:

- vertical, horizontal, diagonal, blur, sharpen, and custom filters;
- manual stepping;
- play, pause, previous, next, restart;
- speed control;
- covered input region;
- pairwise multiplication;
- running sum;
- optional bias;
- output cell;
- output feature map;
- filter/channel selector.

Support bounded changes to:

- kernel size;
- stride;
- padding;
- input channels;
- output filters;
- bias.

Show formulas and substitute current values.

## 10.3 ReLU laboratory

Show:

```text
ReLU(x) = max(0, x)
```

Animate negative values becoming zero. Provide before/after and a prediction challenge.

## 10.4 Pooling laboratory

Implement:

- max pooling;
- optional average-pooling comparison;
- pooling window;
- stride;
- highlighted regions;
- selected output;
- input/output shape;
- explanation that pooling has no trainable parameters and does not change channel count.

## 10.5 Batch-normalization laboratory

Visually distinguish input normalization from batch normalization.

Show a small set of feature values:

- before normalization;
- centered and scaled;
- after learned scale and shift.

Explain:

- training batch statistics;
- inference running statistics;
- `2 × channels` learnable parameters;
- running mean/variance as state, not trainable parameters.

## 10.6 Flatten and dense laboratory

Animate:

```text
64 × 7 × 7 → 3,136
```

Show:

```text
3,136 × 128 + 128 = 401,536
```

Abstract the dense connections rather than drawing hundreds of thousands of lines.

## 10.7 Dropout laboratory

Show a manageable representation of 128 neurons.

At 30% dropout, explain:

```text
128 × 0.30 = 38.4
```

or approximately 38 inactive activations in one simulated pass.

Repeated passes should use different masks. Clearly disable dropout during validation, test, and inference.

---

# 11. Training simulator

Training is simulated, not performed in-browser. Be explicit and honest.

Show:

- illustrative batch;
- prediction and true label;
- loss;
- forward pass;
- backpropagation;
- optimizer update;
- epoch;
- training/validation loss;
- training/validation accuracy;
- best checkpoint;
- overfitting indicator.

Controls:

- start;
- pause;
- resume;
- one illustrative batch;
- skip to epoch end;
- restart;
- compare two runs.

Teach the correct step order:

1. Clear previous gradients.
2. Forward pass.
3. Calculate loss.
4. Backpropagate.
5. Optimizer update.

Default settings:

```text
Optimizer: Adam
Learning rate: 0.001
Epochs: 5
Batch size: 128
Dropout: 0.30
Weight decay: 0.0001
Input normalization: enabled
Batch normalization: enabled
```

Use the exact recorded canonical trace:

| Epoch | Training loss | Training accuracy | Validation loss | Validation accuracy |
|---:|---:|---:|---:|---:|
| 1 | 0.1462 | 95.44% | 0.0681 | 97.98% |
| 2 | 0.0530 | 98.43% | 0.0355 | 99.15% |
| 3 | 0.0409 | 98.76% | 0.0307 | 99.00% |
| 4 | 0.0331 | 98.99% | 0.0377 | 98.88% |
| 5 | 0.0280 | 99.14% | 0.0391 | 98.87% |

Identify epoch 2 as the best validation-accuracy checkpoint.

Explain mild overfitting after the best epoch.

Support recorded or educational traces for:

- learning rates `0.01`, `0.001`, and `0.0001`;
- dropout 0%, 30%, and excessive dropout;
- normalization on/off;
- batch normalization on/off where credible;
- Adam and optionally SGD.

Every trace must identify itself as:

- **Recorded experiment result**, or
- **Educational simulation**.

Do not invent precise claims for an untrained arbitrary configuration. Unsupported combinations should use qualitative descriptions or bounded illustrative ranges.

Include a learning-rate landscape animation:

- too small: very slow;
- suitable: steady;
- too large: overshoots;
- unstable: fails to settle.

State:

> The optimizer chooses how to update. The learning rate controls the size of the update.

---

# 12. Dataset split and evaluation

Teach:

- training: 54,000;
- validation: 6,000;
- test: 10,000.

Use the analogy:

- training = practice;
- validation = practice exam and model selection;
- test = sealed final exam.

Include a drag or selection activity that assigns each role.

If the learner attempts to train on test data, explain data leakage.

Show canonical test results:

```text
Test loss: 0.0266
Test accuracy: 99.11%
Approximately 9,911 correct
Approximately 89 incorrect
```

Include the recorded per-class accuracies from the functional specification.

Do not invent confusion-matrix counts if exact counts are unavailable. A conceptual matrix must be labeled as an illustration.

---

# 13. Genuine embedded inference is required

Implement genuine CNN inference for an unseen learner-drawn digit. Do not substitute a handcrafted heuristic, nearest-neighbor lookup, random selection, or scripted answer while labeling it as CNN inference.

The final HTML must include:

- pretrained canonical model weights;
- normalization constants;
- class names;
- pure-JavaScript forward inference;
- deterministic preprocessing;
- deterministic prediction.

You may use Python and PyTorch during development to:

- train the canonical model;
- export weights;
- generate embedded typed-array data;
- create reference logits;
- validate JavaScript inference.

These development tools must not be runtime requirements.

## 13.1 Required JavaScript operations

Implement and test:

- `conv2d` for batch size one;
- inference-mode batch normalization;
- ReLU;
- max pooling;
- flatten;
- linear layer;
- stable softmax.

Use `Float32Array` and memory-conscious loops. Optimize only after correctness.

## 13.2 Embedded weights

Embed weights as compressed/encoded data inside the HTML. Decode them in memory.

Include:

- tensor names;
- shapes;
- offsets or separate encoded blocks;
- format version;
- integrity metadata.

Do not manually paste enormous JavaScript number arrays if a compact binary/base64 representation is practical.

## 13.3 Preprocessing

For the drawing canvas:

1. Detect a nonblank bounding box.
2. Crop the drawn digit.
3. Preserve aspect ratio.
4. Resize into an MNIST-like inner region.
5. Center it in a `28 × 28` canvas, preferably using center of mass.
6. Ensure light stroke on dark background.
7. Convert to `[0,1]`.
8. Normalize with mean `0.1307` and standard deviation `0.3081`.

Show these preprocessing stages visually.

Warn when:

- the canvas is blank;
- the stroke is extremely faint;
- there are multiple disconnected digit-sized groups;
- the drawing is far outside expected MNIST style.

## 13.4 Inference validation

During development:

1. Run the canonical PyTorch model on a fixed reference set.
2. Record reference logits or probabilities.
3. Run the embedded JavaScript inference on identical normalized inputs.
4. Compare within a defined numerical tolerance.
5. Verify top-1 consistency.
6. Test at least one example for each digit.
7. Verify repeated predictions are deterministic.

If genuine inference cannot be completed because trained weights or required development capabilities are unavailable, do not silently fake it. Stop and report:

- the exact blocker;
- what was completed;
- what remains;
- the smallest action needed to unblock genuine inference.

Do not declare the application complete without genuine inference.

## 13.5 Responsiveness

Prediction should normally complete within two seconds on a current desktop.

If helpful, create an inline Web Worker using a Blob assembled from an in-file function string. Provide a main-thread fallback because local-file worker behavior can vary.

Show progress if inference exceeds approximately 250 milliseconds.

---

# 14. Prediction laboratory

Implement:

- mouse, touch, and pointer drawing;
- adjustable brush;
- eraser;
- clear;
- undo;
- bundled unseen samples;
- optional controlled rotation, translation, thickness, erasure, and noise;
- preprocessing preview;
- explicit Predict action;
- predicted digit;
- confidence;
- top-three probabilities;
- selected early feature maps;
- confidence-not-guarantee explanation;
- out-of-distribution warning.

Do not imply that the training simulation created the embedded pretrained model. State that the application is replaying training for learning while prediction uses a previously trained embedded CNN.

---

# 15. PyTorch Code Studio

Generate PyTorch only.

Provide sections for:

- imports and configuration;
- transforms;
- dataset split and DataLoaders;
- model definition;
- loss and Adam optimizer;
- training loop;
- validation loop;
- checkpointing;
- test evaluation;
- single-image inference.

Provide:

- Beginner code with explanatory comments;
- Clean code with concise comments;
- shape comments;
- architecture-to-code synchronization;
- hyperparameter-to-code synchronization;
- visual-block-to-code highlighting;
- code-to-visual-block highlighting;
- clickable `Conv2d`, `BatchNorm2d`, `ReLU`, `Dropout`, `Adam`, `lr`, and related tokens;
- copy section;
- copy all;
- browser-generated `.py` download.

Generate code from the internal architecture model. Do not maintain a separate hard-coded code version that can drift from the visual architecture.

Do not provide runnable download when the architecture is invalid.

The default code must use:

```python
ConvBNReLU(1, 32)
ConvBNReLU(32, 32)
ConvBNReLU(32, 64)
ConvBNReLU(64, 64)
nn.Linear(64 * 7 * 7, 128)
```

Never generate the broken `16/32` architecture with a `64 × 7 × 7` dense input.

---

# 16. Persistence and privacy

Use `localStorage` for:

- guided progress;
- current mission;
- completed challenges;
- viewed concepts;
- accessibility settings;
- Playground architecture;
- hyperparameters;
- saved comparison run.

Include:

- Resume;
- Start over;
- Clear local data;
- Reset Playground;
- schema version;
- safe handling of incompatible stored state.

Optionally implement JSON project export/import. Validate imported JSON and never evaluate it as code.

Do not:

- request personal data;
- transmit drawings;
- transmit progress;
- load remote analytics;
- contact an external service.

---

# 17. Internal organization inside the single HTML

Keep the one-file source maintainable with labeled regions:

```text
1. Document metadata and semantic HTML
2. Design tokens and CSS
3. Embedded educational data
4. Concept registry
5. Canonical architecture and traces
6. State store
7. Shape/parameter engine
8. Architecture validator
9. Guided-mission controller
10. Visualization/rendering helpers
11. Laboratory controllers
12. Training-trace engine
13. Drawing/preprocessing
14. Inference engine and embedded weights
15. PyTorch generator
16. Persistence
17. Accessibility
18. Event binding
19. Internal self-tests
20. Application bootstrap
```

Use clear naming and small functions. Avoid a single monolithic event handler.

Do not expose unnecessary variables globally. Place the application inside an IIFE or one explicit namespace.

---

# 18. Error handling

Never allow a blank or silently broken UI.

Provide plain-language recovery for:

- corrupt local state;
- invalid imported project;
- invalid architecture;
- blank drawing;
- failed model-weight decode;
- failed self-test;
- failed inference;
- unsupported browser capability;
- worker failure.

If a critical model-integrity or inference self-test fails, disable prediction and explain that the learning content remains available but the embedded model could not be verified.

---

# 19. Internal self-tests

Implement an in-file test function accessible through a query parameter, hidden developer action, or console command. It must not distract ordinary learners.

At minimum, test:

- canonical input/output shape chain;
- convolution output formulas;
- pooling output formulas;
- convolution parameter counts;
- batch-normalization parameter counts;
- linear parameter counts;
- canonical total of 468,010;
- invalid flatten/dense detection;
- softmax numerical stability;
- probabilities summing approximately to one;
- code-generation canonical strings;
- local-state schema handling;
- model-weight metadata and integrity;
- reference inference when genuine weights are embedded.

Surface a concise pass/fail report for development.

---

# 20. Development and implementation sequence

Use this order unless the existing workspace requires a safer adjustment.

## Phase 1: Inspect and plan

- Read the full specification.
- Inventory existing files.
- Determine whether PyTorch and MNIST are available for development.
- Plan embedded-weight generation.
- Identify browser-testing capabilities.

## Phase 2: Build the application shell

- Create `cnn-learning-lab.html`.
- Implement responsive layout, navigation, state, accessibility settings, and concept panel.
- Confirm direct `file://` launch before proceeding.

## Phase 3: Implement the architecture engine

- Layer model.
- Shape propagation.
- Parameter calculation.
- Validation.
- Canonical self-tests.
- Builder and architecture explorer.

## Phase 4: Implement the learning laboratories

- Pixels and normalization.
- Convolution.
- ReLU.
- Pooling.
- Batch normalization.
- Flatten/dense.
- Dropout.

## Phase 5: Implement the Guided Mission

- Mission sequencing.
- Challenges.
- Feedback.
- Progress persistence.
- Completion summary.

## Phase 6: Implement the training simulator

- Canonical trace.
- Alternative recorded/educational traces.
- Loss/backpropagation/optimizer animation.
- Learning-rate lab.
- Dataset split and overfitting activities.

## Phase 7: Implement genuine inference

- Train or obtain the canonical weights through an authorized development process.
- Export and embed weights.
- Implement pure-JavaScript forward pass.
- Implement drawing preprocessing.
- Validate against PyTorch reference outputs.
- Add feature-map previews.

## Phase 8: Implement Code Studio

- Generate model, data, training, evaluation, and prediction code.
- Synchronize visual blocks and code.
- Implement copy and `.py` download.

## Phase 9: Test and polish

- Run internal tests.
- Test keyboard behavior.
- Test reduced motion.
- Test responsive layouts.
- Test drawing and inference.
- Test localStorage reset/resume.
- Test offline `file://`.
- Inspect visually for overflow, clipping, unreadable values, and broken states.
- Fix all material issues.

---

# 21. Browser testing

At minimum:

1. Open `cnn-learning-lab.html` directly, not only through a development server.
2. Disable network access or use browser offline mode.
3. Verify no network request is needed.
4. Verify the console has no material errors.
5. Complete the Guided Mission’s critical path.
6. Open every primary lab.
7. Make valid and invalid architecture changes.
8. Run the canonical training simulation.
9. Draw and predict at least three digits.
10. Test blank canvas.
11. Generate and download PyTorch.
12. Refresh and resume.
13. Test clear-local-data.
14. Test keyboard-only navigation.
15. Test reduced motion.
16. Test common desktop viewport and a narrow tablet/mobile viewport.

Use available browser automation where useful, but perform visual inspection as well. Automated DOM assertions alone are not sufficient for an interaction-heavy visual application.

---

# 22. Performance targets

Target:

- usable initial UI within approximately three seconds;
- ordinary parameter recalculation within approximately 100 milliseconds;
- responsive drawing;
- genuine prediction within approximately two seconds on a current desktop;
- no long frozen main-thread state;
- final file preferably below approximately 8 MB.

If the final file exceeds 8 MB because of verified model weights, report the exact size and major contributors. Do not remove required offline capability merely to reduce file size.

---

# 23. Anti-shortcut requirements

Do not:

- create a slide deck disguised as an interactive application;
- implement only static cards and “Next” buttons;
- create dead controls that do not change calculations;
- hard-code displayed output shapes without a shape engine;
- hard-code total parameters without summing layer parameters;
- use an iframe;
- rely on remote content;
- use fake charts with unsupported exact metrics;
- pretend simulated training is genuine;
- pretend a heuristic digit guess is CNN inference;
- omit less visually convenient concepts such as optimizer, learning rate, batch normalization, or dropout;
- place optimizer inside the inference stack;
- use softmax before training cross-entropy;
- keep dropout active during prediction;
- download model weights at runtime;
- require a local server;
- produce multiple required runtime files;
- defer most functionality to future work and call the prototype complete.

---

# 24. Definition of done

Do not declare completion until all of the following are true:

- `cnn-learning-lab.html` is the only required runtime artifact.
- It opens through `file://`.
- It works with the network unavailable.
- It requests no external resource.
- The complete corrected CNN is visible.
- The architecture engine computes the canonical 468,010 parameters.
- The learner can build the model incrementally.
- Invalid dimensions are detected and explained.
- Every visible technical concept opens the standardized explanation system.
- Convolution, ReLU, pooling, normalization, batch normalization, flatten, dense, and dropout are interactive.
- Optimizer, Adam, learning rate, loss, gradient, backpropagation, batch, epoch, validation, test, and overfitting are interactively explained.
- The canonical simulated training trace matches the specification.
- Training simulation is labeled honestly.
- The student can draw an unseen digit.
- The drawing is visibly preprocessed.
- Genuine embedded CNN inference produces the prediction.
- The prediction provides top-three probabilities and confidence.
- The application does not imply simulated training created the embedded model.
- Generated PyTorch matches the current valid architecture.
- The default PyTorch uses the corrected `32/64` architecture.
- Keyboard operation works.
- Reduced motion works.
- Progress resumes locally.
- Clear-local-data works.
- Internal mathematical and inference tests pass.
- Offline browser testing passes.
- Material visual defects are fixed.

---

# 25. Final handoff

At completion, provide a concise report containing:

1. The path to `cnn-learning-lab.html`.
2. Final file size.
3. What was implemented.
4. Confirmation that the runtime is a single self-contained HTML file.
5. Confirmation that it was tested through `file://` with no network dependency.
6. Training-simulation disclosure.
7. Inference implementation and its validation against PyTorch.
8. Internal test results.
9. Browser/viewport/accessibility checks performed.
10. Any known limitations.

Do not merely describe code. Implement the application, validate it, and hand off the working file.

## Prompt ends

