# Asoft Attendance Dashboard Extension — Agent Instructions

## Tổng quan dự án

**Attendance Dashboard Pro** là Chrome/Edge Extension (Manifest V3) viết bằng Vanilla JavaScript, dùng để quản lý chấm công và đơn từ trên nền tảng HRM ASP.NET của Asoft.

- **Version**: 2.10
- **Platform**: Chromium-based browsers (Edge, Chrome)
- **Target URL**: `http://*/Contentmaster/Index/HRM/HRMF2260*`

## Cấu trúc dự án

```
extension-asoft/
├── attendance-extension/
│   ├── manifest.json      # Cấu hình Manifest V3
│   ├── content.js         # Toàn bộ logic UI + API (file chính, ~1000+ dòng)
│   ├── calendar.css       # Stylesheet bổ sung
│   ├── popup.html         # Popup mặc định của extension
│   ├── options.html       # Trang cài đặt (server host, divisionId, theme)
│   ├── options.js         # Logic trang cài đặt
│   └── image/             # Assets hình ảnh
├── AGENTS.md              # File này
├── README.md              # Tài liệu người dùng
└── README_Feature.md      # Mô tả tính năng chi tiết
```

## Kiến trúc & Công nghệ

- **Core**: Vanilla JavaScript ES6+ — không dùng framework hay thư viện ngoài
- **Styling**: CSS Variables + `backdrop-filter` (Glass Morphism), 6 theme: `dark`, `light`, `spring`, `summer`, `autumn`, `winter`
- **Storage**:
  - `chrome.storage.sync` — lưu cấu hình server (`asoft-server-config`) và liên kết bù phép per-user (`asoft-bp-links-{empID}`)
  - `localStorage` — lưu vị trí/kích thước/zoom của panel (`asoft-attendance-config`)
- **API**: Giao tiếp với backend ASP.NET qua hàm `api()`, có interceptor xử lý retry khi trùng ApplicationID
- **SVG Overlay**: Vẽ mũi tên cong động trên lịch để trực quan hóa liên kết NP↔BN
- **User Detection**: Ưu tiên đọc `UserID` từ Cookie, fallback sang DOM selectors (`#EmployeeID`, `[data-employee-id]`, ...)

## Các API endpoint chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/Period/BeginEndDate` | Lấy giới hạn kỳ kế toán |
| POST | `/Period/Update` | Cập nhật kỳ kế toán |
| POST | `/GridCommon/Read?TableName=HRMT2260` | Lấy dữ liệu chấm công theo tháng |
| POST | `/GridCommon/ReadEdit?TableName=HRMT2323` | Lấy dữ liệu ca làm việc (shiftMap) |
| POST | `/GridCommon/Read?TableName=HRMT2320` | Lấy dữ liệu OT |
| POST | `/GridCommon/Read?TableName=OOT9000` | Lấy danh sách đơn từ |
| POST | `/HRM/OOF9000/LoadKeyByRequestTypeID` | Lấy key theo loại đơn |
| POST | `/HRM/HRMF2360/GetShiftNow` | Lấy ca làm hiện tại của nhân viên |
| POST | `/HRM/HRMF2360/GetRemainingLeave` | Lấy số ngày phép còn lại |
| POST | `/HRM/OOF9000/LoadDataComboApprovePerson` | Tìm kiếm người duyệt đơn |
| POST | `/GridCommon/InsertUpdatePopupMasterDetailV2/HRM/HRMF2361` | Tạo đơn từ mới |
| POST | `/GridCommon/DeleteViewMaster2/HRM/HRMF2362` | Xóa đơn từ |

## Các loại đơn từ (Application Types)

Mã dùng khi **tạo đơn qua form** (`requestTypeSelect`):

| Mã | Tên | Mô tả |
|----|-----|-------|
| `DXNP` | Đơn xin nghỉ phép | Xin nghỉ phép năm |
| `DXLTG` | Đơn xin làm thêm giờ | Khai báo OT |
| `DXBSQT` | Đơn xin bổ sung quẹt thẻ | Bổ sung giờ vào/ra |
| `DXRN` | Đơn xin ra ngoài | Xin ra ngoài trong giờ làm |
| `DXDC` | Đơn xin đổi ca | Đổi ca làm việc |

