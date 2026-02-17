// State management
const state = {
  requests: [],
  selectedRequestId: null,
  selectedRequestData: null, // Store full request data for headers
  filter: {
    text: ''
  },
  payloadSearch: {
    text: ''
  }
};

// DOM elements
const requestList = document.getElementById('request-list');
const content = document.getElementById('content');
const emptyState = document.getElementById('empty-state');
const clearBtn = document.getElementById('clear-btn');
const info = document.getElementById('info');
const filterInput = document.getElementById('filter-input');
const resizer = document.getElementById('resizer');
const tabs = document.getElementById('tabs');
const payloadPanel = document.getElementById('payload-panel');
const headersPanel = document.getElementById('headers-panel');
const payloadSearchInput = document.getElementById('payload-search-input');

// Utility: Check if content is NDJSON
function isNDJSON(contentType, body) {
  if (!body) return false;
  
  // Check content type
  if (contentType && (
    contentType.includes('application/x-ndjson') ||
    contentType.includes('application/jsonlines') ||
    contentType.includes('application/json-seq')
  )) {
    return true;
  }
  
  // Heuristic: Check if it looks like NDJSON
  const lines = body.trim().split('\n');
  if (lines.length === 0) return false;
  
  // Try parsing first few lines as JSON
  let validJsonLines = 0;
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      JSON.parse(line);
      validJsonLines++;
    } catch (e) {
      return false;
    }
  }
  
  return validJsonLines > 0;
}

// Utility: Check if request matches current filter
function matchesFilter(url) {
  if (!state.filter.text || state.filter.text.length < 2) return true;
  
  const filterText = state.filter.text;
  
  // Check if filter is wrapped in slashes for regex: /pattern/
  const regexMatch = filterText.match(/^\/(.+)\/([gimuy]*)$/);
  
  try {
    if (regexMatch) {
      // Regex mode: extract pattern and flags
      const pattern = regexMatch[1];
      const flags = regexMatch[2] || 'i'; // Default to case-insensitive
      const regex = new RegExp(pattern, flags);
      return regex.test(url);
    } else {
      // Text mode: case-insensitive substring match
      return url.toLowerCase().includes(filterText.toLowerCase());
    }
  } catch (e) {
    // If regex is invalid, fall back to text match
    return url.toLowerCase().includes(filterText.toLowerCase());
  }
}

// Parse NDJSON into array of objects
function parseNDJSON(text) {
  const lines = text.trim().split('\n');
  const results = [];
  const errors = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return; // Skip empty lines
    
    try {
      const parsed = JSON.parse(trimmed);
      results.push({ index: index + 1, data: parsed, error: null });
    } catch (e) {
      errors.push({ index: index + 1, line: trimmed, error: e.message });
      results.push({ index: index + 1, data: null, error: e.message });
    }
  });
  
  return { results, errors };
}

