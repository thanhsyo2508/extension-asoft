# Hướng dẫn Login → Logout ASP.NET bằng curl (Windows CMD)

## Mục tiêu

Tài liệu này hướng dẫn mô phỏng **login → logout** của hệ thống ASP.NET thông qua `curl` trên **Windows CMD** dựa trên dữ liệu bắt được từ Wireshark.

---

# Tổng quan flow đăng nhập

Hệ thống này gồm nhiều bước:

1. GET `/` → lấy `ASP.NET_SessionId`
2. POST `/Login/GetDivisionByUser`
3. POST `/Login/DoLogin`
4. POST `/Login/DoCheckLoginExist`
5. POST `/Login/DoLoginDivision`
6. GET `/?logout=1` → Logout

👉 Phải thực hiện đúng thứ tự.

---

# Chuẩn bị

Xóa file cookie cũ nếu có:

```cmd
del cookies.txt
```

---

# Bước 0 — Lấy SessionId

```cmd
curl -c cookies.txt -s -o NUL "http://192.168.10.213:14444/"
```

---

# Bước 1 — GetDivisionByUser

```cmd
curl -s -b cookies.txt -c cookies.txt ^
  -X POST "http://192.168.10.213:14444/Login/GetDivisionByUser" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "userID=000174&divisionID=MA"
```

---

# Bước 2 — DoLogin

```cmd
curl -s -b cookies.txt -c cookies.txt ^
  -X POST "http://192.168.10.213:14444/Login/DoLogin" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  --data-urlencode "logOutBack=FALSE" ^
  --data-urlencode "infoDevide=Chrome - Windows 10" ^
  --data-urlencode "UserID=000174" ^
  --data-urlencode "Password=YOUR_PASSWORD" ^
  --data-urlencode "LanguageID=vi-VN" ^
  --data-urlencode "g-recaptcha-response=" ^
  --data-urlencode "DeviceToken=" ^
  --data-urlencode "DivisionID=MA" ^
  --data-urlencode "DivisionName=MEIKO AUTOMATION JOINT STOCK COMPANY" ^
  --data-urlencode "IsLoginQR=false"
```

---

# Bước 3 — Lấy SessionLocalID từ cookies.txt (Windows CMD)

```cmd
for /f "tokens=7" %i in ('findstr ASP.NET_SessionId cookies.txt') do set SESSION=%i
```

Kiểm tra:

```cmd
echo %SESSION%
```

---

# Bước 4 — DoCheckLoginExist

```cmd
curl -s -b cookies.txt -c cookies.txt ^
  -X POST "http://192.168.10.213:14444/Login/DoCheckLoginExist" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  --data-urlencode "logOutBack=False" ^
  --data-urlencode "infoDevide=Chrome - Windows 10" ^
  --data-urlencode "UserID=000174" ^
  --data-urlencode "Password=YOUR_PASSWORD" ^
  --data-urlencode "LanguageID=vi-VN" ^
  --data-urlencode "g-recaptcha-response=" ^
  --data-urlencode "SessionLocalID=%SESSION%"
```

---

# Bước 5 — DoLoginDivision

```cmd
curl -s -b cookies.txt -c cookies.txt ^
  -X POST "http://192.168.10.213:14444/Login/DoLoginDivision" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "LogonDivisionID=MA&LogonDivisionName=MEIKO AUTOMATION JOINT STOCK COMPANY&UserID=000174&PortID=14444"
```

👉 Sau bước này login thành công.

---

# Bước 6 — Logout (2 bước giống browser)

## 6.1 Gọi POST /ContentMaster/Login

```cmd
curl -s -o NUL -b cookies.txt -c cookies.txt ^
  -X POST "http://192.168.10.213:14444/ContentMaster/Login" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  -H "Content-Type: application/x-www-form-urlencoded"
```

## 6.2 Gọi GET /?logout=1

```cmd
curl -s -o NUL -b cookies.txt -c cookies.txt ^
  "http://192.168.10.213:14444/?logout=1&returnUrl=%2FS%2FSF0007&returnModule=S"
```

