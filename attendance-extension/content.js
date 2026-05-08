// remove old
document.getElementById("attendance-ext")?.remove();

/* ========= SERVER CONFIGURATION ========= */
let SERVER_CONFIG = {
  serverHost: 'http://192.168.10.213:14444',
  divisionId: 'MA',
  theme: 'dark'
};

async function loadServerConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['asoft-server-config'], (result) => {
      if (result['asoft-server-config']) {
        SERVER_CONFIG = result['asoft-server-config'];
      }
      console.log('[Attendance Dashboard] Server Config:', SERVER_CONFIG);
      applyTheme(SERVER_CONFIG.theme || 'dark');
      resolve(SERVER_CONFIG);
    });
  });
}

/* ========= THEME MANAGEMENT ========= */
function applyTheme(themeName) {
  const container = document.getElementById('attendance-ext');
  if (!container) return;

  // Remove all theme classes
  container.classList.remove('theme-dark', 'theme-light', 'theme-spring', 'theme-summer', 'theme-autumn', 'theme-winter');

  // Add the selected theme class (skip dark as it's default)
  if (themeName !== 'dark') {
    container.classList.add(`theme-${themeName}`);
  }

  // Update active state in UI
  document.querySelectorAll('.theme-selector button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === themeName);
  });

  // Save to config and sync
  SERVER_CONFIG.theme = themeName;
  chrome.storage.sync.set({ 'asoft-server-config': SERVER_CONFIG });

  console.log(`[Attendance Dashboard] Theme applied: ${themeName}`);
}

/* ========= STORAGE & CACHE ========= */
const STORAGE_KEY = "asoft-attendance-config";
const config = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"top":"5vh","left":"5vw","width":"85vw","height":"90vh","zoom":1}');
const DETAIL_CACHE = new Map();
let currentZoom = config.zoom || 1;
const formatMonth = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
let SELECTED_MONTH = formatMonth(new Date());
let PICKER_YEAR = parseInt(SELECTED_MONTH.split("-")[0]);

/* ========= MODERN UI & MODAL ========= */
const app = document.createElement("div");
app.id = "attendance-ext";
app.innerHTML = `
<div id="glassRoot" style="top: ${config.top}; left: ${config.left}; width: ${config.width}; height: ${config.height};">
  <div class="glass-header" id="dragHeader">
    <div class="brand">
      <div class="icon-box">📅</div>
      <div>
        <h1>Attendance Dashboard</h1>
        <div id="userInfo" class="user-badge">Đang tải...</div>
      </div>
    </div>
    <div class="actions">
      <div class="theme-selector">
        <button data-theme="dark" title="Dark" style="background: #0f172a"></button>
        <button data-theme="light" title="Light" style="background: #f8fafc"></button>
        <button data-theme="spring" title="Spring" style="background: #fce7f3"></button>
        <button data-theme="summer" title="Summer" style="background: #fefce8"></button>
        <button data-theme="autumn" title="Autumn" style="background: #fef2f2"></button>
        <button data-theme="winter" title="Winter" style="background: #f0f9ff"></button>
      </div>
      <button id="exportBtn" class="btn-secondary" title="Xuất báo cáo">📥</button>
      <div class="zoom-controls">
        <button id="zoomOut" title="Thu nhỏ">➖</button>
        <span id="zoomLevel">100%</span>
        <button id="zoomIn" title="Phóng to">➕</button>
      </div>
      <button id="minimizeBtn" title="Thu nhỏ/Phóng to">➖</button>
      <button id="closeBtn" title="Đóng">✕</button>
    </div>
  </div>

  <div class="dashboard-grid">
    <div class="stats-panel">
      <div class="stat-card" data-type="work">
        <div class="stat-icon">💼</div>
        <div class="stat-info">
          <span class="stat-label">Ngày công</span>
          <span class="stat-value" id="statWorkDays">0</span>
        </div>
      </div>
      <div class="stat-card" data-type="late">
        <div class="stat-icon yellow">⚠️</div>
        <div class="stat-info">
          <span class="stat-label">Đi trễ</span>
          <span class="stat-value warning" id="statLate">0</span>
        </div>
      </div>
      <div class="stat-card" data-type="early">
        <div class="stat-icon red">🏃</div>
        <div class="stat-info">
          <span class="stat-label">Về sớm</span>
          <span class="stat-value danger" id="statEarly">0</span>
        </div>
      </div>
      <div class="stat-card" data-type="ot150">
        <div class="stat-icon purple">🚀</div>
        <div class="stat-info">
          <span class="stat-label">OT 150%</span>
          <span class="stat-value" id="statOT150">0h</span>
        </div>
      </div>
      <div class="stat-card" data-type="ot200">
        <div class="stat-icon purple" style="filter: hue-rotate(45deg);">🔥</div>
        <div class="stat-info">
          <span class="stat-label">OT 200%</span>
          <span class="stat-value" id="statOT200">0h</span>
        </div>
      </div>
      <div class="stat-card" data-type="actual">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">⚡</div>
        <div class="stat-info">
          <span class="stat-label">Công thực tế</span>
          <span class="stat-value" id="statActualWork">0h</span>
        </div>
      </div>
      <div class="stat-card" data-type="salary">
        <div class="stat-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">💰</div>
        <div class="stat-info">
          <span class="stat-label">Công tính lương</span>
          <span class="stat-value" id="statSalaryWork">0h</span>
        </div>
      </div>
      <div class="stat-card" data-type="standard">
        <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">📋</div>
        <div class="stat-info">
          <span class="stat-label">Giờ công tiêu chuẩn</span>
          <span class="stat-value" id="statStandardWork">0h</span>
        </div>
      </div>
      <div class="stat-card" data-type="deficit">
        <div class="stat-icon" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">⚠️</div>
        <div class="stat-info">
          <span class="stat-label">Công thiếu</span>
          <span class="stat-value danger" id="statDeficitWork">0h</span>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="calendar-controls">
        <div class="month-nav">
          <button id="prevMonth" class="nav-btn">◀</button>
          <div class="month-display" id="monthDPTrigger">
            <span id="monthText">March 2026</span>
            <span class="icon" style="font-size: 10px; margin-left: 4px;">▼</span>
            <div id="monthPickerPopup" class="month-picker-popup" style="display: none;"></div>
          </div>
          <button id="nextMonth" class="nav-btn">▶</button>
        </div>
        <button id="loadBtn" class="btn-primary">
          <span class="icon">🔄</span> Cập nhật
        </button>
      </div>

      <div id="calendar" class="calendar-grid"></div>
      
      <div class="legend">
        <div class="legend-item"><span class="dot normal"></span> Đúng giờ</div>
        <div class="legend-item"><span class="dot warning"></span> Đi trễ</div>
        <div class="legend-item"><span class="dot danger"></span> Về sớm</div>
        <div class="legend-item"><span class="dot forgot"></span> Quên chấm</div>
        <div class="legend-item"><span class="dot absent"></span> Nghỉ</div>
        <div class="legend-item"><span class="dot request"></span> Có đơn</div>
        <div class="legend-item"><span class="dot ot"></span> Làm thêm (OT)</div>
      </div>
    </div>
  </div>
  <div id="resizeHandle" class="resize-handle"></div>
</div>

<!-- DETAILED MODAL -->
<div id="detailModal" class="modal-overlay" style="display: none;">
  <div class="modal-content">
    <div class="modal-header">
      <div class="modal-header-title">
        <h2 id="modalTitle">Chi tiết ngày 01/01/2026</h2>
        <button id="openCreateFormBtn" class="btn-secondary" style="padding: 4px 8px; font-size: 12px;" title="Tạo đơn mới cho ngày này">
          <span class="icon">➕</span> Đơn mới
        </button>
      </div>
      <button id="closeModal">✕</button>
    </div>
    <div id="modalBody" class="modal-body">
      <!-- Content injected here -->
    </div>
  </div>
</div>

<!-- CREATE REQUEST MODAL -->
<div id="createRequestModal" class="modal-overlay" style="display: none; z-index: 1000001;">
  <div class="modal-content" style="width: 100%;     max-height: 100%; overflow: overlay;">
    <div class="modal-header">
      <div class="modal-header-title">
        <h2 id="createModalTitle">Tạo đơn mới</h2>
      </div>
      <button id="closeCreateModal">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-row-req">
        <div class="form-group" style="flex: 1;">
          <label class="req-label">Loại đơn</label>
          <select id="requestTypeSelect" class="form-control">
            <option value="DXNP">Đơn xin nghỉ phép (DXNP)</option>
            <option value="DXLTG">Đơn xin làm thêm giờ (DXLTG)</option>
            <option value="DXBSQT">Đơn xin bổ sung quẹt thẻ (DXBSQT)</option>
            <option value="DXRN">Đơn xin ra ngoài (DXRN)</option>
            <option value="DXDC">Đơn xin đổi ca (DXDC)</option>
          </select>
        </div>
        <div class="form-group" style="flex: 1;">
          <label class="req-label">Khối</label>
          <select id="requestDepartmentSelect" class="form-control">
            <!-- Populated via JS -->
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="req-label">Diễn giải (Tóm tắt)</label>
        <input type="text" id="requestDescription" class="form-control" placeholder="Ví dụ: Nghỉ phép giải quyết việc riêng...">
      </div>
      
      <div id="dynamicFields" class="dynamic-area">
        <!-- Chèn động các trường theo loại đơn -->
      </div>

      <div class="form-row-req">
        <div class="form-group" style="flex: 1;" id="approverGroup">
          <label class="req-label">Người duyệt</label>
          <div class="approver-container">
            <input type="text" id="approverSearch" class="form-control" placeholder="Tìm ID/Tên..." autocomplete="off">
            <input type="hidden" id="approverSelect" value="">
            <div id="approverResults" class="approver-results"></div>
          </div>
        </div>
        <div class="form-group" style="flex: 1;" id="placeGroup">
          <label class="req-label">Địa điểm (nếu đi ra ngoài)</label>
          <input type="text" id="requestPlace" class="form-control" placeholder="Nơi đến...">
        </div>
      </div>

      <div class="form-group">
        <label class="req-label">Lý do chi tiết & Ghi chú</label>
        <textarea id="requestReason" class="form-control" rows="2" placeholder="Nhập lý do chi tiết hoặc ghi chú thêm..."></textarea>
      </div>

      <div id="createStatus" class="status-box" style="display: none;"></div>
    </div>
    <div class="modal-footer" style="padding-top: 16px; border-top: 1px solid var(--border-glass);">
      <button id="submitRequest" class="btn-primary" style="width: 100%; justify-content: center; height: 44px; font-size: 15px;">
        <span class="icon">🚀</span> Gửi đơn
      </button>
    </div>
  </div>
</div>`;
document.body.appendChild(app);

