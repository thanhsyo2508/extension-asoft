// remove old
document.getElementById("attendance-ext")?.remove();

/* ========= STORAGE PRESETS ========= */
const STORAGE_KEY = "asoft-attendance-config";
const config = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"top":"100px","left":"100px","width":"1080px","height":"auto"}');

/* ========= MODERN UI COMPONENTS ========= */
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
          <div class="month-display">
            <input type="month" id="monthPicker">
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
        <div class="legend-item"><span class="dot absent"></span> Nghỉ</div>
      </div>
    </div>
  </div>
  <div id="resizeHandle" class="resize-handle"></div>
</div>`;
document.body.appendChild(app);

/* ========= PREMIUM STYLES ========= */
const style = document.createElement("style");
style.innerHTML = `
:root {
  --bg-glass: rgba(15, 23, 42, 0.92);
  --border-glass: rgba(255, 255, 255, 0.1);
  --primary: #10b981;
  --primary-glow: rgba(16, 185, 129, 0.3);
  --warning: #f59e0b;
  --danger: #ef4444;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --card-bg: rgba(30, 41, 59, 0.6);
  --accent: #3b82f6;
}

#glassRoot {
  position: fixed;
  min-width: 320px;
  min-height: 200px;
  backdrop-filter: blur(20px) saturate(180%);
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  border-radius: 20px;
  padding: 20px 24px;
  color: var(--text-main);
  z-index: 9999999;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  display: flex; flex-direction: column;
  box-sizing: border-box;
}

.glass-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  cursor: move;
  user-select: none;
}

.brand { display: flex; gap: 12px; align-items: center; pointer-events: none; }
.brand h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }

.icon-box {
  width: 40px; height: 40px;
  background: var(--primary-glow);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
}

#closeBtn {
  background: rgba(255,255,255,0.05); border: none; color: #fff;
  width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
  transition: all 0.2s; display: flex; align-items: center; justify-content: center;
}
#closeBtn:hover { background: var(--danger); transform: rotate(90deg); }

.dashboard-grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

/* RESPONSIVE LAYOUTS */
.calendar-grid {
  display: grid; 
  grid-template-columns: repeat(7, 1fr); 
  gap: 6px; 
  margin-bottom: 12px;
  width: 100%;
}

/* SMALL & MEDIUM ADJUSTMENTS */
#glassRoot.size-small .stats-panel,
#glassRoot.size-medium .stats-panel {
  display: none; /* Hide stats to save space for 7-column grid */
}

#glassRoot.size-small .dashboard-grid,
#glassRoot.size-medium .dashboard-grid {
  grid-template-columns: 1fr;
}

#glassRoot.size-small .day,
#glassRoot.size-medium .day {
  min-height: 60px;
  padding: 6px;
  gap: 4px;
}

#glassRoot.size-small .day-num,
#glassRoot.size-medium .day-num {
  font-size: 12px;
}

#glassRoot.size-small .time-tag,
#glassRoot.size-medium .time-tag {
  font-size: 9px;
  padding: 2px 4px;
  gap: 3px;
}

#glassRoot.size-small .icon,
#glassRoot.size-medium .icon {
  font-size: 10px;
}

#glassRoot.size-small .weekday,
#glassRoot.size-medium .weekday {
  padding: 4px;
  font-size: 10px;
}

/* FULL LAYOUT */
#glassRoot.size-large .calendar-grid {
  grid-template-columns: repeat(7, 1fr);
}

.stats-panel { display: flex; flex-direction: column; gap: 12px; }
.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border-glass);
  padding: 12px 16px;
  border-radius: 14px;
  display: flex; flex-direction: column; gap: 2px;
}
.stat-label { font-size: 10px; text-transform: uppercase; color: var(--text-muted); }
.stat-value { font-size: 22px; font-weight: 800; }
.stat-value.warning { color: var(--warning); }
.stat-value.danger { color: var(--danger); }

