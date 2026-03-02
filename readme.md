# 📅 Attendance Dashboard Extension

Một extension cho Microsoft Edge giúp quản lý và theo dõi chấm công một cách hiệu quả từ hệ thống ASP.NET HRM.

---

## ✨ Tính Năng Chính

### 📊 Quản Lý Chấm Công
- **Lịch chấm công toàn tháng** trên một màn hình duy nhất
- **Phân loại trạng thái tự động**:
  - 🟢 **Đúng giờ**: Chấm công đầy đủ trong khung giờ (08:00 - 16:45)
  - 🟡 **Đi trễ**: Vào sau 08:00
  - 🔴 **Về sớm**: Ra trước 16:45
  - ❓ **Quên chấm**: Chỉ có một bản ghi (in hoặc out)
  - 🏠 **Nghỉ**: Có ca nhưng không chấm công
  - 📋 **Có đơn**: Đơn xin phép/đi muộn/về sớm

### 🎛️ Điều Khiển Giao Diện
- **Zoom 50% - 200%** với lưu trữ tự động
- **Kéo & Thay đổi kích thước** cửa sổ
- **Lưu cấu hình**: Vị trí, kích thước, mức zoom được giữ lại

### 📈 Thống Kê Nhanh
- Tổng ngày công trong tháng
- Tổng lần đi trễ
- Tổng lần về sớm

### 🗓️ Chuyển Đổi Kỳ Kế Toán
- Chọn tháng xem
- Tự động load dữ liệu chấm công, ca làm việc, đơn xin

### 🎨 Giao Diện Hiện Đại
- Glass Morphism design với hiệu ứng blur
- Theme tối, dễ nhìn vào ban đêm
- Responsive trên mọi kích thước màn hình
- Loading animation với shimmer effect

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
│   ├── manifest.json              # Cấu hình extension
│   ├── content.js                 # Logic chính (661 dòng)
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
POST /GridCommon/Read?TableName=HRMT2260
Filter by CreateDate
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
| 1.0 | 02/03/2026 | Initial release |
| 1.1 | TBD | Performance improvements |

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
Last updated: 02/03/2026
