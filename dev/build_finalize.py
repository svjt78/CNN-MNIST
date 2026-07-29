"""
DEV-ONLY SCRIPT. Not part of the shipped runtime artifact.

Splices compact base64-encoded/JSON data (produced by export_weights.py and the other
dev/compute_*.py scripts) into cnn-learning-lab.html, replacing placeholder tokens with
the real embedded data. This keeps the HTML source editable as plain text during
development while avoiding ever pasting a multi-megabyte base64 blob through the
editing tool directly.

Idempotent: a placeholder already replaced in a previous run simply won't be found
again and is skipped (not an error) — this lets the script be re-run safely whenever
new placeholders are added later without needing to reconstruct the original template.

Run this after any change to the training/export/confusion-matrix scripts, and always
as the final step before treating cnn-learning-lab.html as done.
"""
import base64
import json
import re

HTML_PATH = "cnn-learning-lab.html"
ART = "dev/artifacts"


def read(path):
    with open(path, "r") as f:
        return f.read()


def read_bytes(path):
    with open(path, "rb") as f:
        return f.read()


def main():
    html = read(HTML_PATH)

    weights_meta = read(f"{ART}/weights_meta.json").strip()
    weights_b64 = read(f"{ART}/weights_base64.txt").strip()
    samples_meta = read(f"{ART}/samples_meta.json").strip()
    samples_b64 = read(f"{ART}/samples_base64.txt").strip()
    reference_logits = read(f"{ART}/reference_logits.json").strip()

    confusion = json.loads(read(f"{ART}/confusion_matrix.json"))
    confusion_matrix_literal = json.dumps(confusion["matrix"])

    train_script_b64 = base64.b64encode(read_bytes("dev/train_model.py")).decode("ascii")
    export_script_b64 = base64.b64encode(read_bytes("dev/export_weights.py")).decode("ascii")
    training_summary = read(f"{ART}/training_summary.json").strip()

    replacements = [
        ("__EMBEDDED_WEIGHTS_META__", weights_meta),
        ("__EMBEDDED_WEIGHTS_BASE64__", weights_b64),
        ("__EMBEDDED_SAMPLES_META__", samples_meta),
        ("__EMBEDDED_SAMPLES_BASE64__", samples_b64),
        ("__EMBEDDED_REFERENCE_LOGITS__", reference_logits),
        ("__EMBEDDED_CONFUSION_MATRIX__", confusion_matrix_literal),
        ("__EMBEDDED_TRAIN_SCRIPT_BASE64__", train_script_b64),
        ("__EMBEDDED_EXPORT_SCRIPT_BASE64__", export_script_b64),
        ("__EMBEDDED_TRAINING_SUMMARY__", training_summary),
    ]

    applied, skipped = [], []
    for token, value in replacements:
        if token in html:
            html = html.replace(token, value, 1)
            applied.append(token)
        else:
            skipped.append(token)

    remaining = re.findall(r"__EMBEDDED_[A-Z_]+__", html)
    if remaining:
        raise SystemExit(f"ERROR: leftover placeholder tokens after substitution: {remaining}")

    with open(HTML_PATH, "w") as f:
        f.write(html)

    size_mb = len(html.encode("utf-8")) / (1024*1024)
    print(f"Applied: {applied}")
    if skipped:
        print(f"Skipped (already resolved in a previous run, or not present): {skipped}")
    print(f"Finalized {HTML_PATH}: {len(html):,} characters, {size_mb:.2f} MB")


if __name__ == "__main__":
    main()