.calendar-controls {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px; background: var(--card-bg);
  padding: 8px 12px; border-radius: 12px; border: 1px solid var(--border-glass);
}

.month-nav { display: flex; align-items: center; gap: 10px; }
.nav-btn {
  background: rgba(255,255,255,0.05); border: none; color: #fff;
  width: 32px; height: 32px; border-radius: 8px; cursor: pointer;
}

#monthPicker {
  background: transparent; border: none; color: #fff; font-weight: 600; font-size: 14px;
  outline: none;
}

.btn-primary {
  background: var(--primary); color: #fff; border: none;
  padding: 8px 16px; border-radius: 10px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 6px; font-size: 13px;
}

.calendar-grid {
  display: grid; gap: 8px; margin-bottom: 12px;
}

.weekday {
  text-align: center; padding: 8px; font-size: 12px; font-weight: 700;
  color: var(--text-muted);
}

.day {
  background: var(--card-bg); border: 1px solid var(--border-glass);
  min-height: 80px; border-radius: 14px; padding: 10px;
  display: flex; flex-direction: column; justify-content: space-between;
  transition: transform 0.2s; position: relative; overflow: hidden;
}
.day:hover { transform: translateY(-3px); background: rgba(255,255,255,0.08); }
.day.weekend { background: rgba(15, 23, 42, 0.4); }
.day.today { border: 2px solid var(--accent); }
.day.empty { opacity: 0.2; pointer-events: none; }

.day-num { font-size: 15px; font-weight: 800; }

