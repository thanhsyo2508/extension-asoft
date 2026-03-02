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
  const root = document.getElementById('glassRoot');
  if (!root) return;

  // Remove all theme classes
  root.classList.remove('theme-dark', 'theme-light', 'theme-spring', 'theme-summer', 'theme-autumn', 'theme-winter');

  // Add the selected theme class (skip dark as it's default)
  if (themeName !== 'dark') {
    root.classList.add(`theme-${themeName}`);
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
const config = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"top":"100px","left":"100px","width":"1080px","height":"auto","zoom":1}');
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
      <button id="closeBtn" title="Đóng">✕</button>
    </div>
  </div>

  <div class="dashboard-grid">
    <div class="stats-panel">
      <div class="stat-card">
        <span class="stat-label">Ngày công</span>
        <span class="stat-value" id="statWorkDays">0</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Đi trễ</span>
        <span class="stat-value warning" id="statLate">0</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Về sớm</span>
        <span class="stat-value danger" id="statEarly">0</span>
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
      <h2 id="modalTitle">Chi tiết ngày 01/01/2026</h2>
      <button id="closeModal">✕</button>
    </div>
    <div id="modalBody" class="modal-body">
      <!-- Content injected here -->
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
#glassRoot.theme-light {
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
#glassRoot.theme-spring {
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
#glassRoot.theme-summer {
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
#glassRoot.theme-autumn {
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
#glassRoot.theme-winter {
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
  min-width: 480px; min-height: 300px;
  backdrop-filter: blur(20px) saturate(180%);
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  border-radius: 20px;
  padding: 20px 24px;
  color: var(--text-main);
  z-index: 999999;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', system-ui, sans-serif;
  display: flex; flex-direction: column;
  box-sizing: border-box;
  transform-origin: top left;
}
.actions { display: flex; align-items: center; gap: 12px; }
.glass-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; cursor: move; user-select: none; }
.brand { display: flex; gap: 12px; align-items: center; pointer-events: none; }
.brand h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
.icon-box { width: 40px; height: 40px; background: var(--primary-glow); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }

#closeBtn { background: rgba(255,255,255,0.2); border: none; color: #ff0000; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
#closeBtn:hover { background: var(--danger); transform: rotate(90deg); }

.zoom-controls { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 20px; border: 1px solid var(--border-glass); }
#glassRoot[class*="theme-"] .zoom-controls { background: rgba(0,0,0,0.05); }
.zoom-controls button { background: none; border: none; color: var(--text-main); cursor: pointer; padding: 2px 6px; font-size: 14px; transition: opacity 0.2s; }
.zoom-controls button:hover { opacity: 0.7; }
#zoomLevel { font-size: 11px; font-weight: 700; color: var(--text-muted); min-width: 35px; text-align: center; }

.theme-selector { display: flex; gap: 6px; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 20px; border: 1px solid var(--border-glass); }
#glassRoot[class*="theme-"] .theme-selector { background: rgba(0,0,0,0.05); }
.theme-selector button { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: transform 0.2s; }
.theme-selector button:hover { transform: scale(1.2); }
.theme-selector button.active { border: 2px solid var(--primary); transform: scale(1.2); }

.dashboard-grid { display: grid; grid-template-columns: 200px 1fr; gap: 20px; flex: 1; overflow: hidden; }

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

.stats-panel { display: flex; flex-direction: column; gap: 12px; }
.stat-card { background: var(--card-bg); border: 1px solid var(--border-glass); padding: 12px 16px; border-radius: 14px; display: flex; flex-direction: column; gap: 2px; }
.stat-label { font-size: 10px; text-transform: uppercase; color: var(--text-muted); }
.stat-value { font-size: 22px; font-weight: 800; }
.stat-value.warning { color: var(--warning); }
.stat-value.danger { color: var(--danger); }

.calendar-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: var(--card-bg); padding: 8px 12px; border-radius: 12px; border: 1px solid var(--border-glass); }
.month-nav { display: flex; align-items: center; gap: 10px; }
.nav-btn { background: rgba(255,255,255,0.1); border: none; color: var(--text-main); width: 32px; height: 32px; border-radius: 8px; cursor: pointer; }
#glassRoot[class*="theme-"] .nav-btn { background: rgba(0,0,0,0.05); }
#monthPicker { background: transparent; border: none; color: var(--text-main); font-weight: 700; font-size: 15px; outline: none; cursor: pointer; }
.btn-primary { background: var(--primary); color: #fff; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; }

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
  background: #1e293b; color: #fff; width: 600px; max-width: 90%;
  border-radius: 20px; padding: 24px; border: 1px solid var(--border-glass);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-glass); padding-bottom: 12px; }
.modal-header h2 { margin: 0; font-size: 22px; }
#closeModal { background: none; border: none; color: #fff; font-size: 24px; cursor: pointer; }

