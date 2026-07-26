# CNN Learning Lab

## Detailed Functional Specification

**Document status:** Draft for implementation  
**Product type:** Experimental, self-guided educational web application  
**Target audience:** Sixth-grade students with basic multiplication, coordinate, and introductory programming knowledge  
**Primary subject:** Intuitive learning of a convolutional neural network using MNIST  
**Target session:** 20–30 minutes for the guided experience; unlimited optional sandbox use  
**Delivery format:** One self-contained HTML file with embedded CSS, JavaScript, educational data, simulation traces, and any model assets  
**Generated code:** PyTorch only  

---

## 1. Executive Summary

CNN Learning Lab is a portable, self-guided application that teaches a sixth-grade student how a convolutional neural network recognizes handwritten digits. The student sees the complete neural network, constructs it incrementally, inspects every concept, changes architectural and training parameters, observes simulated training, predicts an unseen digit, and generates corresponding PyTorch code.

The application must prioritize intuitive understanding before formal mathematics. It will use animation, direct manipulation, short prediction questions, shape visualizations, and age-appropriate explanations. Mathematical formulas and PyTorch code remain available on demand so that the application does not hide the real concepts.

The application must be delivered as a single self-contained HTML file. It must not require installation, a build command, a web server, an account, a backend, a CDN, or an internet connection after the file has been downloaded. The file must open directly in a modern browser.

Training will be simulated using educational animations and precomputed, credible experiment traces. Prediction may use either:

1. an embedded pretrained MNIST model and a pure-JavaScript inference engine; or
2. an explicitly labeled educational prediction simulation if embedded inference is deferred.

The preferred implementation is genuine embedded inference because it allows the student to draw a genuinely unseen digit and receive a real model prediction while retaining a single-file architecture.

---

## 2. Product Vision

### 2.1 Vision statement

Help a child understand a CNN as a visible, inspectable system that transforms an image into a prediction—not as a mysterious box or a wall of code.

### 2.2 Core learning loop

The primary learning loop is:

> See → Predict → Manipulate → Observe → Explain → Reveal the code

Before an important transformation, the application should frequently ask the student what they expect to happen. The student then runs the operation and compares the result with the prediction.

### 2.3 Learning promise

After completing the guided experience, the student should be able to explain, at an age-appropriate level:

- how an image is represented as pixel numbers;
- what normalization does;
- how a convolution filter searches for a pattern;
- why several filters produce several feature-map channels;
- what ReLU does;
- how max pooling reduces spatial size;
- how deeper layers combine clues;
- why feature maps are flattened;
- how a dense layer produces ten digit scores;
- what dropout does and when it is active;
- what loss measures;
- what backpropagation communicates;
- what an optimizer changes;
- what the learning rate controls;
- why training, validation, and test data serve different purposes;
- why the model can be confidently wrong;
- how the visual architecture corresponds to PyTorch.

---

## 3. Scope

### 3.1 In scope for the experimental application

- One portable, self-contained HTML file.
- A self-guided learning experience designed for 20–30 minutes.
- A persistent holistic view of the complete CNN.
- Incremental CNN construction.
- Clickable explanations for every visualized concept.
- Interactive convolution on a small image.
- Interactive ReLU and max-pooling demonstrations.
- Live tensor-shape calculations.
- Live trainable-parameter calculations.
- Safe experimentation with supported architecture parameters.
- Explanation and simulation of:
  - input normalization;
  - batch normalization;
  - dropout;
  - loss;
  - backpropagation;
  - optimizer;
  - Adam;
  - learning rate;
  - weight decay;
  - epochs;
  - batches;
  - training;
  - validation;
  - testing;
  - overfitting.
- Simulated training using credible precomputed experiment traces.
- Drawing or selecting an unseen MNIST-style digit.
- Prediction with either an embedded model or a clearly labeled simulation.
- Top-three predictions and confidence display.
- PyTorch code generation for the current valid architecture.
- Bidirectional highlighting between the visual network and generated code.
- Guided challenges, feedback, and a completion summary.
- Local browser persistence without an account.
- Keyboard access, reduced-motion support, readable typography, and non-color-only communication.

### 3.2 Out of scope for the first experimental application

- Genuine model training in the browser.
- Arbitrary image datasets.
- TensorFlow, Keras, JAX, ONNX code generation, or multiple programming frameworks.
- Cloud storage, accounts, authentication, or teacher dashboards.
- Multiuser or collaborative learning.
- Competitive public leaderboards.
- A backend, database, or hosted API.
- Real-time classroom monitoring.
- Free-form natural-language tutoring by an LLM.
- Unrestricted architecture design involving arbitrary layer types.
- Production-grade model deployment.
- Image classification outside MNIST-style digits.
- Guaranteed recognition of photographs containing handwriting in uncontrolled backgrounds.

---

## 4. Key Product Decisions

### 4.1 Single HTML rather than JavaScript-only

The deliverable shall be one `.html` file because a JavaScript-only file still requires a separate HTML host document. The HTML file shall contain:

- HTML structure;
- embedded CSS;
- embedded JavaScript;
- embedded SVG symbols or programmatically drawn Canvas/SVG graphics;
- embedded educational examples;
- embedded experiment traces;
- embedded model metadata;
- optionally embedded compressed pretrained weights.

### 4.2 Offline and dependency-free

The application shall not rely on:

- CDN scripts;
- external fonts;
- external stylesheets;
- external images;
- network-fetched datasets;
- hosted model weights;
- a service worker;
- a backend endpoint;
- Node.js or a package manager at runtime.

All required runtime capabilities shall be contained in the HTML file or supplied by standard browser APIs.

### 4.3 Simulated training, honest labeling

Training shall be educationally simulated. The interface must never claim that a parameter configuration was genuinely trained if it was not.

Precomputed traces shall be labeled as real previously recorded experiment outcomes when they come from genuine offline PyTorch runs. Unsupported combinations shall be labeled as educational simulations and shall avoid invented precision.

### 4.4 Genuine prediction preferred

The preferred prototype shall perform genuine forward inference using:

- the corrected canonical CNN;
- embedded pretrained weights;
- pure-JavaScript implementations of the required operations;
- one input image at a time.

If genuine inference is not implemented in the first build, all predictions must be labeled “educational simulation,” and the UI must not imply that the simulated training created the prediction model.

### 4.5 Correct canonical architecture

The application shall use the corrected architecture represented by the executed output of the analyzed notebook:

1. Input: `1 × 28 × 28`
2. Input normalization
3. Convolution `1 → 32`, kernel `3 × 3`, stride `1`, padding `1`, no bias
4. Batch normalization, 32 channels
5. ReLU
6. Convolution `32 → 32`, kernel `3 × 3`, stride `1`, padding `1`, no bias
7. Batch normalization, 32 channels
8. ReLU
9. Max pooling `2 × 2`, stride `2`
10. Convolution `32 → 64`, kernel `3 × 3`, stride `1`, padding `1`, no bias
11. Batch normalization, 64 channels
12. ReLU
13. Convolution `64 → 64`, kernel `3 × 3`, stride `1`, padding `1`, no bias
14. Batch normalization, 64 channels
15. ReLU
16. Max pooling `2 × 2`, stride `2`
17. Flatten `64 × 7 × 7 → 3,136`
18. Linear `3,136 → 128`
19. ReLU
20. Dropout `p = 0.30`
21. Linear `128 → 10`
22. Ten logits representing digits 0–9

