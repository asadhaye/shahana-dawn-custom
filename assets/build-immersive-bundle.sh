#!/bin/bash
# build-immersive-bundle.sh
# Concatenates immersive-core.js + immersive-features.js into immersive-bundle.js
# Run this after any change to either source file.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CORE="$SCRIPT_DIR/immersive-core.js"
FEATURES="$SCRIPT_DIR/immersive-features.js"
OUTPUT="$SCRIPT_DIR/immersive-bundle.js"

if [ ! -f "$CORE" ]; then
  echo "ERROR: $CORE not found"
  exit 1
fi

if [ ! -f "$FEATURES" ]; then
  echo "ERROR: $FEATURES not found"
  exit 1
fi

echo "Building immersive-bundle.js..."
echo "  + $(basename "$CORE") ($(wc -l < "$CORE") lines)"
echo "  + $(basename "$FEATURES") ($(wc -l < "$FEATURES") lines)"

cat "$CORE" "$FEATURES" > "$OUTPUT"

echo "  -> $(basename "$OUTPUT") ($(wc -l < "$OUTPUT") lines)"
echo "Done."
