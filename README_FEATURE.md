# \ud83d\udcc5 Attendance Dashboard Extension
 
 M\u1ed9t extension cho Microsoft Edge gi\u00fap qu\u1ea3n l\u00fd v\u00e0 theo d\u00f5i ch\u1ea5m c\u00f4ng m\u1ed9t c\u00e1ch hi\u1ec7u qu\u1ea3 t\u1eeb h\u1ec7 th\u1ed1ng ASP.NET HRM.
 
 ---
 
 ### \ud83c\udfa8 Giao Di\u1ec7n & Tr\ud83e\uddfa Nghi\u1ec7m (v2.0)
 - **Glass Morphism Premium**: Thi\u1ebft k\u1ebf hi\u1ec7n \u0111\u1ea1i v\u1edbi hi\u1ec7u \u1ee9ng m\u1edd nh\u00e1m v\u00e0 vi\u1ec1n s\ud83e\uddfa n\u00e9t.
 - **H\u1ec7 th\u1ed1ng Theme (6 m\u00e0u)**: 
   - \ud83c\udf11 Dark (M\u1eb7c \u0111\u1ecbnh) | \u2600\ufe0f Light | \ud83c\udf38 Spring | \ud83c\udf3b Summer | \ud83c\udf42 Autumn | \u2744\ufe0f Winter
   - L\u01b0u tr\u1ea1ng th\u00e1i theme qua `chrome.storage.sync`.
 - **Micro-animations**:
   - \u2728 **Glow Pulse**: Ph\u00e1t s\u00e1ng nh\u1eb9 cho ng\u00e0y l\u00e0m vi\u1ec7c \u0111\u00fang gi\u1edd.
   - \ud83c\udfce\ufe0f **Light Sweep**: Hi\u1ec7u \u1ee9ng v\u01b0\u1ee3t s\u00e1ng khi di chu\u1ed9t qua \u00f4 ng\u00e0y.
 - **B\u1ed9 ch\u1ecdn Th\u00e1ng/N\u0103m T\u00f9y ch\u1ec9nh**: Giao di\u1ec7n ch\u1ecdn th\u00e1ng hi\u1ec7n \u0111\u1ea1i, \u0111i\u1ec1u h\u01b0\u1edbng n\u0103m nhanh v\u00e0 n\u00fat \"H\u00f4m nay\".
 - **Th\u1ed1ng k\u00ea T\u01b0\u01a1ng t\u00e1c**: Nh\u1ea5n v\u00e0o th\u1ebb th\u1ed1ng k\u00ea (Ng\u00e0y c\u00f4ng, Tr\u1ec3, S\u1edbm) \u0111\u1ec3 highlight ngay c\u00e1c ng\u00e0y t\u01b0\u01a1ng \u1ee9ng tr\u00ean l\u1ecbch.
 - **Skeleton Loading**: Tr\u1ea1ng th\u00e1i ch\u1edd v\u1edbi \u0111\u1ed9 t\u01b0\u01a1ng ph\u1ea3n cao, t\u1ed1i \u01b0u theo t\u1eebng theme.
 
 ### \ud83d\udce4 Ti\u1ec7n \u00cdch & D\u1eef Li\u1ec7u
 - **Xu\u1ea5t b\u00e1o c\u00e1o CSV/Excel**: T\u1ea3i d\u1eef li\u1ec7u ch\u1ea5m c\u00f4ng th\u00e1ng hi\u1ec7n t\u1ea1i ch\u1ec9 v\u1edbi 1 click (\u0111\u00e3 x\u1eed l\u00fd l\u1ed7i font Ti\u1ebfng Vi\u1ec7t).
 - **H\u1ed7 tr\u1ee3 \u0111\u01a1n t\u1eeb ph\u1ee9c t\u1ea1p**: 
   - G\u1ed9p hi\u1ec3n th\u1ecb khi m\u1ed9t ng\u00e0y c\u00f3 nhi\u1ec1u \u0111\u01a1n (\ud83d\udcc4 x2 \u0110\u01a1n).
   - H\u1ed7 tr\u1ee3 parser cho \u0111\u01a1n B\u1ed9 sung qu\u1ebft th\u1ebb (**DXBSQT**).
 - **T\u1ef1 \u0111\u1ed9ng h\u00f3a**: M\u1eb7c \u0111\u1ecbnh load th\u00e1ng hi\u1ec7n t\u1ea1i ngay khi m\u1edf, t\u1ef1 \u0111\u1ed9ng c\u1eadp nh\u1eadt khi chuy\u1ec3n th\u00e1ng.
 
 ---
 
 ## \ud83d\ude80 C\u00e0i \u0110\u1eb7t
 
 ### Y\u00eau C\u1ea7u
 - **Microsoft Edge** v90+ (ho\u1eb7c Chromium-based browser)
 - Quy\u1ec1n truy c\u1eadp h\u1ec7 th\u1ed1ng HRM t\u1ea1i `http://192.168.10.213:14444`
 
 ### C\u00e0i \u0110\u1eb7t Th\u1ee7 C\u00f4ng (Developer Mode)
 
 1. M\u1edf Microsoft Edge \u2192 `edge://extensions`
 2. B\u1eadt **Developer mode** (g\u00f3c d\u01b0\u1edbi tr\u00e1i)
 3. Nh\u1ea5p **Load unpacked**
 4. Ch\u1ecdn th\u01b0 m\u1ee5c `attendance-extension/`
 5. Extension s\u1eb5n s\u00e0ng s\u1eed d\u1ee5ng \u2705
 
 ---
 
 ## \ud83d\udcc1 C\u1ea5u Tr\u00fac D\u1ef1 \u00c1n
 
 ```
 attendance-dashboard/
 \u251c\u2500\u2500 attendance-extension/
 \u2502   \u251c\u2500\u2500 manifest.json              # C\u1ea5u h\u00ecnh extension v3
 \u2502   \u251c\u2500\u2500 content.js                 # Logic ch\u00ednh
 \u2502   \u251c\u2500\u2500 popup.html                 # Popup m\u1eb7c \u0111\u1ecbnh
 \u2502   \u2514\u2500\u2500 calendar.css               # Stylesheet t\u00f9y ch\u1ecdn
 \u251c\u2500\u2500 .gitignore                     # Git ignore file
 \u251c\u2500\u2500 README.md                      # T\u00e0i li\u1ec7u n\u00e0y
 \u2514\u2500\u2500 README_FEATURE.md              # Chi ti\u1ebft t\u00ednh n\u0103ng
 ```
 
 ---
 
 ## \ud83d\udd0c API Integration
 
 ### 1\ufe0f\u20e3 GET Period Boundaries
 ```
 POST /Period/BeginEndDate
 ```
 L\u1ea5y gi\u1edbi h\u1ea1n k\u1ef3 k\u1ebf to\u00e1n hi\u1ec7n t\u1ea1i
 
 ### 2\ufe0f\u20e3 SET Period (Accounting Month)
 ```
 POST /Period/Update
 Parameters:
   - DivisionIDPeriod: \"MA\"
   - Period: \"03/2026\"
   - BeginDate: \"01/03/2026\" (DD/MM/YYYY)
   - EndDate: \"31/03/2026\"   (DD/MM/YYYY)
   - TranMonth: \"03\"
   - TranYear: \"2026\"
 ```
 
 ### 3\ufe0f\u20e3 Attendance Records
 ```
 POST /GridCommon/Read?TableName=HRMT2260
 Filter by AbsentDate range
 ```
 
 ---
 
 ## \ud83d\udee0\ufe0f C\u00f4ng Ngh\u1ec7
 
 ## 🛠️ Công Nghệ
 
 - **Vanilla JavaScript** - Không framework, không dependencies
 - **CSS3** - Glass Morphism, CSS Variables, Flexbox
 - **HTML5** - Semantic markup
 - **localStorage** - Persistent config storage
 
 ---
  ## 📄 manifest.json
 
 ```json
 {
   "manifest_version": 3,
   "name": "Attendance Dashboard Pro",
   "version": "2.15",
   "permissions": ["storage", "cookies"]
 }
 ```
 
 ---
 
 ## 📝 Version History
 
 | Version | Date | Changes |