The canonical trainable parameter count is 468,010.

---

## 5. Users and Usage Context

### 5.1 Primary persona

**Name:** Curious sixth-grade learner  
**Age:** Approximately 11–12  
**Context:** Uses the application independently and on demand  
**Prior knowledge:** Basic multiplication, simple coordinates, basic variables, and limited introductory code exposure  
**Motivation:** Wants to know how an AI recognizes a handwritten digit  
**Needs:**

- immediate visual feedback;
- small, achievable challenges;
- plain-language explanations;
- freedom to experiment without “breaking” the application;
- a visible connection between actions, mathematics, and code;
- no account or setup process.

### 5.2 Secondary persona

**Name:** Curious older learner or parent  
**Context:** Opens the same application to explore the technical details  
**Needs:** Optional mathematical depth, exact parameter calculations, and generated PyTorch.

The interface shall not require selecting an age or persona.

---

## 6. Learning Experience Architecture

### 6.1 Primary modes

The application shall provide two modes:

#### Guided Mission

A structured 20–30 minute experience that introduces concepts in a carefully controlled sequence.

#### CNN Playground

An open exploration mode that allows the student to:

- inspect any concept;
- modify supported parameters;
- run training simulations;
- draw digits;
- inspect predictions;
- generate code;
- reset the model.

### 6.2 Mode switching

- The student may switch between modes at any time.
- Leaving the Guided Mission shall not erase progress.
- Returning to the mission shall resume at the last completed activity.
- The Playground shall provide “Reset to the canonical CNN.”
- The Guided Mission shall control the architecture state needed for each lesson without destroying the saved Playground state.

### 6.3 Suggested guided timing

| Mission | Target time | Primary outcome |
|---|---:|---|
| Meet the digit mystery | 2 minutes | Understand the application goal |
| Images are numbers | 3 minutes | Understand pixels and channels |
| Pattern detectives | 5 minutes | Understand convolution and feature maps |
| Keep and shrink clues | 3 minutes | Understand ReLU and pooling |
| Build the full CNN | 4 minutes | Understand the complete forward path |
| Teach the CNN | 5 minutes | Understand loss, backpropagation, optimizer, and hyperparameters |
| Check the learning | 3 minutes | Understand validation, testing, and overfitting |
| Challenge the CNN | 2 minutes | Predict an unseen handwritten digit |

---

## 7. Information Architecture

### 7.1 Main application regions

The desktop layout shall contain:

1. **Top navigation**
   - product name;
   - Guided Mission/Playground switch;
   - progress;
   - sound control if sound is implemented;
   - settings;
   - reset.

2. **Architecture canvas**
   - the visual forward path;
   - the training loop when training view is active;
   - selectable layers and tensors;
   - current shapes and status.

3. **Context panel**
   - the universal explanation panel;
   - experiment controls;
   - calculations;
   - code snippets;
   - challenge feedback.

4. **Bottom action area**
   - Back;
   - Try it;
   - Run;
   - Check my answer;
   - Next;
   - Open Playground.

### 7.2 Small-screen layout

On narrow screens:

- the architecture canvas shall remain the primary region;
- the explanation panel shall open as a bottom sheet;
- navigation shall not cover the visualized tensor;
- all critical interactions shall remain available without horizontal page scrolling;
- the architecture itself may use an internal horizontal scroller.

---

## 8. Global Interaction Principles

### 8.1 Everything meaningful is inspectable

Every displayed technical concept shall be clickable or keyboard-selectable. Static text such as a layer label must not be the only route to its explanation.

### 8.2 Predict before reveal

When appropriate, the application shall ask the student to make a prediction before running an operation:

- Which output cell will be largest?
- Will the feature map become larger or smaller?
- How many output channels will there be?
- Which number will max pooling keep?
- Will a higher learning rate make steps larger or smaller?
- Is the model beginning to overfit?

Wrong answers shall produce explanatory feedback without penalties.

### 8.3 Progressive disclosure

Each concept shall support three explanation depths:

- **Quick:** one sentence and an analogy;
- **Explore:** animation and worked example;
- **Deep dive:** mathematics, edge cases, and PyTorch.

The Guided Mission shall use Quick and Explore by default. Deep dive content shall remain optional.

### 8.4 Consistent visual encoding

- Blue: data or tensors moving forward.
- Purple: learnable transformations and parameters.
- Green: correct predictions or improvements.
- Orange: uncertainty, caution, or validation.
- Red: invalid architecture or incorrect prediction.
- Gray: inactive operations, including dropout-disabled inference behavior.

Color shall never be the only carrier of meaning. Icons, patterns, text, and shapes shall provide redundant cues.

### 8.5 Undo and reset

- Parameter changes in the Playground shall support one-step undo and redo.
- Each experiment panel shall have “Reset this experiment.”
- The whole application shall have a reset action with confirmation.
- The reset confirmation shall distinguish Guided Mission progress from Playground configuration.

---

## 9. Universal Concept Explanation System

### 9.1 Concept registry

All explanations shall come from a centralized in-file concept registry rather than duplicated hard-coded tooltips.

Each concept record shall support:

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
  animationType,
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

### 9.2 Required concepts

The registry shall, at minimum, include:

- artificial intelligence;
- machine learning;
- neural network;
- convolutional neural network;
- MNIST;
- dataset;
- example;
- image;
- pixel;
- grayscale;
- tensor;
- dimension;
- shape;
- batch;
- channel;
- input channel;
- output channel;
- filter;
- kernel;
- convolution;
- stride;
- padding;
- bias;
- weight;
- parameter;
- learnable parameter;
- weighted sum;
- feature;
- feature map;
- receptive field;
- ReLU;
- max pooling;
- average pooling;
- flatten;
- dense layer;
- linear layer;
- neuron;
- logit;
- softmax;
- probability;
- confidence;
- predicted class;
- true label;
- loss;
- cross-entropy;
- gradient;
- backpropagation;
- optimizer;
- Adam;
- SGD;
- learning rate;
- weight decay;
- epoch;
- iteration;
- training mode;
- evaluation mode;
- training set;
- validation set;
- test set;
- generalization;
- overfitting;
- underfitting;
- input normalization;
- mean;
- standard deviation;
- batch normalization;
- scale;
- shift;
- dropout;
- random seed;
- checkpoint;
- accuracy;
- per-class accuracy;
- confusion matrix;
- inference;
- unseen data.

### 9.3 Explanation-panel content

When a concept is selected, the panel shall display:

1. Real name and child-friendly name.
2. One-sentence definition.
3. “Why it is here.”
4. An animation or highlighted visual.
5. A worked numeric example when applicable.
6. Current input and output shape when applicable.
7. Current trainable-parameter calculation when applicable.
8. “During training” behavior.
9. “During prediction” behavior.
10. Corresponding PyTorch.
11. Common misconception.
12. Related concepts.
13. Optional micro-challenge.

