// Register a custom panel in the DevTools
chrome.devtools.panels.create(
  "NDJSON Parser",
  "panel-icon.svg", // SVG icon for Edge DevTools tab
  "panel.html",
  function(panel) {
    console.log("NDJSON Parser panel created");
  }
);
