#!/usr/bin/env bash
set -euo pipefail

# =========================================================
# Jooto MCP Server - MCPB bundle build script
#
# Usage:
#   ./scripts/build-mcpb.sh
#
# Output:
#   dist/jooto-mcp-server-<version>.mcpb
# =========================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Read version from package.json
VERSION=$(node -e "console.log(require('./package.json').version)" 2>/dev/null || echo "1.0.0")
BUNDLE_NAME="jooto-mcp-server-${VERSION}"
STAGING_DIR="${PROJECT_ROOT}/dist/mcpb-staging"
OUTPUT_FILE="${PROJECT_ROOT}/dist/${BUNDLE_NAME}.mcpb"

echo "=== Building Jooto MCP Server MCPB bundle v${VERSION} ==="

# --- Step 1: Build with esbuild (single CJS file, all deps bundled) ---
echo "[1/3] Bundling with esbuild..."
cd "$PROJECT_ROOT"
npx esbuild src/index.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=cjs \
  --outfile=dist/bundle.cjs

# --- Step 2: Prepare staging ---
echo "[2/3] Preparing staging directory..."
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR"

cp "$PROJECT_ROOT/manifest.json" "$STAGING_DIR/manifest.json"
cp "$PROJECT_ROOT/dist/bundle.cjs" "$STAGING_DIR/server.cjs"

# --- Step 3: Create the .mcpb (ZIP) file ---
echo "[3/3] Creating .mcpb bundle..."
cd "$STAGING_DIR"
rm -f "$OUTPUT_FILE"
zip -r -q "$OUTPUT_FILE" \
  manifest.json \
  server.cjs

# --- Cleanup ---
rm -rf "$STAGING_DIR"

# --- Summary ---
SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
echo ""
echo "=== Build complete ==="
echo "  Output: ${OUTPUT_FILE}"
echo "  Size:   ${SIZE}"
echo ""
echo "Install in Claude Desktop by opening the .mcpb file,"
echo "or drag-and-drop it onto the Claude Desktop window."