### 9.4 Context preservation

Closing an explanation shall return the student to the exact prior visual state. Opening an explanation must not run, reset, or modify an experiment.

---

## 10. Functional Requirements: Application Launch

### FR-001 Direct launch

The application shall open when the downloaded HTML file is opened in a supported browser.

### FR-002 No setup

The application shall not require installation, extraction, a terminal, a local server, or a package manager.

### FR-003 First-launch introduction

On first launch, the application shall show:

- the goal: teach a CNN to recognize handwritten digits;
- the approximate guided duration;
- Guided Mission and Playground entry points;
- a statement that training is simulated;
- a statement identifying prediction as real embedded inference or simulated, according to the implementation.

### FR-004 Resume

If prior local progress exists, the application shall offer:

- Resume mission;
- Start over;
- Open Playground.

### FR-005 Capability check

The application shall detect essential browser capabilities. If a capability is missing, it shall:

- identify the limitation in plain language;
- provide a safe fallback if available;
- never fail with a blank screen.

---

## 11. Functional Requirements: Holistic Architecture Explorer

### FR-100 Complete architecture

The application shall provide a complete end-to-end view of the canonical CNN.

### FR-101 Layer identity

Every layer shall display:

- technical name;
- child-friendly label;
- input shape;
- output shape;
- parameter count;
- layer position.

### FR-102 Grouped and expanded views

The application shall support:

- grouped blocks such as `Conv + BatchNorm + ReLU`;
- expanded blocks showing each operation separately.

### FR-103 Tensor flow

The student shall be able to select an input digit and run it forward through the architecture one stage at a time.

### FR-104 Current-location indicator

During step-through, the application shall clearly show:

- the current tensor;
- the operation being performed;
- the input values or representative sample;
- the output values or representative sample;
- the shape transition.

### FR-105 Layer selection

Selecting a layer shall open its explanation and highlight:

- incoming tensor;
- selected operation;
- outgoing tensor;
- corresponding generated code.

### FR-106 Training-path distinction

The architecture explorer shall visually separate:

- the forward prediction path; and
- the loss/backpropagation/optimizer learning loop.

### FR-107 Training versus prediction state

The architecture shall visibly indicate operations that behave differently:

- dropout active during training and inactive during inference;
- batch normalization using batch statistics during training and stored running statistics during inference.

### FR-108 Full architecture summary

The explorer shall display:

- total trainable parameters: 468,010;
- current input shape;
- current output shape;
- selected model status;
- whether the architecture is valid.

---

## 12. Functional Requirements: Incremental Architecture Builder

### FR-200 Empty starting canvas

The Guided Mission shall provide an initially incomplete architecture and guide the student to add components in a meaningful order.

### FR-201 Supported blocks

The builder shall support:

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

### FR-202 Placement

The student shall be able to add or insert a supported block at valid insertion locations.

### FR-203 Guided constraints

In Guided Mission mode, only lesson-relevant components and positions shall be enabled.

### FR-204 Playground flexibility

In Playground mode, the student may add, remove, reorder, and configure supported blocks within validation rules.

### FR-205 Shape propagation

After any valid architectural change, the application shall recalculate all downstream tensor shapes.

### FR-206 Parameter propagation

After any valid architectural change, the application shall recalculate:

- parameters per layer;
- total trainable parameters;
- total activation values per layer.

### FR-207 Invalid architecture feedback

If an operation creates an invalid architecture, the application shall:

- preserve the student’s attempted change visibly;
- mark the affected connection;
- explain the mismatch;
- identify the expected and actual shapes;
- offer one or more fixes;
- disable training simulation, prediction, and code download until corrected.

### FR-208 Repair challenge

The Guided Mission shall include a repair activity based on a flatten/dense mismatch:

```text
Actual flattened values: 32 × 7 × 7 = 1,568
Dense layer expects: 64 × 7 × 7 = 3,136
```

The student shall correct either the preceding channels or the dense input.

### FR-209 Canonical reset

The builder shall provide “Restore canonical CNN.”

---

## 13. Functional Requirements: Pixel and Image Laboratory

### FR-300 MNIST image

The application shall show a `28 × 28` grayscale MNIST-style image as:

- a visible digit; and
- an inspectable pixel grid.

### FR-301 Pixel inspection

Selecting or hovering over a pixel shall show:

- row and column;
- original grayscale value;
- value after `ToTensor` scaling;
- value after input normalization.

### FR-302 Pixel editing

In Playground mode, the student shall be able to paint, erase, and adjust pixel intensity.

### FR-303 Channel explanation

The application shall explain that the input has one channel because MNIST is grayscale.

### FR-304 Normalization toggle

The student shall be able to toggle input normalization for visualization and observe:

- original range;
- normalized range;
- histogram or compact distribution;
- the formula;
- a warning that model inference expects the training-time normalization.

### FR-305 Normalization formula

The application shall display:

```text
normalized pixel = (pixel − 0.1307) ÷ 0.3081
```

### FR-306 Image reset

The student shall be able to reset the drawing canvas to blank or restore the selected sample.

---

## 14. Functional Requirements: Convolution Laboratory

### FR-400 Tiny-image introduction

The Guided Mission shall teach convolution first using a small grid, such as `5 × 5`, rather than the complete `28 × 28` image.

### FR-401 Filter presets

The application shall include educational filter presets:

- vertical edge;
- horizontal edge;
- diagonal edge;
- blur;
- sharpen;
- custom filter.

Preset filters are teaching filters and shall be distinguished from learned CNN filters.

### FR-402 Sliding animation

The student shall be able to move a filter one step at a time across the image.

### FR-403 Calculation inspection

At each position, the application shall show:

- the covered input values;
- filter values;
- pairwise multiplication;
- sum of products;
- optional bias;
- resulting output cell.

### FR-404 Automatic run

The application shall provide Play, Pause, Step, Previous Step, and Restart.

### FR-405 Speed control

The student shall be able to control animation speed.

### FR-406 Parameter controls

The Playground shall support bounded changes to:

- input width and height for the miniature demonstration;
- input channels;
- output channels/filters;
- kernel size;
- stride;
- padding;
- bias on/off.

### FR-407 Output-shape calculation

The application shall calculate and explain:

```text
output = floor((input + 2 × padding − kernel) ÷ stride) + 1
```

For the advanced view, dilation may be mentioned but need not be configurable.

### FR-408 Parameter calculation

The application shall calculate:

```text
convolution weights =
output channels × input channels × kernel height × kernel width
```

If bias is enabled:

```text
total parameters = convolution weights + output channels
```

### FR-409 Multiple filters

The application shall demonstrate that:

- one filter produces one output feature map;
- 32 filters produce 32 output channels;
- each filter spans all input channels.

### FR-410 Feature-map selector

For layers with many channels, the student shall view a manageable subset and select a specific feature map.

### FR-411 Receptive-field explanation

The application shall provide an optional explanation showing how deeper neurons are influenced by larger regions of the original image.

---

## 15. Functional Requirements: Activation and Pooling

### FR-500 ReLU visualization

The application shall animate ReLU changing every negative input value to zero while retaining positive values.

