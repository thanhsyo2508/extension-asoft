// remove old
document.getElementById("attendance-ext")?.remove();

/* ========= MODERN UI COMPONENTS ========= */
const app = document.createElement("div");
app.id = "attendance-ext";
app.innerHTML = `
<div id="glassRoot">
  <div class="glass-header">
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
        <div class="legend-item"><span class="dot warning"></span> Đi trễ (>8:00)</div>
        <div class="legend-item"><span class="dot danger"></span> Về sớm (<17:00)</div>
      </div>
    </div>
  </div>
</div>`;
document.body.appendChild(app);

/* ========= PREMIUM STYLES ========= */
const style = document.createElement("style");
style.innerHTML = `
:root {
  --bg-glass: rgba(15, 23, 42, 0.8);
  --border-glass: rgba(255, 255, 255, 0.1);
  --primary: #10b981;
  --primary-glow: rgba(16, 185, 129, 0.3);
  --warning: #f59e0b;
  --danger: #ef4444;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --card-bg: rgba(30, 41, 59, 0.5);
  --accent: #3b82f6;
}

#glassRoot {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 1080px;
  max-width: 95vw;
  max-height: 96vh;
  overflow-y: auto;
  backdrop-filter: blur(20px) saturate(180%);
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  border-radius: 20px;
  padding: 20px 24px;
  color: var(--text-main);
  z-index: 999999;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  display: flex; flex-direction: column;
}

.glass-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.brand { display: flex; gap: 12px; align-items: center; }
.brand h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }

.icon-box {
  width: 40px; height: 40px;
  background: var(--primary-glow);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
}

.user-badge {
  font-size: 12px; color: var(--text-muted);
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
}

.stats-panel { display: flex; flex-direction: column; gap: 12px; }
.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border-glass);
  padding: 12px 16px;
  border-radius: 14px;
  display: flex; flex-direction: column; gap: 2px;
}
.stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
.stat-value { font-size: 22px; font-weight: 800; }
.stat-value.warning { color: var(--warning); }
.stat-value.danger { color: var(--danger); }
.stat-card.info { background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), transparent); }

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
.nav-btn:hover { background: rgba(255,255,255,0.1); }

#monthPicker {
  background: transparent; border: none; color: #fff; font-weight: 600; font-size: 14px;
  cursor: pointer; outline: none;
}

.btn-primary {
  background: var(--primary); color: #fff; border: none;
  padding: 8px 16px; border-radius: 10px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; display: flex; align-items: center; gap: 6px; font-size: 13px;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px var(--primary-glow); }

.calendar-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 12px;
}

.weekday {
  text-align: center; padding: 8px; font-size: 12px; font-weight: 700;
  color: var(--text-muted);
}

.day {
  background: var(--card-bg); border: 1px solid var(--border-glass);
  min-height: 80px; border-radius: 14px; padding: 10px;
  display: flex; flex-direction: column; justify-content: space-between;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; overflow: hidden;
}
.day::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px;
  background: transparent; transition: all 0.3s;
}
.day:hover { 
  border-color: rgba(255,255,255,0.2); 
  background: rgba(255,255,255,0.08);
  transform: translateY(-4px);
  box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3);
}
.day.weekend { background: rgba(15, 23, 42, 0.4); }
.day.weekend .day-num { color: var(--text-muted); opacity: 0.6; }
.day.today { border: 2px solid var(--accent); box-shadow: 0 0 15px var(--accent); }
.day.today::before { background: var(--accent); }
.day.empty { opacity: 0.2; pointer-events: none; border: 1px dashed var(--border-glass); }

.day-num { 
  font-size: 16px; font-weight: 800; color: var(--text-main); 
  display: flex; justify-content: space-between; align-items: center;
}

.time-box {
  display: flex; flex-direction: column; gap: 6px; margin-top: 8px;
}
.time-tag {
  font-size: 11px; font-weight: 600; padding: 4px 8px;
  border-radius: 8px; background: rgba(255,255,255,0.03);
  display: flex; align-items: center; gap: 6px;
  border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.2s;
}
.time-tag:hover { background: rgba(255,255,255,0.08); }
.time-tag .icon { font-size: 12px; opacity: 0.8; }
.time-tag.late { 
  color: var(--warning); background: rgba(245, 158, 11, 0.1); 
  border-color: rgba(245, 158, 11, 0.2); 
}
.time-tag.early { 
  color: var(--danger); background: rgba(239, 68, 68, 0.1); 
  border-color: rgba(239, 68, 68, 0.2); 
}
.time-tag.normal { 
  color: var(--primary); background: rgba(16, 185, 129, 0.1); 
  border-color: rgba(16, 185, 129, 0.2); 
}

.legend { display: flex; gap: 24px; font-size: 12px; color: var(--text-muted); padding: 0 8px; }
.legend-item { display: flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.normal { background: var(--primary); }
.dot.warning { background: var(--warning); }
.dot.danger { background: var(--danger); }

/* Scrollbar */
#glassRoot::-webkit-scrollbar { width: 6px; }
#glassRoot::-webkit-scrollbar-thumb { background: var(--border-glass); border-radius: 10px; }
`;
document.head.appendChild(style);

