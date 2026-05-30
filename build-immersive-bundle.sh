#!/bin/bash
# Build script to concatenate immersive source files into bundle

OUTPUT="assets/immersive-bundle.js"
TEMP_OUTPUT="${OUTPUT}.tmp"

echo "Building immersive-bundle.js..."

# Concatenate files in order
cat assets/immersive-core.js > "$TEMP_OUTPUT"
echo "" >> "$TEMP_OUTPUT"
cat assets/immersive-features.js >> "$TEMP_OUTPUT"
echo "" >> "$TEMP_OUTPUT"
cat assets/immersive-init.js >> "$TEMP_OUTPUT"

# Replace temp with final
mv "$TEMP_OUTPUT" "$OUTPUT"

echo "✓ Bundle built successfully: $OUTPUT"
echo "  Lines: $(wc -l < "$OUTPUT")"
