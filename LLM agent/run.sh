#!/usr/bin/env bash
# Start the Vertex LLM FastAPI service (port 4302).
# One-time: create .venv and copy .env.llm.example → .env.llm (see README).

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [[ -f .env.llm ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.llm
  set +a
fi

if [[ ! -d .venv ]]; then
  echo "LLM agent: missing .venv — run once from repo root:"
  echo "  cd \"LLM agent\" && python3.10 -m venv .venv && .venv/bin/pip install -r requirements.txt"
  echo "(Use python3.11 / python3.12 if 3.10 is not installed; requires Python 3.10+.)"
  exit 1
fi

if ! .venv/bin/python -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)'; then
  echo "LLM agent: this venv uses $(.venv/bin/python --version 2>&1) but google-genai needs Python 3.10+."
  echo "Remove .venv and recreate: rm -rf .venv && python3.10 -m venv .venv && .venv/bin/pip install -r requirements.txt"
  exit 1
fi

exec .venv/bin/uvicorn main:app --host 127.0.0.1 --port 4302 --reload