### FR-501 ReLU toggle

The student shall be able to compare a feature map before and after ReLU.

### FR-502 ReLU calculation

The application shall show:

```text
ReLU(x) = max(0, x)
```

### FR-503 Max-pooling animation

The application shall animate a pooling window selecting the largest value from each region.

### FR-504 Pooling controls

The Playground shall allow bounded changes to:

- pooling window;
- stride;
- max versus average pooling.

### FR-505 Pooling effect

The application shall show that pooling:

- changes height and width;
- does not change the number of channels;
- has no trainable parameters;
- reduces the number of activation values.

### FR-506 Canonical example

The application shall demonstrate:

```text
32 × 28 × 28 → 32 × 14 × 14
64 × 14 × 14 → 64 × 7 × 7
```

---

## 16. Functional Requirements: Batch Normalization

### FR-600 Distinguish normalization types

The application shall provide an explicit comparison between input normalization and batch normalization.

### FR-601 Batch-normalization visualization

The application shall visualize a small batch of feature values:

- before normalization;
- centered and scaled;
- after learned scale and shift.

### FR-602 Training behavior

The explanation shall state that batch normalization uses current batch statistics while training.

### FR-603 Prediction behavior

The explanation shall state that batch normalization uses stored running statistics during validation, testing, and inference.

### FR-604 Learnable parameters

For `C` channels, the application shall show:

- `C` learned scale values;
- `C` learned shift values;
- `2C` trainable parameters.

Stored running mean and variance shall be identified as model state but not trainable parameters.

### FR-605 Toggle experiment

The training simulator shall allow batch normalization on/off for supported traces and shall explain that changing it changes the architecture and generated PyTorch.

---

## 17. Functional Requirements: Flatten, Dense, and Output

### FR-700 Flatten animation

The application shall animate feature maps being unrolled into one vector.

### FR-701 Canonical flatten calculation

The canonical model shall show:

```text
64 × 7 × 7 = 3,136 values
```

### FR-702 Dense-layer visualization

The dense layer shall use an abstracted visualization rather than drawing all 401,408 connections.

### FR-703 Dense parameter calculation

The application shall calculate:

```text
weights = input features × output features
biases = output features
total = weights + biases
```

For the canonical dense layer:

```text
3,136 × 128 + 128 = 401,536
```

### FR-704 Output logits

The final layer shall display ten raw scores, one for each digit.

### FR-705 Softmax

Softmax shall be presented as a display and inference transformation, not as a model layer used before `CrossEntropyLoss` during training.

### FR-706 Probability display

The student shall be able to toggle:

- raw logits;
- probabilities;
- top-three classes.

### FR-707 Confidence warning

Whenever confidence is shown, an accessible explanation shall state that confidence is not a guarantee of correctness.

---

## 18. Functional Requirements: Dropout

### FR-800 Dropout control

The Playground and Training Simulator shall allow dropout values from 0% through 70% in sensible increments.

### FR-801 Dropout visualization

The application shall show a manageable representation of the 128 dense neurons and randomly mark neurons inactive for a simulated training pass.

### FR-802 Canonical calculation

For 30% dropout, the application shall explain that approximately:

```text
128 × 0.30 = 38.4
```

or roughly 38 of 128 activations are dropped in a particular training pass.

### FR-803 Random behavior

Repeated simulated batches shall show different dropout masks.

### FR-804 Training-only behavior

The application shall clearly show dropout as active during training and inactive during validation, testing, and prediction.

### FR-805 Misconception prevention

The explanation shall state that dropout does not permanently remove neurons or make the saved model 30% smaller.

### FR-806 Trace comparison

For supported training traces, the student shall compare:

- no dropout;
- canonical 30% dropout;
- excessive dropout.

---

## 19. Functional Requirements: Training Simulator

### FR-900 Training-control center

The simulator shall show:

- selected architecture;
- training configuration;
- current epoch;
- current batch or illustrative batch;
- current prediction;
- correct label;
- loss;
- training accuracy;
- validation accuracy;
- training and validation curves.

### FR-901 Simulation disclosure

The simulator shall display a persistent but unobtrusive label:

> Training simulation—results are replayed from recorded experiments or generated for learning.

### FR-902 Configuration controls

The simulator shall support:

- optimizer;
- learning rate;
- epochs;
- batch size;
- dropout;
- input normalization;
- batch normalization;
- weight decay;
- architecture size when supported.

### FR-903 Canonical defaults

Defaults shall be:

- optimizer: Adam;
- learning rate: `0.001`;
- epochs: `5`;
- batch size: `128`;
- dropout: `0.30`;
- weight decay: `0.0001`;
- input normalization: enabled;
- batch normalization: enabled.

### FR-904 Simulation controls

The student shall be able to:

- start;
- pause;
- resume;
- step one illustrative batch;
- skip to end of epoch;
- restart;
- compare with a saved run.

### FR-905 Training-step order

The simulator shall teach the correct order:

1. Clear previous gradients.
2. Run the forward pass.
3. Calculate loss.
4. Run backpropagation.
5. Let the optimizer update parameters.

### FR-906 Weight-change abstraction

The application shall visually represent a small subset of weights changing. It shall state that the real model updates hundreds of thousands of parameters.

### FR-907 Epoch explanation

An epoch shall be explained as one complete pass through the training set.

### FR-908 Batch explanation

A batch shall be explained as a smaller group processed before one optimizer update.

### FR-909 Canonical batch count

The application shall show that 54,000 training examples with a batch size of 128 produce 422 batches per epoch, with the final batch smaller.

### FR-910 Recorded canonical trace

The canonical simulation shall reproduce the recorded results:

| Epoch | Training loss | Training accuracy | Validation loss | Validation accuracy |
|---:|---:|---:|---:|---:|
| 1 | 0.1462 | 95.44% | 0.0681 | 97.98% |
| 2 | 0.0530 | 98.43% | 0.0355 | 99.15% |
| 3 | 0.0409 | 98.76% | 0.0307 | 99.00% |
| 4 | 0.0331 | 98.99% | 0.0377 | 98.88% |
| 5 | 0.0280 | 99.14% | 0.0391 | 98.87% |

### FR-911 Best checkpoint

The simulator shall identify epoch 2 as the checkpoint with the highest validation accuracy.

### FR-912 Overfitting observation

The simulator shall prompt the student to recognize that training accuracy continues improving while validation performance declines after its best point.

---

## 20. Functional Requirements: Loss, Backpropagation, and Optimizer

### FR-1000 Loss

The application shall explain loss as a measure of how far the model’s score pattern is from the correct answer.

### FR-1001 Cross-entropy

Cross-entropy shall be introduced visually using:

- ten digit scores;
- the correct digit;
- low-loss and high-loss comparisons.

The detailed formula shall be optional.

### FR-1002 Backpropagation

Backpropagation shall be visualized as correction information traveling backward through the network to calculate how each parameter contributed to the error.

### FR-1003 Gradient

A gradient shall be explained as information about which direction a parameter should move to reduce loss.

### FR-1004 Optimizer placement

The optimizer shall be shown outside the forward architecture and inside the learning loop.

### FR-1005 Adam

