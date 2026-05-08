# 📅 Attendance Dashboard Extension

Một extension cho Microsoft Edge giúp quản lý và theo dõi chấm công một cách hiệu quả từ hệ thống ASP.NET HRM.

---

### 🎨 Giao Diện & Trải Nghiệm (v2.0)
- **Glass Morphism Premium**: Thiết kế hiện đại với hiệu ứng mờ nhám và viền sắc nét.
- **Hệ thống Theme (6 màu)**: 
  - 🌑 Dark (Mặc định) | ☀️ Light | 🌸 Spring | 🌻 Summer | 🍂 Autumn | ❄️ Winter
  - Lưu trạng thái theme qua `chrome.storage.sync`.
- **Micro-animations**:
  - ✨ **Glow Pulse**: Phát sáng nhẹ cho ngày làm việc đúng giờ.
  - 🏎️ **Light Sweep**: Hiệu ứng vượt sáng khi di chuột qua ô ngày.
- **Bộ chọn Tháng/Năm Tùy chỉnh**: Giao diện chọn tháng hiện đại, điều hướng năm nhanh và nút "Hôm nay".
- **Thống kê Tương tác**: Nhấn vào thẻ thống kê (Ngày công, Trễ, Sớm) để highlight ngay các ngày tương ứng trên lịch.
- **Skeleton Loading**: Trạng thái chờ với độ tương phản cao, tối ưu theo từng theme.

### 📤 Tiện Ích & Dữ Liệu
- **Xuất báo cáo CSV/Excel**: Tải dữ liệu chấm công tháng hiện tại chỉ với 1 click (đã xử lý lỗi font Tiếng Việt).
- **Hỗ trợ đơn từ phức tạp**: 
  - Gộp hiển thị khi một ngày có nhiều đơn (📄 x2 Đơn).
  - Hỗ trợ parser cho đơn Bổ sung quẹt thẻ (**DXBSQT**).
- **Tự động hóa**: Mặc định load tháng hiện tại ngay khi mở, tự động cập nhật khi chuyển tháng.

---

## 🚀 Cài Đặt

### Yêu Cầu
- **Microsoft Edge** v90+ (hoặc Chromium-based browser)
- Quyền truy cập hệ thống HRM tại `http://192.168.10.213:14444`

### Cài Đặt Thủ Công (Developer Mode)

1. Mở Microsoft Edge → `edge://extensions`
2. Bật **Developer mode** (góc dưới trái)
3. Nhấp **Load unpacked**
4. Chọn thư mục `attendance-extension/`
5. Extension sẵn sàng sử dụng ✅

---

## 📁 Cấu Trúc Dự Án

```
attendance-dashboard/
├── attendance-extension/
│   ├── manifest.json              # Cấu hình extension v3
│   ├── content.js                 # Logic chính (V2.0 ~1000+ dòng)
│   ├── popup.html                 # Popup mặc định
│   └── calendar.css               # Stylesheet tùy chọn
├── .gitignore                     # Git ignore file
├── README.md                      # Tài liệu này
├── attendance-calendar.js         # Script cũ (tham khảo)
└── [các file khác]
```

---

## 🔌 API Integration

### 1️⃣ GET Period Boundaries
```
POST /Period/BeginEndDate
```
Lấy giới hạn kỳ kế toán hiện tại

### 2️⃣ SET Period (Accounting Month)
```
POST /Period/Update
Parameters:
  - DivisionIDPeriod: "MA"
  - Period: "03/2026"
  - BeginDate: "01/03/2026" (DD/MM/YYYY)
  - EndDate: "31/03/2026"   (DD/MM/YYYY)
  - TranMonth: "03"
  - TranYear: "2026"
```

### 3️⃣ Attendance Records
```
POST /GridCommon/Read?TableName=HRMT2260
Filter by AbsentDate range
```

### 4️⃣ Shift Information
```
POST /GridCommon/ReadEdit?TableName=HRMT2323
```

### 5️⃣ Leave Requests
```
POST /GridCommon/Read?TableName=OOT9000
Filter by CreateDate range
```

### 6️⃣ Request Details
```
GET /ViewMasterDetail2/Index/HRM/HRMF2362?PK={id}&Table=OOT9000
```

---

## 🛠️ Công Nghệ

- **Vanilla JavaScript** - Không framework, không dependencies
- **CSS3** - Glass Morphism, CSS Variables, Flexbox
- **HTML5** - Semantic markup
- **localStorage** - Persistent config storage

---

