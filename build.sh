#!/usr/bin/env bash

# Build script for NDJSON Payload Parser Chrome Extension
# Usage: ./build.sh or bash build.sh

set -e  # Exit on error

echo "Building NDJSON Payload Parser..."

# Get version from manifest
VERSION=$(grep -o '"version": *"[^"]*"' extension/manifest.json | grep -o '[0-9.]*')

echo "Version: $VERSION"

# Create dist directory if it doesn't exist
mkdir -p dist

# Create ZIP file
cd extension || exit 1
zip -r "../dist/ndjson-parser-v${VERSION}.zip" . -x "*.DS_Store" -x "__MACOSX/*" > /dev/null
cd ..

FILE_SIZE=$(du -h "dist/ndjson-parser-v${VERSION}.zip" | cut -f1)

echo ""
echo "✓ Built: dist/ndjson-parser-v${VERSION}.zip"
echo "  Size: $FILE_SIZE"
echo ""
echo "Ready to upload to Chrome Web Store"