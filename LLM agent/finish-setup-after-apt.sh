#!/usr/bin/env bash
# Run AFTER: sudo apt install -y python3.10 python3.10-venv  (or python3.11-venv)
# Completes: new .venv, pip install, quick checks.

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

PY=""
for c in python3.12 python3.11 python3.10; do
  if command -v "$c" >/dev/null 2>&1; then
    PY="$c"
    break
  fi
done

if [[ -z "$PY" ]]; then
  echo "No python3.10+ on PATH. Install first, then re-run this script:"
  echo "  sudo apt update && sudo apt install -y python3.10 python3.10-venv"
  echo "  # or: sudo apt install -y python3.11 python3.11-venv"
  exit 1
fi

echo "Step 3: using $($PY --version)"
rm -rf .venv
"$PY" -m venv .venv
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -r requirements.txt
echo "Step 3 done: $(.venv/bin/python --version), packages installed."

echo ""
echo "Step 4: edit .env.llm — set GCP_PROJECT= (not the placeholder) and check LLM_AGENT_AWS_CREDENTIALS_FILE."
if [[ -f .env.llm ]] && grep -q '^GCP_PROJECT=your-gcp-project-id' .env.llm; then
  echo "  (Still using placeholder GCP_PROJECT — update before relying on Vertex.)"
fi

echo ""
echo "Step 5: start the service from repo root (npm run dev:vertex-llm or npm run dev:with-llm), then:"
echo "  curl -sS http://127.0.0.1:4302/health"