## ⚙️ Configuration

### localStorage Key
```json
"asoft-attendance-config": {
  "top": "100px",
  "left": "100px",
  "width": "1080px",
  "height": "auto",
  "zoom": 1
}
```

### Time Constants
- **Check-in threshold**: 08:00 (480 minutes)
- **Check-out threshold**: 16:45 (1005 minutes)

### CSS Variables
```css
--primary: #10b981        /* Green */
--warning: #f59e0b        /* Yellow */
--danger: #ef4444         /* Red */
--request: #a855f7        /* Purple */
--bg-glass: rgba(...)     /* Dark background */
```

---

## 📱 Responsive Breakpoints

| Width | Behavior |
|-------|----------|
| < 650px | Ẩn sidebar stats |
| < 950px | Compact mode |
| ≥ 950px | Full layout |

---

## 🔐 Security

- ✅ Header `X-Requested-With: XMLHttpRequest` trên tất cả request
- ✅ Không lưu mật khẩu hoặc dữ liệu nhạy cảm
- ✅ Chỉ gọi API nội bộ
- ✅ HTTPS-ready (sử dụng khi server có SSL)

---

## 📊 manifest.json

```json
{
  "manifest_version": 3,
  "name": "Attendance Dashboard",
  "description": "Quản lý chấm công từ hệ thống HRM",
  "version": "1.0",
  "permissions": ["storage"],
  "content_scripts": [
    {
      "matches": ["*://*/*"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ]
}
```

---

## 📤 Chuẩn Bị Đẩy Lên Microsoft Edge Add-ons

### Bước 1: Chuẩn Bị Tài Liệu
- ✅ `.gitignore` - Hoàn thành
- ✅ `README.md` - Hoàn thành (file này)
- ✅ `manifest.json` - Phiên bản 3+
- ⏳ Icon 128x128 (`icon-128.png`)
- ⏳ Icon 48x48 (`icon-48.png`)
- ⏳ Screenshot 1280x800 (khuyến cáo)

### Bước 2: Tạo Package
```bash
# Nén thư mục extension
zip -r attendance-dashboard-v1.0.zip attendance-extension/
```

### Bước 3: Đăng Ký
1. Truy cập [Partner Center](https://partner.microsoft.com)
2. Đăng nhập hoặc tạo tài khoản
3. Tạo Extension listing mới
4. Upload `.zip` file
5. Điền thông tin:
   - Tên, mô tả (EN & VN)
   - Ảnh chụp màn hình
   - Danh mục (Productivity)
   - Privacy policy
6. Gửi review (3-7 ngày)

### Bước 4: Xuất Bản
- Sau khi được phê duyệt, extension sẽ xuất hiện trên [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons)

---

## 🐛 Debugging

### Console Logs
Mở DevTools: `F12` → Console tab

Tìm logs từ extension:
- "Calculated dates:" - Kiểm tra tính toán ngày
- "Period Update Payload:" - Xem request body
- "Period Update HTTP Status:" - Xem mã trạng thái
- "Debug Data:" - Kiểm tra dữ liệu nhận được

### Network Inspector
- Tab **Network** để xem request/response
- Lọc theo `/Period/Update` hoặc `/GridCommon/Read`
- Kiểm tra status code (200 = OK, 500 = Error)

---

## 📞 Hỗ Trợ

Nếu gặp lỗi:
1. Kiểm tra console (F12)
2. Xem Network tab để debug API
3. Đảm bảo đã login vào hệ thống
4. Thử refresh extension bằng `Ctrl+Shift+R`

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.8 | 08/05/2026 | Bù Phép Drag-Drop, SVG Overlay, Smart Suggestion |
| 2.9 | 08/05/2026 | Tự động phát hiện liên kết Bù Phép từ mô tả, Hiển thị Mã đơn từ (Application ID) |

---

## 📋 Checklist Trước Khi Đẩy Lên

- [ ] `.gitignore` được tạo
- [ ] `README.md` hoàn thành
- [ ] `manifest.json` sử dụng v3
- [ ] Không có console errors
- [ ] Test trên Edge thực
- [ ] `content.js` không có hardcoded debug logs
- [ ] Icon assets được tạo (128x128, 48x48)
- [ ] Screenshot chất lượng cao (1280x800)
- [ ] Tất cả images có kích thước < 1MB

---

## 📜 License

Copyright © 2026. All rights reserved.

---

**Made with ❤️ for HRM Efficiency**  
Last updated: 08/05/2026 (v2.9)