/* ========= PREMIUM STYLES ========= */
const style = document.createElement("style");
style.innerHTML = `
:root {
  /* Dark Theme (Default) */
  --bg-glass: rgba(15, 23, 42, 0.92);
  --border-glass: rgba(255, 255, 255, 0.1);
  --primary: #10b981;
  --primary-glow: rgba(16, 185, 129, 0.3);
  --warning: #f59e0b;
  --danger: #ef4444;
  --forgot: #fb923c;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --card-bg: rgba(30, 41, 59, 0.6);
  --accent: #3b82f6;
  --request: #a855f7;
  --skeleton-bg: rgba(255, 255, 255, 0.05);
  --skeleton-shimmer: rgba(255, 255, 255, 0.12);
}

/* Light Theme */
#attendance-ext.theme-light {
  --bg-glass: rgba(248, 250, 252, 0.98);
  --border-glass: rgba(0, 0, 0, 0.1);
  --primary: #0d9488;
  --primary-glow: rgba(13, 148, 136, 0.2);
  --warning: #d97706;
  --danger: #dc2626;
  --forgot: #f97316;
  --text-main: #1e293b;
  --text-muted: #475569;
  --card-bg: rgba(241, 245, 249, 0.8);
  --accent: #2563eb;
  --request: #9333ea;
  --skeleton-bg: rgba(0, 0, 0, 0.06);
  --skeleton-shimmer: rgba(0, 0, 0, 0.12);
}

/* Spring Theme (Pink/Purple) */
#attendance-ext.theme-spring {
  --bg-glass: rgba(252, 231, 243, 0.95);
  --border-glass: rgba(236, 72, 153, 0.2);
  --primary: #ec4899;
  --primary-glow: rgba(236, 72, 153, 0.3);
  --warning: #a855f7;
  --danger: #ec4899;
  --forgot: #f472b6;
  --text-main: #500724;
  --text-muted: #be185d;
  --card-bg: rgba(244, 215, 231, 0.6);
  --accent: #a855f7;
  --request: #db2777;
  --skeleton-bg: rgba(236, 72, 153, 0.1);
  --skeleton-shimmer: rgba(236, 72, 153, 0.2);
}

/* Summer Theme (Yellow/Orange) */
#attendance-ext.theme-summer {
  --bg-glass: rgba(254, 252, 232, 0.95);
  --border-glass: rgba(217, 119, 6, 0.2);
  --primary: #ea580c;
  --primary-glow: rgba(234, 88, 12, 0.3);
  --warning: #9a3412;
  --danger: #9a3412;
  --forgot: #ea580c;
  --text-main: #431407;
  --text-muted: #9a3412;
  --card-bg: rgba(254, 215, 170, 0.4);
  --accent: #ea580c;
  --request: #9a3412;
  --skeleton-bg: rgba(234, 88, 12, 0.1);
  --skeleton-shimmer: rgba(234, 88, 12, 0.2);
}

/* Autumn Theme (Orange/Brown) */
#attendance-ext.theme-autumn {
  --bg-glass: rgba(254, 242, 242, 0.95);
  --border-glass: rgba(217, 70, 39, 0.2);
  --primary: #92400e;
  --primary-glow: rgba(146, 64, 14, 0.3);
  --warning: #dc2626;
  --danger: #b45309;
  --forgot: #d97706;
  --text-main: #431407;
  --text-muted: #92400e;
  --card-bg: rgba(254, 215, 170, 0.6);
  --accent: #d97706;
  --request: #b45309;
  --skeleton-bg: rgba(146, 64, 14, 0.1);
  --skeleton-shimmer: rgba(146, 64, 14, 0.2);
}

/* Winter Theme (Blue/Cyan) */
#attendance-ext.theme-winter {
  --bg-glass: rgba(240, 249, 255, 0.96);
  --border-glass: rgba(3, 169, 244, 0.2);
  --primary: #0369a1;
  --primary-glow: rgba(3, 105, 161, 0.3);
  --warning: #0369a1;
  --danger: #0369a1;
  --forgot: #0369a1;
  --text-main: #0c4a6e;
  --text-muted: #0369a1;
  --card-bg: rgba(186, 230, 253, 0.4);
  --accent: #0284c7;
  --request: #0369a1;
  --skeleton-bg: rgba(3, 105, 161, 0.1);
  --skeleton-shimmer: rgba(3, 105, 161, 0.2);
}

#glassRoot {
  position: fixed;
  min-width: 480px; min-height: 380px;
  max-width: 98vw; max-height: 98vh;
  backdrop-filter: blur(25px) saturate(200%);
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  border-radius: 24px;
  padding: 24px;
  color: var(--text-main);
  z-index: 999999;
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255,255,255,0.05);
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  display: flex; flex-direction: column;
  box-sizing: border-box;
  transform-origin: top left;
  overflow: hidden;
  transition: width 0.3s ease, height 0.3s ease, top 0.3s ease, left 0.3s ease;
}
#glassRoot.resizing, #glassRoot.dragging { transition: none; }
.actions { display: flex; align-items: center; gap: 12px; }
.glass-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; cursor: move; user-select: none; }
.brand { display: flex; gap: 12px; align-items: center; pointer-events: none; }
.brand h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
.icon-box { width: 40px; height: 40px; background: var(--primary-glow); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }

#minimizeBtn { background: rgba(255,255,255,0.1); border: none; color: var(--text-main); width: 28px; height: 28px; border-radius: 50%; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 10px; }
#minimizeBtn:hover { background: var(--accent); color: #fff; }

#closeBtn { background: rgba(255,255,255,0.1); border: none; color: #ff0000; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
#closeBtn:hover { background: var(--danger); color: #fff; transform: rotate(90deg); }

#glassRoot.minimized {
  height: 60px !important;
  width: 260px !important;
  min-height: 0 !important;
  min-width: 0 !important;
  padding: 12px 16px !important;
  border-radius: 30px;
}
#glassRoot.minimized .dashboard-grid, 
#glassRoot.minimized .resize-handle {
  display: none !important;
}
#glassRoot.minimized .brand h1,
#glassRoot.minimized .user-badge,
#glassRoot.minimized .theme-selector,
#glassRoot.minimized #exportBtn,
#glassRoot.minimized .zoom-controls {
  display: none !important;
}
#glassRoot.minimized .glass-header {
  margin-bottom: 0;
}
#glassRoot.minimized .icon-box {
  width: 32px; height: 32px; font-size: 16px;
}
#glassRoot.minimized .brand::after {
  content: 'Dashboard';
  font-size: 14px;
  font-weight: 700;
  margin-left: 8px;
}

.zoom-controls { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 20px; border: 1px solid var(--border-glass); }
#attendance-ext[class*="theme-"] .zoom-controls { background: rgba(0,0,0,0.05); }
.zoom-controls button { background: none; border: none; color: var(--text-main); cursor: pointer; padding: 2px 6px; font-size: 14px; transition: opacity 0.2s; }
.zoom-controls button:hover { opacity: 0.7; }
#zoomLevel { font-size: 11px; font-weight: 700; color: var(--text-muted); min-width: 35px; text-align: center; }

.theme-selector { display: flex; gap: 6px; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 20px; border: 1px solid var(--border-glass); }
#attendance-ext[class*="theme-"] .theme-selector { background: rgba(0,0,0,0.05); }
.theme-selector button { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: transform 0.2s; }
.theme-selector button:hover { transform: scale(1.2); }
.theme-selector button.active { border: 2px solid var(--primary); transform: scale(1.2); }

.dashboard-grid { 
  display: grid; 
  grid-template-columns: 220px 1fr; 
  gap: 24px; 
  flex: 1; 
  overflow: hidden; 
  padding-bottom: 8px;
}
.main-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
#calendar {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
}
#calendar::-webkit-scrollbar { width: 5px; }
#calendar::-webkit-scrollbar-thumb { background: var(--border-glass); border-radius: 10px; }

/* RESPONSIVE LAYOUTS */
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 12px; width: 100%; }

#glassRoot.size-small .stats-panel,
#glassRoot.size-medium .stats-panel { display: none; }
#glassRoot.size-small .dashboard-grid,
#glassRoot.size-medium .dashboard-grid { grid-template-columns: 1fr; }

#glassRoot.size-small .day, #glassRoot.size-medium .day { min-height: 70px; padding: 6px; gap: 4px; }
#glassRoot.size-small .day-num, #glassRoot.size-medium .day-num { font-size: 12px; }
#glassRoot.size-small .time-tag, #glassRoot.size-medium .time-tag { font-size: 9px; padding: 2px 4px; gap: 3px; }
#glassRoot.size-small .icon, #glassRoot.size-medium .icon { font-size: 10px; }
#glassRoot.size-small .weekday, #glassRoot.size-medium .weekday { padding: 4px; font-size: 10px; }

.stats-panel { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
  overflow-y: auto; 
  padding-right: 4px;
}
.stats-panel::-webkit-scrollbar { width: 4px; }
.stats-panel::-webkit-scrollbar-thumb { background: var(--border-glass); border-radius: 10px; }

.stat-card {
  background: var(--card-bg); border: 1px solid var(--border-glass);
  padding: 10px 14px; border-radius: 16px;
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.stat-card:hover { 
  transform: translateY(-4px) scale(1.02); 
  background: rgba(255,255,255,0.12); 
  border-color: var(--primary);
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
}
.stat-card.active { border-color: var(--accent); background: rgba(59, 130, 246, 0.25); box-shadow: 0 0 20px var(--primary-glow); }

.stat-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(255,255,255,0.05);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; border: 1px solid var(--border-glass);
  transition: all 0.3s;
}
  .stat-icon.yellow { color: #f59e0b; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.2); }
  .stat-icon.red { color: #ef4444; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); }
  .stat-icon.purple { color: #a855f7; background: rgba(168, 85, 247, 0.1); border-color: rgba(168, 85, 247, 0.2); }
.stat-card:hover .stat-icon { transform: rotate(10deg) scale(1.1); background: rgba(255,255,255,0.1); }

.stat-info { display: flex; flex-direction: column; gap: 0px; }
.stat-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); opacity: 0.8; }
.stat-value { font-size: 20px; font-weight: 800; color: var(--text-main); font-variant-numeric: tabular-nums; line-height: 1.1; }
.stat-value.warning { color: #fbbf24; }
.stat-value.danger { color: #f87171; }

.calendar-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: var(--card-bg); padding: 8px 12px; border-radius: 12px; border: 1px solid var(--border-glass); }
.month-nav { display: flex; align-items: center; gap: 10px; }
.nav-btn { background: rgba(255,255,255,0.1); border: none; color: var(--text-main); width: 32px; height: 32px; border-radius: 8px; cursor: pointer; }
#attendance-ext[class*="theme-"] .nav-btn { background: rgba(0,0,0,0.05); }
#monthPicker { background: transparent; border: none; color: var(--text-main); font-weight: 700; font-size: 15px; outline: none; cursor: pointer; }
.btn-primary { background: var(--primary); color: #fff; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; transition: all 0.2s; }
.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

.weekday { text-align: center; padding: 8px; font-size: 12px; font-weight: 700; color: var(--text-muted); }

.day {
  background: var(--card-bg); border: 1px solid var(--border-glass);
  min-height: 90px; border-radius: 14px; padding: 10px;
  display: flex; flex-direction: column; justify-content: flex-start;
  transition: transform 0.2s, border-color 0.2s; position: relative; overflow: hidden;
  cursor: pointer;
}
.day:hover { transform: translateY(-3px); border-color: var(--accent); background: rgba(255,255,255,0.08); }
.day.off-day { background: rgba(15, 23, 42, 0.4); opacity: 0.8; }
.day.ot-day { border: 2px solid #8b5cf6; background: rgba(139, 92, 246, 0.15); opacity: 1 !important; }
/* Đảm bảo text trong ngày nghỉ vẫn dễ đọc */
.day.off-day .day-num { color: var(--text-muted); }
.day.today { border: 2px solid var(--accent); }
.day.empty { opacity: 0.1; pointer-events: none; }

.day-num { font-size: 15px; font-weight: 800; margin-bottom: 6px; }

.time-box { display: flex; flex-direction: column; gap: 4px; }
.time-tag { font-size: 10px; font-weight: 600; padding: 3px 6px; border-radius: 6px; background: rgba(255,255,255,0.05); display: flex; align-items: center; gap: 4px; border: 1px solid rgba(255,255,255,0.05); }
.time-tag.late { color: var(--warning); background: rgba(245, 158, 11, 0.1); }
.time-tag.early { color: var(--danger); background: rgba(239, 68, 68, 0.1); }
.time-tag.normal { color: var(--primary); background: rgba(16, 185, 129, 0.1); }
.time-tag.forgot { color: var(--forgot); background: rgba(251, 146, 60, 0.1); border-color: rgba(251, 146, 60, 0.3); }
.time-tag.absent { color: #a855f7; background: rgba(168, 85, 247, 0.1); border-color: rgba(168, 85, 247, 0.2); }
.time-tag.req { border-left: 3px solid var(--request); color: var(--text-main); background: rgba(168, 85, 247, 0.15); font-weight: 700; letter-spacing: 0.2px; }
.time-tag.req.pending { border-left-color: var(--warning); }

.day.forgot { background: rgba(251, 146, 60, 0.05); border-style: dashed; }
.day.absent { background: rgba(168, 85, 247, 0.05); }
.day.pending-req { border-bottom: 2px solid var(--warning); }

.legend { display: flex; flex-wrap: wrap; gap: 16px; font-size: 11px; color: var(--text-muted); padding-top: 10px; }
.legend-item { display: flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.normal { background: var(--primary); }
.dot.warning { background: var(--warning); }
.dot.danger { background: var(--danger); }
.dot.forgot { background: var(--forgot); }
.dot.absent { background: #a855f7; }
.dot.request { background: var(--request); border: 1px solid #fff; }
.dot.ot { background: #8b5cf6; }

.resize-handle { position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.2) 50%); border-radius: 0 0 20px 0; cursor: nwse-resize; }

/* MODAL STYLES */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; z-index: 1000000;
  animation: fadeIn 0.3s;
}
.modal-content {
  background: var(--bg-glass); color: var(--text-main); width: 600px; max-width: 90%;
  border-radius: 24px; padding: 24px; border: 1px solid var(--border-glass);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(40px) saturate(180%);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-glass); padding-bottom: 12px; gap: 12px; }
.modal-header-title { display: flex; align-items: center; gap: 12px; flex: 1; }
.modal-header h2 { margin: 0; font-size: 20px; white-space: nowrap; }
#closeModal, #closeCreateModal { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; transition: color 0.2s; padding: 4px; display: flex; align-items: center; justify-content: center; }
#closeModal:hover, #closeCreateModal:hover { color: var(--danger); }

.modal-body {overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.req-item { background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 12px; padding: 16px; position: relative; }
.req-item h3 { margin: 0 0 8px 0; font-size: 14px; color: var(--request); text-transform: uppercase; }
.req-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.req-field { display: flex; flex-direction: column; }
.req-label { font-size: 11px; color: var(--text-muted); }
.req-val { font-size: 14px; font-weight: 500; }
.req-status { position: absolute; top: 16px; right: 16px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: var(--primary); }
.req-status.pending { background: var(--warning); color: #000; }

@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.skeleton { background: linear-gradient(90deg, var(--skeleton-bg) 25%, var(--skeleton-shimmer) 50%, var(--skeleton-bg) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-color: transparent !important; }
.skeleton-text { height: 12px; background: var(--skeleton-shimmer); border-radius: 4px; margin-bottom: 8px; opacity: 0.8; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes sweep { 0% { left: -100%; } 100% { left: 200%; } }
@keyframes glow-pulse { 0% { box-shadow: 0 0 5px var(--primary-glow); } 50% { box-shadow: 0 0 15px var(--primary-glow); } 100% { box-shadow: 0 0 5px var(--primary-glow); } }

/* V2.0 ADDITIONS */
.btn-secondary { background: var(--card-bg); border: 1px solid var(--border-glass); color: var(--text-main); padding: 6px 12px; border-radius: 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
.btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: var(--accent); transform: translateY(-1px); }
#attendance-ext.theme-light .btn-secondary:hover { background: rgba(0,0,0,0.05); }

.day.normal-work { animation: glow-pulse 3s infinite ease-in-out; }
.day::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transform: skewX(-25deg); transition: none; pointer-events: none; }
.day:hover::after { animation: sweep 0.8s ease-in-out; }

.stat-card { cursor: pointer; transition: all 0.3s; }
.stat-card:hover { transform: scale(1.02); background: rgba(255,255,255,0.1); }
.stat-card.active { border-color: var(--accent); background: rgba(59, 130, 246, 0.2); box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
#calendar.highlight-mode .day:not(.highlighted) { opacity: 0.3; filter: grayscale(0.5) blur(1px); transform: scale(0.98); }

.month-display { position: relative; cursor: pointer; padding: 6px 12px; border-radius: 8px; transition: background 0.2s; user-select: none; min-width: 140px; text-align: center; }
.month-display:hover { background: rgba(255,255,255,0.1); }
.month-picker-popup { position: absolute; top: 110%; left: 50%; transform: translateX(-50%); background: var(--bg-glass); backdrop-filter: blur(30px); border: 1px solid var(--border-glass); border-radius: 16px; padding: 16px; z-index: 1000; box-shadow: 0 20px 40px rgba(0,0,0,0.6); display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 260px; }
.mp-year-nav { grid-column: span 3; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border-glass); }
.mp-month-btn { padding: 8px; border-radius: 8px; border: 1px solid transparent; background: rgba(255,255,255,0.03); color: var(--text-main); cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
.mp-month-btn:hover { background: var(--accent); color: #fff; }
.mp-month-btn.active { background: var(--primary); color: #fff; }
.mp-today-btn { grid-column: span 3; margin-top: 8px; padding: 8px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid var(--border-glass); color: var(--text-main); font-weight: 700; cursor: pointer; }
.mp-today-btn:hover { background: rgba(255,255,255,0.15); }

/* FORM STYLES */
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-control {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border-glass);
  border-radius: 8px;
  padding: 10px;
  color: var(--text-main);
  font-family: inherit;
  font-size: 14px;
  outline: none;
}
.form-control:focus { border-color: var(--accent); background: rgba(255,255,255,0.1); }
select.form-control {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 36px;
}
select.form-control option { background: var(--bg-glass); color: var(--text-main); padding: 10px; }
.time-picker-grid { display: flex; gap: 4px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 12px; padding: 4px; }
.time-picker-grid select { background: transparent !important; border: none !important; text-align: center; padding-right: 20px !important; background-position: right 4px center !important; }
.time-picker-grid span { color: var(--text-muted); align-self: center; font-weight: 700; opacity: 0.5; }
.btn-ghost { background: transparent; border: 1px solid var(--border-glass); color: var(--text-main); padding: 8px 16px; border-radius: 10px; cursor: pointer; font-size: 13px; transition: all 0.2; }
.btn-ghost:hover { background: rgba(255,255,255,0.05); }
.btn-delete { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 11px; transition: all 0.2s; margin-top: 8px; display: inline-flex; align-items: center; gap: 4px; }
.btn-delete:hover { background: #ef4444; color: #fff; }

.form-row-req { display: flex; gap: 12px; margin-bottom: 12px; }
.asf-checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; user-select: none; }
.status-box { padding: 12px; border-radius: 10px; font-size: 13px; margin-top: 12px; border: 1px solid transparent; }
.status-box.success { background: rgba(16, 185, 129, 0.15); color: #10b981; border-color: rgba(16, 185, 129, 0.3); }
.status-box.danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }
.form-control:read-only { background: rgba(255,255,255,0.02); color: var(--text-muted); cursor: default; }
.asf-stepper { display: flex; align-items: center; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); border-radius: 10px; overflow: hidden; height: 38px; }
.asf-stepper button { width: 32px; height: 100%; border: none; background: rgba(255,255,255,0.03); color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all 0.2s; }
.asf-stepper button:hover { background: var(--accent); color: #fff; }
.asf-stepper span { flex: 1; text-align: center; font-weight: 700; font-size: 15px; min-width: 30px; user-select: none; }
.time-picker-row { display: flex; align-items: center; gap: 8px; }
.time-picker-row .asf-stepper { flex: 1; }
.time-picker-row .sep { color: var(--text-muted); font-weight: 700; opacity: 0.5; }

/* Searchable Approver */
.approver-container { position: relative; width: 100%; }
.approver-results {
  position: absolute; top: 100%; left: 0; right: 0;
  background: var(--bg-glass); border: 1px solid var(--border-glass);
  border-top: none; border-radius: 0 0 12px 12px;
  z-index: 2000; max-height: 200px; overflow-y: auto;
  display: none; box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  backdrop-filter: blur(20px);
}
.approver-item {
  padding: 10px 14px; cursor: pointer; color: var(--text-main);
  border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px;
  transition: background 0.2s;
}
.approver-item:hover { background: var(--accent); color: #fff; }
.approver-item span { color: var(--text-muted); font-size: 11px; margin-left: 8px; }
.approver-item:hover span { color: rgba(255,255,255,0.8); }

/* Global Cursor pointers */
button, .nav-btn, .mp-month-btn, .mp-today-btn, .theme-selector button, .month-display, .modal-header button { cursor: pointer !important; }

/* DRAG & DROP BÙ PHÉP */
.day.ot-day { cursor: grab; }
.day.ot-day:active { cursor: grabbing; }
.day.drag-source { opacity: 0.45; outline: 2px dashed #8b5cf6; outline-offset: -2px; cursor: grabbing !important; }
.day.drag-over { border: 2px solid var(--primary) !important; background: rgba(16,185,129,0.18) !important; transform: scale(1.04); box-shadow: 0 0 16px var(--primary-glow); }
.day.drag-valid { outline: 1px dashed var(--primary); outline-offset: -2px; }
.cs-card { background: rgba(255,255,255,0.03); border-radius: 14px; padding: 16px; }
.cs-info-banner { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 14px 16px; display: flex; gap: 14px; align-items: center; font-size: 13px; }
`;
document.head.appendChild(style);