Mã dùng trong **`ABSENT_TYPES`** (phân loại ngày nghỉ từ server):

| Mã | Tên |
|----|-----|
| `NP` | Nghỉ phép năm |
| `BN` | Làm bù công nhật |
| `BP` | Làm bù phép |
| `KL` | Nghỉ không lương |
| `GC50` / `GC80` | Công 50% / 80% |
| `CT` | Công tác |
| `BHXH` | Nghỉ BHXH |
| `NC` | Nghỉ cưới, ma chay |
| `CN` | Nghỉ chế độ con nhỏ |
| `TX` | Trễ xe công ty |
| `TS` | Nghỉ thai sản |
| `NT1` | Nghỉ vợ sinh con |

## Tính năng chính

1. **Bù Phép Drag-Drop**: Kéo ngày OT thả vào ngày nghỉ → tự động tạo 2 đơn DXNP+BN liên kết qua `pairId`, vẽ mũi tên SVG nối 2 ngày
2. **Smart Suggestion**: Tự phân tích dữ liệu chấm công → gợi ý loại đơn phù hợp, bao gồm phát hiện **double-swipe** (2 lần quẹt trong < 4 giờ → coi như 1 lần quẹt)
3. **6 Theme System**: Chuyển đổi theme realtime, lưu vào `chrome.storage.sync`
4. **Tương tác lịch**: Highlight ngày vi phạm khi nhấn thẻ thống kê Sidebar
5. **Bộ chọn Tháng/Năm**: Popup hiện đại thay thế dropdown mặc định
6. **Thống kê mở rộng**: Ngày công, Đi trễ, Về sớm, OT 150%, OT 200%, Công thực tế, Công tính lương, Giờ công tiêu chuẩn, Công thiếu
7. **Xuất báo cáo CSV**: Xuất dữ liệu chấm công tháng hiện tại (xử lý BOM UTF-8 cho Excel)

## Quy tắc khi chỉnh sửa code

- **Không thêm thư viện ngoài** — dự án chủ ý dùng Vanilla JS để tránh dependency
- **File duy nhất**: Toàn bộ logic UI/API nằm trong `content.js` (~2700 dòng) — không tách module trừ khi được yêu cầu rõ ràng
- **Manifest V3**: Tuân thủ giới hạn của MV3 — không dùng `background.js` persistent, dùng `service_worker` nếu cần
- **CSS Variables**: Mọi màu sắc/spacing đều dùng CSS variable, không hardcode hex trong JS
- **Storage key conventions**:
  - `asoft-server-config` — cấu hình server và theme (`chrome.storage.sync`)
  - `asoft-attendance-config` — vị trí/kích thước panel (`localStorage`)
  - `asoft-bp-links-{empID}` — danh sách liên kết bù phép per-user (`chrome.storage.sync`)
  - `asoft-approver-{empID}` — người duyệt đơn gần nhất per-user (`chrome.storage.sync`)
- **Console log prefix**: Dùng `[Attendance Dashboard]` cho mọi log
- **isWorkday logic**: Ngày đã qua → dùng `shiftMap` từ HRMT2323 (dữ liệu thực); ngày tương lai → heuristic weekday (T2–T6 làm, T7 đầu tháng d≤7 làm, CN nghỉ)
- **Double-swipe detection**: Nếu nhiều lần quẹt nhưng tổng thời gian < 4 giờ, coi như 1 lần quẹt

## Cấu hình mặc định

```js
SERVER_CONFIG = {
  serverHost: 'http://192.168.10.213:14444',
  divisionId: 'MA',
  theme: 'dark'
};
```

## Build & Cài đặt

Không có build step — load trực tiếp:
1. Mở `edge://extensions` hoặc `chrome://extensions`
2. Bật **Developer mode**
3. **Load unpacked** → chọn thư mục `attendance-extension/`
