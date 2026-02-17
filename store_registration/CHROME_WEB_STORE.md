# Chrome Web Store Submission Guide

## Store Listing Details

### Store Listing Tab

**Item Name:**
```
NDJSON Payload Parser
```

**Summary (132 characters max):**
```
Parse NDJSON network payloads in DevTools with interactive JSON trees, search, and Material Design UI.
```

**Description:**
```
NDJSON Payload Parser automatically detects and parses Newline-Delimited JSON (NDJSON) payloads from network request bodies, displaying them in an easy-to-navigate tree structure within Chrome DevTools.

FEATURES:
• Automatic NDJSON detection from request payloads
• Interactive collapsible JSON tree with syntax highlighting
• Smart search with text or regex support
• Filter requests by URL (text or regex)
• Two-tab interface: Request Payload and HTTP Headers
• Material Design UI with resizable panels
• Click-to-copy JSON to clipboard
• Real-time request monitoring

PERFECT FOR:
• Debugging streaming telemetry and analytics
• Analyzing batch API responses
• Inspecting NDJSON-formatted data
• Monitoring application events and metrics

PRIVACY:
• Runs entirely locally in your browser
• No data collection, storage, or transmission
• No external network requests
• No analytics or tracking

The extension adds a dedicated "NDJSON Parser" tab to Chrome DevTools. Open DevTools (F12), navigate to the new tab, and it will automatically capture NDJSON payloads from POST requests.
```

**Category:**
```
Developer Tools
```

**Language:**
```
English (United States)
```

**Icon:**
- Upload `icon128.png` (128×128)

**Screenshots:** (1280×800 or 640×400)
You'll need to create 3-5 screenshots showing:
1. Main panel with parsed NDJSON payloads
2. Search functionality with highlights
3. Headers tab view
4. URL filtering in action
5. (Optional) Expanded JSON tree

**Promotional Images:** (Optional but recommended)
- Small tile: 440×280
- Marquee: 1400×560

### Privacy Tab

**Single Purpose:**
```
Parse and display NDJSON (Newline-Delimited JSON) network request payloads in Chrome DevTools
```

**Permission Justifications:**

**webRequest:**
```
Required to monitor network requests in DevTools and identify NDJSON payloads by inspecting request bodies and Content-Type headers.
```

**clipboardWrite:**
```
Allows users to copy parsed JSON payloads to clipboard with one click for use in other tools or documentation.
```

**host_permissions (<all_urls>):**
```
Required to monitor network requests across all websites where the user opens DevTools, ensuring the extension works regardless of the domain being debugged.
```

**Are you using remote code?**
```
No
```

**Data Usage:**
```
This extension does not collect, store, or transmit any user data. All processing happens locally in the browser. The extension only accesses network request data that is already visible in Chrome DevTools.
```

**Privacy Policy URL:**
```
[Optional - include if you have one, or state "Not applicable - no data collected"]
```

### Distribution Tab

**Visibility:**
```
Public
```

**Pricing:**
```
Free
```

**Geographic Distribution:**
```
All regions (default)
```

**Target Audience:**
```
Developers and technical users
```

### Test Instructions Tab

**Test Account:** (Not needed)
```
No test account required. Extension works with any website.
```

**Testing Instructions:**
```
1. Install the extension
2. Open Chrome DevTools (F12 or Right-click → Inspect)
3. Navigate to the "NDJSON Parser" tab
4. Visit a website that sends NDJSON payloads (or use the included test.html file)
5. POST requests with NDJSON bodies will appear automatically

To test with the included test.html file:
- Open test.html in Chrome
- Click the test buttons to generate sample NDJSON requests
- Observe payloads in the NDJSON Parser tab

The extension detects NDJSON via:
- Content-Type headers (application/x-ndjson, application/jsonlines, application/json-seq)
- Heuristic analysis (attempts to parse first 3 lines as JSON)
```

## Pre-Submission Checklist

- [ ] Remove all test files and development artifacts
- [ ] Verify manifest.json version matches README
- [ ] Test in Chrome (latest version)
- [ ] Test in Edge (latest version)
- [ ] Ensure all features work as described
- [ ] No console errors in production
- [ ] Icons display correctly at all sizes
- [ ] Privacy policy accurate (or confirm no data collection)
- [ ] Create compelling screenshots
- [ ] Prepare promotional images (optional)

## Files to Include in ZIP

**Required:**
- manifest.json
- devtools.html
- devtools.js
- panel.html
- panel.js
- panel-icon.svg
- icon16.png
- icon48.png
- icon128.png

**Optional but Recommended:**
- README.md
- LICENSE
- CHANGELOG.md

**Do NOT include:**
- test.html (testing only)
- QUICKSTART.md (redundant)
- INSTALL.md (redundant)
- Any .py scripts
- .git folder
- node_modules
- Any development artifacts

## After Submission

1. Monitor your Chrome Web Store Developer Dashboard
2. Respond promptly to any reviewer questions
3. First review typically takes 1-3 business days
4. Once approved, update README.md with actual Chrome Web Store link
5. Consider creating a GitHub Releases page for version tracking