/* ========= LOGIC: UTILS & API ========= */
const ABSENT_TYPES = [
  { id: "NP", text: "Nghỉ phép năm" },
  { id: "KL", text: "Nghỉ không lương" },
  { id: "GC50", text: "Công 50%" },
  { id: "CT", text: "Công tác" },
  { id: "BHXH", text: "Nghỉ BHXH" },
  { id: "NC", text: "Nghỉ cưới, ma chay" },
  { id: "BP", text: "Làm bù phép" },
  { id: "GC80", text: "Công 80%" },
  { id: "CN", text: "Nghỉ chế độ con nhỏ" },
  { id: "TX", text: "Trễ xe công ty" },
  { id: "TS", text: "Nghỉ thai sản" },
  { id: "NT1", text: "Nghỉ vợ sinh con" },
  { id: "BN", text: "Làm bù công nhật" }
];

const DEPARTMENT_LIST = [
  { id: "AGV", name: "AGV" },
  { id: "AI", name: "AI" },
  { id: "BOD", name: "Lãnh đạo" },
  { id: "HCNS", name: "Phòng HCNS" },
  { id: "ICT", name: "ICT" },
  { id: "KHO", name: "Phòng kho" },
  { id: "KT", name: "Kế toán" },
  { id: "LR", name: "Lắp rắp" },
  { id: "MDT", name: "Xưởng Gia công" },
  { id: "PO", name: "Mua hàng" },
  { id: "QC", name: "Phòng kiểm tra chất lượng - QC" },
  { id: "IOT", name: "IoT" },
  { id: "SALE", name: "Kinh doanh" },
  { id: "TKCK", name: "Thiết kế cơ khí" },
  { id: "TKD", name: "Thiết kế điện" },
  { id: "TL", name: "Trợ lý" }
];

const SHIFT_LIST = [
  { id: "CA01 - 08:00", text: "CA01 (08:00)" },
  { id: "CA01 - 08:30", text: "CA01 (08:30)" },
  { id: "CA01 - 09:00", text: "CA01 (09:00)" },
  { id: "CA01 - 10:00", text: "CA01 (10:00)" },
  { id: "CA01 - 12:45", text: "CA01 (12:45)" },
  { id: "CA02 - 22:00", text: "CA02 (22:00)" }
];

const UTILS = {
  parseTime: t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; },
  classify: (t, isFirst) => {
    const mins = UTILS.parseTime(t);
    if (isFirst) return mins > 480 ? "late" : "normal";
    return mins < 1005 ? "early" : "normal";
  },
  parseHTMLDetail: (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const getVal = (cls) => doc.querySelector(`.${cls}`)?.innerText?.trim() || "N/A";
    const getValAny = (classes) => {
      for (const c of classes) {
        const v = doc.querySelector(`.${c}`)?.innerText?.trim();
        if (v && v !== "N/A") return v;
      }
      return "N/A";
    };

    return {
      requestType: getVal("RequestTypeID"),
      applicationID: getVal("ApplicationID"),
      description: getVal("Description"),
      fromDate: getValAny(["RequestFromDate", "RequestFromDate_DT", "Date"]),
      toDate: getValAny(["RequestToDate", "RequestToDate_DT", "Date"]),
      date: getVal("Date"),
      dailyHours: getVal("DailyHours"),
      reason: getVal("Reason"),
      status: getVal("StatusName"),
      shift: getVal("ShiftName")
    };
  },
  generateHours: () => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')),
  generateMinutes: () => ['00', '15', '30', '45']
};

/* ========= WORKDAY HELPER ========= */
// Hybrid: ngày đã qua → tin HRMT2323 (shiftMap), ngày tương lai → weekday heuristic
// Lịch làm: T2-T6 luôn làm, chỉ T7 ĐẦU THÁNG (d<=7) mới làm, CN luôn nghỉ
function isWorkday(dayNum, monthNum, yearNum) {
  const dateObj = new Date(yearNum, monthNum - 1, dayNum);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dateObj <= today) {
    // Ngày đã qua hoặc hôm nay: dùng dữ liệu thực từ HRMT2323
    return !!currentData.shiftMap[dayNum];
  }

  // Ngày tương lai: dùng weekday heuristic
  const dow = dateObj.getDay(); // 0=CN, 6=T7
  if (dow === 0) return false;           // CN → luôn nghỉ
  if (dow === 6) return dayNum <= 7;     // Chỉ T7 đầu tháng (tuần 1) mới làm
  return true;                           // T2-T6 → luôn làm
}

async function fetchPeriodDates(monthStr) {
  const [y, m] = monthStr.split("-");
  const body = new URLSearchParams({ DivisionIDPeriod: SERVER_CONFIG.divisionId, TranMonth: m, TranYear: y });
  try {
    return await api("/Period/BeginEndDate", body, false);
  } catch (e) { console.error("fetchPeriodDates error:", e); return null; }
}

async function fetchPeriodUpdate(monthStr, periodData) {
  const [y, m] = monthStr.split("-");
  const today = new Date();
  const voucherDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  const firstDay = new Date(parseInt(y), parseInt(m) - 1, 1);
  const lastDay = new Date(parseInt(y), parseInt(m), 0);
  const beginDateStr = `${String(firstDay.getDate()).padStart(2, '0')}/${String(firstDay.getMonth() + 1).padStart(2, '0')}/${firstDay.getFullYear()}`;
  const endDateStr = `${String(lastDay.getDate()).padStart(2, '0')}/${String(lastDay.getMonth() + 1).padStart(2, '0')}/${lastDay.getFullYear()}`;

  const body = new URLSearchParams({
    IsNoReset: "",
    periodTitle: "Chọn kỳ kế toán",
    UrlUpdatePeriod: "/Period/Update",
    DivisionIDPeriod: SERVER_CONFIG.divisionId,
    Period: `${m.padStart(2, '0')}/${y}`,
    VoucherDate: voucherDate,
    BeginDate: beginDateStr,
    EndDate: endDateStr,
    TranMonth: m.padStart(2, '0'),
    TranYear: y,
    Closing: "0"
  });

  try {
    return await api("/Period/Update", body, false);
  } catch (e) { console.error("fetchPeriodUpdate error:", e); return null; }
}

async function api(path, body, isJson = true) {
  const res = await fetch(SERVER_CONFIG.serverHost + path, {
    method: "POST",
    headers: {
      "Content-Type": isJson
        ? "application/json; charset=UTF-8"
        : "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest"
    },
    body: isJson ? JSON.stringify(body) : body
  });

  const text = await res.text();
  try { return JSON.parse(text); }
  catch { console.log("RAW:", text); throw "Not JSON"; }
}

/* ========= CURRENT USER RESOLVER ========= */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

async function fetchCurrentUser() {
  // Ưu tiên 1: Đọc từ Cookie (chính xác nhất cho người đang đăng nhập)
  const cookieUserID = getCookie('UserID');
  if (cookieUserID && /^\d{5,}$/.test(cookieUserID)) {
    console.log(`[CurrentUser] Lấy từ Cookie UserID: ${cookieUserID}`);
    return { EmployeeID: cookieUserID, FullName: '' };
  }

  // Ưu tiên 2: Tìm trong DOM
  const domSelectors = [
    '#EmployeeID', '[name="EmployeeID"]', '.EmployeeID', '#hfEmployeeID', '[data-employee-id]'
  ];
  for (const sel of domSelectors) {
    const el = document.querySelector(sel);
    const val = el?.value || el?.innerText?.trim() || el?.dataset?.employeeId;
    if (val && /^\d{5,}$/.test(val)) {
      console.log(`[CurrentUser] Lấy từ DOM (${sel}): ${val}`);
      return { EmployeeID: val, FullName: '' };
    }
  }

  console.warn('[CurrentUser] Không tìm thấy EmployeeID người đăng nhập!');
  return null;
}

async function fetchAttendance(monthStr, employeeID) {
  const [y, m] = monthStr.split("-");
  const lastDay = new Date(y, m, 0).getDate();
  const fromDate = `01/${m}/${y}`;
  const toDate = `${lastDay}/${m}/${y}`;
  const empID = employeeID || "";

  // Sử dụng cấu trúc payload mở rộng chính xác như hệ thống Asoft để không bị lỗi hoặc trả về Data rỗng
  const template = `sort=&page=1&pageSize=200&group=&filter=&rdoFilter=1&FromDatePeriodControl=${encodeURIComponent(fromDate)}&ToDatePeriodControl=${encodeURIComponent(toDate)}&FromToDate_Content_DataType=9&FromToDate_Type_Fields=5&IsPeriod=0&FromDatePeriodControl_Type_Fields=5&ToDatePeriodControl_Type_Fields=5&FromDatePeriodControl_Content_DataType=13&ToDatePeriodControl_Content_DataType=13&CheckListPeriodControl_Type_Fields=4&CheckListPeriodControl_Content_DataType=13&DivisionID_Content_DataType=7&DivisionID_Type_Fields=4&DivisionID_HRMF2260=&DivisionID1_Content_DataType=7&DivisionID1_Type_Fields=1&DivisionID1_HRMF2260=&Period_Content_DataType=7&Period_Type_Fields=1&Period_HRMF2260=&FromDate_Content_DataType=9&FromDate_Type_Fields=5&FromDate_HRMF2260=&ToDate_Content_DataType=9&ToDate_Type_Fields=5&ToDate_HRMF2260=&DepartmentID1_Content_DataType=7&DepartmentID1_Type_Fields=3&DepartmentID1_HRMF2260=&View_Content_DataType=7&View_Type_Fields=1&View_HRMF2260=&CreateUserID_Content_DataType=7&CreateUserID_Type_Fields=1&CreateUserID_HRMF2260=&CreateDate_Content_DataType=13&CreateDate_Type_Fields=1&CreateDate_HRMF2260=&LastModifyUserID_Content_DataType=7&LastModifyUserID_Type_Fields=1&LastModifyUserID_HRMF2260=&LastModifyDate_Content_DataType=13&LastModifyDate_Type_Fields=1&LastModifyDate_HRMF2260=&EmployeeID_Content_DataType=7&EmployeeID_Type_Fields=1&EmployeeID_HRMF2260=${empID}&FullName_Content_DataType=7&FullName_Type_Fields=1&FullName_HRMF2260=&DepartmentID_Content_DataType=7&DepartmentID_Type_Fields=3&CheckInList=DepartmentID_HRMF2260&DepartmentID_HRMF2260_input=&DepartmentID_HRMF2260=&DepartmentName_Content_DataType=7&DepartmentName_Type_Fields=1&DepartmentName_HRMF2260=&AbsentCardNo_Content_DataType=7&AbsentCardNo_Type_Fields=1&AbsentCardNo_HRMF2260=&TranMonth_Content_DataType=4&TranMonth_Type_Fields=1&TranMonth_HRMF2260=&TranYear_Content_DataType=4&TranYear_Type_Fields=1&TranYear_HRMF2260=&AbsentDate_Content_DataType=7&AbsentDate_Type_Fields=1&AbsentDate_HRMF2260=&AbsentHour_Content_DataType=7&AbsentHour_Type_Fields=1&AbsentHour_HRMF2260=&args%5B0%5D.Key=ftype%5B%5D&args%5B0%5D.Value%5B0%5D=&args%5B0%5D.Value%5B1%5D=5&args%5B0%5D.Value%5B2%5D=5&args%5B0%5D.Value%5B3%5D=&args%5B0%5D.Value%5B4%5D=4&args%5B0%5D.Value%5B5%5D=1&args%5B0%5D.Value%5B6%5D=1&args%5B0%5D.Value%5B7%5D=5&args%5B0%5D.Value%5B8%5D=5&args%5B0%5D.Value%5B9%5D=3&args%5B0%5D.Value%5B10%5D=1&args%5B0%5D.Value%5B11%5D=1&args%5B0%5D.Value%5B12%5D=1&args%5B0%5D.Value%5B13%5D=1&args%5B0%5D.Value%5B14%5D=1&args%5B0%5D.Value%5B15%5D=1&args%5B0%5D.Value%5B16%5D=1&args%5B0%5D.Value%5B17%5D=3&args%5B0%5D.Value%5B18%5D=1&args%5B0%5D.Value%5B19%5D=1&args%5B0%5D.Value%5B20%5D=1&args%5B0%5D.Value%5B21%5D=1&args%5B0%5D.Value%5B22%5D=1&args%5B0%5D.Value%5B23%5D=1&args%5B1%5D.Key=dttype%5B%5D&args%5B1%5D.Value%5B0%5D=&args%5B1%5D.Value%5B1%5D=13&args%5B1%5D.Value%5B2%5D=13&args%5B1%5D.Value%5B3%5D=&args%5B1%5D.Value%5B4%5D=7&args%5B1%5D.Value%5B5%5D=7&args%5B1%5D.Value%5B6%5D=7&args%5B1%5D.Value%5B7%5D=9&args%5B1%5D.Value%5B8%5D=9&args%5B1%5D.Value%5B9%5D=7&args%5B1%5D.Value%5B10%5D=7&args%5B1%5D.Value%5B11%5D=7&args%5B1%5D.Value%5B12%5D=13&args%5B1%5D.Value%5B13%5D=7&args%5B1%5D.Value%5B14%5D=13&args%5B1%5D.Value%5B15%5D=7&args%5B1%5D.Value%5B16%5D=7&args%5B1%5D.Value%5B17%5D=7&args%5B1%5D.Value%5B18%5D=7&args%5B1%5D.Value%5B19%5D=7&args%5B1%5D.Value%5B20%5D=4&args%5B1%5D.Value%5B21%5D=4&args%5B1%5D.Value%5B22%5D=7&args%5B1%5D.Value%5B23%5D=7&args%5B2%5D.Key=key%5B%5D&args%5B2%5D.Value%5B0%5D=rdoFilter&args%5B2%5D.Value%5B1%5D=FromDatePeriodControl&args%5B2%5D.Value%5B2%5D=ToDatePeriodControl&args%5B2%5D.Value%5B3%5D=IsPeriod&args%5B2%5D.Value%5B4%5D=DivisionID&args%5B2%5D.Value%5B5%5D=DivisionID1&args%5B2%5D.Value%5B6%5D=Period&args%5B2%5D.Value%5B7%5D=FromDate&args%5B2%5D.Value%5B8%5D=ToDate&args%5B2%5D.Value%5B9%5D=DepartmentID1&args%5B2%5D.Value%5B10%5D=View&args%5B2%5D.Value%5B11%5D=CreateUserID&args%5B2%5D.Value%5B12%5D=CreateDate&args%5B2%5D.Value%5B13%5D=LastModifyUserID&args%5B2%5D.Value%5B14%5D=LastModifyDate&args%5B2%5D.Value%5B15%5D=EmployeeID&args%5B2%5D.Value%5B16%5D=FullName&args%5B2%5D.Value%5B17%5D=DepartmentID&args%5B2%5D.Value%5B18%5D=DepartmentName&args%5B2%5D.Value%5B19%5D=AbsentCardNo&args%5B2%5D.Value%5B20%5D=TranMonth&args%5B2%5D.Value%5B21%5D=TranYear&args%5B2%5D.Value%5B22%5D=AbsentDate&args%5B2%5D.Value%5B23%5D=AbsentHour&args%5B2%5D.Value%5B24%5D=HRMT2260&args%5B3%5D.Key=value%5B%5D&args%5B3%5D.Value%5B0%5D=1&args%5B3%5D.Value%5B1%5D=${encodeURIComponent(fromDate)}&args%5B3%5D.Value%5B2%5D=${encodeURIComponent(toDate)}&args%5B3%5D.Value%5B3%5D=0&args%5B3%5D.Value%5B4%5D=&args%5B3%5D.Value%5B5%5D=&args%5B3%5D.Value%5B6%5D=&args%5B3%5D.Value%5B7%5D=&args%5B3%5D.Value%5B8%5D=&args%5B3%5D.Value%5B9%5D=&args%5B3%5D.Value%5B10%5D=&args%5B3%5D.Value%5B11%5D=&args%5B3%5D.Value%5B12%5D=&args%5B3%5D.Value%5B13%5D=&args%5B3%5D.Value%5B14%5D=&args%5B3%5D.Value%5B15%5D=${empID}&args%5B3%5D.Value%5B16%5D=&args%5B3%5D.Value%5B17%5D=&args%5B3%5D.Value%5B18%5D=&args%5B3%5D.Value%5B19%5D=&args%5B3%5D.Value%5B20%5D=&args%5B3%5D.Value%5B21%5D=&args%5B3%5D.Value%5B22%5D=&args%5B3%5D.Value%5B23%5D=&args%5B4%5D.Key=systemInfo%5B%5D&args%5B4%5D.Value%5B0%5D=HRMF2260&args%5B4%5D.Value%5B1%5D=HRM&args%5B4%5D.Value%5B2%5D=HRMT2260&strWhere=`;

  const body = new URLSearchParams(template);

  try {
    const r = await api("/GridCommon/Read?TableName=HRMT2260", body, false);
    // Client-side filter bổ sung để an toàn (bảo vệ kép)
    if (r && r.Data && employeeID) {
      r.Data = r.Data.filter(item => item.EmployeeID === employeeID);
    }
    return r;
  } catch (e) { return { Data: [] }; }
}