// Render JSON as interactive tree
function renderJsonTree(obj, treeId) {
  const createNode = (value, key = null, depth = 0) => {
    const div = document.createElement('div');
    div.className = 'tree-line';
    
    if (value === null) {
      div.innerHTML = key 
        ? `<span class="tree-key">"${escapeHtml(key)}"</span>: <span class="tree-value null">null</span>`
        : `<span class="tree-value null">null</span>`;
      return div;
    }
    
    const type = typeof value;
    
    if (type === 'object' && !Array.isArray(value)) {
      const keys = Object.keys(value).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); // Alpha sort
      const isEmpty = keys.length === 0;
      
      const toggleId = `toggle-${treeId}-${Math.random().toString(36).substr(2, 9)}`;
      const isExpanded = false; // Start all nodes collapsed
      
      // Create inline preview (truncated JSON) - remove outer braces
      const preview = isEmpty ? '' : JSON.stringify(value).substring(1, 50) + (JSON.stringify(value).length > 50 ? '...' : '');
      
      div.innerHTML = key
        ? `<span class="tree-toggle" data-target="${toggleId}">${isExpanded ? '▼' : '▶'}</span> <span class="tree-key clickable">${escapeHtml(key)}</span>: <span class="tree-bracket">{</span><span class="tree-preview">${isEmpty ? '' : ' ' + escapeHtml(preview)}</span><span class="tree-bracket">}</span>`
        : `<span class="tree-toggle" data-target="${toggleId}">${isExpanded ? '▼' : '▶'}</span> <span class="tree-bracket">{</span><span class="tree-preview">${isEmpty ? '' : ' ' + escapeHtml(preview)}</span><span class="tree-bracket">}</span>`;
      
      if (!isEmpty) {
        const childContainer = document.createElement('div');
        childContainer.className = isExpanded ? 'tree-node' : 'tree-node tree-collapsed';
        childContainer.id = toggleId;
        
        keys.forEach((k, i) => {
          const child = createNode(value[k], k, depth + 1);
          childContainer.appendChild(child);
        });
        
        div.appendChild(childContainer);
      }
      
      return div;
    }
    
    if (Array.isArray(value)) {
      const isEmpty = value.length === 0;
      const toggleId = `toggle-${treeId}-${Math.random().toString(36).substr(2, 9)}`;
      const isExpanded = false; // Start all nodes collapsed
      
      // Create inline preview - remove outer brackets
      const preview = isEmpty ? '' : JSON.stringify(value).substring(1, 50) + (JSON.stringify(value).length > 50 ? '...' : '');
      
      div.innerHTML = key
        ? `<span class="tree-toggle" data-target="${toggleId}">${isExpanded ? '▼' : '▶'}</span> <span class="tree-key clickable">${escapeHtml(key)}</span>: <span class="tree-bracket">[</span><span class="tree-preview">${isEmpty ? '' : ' ' + escapeHtml(preview)}</span><span class="tree-bracket">]</span>`
        : `<span class="tree-toggle" data-target="${toggleId}">${isExpanded ? '▼' : '▶'}</span> <span class="tree-bracket">[</span><span class="tree-preview">${isEmpty ? '' : ' ' + escapeHtml(preview)}</span><span class="tree-bracket">]</span>`;
      
      if (!isEmpty) {
        const childContainer = document.createElement('div');
        childContainer.className = isExpanded ? 'tree-node' : 'tree-node tree-collapsed';
        childContainer.id = toggleId;
        
        value.forEach((item, i) => {
          const child = createNode(item, null, depth + 1);
          childContainer.appendChild(child);
        });
        
        div.appendChild(childContainer);
      }
      
      return div;
    }
    
    // Primitive values
    let valueHtml;
    if (type === 'string') {
      valueHtml = `<span class="tree-value string">"${escapeHtml(value)}"</span>`;
    } else if (type === 'number') {
      valueHtml = `<span class="tree-value number">${value}</span>`;
    } else if (type === 'boolean') {
      valueHtml = `<span class="tree-value boolean">${value}</span>`;
    } else {
      valueHtml = `<span class="tree-value">${escapeHtml(String(value))}</span>`;
    }
    
    div.innerHTML = key
      ? `<span class="tree-key">${escapeHtml(key)}</span>: ${valueHtml}`
      : valueHtml;
    
    return div;
  };
  
  const tree = document.createElement('div');
  tree.className = 'json-tree';
  tree.setAttribute('data-tree-id', treeId);
  tree.appendChild(createNode(obj));
  
  // Add click handlers for toggles
  tree.addEventListener('click', (e) => {
    if (e.target.classList.contains('tree-toggle')) {
      const targetId = e.target.getAttribute('data-target');
      const target = document.getElementById(targetId);
      if (target) {
        target.classList.toggle('tree-collapsed');
        e.target.textContent = target.classList.contains('tree-collapsed') ? '▶' : '▼';
      }
    }
    
    // Allow clicking on collection keys to toggle
    if (e.target.classList.contains('tree-key') && e.target.classList.contains('clickable')) {
      const toggle = e.target.parentElement.querySelector('.tree-toggle');
      if (toggle) {
        toggle.click();
      }
    }
  });
  
  return tree;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Fallback clipboard copy function
function copyToClipboardFallback(text, buttonElement) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    const originalText = buttonElement.textContent;
    buttonElement.textContent = 'Copied!';
    setTimeout(() => {
      buttonElement.textContent = originalText;
    }, 1500);
  } catch (err) {
    console.error('Fallback copy failed:', err);
    buttonElement.textContent = 'Copy failed';
    setTimeout(() => {
      buttonElement.textContent = 'Copy JSON';
    }, 1500);
  } finally {
    document.body.removeChild(textarea);
  }
}

