# NDJSON Payload Parser

A Chrome/Edge DevTools extension that automatically detects and parses NDJSON (Newline-Delimited JSON) payloads from network request bodies, displaying them as interactive, searchable JSON trees with a clean Material Design interface.

![Chrome Web Store](https://img.shields.io/chrome-web-store/v/akmeaeppehffmdcdgcpdjndjclkhagni)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## Overview

NDJSON Payload Parser adds a dedicated panel to Chrome DevTools that monitors network requests, automatically identifies NDJSON payloads, and presents them in an easy-to-navigate tree structure. Perfect for debugging streaming telemetry, analyzing batch API responses, or inspecting any NDJSON-formatted data.

## Features

### Core Functionality
- **Automatic NDJSON Detection** - Identifies NDJSON in outgoing request bodies via Content-Type headers or heuristic analysis
- **Interactive JSON Tree** - Collapsible tree view with syntax highlighting and inline previews
- **Smart Search** - Search across all payloads with text or regex support (`/pattern/flags`)
- **Two-Tab Interface** - Request Payload tab for JSON data, Headers tab for HTTP details
- **URL Filtering** - Filter requests by URL with text or regex matching
- **Resizable Panels** - Drag-to-resize request list for optimal workspace layout

### User Experience
- **Material Design UI** - Clean, modern interface with Material Icons and compact density
- **Collapsible Headers** - Click to expand/collapse header sections (General, Request, Response)
- **Sticky Payload Headers** - Headers stay visible when scrolling through long JSON trees
- **Click-to-Copy** - One-click JSON copying to clipboard
- **Expand/Collapse Controls** - Toggle entire trees or individual nodes
- **Real-time Monitoring** - Captures requests as they happen

### Developer-Friendly
- **Unquoted Property Keys** - Clean display matching Chrome's native network inspector
- **Alphabetically Sorted Keys** - Consistent, predictable object key ordering
- **Inline Previews** - See truncated JSON content without expanding
- **Search Highlighting** - Yellow highlights on matched text with auto-expansion
- **Error Handling** - Graceful handling of malformed JSON lines

## Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store listing](https://chrome.google.com/webstore) (link coming soon)
2. Click "Add to Chrome"
3. Open Chrome DevTools (F12 or Right-click → Inspect)
4. Find the "NDJSON Parser" tab

### Compatibility
- Chrome 88+
- Edge 88+
- Any Chromium-based browser with Manifest V3 support

## Usage

### Basic Workflow
1. Open DevTools and navigate to the **NDJSON Parser** tab
2. The extension automatically monitors POST requests with NDJSON payloads
3. Click any request in the left panel to view parsed payloads
4. Use the search bar to find specific content across all payloads
5. Switch to the Headers tab to inspect HTTP request/response details

### Filtering Requests
**Text Filter:**
```
/api/telemetry
```

**Regex Filter:**
```
/api/(events|metrics)/
```

### Searching Payloads
**Text Search:**
```
error
```

**Regex Search:**
```
/status.*[45]\d{2}/
```

### Keyboard Shortcuts
- **F12** - Open/close DevTools
- **Ctrl/Cmd + F** - Focus search (when in panel)

## Technical Details

### NDJSON Detection
The extension identifies NDJSON payloads by:
1. **Content-Type headers**: `application/x-ndjson`, `application/jsonlines`, `application/json-seq`
2. **Heuristic analysis**: Attempts to parse first 3 lines as JSON

### Supported Features
- Request payload inspection (not response)
- Alphabetically sorted object keys
- Clickable collections (objects/arrays) for expand/collapse
- Debounced search (300ms) with 2-character minimum
- Sticky headers with shadow on scroll
- Clipboard API with fallback support

### Permissions
- `webRequest` - Monitor network requests
- `clipboardWrite` - Copy JSON to clipboard
- `host_permissions: <all_urls>` - Access network traffic across all domains

## Privacy

This extension:
- ✅ Runs entirely locally in your browser
- ✅ Does not collect, store, or transmit any data
- ✅ Does not make external network requests
- ✅ Only accesses network request data visible in DevTools
- ✅ No analytics, tracking, or telemetry

## Development

### Project Structure
```
ndjson-parser-extension/
├── manifest.json          # Extension configuration
├── devtools.html         # DevTools entry point
├── devtools.js           # Panel registration
├── panel.html            # Main UI
├── panel.js              # Core logic (~900 lines)
├── panel-icon.svg        # DevTools tab icon
├── icon16.png           # Extension icons
├── icon48.png
├── icon128.png
└── test.html            # Test page (optional)
```

### Technology Stack
- Vanilla JavaScript (no frameworks)
- Material Design principles
- Material Icons (Google Fonts CDN)
- Roboto font (Google Fonts CDN)

## Changelog

### v1.0.0 (Initial Release)
- NDJSON payload detection and parsing
- Interactive JSON tree with collapsible nodes
- Dual-tab interface (Payload/Headers)
- Request URL filtering (text/regex)
- Payload search with highlighting
- Resizable request list panel
- Material Design UI
- Sticky headers with scroll detection
- Click-to-copy functionality

## Support

Found a bug or have a feature request? Please [open an issue](https://github.com/YOUR_USERNAME/ndjson-parser-extension/issues) on GitHub.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with:
- [Material Icons](https://fonts.google.com/icons) by Google
- [Roboto Font](https://fonts.google.com/specimen/Roboto) by Google

---

**Made with ❤️ for developers who work with NDJSON**