async function fetchShift(monthStr, employeeID) {
  const [y, m] = monthStr.split("-");
  const body = new URLSearchParams({
    page: 1, pageSize: 200,
    "args[0].Key": "key[]", "args[0].Value[0]": "EmployeeID",
    "args[1].Key": "value[]", "args[1].Value[0]": employeeID,
    "args[2].Key": "systemInfo[]", "args[2].Value[0]": "HRM", "args[2].Value[1]": "HRMF2323", "args[2].Value[2]": "HRMT2323",
    "args[3].Value[15]": employeeID
  });
  try {
    return await api("/GridCommon/ReadEdit?TableName=HRMT2323", body, false);
  } catch (e) { return { Data: [] }; }
}

async function fetchOT(monthStr) {
  const [y, m] = monthStr.split("-");
  const lastDay = new Date(y, m, 0).getDate();
  const body = new URLSearchParams();
  body.append("page", "1");
  body.append("pageSize", "200");
  body.append("args[0].Key", "ftype[]");
  body.append("args[0].Value[0]", "5");
  body.append("args[1].Key", "dttype[]");
  body.append("args[1].Value[0]", "13");
  body.append("args[2].Key", "key[]");
  body.append("args[2].Value[0]", "FromDatePeriodControl");
  body.append("args[3].Key", "value[]");
  body.append("args[3].Value[0]", `01/${m}/${y}`);
  body.append("args[3].Value[1]", `${lastDay}/${m}/${y}`);
  body.append("args[4].Key", "systemInfo[]");
  body.append("args[4].Value[0]", "HRMF2320");
  body.append("args[4].Value[1]", "HRM");
  body.append("args[4].Value[2]", "HRMT2320");

  try {
    return await api("/GridCommon/Read?TableName=HRMT2320", body, false);
  } catch (e) { return { Data: [] }; }
}

async function fetchLeaveRequests(monthStr) {
  const [y, m] = monthStr.split("-");
  const lastDay = new Date(y, m, 0).getDate();
  const body = new URLSearchParams({
    page: 1, pageSize: 100,
    "args[0].Key": "systemInfo[]", "args[0].Value[0]": "HRMF2360", "args[0].Value[1]": "HRM", "args[0].Value[2]": "OOT9000",
    "args[1].Key": "ftype[]", "args[1].Value[0]": 5,
    "args[2].Key": "dttype[]", "args[2].Value[0]": 13, "args[3].Key": "key[]", "args[3].Value[0]": "CreateDate",
    "args[4].Key": "value[]", "args[4].Value[0]": `01/${m}/${y}`, "args[4].Value[1]": `${lastDay}/${m}/${y}`
  });
  try {
    return await api("/GridCommon/Read?TableName=OOT9000", body, false);
  } catch (e) { console.error("[Leave Requests] Error:", e); return { Data: [] }; }
}

async function getNewVoucherKey(type = "DXP") {
  const [y, m] = SELECTED_MONTH.split("-");
  const table = `HRMT2360M${m}${y}`;

  // Map internal type to ERP RequestTypeID
  let reqType = type;
  if (type === "DXNP") reqType = "DXP";

  const body = new URLSearchParams({
    "table": table,
    "type": reqType,
    "id": ""
  });

  try {
    const res = await api("/HRM/OOF9000/LoadKeyByRequestTypeID", body, false);
    return res; // Expected: { LastKey, LastKeyAPK, ID }
  } catch (e) {
    console.error("[Voucher Key] Error:", e);
    return { LastKey: "0000", LastKeyAPK: "", ID: `${reqType}/${m}/${y.slice(-2)}/0000` };
  }
}

async function getShiftNow(employeeID, date) {
  try {
    const res = await api("/HRM/HRMF2360/GetShiftNow", { EmployeeID: employeeID, WorkDate: date }, true);
    return res;
  } catch (e) { return ""; }
}

async function getRemainingLeave(employeeID) {
  try {
    let res = await api("/HRM/HRMF2360/GetRemainingLeave", { EmployeeID: employeeID }, true);
    
    // Nếu res là chuỗi (do server trả về JSON string), cần parse thêm một lần nữa
    if (typeof res === 'string') {
      try { res = JSON.parse(res); } catch (e) { console.error("[Leave] Parse string fail:", e); }
    }
    
    if (res && res.Table && res.Table[0]) {
      const d = res.Table[0].DaysRemained;
      const ot = res.Table[0].OTLeaveDaysRemained;
      return {
        days: (d !== undefined && d !== null) ? Number(d).toFixed(1) : "0.0",
        otDays: (ot !== undefined && ot !== null) ? Number(ot).toFixed(1) : "0.0"
      };
    }
    return { days: "0.0", otDays: "0.0" };
  } catch (e) { 
    console.error("[Leave] Error fetching:", e);
    return { days: "0.0", otDays: "0.0" }; 
  }
}

async function getApprovePersons(type = "DXP", deptId = "") {
  const prefixMap = {
    'DXNP': 'DXP', 'DXRN': 'DXP', 'DXLTG': 'DXP',
    'DXBSQT': 'DXP', 'DXDC': 'DXP'
  };
  const category = prefixMap[type] || 'DXP';
  console.log(`[Approver] Fetching for category: ${category} (Original: ${type})`);
  try {
    const payload = [
      { key: "Name", value: "ApprovePerson01ID" },
      { key: "DepartmentID", value: deptId },
      { key: "SectionID", value: "" },
      { key: "SubsectionID", value: "" },
      { key: "ProcessID", value: "" },
      { key: "Type", value: category },
      { key: "Num", value: 2 },
      { key: "ApprovePersonID", value: [] }
    ];
    return await api("/HRM/OOF9000/LoadDataComboApprovePerson", payload, true);
  } catch (e) { console.error("Approver Error:", e); return []; }
}

async function submitVoucher(data) {
  try {
    return await api("/GridCommon/InsertUpdatePopupMasterDetailV2/HRM/HRMF2361?isUpdate=false", data, true);
  } catch (e) { console.error("Submit Error:", e); return { Status: 1, Message: e.message }; }
}

async function deleteRequest(apk, day, month, year) {
  if (!confirm("Bạn có chắc chắn muốn xóa đơn này?")) return;
  const body = new URLSearchParams();
  body.append("dt", `${apk},MA,`);
  body.append("cl", "HRMT2360");
  body.append("cl", "APK");

  try {
    const res = await api("/GridCommon/DeleteViewMaster2/HRM/HRMF2362?Type=0", body, false);
    // ERP trả về [] hoặc rỗng khi xóa thành công
    const isSuccess = !res ||
      (Array.isArray(res)) ||
      res.Status === 0 ||
      res.UpdateSuccess;

    if (isSuccess) {
      // Xóa liên kết bù phép (bpLinks) nếu ngày này thuộc một cặp NP↔BN
      if (day && month && year) {
        const empID = currentData.userMeta?.EmployeeID || 'default';
        const bpKey = `asoft-bp-links-${empID}`;
        const links = await new Promise(r => chrome.storage.sync.get([bpKey], s => r(s[bpKey] || [])));
        const filtered = links.filter(l =>
          !(l.npDay === day && l.npMonth === month && l.npYear === year) &&
          !(l.bnDay === day && l.bnMonth === month && l.bnYear === year)
        );
        if (filtered.length !== links.length) {
          await new Promise(r => chrome.storage.sync.set({ [bpKey]: filtered }, r));
          console.log(`[BP] Đã xóa liên kết bù phép cho ngày ${day}/${month}/${year}`);
        }
      }
      alert("Xóa đơn thành công!");
      document.getElementById("detailModal").style.display = "none";
      load();
    } else {
      alert("Lỗi khi xóa: " + (res.Message || "Không xác định"));
    }
  } catch (e) {
    alert("Lỗi kết nối khi xóa đơn.");
  }
}

async function fetchRequestDetail(apk) {
  if (DETAIL_CACHE.has(apk)) return DETAIL_CACHE.get(apk);
  try {
    const url = `${SERVER_CONFIG.serverHost}/ViewMasterDetail2/Index/HRM/HRMF2362?PK=${apk}&Table=OOT9000&key=APK&DivisionID=${SERVER_CONFIG.divisionId}`;
    const r = await fetch(url);
    const html = await r.text();
    const data = UTILS.parseHTMLDetail(html);
    data.apk = apk; // Inject APK for deletion
    DETAIL_CACHE.set(apk, data);
    return data;
  } catch (e) { return null; }
}

/* ========= CUSTOM DATE PICKER LOGIC ========= */
function renderCustomDatePicker() {
  const popup = document.getElementById("monthPickerPopup");
  if (!popup) return;
  const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  const [currY, currM] = SELECTED_MONTH.split("-").map(Number);

  popup.innerHTML = `
    <div class="mp-year-nav">
      <button class="nav-btn" id="mpPrevYear">◀</button>
      <span style="font-weight: 700; font-size: 16px;">${PICKER_YEAR}</span>
      <button class="nav-btn" id="mpNextYear">▶</button>
    </div>
    ${months.map((m, i) => `
      <button class="mp-month-btn ${PICKER_YEAR === currY && (i + 1) === currM ? 'active' : ''}" data-month="${i + 1}">
        ${m}
      </button>
    `).join('')}
    <button class="mp-today-btn" id="mpToday">Hôm nay</button>
  `;

  // Events for picker
  document.getElementById("mpPrevYear").onclick = (e) => { e.stopPropagation(); PICKER_YEAR--; renderCustomDatePicker(); };
  document.getElementById("mpNextYear").onclick = (e) => { e.stopPropagation(); PICKER_YEAR++; renderCustomDatePicker(); };
  document.getElementById("mpToday").onclick = (e) => {
    e.stopPropagation();
    SELECTED_MONTH = formatMonth(new Date());
    PICKER_YEAR = parseInt(SELECTED_MONTH.split("-")[0]);
    popup.style.display = "none";
    load();
  };
  popup.querySelectorAll(".mp-month-btn").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const m = btn.dataset.month.padStart(2, '0');
      SELECTED_MONTH = `${PICKER_YEAR}-${m}`;
      popup.style.display = "none";
      load();
    };
  });
}

const trigger = document.getElementById("monthDPTrigger");
if (trigger) {
  trigger.onclick = (e) => {
    const popup = document.getElementById("monthPickerPopup");
    const isOpen = popup.style.display === "grid";
    popup.style.display = isOpen ? "none" : "grid";
    if (!isOpen) {
      PICKER_YEAR = parseInt(SELECTED_MONTH.split("-")[0]);
      renderCustomDatePicker();
    }
    e.stopPropagation();
  };
}
window.addEventListener('click', () => {
  const popup = document.getElementById("monthPickerPopup");
  if (popup) popup.style.display = "none";
});

