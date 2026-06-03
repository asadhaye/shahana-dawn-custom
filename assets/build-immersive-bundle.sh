#!/bin/bash
# build-immersive-bundle.sh
# Concatenates immersive-core.js + immersive-features.js + infinite-gallery.js into immersive-bundle.js
# Run this after any change to any source file.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CORE="$SCRIPT_DIR/immersive-core.js"
FEATURES="$SCRIPT_DIR/immersive-features.js"
GALLERY="$SCRIPT_DIR/infinite-gallery.js"
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
if [ -f "$GALLERY" ]; then
  echo "  + $(basename "$GALLERY") ($(wc -l < "$GALLERY") lines)"
fi

cat "$CORE" "$FEATURES" > "$OUTPUT"

# Append infinite-gallery if it exists
if [ -f "$GALLERY" ]; then
  cat "$GALLERY" >> "$OUTPUT"
fi

echo "  -> $(basename "$OUTPUT") ($(wc -l < "$OUTPUT") lines)"
echo "Done."
