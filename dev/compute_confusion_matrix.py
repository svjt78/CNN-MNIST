"""
DEV-ONLY SCRIPT. Not part of the shipped runtime artifact.

Loads the already-trained canonical model checkpoint (no retraining) and evaluates it
on the real MNIST test set once to produce a genuine 10x10 confusion matrix, so the
app can show real measured counts instead of an illustrative-only pattern.

Writes dev/artifacts/confusion_matrix.json:
  { "matrix": [[...10 ints...] x 10], "correct": N, "total": 10000 }

matrix[true_label][predicted_label] = count of test examples with that true/predicted pair.
"""
import json

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


def main():
    model = CanonicalCNN()
    sd = torch.load("dev/artifacts/canonical_model_final.pt", map_location="cpu")
    model.load_state_dict(sd)
    model.eval()

    transform = T.Compose([T.ToTensor(), T.Normalize((MNIST_MEAN,), (MNIST_STD,))])
    test_set = torchvision.datasets.MNIST(root="/tmp/mnist_data", train=False, download=True, transform=transform)
    loader = torch.utils.data.DataLoader(test_set, batch_size=256, shuffle=False)

    matrix = [[0] * 10 for _ in range(10)]
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in loader:
            preds = model(images).argmax(dim=1)
            for t, p in zip(labels.tolist(), preds.tolist()):
                matrix[t][p] += 1
                if t == p:
                    correct += 1
                total += 1

    assert total == 10000, f"Expected 10000 test images, got {total}"
    result = {"matrix": matrix, "correct": correct, "total": total}
    with open("dev/artifacts/confusion_matrix.json", "w") as f:
        json.dump(result, f, indent=2)

    print(f"Confusion matrix computed: {correct}/{total} correct ({100.0*correct/total:.2f}%)")
    print("Saved: dev/artifacts/confusion_matrix.json")


if __name__ == "__main__":
    main()