Adam shall be the default optimizer and shall be explained as a strategy that adapts updates for different parameters using information from recent gradients.

### FR-1006 Optional SGD comparison

The Playground may compare:

- SGD;
- SGD with momentum;
- Adam.

If only Adam is implemented, the others may appear in explanatory content but not as active controls.

### FR-1007 Learning-rate landscape

The application shall include an animation showing:

- very low learning rate: small, slow steps;
- suitable learning rate: steady progress;
- excessive learning rate: overshooting;
- unstable learning rate: failure to settle.

### FR-1008 Distinguish optimizer and learning rate

The application shall explicitly state:

> The optimizer chooses how to update. The learning rate controls the size of the update.

### FR-1009 Weight decay

Weight decay shall be explained as a gentle pressure against excessively large weights. The application shall not imply that it directly deletes parameters.

---

## 21. Functional Requirements: Dataset Split and Evaluation

### FR-1100 Dataset visualization

The application shall represent:

- 54,000 training examples;
- 6,000 validation examples;
- 10,000 test examples.

### FR-1101 Dataset roles

The student shall complete an activity assigning:

- practice examples to training;
- practice exam examples to validation;
- sealed final exam examples to testing.

### FR-1102 Data leakage

Attempting to train on the test set shall trigger an explanation of why the final test would no longer be fair.

### FR-1103 Test result

The canonical result shall display:

- test loss: `0.0266`;
- test accuracy: `99.11%`;
- approximately 9,911 correct examples;
- approximately 89 incorrect examples.

### FR-1104 Per-class accuracy

The application shall provide the recorded per-class values:

| Digit | Accuracy |
|---:|---:|
| 0 | 99.59% |
| 1 | 99.82% |
| 2 | 99.61% |
| 3 | 99.60% |
| 4 | 99.90% |
| 5 | 99.22% |
| 6 | 98.54% |
| 7 | 97.67% |
| 8 | 99.08% |
| 9 | 98.02% |

### FR-1105 Confusion matrix

If exact confusion counts are embedded, the application shall provide a clickable confusion matrix. If exact counts are not embedded, it shall not invent them and may use a conceptual example clearly labeled as such.

### FR-1106 Mistake explorer

The application shall provide a curated collection of difficult or misclassified MNIST-style examples and explain that unusual writing can resemble another digit.

---

## 22. Functional Requirements: Prediction Laboratory

### FR-1200 Input methods

The Prediction Laboratory shall support:

- drawing a digit;
- selecting a bundled unseen sample;
- clearing the canvas;
- optionally applying controlled distortions.

### FR-1201 Drawing canvas

The drawing canvas shall support:

- mouse;
- touch;
- pointer devices;
- adjustable brush size;
- erase;
- clear;
- undo.

### FR-1202 Preprocessing preview

Before prediction, the application shall show:

- original drawing;
- grayscale conversion if needed;
- cropped bounding box;
- centered digit;
- resized `28 × 28` image;
- normalized input.

### FR-1203 Prediction execution

The student shall activate prediction explicitly.

### FR-1204 Prediction result

The result shall show:

- predicted digit;
- confidence;
- top-three digits;
- probabilities;
- selected early feature maps;
- prediction mode: genuine embedded inference or educational simulation.

### FR-1205 Empty input

If the canvas is effectively blank, the application shall ask the student to draw a digit rather than producing a misleading prediction.

### FR-1206 Out-of-distribution warning

If the drawing is extremely faint, off-center, contains several digits, or does not resemble the expected format, the application shall warn that it differs from the data used to train the model.

### FR-1207 Challenge mode

The student shall be able to distort a digit by:

- slight rotation;
- translation;
- thickness;
- erasure;
- noise.

The student can observe when and why the prediction changes.

### FR-1208 Training separation

The Prediction Laboratory shall not imply that the student’s simulated training session generated the embedded pretrained weights.

---

## 23. Functional Requirements: Genuine Embedded Inference

This section applies if genuine prediction is implemented.

### FR-1300 Embedded assets

All model weights, normalization values, class labels, and inference code shall be contained in the HTML file.

### FR-1301 Supported operations

The inference engine shall support:

- 2D convolution;
- inference-mode batch normalization;
- ReLU;
- max pooling;
- flatten;
- linear transformation;
- softmax for display.

### FR-1302 Numerical format

Weights may be embedded as compressed or encoded binary data. They shall decode in memory without creating an external file.

### FR-1303 Model integrity

The file shall include lightweight metadata or a checksum allowing the implementation to detect corrupt or incomplete embedded weights.

### FR-1304 Prediction consistency

For a fixed input and weights, inference shall be deterministic.

### FR-1305 Performance

Prediction should complete within two seconds on a typical current desktop or tablet browser. During calculation, the application shall show visible progress if execution exceeds 250 milliseconds.

### FR-1306 Main-thread responsiveness

If feasible within a single file, inference should run in an inline Web Worker created from a Blob. If it runs on the main thread, the UI shall yield between major layers to avoid appearing frozen.

### FR-1307 Validation

The embedded inference implementation shall be tested against PyTorch reference logits for a fixed set of inputs within a defined numerical tolerance.

---

## 24. Functional Requirements: Training Trace Engine

### FR-1400 Trace metadata

Each precomputed trace shall contain:

- unique ID;
- architecture ID;
- optimizer;
- learning rate;
- epochs;
- batch size;
- dropout;
- weight decay;
- normalization flags;
- source classification: recorded or simulated;
- epoch metrics;
- optional representative batch events;
- explanation tags.

### FR-1401 Exact trace match

When the student selects a configuration matching a recorded trace, the application shall replay its exact recorded values.

### FR-1402 Unsupported combination

When no exact trace exists, the application shall:

- label the outcome as simulated;
- avoid false precision;
- explain the expected qualitative behavior;
- permit returning to the nearest recorded comparison.

### FR-1403 Comparison

The student shall be able to compare two runs using:

- loss curves;
- accuracy curves;
- best epoch;
- relative speed description;
- overfitting indicator;
- explanation of the changed variable.

### FR-1404 One-variable guidance

The application shall encourage changing one variable at a time.

---

## 25. Functional Requirements: Parameter Experimentation

### FR-1500 Hyperparameter panel

The Playground shall provide a dedicated hyperparameter panel.

### FR-1501 Learning rate

Supported learning-rate values shall include:

- `0.01`;
- `0.001`;
- `0.0001`.

Additional values may be allowed if trace behavior is properly labeled.

### FR-1502 Batch size

Supported batch sizes shall include:

- 1;
- 16;
- 32;
- 64;
- 128.

### FR-1503 Epoch count

The student shall be able to simulate 1–10 epochs.

### FR-1504 Dropout

Supported values shall include:

- 0%;
- 10%;
- 30%;
- 50%;
- 70%.

### FR-1505 Experiment impact

Each changed value shall identify what it can affect:

- learning speed;
- stability;
- overfitting;
- computation;
- memory;
- parameter count;
- inference behavior.

### FR-1506 Architectural parameter panel

Supported architecture changes shall include bounded values for:

- convolution filters;
- kernel size;
- stride;
- padding;
- pooling size;
- dense neurons;
- dropout probability.

