#!/bin/bash

# Build script for NDJSON Payload Parser Chrome Extension
# Usage: ./build.sh

# Get version from manifest
VERSION=$(grep '"version"' extension/manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')

# Create dist directory if it doesn't exist
mkdir -p dist

# Create ZIP file
cd extension
zip -r ../dist/ndjson-parser-v${VERSION}.zip . -x "*.DS_Store" -x "__MACOSX/*"
cd ..

echo "✓ Built: dist/ndjson-parser-v${VERSION}.zip"
echo "Ready to upload to Chrome Web Store"