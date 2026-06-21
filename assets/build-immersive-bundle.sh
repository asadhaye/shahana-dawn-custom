#!/bin/bash
# build-immersive-bundle.sh
# Concatenates all immersive source files into immersive-bundle.js
# Optionally minifies if terser is available.
# Run this after any change to any source file.
#
# Order matters: state-manager → tick-manager → core → features

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_MANAGER="$SCRIPT_DIR/immersive-state-manager.js"
TICK_MANAGER="$SCRIPT_DIR/tick-manager.js"
CORE="$SCRIPT_DIR/immersive-core.js"
FEATURES="$SCRIPT_DIR/immersive-features.js"
OUTPUT="$SCRIPT_DIR/immersive-bundle.js"
OUTPUT_MIN="$SCRIPT_DIR/immersive-bundle.min.js"

for f in "$STATE_MANAGER" "$TICK_MANAGER" "$CORE" "$FEATURES"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: $f not found"
    exit 1
  fi
done

echo "Building immersive-bundle.js..."
echo "  + $(basename "$STATE_MANAGER") ($(wc -l < "$STATE_MANAGER") lines)"
echo "  + $(basename "$TICK_MANAGER") ($(wc -l < "$TICK_MANAGER") lines)"
echo "  + $(basename "$CORE") ($(wc -l < "$CORE") lines)"
echo "  + $(basename "$FEATURES") ($(wc -l < "$FEATURES") lines)"

# Concatenate all files with newline separators
cat "$STATE_MANAGER" > "$OUTPUT"
printf '\n' >> "$OUTPUT"
cat "$TICK_MANAGER" >> "$OUTPUT"
printf '\n' >> "$OUTPUT"
cat "$CORE" >> "$OUTPUT"
printf '\n' >> "$OUTPUT"
cat "$FEATURES" >> "$OUTPUT"

# Validate output is valid JavaScript
if command -v node &>/dev/null; then
  if ! node -c "$OUTPUT" 2>/dev/null; then
    echo "ERROR: Output bundle is not valid JavaScript — check concatenation"
    exit 1
  fi
  echo "  [validated: syntax check passed]"
fi

echo "  -> $(basename "$OUTPUT") ($(wc -l < "$OUTPUT") lines)"

# Optional minification step — produces immersive-bundle.min.js if terser is available
if command -v terser &>/dev/null || npx terser --version &>/dev/null 2>&1; then
  echo "  Minifying with terser..."
  if command -v terser &>/dev/null; then
    terser "$OUTPUT" --compress hoist_vars=false,reduce_vars=false,collapse_vars=false --mangle --keep-fnames -o "$OUTPUT_MIN"
  else
    npx terser "$OUTPUT" --compress hoist_vars=false,reduce_vars=false,collapse_vars=false --mangle --keep-fnames -o "$OUTPUT_MIN"
  fi
  echo "  -> $(basename "$OUTPUT_MIN") ($(wc -c < "$OUTPUT_MIN") bytes, $(wc -l < "$OUTPUT_MIN") lines)"
  echo "  NOTE: To use the minified bundle, update theme.liquid to load immersive-bundle.min.js instead of immersive-bundle.js"
else
  echo "  [minification skipped: terser not installed. Install with: npm install -g terser or npm install terser --save-dev]"
fi

echo "Done."