/* ========= EXPORT CSV LOGIC ========= */
function exportToCSV() {
  const [y, m] = SELECTED_MONTH.split("-");
  let csv = "\uFEFF"; // BOM for Excel UTF-8
  csv += `Báo cáo chấm công tháng ${m}/${y}\n`;
  csv += "Ngày,Thứ,Giờ vào,Giờ ra,Trạng thái,Đơn từ\n";

  const daysInMonth = new Date(y, m, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(y, m - 1, d);
    const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const wd = weekdays[dateObj.getDay()];

    const recs = currentData.map[d] || [];
    const sorted = [...recs].sort();
    const inTime = sorted[0] || "";
    const outTime = sorted.length > 1 ? sorted[sorted.length - 1] : "";

    let status = "";
    if (recs.length === 0) {
      status = currentData.shiftMap[d] ? "Nghỉ" : "";
    } else if (recs.length === 1) {
      status = "Quên chấm";
    } else {
      const isLate = UTILS.classify(inTime, true) === "late";
      const isEarly = UTILS.classify(outTime, false) === "early";
      status = (isLate ? "Muộn" : "") + (isLate && isEarly ? " & " : "") + (isEarly ? "Sớm" : "");
      if (!status) status = "Đúng giờ";
    }

    const requests = (currentData.requestMap[d] || []).map(r => r.requestType).join("; ");
    csv += `${d},${wd},${inTime},${outTime},${status},"${requests}"\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `ChamCong_${m}_${y}.csv`;
  link.click();
}
document.getElementById("exportBtn").onclick = exportToCSV;

/* ========= STATS HIGHLIGHT LOGIC ========= */
function toggleStatHighlight(type) {
  const cal = document.getElementById("calendar");
  const cards = document.querySelectorAll('.stat-card');
  let activeCard = null;
  cards.forEach(c => { if (c.dataset.type === type) activeCard = c; });

  if (activeCard.classList.contains('active')) {
    cal.classList.remove('highlight-mode');
    cards.forEach(c => c.classList.remove('active'));
  } else {
    cards.forEach(c => c.classList.remove('active'));
    activeCard.classList.add('active');
    cal.classList.add('highlight-mode');
    // Apply highlighted class to days
    document.querySelectorAll('.day').forEach(day => {
      day.classList.remove('highlighted');
      const d = parseInt(day.querySelector('.day-num')?.innerText);
      if (!d) return;

      const recs = currentData.map[d] || [];
      const sorted = [...recs].sort();

      let match = false;
      if (type === 'work') match = recs.length > 0;
      else if (type === 'late') match = recs.length > 1 && UTILS.classify(sorted[0], true) === 'late';
      else if (type === 'early') match = recs.length > 1 && UTILS.classify(sorted[sorted.length - 1], false) === 'early';

      if (match) day.classList.add('highlighted');
    });
  }
}
// Add data-types to stat cards
document.querySelectorAll('.stat-card').forEach((card, idx) => {
  const types = ['work', 'late', 'early', 'ot150', 'ot200', 'actual', 'salary', 'standard', 'deficit'];
  card.dataset.type = types[idx];
  card.onclick = () => toggleStatHighlight(types[idx]);
});

/* ========= DATA PROCESSING ========= */
let currentData = { map: {}, shiftMap: {}, requestMap: {}, stats: {}, currentMonthOT: null };
let dragSourceDay = null; // { d, m, y, times } — trạng thái drag bù phép

async function processData(attendanceData, shiftData, leaveData, otData = null, currentUserInfo = null) {
  const map = {}, shiftMap = {}, requestMap = {};
  let late = 0, early = 0;

  const userSource = attendanceData.Data?.[0] || shiftData.Data?.[0] || {};
  const eFullName = currentUserInfo?.FullName || userSource.FullName || '';
  const eEmployeeID = currentUserInfo?.EmployeeID || userSource.EmployeeID || '';

  if (eEmployeeID) {
    document.getElementById("userInfo").innerText = `${eFullName} (${eEmployeeID})`;
  } else {
    document.getElementById("userInfo").innerText = "⚠️ Không rõ nhân viên";
  }

  if (attendanceData.Data?.length > 0) {
    attendanceData.Data.forEach(r => {
      const day = parseInt(r.AbsentDate.split("/")[0]);
      if (!map[day]) map[day] = [];
      map[day].push(r.AbsentHour);
    });
    Object.values(map).forEach(records => {
      records.sort();
      if (records.length > 1) { // Chỉ tính late/early nếu có ít nhất 2 bản ghi (đủ in/out)
        if (UTILS.classify(records[0], true) === "late") late++;
        if (UTILS.classify(records[records.length - 1], false) === "early") early++;
      }
    });
  }

  if (shiftData.Data?.length > 0) {
    shiftData.Data.forEach(r => {
      const day = parseInt(r.AbsentDate.split("/")[0]);
      if (r.ShiftID) shiftMap[day] = r.ShiftID;
    });
  }

  // console.log(`[Process] Found ${leaveData.Data.length} records, fetching details...`);
  const details = await Promise.all(leaveData.Data.map(d => fetchRequestDetail(d.APK)));

  details.filter(d => d).forEach(d => {
    // console.log(`[Process] Leave Detail: ${d.requestType} from ${d.fromDate} to ${d.toDate} (Date: ${d.date})`);

    let startDay, endDay;

    if (d.fromDate !== "N/A") {
      // Chấp nhận cả định dạng "05/05/2026" hoặc "05/05/2026 08:00:00"
      const fromDayPart = d.fromDate.split(" ")[0];
      const toDayPart = d.toDate.split(" ")[0];
      startDay = parseInt(fromDayPart.split("/")[0]);
      endDay = parseInt(toDayPart.split("/")[0]);
    } else if (d.date !== "N/A") {
      const dayPart = d.date.split(" ")[0];
      startDay = endDay = parseInt(dayPart.split("/")[0]);
    }

    if (startDay && endDay) {
      for (let day = startDay; day <= endDay; day++) {
        if (!requestMap[day]) requestMap[day] = [];
        requestMap[day].push(d);
      }
    }
  });

  const userMeta = {
    EmployeeID: eEmployeeID,
    FullName: eFullName,
    DivisionID: userSource.DivisionID || "MA",
    DepartmentID: userSource.DepartmentID || "",
    DepartmentName: userSource.DepartmentName || ""
  };

  let ot150 = 0, ot200 = 0, actualWork = 0, salaryWork = 0, dailyWork = 0;
  if (otData && otData.Data && otData.Data.length > 0) {
    const r = otData.Data[0];
    actualWork = r.GCTT || 0;
    salaryWork = r.BS01 || 0;
    dailyWork = r.GCN || 0;

    Object.keys(r).forEach(key => {
      if (key.startsWith("OT") && typeof r[key] === "number") {
        if (key === "OTT15") {
          ot150 += r[key];
        } else {
          ot200 += r[key];
        }
      }
    });
  }

  const workDays = Object.keys(map).length;
  const standardWork = workDays * 8;
  const deficitWork = Math.max(0, standardWork - salaryWork);

  currentData = { 
    map, shiftMap, requestMap, userMeta, 
    stats: { 
      workDays, late, early, ot150, ot200, 
      actualWork, salaryWork, dailyWork,
      standardWork, deficitWork
    }, 
    currentMonthOT: otData 
  };
  return currentData;
}

function render(monthStr) {
  const { map, shiftMap, requestMap, stats } = currentData;
  const cal = document.getElementById("calendar");
  if (!cal) return;
  cal.innerHTML = "";
  cal.classList.remove('highlight-mode'); // Reset highlight on re-render

  // Update Month Display text
  const [y, m] = monthStr.split("-").map(Number);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.getElementById("monthText").innerText = `${monthNames[m - 1]} ${y}`;

  document.getElementById("statWorkDays").innerText = stats.workDays;
  document.getElementById("statLate").innerText = stats.late;
  document.getElementById("statEarly").innerText = stats.early;
  document.getElementById("statOT150").innerText = stats.ot150 + "h";
  document.getElementById("statOT200").innerText = stats.ot200 + "h";
  document.getElementById("statActualWork").innerText = stats.actualWork + "h";
  document.getElementById("statSalaryWork").innerText = stats.salaryWork + "h";
  document.getElementById("statStandardWork").innerText = stats.standardWork + "h";
  document.getElementById("statDeficitWork").innerText = stats.deficitWork.toFixed(2) + "h";
  document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));

  const firstDay = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m, 0).getDate();
  const today = new Date();

  ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach(w => {
    const div = document.createElement("div"); div.className = "weekday"; div.innerText = w; cal.appendChild(div);
  });
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div"); empty.className = "day empty"; cal.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const cellDate = new Date(y, m - 1, d);
    const isFutureDay = cellDate > todayMidnight;
    const isToday = today.getDate() === d && today.getMonth() === m - 1 && today.getFullYear() === y;
    const isWeekend = [0, 6].includes(new Date(y, m - 1, d).getDay());
    const recs = map[d] || [];
    const hasData = recs.length > 0;
    const hasFullData = recs.length >= 2;
    const hasShift = isWorkday(d, m, y);

    // Chỉ đánh "Nghỉ" với ngày đã qua/hôm nay — tương lai chưa đến không tính
    const isAbsent = hasShift && !hasData && !isFutureDay;
    const isForgot = hasData && !hasFullData;
    const requests = requestMap[d] || [];
    const hasPending = requests.some(r => r.status !== "Duyệt");

    // Glow effect for normal on-time days
    let isNormalOnTime = false;
    if (hasFullData) {
      const sorted = [...recs].sort();
      const l = UTILS.classify(sorted[0], true);
      const e = UTILS.classify(sorted[sorted.length - 1], false);
      if (l === 'normal' && e === 'normal') isNormalOnTime = true;
    }

    const cell = document.createElement("div");
    const isOTDay = !hasShift && hasData;
    // Sử dụng !hasShift để xác định ngày nghỉ (Off-day)
    cell.className = `day ${!hasShift ? 'off-day' : ''} ${isOTDay ? 'ot-day' : ''} ${isToday ? 'today' : ''} ${isAbsent ? 'absent' : ''} ${isForgot ? 'forgot' : ''} ${hasPending ? 'pending-req' : ''} ${isNormalOnTime ? 'normal-work' : ''}`;
    if (isWeekend) cell.classList.add('weekend-date'); // Thêm class để track weekend nếu cần
    cell.onclick = () => openModal(d, m, y, map[d], requests);

    // === DRAG SOURCE: ngày OT (làm việc vào ngày nghỉ) ===
    if (isOTDay) {
      cell.draggable = true;
      cell.title = '🔄 Kéo vào ngày nghỉ phép để tạo đơn bù phép';
      cell.addEventListener('dragstart', (ev) => {
        dragSourceDay = { d, m, y, times: [...recs] };
        setTimeout(() => cell.classList.add('drag-source'), 0);
        ev.dataTransfer.effectAllowed = 'move';
        ev.dataTransfer.setData('text/plain', `${d}`);
      });
      cell.addEventListener('dragend', () => {
        cell.classList.remove('drag-source');
        document.querySelectorAll('.day.drag-over').forEach(el => el.classList.remove('drag-over'));
        dragSourceDay = null;
      });
    }

    // === DRAG TARGET: ch? ngày ngh? (có ca nhưng chưa có chấm công) ===
    if (hasShift && !hasData && !isOTDay) {
      cell.addEventListener('dragenter', (ev) => {
        if (!dragSourceDay) return;
        ev.preventDefault();
        cell.classList.add('drag-over');
      });
      cell.addEventListener('dragover', (ev) => {
        if (!dragSourceDay) return;
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'move';
      });
      cell.addEventListener('dragleave', (ev) => {
        if (!cell.contains(ev.relatedTarget)) cell.classList.remove('drag-over');
      });
      cell.addEventListener('drop', (ev) => {
        ev.preventDefault();
        cell.classList.remove('drag-over');
        if (!dragSourceDay) return;
        const src = { ...dragSourceDay };
        dragSourceDay = null;
        openCompSwapModal(src, { d, m, y });
      });
    }

    let html = `<div class="day-num">${d}</div><div class="time-box">`;
    if (hasData) {
      const sorted = [...recs].sort();
      sorted.forEach((t, i) => {
        if (i === 0 || i === sorted.length - 1) {
          const type = UTILS.classify(t, i === 0);
          html += `<div class="time-tag ${type}"><span class="icon">${i === 0 ? "🕒" : "📤"}</span><span>${t.slice(0, 5)}</span></div>`;
        }
      });
      if (isForgot) {
        html += `<div class="time-tag forgot"><span class="icon">❓</span><span>Quên chấm</span></div>`;
      }
    } else if (isAbsent) {
      html += `<div class="time-tag absent"><span class="icon">🏠</span><span>Nghỉ</span></div>`;
    }

    // Request Indicators
    if (requests.length > 0) {
      if (requests.length === 1) {
        const r = requests[0];
        const isPending = r.status !== "Duyệt";
        html += `<div class="time-tag req ${isPending ? 'pending' : ''}">${isPending ? '⏳' : '✅'} ${r.requestType}</div>`;
      } else {
        const hasPending = requests.some(r => r.status !== "Duyệt");
        html += `<div class="time-tag req ${hasPending ? 'pending' : ''}">📄 x${requests.length} Đơn từ</div>`;
      }
    }

    // === BP-LINK BADGES ===
    const bpLinks = currentData.bpLinks || [];
    const npLink = bpLinks.find(l => l.npDay === d && l.npMonth === m && l.npYear === y);
    const bnLink = bpLinks.find(l => l.bnDay === d && l.bnMonth === m && l.bnYear === y);
    if (npLink) {
      html += `<div class="time-tag req" style="font-size:10px; gap:3px;">&#8644; Bù: ${npLink.bnDate}</div>`;
      cell.dataset.bpId = npLink.pairId;
      cell.dataset.bpRole = 'np';
    }
    if (bnLink) {
      html += `<div class="time-tag normal" style="font-size:10px; gap:3px;">&#8644; Nghỉ: ${bnLink.npDate}</div>`;
      cell.dataset.bpId = bnLink.pairId;
      cell.dataset.bpRole = 'bn';
    }

    cell.innerHTML = html + `</div>`;
    cal.appendChild(cell);
  }
  // Vẽ mũi tên sau khi render xong
  drawBPArrows(m, y);
}

/* ========= MODAL LOGIC ========= */
const modal = document.getElementById("detailModal");
const mBody = document.getElementById("modalBody");
const mTitle = document.getElementById("modalTitle");