.time-box { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.time-tag {
  font-size: 11px; font-weight: 600; padding: 4px 8px;
  border-radius: 8px; background: rgba(255,255,255,0.05);
  display: flex; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,0.05);
}
.time-tag.late { color: var(--warning); background: rgba(245, 158, 11, 0.1); }
.time-tag.early { color: var(--danger); background: rgba(239, 68, 68, 0.1); }
.time-tag.normal { color: var(--primary); background: rgba(16, 185, 129, 0.1); }
.time-tag.absent { color: #a855f7; background: rgba(168, 85, 247, 0.1); border-color: rgba(168, 85, 247, 0.2); }
.day.absent { background: rgba(168, 85, 247, 0.05); }

.legend { display: flex; flex-wrap: wrap; gap: 16px; font-size: 11px; color: var(--text-muted); }
.legend-item { display: flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.normal { background: var(--primary); }
.dot.warning { background: var(--warning); }
.dot.danger { background: var(--danger); }
.dot.absent { background: #a855f7; }

.resize-handle {
  position: absolute; bottom: 0; right: 0; width: 20px; height: 20px;
  background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.2) 50%);
  border-radius: 0 0 20px 0; cursor: nwse-resize;
}

#glassRoot::-webkit-scrollbar { width: 6px; }
#glassRoot::-webkit-scrollbar-thumb { background: var(--border-glass); border-radius: 10px; }
`;
document.head.appendChild(style);

/* ========= LOGIC: DRAG & RESIZE ========= */
const root = document.getElementById("glassRoot");
const header = document.getElementById("dragHeader");
const resize = document.getElementById("resizeHandle");

const saveConfig = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    top: root.style.top, left: root.style.left,
    width: root.style.width, height: root.style.height
  }));
};

// Drag Logic
let isDragging = false;
let startX, startY, initialX, initialY;

header.onmousedown = (e) => {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  initialX = root.offsetLeft;
  initialY = root.offsetTop;

  document.onmousemove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newX = initialX + deltaX;
    let newY = initialY + deltaY;

    // Viewport bounds
    const maxLeft = window.innerWidth - root.offsetWidth;
    const maxTop = window.innerHeight - root.offsetHeight;

    newX = Math.max(0, Math.min(newX, maxLeft));
    newY = Math.max(0, Math.min(newY, maxTop));

    root.style.left = `${newX}px`;
    root.style.top = `${newY}px`;
  };

  document.onmouseup = () => {
    isDragging = false;
    document.onmousemove = null;
    saveConfig();
  };
};

// Resize Logic
let isResizing = false;
resize.onmousedown = (e) => {
  isResizing = true;
  startX = e.clientX;
  startY = e.clientY;
  let initialW = root.clientWidth;
  let initialH = root.clientHeight;

  document.onmousemove = (e) => {
    if (!isResizing) return;
    root.style.width = `${initialW + (e.clientX - startX)}px`;
    root.style.height = `${initialH + (e.clientY - startY)}px`;
  };
  document.onmouseup = () => {
    isResizing = false;
    document.onmousemove = null;
    saveConfig();
  };
  e.stopPropagation();
  e.preventDefault();
};

// Layout Switcher
const observer = new ResizeObserver(entries => {
  const w = entries[0].contentRect.width;
  root.classList.remove('size-small', 'size-medium', 'size-large');
  if (w < 600) root.classList.add('size-small');
  else if (w < 900) root.classList.add('size-medium');
  else root.classList.add('size-large');
});
observer.observe(root);


/* ========= CORE LOGIC ========= */
const UTILS = {
  parseTime: t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; },
  classify: (t, isFirst) => {
    const mins = UTILS.parseTime(t);
    if (isFirst) return mins > 480 ? "late" : "normal";
    return mins < 1005 ? "early" : "normal";
  }
};

async function fetchAttendance(monthStr) {
  const [y, m] = monthStr.split("-");
  const body = new URLSearchParams({
    page: 1, pageSize: 200,
    "args[0].Key": "ftype[]", "args[0].Value[0]": 5,
    "args[1].Key": "dttype[]", "args[1].Value[0]": 9,
    "args[2].Key": "key[]", "args[2].Value[0]": "AbsentDate",
    "args[3].Key": "value[]", "args[3].Value[0]": `01/${m}/${y}`, "args[3].Value[1]": `31/${m}/${y}`,
    "args[4].Key": "systemInfo[]", "args[4].Value[0]": "HRMF2260", "args[4].Value[1]": "HRM", "args[4].Value[2]": "HRMT2260"
  });

  try {
    const r = await fetch("/GridCommon/Read?TableName=HRMT2260", {
      method: "POST", headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' }, body
    });
    return r.json();
  } catch (e) { return { Data: [] }; }
}

async function fetchShift(monthStr) {
  const [y, m] = monthStr.split("-");
  const body = new URLSearchParams({
    page: 1, pageSize: 200,
    "args[0].Key": "key[]", "args[0].Value[0]": "EmployeeID",
    "args[1].Key": "value[]", "args[1].Value[0]": "000174", // ID mẩu của bạn
    "args[2].Key": "systemInfo[]", "args[2].Value[0]": "HRM", "args[2].Value[1]": "HRMF2323", "args[2].Value[2]": "HRMT2323"
  });

  try {
    const r = await fetch("/GridCommon/ReadEdit?TableName=HRMT2323", {
      method: "POST", headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' }, body
    });
    const data = await r.json();
    console.log("Shift Data:", data);
    return data;
  } catch (e) { return { Data: [] }; }
}

function processData(attendanceData, shiftData) {
  const map = {}, shiftMap = {};
  let late = 0, early = 0;

  // Xử lý thông tin User
  const userSource = attendanceData.Data?.[0] || shiftData.Data?.[0];
  if (userSource) {
    document.getElementById("userInfo").innerText = `${userSource.FullName} (${userSource.EmployeeID})`;
  }

  // Xử lý dữ liệu Chấm công
  if (attendanceData.Data?.length > 0) {
    attendanceData.Data.forEach(r => {
      const day = parseInt(r.AbsentDate.split("/")[0]);
      if (!map[day]) map[day] = [];
      map[day].push(r.AbsentHour);
    });
    Object.values(map).forEach(records => {
      records.sort();
      if (UTILS.classify(records[0], true) === "late") late++;
      if (records.length > 1 && UTILS.classify(records[records.length - 1], false) === "early") early++;
    });
  }

  // Xử lý dữ liệu Đăng ký Ca (Shift)
  if (shiftData.Data?.length > 0) {
    shiftData.Data.forEach(r => {
      const day = parseInt(r.AbsentDate.split("/")[0]);
      if (r.ShiftID) shiftMap[day] = r.ShiftID;
    });
  }

  return { map, shiftMap, stats: { workDays: Object.keys(map).length, late, early } };
}

function render(dataObj, monthStr) {
  const { map, shiftMap, stats } = dataObj;
  const cal = document.getElementById("calendar");
  if (!cal) return;
  cal.innerHTML = "";
  document.getElementById("statWorkDays").innerText = stats.workDays;
  document.getElementById("statLate").innerText = stats.late;
  document.getElementById("statEarly").innerText = stats.early;

  const [y, m] = monthStr.split("-").map(Number);
  const firstDay = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m, 0).getDate();
  const today = new Date();

  const currentSize = root.classList.contains('size-large') ? 'large' : root.classList.contains('size-medium') ? 'medium' : 'small';

  // Render Weekdays (Always show in 7-column grid)
  ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach(w => {
    const div = document.createElement("div"); div.className = "weekday"; div.innerText = w; cal.appendChild(div);
  });

  // Empty cells for first week
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div"); empty.className = "day empty"; cal.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getDate() === d && today.getMonth() === m - 1 && today.getFullYear() === y;
    const isWeekend = [0, 6].includes(new Date(y, m - 1, d).getDay());
    const hasData = !!map[d];
    const hasShift = !!shiftMap[d];
    // Quyết định báo "Nghỉ": có ShiftID nhưng không có tick vân tay (Attendance Data)
    const isAbsent = hasShift && !hasData;

    const cell = document.createElement("div");
    cell.className = `day ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''} ${isAbsent ? 'absent' : ''}`;

    let html = `<div class="day-num">${d}</div><div class="time-box">`;
    if (hasData) {
      const recs = [...map[d]].sort();
      recs.forEach((t, i) => {
        if (i === 0 || i === recs.length - 1) {
          const type = UTILS.classify(t, i === 0);
          html += `<div class="time-tag ${type}"><span class="icon">${i === 0 ? "🕒" : "📤"}</span><span>${t.slice(0, 5)}</span></div>`;
        }
      });
    } else if (isAbsent) {
      html += `<div class="time-tag absent"><span class="icon">🏠</span><span>Nghỉ</span></div>`;
    }
    cell.innerHTML = html + `</div>`;
    cal.appendChild(cell);
  }
}

const picker = document.getElementById("monthPicker");
picker.value = new Date().toISOString().slice(0, 7);
async function load() {
  const btn = document.getElementById("loadBtn");
  if (!btn) return;
  btn.style.opacity = "0.5"; btn.innerText = "Đang tải...";

  // Gọi song song 2 API
  const [attendanceData, shiftData] = await Promise.all([
    fetchAttendance(picker.value),
    fetchShift(picker.value)
  ]);

  render(processData(attendanceData, shiftData), picker.value);
  btn.style.opacity = "1"; btn.innerHTML = '<span class="icon">🔄</span> Cập nhật';
}

document.getElementById("loadBtn").onclick = load;
document.getElementById("prevMonth").onclick = () => {
  const d = new Date(picker.value + "-01"); d.setMonth(d.getMonth() - 1);
  picker.value = d.toISOString().slice(0, 7); load();
};
document.getElementById("nextMonth").onclick = () => {
  const d = new Date(picker.value + "-01"); d.setMonth(d.getMonth() + 1);
  picker.value = d.toISOString().slice(0, 7); load();
};
document.getElementById("closeBtn").onclick = () => app.remove();

load();
