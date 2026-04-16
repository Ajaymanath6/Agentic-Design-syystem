#!/usr/bin/env bash
# Run publish helper without needing npm on PATH (uses project .node/bin/node).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE="$ROOT/.node/bin/node"
if [[ ! -x "$NODE" ]]; then
  echo "Missing $NODE — run: bash scripts/install-local-node.sh"
  exit 1
fi
exec "$NODE" "$ROOT/server/publish-helper.mjs"
