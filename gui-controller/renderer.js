// Renderer process script for Bunubon GUI Controller

// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('statusText');
const statusSubtext = document.getElementById('statusSubtext');
const statusIndicator = document.getElementById('statusIndicator');
const uptimeCard = document.getElementById('uptimeCard');
const uptimeValue = document.getElementById('uptimeValue');
const activityLogContent = document.getElementById('activityLogContent');
const serverLogContent = document.getElementById('serverLogContent');
const errorLogContent = document.getElementById('errorLogContent');
const logHeaderTitle = document.getElementById('logHeaderTitle');
const clearLogBtn = document.getElementById('clearLogBtn');
const refreshLogBtn = document.getElementById('refreshLogBtn');
const portValue = document.getElementById('portValue');
const initTime = document.getElementById('initTime');
const logTabs = document.querySelectorAll('.log-tab');

// Set initialization time
initTime.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });

// State
let isServerRunning = false;
let uptimeInterval = null;
let currentTab = 'activity';

// Initialize
async function init() {
  // Check initial server status
  try {
    const status = await window.electronAPI.getServerStatus();
    updateServerState(status.isRunning);
    portValue.textContent = status.port;
  } catch (error) {
    addLogEntry('Failed to check server status', 'error');
  }

  // Set up event listeners
  startBtn.addEventListener('click', handleStart);
  stopBtn.addEventListener('click', handleStop);
  clearLogBtn.addEventListener('click', handleClearLog);
  refreshLogBtn.addEventListener('click', handleRefreshLog);

  // Tab switching
  logTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Listen for server status updates
  window.electronAPI.onServerStatus((data) => {
    addLogEntry(data.message, data.type);
  });

  window.electronAPI.onServerStateChange((running) => {
    updateServerState(running);
  });
}

// Switch log tab
function switchTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  logTabs.forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  
  // Update log content visibility
  activityLogContent.classList.toggle('active', tab === 'activity');
  serverLogContent.classList.toggle('active', tab === 'server');
  errorLogContent.classList.toggle('active', tab === 'error');
  
  // Update header title
  const titles = {
    activity: 'Activity Log',
    server: 'Server Log',
    error: 'Error Log'
  };
  logHeaderTitle.textContent = titles[tab] || 'Log';
  
  // Auto-refresh when switching to server/error tabs
  if (tab === 'server') {
    loadServerLogs();
  } else if (tab === 'error') {
    loadErrorLogs();
  }
}

// Load server logs
async function loadServerLogs() {
  try {
    const logs = await window.electronAPI.getServerLogs();
    if (logs && logs.length > 0) {
      serverLogContent.innerHTML = logs.map(log => `
        <div class="log-entry info">
          <span class="log-time">${log.time}</span>
          <span class="log-message">${escapeHtml(log.message)}</span>
        </div>
      `).join('');
      serverLogContent.scrollTop = serverLogContent.scrollHeight;
    } else {
      serverLogContent.innerHTML = `
        <div class="log-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="12" y1="4" x2="12" y2="4"></line>
          </svg>
          <p>No server logs available</p>
        </div>
      `;
    }
  } catch (error) {
    serverLogContent.innerHTML = `
      <div class="log-entry error">
        <span class="log-message">Failed to load server logs: ${error.message}</span>
      </div>
    `;
  }
}

// Load error logs
async function loadErrorLogs() {
  try {
    const logs = await window.electronAPI.getErrorLogs();
    if (logs && logs.length > 0) {
      errorLogContent.innerHTML = logs.map(log => `
        <div class="log-entry error">
          <span class="log-time">${log.time}</span>
          <span class="log-message">${escapeHtml(log.message)}</span>
        </div>
      `).join('');
      errorLogContent.scrollTop = errorLogContent.scrollHeight;
    } else {
      errorLogContent.innerHTML = `
        <div class="log-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>No error logs available</p>
        </div>
      `;
    }
  } catch (error) {
    errorLogContent.innerHTML = `
      <div class="log-entry error">
        <span class="log-message">Failed to load error logs: ${error.message}</span>
      </div>
    `;
  }
}

// Handle refresh log button
function handleRefreshLog() {
  if (currentTab === 'server') {
    loadServerLogs();
  } else if (currentTab === 'error') {
    loadErrorLogs();
  }
}

// Handle clear log button
function handleClearLog() {
  if (currentTab === 'activity') {
    activityLogContent.innerHTML = `
      <div class="log-entry info">
        <span class="log-time">${new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
        <span class="log-message">Log cleared</span>
      </div>
    `;
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Update server state UI
function updateServerState(running) {
  isServerRunning = running;

  if (running) {
    // Update status card
    statusText.textContent = 'Server Running';
    statusSubtext.textContent = 'Click Stop to shutdown the server';
    
    // Update indicator
    statusIndicator.innerHTML = `
      <div class="status-dot running">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    `;

    // Show uptime card
    uptimeCard.style.display = 'block';
    startUptimeTimer();

    // Update buttons
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    // Update status card
    statusText.textContent = 'Server Stopped';
    statusSubtext.textContent = 'Click Start to launch the server';
    
    // Update indicator
    statusIndicator.innerHTML = `
      <div class="status-dot stopped">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
    `;

    // Hide uptime card
    uptimeCard.style.display = 'none';
    stopUptimeTimer();
    uptimeValue.textContent = '00:00:00';

    // Update buttons
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

// Handle start button click
async function handleStart() {
  try {
    startBtn.disabled = true;
    addLogEntry('Starting server...', 'info');
    await window.electronAPI.startServer();
  } catch (error) {
    addLogEntry(`Failed to start server: ${error.message}`, 'error');
    startBtn.disabled = false;
  }
}

// Handle stop button click
async function handleStop() {
  try {
    stopBtn.disabled = true;
    addLogEntry('Stopping server...', 'info');
    await window.electronAPI.stopServer();
  } catch (error) {
    addLogEntry(`Failed to stop server: ${error.message}`, 'error');
    stopBtn.disabled = false;
  }
}

// Add log entry
function addLogEntry(message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;

  const time = document.createElement('span');
  time.className = 'log-time';
  time.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });

  const msg = document.createElement('span');
  msg.className = 'log-message';
  msg.textContent = message;

  entry.appendChild(time);
  entry.appendChild(msg);

  activityLogContent.appendChild(entry);
  activityLogContent.scrollTop = activityLogContent.scrollHeight;
}

// Start uptime timer
function startUptimeTimer() {
  if (uptimeInterval) {
    clearInterval(uptimeInterval);
  }
  
  uptimeInterval = setInterval(async () => {
    try {
      const uptime = await window.electronAPI.getUptime();
      uptimeValue.textContent = uptime;
    } catch (error) {
      console.error('Failed to get uptime:', error);
    }
  }, 1000);
}

// Stop uptime timer
function stopUptimeTimer() {
  if (uptimeInterval) {
    clearInterval(uptimeInterval);
    uptimeInterval = null;
  }
}

// Initialize on load
init();