// Search payloads and highlight matches
function searchPayloads(searchText) {
  const resultsContainer = document.getElementById('payload-results');
  if (!resultsContainer) return;
  
  const containers = resultsContainer.querySelectorAll('.payload-container');
  
  if (!searchText || searchText.length < 2) {
    // Clear search - restore default state
    containers.forEach(container => {
      container.classList.remove('search-hidden');
      // Remove all highlights
      removeHighlights(container);
      // Collapse all nodes
      collapseAllNodes(container);
    });
    return;
  }
  
  // Determine if regex or text search
  const regexMatch = searchText.match(/^\/(.+)\/([gimuy]*)$/);
  let searchRegex;
  
  try {
    if (regexMatch) {
      searchRegex = new RegExp(regexMatch[1], regexMatch[2] || 'gi');
    } else {
      // Escape special regex chars for text search
      const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      searchRegex = new RegExp(escaped, 'gi');
    }
  } catch (e) {
    console.error('Invalid regex:', e);
    return;
  }
  
  containers.forEach(container => {
    const jsonTree = container.querySelector('.json-tree');
    if (!jsonTree) return;
    
    // Get all text content
    const textContent = jsonTree.textContent;
    const hasMatch = searchRegex.test(textContent);
    
    if (hasMatch) {
      container.classList.remove('search-hidden');
      // Remove old highlights first
      removeHighlights(container);
      // Expand all nodes to show matches
      expandAllNodes(container);
      // Highlight matches with new search term
      highlightMatches(container, searchRegex);
    } else {
      container.classList.add('search-hidden');
    }
  });
}

// Helper: Remove all highlights
function removeHighlights(container) {
  const highlights = container.querySelectorAll('.search-highlight');
  highlights.forEach(highlight => {
    const parent = highlight.parentNode;
    parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
    parent.normalize(); // Merge adjacent text nodes
  });
}

// Helper: Highlight matches in text nodes
function highlightMatches(container, regex) {
  const jsonTree = container.querySelector('.json-tree');
  if (!jsonTree) return;
  
  // Walk through all text nodes and highlight matches
  const walker = document.createTreeWalker(
    jsonTree,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const nodesToReplace = [];
  let node;
  
  while (node = walker.nextNode()) {
    if (node.nodeValue.trim() && regex.test(node.nodeValue)) {
      nodesToReplace.push(node);
    }
  }
  
  nodesToReplace.forEach(textNode => {
    const parent = textNode.parentNode;
    const text = textNode.nodeValue;
    const fragment = document.createDocumentFragment();
    
    let lastIndex = 0;
    let match;
    regex.lastIndex = 0; // Reset regex
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
      }
      
      // Add highlighted match
      const highlight = document.createElement('span');
      highlight.className = 'search-highlight';
      highlight.textContent = match[0];
      fragment.appendChild(highlight);
      
      lastIndex = regex.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }
    
    parent.replaceChild(fragment, textNode);
  });
}

// Helper: Expand all nodes in a container
function expandAllNodes(container) {
  const allNodes = container.querySelectorAll('.tree-node');
  const allToggles = container.querySelectorAll('.tree-toggle');
  
  allNodes.forEach(node => node.classList.remove('tree-collapsed'));
  allToggles.forEach(toggle => toggle.textContent = '▼');
}

// Helper: Collapse all nodes in a container
function collapseAllNodes(container) {
  const allNodes = container.querySelectorAll('.tree-node');
  const allToggles = container.querySelectorAll('.tree-toggle');
  
  allNodes.forEach(node => node.classList.add('tree-collapsed'));
  allToggles.forEach(toggle => toggle.textContent = '▶');
}