function openModal(d, m, y, times, requests) {
  mTitle.innerText = `Chi tiết ngày ${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
  let html = "";

  if (times && times.length > 0) {
    html += `<div class="req-item"><h3>Chấm công</h3><div class="req-val">Dữ liệu: ${times.join(', ')}</div></div>`;
  }

  if (requests.length > 0) {
    requests.forEach(r => {
      const isPending = r.status !== 'Duyệt';
      html += `
            <div class="req-item" style="position: relative;">
                <span class="req-status ${isPending ? 'pending' : ''}">${r.status}</span>
                <h3>${r.description}</h3>
                <div class="req-grid">
                    <div class="req-field"><span class="req-label">Loại</span><span class="req-val">${r.requestType}</span></div>
                    <div class="req-field"><span class="req-label">Thời gian</span><span class="req-val">${r.dailyHours}h</span></div>
                    <div class="req-field"><span class="req-label">Lý do</span><span class="req-val">${r.reason}</span></div>
                    <div class="req-field"><span class="req-label">Ca</span><span class="req-val">${r.shift}</span></div>
                </div>
                ${isPending ? `<button class="btn-delete" data-apk="${r.apk}" data-day="${d}" data-month="${m}" data-year="${y}"><span class="icon">🗑️</span> Xóa đơn</button>` : ''}
            </div>`;
    });
  }

  mBody.innerHTML = html;

  // Gắn sự kiện xóa đơn (Tránh lỗi ReferenceError trong content script)
  mBody.querySelectorAll(".btn-delete").forEach(btn => {
    btn.onclick = () => deleteRequest(btn.dataset.apk, Number(btn.dataset.day), Number(btn.dataset.month), Number(btn.dataset.year));
  });

  // Event for "Create New" button in HEADER
  const createBtn = document.getElementById("openCreateFormBtn");
  if (createBtn) {
    createBtn.onclick = () => {
      modal.style.display = "none";
      openCreateRequestModal(d, m, y, times);
    };
  }

  modal.style.display = "flex";
}

/* ========= CREATE REQUEST LOGIC ========= */
async function openCreateRequestModal(d, m, y, attendanceTimes = []) {
  const cModal = document.getElementById("createRequestModal");
  const cTitle = document.getElementById("createModalTitle");
  const typeSelect = document.getElementById("requestTypeSelect");
  const deptSelect = document.getElementById("requestDepartmentSelect");
  const dynamicFields = document.getElementById("dynamicFields");
  const approverSelect = document.getElementById("approverSelect");
  const statusDiv = document.getElementById("createStatus");
  const submitBtn = document.getElementById("submitRequest");

  const dateStr = `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
  const sqlDate = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;

  cTitle.innerText = `Tạo đơn - ${dateStr}`;
  statusDiv.style.display = "none";

  // --- SMART SUGGESTION LOGIC ---
  let suggested = { type: "DXNP", hours: 8, reason: "", startTime: "08:15", endTime: "17:30", swipeTime: "08:00", inOut: "V" };
  const hasShift = isWorkday(d, m, y);
  const sortedTimes = [...(attendanceTimes || [])].sort();
  let timeCount = sortedTimes.length;

  // --- DOUBLE SWIPE DETECTION ---
  // If multiple swipes exist but the duration is too short (< 4 hours), 
  // treat it as a single swipe (likely a double-tap error)
  if (timeCount > 1) {
    const duration = UTILS.parseTime(sortedTimes[timeCount - 1]) - UTILS.parseTime(sortedTimes[0]);
    if (duration < 240) { // 4 hours threshold
      console.log(`[Suggestion] Short duration detected (${duration} mins). Treating as single swipe.`);
      timeCount = 1;
    }
  }

  if (hasShift) {
    if (timeCount === 0) {
      suggested.type = "DXNP";
      suggested.reason = "Nghỉ phép (vắng mặt)";
    } else if (timeCount === 1) {
      suggested.type = "DXBSQT";
      const time = sortedTimes[0];
      const hour = parseInt(time.split(":")[0]);
      if (hour > 13) {
        suggested.swipeTime = "08:00";
        suggested.inOut = "V";
        suggested.reason = "Quên quẹt thẻ vào";
      } else {
        suggested.swipeTime = "17:00";
        suggested.inOut = "R";
        suggested.reason = "Quên quẹt thẻ ra";
      }
    } else {
      const inTime = sortedTimes[0];
      const outTime = sortedTimes[timeCount - 1];
      const isLate = UTILS.classify(inTime, true) === "late";
      const isEarly = UTILS.classify(outTime, false) === "early";

      if (isLate) {
        // Suggested Switch Shift (DXDC) if late
        suggested.type = "DXDC";
        suggested.reason = "Đổi ca do đi trễ (" + inTime + ")";

        // Find suitable shift: start time >= check-in time
        const inMins = UTILS.parseTime(inTime);
        const bestShift = SHIFT_LIST.find(s => {
          const match = s.text.match(/(\d{2}:\d{2})/);
          if (match) return UTILS.parseTime(match[1]) >= inMins;
          return false;
        }) || SHIFT_LIST[0];
        suggested.newShiftID = bestShift.id;
      } else if (isEarly) {
        suggested.type = "DXBSQT";
        suggested.swipeTime = "17:00";
        suggested.inOut = "R";
        suggested.reason = "Bổ sung quẹt thẻ ra (về sớm)";
      } else {
        // Check for OT (Normal in, late out)
        const outMins = UTILS.parseTime(outTime);
        if (outMins > 1035) { // > 17:15
          suggested.type = "DXLTG";
          suggested.startTime = "16:45";
          // Round outTime down to nearest 15 mins
          const roundedMins = Math.floor(outMins / 15) * 15;
          const h = Math.floor(roundedMins / 60).toString().padStart(2, '0');
          const m = (roundedMins % 60).toString().padStart(2, '0');
          suggested.endTime = `${h}:${m}`;
          suggested.reason = "Làm thêm giờ (Tăng ca)";
        } else {
          suggested.type = "DXLTG";
          suggested.startTime = "16:45";
          suggested.endTime = "18:45";
          suggested.reason = "Làm thêm giờ";
        }
      }
    }
  } else if (timeCount > 0) {
    suggested.type = "DXLTG"; // OT on off-day
    // Use last checkout for OT end time
    const outTime = sortedTimes[timeCount - 1];
    const outMins = UTILS.parseTime(outTime);
    const roundedMins = Math.floor(outMins / 15) * 15;
    const h = Math.floor(roundedMins / 60).toString().padStart(2, '0');
    const m = (roundedMins % 60).toString().padStart(2, '0');
    suggested.startTime = "08:15";
    suggested.endTime = `${h}:${m}`;
    suggested.reason = "Làm thêm ngày nghỉ";
  }

  // Apply basic suggestions to existing fields
  typeSelect.value = suggested.type;
  document.getElementById("requestReason").value = suggested.reason;
  document.getElementById("requestDescription").value = suggested.reason;

  // Populate departments
  const userDeptID = currentData.userMeta?.DepartmentID;
  const userDeptName = currentData.userMeta?.DepartmentName;

  deptSelect.innerHTML = DEPARTMENT_LIST.map(dept => {
    // Match by ID OR by Name (case insensitive)
    const isSelected = (userDeptID === dept.id) ||
      (userDeptName && userDeptName.toLowerCase() === dept.name.toLowerCase());
    return `<option value="${dept.id}" ${isSelected ? 'selected' : ''}>${dept.name}</option>`;
  }).join('');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="icon">⏳</span> Đang tải...';

  // Lấy dữ liệu khởi tạo (Key, Approvers, Shift)
  const loadInitialData = async () => {
    try {
      const type = typeSelect.value;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="icon">⏳</span> Đang tải...';

      const [keyData, approvers, currentShift, leaveData] = await Promise.all([
        getNewVoucherKey(type),
        getApprovePersons(type, currentData.userMeta?.DepartmentID),
        getShiftNow(currentData.userMeta?.EmployeeID, sqlDate),
        getRemainingLeave(currentData.userMeta?.EmployeeID)
      ]);
      
      typeSelect.dataset.remainLeave = leaveData.days;
      typeSelect.dataset.otRemainLeave = leaveData.otDays;

      const searchInput = document.getElementById("approverSearch");
      const hiddenInput = document.getElementById("approverSelect");
      const resultsDiv = document.getElementById("approverResults");

      // --- AUTO-FILL APPROVER từ storage (theo tài khoản đăng nhập) ---
      const empID = currentData.userMeta?.EmployeeID || 'default';
      const approverKey = `asoft-approver-${empID}`;
      const savedApprover = await new Promise(res =>
        chrome.storage.sync.get([approverKey], r => res(r[approverKey] || null))
      );

      const renderApprovers = (list) => {
        resultsDiv.innerHTML = (list || []).filter(a => a.EmployeeID).map(a =>
          `<div class="approver-item" data-id="${a.EmployeeID}" data-name="${a.FullName}">${a.FullName} <span>(${a.EmployeeID})</span></div>`
        ).join('') || '<div class="approver-item" style="cursor: default; opacity: 0.6;">Không tìm thấy</div>';

        resultsDiv.querySelectorAll(".approver-item").forEach(item => {
          item.onclick = (e) => {
            const id = item.dataset.id;
            const name = item.dataset.name || item.innerText.split('(')[0].trim();
            if (id) {
              hiddenInput.value = id;
              searchInput.value = `${name} (${id})`;
              resultsDiv.style.display = "none";
              // Lưu approver theo EmployeeID của người dùng hiện tại
              chrome.storage.sync.set({ [approverKey]: { id, name } });
            }
            e.stopPropagation();
          };
        });
      };

      searchInput.onfocus = () => { if (approvers?.length) resultsDiv.style.display = "block"; };
      searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = (approvers || []).filter(a =>
          (a.FullName || '').toLowerCase().includes(query) || (a.EmployeeID || '').toLowerCase().includes(query)
        );
        renderApprovers(filtered);
        resultsDiv.style.display = "block";
      };

      // Đóng khi click ngoài
      const closeResults = (e) => {
        if (!e.target.closest(".approver-container")) {
          resultsDiv.style.display = "none";
        }
      };
      window.addEventListener("click", closeResults);

      renderApprovers(approvers || []);

      // Auto-fill nếu có approver đã lưu
      if (savedApprover?.id && !hiddenInput.value) {
        hiddenInput.value = savedApprover.id;
        searchInput.value = `${savedApprover.name} (${savedApprover.id})`;
      }

      const shiftAuto = (currentShift || "").trim() || currentData.shiftMap[d] || "CA01 - 08:00";
      typeSelect.dataset.shift = shiftAuto;

      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="icon">🚀</span> Gửi đơn';
      return keyData;
    } catch (e) {
      statusDiv.innerText = "Lỗi khi tải dữ liệu khởi tạo.";
      statusDiv.className = "status-box danger";
      statusDiv.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="icon">🚀</span> Gửi đơn';
    }
  };

  let currentKeyData = await loadInitialData();

  const updateFields = async () => {
    const type = typeSelect.value;
    let fieldsHtml = "";

    // Refresh key when type changes
    currentKeyData = await loadInitialData();
    const shift = typeSelect.dataset.shift || "";

    const renderStepper = (id, val, min, max, step = 1) => `
      <div class="asf-stepper">
        <button type="button" onclick="const s=this.parentNode.querySelector('.step-val'); s.innerText=String(Math.max(${min},Number(s.innerText)-${step})).padStart(2,'0')">−</button>
        <span class="step-val" id="${id}">${String(val).padStart(2, '0')}</span>
        <button type="button" onclick="const s=this.parentNode.querySelector('.step-val'); s.innerText=String(Math.min(${max},Number(s.innerText)+${step})).padStart(2,'0')">+</button>
      </div>`;

    if (type === "DXNP") {
      fieldsHtml = `
        <div class="form-row-req">
          <div class="form-group" style="flex: 2;"><label class="req-label">Loại phép</label>
            <select id="absentType" class="form-control">
              ${ABSENT_TYPES.map(t => `<option value="${t.id}">${t.text} (${t.id})</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="req-label">Số giờ</label><input type="number" id="dailyHours" class="form-control" value="${suggested.hours || 8}" step="0.5"></div>
        </div>
        <div class="form-row-req">
          <div class="form-group"><label class="req-label">Ca làm việc</label>
            <select id="shiftID" class="form-control">
              ${SHIFT_LIST.map(s => `<option value="${s.id}" ${shift === s.id ? 'selected' : ''}>${s.text}</option>`).join('')}
            </select>
          </div>
        </div>`;
    } else if (type === "DXLTG") {
      const [fH, fM] = (suggested.startTime || "16:45").split(":");
      const [tH, tM] = (suggested.endTime || "18:45").split(":");
      fieldsHtml = `
        <div class="form-row-req">
          <div class="form-group"><label class="req-label">Từ lúc</label>
            <div class="time-picker-row">
              ${renderStepper('fromHour', fH, 0, 23)} <span class="sep">:</span> ${renderStepper('fromMin', fM, 0, 45, 15)}
            </div>
          </div>
          <div class="form-group"><label class="req-label">Đến lúc</label>
            <div class="time-picker-row">
              ${renderStepper('toHour', tH, 0, 23)} <span class="sep">:</span> ${renderStepper('toMin', tM, 0, 45, 15)}
            </div>
          </div>
        </div>
        <div class="form-row-req">
          <div class="form-group"><label class="req-label">Ca làm việc</label>
            <select id="shiftID" class="form-control">
              <option value="">-- Chọn ca --</option>
              ${SHIFT_LIST.map(s => `<option value="${s.id}" ${shift === s.id ? 'selected' : ''}>${s.text}</option>`).join('')}
            </select>
          </div>
        </div>`;

    } else if (type === "DXBSQT") {
      const [sH, sM] = (suggested.swipeTime || "08:00").split(":");
      fieldsHtml = `
        <div class="form-row-req">
          <div class="form-group"><label class="req-label">Giờ bổ sung</label>
            <div class="time-picker-row">
              ${renderStepper('swipeHour', sH, 0, 23)} <span class="sep">:</span> ${renderStepper('swipeMin', sM, 0, 45, 15)}
            </div>
          </div>
          <div class="form-group"><label class="req-label">Loại chấm</label>
            <select id="inOutID" class="form-control">
              <option value="0" ${suggested.inOut === "V" ? "selected" : ""}>Vào</option>
              <option value="1" ${suggested.inOut === "R" ? "selected" : ""}>Ra</option>
            </select>
          </div>
        </div>
        <div class="form-row-req">
          <div class="form-group"><label class="req-label">Ca làm việc</label>
            <select id="shiftID" class="form-control">
              <option value="">-- Chọn ca --</option>
              ${SHIFT_LIST.map(s => `<option value="${s.id}" ${shift === s.id ? 'selected' : ''}>${s.text}</option>`).join('')}
            </select>
          </div>
        </div>`;
    } else if (type === "DXRN") {
      fieldsHtml = `
        <div class="form-row-req">
          <div class="form-group" style="flex: 1;"><label class="req-label">Từ lúc</label>
            <div class="time-picker-row">
              ${renderStepper('fromHour', 8, 0, 23)} <span class="sep">:</span> ${renderStepper('fromMin', 0, 0, 45, 15)}
            </div>
            <label class="asf-checkbox-label" style="margin-top: 10px;">
              <input type="checkbox" id="goStraight"> Đi thẳng
            </label>
          </div>
          <div class="form-group" style="flex: 1;"><label class="req-label">Đến lúc</label>
            <div class="time-picker-row">
              ${renderStepper('toHour', 10, 0, 23)} <span class="sep">:</span> ${renderStepper('toMin', 0, 0, 45, 15)}
            </div>
            <label class="asf-checkbox-label" style="margin-top: 10px;">
              <input type="checkbox" id="comeStraight"> Về thẳng
            </label>
          </div>
          <div class="form-group" style="width: 80px;"><label class="req-label">Số giờ</label><input type="number" id="dailyHours" class="form-control" value="2" step="0.5"></div>
        </div>
        
        <div style="margin-top: 8px; padding-top: 12px; border-top: 1px solid var(--border-glass); display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group">
            <label class="asf-checkbox-label">
              <input type="checkbox" id="askForVehicle"> Yêu cầu xe
            </label>
            <input type="text" id="vehicleNote" class="form-control" style="margin-top: 8px; display: none;" placeholder="Chiều dùng xe...">
          </div>
          <div class="form-group">
            <label class="asf-checkbox-label">
              <input type="checkbox" id="noLunch" checked> Không trợ cấp ăn trưa
            </label>
            <label class="asf-checkbox-label" style="margin-top: 8px;">
              <input type="checkbox" id="isOT"> Tính OT
            </label>
          </div>
        </div>
      `;

      // Post-render logic for DXRN
      setTimeout(() => {
        const askVeh = document.getElementById('askForVehicle');
        const vehNote = document.getElementById('vehicleNote');
        if (askVeh && vehNote) {
          askVeh.onchange = (e) => {
            vehNote.style.display = e.target.checked ? 'block' : 'none';
          };
        }
      }, 0);
    } else if (type === "DXDC") {
      fieldsHtml = `
        <div class="form-row-req">
          <div class="form-group" style="flex: 2;"><label class="req-label">Đổi sang ca</label>
            <select id="newShiftID" class="form-control">
              ${SHIFT_LIST.map(s => `<option value="${s.id}" ${suggested.newShiftID === s.id ? 'selected' : ''}>${s.text}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row-req">
          <div class="form-group"><label class="req-label">Ca cũ</label>
            <select id="shiftID" class="form-control">
              ${SHIFT_LIST.map(s => `<option value="${s.id}" ${shift === s.id ? 'selected' : ''}>${s.text}</option>`).join('')}
            </select>
          </div>
        </div>`;
    }
    dynamicFields.innerHTML = fieldsHtml;
    // We only want to apply suggested values on the FIRST render of fields
    suggested = {}; // Clear after first use to avoid overriding manual changes
    loadInitialData().then(k => currentKeyData = k);
  };

  typeSelect.onchange = updateFields;
  updateFields();
  cModal.style.display = "flex";
  document.getElementById("closeCreateModal").onclick = () => cModal.style.display = "none";

  submitBtn.onclick = async () => {
    if (!currentKeyData || !currentData.userMeta) return;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="icon">⏳</span> Đang gửi...';
    statusDiv.style.display = "none";

    try {
      const type = typeSelect.value;
      const desc = document.getElementById("requestDescription").value;
      const reason = document.getElementById("requestReason").value;
      const place = document.getElementById("requestPlace").value;
      const approver = approverSelect.value;
      const selectedDeptID = document.getElementById("requestDepartmentSelect").value;
      const selectedDept = DEPARTMENT_LIST.find(d => d.id === selectedDeptID);
      let isSeri = "0"; // Default

      const running = String(Number(currentKeyData.LastKey) + 1).padStart(4, "0");
      const shortYear = y.toString().slice(-2);
      const mmStr = m.toString().padStart(2, '0');

      let prefix = "DXP";
      if (type === "DXLTG") prefix = "DOT";
      else if (type === "DXDC" || type === "DXBSQT") prefix = "DQT";
      else if (type === "DXRN") prefix = "DOU"; // Changed from DXP to DOU based on success case

      const appID = `${prefix}/${mmStr}/${shortYear}/${running}`;

      // FULL ERP PAYLOAD mapping (based on test_create.js)
      const mappedType = type === "DXNP" ? "DXP" : type;
      const baseData = {
        RequestTypeID: "7," + mappedType,
        ApplicationID: "7," + appID,
        AbsentTypeID: "7,", // Default
        Description: "12," + desc,
        DepartmentID: "7," + selectedDeptID,
        SectionID: "7,", SubsectionID: "7,", ProcessID: "7,",
        EmployeeName: "7," + (currentData.userMeta.FullName || ""),

        RequestFromDate: "9," + dateStr, RequestFromDate_DT: "13,",
        RequestToDate: "9," + dateStr, RequestToDate_DT: "13,",

        DailyHours: "8,0", TotalTime: "8,0.00", OverTime: "8,0.00", OverTimeNN: "8,0.00", OverTimeCompany: "8,0.00",

        ShiftNow: "9,", ShiftID: "9,", // Default
        Reason: "7," + reason, Date: "13,", InOutID: "7,", Place: "7," + place, Note: "7,",

        DaysRemained: "8,0.0", OTDaysRemained: "8,0.0", UseVehicle: "7,",
        APK: "1,", APKDetail: "1,", FromToDate: "9,",
        DivisionID: "7," + (currentData.userMeta.DivisionID || ""),
        DepartmentName: "7," + (selectedDept ? selectedDept.name : ""),
        SectionName: "7,", SubsectionName: "7,", ProcessName: "7,",
        EmployeeID: "7," + (currentData.userMeta.EmployeeID || ""),
        CreateUserID: "7,", CreateDate: "9,", LastModifyUserID: "7,", LastModifyDate: "9,",

        LastKey: "7," + currentKeyData.LastKey, LastKeyAPK: "7," + currentKeyData.LastKeyAPK,
        FormStatus: "7,AddNew", Level: "7,",
        TypeName: "7," + mappedType,
        ApproveLevel: "7,1", ApprovingLevel: "7,", Type_9000: "7,",
        GoStraightName: "7,", ComeStraightName: "7,", AbsentTypeName: "7,", ShiftName: "9,",
        IsPreShiftOTName: "7,", InOut: "7,", AskForVehicleName: "7,", UseVehicleName: "7,",
        HaveLunchName: "7,", IsOnTripOTName: "7,", StatusName: "7,",

        Status: "6,0", ApprovalNotes: "7,", Day: "0,200",
        ApprovePerson01ID: "7," + approver,
        IsSeri: "6," + isSeri, GoStraight: "6,0", ComeStraight: "6,0",
        IsPreShiftOT: "6,0", AskForVehicle: "6,0", HaveLunch: "6,0",
        IsOnTripOT: "6,0", IsCompen: "6,0"
      };

      const shiftVal = document.getElementById("shiftID")?.value || "";
      if (type === "DXNP") {
        const hours = Number(document.getElementById("dailyHours").value);
        const remainLeave = typeSelect.dataset.remainLeave || "0.0";
        const otRemainLeave = typeSelect.dataset.otRemainLeave || "0.0";
        baseData.AbsentTypeID = "7," + document.getElementById("absentType").value;
        baseData.DailyHours = "8," + hours;
        baseData.TotalTime = "8," + hours;
        baseData.DaysRemained = "8," + remainLeave;
        baseData.OTDaysRemained = "8," + otRemainLeave;
        baseData.ShiftID = "9," + shiftVal;
      } else if (type === "DXLTG" || type === "DXRN") {
        const fH = document.getElementById("fromHour").innerText;
        const fM = document.getElementById("fromMin").innerText;
        const tH = document.getElementById("toHour").innerText;
        const tM = document.getElementById("toMin").innerText;

        if (type === "DXLTG") {
          baseData.FromTime = `13,${fH}:${fM}`;
          baseData.ToTime = `13,${tH}:${tM}`;
          baseData.ShiftID = "9," + shiftVal;
          const otValue = (Number(tH) - Number(fH) + (Number(tM) - Number(fM)) / 60).toFixed(2);
          baseData.OverTime = "8," + otValue;
          baseData.TotalTime = "8," + otValue;
          baseData.DailyHours = "8," + otValue;
          const remainLeave = typeSelect.dataset.remainLeave || "0.0";
          const otRemainLeave = typeSelect.dataset.otRemainLeave || "0.0";
          baseData.DaysRemained = "8," + remainLeave;
          baseData.OTDaysRemained = "8," + otRemainLeave;
        } else {
          const remainLeave = typeSelect.dataset.remainLeave || "0.0";
          const otRemainLeave = typeSelect.dataset.otRemainLeave || "0.0";
          baseData.DailyHours = "8,";
          baseData.TotalTime = "8,0";
          baseData.DaysRemained = "8," + remainLeave;
          baseData.OTDaysRemained = "8," + otRemainLeave;
          baseData.DivisionID = "7,"; // DivisionID is empty for DXRN

          // DXRN specific fields
          const goStr = document.getElementById("goStraight")?.checked ? "1" : "0";
          const comeStr = document.getElementById("comeStraight")?.checked ? "1" : "0";
          const askVeh = document.getElementById("askForVehicle")?.checked ? "1" : "0";
          const noLunch = document.getElementById("noLunch")?.checked ? "1" : "0";
          const isOT = document.getElementById("isOT")?.checked ? "1" : "0";
          const vehNote = document.getElementById("vehicleNote")?.value || "";

          baseData.GoStraight = "6," + goStr;
          baseData.ComeStraight = "6," + comeStr;
          baseData.IsSeri = "6," + isSeri;
          baseData.AskForVehicle = "6," + askVeh;
          baseData.HaveLunch = "6," + noLunch;
          baseData.IsPreShiftOT = "6," + isOT;
          baseData.UseVehicle = "7," + vehNote; // UseVehicle for "Chiều dùng xe"

          // New structure: include _DT fields with full datetime
          baseData.RequestFromDate_DT = `13,${dateStr} ${fH}:${fM}:00`;
          baseData.RequestToDate_DT = `13,${dateStr} ${tH}:${tM}:00`;
        }
      } else if (type === "DXBSQT") {
        const sH = document.getElementById("swipeHour").innerText;
        const sM = document.getElementById("swipeMin").innerText;
        baseData.Date = "13," + dateStr + " " + sH + ":" + sM + ":00";
        baseData.InOutID = "7," + document.getElementById("inOutID").value;
        baseData.ShiftID = "9,";
        baseData.DailyHours = "8,";
        baseData.TotalTime = "8,0";
        delete baseData.SwipeTime;
      } else if (type === "DXDC") {
        baseData.ShiftNow = "9," + shiftVal;
        baseData.ShiftID = "9," + document.getElementById("newShiftID").value;
      }

      const payload = { dataScreen: [[baseData]], voucherPackages: [] };
      console.log("[Submission] Sending Payload:", JSON.stringify(payload, null, 2));
      let res = await submitVoucher(payload);

      // Retry logic if duplicate ID
      if (res.Status === 1 && res.Message && res.Message.includes("ApplicationID")) {
        console.warn("[Submission] Duplicate ID detected, retrying with new key...");
        const newKeyData = await getNewVoucherKey(type);
        if (newKeyData && newKeyData.LastKey) {
          const newRunning = String(Number(newKeyData.LastKey) + 1).padStart(4, "0");
          const newAppID = `${prefix}/${mmStr}/${shortYear}/${newRunning}`;

          baseData.ApplicationID = "7," + newAppID;
          baseData.LastKey = "7," + newKeyData.LastKey;
          baseData.LastKeyAPK = "7," + newKeyData.LastKeyAPK;

          res = await submitVoucher({ dataScreen: [[baseData]], voucherPackages: [] });
        }
      }

      if (res.Status === 0 || res.UpdateSuccess) {
        statusDiv.innerText = "Gửi đơn thành công!";
        statusDiv.className = "status-box success";
        statusDiv.style.display = "block";
        setTimeout(() => { cModal.style.display = "none"; load(); }, 1500);
      } else {
        throw new Error(res.Message || "Lỗi server");
      }
    } catch (e) {
      statusDiv.innerText = "Lỗi: " + e.message;
      statusDiv.className = "status-box danger";
      statusDiv.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="icon">🚀</span> Gửi đơn';
    }
  };
}

/* ========= COMP SWAP MODAL (BÙ PHÉP) ========= */
async function openCompSwapModal(srcDay, tgtDay) {
  const fmt = (d, m, y) => `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  const srcDate = fmt(srcDay.d, srcDay.m, srcDay.y);
  const tgtDate = fmt(tgtDay.d, tgtDay.m, tgtDay.y);
  const shiftDefault = 'CA01 - 08:00';
  const shiftTgt = currentData.shiftMap[tgtDay.d] || shiftDefault;
  const shiftSrc = currentData.shiftMap[srcDay.d] || shiftDefault;
  const empID = currentData.userMeta?.EmployeeID || 'default';
  const approverKey = `asoft-approver-${empID}`;
  // Tạo pairId sớm để nhúng vào lý do đơn ngay từ đầu
  const pairId = `bp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  let modal = document.getElementById('compSwapModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'compSwapModal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'z-index: 1000002;';
    document.getElementById('attendance-ext').appendChild(modal);
  }
  modal.style.display = 'flex';

  modal.innerHTML = `
  <div class="modal-content" style="width:100%; max-width:700px; max-height:92vh; overflow-y:auto;">
    <div class="modal-header">
      <div class="modal-header-title">
        <h2>🔄 Đơn bù phép</h2>
        <span style="font-size:12px; color:var(--text-muted); margin-left:8px;">Đi làm bù ${srcDate} → Nghỉ ${tgtDate}</span>
      </div>
      <button id="closeCompSwapModal">✕</button>
    </div>
    <div class="modal-body">

      <div class="cs-info-banner">
        <span style="font-size:26px;">🔄</span>
        <div>
          <div style="font-weight:700; color:var(--text-main); margin-bottom:4px;">Sẽ tạo đồng thời 2 đơn</div>
          <div style="color:var(--text-muted); font-size:13px;">
            <b style="color:var(--warning)">Đơn 1</b>: Nghỉ phép năm ngày <b>${tgtDate}</b>
            &nbsp;&nbsp;|  
            <b style="color:var(--primary)">Đơn 2</b>: Làm bù công nhật ngày <b>${srcDate}</b>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
        <div class="cs-card" style="border-left:4px solid var(--warning);">
          <h3 style="color:var(--warning); margin:0 0 12px 0; font-size:13px; text-transform:uppercase;">📋 Đơn 1 — Nghỉ phép năm</h3>
          <div class="req-grid">
            <div class="req-field"><span class="req-label">Ngày nghỉ</span><span class="req-val" style="color:var(--warning);font-weight:700;">${tgtDate}</span></div>
            <div class="req-field"><span class="req-label">Loại phép</span><span class="req-val">NP</span></div>
            <div class="req-field" style="grid-column:span 2;"><span class="req-label">Số giờ</span>
              <input type="number" id="csHours1" class="form-control" value="8" step="0.5" style="margin-top:4px;">
            </div>
            <div class="req-field" style="grid-column:span 2;"><span class="req-label">Ca làm việc</span>
              <select id="csShift1" class="form-control" style="margin-top:4px;">
                ${SHIFT_LIST.map(s => `<option value="${s.id}" ${shiftTgt === s.id ? 'selected' : ''}>${s.text}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="margin-top:10px;"><span class="req-label">Lý do</span>
            <input type="text" id="csReason1" class="form-control" style="margin-top:4px;"
              value="Nghỉ phép năm ngày ${tgtDate}, làm bù vào ngày ${srcDate} [${pairId}]">
          </div>
        </div>

        <div class="cs-card" style="border-left:4px solid var(--primary);">
          <h3 style="color:var(--primary); margin:0 0 12px 0; font-size:13px; text-transform:uppercase;">📋 Đơn 2 — Làm bù công nhật</h3>
          <div class="req-grid">
            <div class="req-field"><span class="req-label">Ngày làm bù</span><span class="req-val" style="color:var(--primary);font-weight:700;">${srcDate}</span></div>
            <div class="req-field"><span class="req-label">Loại phép</span><span class="req-val">BN</span></div>
            <div class="req-field" style="grid-column:span 2;"><span class="req-label">Số giờ</span>
              <input type="number" id="csHours2" class="form-control" value="8" step="0.5" style="margin-top:4px;">
            </div>
            <div class="req-field" style="grid-column:span 2;"><span class="req-label">Ca làm việc</span>
              <select id="csShift2" class="form-control" style="margin-top:4px;">
                ${SHIFT_LIST.map(s => `<option value="${s.id}" ${shiftSrc === s.id ? 'selected' : ''}>${s.text}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="margin-top:10px;"><span class="req-label">Lý do</span>
            <input type="text" id="csReason2" class="form-control" style="margin-top:4px;"
              value="Làm bù công nhật ngày ${srcDate} thay cho ngày nghỉ phép ${tgtDate} [${pairId}]">
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="req-label">Người duyệt <span style="color:var(--text-muted); font-size:11px;">(dùng chung cho cả 2 đơn)</span></label>
        <div class="approver-container">
          <input type="text" id="csApproverSearch" class="form-control" placeholder="Tìm ID/Tên..." autocomplete="off">
          <input type="hidden" id="csApproverID" value="">
          <div id="csApproverResults" class="approver-results"></div>
        </div>
      </div>

      <div class="form-group">
        <label class="req-label">Phòng ban</label>
        <select id="csDept" class="form-control">
          ${DEPARTMENT_LIST.map(dept => {
    const sel = currentData.userMeta?.DepartmentID === dept.id ||
      (currentData.userMeta?.DepartmentName || '').toLowerCase() === dept.name.toLowerCase();
    return `<option value="${dept.id}" ${sel ? 'selected' : ''}>${dept.name}</option>`;
  }).join('')}
        </select>
      </div>

      <div id="csStatus" class="status-box" style="display:none;"></div>
    </div>

    <div style="padding-top:16px; border-top:1px solid var(--border-glass);">
      <button id="submitCompSwap" class="btn-primary" style="width:100%; justify-content:center; height:44px; font-size:15px;">
        <span class="icon">🚀</span> Gửi 2 đơn
      </button>
    </div>
  </div>`;

  document.getElementById('closeCompSwapModal').onclick = () => { modal.style.display = 'none'; };

  // --- Load approvers + saved approver ---
  const [key1, approvers, savedApprover] = await Promise.all([
    getNewVoucherKey('DXNP'),
    getApprovePersons('DXNP', currentData.userMeta?.DepartmentID),
    new Promise(res => chrome.storage.sync.get([approverKey], r => res(r[approverKey] || null)))
  ]);

  const csSearch = document.getElementById('csApproverSearch');
  const csHidden = document.getElementById('csApproverID');
  const csResults = document.getElementById('csApproverResults');

  const renderCSApprovers = (list) => {
    csResults.innerHTML = (list || []).filter(a => a.EmployeeID).map(a =>
      `<div class="approver-item" data-id="${a.EmployeeID}" data-name="${a.FullName}">${a.FullName} <span>(${a.EmployeeID})</span></div>`
    ).join('') || '<div class="approver-item" style="cursor:default;opacity:0.6;">Không tìm thấy</div>';

    csResults.querySelectorAll('.approver-item').forEach(item => {
      item.onclick = (e) => {
        const id = item.dataset.id, name = item.dataset.name;
        if (id) {
          csHidden.value = id;
          csSearch.value = `${name} (${id})`;
          csResults.style.display = 'none';
          chrome.storage.sync.set({ [approverKey]: { id, name } });
        }
        e.stopPropagation();
      };
    });
  };

  csSearch.onfocus = () => { if (approvers?.length) csResults.style.display = 'block'; };
  csSearch.oninput = (e) => {
    const q = e.target.value.toLowerCase();
    renderCSApprovers((approvers || []).filter(a =>
      (a.FullName || '').toLowerCase().includes(q) || (a.EmployeeID || '').toLowerCase().includes(q)
    ));
    csResults.style.display = 'block';
  };
  const closeCSDropdown = (e) => { if (!e.target.closest('#csApproverID, #csApproverSearch, #csApproverResults')) csResults.style.display = 'none'; };
  window.addEventListener('click', closeCSDropdown);

  renderCSApprovers(approvers || []);
  if (savedApprover?.id) { csHidden.value = savedApprover.id; csSearch.value = `${savedApprover.name} (${savedApprover.id})`; }

  // --- Submit 2 đơn ---
  document.getElementById('submitCompSwap').onclick = async () => {
    const statusDiv = document.getElementById('csStatus');
    const submitBtn = document.getElementById('submitCompSwap');
    const approver = csHidden.value;
    const deptID = document.getElementById('csDept').value;
    const selectedDept = DEPARTMENT_LIST.find(dep => dep.id === deptID);

    if (!approver) {
      statusDiv.innerText = '⚠️ Vui lòng chọn người duyệt';
      statusDiv.className = 'status-box danger'; statusDiv.style.display = 'block'; return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="icon">⏳</span> Đang gửi đơn 1...';
    statusDiv.style.display = 'none';

    const buildPayload = (day, month, year, absentType, hours, shiftVal, reason, keyData, appID) => {
      const dateStr = fmt(day, month, year);
      const mmStr = String(month).padStart(2, '0');
      return {
        RequestTypeID: "7,DXP", ApplicationID: "7," + appID, AbsentTypeID: "7," + absentType,
        Description: "12," + reason, DepartmentID: "7," + deptID,
        SectionID: "7,", SubsectionID: "7,", ProcessID: "7,",
        EmployeeName: "7," + (currentData.userMeta?.FullName || ""),
        RequestFromDate: "9," + dateStr, RequestFromDate_DT: "13,",
        RequestToDate: "9," + dateStr, RequestToDate_DT: "13,",
        DailyHours: "8," + hours, TotalTime: "8," + hours,
        OverTime: "8,0.00", OverTimeNN: "8,0.00", OverTimeCompany: "8,0.00",
        ShiftNow: "9,", ShiftID: "9," + shiftVal,
        Reason: "7," + reason, Date: "13,", InOutID: "7,", Place: "7,", Note: "7,",
        DaysRemained: "8,0.0", OTDaysRemained: "8,0.0", UseVehicle: "7,",
        APK: "1,", APKDetail: "1,", FromToDate: "9,",
        DivisionID: "7," + (currentData.userMeta?.DivisionID || ""),
        DepartmentName: "7," + (selectedDept ? selectedDept.name : ""),
        SectionName: "7,", SubsectionName: "7,", ProcessName: "7,",
        EmployeeID: "7," + (currentData.userMeta?.EmployeeID || ""),
        CreateUserID: "7,", CreateDate: "9,", LastModifyUserID: "7,", LastModifyDate: "9,",
        LastKey: "7," + keyData.LastKey, LastKeyAPK: "7," + keyData.LastKeyAPK,
        FormStatus: "7,AddNew", Level: "7,", TypeName: "7,DXP",
        ApproveLevel: "7,1", ApprovingLevel: "7,", Type_9000: "7,",
        GoStraightName: "7,", ComeStraightName: "7,", AbsentTypeName: "7,", ShiftName: "9,",
        IsPreShiftOTName: "7,", InOut: "7,", AskForVehicleName: "7,", UseVehicleName: "7,",
        HaveLunchName: "7,", IsOnTripOTName: "7,", StatusName: "7,",
        Status: "6,0", ApprovalNotes: "7,", Day: "0,200",
        ApprovePerson01ID: "7," + approver,
        IsSeri: "6,0", GoStraight: "6,0", ComeStraight: "6,0",
        IsPreShiftOT: "6,0", AskForVehicle: "6,0", HaveLunch: "6,0",
        IsOnTripOT: "6,0", IsCompen: "6,0"
      };
    };

    try {
      const hours1 = Number(document.getElementById('csHours1').value);
      const hours2 = Number(document.getElementById('csHours2').value);
      const shift1 = document.getElementById('csShift1').value;
      const shift2 = document.getElementById('csShift2').value;
      const reason1 = document.getElementById('csReason1').value;
      const reason2 = document.getElementById('csReason2').value;

      // Đơn 1: DXNP-NP cho ngày nghỉ (tgtDay)
      const mm1 = String(tgtDay.m).padStart(2, '0'), yy1 = String(tgtDay.y).slice(-2);
      const run1 = String(Number(key1.LastKey) + 1).padStart(4, '0');
      const appID1 = `DXP/${mm1}/${yy1}/${run1}`;
      const payload1 = buildPayload(tgtDay.d, tgtDay.m, tgtDay.y, 'NP', hours1, shift1, reason1, key1, appID1);
      let res1 = await submitVoucher({ dataScreen: [[payload1]], voucherPackages: [] });

      if (res1.Status === 1 && res1.Message?.includes('ApplicationID')) {
        const nk = await getNewVoucherKey('DXNP');
        const nr = String(Number(nk.LastKey) + 1).padStart(4, '0');
        payload1.ApplicationID = `7,DXP/${mm1}/${yy1}/${nr}`;
        payload1.LastKey = '7,' + nk.LastKey; payload1.LastKeyAPK = '7,' + nk.LastKeyAPK;
        res1 = await submitVoucher({ dataScreen: [[payload1]], voucherPackages: [] });
      }

      if (res1.Status !== 0 && !res1.UpdateSuccess) throw new Error(`Đơn 1 thất bại: ${res1.Message || 'Lỗi server'}`);

      // Đơn 2: DXNP-BN cho ngày làm bù (srcDay)
      submitBtn.innerHTML = '<span class="icon">⏳</span> Đang gửi đơn 2...';
      const key2 = await getNewVoucherKey('DXNP');
      const mm2 = String(srcDay.m).padStart(2, '0'), yy2 = String(srcDay.y).slice(-2);
      const run2 = String(Number(key2.LastKey) + 1).padStart(4, '0');
      const appID2 = `DXP/${mm2}/${yy2}/${run2}`;
      const payload2 = buildPayload(srcDay.d, srcDay.m, srcDay.y, 'BN', hours2, shift2, reason2, key2, appID2);
      let res2 = await submitVoucher({ dataScreen: [[payload2]], voucherPackages: [] });

      if (res2.Status === 1 && res2.Message?.includes('ApplicationID')) {
        const nk2 = await getNewVoucherKey('DXNP');
        const nr2 = String(Number(nk2.LastKey) + 1).padStart(4, '0');
        payload2.ApplicationID = `7,DXP/${mm2}/${yy2}/${nr2}`;
        payload2.LastKey = '7,' + nk2.LastKey; payload2.LastKeyAPK = '7,' + nk2.LastKeyAPK;
        res2 = await submitVoucher({ dataScreen: [[payload2]], voucherPackages: [] });
      }

      if (res2.Status !== 0 && !res2.UpdateSuccess) {
        statusDiv.innerText = `⚠️ Đơn 1 thành công! Nhưng đơn 2 thất bại: ${res2.Message || 'Lỗi'}. Kiểm tra lại thủ công nhé.`;
        statusDiv.className = 'status-box danger'; statusDiv.style.display = 'block';
        submitBtn.disabled = false; submitBtn.innerHTML = '<span class="icon">🚀</span> Gửi 2 đơn'; return;
      }

      statusDiv.innerText = '✅ Gửi 2 đơn thành công!';
      statusDiv.className = 'status-box success'; statusDiv.style.display = 'block';
      window.removeEventListener('click', closeCSDropdown);

      // Lưu pairId để link 2 đơn trên calendar (dùng lại pairId đã tạo từ đầu, khớp với lý do đơn)
      const bpKey = `asoft-bp-links-${empID}`;
      const existLinks = await new Promise(res => chrome.storage.sync.get([bpKey], r => res(r[bpKey] || [])));
      existLinks.push({
        pairId,
        npDate: tgtDate, npDay: tgtDay.d, npMonth: tgtDay.m, npYear: tgtDay.y,
        bnDate: srcDate, bnDay: srcDay.d, bnMonth: srcDay.m, bnYear: srcDay.y,
        createdAt: new Date().toISOString()
      });
      await new Promise(res => chrome.storage.sync.set({ [bpKey]: existLinks.slice(-60) }, res));

      setTimeout(() => { modal.style.display = 'none'; load(); }, 1500);

    } catch (e) {
      statusDiv.innerText = 'Lỗi: ' + e.message;
      statusDiv.className = 'status-box danger'; statusDiv.style.display = 'block';
      submitBtn.disabled = false; submitBtn.innerHTML = '<span class="icon">🚀</span> Gửi 2 đơn';
    }
  };
}

/* ========= BP ARROWS ========= */
function drawBPArrows(m, y) {
  document.getElementById('bp-arrows-svg')?.remove();
  const bpLinks = currentData.bpLinks || [];
  const cal = document.getElementById('calendar');
  if (!cal || !bpLinks.length) return;

  // Lọc các căp thuộc tháng hiện tại
  const pairs = bpLinks.filter(l =>
    (l.npMonth === m && l.npYear === y) || (l.bnMonth === m && l.bnYear === y)
  );
  if (!pairs.length) return;

  // Tạo SVG overlay
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'bp-arrows-svg';
  svg.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:20;overflow:visible;');
  const calStyle = getComputedStyle(cal);
  if (calStyle.position === 'static') cal.style.position = 'relative';
  cal.appendChild(svg);

  // Arrow marker dậf
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'bp-arrow'); marker.setAttribute('markerWidth', '8'); marker.setAttribute('markerHeight', '6');
  marker.setAttribute('refX', '7'); marker.setAttribute('refY', '3'); marker.setAttribute('orient', 'auto');
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', '0 0, 8 3, 0 6'); poly.setAttribute('fill', 'rgba(139,92,246,0.75)');
  marker.appendChild(poly); defs.appendChild(marker); svg.appendChild(defs);

  const calRect = cal.getBoundingClientRect();

  pairs.forEach(pair => {
    const npCell = cal.querySelector(`[data-bp-id="${pair.pairId}"][data-bp-role="np"]`);
    const bnCell = cal.querySelector(`[data-bp-id="${pair.pairId}"][data-bp-role="bn"]`);
    if (!npCell || !bnCell) return;

    const r1 = npCell.getBoundingClientRect();
    const r2 = bnCell.getBoundingClientRect();
    const x1 = r1.left - calRect.left + r1.width / 2;
    const y1 = r1.top - calRect.top + r1.height / 2;
    const x2 = r2.left - calRect.left + r2.width / 2;
    const y2 = r2.top - calRect.top + r2.height / 2;
    // Control point: lệch lên trên, tránh đè lên ô
    const cy = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.25 - 18;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${x1},${y1} Q${(x1 + x2) / 2},${cy} ${x2},${y2}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(139,92,246,0.65)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-dasharray', '6,3');
    path.setAttribute('marker-end', 'url(#bp-arrow)');
    svg.appendChild(path);
  });
}

document.getElementById("closeModal").onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

/* ========= DRAG & RESIZE ========= */
const root = document.getElementById("glassRoot");
const header = document.getElementById("dragHeader");
const resize = document.getElementById("resizeHandle");
const saveConfig = () => localStorage.setItem(STORAGE_KEY, JSON.stringify({ top: root.style.top, left: root.style.left, width: root.style.width, height: root.style.height, zoom: currentZoom }));

const applyZoom = (z) => {
  currentZoom = Math.max(0.5, Math.min(z, 2.0));
  root.style.transform = `scale(${currentZoom})`;
  document.getElementById("zoomLevel").innerText = `${Math.round(currentZoom * 100)}%`;
  saveConfig();
};
applyZoom(currentZoom);

document.getElementById("zoomIn").onclick = () => applyZoom(currentZoom + 0.1);
document.getElementById("zoomOut").onclick = () => applyZoom(currentZoom - 0.1);

// Theme Selection
document.querySelectorAll('.theme-selector button').forEach(btn => {
  btn.onclick = () => applyTheme(btn.dataset.theme);
});

header.onmousedown = (e) => {
  if (e.target.closest('.zoom-controls')) return;
  root.classList.add('dragging');
  let sX = e.clientX, sY = e.clientY, iX = root.offsetLeft, iY = root.offsetTop;
  document.onmousemove = (e) => {
    let nX = iX + (e.clientX - sX);
    let nY = iY + (e.clientY - sY);

    const margin = 20;
    const maxLeft = window.innerWidth - (root.offsetWidth * currentZoom) + (margin * currentZoom);
    const maxTop = window.innerHeight - (root.offsetHeight * currentZoom) + (margin * currentZoom);

    root.style.left = `${Math.max(-margin, Math.min(nX, maxLeft))}px`;
    root.style.top = `${Math.max(-margin, Math.min(nY, maxTop))}px`;
  };
  document.onmouseup = () => {
    document.onmousemove = null;
    root.classList.remove('dragging');
    saveConfig();
  };
};

resize.onmousedown = (e) => {
  root.classList.add('resizing');
  let sX = e.clientX, sY = e.clientY, iW = root.clientWidth, iH = root.clientHeight;
  document.onmousemove = (e) => {
    let newW = iW + (e.clientX - sX) / currentZoom;
    let newH = iH + (e.clientY - sY) / currentZoom;
    root.style.width = `${Math.max(480, newW)}px`;
    root.style.height = `${Math.max(380, newH)}px`;
  };
  document.onmouseup = () => {
    document.onmousemove = null;
    root.classList.remove('resizing');
    saveConfig();
  };
  e.stopPropagation(); e.preventDefault();
};

const observer = new ResizeObserver(entries => {
  const w = entries[0].contentRect.width;
  root.classList.remove('size-small', 'size-medium', 'size-large');
  if (w < 650) root.classList.add('size-small');
  else if (w < 950) root.classList.add('size-medium');
  else root.classList.add('size-large');
});
observer.observe(root);

/* ========= LOADING & SKELETON ========= */
function renderLoading() {
  const cal = document.getElementById("calendar");
  if (!cal) return;
  cal.innerHTML = "";
  // Render 7 weekdays placeholders
  for (let i = 0; i < 7; i++) {
    const div = document.createElement("div"); div.className = "weekday skeleton-text"; cal.appendChild(div);
  }
  // Render 30 day skeletons
  for (let i = 0; i < 30; i++) {
    const div = document.createElement("div");
    div.className = "day skeleton";
    div.innerHTML = `<div class="day-num skeleton-text" style="width:20px"></div><div class="time-box"><div class="skeleton-text" style="width:60%"></div><div class="skeleton-text" style="width:40%"></div></div>`;
    cal.appendChild(div);
  }
}

async function load() {
  const btn = document.getElementById("loadBtn");
  if (!btn) return;
  btn.style.opacity = "0.5";
  btn.innerHTML = '<span class="icon">⏳</span> Đang tải...';

  renderLoading();

  try {
    // Step 1: Fetch period dates
    const periodDates = await fetchPeriodDates(SELECTED_MONTH);

    // Step 2: Update period
    if (periodDates) {
      await fetchPeriodUpdate(SELECTED_MONTH, periodDates);
    }

    // Tìm EmployeeID đăng nhập trước
    const currentUser = await fetchCurrentUser();
    const employeeID = currentUser ? currentUser.EmployeeID : null;

    if (!employeeID) {
      console.warn("Không xác định được EmployeeID. Extension sẽ cố gắng load dựa trên dữ liệu mặt định của bảng.");
    } else {
      console.log(`[Load] Đang lấy dữ liệu cho EmployeeID: ${employeeID}`);
    }

    // Step 3: Fetch attendance and other data, pass employeeID
    const [att, shift, leave, otData] = await Promise.all([
      fetchAttendance(SELECTED_MONTH, employeeID),
      fetchShift(SELECTED_MONTH, employeeID),
      fetchLeaveRequests(SELECTED_MONTH),
      fetchOT(SELECTED_MONTH)
    ]);
    console.log("Debug Data:", { employeeID, att, shift, leave, otData });
    await processData(att, shift, leave, otData, currentUser);
    // Load bp-links theo tài khoản
    const _empID = currentData.userMeta?.EmployeeID || 'default';
    const _bpKey = `asoft-bp-links-${_empID}`;
    currentData.bpLinks = await new Promise(res => chrome.storage.sync.get([_bpKey], r => res(r[_bpKey] || [])));
    render(SELECTED_MONTH);
  } catch (err) {
    console.error("Load Error:", err);
  } finally {
    btn.style.opacity = "1";
    btn.innerHTML = '<span class="icon">🔄</span> Cập nhật';
  }
}

document.getElementById("loadBtn").onclick = load;
document.getElementById("prevMonth").onclick = () => {
  const [y, m] = SELECTED_MONTH.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  SELECTED_MONTH = formatMonth(d);
  load();
};
document.getElementById("nextMonth").onclick = () => {
  const [y, m] = SELECTED_MONTH.split("-").map(Number);
  const d = new Date(y, m, 1);
  SELECTED_MONTH = formatMonth(d);
  load();
};

// Close button logic
document.getElementById("closeBtn").onclick = () => {
  app.remove();
};

// Minimize button logic
document.getElementById("minimizeBtn").onclick = () => {
  const root = document.getElementById("glassRoot");
  const isMinimized = root.classList.toggle("minimized");
  document.getElementById("minimizeBtn").innerText = isMinimized ? "⬜" : "➖";
  document.getElementById("minimizeBtn").title = isMinimized ? "Phóng to" : "Thu nhỏ";
};

// Initialize: Load server config then load data
loadServerConfig().then(() => {
  SELECTED_MONTH = formatMonth(new Date());

  // Auto fetch previous month period
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonthStr = formatMonth(prevDate);
  fetchPeriodDates(prevMonthStr).then(dates => {
    if (dates) fetchPeriodUpdate(prevMonthStr, dates);
  });

  // Ensure responsive on first run or window resize
  const ensureBounds = () => {
    if (root.offsetWidth > window.innerWidth) root.style.width = '95vw';
    if (root.offsetHeight > window.innerHeight) root.style.height = '90vh';
  };
  window.addEventListener('resize', ensureBounds);
  ensureBounds();

  load(); // Auto load on startup
});