### FR-1507 Live recalculation

Changes shall update calculations without requiring a page reload.

### FR-1508 Before/after comparison

The student shall see the previous and current values when a change affects tensor shape or parameter count.

---

## 26. Functional Requirements: PyTorch Code Studio

### FR-1600 Code generation

The application shall generate valid PyTorch code for a valid supported architecture.

### FR-1601 Code sections

The studio shall provide:

- model definition;
- data transforms;
- dataset and DataLoader;
- loss and optimizer;
- training-loop skeleton;
- validation-loop skeleton;
- test evaluation;
- single-image prediction.

### FR-1602 Code views

The student shall switch between:

- Beginner code with detailed comments;
- Clean code with concise comments.

### FR-1603 Shape comments

Beginner code shall include input/output shape comments beside architecture layers.

### FR-1604 Architecture synchronization

Changing the visual architecture shall regenerate the model code.

### FR-1605 Hyperparameter synchronization

Changing a supported hyperparameter shall regenerate the configuration and optimizer code.

### FR-1606 Bidirectional highlighting

- Selecting a visual block shall highlight its code.
- Selecting a generated code region shall highlight its visual block.

### FR-1607 Clickable code concepts

Recognized tokens such as `Conv2d`, `BatchNorm2d`, `ReLU`, `Dropout`, `Adam`, and `lr` shall open the universal concept explanation.

### FR-1608 Code validation

Code shall not be offered as runnable when the architecture is invalid.

### FR-1609 Copy and download

The application shall support:

- Copy current section;
- Copy all code;
- Download `.py`.

The download shall be created in the browser without a backend.

### FR-1610 Canonical model code

The default generated code shall use the corrected `32/64` channel architecture, not the inconsistent source found in the analyzed notebook.

---

## 27. Functional Requirements: Challenges and Feedback

### FR-1700 Challenge types

The Guided Mission shall include:

- predict a convolution output;
- identify the number of channels;
- select the ReLU output;
- select the max-pooling output;
- calculate a flattened size;
- repair a shape mismatch;
- choose an appropriate dataset role;
- identify excessive learning-rate behavior;
- identify possible overfitting;
- predict whether dropout is active during inference.

### FR-1701 Feedback

Every challenge shall provide:

- immediate result;
- explanation;
- optional retry;
- “show me” animation;
- related concept link.

### FR-1702 No punitive scoring

Wrong answers shall not block progress after the student reviews the explanation.

### FR-1703 Completion summary

At the end of the Guided Mission, the application shall show:

- concepts explored;
- challenges attempted;
- concepts worth revisiting;
- current model parameter count;
- final prediction activity;
- entry to Playground;
- option to restart.

### FR-1704 Optional achievements

The application may award local-only achievements such as:

- Pixel Explorer;
- Filter Finder;
- Shape Tracker;
- Pooling Pro;
- Parameter Detective;
- Model Trainer;
- Overfitting Spotter;
- CNN Architect.

Achievements shall reward learning actions, not time pressure.

---

## 28. Functional Requirements: Local Persistence

### FR-1800 No account

The application shall not require or offer an account in the experimental version.

### FR-1801 Local storage

The application may use browser `localStorage` to retain:

- mission progress;
- concept-viewed state;
- challenge results;
- accessibility settings;
- Playground architecture;
- saved comparison run;
- achievements.

### FR-1802 Storage disclosure

Settings shall explain that progress is stored only in the current browser.

### FR-1803 Clear local data

The student shall be able to clear all locally stored application data.

### FR-1804 Export/import project

The Playground should support exporting and importing a small JSON project containing:

- architecture;
- hyperparameters;
- selected input;
- schema version.

Imported data shall be validated before use.

---

## 29. Functional Requirements: Accessibility

### FR-1900 Keyboard access

All primary functions shall be operable by keyboard.

### FR-1901 Focus visibility

Keyboard focus shall be visually obvious.

### FR-1902 Semantic controls

Interactive elements shall use semantic HTML controls where possible.

### FR-1903 Screen-reader labels

Canvas- or SVG-based visualizations shall have accessible summaries and alternative table/text representations.

### FR-1904 Reduced motion

The application shall honor `prefers-reduced-motion` and provide a manual reduced-motion setting.

### FR-1905 Animation alternatives

In reduced-motion mode, animations shall become:

- step-based transitions;
- static before/after comparisons;
- numeric tables.

### FR-1906 Text readability

- Base text should be at least 16 CSS pixels.
- Critical instructional text should avoid dense paragraphs.
- Technical vocabulary shall be introduced consistently.
- The application shall use a system font stack.

### FR-1907 Color contrast

Text and controls shall meet WCAG AA contrast targets.

### FR-1908 Non-color cues

Correctness, errors, channels, and layer states shall use text, icons, outlines, or patterns in addition to color.

### FR-1909 Touch targets

Interactive targets shall be at least approximately 44 × 44 CSS pixels where practical.

---

## 30. Functional Requirements: Help and Safety

### FR-2000 Help

The application shall provide:

- How to use this screen;
- Glossary;
- Keyboard controls;
- Reset instructions;
- Training simulation explanation;
- Prediction mode explanation.

### FR-2001 Error handling

Errors shall be stated in plain language and include a recovery action.

### FR-2002 No external communication

The application shall not upload drawings, progress, or generated code.

### FR-2003 No personal data

The application shall not request a name, email address, age, school, or location.

### FR-2004 Safe content

All bundled examples and educational copy shall be suitable for children.

---

## 31. Calculations and Validation Rules

### 31.1 Convolution output size

For each spatial dimension:

```text
output =
floor((input + 2 × padding − dilation × (kernel − 1) − 1) ÷ stride) + 1
```

The beginner view may use the simplified dilation-1 version.

### 31.2 Convolution parameters

```text
weights =
output channels × input channels × kernel height × kernel width

biases =
output channels, when bias is enabled
```

### 31.3 Batch-normalization trainable parameters

```text
2 × channels
```

### 31.4 Pooling parameters

```text
0 trainable parameters
```

### 31.5 Flatten

```text
flattened features = channels × height × width
```

### 31.6 Linear-layer parameters

```text
weights = input features × output features
biases = output features
```

### 31.7 Architecture validity

The validator shall check:

- positive integer dimensions;
- supported kernel sizes;
- valid stride;
- nonnegative padding;
- positive convolution output dimensions;
- compatible channel flow;
- pooling output dimensions;
- required flatten before linear input, unless automatically implied;
- linear input compatibility;
- final output size of ten for MNIST classification;
- sensible dropout range `[0,1)`;
- batch normalization channel compatibility.

### 31.8 Canonical parameter reconciliation

The displayed canonical total must equal the sum of its layer totals:

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

The application shall contain an internal startup assertion for this total.

---

## 32. Embedded Data Requirements

### 32.1 Bundled examples

The HTML file shall include a small curated set of digit examples sufficient for:

- pixel inspection;
- convolution demonstrations;
- known correct predictions;
- difficult examples;
- misclassification discussions;
- test challenges.

### 32.2 Data representation

Images may be stored as:

- compact arrays;
- run-length encoded pixels;
- compressed base64 binary;
- programmatically generated educational grids.

### 32.3 Full MNIST exclusion

The full MNIST dataset shall not be embedded in the first prototype because it would unnecessarily enlarge the portable file.

### 32.4 Provenance

The About panel shall identify MNIST as the educational dataset and include a short dataset description. Any licensing or attribution required by bundled assets shall be included within the HTML.

---

## 33. Single-File Technical Constraints

### 33.1 Required file

The complete runtime application shall consist of:

```text
cnn-learning-lab.html
```

No adjacent runtime files shall be required.

### 33.2 Prohibited runtime dependencies

The application shall not require:

- npm;
- package installation;
- a bundler;
- a local server;
- Python;
- PyTorch at runtime;
- external JavaScript libraries;
- external CSS;
- external model downloads.

### 33.3 Permitted browser APIs

The implementation may use:

- Canvas 2D;
- SVG;
- Web Workers created from in-file Blob URLs;
- typed arrays;
- localStorage;
- Blob-based download;
- FileReader;
- Pointer Events;
- standard DOM APIs.

### 33.4 File size

The preferred target is under 8 MB. A larger file may be accepted if genuine embedded inference weights require it, but the implementation shall document the size contribution.

### 33.5 Security restrictions

Because the file may open using the `file://` scheme:

- it shall avoid functionality blocked for local files;
- it shall not depend on `fetch()` for its own embedded assets;
- it shall not assume service-worker availability;
- it shall not require cross-origin isolation.

### 33.6 Content Security

The file shall not evaluate imported project JSON as code. Generated PyTorch is displayed or downloaded as text and shall never be executed in the browser.

---

## 34. Performance Requirements

### PR-001 Launch

The initial interface should become usable within three seconds on a typical current desktop browser.

### PR-002 Interaction

Ordinary parameter and shape calculations should update within 100 milliseconds.

### PR-003 Animation

Animations should target smooth interaction while offering reduced motion.

### PR-004 Memory

The application shall avoid retaining unnecessary copies of decoded model weights or feature maps.

### PR-005 Long work

Inference or heavy feature-map calculations shall not leave the interface apparently frozen.

### PR-006 Drawing

The drawing canvas shall respond without perceptible delay.

---

## 35. Browser Compatibility

The prototype should support current major desktop browsers:

- Chrome;
- Edge;
- Firefox;
- Safari.

Tablet browsers should be supported where Pointer Events, Canvas, and required typed-array capabilities are available.

Internet Explorer is not supported.

The specification does not require identical animations across browsers, but calculations and explanations must remain consistent.

---

## 36. State Model

The application shall maintain separate logical state for:

### 36.1 Guided Mission state

- current mission;
- current step;
- completed steps;
- challenge attempts;
- explanations opened;
- reduced-motion choice.

### 36.2 Playground state

- architecture graph;
- layer parameters;
- hyperparameters;
- selected digit;
- drawing pixels;
- experiment comparison;
- generated code mode.

### 36.3 Runtime state

- current animation;
- current tensor;
- selected layer;
- selected feature map;
- explanation panel;
- prediction status.

### 36.4 Persistent schema

Persistent state shall include a schema version. Incompatible old state shall be migrated or reset safely with an explanation.

---

## 37. Suggested Internal Data Models

### 37.1 Layer model

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

### 37.2 Architecture model

```javascript
{
  id,
  name,
  layers,
  inputShape,
  outputShape,
  totalTrainableParameters,
  valid,
  version
}
```

### 37.3 Training configuration

```javascript
{
  optimizer,
  learningRate,
  weightDecay,
  batchSize,
  epochs,
  inputNormalization,
  batchNormalization,
  dropout
}
```

### 37.4 Prediction result

```javascript
{
  predictedClass,
  confidence,
  logits,
  probabilities,
  topClasses,
  featureMapPreviews,
  predictionMode,
  warnings
}
```

---

## 38. Analytics for the Experimental Prototype

The default single-file prototype shall not transmit analytics.

Optional local-only diagnostic counters may include:

- mission completion;
- concepts viewed;
- challenges attempted;
- architecture errors encountered;
- Playground use.

If future telemetry is introduced, it shall require a separate product decision, privacy review, and explicit disclosure. It is not part of this specification.

---

## 39. Acceptance Criteria

### AC-001 Portability

Given the application HTML file has been downloaded,  
when a student opens it in a supported browser without an internet connection,  
then the complete learning application shall launch without requesting any external runtime resource.

### AC-002 Complete architecture

Given the Architecture Explorer is open,  
when the student selects the complete model view,  
then every canonical layer, tensor shape, and the total of 468,010 trainable parameters shall be displayed.

### AC-003 Universal explanations

Given a technical concept is visible as an interactive element,  
when the student selects it,  
then the application shall open the standardized explanation panel with a definition, purpose, visual explanation, current calculation where applicable, PyTorch representation, and common misconception.

### AC-004 Shape calculation

Given a valid architecture is displayed,  
when the student changes a supported convolution, pooling, or channel parameter,  
then all affected downstream shapes shall recalculate immediately.

### AC-005 Invalid architecture

Given a change creates incompatible tensor dimensions,  
when validation completes,  
then the affected connection shall be marked invalid, the actual and expected shapes shall be shown, and prediction and code download shall be disabled until the mismatch is corrected.

### AC-006 Convolution demonstration

Given the convolution laboratory is open,  
when the student advances one filter position,  
then the application shall show the covered cells, pairwise products, sum, and output cell.

### AC-007 Multiple filters

Given a convolution has 32 output filters,  
when the student inspects its output,  
then the application shall explain and represent 32 feature-map channels without attempting to display all maps at full size simultaneously.

### AC-008 Dropout state

Given dropout is set to 30%,  
when the student switches between training and prediction modes,  
then dropout shall be visually active only in training mode and inactive in prediction mode.

### AC-009 Normalization distinction

Given the student selects normalization,  
when the comparison view opens,  
then input normalization and batch normalization shall be shown as different operations with different locations and behaviors.

### AC-010 Training disclosure

Given the training simulator is running,  
when results are displayed,  
then the interface shall state whether they are recorded experiment results or educational simulation results.

### AC-011 Canonical trace

Given the canonical training settings are selected,  
when the simulation completes,  
then the five recorded epoch results and epoch-2 best checkpoint shall match the values in this specification.

### AC-012 Learning-rate experiment

Given the student compares supported learning rates,  
when the visual explanation runs,  
then the application shall distinguish slow, appropriate, and unstable update behavior without claiming unsupported exact results.

### AC-013 Dataset roles

Given the dataset activity is open,  
when the student attempts to use test examples for training,  
then the application shall explain test-set contamination and provide a correction.

### AC-014 Prediction

Given the student has drawn a nonblank MNIST-style digit,  
when Predict is selected,  
then the application shall display a prediction, confidence, top-three classes, and whether the result is genuine embedded inference or simulation.

### AC-015 Blank drawing

Given the prediction canvas is blank,  
when Predict is selected,  
then the application shall ask the student to draw a digit and shall not show a misleading class prediction.

### AC-016 Code synchronization