// Render headers panel
function renderHeaders(requestData) {
  if (!requestData) {
    headersPanel.innerHTML = '<p style="color: rgba(0,0,0,0.38);">No request selected</p>';
    return;
  }
  
  const { fullUrl, method, status, remoteAddress, referrerPolicy, responseHeaders, requestHeaders } = requestData;
  
  let html = '';
  
  // General section
  html += '<div class="headers-section">';
  html += '<div class="headers-section-title" data-section="general">';
  html += '<span>General</span>';
  html += '<span class="material-icons">expand_more</span>';
  html += '</div>';
  html += '<div class="headers-section-body" data-section-body="general">';
  html += '<table class="header-table">';
  html += `<tr class="header-row">
    <td class="header-name">Request URL:</td>
    <td class="header-value">${escapeHtml(fullUrl)}</td>
  </tr>`;
  html += `<tr class="header-row">
    <td class="header-name">Request Method:</td>
    <td class="header-value">${escapeHtml(method)}</td>
  </tr>`;
  html += `<tr class="header-row">
    <td class="header-name">Status Code:</td>
    <td class="header-value">${status || 'N/A'}</td>
  </tr>`;
  html += `<tr class="header-row">
    <td class="header-name">Remote Address:</td>
    <td class="header-value">${escapeHtml(remoteAddress || 'N/A')}</td>
  </tr>`;
  html += `<tr class="header-row">
    <td class="header-name">Referrer Policy:</td>
    <td class="header-value">${escapeHtml(referrerPolicy || 'N/A')}</td>
  </tr>`;
  html += '</table></div></div>';
  
  // Response Headers
  if (responseHeaders && responseHeaders.length > 0) {
    html += '<div class="headers-section">';
    html += '<div class="headers-section-title" data-section="response">';
    html += '<span>Response Headers</span>';
    html += '<span class="material-icons">expand_more</span>';
    html += '</div>';
    html += '<div class="headers-section-body" data-section-body="response">';
    html += '<table class="header-table">';
    
    const sortedResponseHeaders = [...responseHeaders].sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    
    sortedResponseHeaders.forEach(header => {
      html += `<tr class="header-row">
        <td class="header-name">${escapeHtml(header.name)}:</td>
        <td class="header-value">${escapeHtml(header.value)}</td>
      </tr>`;
    });
    
    html += '</table></div></div>';
  }
  
  // Request Headers
  if (requestHeaders && requestHeaders.length > 0) {
    html += '<div class="headers-section">';
    html += '<div class="headers-section-title" data-section="request">';
    html += '<span>Request Headers</span>';
    html += '<span class="material-icons">expand_more</span>';
    html += '</div>';
    html += '<div class="headers-section-body" data-section-body="request">';
    html += '<table class="header-table">';
    
    const sortedRequestHeaders = [...requestHeaders].sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    
    sortedRequestHeaders.forEach(header => {
      html += `<tr class="header-row">
        <td class="header-name">${escapeHtml(header.name)}:</td>
        <td class="header-value">${escapeHtml(header.value)}</td>
      </tr>`;
    });
    
    html += '</table></div></div>';
  }
  
  headersPanel.innerHTML = html;
  
  // Add expand/collapse handlers
  headersPanel.querySelectorAll('.headers-section-title').forEach(title => {
    title.addEventListener('click', () => {
      const section = title.getAttribute('data-section');
      const body = headersPanel.querySelector(`[data-section-body="${section}"]`);
      
      // Simply toggle the collapsed class - CSS handles the rest
      title.classList.toggle('collapsed');
      body.classList.toggle('collapsed');
    });
  });
}

