"""
DEV-ONLY SCRIPT. Not part of the shipped runtime artifact.

Splices the compact base64-encoded weights and sample-digit data (produced by
export_weights.py) into cnn-learning-lab.html, replacing the placeholder tokens
with the real embedded data. This keeps the HTML source editable as plain text
during development while avoiding ever pasting a multi-megabyte base64 blob
through the editing tool directly.

Run this once after any change to dev/train_model.py / dev/export_weights.py,
and always as the final step before treating cnn-learning-lab.html as done.
"""
import json
import re

HTML_PATH = "cnn-learning-lab.html"
ART = "dev/artifacts"


def read(path):
    with open(path, "r") as f:
        return f.read()


def main():
    html = read(HTML_PATH)

    weights_meta = read(f"{ART}/weights_meta.json").strip()
    weights_b64 = read(f"{ART}/weights_base64.txt").strip()
    samples_meta = read(f"{ART}/samples_meta.json").strip()
    samples_b64 = read(f"{ART}/samples_base64.txt").strip()
    reference_logits = read(f"{ART}/reference_logits.json").strip()

    replacements = [
        ("__EMBEDDED_WEIGHTS_META__", weights_meta),
        ("__EMBEDDED_WEIGHTS_BASE64__", weights_b64),
        ("__EMBEDDED_SAMPLES_META__", samples_meta),
        ("__EMBEDDED_SAMPLES_BASE64__", samples_b64),
        ("__EMBEDDED_REFERENCE_LOGITS__", reference_logits),
    ]

    missing = []
    for token, _ in replacements:
        if token not in html:
            missing.append(token)
    if missing:
        raise SystemExit(f"ERROR: placeholder(s) not found in HTML (already replaced, or renamed?): {missing}")

    for token, value in replacements:
        html = html.replace(token, value, 1)

    remaining = re.findall(r"__EMBEDDED_[A-Z_]+__", html)
    if remaining:
        raise SystemExit(f"ERROR: leftover placeholder tokens after substitution: {remaining}")

    with open(HTML_PATH, "w") as f:
        f.write(html)

    size_mb = len(html.encode("utf-8")) / (1024*1024)
    print(f"Finalized {HTML_PATH}: {len(html):,} characters, {size_mb:.2f} MB")


if __name__ == "__main__":
    main()