Given a valid visual architecture,  
when an architecture or hyperparameter value changes,  
then the generated PyTorch shall update to represent the current configuration.

### AC-017 Code highlighting

Given the Code Studio is open,  
when a student selects a layer or related code section,  
then its visual and code representations shall be highlighted together.

### AC-018 Reduced motion

Given reduced motion is enabled,  
when the student runs a visualization,  
then the application shall provide step-based or before/after alternatives without requiring animated motion.

### AC-019 Local privacy

Given the student uses the application,  
when they draw digits, complete challenges, or generate code,  
then none of that data shall be transmitted from the browser.

### AC-020 Resume

Given a student previously used the application in the same browser and retained local data,  
when the file is reopened,  
then the application shall offer to resume the Guided Mission.

---

## 40. Verification and Test Plan

### 40.1 Mathematical unit tests

The delivered HTML shall include an optional internal self-test routine covering:

- convolution output sizes;
- pooling output sizes;
- convolution parameter counts;
- batch-normalization parameter counts;
- linear parameter counts;
- canonical shape sequence;
- canonical total of 468,010;
- softmax probabilities summing approximately to one;
- architecture mismatch detection.

### 40.2 Code-generation tests

Test:

- canonical model code;
- smaller valid model;
- changed filter count;
- changed dropout;
- changed learning rate;
- invalid flatten/dense combination;
- copy and `.py` download.

Generated code should be extracted during development and executed in a PyTorch environment as an offline verification step, even though PyTorch is not required by the finished HTML.

### 40.3 Inference tests

If embedded inference is implemented:

- compare JavaScript logits with PyTorch reference logits;
- test at least one sample of every digit;
- test blank input;
- test extremely faint input;
- test deterministic repeated prediction;
- test numerical stability.

### 40.4 Usability tests

Observe representative students completing the Guided Mission without verbal help. Record:

- points of confusion;
- time to completion;
- concepts repeatedly reopened;
- challenge error patterns;
- whether students distinguish optimizer from network layer;
- whether students distinguish channel from image count;
- whether students understand training versus inference.

### 40.5 Portability tests

Test the file:

- after disconnecting from the network;
- from a normal folder;
- from a USB drive where permitted;
- using the `file://` scheme;
- in each supported browser;
- after renaming the file.

---

## 41. MVP Prioritization

### 41.1 Must have

- Single self-contained offline HTML.
- Guided Mission and Playground.
- Correct canonical architecture.
- Holistic architecture visualization.
- Incremental builder.
- Universal concept explanation system.
- Pixel laboratory.
- Convolution, ReLU, and pooling interactions.
- Shape and parameter calculations.
- Normalization, batch normalization, dropout, optimizer, and learning-rate explanations.
- Simulated canonical training.
- Dataset split and overfitting activities.
- Drawing canvas.
- Prediction clearly identified as genuine or simulated.
- PyTorch code generation.
- Local progress.
- Keyboard and reduced-motion support.

### 41.2 Should have

- Genuine pure-JavaScript inference with embedded weights.
- Feature-map inspection.
- Recorded comparison traces.
- Model repair challenge.
- JSON project export/import.
- Achievements.

### 41.3 Could have

- Optional sound effects.
- SGD comparison.
- Average pooling comparison.
- Distortion challenge.
- Confusion matrix.
- Additional advanced explanations.

### 41.4 Will not have in the prototype

- Real browser training.
- Arbitrary datasets.
- Accounts.
- Backend.
- External libraries at runtime.
- Teacher dashboard.

---

## 42. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Too many concepts for 30 minutes | Cognitive overload | Layered explanations and optional deep dives |
| Single file becomes large | Slow opening and sharing | Curated samples, compressed weights, target size budget |
| Pure-JavaScript inference is slow | Poor interaction | Typed arrays, one-image batches, inline worker, progress UI |
| Training simulation is mistaken for real training | Mislearning | Persistent labeling and recorded/simulated distinction |
| Architecture view becomes visually crowded | Student confusion | Grouped blocks, zoom, progressive expansion |
| Dense-layer connections overwhelm display | Visual noise | Abstract connection bundles and sampled neurons |
| Every item being clickable creates inconsistent explanations | Fragmented experience | Central concept registry and standardized panel |
| Drawing differs from MNIST | Incorrect predictions | Visible preprocessing and out-of-distribution warnings |
| Current notebook’s broken architecture is copied | Runtime mismatch | Canonical shape assertions and generated-code validation |
| Offline browser restrictions | Broken assets or workers | Embed everything; do not self-fetch; provide worker fallback |
| Student changes too many variables | Unclear cause and effect | One-variable experiment guidance and before/after comparison |

---

## 43. Implementation Recommendation

Use plain semantic HTML, embedded CSS, and vanilla JavaScript modules organized inside the file using clear code regions or in-file classes. Use SVG for architecture connections and diagrams, Canvas for pixel drawing and feature-map rendering, and ordinary DOM controls for accessible interactions.

Recommended internal components:

- application state manager;
- architecture engine;
- shape and parameter calculator;
- validator;
- concept registry;
- explanation-panel controller;
- guided-mission controller;
- animation controller;
- training-trace engine;
- drawing and preprocessing engine;
- optional inference engine;
- PyTorch code generator;
- persistence manager;
- accessibility manager;
- self-test runner.

The source may remain one HTML file while still being internally modular. Clear comment regions and isolated classes/functions are essential for maintainability.

---

## 44. Remaining Product Decisions

These decisions are not blockers for the functional specification but must be settled before final visual design:

1. Visual theme:
   - science laboratory;
   - digit detective factory;
   - friendly technical workspace.

2. Prediction implementation:
   - genuine embedded pretrained inference for the first build; or
   - clearly labeled simulation followed by genuine inference in the next iteration.

3. File-size ceiling:
   - strict lightweight target; or
   - acceptance of a larger file to embed real model weights.

4. Sound:
   - no sound;
   - optional subtle feedback, muted by default.

5. Saved project support:
   - localStorage only; or
   - localStorage plus JSON export/import.

Recommended decisions are:

- friendly technical workspace with a light “digit detective” narrative;
- genuine embedded inference;
- accept a file up to approximately 8 MB;
- no sound in the first prototype;
- localStorage plus JSON export/import if implementation time permits.

---

## 45. Definition of Done

The experimental application is functionally complete when:

- one HTML file opens offline without installation;
- a student can complete the Guided Mission independently;
- the complete corrected CNN is visible and inspectable;
- every displayed technical concept opens a standardized explanation;
- the student can incrementally build and repair the architecture;
- all supported parameter changes recalculate shapes and parameters correctly;
- normalization, batch normalization, dropout, optimizer, learning rate, loss, backpropagation, validation, testing, and overfitting are interactively explained;
- simulated training is clearly identified and produces the canonical recorded trace;
- an unseen digit can be drawn and predicted with its prediction mode disclosed;
- valid PyTorch code is generated from the visual architecture;
- invalid architectures cannot masquerade as runnable code;
- progress is retained locally;
- the experience works with keyboard controls and reduced motion;
- no personal or learning data leaves the browser;
- mathematical self-tests and portability checks pass.