// Render parsed NDJSON payloads
function renderPayloads(parsed) {
  const resultsContainer = document.getElementById('payload-results');
  
  resultsContainer.innerHTML = '';
  emptyState.style.display = 'none';
  tabs.style.display = 'flex';
  
  if (parsed.errors.length > 0) {
    const warning = document.createElement('div');
    warning.className = 'warning-message';
    warning.textContent = `⚠ ${parsed.errors.length} line(s) failed to parse`;
    resultsContainer.appendChild(warning);
  }
  
  parsed.results.forEach((result, idx) => {
    const container = document.createElement('div');
    container.className = 'payload-container';
    
    const treeId = `tree-${idx}`;
    
    const header = document.createElement('div');
    header.className = 'payload-header';
    
    const headerContent = document.createElement('span');
    const payloadIndex = document.createElement('span');
    payloadIndex.className = 'payload-index';
    payloadIndex.textContent = `Payload #${result.index}`;
    headerContent.appendChild(payloadIndex);
    header.appendChild(headerContent);
    
    const actions = document.createElement('div');
    actions.className = 'payload-actions';
    
    const expandBtn = document.createElement('button');
    expandBtn.className = 'expand-toggle-btn';
    expandBtn.setAttribute('data-tree-id', treeId);
    expandBtn.setAttribute('data-expanded', 'collapsed');
    expandBtn.textContent = 'Expand All';
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy JSON';
    // Store JSON in dataset to avoid HTML attribute escaping issues
    copyBtn.dataset.payloadJson = JSON.stringify(result.data);
    
    actions.appendChild(expandBtn);
    actions.appendChild(copyBtn);
    header.appendChild(actions);
    
    container.appendChild(header);
    
    if (result.error) {
      const error = document.createElement('div');
      error.className = 'error-message';
      error.textContent = `Parse Error: ${result.error}`;
      container.appendChild(error);
    } else {
      container.appendChild(renderJsonTree(result.data, treeId));
    }
    
    resultsContainer.appendChild(container);
  });
  
  // Add copy handlers
  resultsContainer.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const payload = e.target.dataset.payloadJson;
      
      // Try clipboard API with fallback
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(payload).then(() => {
          const originalText = e.target.textContent;
          e.target.textContent = 'Copied!';
          setTimeout(() => {
            e.target.textContent = originalText;
          }, 1500);
        }).catch(err => {
          console.error('Clipboard write failed:', err);
          // Fallback: create temporary textarea
          copyToClipboardFallback(payload, e.target);
        });
      } else {
        // Fallback for older browsers or restricted contexts
        copyToClipboardFallback(payload, e.target);
      }
    });
  });
  
  // Add expand/collapse all handlers
  resultsContainer.querySelectorAll('.expand-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const treeId = e.target.getAttribute('data-tree-id');
      const expandState = e.target.getAttribute('data-expanded');
      const tree = document.querySelector(`.json-tree[data-tree-id="${treeId}"]`);
      
      if (!tree) {
        console.error('Tree not found for id:', treeId);
        return;
      }
      
      const allToggles = tree.querySelectorAll('.tree-toggle');
      const allNodes = tree.querySelectorAll('.tree-node');
      
      if (expandState === 'collapsed') {
        // Expand all nodes
        allNodes.forEach(node => {
          node.classList.remove('tree-collapsed');
        });
        allToggles.forEach(toggle => {
          toggle.textContent = '▼';
        });
        e.target.textContent = 'Collapse All';
        e.target.setAttribute('data-expanded', 'all');
      } else {
        // Collapse all nodes
        allNodes.forEach(node => {
          node.classList.add('tree-collapsed');
        });
        allToggles.forEach(toggle => {
          toggle.textContent = '▶';
        });
        e.target.textContent = 'Expand All';
        e.target.setAttribute('data-expanded', 'collapsed');
      }
    });
  });
  
  // Add sticky header detection for payload headers
  const tabContent = document.getElementById('tab-content');
  const observerOptions = {
    root: tabContent,
    threshold: [1],
    rootMargin: '-1px 0px 0px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const header = entry.target;
      if (entry.intersectionRatio < 1) {
        header.classList.add('stuck');
      } else {
        header.classList.remove('stuck');
      }
    });
  }, observerOptions);
  
  resultsContainer.querySelectorAll('.payload-header').forEach(header => {
    observer.observe(header);
  });
  
  // Apply current search if active
  if (state.payloadSearch.text && state.payloadSearch.text.length >= 2) {
    searchPayloads(state.payloadSearch.text);
  }
}

// Render request list
function renderRequestList() {
  requestList.innerHTML = '';
  
  // Re-add resizer
  const resizerElement = document.createElement('div');
  resizerElement.id = 'resizer';
  requestList.appendChild(resizerElement);
  
  const filteredRequests = state.requests.filter(req => matchesFilter(req.fullUrl));
  
  filteredRequests.forEach(req => {
    const item = document.createElement('div');
    item.className = 'request-item';
    if (req.id === state.selectedRequestId) {
      item.classList.add('selected');
    }
    
    item.innerHTML = `
      <div class="request-url">
        <span class="request-method">${req.method}</span>
        <span class="request-url-text">
          ${req.url}
          <span class="url-tooltip">${escapeHtml(req.fullUrl)}</span>
        </span>
        <span class="ndjson-badge">NDJSON</span>
      </div>
      <div class="request-status">Status: ${req.status || 'pending'} • ${req.payloadCount} payload(s)</div>
    `;
    
    // Add tooltip positioning on hover
    const urlText = item.querySelector('.request-url-text');
    const tooltip = item.querySelector('.url-tooltip');
    
    urlText.addEventListener('mouseenter', (e) => {
      const rect = urlText.getBoundingClientRect();
      tooltip.style.left = rect.left + 'px';
      tooltip.style.top = (rect.bottom + 4) + 'px';
    });
    
    item.addEventListener('click', () => {
      state.selectedRequestId = req.id;
      state.selectedRequestData = req.fullRequestData; // Store full request data
      renderRequestList();
      renderPayloads(req.parsed);
      renderHeaders(req.fullRequestData);
    });
    
    requestList.appendChild(item);
  });
  
  const totalCount = state.requests.length;
  const filteredCount = filteredRequests.length;
  
  if (state.filter.text) {
    info.textContent = `${filteredCount} of ${totalCount} NDJSON request(s) (filtered)`;
  } else {
    info.textContent = `${totalCount} NDJSON request(s) captured`;
  }
  
  // Re-attach resizer functionality
  initializeResizer();
}