/* ========= LOGIC & DATA ========= */
const UTILS = {
  parseTime: t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; },
  formatDate: (d, m, y) => `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
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
      method: "POST",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
      body
    });
    return r.json();
  } catch (e) {
    console.error("Fetch failed, using mock data if available", e);
    // fallback logic or alert
    return { Data: [] };
  }
}

function processData(data) {
  const map = {};
  let lateCount = 0;
  let earlyCount = 0;
  let userInfo = { name: "-", code: "-" };

  if (data.Data && data.Data.length > 0) {
    userInfo.name = data.Data[0].FullName;
    userInfo.code = data.Data[0].EmployeeID;

    data.Data.forEach(r => {
      const day = parseInt(r.AbsentDate.split("/")[0]);
      if (!map[day]) map[day] = [];
      map[day].push(r.AbsentHour);
    });

    // Calculate stats
    Object.values(map).forEach(records => {
      records.sort();
      const first = records[0];
      const last = records[records.length - 1];

      if (UTILS.classify(first, true) === "late") lateCount++;
      if (records.length > 1 && UTILS.classify(last, false) === "early") earlyCount++;
    });
  }

  return { map, stats: { workDays: Object.keys(map).length, late: lateCount, early: earlyCount }, userInfo };
}

function render(dataObj, monthStr) {
  const { map, stats, userInfo } = dataObj;
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";

  // Update Stats & User
  document.getElementById("userInfo").innerText = `${userInfo.name} (${userInfo.code})`;
  document.getElementById("statWorkDays").innerText = stats.workDays;
  document.getElementById("statLate").innerText = stats.late;
  document.getElementById("statEarly").innerText = stats.early;

  const [y, m] = monthStr.split("-").map(Number);
  const firstDay = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m, 0).getDate();
  const today = new Date();

  // Render Weekdays
  ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach(w => {
    const div = document.createElement("div");
    div.className = "weekday";
    div.innerText = w;
    cal.appendChild(div);
  });

  // Empty cells for first week
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    cal.appendChild(empty);
  }

  // Render Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(y, m - 1, d);
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    const isToday = today.getFullYear() === y && today.getMonth() === m - 1 && today.getDate() === d;

    const cell = document.createElement("div");
    cell.className = `day ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}`;

    let html = `<div class="day-num">${d}</div><div class="time-box">`;

    if (map[d]) {
      const records = [...map[d]].sort();
      records.forEach((t, idx) => {
        if (idx === 0 || idx === records.length - 1) {
          const type = UTILS.classify(t, idx === 0);
          const iconChar = idx === 0 ? "🕒" : "📤";
          html += `<div class="time-tag ${type}"><span class="icon">${iconChar}</span><span>${t.slice(0, 5)}</span></div>`;
        }
      });
    }
    html += `</div>`;
    cell.innerHTML = html;
    cal.appendChild(cell);
  }
}

/* ========= INITIALIZATION ========= */
const picker = document.getElementById("monthPicker");
picker.value = new Date().toISOString().slice(0, 7);

async function load() {
  const btn = document.getElementById("loadBtn");
  btn.style.opacity = "0.5";
  btn.innerHTML = "Đang tải...";

  const rawData = await fetchAttendance(picker.value);
  const processed = processData(rawData);
  render(processed, picker.value);

  btn.style.opacity = "1";
  btn.innerHTML = '<span class="icon">🔄</span> Cập nhật';
}

document.getElementById("loadBtn").onclick = load;
document.getElementById("prevMonth").onclick = () => {
  const d = new Date(picker.value + "-01");
  d.setMonth(d.getMonth() - 1);
  picker.value = d.toISOString().slice(0, 7);
  load();
};
document.getElementById("nextMonth").onclick = () => {
  const d = new Date(picker.value + "-01");
  d.setMonth(d.getMonth() + 1);
  picker.value = d.toISOString().slice(0, 7);
  load();
};
document.getElementById("closeBtn").onclick = () => app.remove();

// Start
load();