|---------|------|---------|
| 2.15 | 29/05/2026 | Sửa lỗi IsOnTripOT cho đơn xin ra ngoài, đổi tên hiển thị thành Đơn xin phép, thêm link Mã đơn |
| 2.14 | 29/05/2026 | Thêm checkbox Làm bù (IsCompen: "6,1") cho BN/BP, thêm tùy chọn Ca trống ("") |
 | 2.13 | 28/05/2026 | Đổi loại đơn thứ 2 khi Bù Phép từ Làm bù công nhật (BN) sang Làm bù phép (BP) |
 | 2.12 | 21/05/2026 | Sửa lỗi tính giờ OT (trừ 45p nghỉ trưa), luôn hiển thị giờ vào/ra thực tế trong bảng Batch |
 | 2.11 | 15/05/2026 | Flexible Shift Swap (T7), Mũi tên 2 chiều SVG, About Modal, Unicode Fix |
 | 2.10 | 11/05/2026 | Fix lỗi tính toán giờ OT, cải thiện độ ổn định khi khởi tạo |
 | 2.9 | 08/05/2026 | Tự động phát hiện liên kết Bù Phép từ mô tả, Hiển thị Mã đơn từ (Application ID) |
 | 2.8 | 08/05/2026 | Bù Phép Drag-Drop, SVG Overlay, Smart Suggestion |
 
 ---
 
 ## 📜 License
 
 Copyright © 2026. All rights reserved.
 
 ---
 
 **Made with ❤️ for HRM Efficiency**  
 Last updated: 29/05/2026 (v2.15)
