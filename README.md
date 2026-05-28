# 📅 Asoft Attendance Dashboard v2.13

[![Version](https://img.shields.io/badge/version-2.13.0-blue.svg)](https://img.shields.io/badge/version-2.13.0-blue.svg)
[![Stage](https://img.shields.io/badge/stage-production-emerald.svg)](https://img.shields.io/badge/stage-production-emerald.svg)
[![Platform](https://img.shields.io/badge/platform-Edge%20|%20Chrome-gray.svg)](https://img.shields.io/badge/platform-Edge%20|%20Chrome-gray.svg)

![Giao diện chính](video/giaoDienChinh.png)

**Asoft Attendance Extension** là một giải pháp quản lý công và đơn từ cao cấp, được thiết kế để mang lại trải nghiệm người dùng hiện đại và thông minh ngay trên nền tảng HRM hiện có. Với ngôn ngữ thiết kế **Glass Morphism** và trí tuệ nhân tạo tích hợp, việc quản lý thời gian chưa bao giờ dễ dàng và đẹp mắt đến thế.

---

# Tải về extension

---
[Tải về asoft-attendance-v2.13.zip](asoft-attendance-v2.13.zip)

---

## 📽️ Video Demo Trải Nghiệm
Khám phá toàn bộ tính năng và sự mượt mà của giao diện thông qua video dưới đây:

![Demo Video](video/demo.gif)

*(Nếu bạn không xem được video, hãy [nhấn vào đây](video/demo.mp4) để tải hoặc xem trực tiếp)*

---

## 🆕 Changelog

### v2.13 — 2026-05-28
> **Bù Phép Application Type Adjustment (BN to BP) & Version Bump**

- 🔄 **Cập nhật Bù Phép**: Thay đổi loại đơn thứ 2 khi thực hiện Bù Phép (kéo ngày OT vào ngày nghỉ) từ **Làm bù công nhật (BN)** thành **Làm bù phép (BP)** để phù hợp với chính sách của doanh nghiệp.
- 🎨 **Cập nhật UI & Diễn giải**: Chuyển toàn bộ hiển thị "bù công nhật" và mã "BN" trong modal Bù Phép thành "bù phép" và mã "BP", đồng thời tối ưu hóa lý do mặc định cho đơn.

### v2.12 — 2026-05-21
> **Overtime (OT) Calculation Lunch Hour Fix & Batch Mode Enhancements**

- 🛠️ **Sửa lỗi tính giờ làm thêm (OT)**: Tự động phát hiện và trừ đi 45 phút nghỉ trưa (12:00 - 12:45) cho các đơn làm thêm giờ (DXLTG) bao phủ khoảng nghỉ trưa (như từ 08:00 đến 16:45), giúp kết quả trả về chính xác 8.0h thay vì 8.75h.
- 🕒 **Luôn hiển thị giờ vào/ra thực tế**: Trong bảng chọn ngày hàng loạt (Batch mode), luôn hiển thị mốc thời gian quẹt thẻ vào/ra thực tế (nếu có dữ liệu) bên cạnh ngày tháng, giúp người dùng dễ dàng theo dõi và điền thông tin chính xác.

### v2.11 — 2026-05-15
> **Flexible Shift Swap & Bidirectional Visualization**

- ✨ **Hoán đổi ca T7 linh động**: Hỗ trợ kéo thả 2 chiều giữa T7 cố định và T7 đã đi làm.
- 🏹 **Mũi tên 2 chiều Premium**: Cải tiến SVG hiển thị 2 mũi tên đối nghịch rõ nét cho các ngày hoán đổi.
- 🧠 **Smart Drag Context**: Tự động ưu tiên Đổi ca hoặc Bù phép thông minh dựa trên ô đích.
- ℹ️ **About Modal**: Thêm bảng thông tin phần mềm, lịch sử cập nhật và liên kết GitHub trực tiếp.
- 🛠️ **Unicode Core Fix**: Khắc phục triệt để lỗi SyntaxError liên quan đến Unicode escape sequence.

### v2.10 — 2026-05-11
> **Critical OT Fix & Initialization Robustness**

- 🛠️ **Sửa lỗi tính giờ OT**: Khắc phục lỗi nghiêm trọng khiến thời gian làm thêm (Overtime) bị tính bằng 0 do sai lệch ID phần tử trong form đơn lẻ.
- 🧠 **Tăng cường độ ổn định (Robustness)**:
    - Xử lý lỗi crash khi nhận dữ liệu ca làm việc (ShiftNow) dưới dạng Object từ API thay vì String.
    - Cải thiện hàm `normalizeShiftId` để tương thích tốt hơn với dữ liệu thực tế từ ERP.
- 📅 **Khởi tạo form an toàn**: Tối ưu hóa việc tạo chuỗi ngày tháng (`dateStr`, `sqlDate`) để tránh lỗi khi các tham số đầu vào bị null/undefined.
- 📝 **Debug nâng cao**: Bổ sung thông báo lỗi chi tiết trên giao diện khi việc nạp dữ liệu khởi tạo thất bại, giúp người dùng và kỹ thuật viên dễ dàng chẩn đoán sự cố.

### v2.9 — 2026-05-09
> **Auto-fill Optimization & Stability Fix**

- 🚀 **Cải tiến Modal Tạo đơn**: 
    - Tự động điền **Diễn giải** và **Lý do chi tiết** dựa trên loại đơn được chọn (DXNP, DXLTG, DXBSQT, DXRN, DXDC) khi thay đổi trong dropdown.
    - Bảo toàn các gợi ý thông minh (Smart Suggestions) ở lần nạp đầu tiên để tránh ghi đè dữ liệu phân tích.
- 🛠️ **Fix Syntax Error**: 
    - Khắc phục lỗi `Identifier 'updateFields' has already been declared` bằng cách đổi tên hàm thành `refreshRequestFields`.
    - Tối ưu hóa luồng nạp dữ liệu khởi tạo (`loadInitialData`) giúp Modal hoạt động mượt mà hơn.
- 🎨 **UI/UX Polish**: Cân chỉnh lại vị trí các nút bấm và thông báo trạng thái trong Batch Mode.

### v2.8 — 2026-05-08
> **Refactor Batch Request & Logic Optimization**

- ⚡ **Tối ưu Tạo đơn hàng loạt (Batch Mode)**:
    - Cấu trúc lại logic lấy dữ liệu theo từng dòng (`batch-row`), giúp mã nguồn gọn gàng và dễ bảo trì hơn.
    - Hỗ trợ fallback thông minh giữa chế độ đơn lẻ và chế độ hàng loạt cho mọi loại đơn (DXNP, DXLTG, DXRN, DXBSQT, DXDC).
- 🔄 **Chuẩn hóa Shift ID**: Tự động chuẩn hóa mã ca làm việc (normalizeShiftId) khi thực hiện bù phép, tránh lỗi sai định dạng từ server.
- 🛠️ **Cải tiến DXRN trong Batch Mode**: Bổ sung đầy đủ các trường thông tin (DailyHours, TotalTime) cho đơn xin ra ngoài khi tạo hàng loạt.
- 🩹 **Bug Fixes**: Sửa lỗi lấy giá trị giờ quẹt thẻ (Swipe Time) không chính xác trong một số trường hợp tạo đơn bổ sung quẹt thẻ hàng loạt.



| Multi-day Select | Create a Request |
| :---: | :---: |
| ![Giao diện chính](video/Multi-day-select.png) | !![Giao diện chính](video/create-a-request-2.png) |

### v2.7 — 2026-05-08
> **Batch Attendance Request — Tạo đơn hàng loạt & Tối ưu UI**

- 📅 **Batch Mode (Tạo đơn hàng loạt)**:
    - Cho phép chọn nhiều ngày trên lịch để tạo đơn cùng lúc.
    - Giao diện tương tác trực tiếp trên thẻ ngày (không dùng checkbox).
    - Hỗ trợ **Tweak từng ngày**: Chỉnh sửa riêng biệt số giờ và lý do cho từng ngày trong lô đơn.
    - Xử lý API tuần tự cho từng ngày, đảm bảo tính nhất quán dữ liệu.
- 🔄 **Auto-fill thông minh**: Tự động điền Diễn giải và Lý do chi tiết dựa trên loại đơn được chọn khi chuyển đổi trong Modal.
- 🛠️ **Refactor Code**: 
    - Khắc phục lỗi `SyntaxError` do trùng lặp định danh hàm `updateFields`.
    - Tối ưu hóa việc nạp dữ liệu khởi tạo (Approvers, Key, Shift) cho Modal.
- 🎨 **UI/UX Polish**: Cải thiện hiển thị trạng thái (Status) khi gửi đơn hàng loạt và điều chỉnh layout nút bấm.

### v2.6 — 2026-05-08
> **Tối ưu Đơn Ra Ngoài & Cải tiến Thống kê**

- 📝 **Refactor Đơn Xin Ra Ngoài (DXRN)**:
    - Cập nhật giao diện mới hỗ trợ các trường: **Đi thẳng**, **Về thẳng**, **Yêu cầu xe** (kèm ghi chú), **Không ăn trưa**, **Tính OT**.
    - Đồng bộ Payload với ERP hệ thống (sử dụng tiền tố `DOU/` và các trường `_DT` chính xác).
- 🧠 **Dynamic Leave Balance**: Tự động gọi API `GetRemainingLeave` để lấy số dư phép thực tế điền vào đơn, tránh lỗi xác thực server.
- 📊 **Nâng cấp Stats Panel**:
    - Thay thế "Công nhật" bằng **Giờ công tiêu chuẩn** (`Số ngày công * 8`).
    - Bổ sung chỉ số **Công thiếu** (`Tiêu chuẩn - Tính lương`) giúp nhân viên chủ động quản lý thời gian làm bù.
- 🐞 **Bug Fixes**: Sửa lỗi không hiển thị đơn `DXRN` trên lịch do sai lệch định dạng ngày tháng trong detail view.

### v2.5 — 2026-05-07
> **Tự động hóa Release & Quản lý Mã nguồn**

- 🚀 **Release Tool (PowerShell)**: Triển khai công cụ `release.ps1` giúp tự động hóa quy trình đóng gói và phát hành.
- 📦 **GitHub Release Integration**: Tự động tạo bản Release trên GitHub và upload file zip đính kèm thông qua API.
- 🔐 **Security**: Tích hợp quản lý thông tin xác thực qua file `.env` và bảo mật với `.gitignore`.

### v2.4 — 2026-05-07
> **Mở rộng Dashboard & Tối ưu Trải nghiệm**

- 📊 **Bổ sung 3 thẻ thống kê mới**: Tích hợp dữ liệu từ báo cáo `HRMT2320` để hiển thị **Công thực tế**, **Công tính lương** và **Công nhật**.
- 🤏 **Tính năng Minimize (Thu nhỏ)**: Cho phép thu gọn dashboard thành một thanh biểu tượng (pill bar) nhỏ gọn để tiết kiệm diện tích màn hình.
- ⚡ **Tối ưu hiển thị Stats Panel**: 
  - Thiết kế lại các thẻ thống kê nhỏ gọn hơn, phù hợp với nhiều độ phân giải.
  - Hỗ trợ cuộn dọc (`scroll`) tự động khi danh sách chỉ số vượt quá chiều cao màn hình.
- 🔧 **Cải thiện UI/UX**: Tinh chỉnh khoảng cách, icon và hiệu ứng chuyển cảnh mượt mà hơn.

### v2.3 — 2026-04-18
> **Tính năng Bù Phép Drag-Drop hoàn chỉnh**

- ✨ **Drag-Drop Bù Phép (Comp Swap)**: Kéo một ngày OT (làm cuối tuần/lễ) thả vào ngày làm việc để tự động mở form và gửi đồng thời 2 đơn liên kết:
  - **Đơn 1 — NP** (Nghỉ phép năm): cho ngày được nghỉ bù.
  - **Đơn 2 — BP** (Làm bù phép): cho ngày đi làm thêm.
- 🔗 **Mã liên kết `[pairId]` trong lý do đơn**: `pairId` được tạo ngay khi mở modal và nhúng vào trường *Lý do* của cả 2 đơn — đảm bảo truy ngược được liên kết trực tiếp từ server mà không phụ thuộc hoàn toàn vào local storage.
- 🗺️ **Hiển thị mũi tên liên kết SVG** trên lịch: sau khi gửi đơn, 2 ngày được nối với nhau bằng đường cong có mũi tên (dashed arc) màu tím, giúp nhận biết cặp ngày nghỉ/làm bù ngay trên giao diện.
- 🗑️ **Tự động xóa liên kết khi xóa đơn**: khi xóa đơn NP hoặc BP thành công, hệ thống tự động tìm và xóa entry tương ứng trong `chrome.storage.sync` — mũi tên và badge trên lịch biến mất ngay sau khi reload.

### v2.2 — trước đó
- Các tính năng cũ giữ nguyên (xem chi tiết bên dưới).

---

## 🔥 Các Tính Năng Đột Phá

### 1. 🔄 Bù Phép Drag-Drop *(Mới v2.3)*
Không cần mở nhiều form thủ công. Chỉ cần **kéo ngày OT** (cuối tuần/lễ đã làm) và **thả vào ngày muốn nghỉ bù**:
- Hệ thống mở modal xác nhận với 2 card: *Đơn NP* cho ngày nghỉ và *Đơn BP* cho ngày làm bù.
- Tự động điền ca làm việc, số giờ, lý do kèm **mã liên kết duy nhất** `[pairId]`.
- Gửi tuần tự 2 đơn lên server, xử lý retry khi trùng ApplicationID.
- Sau khi gửi thành công, **mũi tên SVG cong** xuất hiện trên lịch nối 2 ngày lại.
- Khi **xóa một trong 2 đơn**, liên kết lập tức bị phá vỡ — badge và mũi tên biến mất.

### 2. 🧠 Smart Suggestion Logic (Gợi ý Thông minh)
Không còn phải tự mình tính toán giờ giấc hay chọn loại đơn phức tạp. Hệ thống tự động phân tích:
- **Đi trễ/Về sớm**: Tự động gợi ý bổ sung vân tay hoặc đổi ca (DXDC) phù hợp nhất với giờ quẹt thực tế.
- **Quên quẹt thẻ**: Tự động nhận diện buổi (Sáng/Chiều) để gợi ý bổ sung giờ Vào/Ra.
- **Làm thêm giờ (OT)**: Tự động tính toán số giờ OT dựa trên checkout thực tế và làm tròn xuống block 15 phút an toàn.
- **Nghỉ phép**: Tự động nhận diện ngày vắng mặt để gợi ý đơn xin nghỉ.

### 3. 🎨 Hệ Thống Theme Đa Dạng (6 Styles)
Tùy biến không gian làm việc theo sở thích với 6 bộ giao diện được tối ưu hóa độ tương phản và thẩm mỹ:

| 🌑 Dark Mode | ☀️ Light Mode | 🌸 Spring Theme |
| :---: | :---: | :---: |
| ![Dark](video/dark.png) | ![Light](video/light.png) | ![Spring](video/theme-spring.png) |

| 🌻 Summer Theme | 🍂 Autumn Theme | ❄️ Winter Theme |
| :---: | :---: | :---: |
| ![Summer](video/theme-summer.png) | ![Autumn](video/theme-autumn.png) | ![Winter](video/theme-winter.png) |

### 4. 📊 Tương Tác Dữ Liệu Trực Quan
- **Stats Panel Mở Rộng**: Theo dõi mọi chỉ số quan trọng tại một nơi: Ngày công, Đi trễ, Về sớm, OT 150%/200%, Công thực tế, Công tính lương và Công nhật.
- **Highlight theo thẻ**: Nhấn vào các chỉ số "Nghỉ", "Trễ", "Sớm", "OT"... ở Sidebar để lịch tự động làm nổi bật các ngày vi phạm tương ứng.
- **Bộ chọn Tháng/Năm Premium**: Điều hướng thời gian nhanh chóng với giao diện popup hiện đại thay vì dropdown mặc định nhàm chán.
- **Xuất dữ liệu**: Hỗ trợ xuất báo cáo ngay lập tức cho tháng hiện tại.

---

## 🛠️ Chi Tiết Chức Năng

| Chức năng | Minh họa | Đặc điểm |
| :--- | :---: | :--- |
| **Chi tiết ngày** | ![Detail](video/day-detail.png) | Hiển thị đầy đủ giờ quẹt thẻ, tên ca, trạng thái đơn từ trong ngày. |
| **Tạo đơn mới** | ![Create](video/create-a-request.png) | Giao diện form điền sẵn (Auto-fill) thông minh, hỗ trợ tìm kiếm người duyệt nhanh. |
| **Quản lý đơn** | ![Delete](video/delete-a-request.png) | Xem trạng thái duyệt và cho phép xóa đơn trực tiếp ngay tại popup chi tiết. |
| **Chọn tháng** | ![Picker](video/pickerMonth.png) | Popup chọn tháng trực quan, hỗ trợ quay lại năm nhanh và chuyển về "Hôm nay". |
| **Bù phép Drag-Drop** | ![Picker](video/create-DBP.png) | Kéo ngày OT thả vào ngày nghỉ → tạo 2 đơn NP+BP liên kết tự động. *(Mới v2.3)* |

---

## 💻 Công Nghệ & Kiến Trúc
Dự án được xây dựng với tiêu chí hiệu năng cao và không phụ thuộc thư viện bên ngoài:
- **Core**: Vanilla JavaScript (ES6+) tối ưu tốc độ xử lý DOM.
- **Styling**: CSS Variables kết hợp Backdrop Filter cho hiệu ứng kính mờ (Glass Morphism).
- **Storage**: `chrome.storage.sync` & `localStorage` để đồng bộ cấu hình người dùng (vị trí, kích thước, theme, zoom) và lưu liên kết bù phép (`bpLinks`).
- **Communication**: Interceptor API để giao tiếp mượt mà với backend ASP.NET HRM.
- **SVG Overlay**: Vẽ mũi tên cong động trên lịch để trực quan hóa liên kết NP↔BP.

---

## 🚀 Hướng Dẫn Cài Đặt (Developer Mode)

Cài đặt extension vô cùng đơn giản trong 4 bước:

1. **Bước 1**: Truy cập quản lý Extension trên Edge/Chrome thông qua đường dẫn `edge://extensions`.
2. **Bước 2**: Bật **Developer mode** (Chế độ nhà phát triển) ở góc màn hình.
3. **Bước 3**: Nhấn nút **Load unpacked** (Tải bản tiện ích đã giải nén).
4. **Bước 4**: Chọn thư mục `` trong máy tính của bạn.

![Cài đặt](video/giaoDienChinh.png)
*(Lưu ý: Luôn login vào hệ thống HRM trước khi sử dụng extension)*

---

**Made with ❤️ by Syo & Antigravity for Asoft HRM Efficiency**