#!/usr/bin/env bash
# One-time: install Node.js into project .node/ (gitignored) when system npm is missing.
# Requires: curl, tar, xz. Run from repo root: bash scripts/install-local-node.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/.node"
NODE_VER="${NODE_VER:-v20.19.0}"
ARCH="linux-x64"
URL="https://nodejs.org/dist/${NODE_VER}/node-${NODE_VER}-${ARCH}.tar.xz"
if [[ -x "$DEST/bin/node" ]]; then
  echo "Already present: $("$DEST/bin/node" --version) at $DEST/bin"
  exit 0
fi
echo "Installing Node ${NODE_VER} to $DEST ..."
mkdir -p "$DEST"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
curl -fsSL "$URL" -o "$TMP"
tar -xJf "$TMP" -C "$DEST" --strip-components=1
echo "Done: $("$DEST/bin/node" --version) — add to PATH (see README) or use:"
echo "  export PATH=\"$DEST/bin:\$PATH\""
