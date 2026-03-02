// Default configuration
const DEFAULT_CONFIG = {
  serverHost: 'http://192.168.10.213:14444',
  divisionId: 'MA',
  theme: 'dark'
};

const STORAGE_KEY = 'asoft-server-config';

// Load configuration on page load
document.addEventListener('DOMContentLoaded', async () => {
  const config = await loadConfig();
  
  document.getElementById('serverHost').value = config.serverHost;
  document.getElementById('divisionId').value = config.divisionId;
  
  // Set selected theme
  const themeRadio = document.getElementById(`theme${config.theme.charAt(0).toUpperCase() + config.theme.slice(1)}`);
  if (themeRadio) {
    themeRadio.checked = true;
  }
});

// Save configuration on button click
document.getElementById('saveBtn').addEventListener('click', async () => {
  const serverHost = document.getElementById('serverHost').value.trim();
  const divisionId = document.getElementById('divisionId').value.trim();
  const theme = document.querySelector('input[name="theme"]:checked').value;
  const statusDiv = document.getElementById('statusMessage');

  // Validate inputs
  if (!serverHost) {
    showStatus('Vui lòng nhập URL máy chủ', 'error');
    return;
  }

  if (!divisionId) {
    showStatus('Vui lòng nhập mã phòng ban', 'error');
    return;
  }

  // Validate URL format
  try {
    new URL(serverHost);
  } catch (e) {
    showStatus('URL không hợp lệ. Vd: http://192.168.10.213:14444', 'error');
    return;
  }

  // Save to storage
  const config = {
    serverHost: serverHost,
    divisionId: divisionId,
    theme: theme,
    savedAt: new Date().toISOString()
  };

  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: config });
    showStatus('✅ Cấu hình đã được lưu thành công!', 'success');
  } catch (err) {
    console.error('Save error:', err);
    showStatus('❌ Lỗi khi lưu cấu hình. Vui lòng thử lại.', 'error');
  }
});

// Load configuration from storage
async function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY]) {
        resolve(result[STORAGE_KEY]);
      } else {
        // Return default if not configured
        resolve(DEFAULT_CONFIG);
      }
    });
  });
}

// Show status message
function showStatus(message, type) {
  const statusDiv = document.getElementById('statusMessage');
  statusDiv.textContent = message;
  statusDiv.className = `status-message ${type}`;

  if (type === 'success') {
    setTimeout(() => {
      statusDiv.className = 'status-message';
    }, 3000);
  }
}
