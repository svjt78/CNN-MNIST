"""
DEV-ONLY SCRIPT. Not part of the shipped runtime artifact.

Reads the trained canonical model (dev/artifacts/canonical_model_final.pt), and produces:
  - dev/artifacts/weights.bin        (raw float32 little-endian buffer, canonical tensor order)
  - dev/artifacts/weights_base64.txt (base64 of the above, for embedding in the HTML)
  - dev/artifacts/weights_meta.json  (tensor names/shapes/offsets/checksum/format version)
  - dev/artifacts/samples.bin        (raw uint8 buffer of curated MNIST TEST images, 784 bytes each)
  - dev/artifacts/samples_base64.txt (base64 of the above)
  - dev/artifacts/samples_meta.json  (label, source index, correctness/difficulty tag per sample)
  - dev/artifacts/reference_logits.json (PyTorch reference logits/probabilities for each sample,
    used to validate the JavaScript inference engine within a numerical tolerance)
"""
import base64
import json
import struct

import numpy as np
import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as T

MNIST_MEAN = 0.1307
MNIST_STD = 0.3081


class ConvBNReLU(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv = nn.Conv2d(in_ch, out_ch, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn = nn.BatchNorm2d(out_ch)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        return self.relu(self.bn(self.conv(x)))


class CanonicalCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.block1 = ConvBNReLU(1, 32)
        self.block2 = ConvBNReLU(32, 32)
        self.pool1 = nn.MaxPool2d(2, 2)
        self.block3 = ConvBNReLU(32, 64)
        self.block4 = ConvBNReLU(64, 64)
        self.pool2 = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(64 * 7 * 7, 128)
        self.relu_fc = nn.ReLU(inplace=True)
        self.dropout = nn.Dropout(0.30)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = self.block1(x)
        x = self.block2(x)
        x = self.pool1(x)
        x = self.block3(x)
        x = self.block4(x)
        x = self.pool2(x)
        x = torch.flatten(x, 1)
        x = self.fc1(x)
        x = self.relu_fc(x)
        x = self.dropout(x)
        x = self.fc2(x)
        return x


def fnv1a(data: bytes) -> int:
    h = 0x811c9dc5
    for b in data:
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h


def main():
    model = CanonicalCNN()
    sd = torch.load("dev/artifacts/canonical_model_final.pt", map_location="cpu")
    model.load_state_dict(sd)
    model.eval()

    # ---- 1. Flatten weights into one canonical-order float32 buffer ----
    plan = [
        ("conv1.weight", sd["block1.conv.weight"]),
        ("bn1.gamma", sd["block1.bn.weight"]), ("bn1.beta", sd["block1.bn.bias"]),
        ("bn1.running_mean", sd["block1.bn.running_mean"]), ("bn1.running_var", sd["block1.bn.running_var"]),

        ("conv2.weight", sd["block2.conv.weight"]),
        ("bn2.gamma", sd["block2.bn.weight"]), ("bn2.beta", sd["block2.bn.bias"]),
        ("bn2.running_mean", sd["block2.bn.running_mean"]), ("bn2.running_var", sd["block2.bn.running_var"]),

        ("conv3.weight", sd["block3.conv.weight"]),
        ("bn3.gamma", sd["block3.bn.weight"]), ("bn3.beta", sd["block3.bn.bias"]),
        ("bn3.running_mean", sd["block3.bn.running_mean"]), ("bn3.running_var", sd["block3.bn.running_var"]),

        ("conv4.weight", sd["block4.conv.weight"]),
        ("bn4.gamma", sd["block4.bn.weight"]), ("bn4.beta", sd["block4.bn.bias"]),
        ("bn4.running_mean", sd["block4.bn.running_mean"]), ("bn4.running_var", sd["block4.bn.running_var"]),

        ("fc1.weight", sd["fc1.weight"]), ("fc1.bias", sd["fc1.bias"]),
        ("fc2.weight", sd["fc2.weight"]), ("fc2.bias", sd["fc2.bias"]),
    ]

    buf = bytearray()
    tensor_meta = []
    offset = 0
    for name, tensor in plan:
        arr = tensor.detach().cpu().numpy().astype("<f4")
        flat = arr.reshape(-1)
        buf += flat.tobytes()
        tensor_meta.append({
            "name": name,
            "shape": list(arr.shape),
            "offsetFloats": offset,
            "countFloats": int(flat.size),
        })
        offset += int(flat.size)

    weights_bytes = bytes(buf)
    checksum = fnv1a(weights_bytes)

    with open("dev/artifacts/weights.bin", "wb") as f:
        f.write(weights_bytes)
    with open("dev/artifacts/weights_base64.txt", "w") as f:
        f.write(base64.b64encode(weights_bytes).decode("ascii"))

    meta = {
        "formatVersion": 1,
        "dtype": "float32",
        "byteOrder": "little",
        "totalFloats": offset,
        "totalBytes": len(weights_bytes),
        "checksumFNV1a": checksum,
        "trainableParameterCount": 468010,
        "tensors": tensor_meta,
        "architectureId": "canonical-32-64",
        "trainedWith": {
            "optimizer": "adam", "learningRate": 0.001, "epochs": 5, "batchSize": 128,
            "dropout": 0.30, "weightDecay": 0.0001, "seed": 42
        },
    }
    with open("dev/artifacts/weights_meta.json", "w") as f:
        json.dump(meta, f, indent=2)

    print(f"Weights: {len(weights_bytes)} bytes ({offset} floats), checksum=0x{checksum:08x}")

    # ---- 2. Curated bundled sample digits from the TEST set (genuinely unseen by training) ----
    transform = T.Compose([T.ToTensor(), T.Normalize((MNIST_MEAN,), (MNIST_STD,))])
    test_set = torchvision.datasets.MNIST(root="/tmp/mnist_data", train=False, download=True, transform=transform)
    raw_test = torchvision.datasets.MNIST(root="/tmp/mnist_data", train=False, download=True, transform=None)

    # Find one confidently-correct example per digit, plus a couple of harder/misclassified ones.
    chosen = {}
    hard_examples = []
    with torch.no_grad():
        for idx in range(len(test_set)):
            image, label = test_set[idx]
            logits = model(image.unsqueeze(0))
            probs = torch.softmax(logits, dim=1)[0]
            pred = int(probs.argmax())
            conf = float(probs[pred])
            if label not in chosen and pred == label and conf > 0.99:
                chosen[label] = idx
            elif pred != label and len(hard_examples) < 4:
                hard_examples.append(idx)
            if len(chosen) == 10 and len(hard_examples) >= 4:
                break

    sample_indices = [chosen[d] for d in range(10)] + hard_examples
    sample_buf = bytearray()
    sample_meta = []
    reference = []

    with torch.no_grad():
        for i, idx in enumerate(sample_indices):
            pil_img, true_label = raw_test[idx]
            arr = np.array(pil_img, dtype=np.uint8)  # 28x28, 0-255
            sample_buf += arr.tobytes()

            image_t, _ = test_set[idx]
            logits = model(image_t.unsqueeze(0))
            probs = torch.softmax(logits, dim=1)[0]
            pred = int(probs.argmax())
            is_hard = idx in hard_examples

            sample_meta.append({
                "index": i, "sourceTestIndex": idx, "trueLabel": int(true_label),
                "tag": "difficult" if is_hard else "typical",
                "kind": "recorded",
            })
            reference.append({
                "index": i, "trueLabel": int(true_label), "predictedLabel": pred,
                "logits": [round(float(x), 6) for x in logits[0].tolist()],
                "probabilities": [round(float(x), 6) for x in probs.tolist()],
            })

    with open("dev/artifacts/samples.bin", "wb") as f:
        f.write(bytes(sample_buf))
    with open("dev/artifacts/samples_base64.txt", "w") as f:
        f.write(base64.b64encode(bytes(sample_buf)).decode("ascii"))
    with open("dev/artifacts/samples_meta.json", "w") as f:
        json.dump({"count": len(sample_meta), "imageSize": 28, "samples": sample_meta}, f, indent=2)
    with open("dev/artifacts/reference_logits.json", "w") as f:
        json.dump(reference, f, indent=2)

    print(f"Samples: {len(sample_indices)} images ({len(sample_buf)} bytes)")
    for r in reference:
        print(f"  sample {r['index']}: true={r['trueLabel']} pred={r['predictedLabel']}")


if __name__ == "__main__":
    main()
