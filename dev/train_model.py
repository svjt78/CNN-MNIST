"""
DEV-ONLY SCRIPT. Not part of the shipped runtime artifact (cnn-learning-lab.html).

Trains the canonical CNN Learning Lab architecture on real MNIST data using the
canonical hyperparameters specified in CNN_Learning_Lab_Functional_Specification.md,
then saves the trained state_dict for export by export_weights.py.

Canonical architecture:
  Conv(1->32,k3,s1,p1,bias=False) + BN(32) + ReLU
  Conv(32->32,k3,s1,p1,bias=False) + BN(32) + ReLU
  MaxPool(2,2)
  Conv(32->64,k3,s1,p1,bias=False) + BN(64) + ReLU
  Conv(64->64,k3,s1,p1,bias=False) + BN(64) + ReLU
  MaxPool(2,2)
  Flatten -> Linear(3136,128) -> ReLU -> Dropout(0.3) -> Linear(128,10)

Input normalization (mean 0.1307, std 0.3081) is applied as a data transform,
not as a model layer, matching the spec's separation of forward path stages.
"""
import json
import random
import time

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Subset
import torchvision
import torchvision.transforms as T

SEED = 42
MNIST_MEAN = 0.1307
MNIST_STD = 0.3081

torch.manual_seed(SEED)
np.random.seed(SEED)
random.seed(SEED)


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


def count_params(model):
    return sum(p.numel() for p in model.parameters() if p.requires_grad)


def main():
    transform = T.Compose([T.ToTensor(), T.Normalize((MNIST_MEAN,), (MNIST_STD,))])

    full_train = torchvision.datasets.MNIST(root="/tmp/mnist_data", train=True, download=True, transform=transform)
    test_set = torchvision.datasets.MNIST(root="/tmp/mnist_data", train=False, download=True, transform=transform)

    assert len(full_train) == 60000
    assert len(test_set) == 10000

    g = torch.Generator().manual_seed(SEED)
    perm = torch.randperm(len(full_train), generator=g).tolist()
    train_idx = perm[:54000]
    val_idx = perm[54000:60000]
    train_set = Subset(full_train, train_idx)
    val_set = Subset(full_train, val_idx)

    batch_size = 128
    train_loader = DataLoader(train_set, batch_size=batch_size, shuffle=True, generator=torch.Generator().manual_seed(SEED))
    val_loader = DataLoader(val_set, batch_size=256, shuffle=False)
    test_loader = DataLoader(test_set, batch_size=256, shuffle=False)

    device = torch.device("cpu")
    model = CanonicalCNN().to(device)

    total_params = count_params(model)
    print(f"Total trainable parameters: {total_params}")
    assert total_params == 468010, f"Expected 468010 params, got {total_params}"

    optimizer = torch.optim.Adam(model.parameters(), lr=0.001, weight_decay=0.0001)
    criterion = nn.CrossEntropyLoss()

    epochs = 5
    history = []
    best_val_acc = -1.0
    best_state = None
    best_epoch = -1

    for epoch in range(1, epochs + 1):
        t0 = time.time()
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            preds = outputs.argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += images.size(0)

        train_loss = running_loss / total
        train_acc = 100.0 * correct / total

        model.eval()
        val_loss_sum = 0.0
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss_sum += loss.item() * images.size(0)
                preds = outputs.argmax(dim=1)
                val_correct += (preds == labels).sum().item()
                val_total += images.size(0)

        val_loss = val_loss_sum / val_total
        val_acc = 100.0 * val_correct / val_total

        elapsed = time.time() - t0
        print(f"Epoch {epoch}: train_loss={train_loss:.4f} train_acc={train_acc:.2f}% "
              f"val_loss={val_loss:.4f} val_acc={val_acc:.2f}% ({elapsed:.1f}s)")

        history.append({
            "epoch": epoch,
            "trainLoss": round(train_loss, 4),
            "trainAccuracy": round(train_acc, 2),
            "valLoss": round(val_loss, 4),
            "valAccuracy": round(val_acc, 2),
        })

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_epoch = epoch
            best_state = {k: v.clone() for k, v in model.state_dict().items()}

    # Final test evaluation using the LAST epoch's weights (standard practice: report
    # final-model test performance; the best-checkpoint-by-validation is also saved).
    model.eval()
    test_loss_sum = 0.0
    test_correct = 0
    test_total = 0
    per_class_correct = [0] * 10
    per_class_total = [0] * 10
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            test_loss_sum += loss.item() * images.size(0)
            preds = outputs.argmax(dim=1)
            test_correct += (preds == labels).sum().item()
            test_total += images.size(0)
            for p, l in zip(preds.tolist(), labels.tolist()):
                per_class_total[l] += 1
                if p == l:
                    per_class_correct[l] += 1

    test_loss = test_loss_sum / test_total
    test_acc = 100.0 * test_correct / test_total
    per_class_acc = [round(100.0 * per_class_correct[i] / per_class_total[i], 2) for i in range(10)]

    print(f"\nFinal test: loss={test_loss:.4f} acc={test_acc:.2f}% correct={test_correct}/{test_total}")
    print("Per-class accuracy:", per_class_acc)
    print(f"Best validation checkpoint: epoch {best_epoch} (val_acc={best_val_acc:.2f}%)")

    torch.save(model.state_dict(), "dev/artifacts/canonical_model_final.pt")
    torch.save(best_state, "dev/artifacts/canonical_model_best.pt")

    with open("dev/artifacts/training_summary.json", "w") as f:
        json.dump({
            "seed": SEED,
            "totalParameters": total_params,
            "history": history,
            "bestEpoch": best_epoch,
            "bestValAccuracy": round(best_val_acc, 2),
            "finalTest": {
                "loss": round(test_loss, 4),
                "accuracy": round(test_acc, 2),
                "correct": test_correct,
                "incorrect": test_total - test_correct,
                "total": test_total,
            },
            "perClassAccuracy": per_class_acc,
        }, f, indent=2)

    print("\nSaved: dev/artifacts/canonical_model_final.pt, canonical_model_best.pt, training_summary.json")


if __name__ == "__main__":
    main()