---

# Bước 7 — Verify Logout — Verify Logout

```cmd
curl -I -b cookies.txt ^
  "http://192.168.10.213:14444/Contentmaster/Index/HRM/HRMF2260"
```

Nếu trả về:

```
HTTP/1.1 302 Found
Location: /Login
```

=> Logout thành công.

---

# Lưu ý quan trọng

* Dùng `%SESSION%` trong CMD (không dùng `$SESSION`).
* Trong file `.bat` phải dùng `%%i` thay vì `%i`.
* Luôn giữ nguyên file `cookies.txt` xuyên suốt quá trình.

---

# Flow chuẩn

```
Get Session → Multi-step Login → Logout → Verify
```

---

# Reverse Engineering Query Grid ASP.NET (Args Pattern)

## Tổng quan

Các API dạng:

```
/GridCommon/Read?TableName=XXXX
```

sử dụng **Generic Dynamic SQL Builder** để query dữ liệu cho toàn bộ grid trong hệ thống ERP.

---

# Cấu trúc chuẩn của request

Request luôn gồm 5 nhóm args:

| Args    | Ý nghĩa           |
| ------- | ----------------- |
| args[0] | operator (ftype)  |
| args[1] | datatype (dttype) |
| args[2] | column name (key) |
| args[3] | value (value)     |
| args[4] | systemInfo        |

---

# args[0] — Operator (ftype)

| Code | SQL tương đương |
| ---- | --------------- |
| 1    | =               |
| 2    | <>              |
| 3    | IN              |
| 4    | LIKE            |
| 5    | BETWEEN         |

Ví dụ:

```
CreateDate_Type_Fields = 5
```

→ SQL:

```
CreateDate BETWEEN x AND y
```

---

# args[1] — Data type (dttype)

| Code | Kiểu dữ liệu |
| ---- | ------------ |
| 1    | GUID         |
| 4    | INT          |
| 5    | DECIMAL      |
| 7    | NVARCHAR     |
| 9    | DATE         |
| 13   | DATETIME     |

Ví dụ:

```
CreateDate_Content_DataType = 9
```

→ field dạng DATE.

---

# args[2] — Column mapping

Danh sách cột DB được filter.

Backend sẽ loop:

```csharp
for(i=0;i<args.Length;i++)
{
   field = args[2][i];
   type  = args[1][i];
   op    = args[0][i];
   value = args[3][i];
}
```

→ build WHERE động.

---

# args[3] — Filter value

Giá trị người dùng nhập trên UI.

Ví dụ:

```
args[3].Value[1] = 01/02/2026
args[3].Value[2] = 28/02/2026
```

→ WHERE date range.

---

# args[4] — Context hệ thống

| Index | Ý nghĩa     |
| ----- | ----------- |
| 0     | ScreenID    |
| 1     | Module      |
| 2     | MasterTable |

Ví dụ:

```
HRMF2260 = Screen
HRM      = Module
HRMT2260 = Table
```

Dùng để:

* kiểm tra quyền
* load cấu hình
* xác định stored procedure

---

# SQL thực tế được build

Ví dụ query chấm công:

```
SELECT *
FROM HRMT2260
WHERE AbsentDate BETWEEN '2026-02-01' AND '2026-02-28'
AND DivisionID LIKE '%MA%'
AND DepartmentID IN (...)
ORDER BY AbsentDate DESC
OFFSET 0 ROWS FETCH NEXT 25 ROWS
```

---

# Minimal Query có thể dùng

Chỉ cần giữ các phần bắt buộc:

```
page
pageSize
args[0]
args[1]
args[2]
args[3]
args[4]
```

👉 Có thể giảm request từ ~500 param xuống còn ~15 param.

---

# Kết luận

Đây là pattern phổ biến trong:

* Kendo UI Grid
* Telerik ASP.NET
* DevExpress
* Các hệ ERP ASP.NET

Flow chung:

```
UI Filter → args[] → Dynamic SQL → Database
```