.modal-body { max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
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
.btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); color: #fff; padding: 6px 10px; border-radius: 10px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
.btn-secondary:hover { background: rgba(255,255,255,0.15); transform: translateY(-1px); }

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
`;
document.head.appendChild(style);

/* ========= LOGIC: UTILS & API ========= */
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

    return {
      requestType: getVal("RequestTypeID"),
      applicationID: getVal("ApplicationID"),
      description: getVal("Description"),
      fromDate: getVal("RequestFromDate"),
      toDate: getVal("RequestToDate"),
      date: getVal("Date"), // For DXBSQT
      dailyHours: getVal("DailyHours"),
      reason: getVal("Reason"),
      status: getVal("StatusName"),
      shift: getVal("ShiftName")
    };
  }
};

async function fetchPeriodDates(monthStr) {
  const [y, m] = monthStr.split("-");
  const body = new URLSearchParams({ DivisionIDPeriod: SERVER_CONFIG.divisionId, TranMonth: m, TranYear: y });
  try {
    const url = `${SERVER_CONFIG.serverHost}/Period/BeginEndDate`;
    const r = await fetch(url, {
      method: "POST", headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' }, body
    });
    return await r.json();
  } catch (e) { console.error("fetchPeriodDates error:", e); return null; }
}

async function fetchPeriodUpdate(monthStr, periodData) {
  const [y, m] = monthStr.split("-");
  const today = new Date();
  const voucherDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  // Calculate first and last day of month in DD/MM/YYYY format
  const firstDay = new Date(parseInt(y), parseInt(m) - 1, 1);
  const lastDay = new Date(parseInt(y), parseInt(m), 0);
  const beginDateStr = `${String(firstDay.getDate()).padStart(2, '0')}/${String(firstDay.getMonth() + 1).padStart(2, '0')}/${firstDay.getFullYear()}`;
  const endDateStr = `${String(lastDay.getDate()).padStart(2, '0')}/${String(lastDay.getMonth() + 1).padStart(2, '0')}/${lastDay.getFullYear()}`;

  // console.log("Period Data received:", periodData);
  // console.log("Calculated dates:", { beginDate: firstDay, endDate: lastDay, beginDateStr, endDateStr });

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

  // console.log("Period Update Payload:", body.toString());

  try {
    const url = `${SERVER_CONFIG.serverHost}/Period/Update`;
    const r = await fetch(url, {
      method: "POST", headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' }, body
    });
    // console.log("Period Update HTTP Status:", r.status);
    const response = await r.text();
    // console.log("Period Update Response (raw):", response);
    try {
      return JSON.parse(response);
    } catch {
      return response;
    }
  } catch (e) { console.error("fetchPeriodUpdate error:", e); return null; }
}

async function fetchAttendance(monthStr) {
  const [y, m] = monthStr.split("-");
  const lastDay = new Date(y, m, 0).getDate();
  const body = new URLSearchParams({
    page: 1, pageSize: 200,
    "args[0].Key": "systemInfo[]", "args[0].Value[0]": "HRMF2260", "args[0].Value[1]": "HRM", "args[0].Value[2]": "HRMT2260",
    "args[1].Key": "ftype[]", "args[1].Value[0]": 5,
    "args[2].Key": "dttype[]", "args[2].Value[0]": 9, "args[3].Key": "key[]", "args[3].Value[0]": "AbsentDate",
    "args[4].Key": "value[]", "args[4].Value[0]": `01/${m}/${y}`, "args[4].Value[1]": `${lastDay}/${m}/${y}`
  });
  try {
    const url = `${SERVER_CONFIG.serverHost}/GridCommon/Read?TableName=HRMT2260`;
    const r = await fetch(url, {
      method: "POST", headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' }, body
    });
    return r.json();
  } catch (e) { return { Data: [] }; }
}

async function fetchShift(monthStr) {
  const [y, m] = monthStr.split("-");
  const lastDay = new Date(y, m, 0).getDate();
  const body = new URLSearchParams({
    page: 1, pageSize: 200, "args[0].Key": "key[]", "args[0].Value[0]": "EmployeeID",
    "args[1].Key": "value[]", "args[1].Value[0]": "000174",
    "args[2].Key": "systemInfo[]", "args[2].Value[0]": "HRM", "args[2].Value[1]": "HRMF2323", "args[2].Value[2]": "HRMT2323"
  });
  try {
    const url = `${SERVER_CONFIG.serverHost}/GridCommon/ReadEdit?TableName=HRMT2323`;
    const r = await fetch(url, {
      method: "POST", headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' }, body
    });
    return r.json();
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
    const url = `${SERVER_CONFIG.serverHost}/GridCommon/Read?TableName=OOT9000`;
    const r = await fetch(url, {
      method: "POST", headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' }, body
    });
    const json = await r.json();
    // console.log("[Leave Requests] Data:", json);
    return json;
  } catch (e) { console.error("[Leave Requests] Error:", e); return { Data: [] }; }
}

async function fetchRequestDetail(apk) {
  if (DETAIL_CACHE.has(apk)) return DETAIL_CACHE.get(apk);
  try {
    const url = `${SERVER_CONFIG.serverHost}/ViewMasterDetail2/Index/HRM/HRMF2362?PK=${apk}&Table=OOT9000&key=APK&DivisionID=${SERVER_CONFIG.divisionId}`;
    const r = await fetch(url);
    const html = await r.text();
    const data = UTILS.parseHTMLDetail(html);
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
  const types = ['work', 'late', 'early'];
  card.dataset.type = types[idx];
  card.onclick = () => toggleStatHighlight(types[idx]);
});

/* ========= DATA PROCESSING ========= */
let currentData = { map: {}, shiftMap: {}, requestMap: {}, stats: {} };

async function processData(attendanceData, shiftData, leaveData) {
  const map = {}, shiftMap = {}, requestMap = {};
  let late = 0, early = 0;

  const userSource = attendanceData.Data?.[0] || shiftData.Data?.[0];
  if (userSource) document.getElementById("userInfo").innerText = `${userSource.FullName} (${userSource.EmployeeID})`;

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
      const from = d.fromDate.split("/");
      const to = d.toDate.split("/");
      startDay = parseInt(from[0]);
      endDay = parseInt(to[0]);
    } else if (d.date !== "N/A") {
      // Handle format: "28/02/2026 08:00:00"
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

  currentData = { map, shiftMap, requestMap, stats: { workDays: Object.keys(map).length, late, early } };
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
    const isToday = today.getDate() === d && today.getMonth() === m - 1 && today.getFullYear() === y;
    const isWeekend = [0, 6].includes(new Date(y, m - 1, d).getDay());
    const recs = map[d] || [];
    const hasData = recs.length > 0;
    const hasFullData = recs.length >= 2;
    const hasShift = !!shiftMap[d];

    const isAbsent = hasShift && !hasData;
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

    cell.innerHTML = html + `</div>`;
    cal.appendChild(cell);
  }
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
      html += `
            <div class="req-item">
                <span class="req-status ${r.status === 'Duyệt' ? '' : 'pending'}">${r.status}</span>
                <h3>${r.description}</h3>
                <div class="req-grid">
                    <div class="req-field"><span class="req-label">Loại</span><span class="req-val">${r.requestType}</span></div>
                    <div class="req-field"><span class="req-label">Thời gian</span><span class="req-val">${r.dailyHours}h</span></div>
                    <div class="req-field"><span class="req-label">Lý do</span><span class="req-val">${r.reason}</span></div>
                    <div class="req-field"><span class="req-label">Ca</span><span class="req-val">${r.shift}</span></div>
                </div>
            </div>`;
    });
  }

  if (html === "") html = "<p style='text-align:center; color: var(--text-muted)'>Không có dữ liệu đặc biệt cho ngày này.</p>";
  mBody.innerHTML = html;
  modal.style.display = "flex";
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
  let sX = e.clientX, sY = e.clientY, iX = root.offsetLeft, iY = root.offsetTop;
  document.onmousemove = (e) => {
    let nX = iX + (e.clientX - sX);
    let nY = iY + (e.clientY - sY);

    // Safe margin so it's never completely stuck
    const margin = 20;
    const maxLeft = window.innerWidth - (root.offsetWidth * currentZoom) + (margin * currentZoom);
    const maxTop = window.innerHeight - (root.offsetHeight * currentZoom) + (margin * currentZoom);

    root.style.left = `${Math.max(-margin, Math.min(nX, maxLeft))}px`;
    root.style.top = `${Math.max(-margin, Math.min(nY, maxTop))}px`;
  };
  document.onmouseup = () => { document.onmousemove = null; saveConfig(); };
};

resize.onmousedown = (e) => {
  let sX = e.clientX, sY = e.clientY, iW = root.clientWidth, iH = root.clientHeight;
  document.onmousemove = (e) => {
    // When zoomed, the delta must be divided by the zoom factor
    let newW = iW + (e.clientX - sX) / currentZoom;
    let newH = iH + (e.clientY - sY) / currentZoom;
    root.style.width = `${Math.max(480, newW)}px`;
    root.style.height = `${Math.max(300, newH)}px`;
  };
  document.onmouseup = () => { document.onmousemove = null; saveConfig(); };
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

    // Step 3: Fetch attendance and other data
    const [att, shift, leave] = await Promise.all([
      fetchAttendance(SELECTED_MONTH),
      fetchShift(SELECTED_MONTH),
      fetchLeaveRequests(SELECTED_MONTH)
    ]);
    console.log("Debug Data:", { att, shift, leave });
    await processData(att, shift, leave);
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
document.getElementById("closeBtn").onclick = () => app.remove();

// Initialize: Load server config then load data
loadServerConfig().then(() => {
  SELECTED_MONTH = formatMonth(new Date());
  load(); // Auto load on startup
});