// Listen for network requests
chrome.devtools.network.onRequestFinished.addListener(async (request) => {
  try {
    // Get REQUEST body instead of response
    const postData = request.request.postData;
    
    if (!postData || !postData.text) return;
    
    const contentType = request.request.headers.find(
      h => h.name.toLowerCase() === 'content-type'
    )?.value || '';
    
    if (isNDJSON(contentType, postData.text)) {
      const parsed = parseNDJSON(postData.text);
      
      const fullRequestData = {
        fullUrl: request.request.url,
        method: request.request.method,
        status: request.response.status,
        remoteAddress: request.serverIPAddress || 'N/A',
        referrerPolicy: request.request.referrerPolicy || 'N/A',
        requestHeaders: request.request.headers || [],
        responseHeaders: request.response.headers || []
      };
      
      const requestData = {
        id: `${request.request.url}-${Date.now()}`,
        url: new URL(request.request.url).pathname,
        fullUrl: request.request.url,
        method: request.request.method,
        status: request.response.status,
        contentType,
        parsed,
        payloadCount: parsed.results.length,
        fullRequestData
      };
      
      state.requests.unshift(requestData);
      renderRequestList();
      
      // Auto-select first request if none selected and it matches filter
      if (!state.selectedRequestId && matchesFilter(requestData.fullUrl)) {
        state.selectedRequestId = requestData.id;
        state.selectedRequestData = fullRequestData;
        renderPayloads(parsed);
        renderHeaders(fullRequestData);
      }
    }
  } catch (error) {
    console.error('Error processing request:', error);
  }
});

// Initialize resizer functionality
function initializeResizer() {
  const resizerElement = document.getElementById('resizer');
  if (!resizerElement) return;
  
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;
  
  resizerElement.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = requestList.offsetWidth;
    resizerElement.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    const diff = e.clientX - startX;
    const newWidth = startWidth + diff;
    
    // Respect min and max width
    if (newWidth >= 200 && newWidth <= 600) {
      requestList.style.width = newWidth + 'px';
    }
  });
  
  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizerElement.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

// Clear button
clearBtn.addEventListener('click', () => {
  state.requests = [];
  state.selectedRequestId = null;
  state.selectedRequestData = null;
  state.payloadSearch.text = '';
  payloadSearchInput.value = '';
  renderRequestList();
  const resultsContainer = document.getElementById('payload-results');
  if (resultsContainer) resultsContainer.innerHTML = '';
  headersPanel.innerHTML = '';
  tabs.style.display = 'none';
  emptyState.style.display = 'flex';
  info.textContent = 'Monitoring network requests...';
});

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.getAttribute('data-tab');
    
    // Update tab active states
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update panel active states
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    if (tabName === 'payload') {
      payloadPanel.classList.add('active');
    } else if (tabName === 'headers') {
      headersPanel.classList.add('active');
    }
  });
});

// Filter input with auto-detect regex
filterInput.addEventListener('input', (e) => {
  state.filter.text = e.target.value;
  renderRequestList();
  
  // If current selection is filtered out, clear it
  const selectedRequest = state.requests.find(req => req.id === state.selectedRequestId);
  if (selectedRequest && !matchesFilter(selectedRequest.fullUrl)) {
    state.selectedRequestId = null;
    state.selectedRequestData = null;
    payloadPanel.innerHTML = '';
    headersPanel.innerHTML = '';
    tabs.style.display = 'none';
    emptyState.style.display = 'flex';
  }
});

// Handle search input clear button (native x button)
filterInput.addEventListener('search', () => {
  // Triggered when native clear button is clicked
  if (filterInput.value === '') {
    state.filter.text = '';
    renderRequestList();
  }
});

// Payload search handler with debounce
let payloadSearchTimeout;
payloadSearchInput.addEventListener('input', (e) => {
  const searchText = e.target.value;
  state.payloadSearch.text = searchText;
  
  // Clear previous timeout
  clearTimeout(payloadSearchTimeout);
  
  // Only search if 2+ characters or empty (to clear)
  if (searchText.length === 0 || searchText.length >= 2) {
    // Debounce: wait 300ms after user stops typing
    payloadSearchTimeout = setTimeout(() => {
      searchPayloads(searchText);
    }, 300);
  }
});

// Handle payload search clear
payloadSearchInput.addEventListener('search', () => {
  if (payloadSearchInput.value === '') {
    state.payloadSearch.text = '';
    searchPayloads('');
  }
});

// Initial render
renderRequestList();
initializeResizer();
