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
  --data-urlencode "Password=ThanhSyo@13122" ^
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
  --data-urlencode "Password=ThanhSyo@13122" ^
  --data-urlencode "LanguageID=vi-VN" ^
  --data-urlencode "g-recaptcha-response=" ^
  --data-urlencode "SessionLocalID=2hp0zfpbve1fhcz2j3slandl"
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

# Lấy danh sách đơn xin phép

```bash
curl -b cookies.txt -X POST "http://192.168.10.213:14444/GridCommon/Read?TableName=HRMT2260" ^
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  -H "Origin: http://192.168.10.213:14444" ^
  -H "Referer: http://192.168.10.213:14444/Contentmaster/Index/HRM/HRMF2260" ^
  --data "sort=&page=1&pageSize=25&group=&filter=&FromToDate_Content_DataType=9&FromToDate_Type_Fields=5&rdoFilter=1&FromDatePeriodControl=01%2F02%2F2026&ToDatePeriodControl=28%2F02%2F2026&IsPeriod=0&FromDatePeriodControl_Type_Fields=5&ToDatePeriodControl_Type_Fields=5&FromDatePeriodControl_Content_DataType=13&ToDatePeriodControl_Content_DataType=13&CheckListPeriodControl_Type_Fields=4&CheckListPeriodControl_Content_DataType=13&APK_Content_DataType=1&APK_Type_Fields=1&APK_HRMF2360=&TranMonth_Content_DataType=5&TranMonth_Type_Fields=1&TranMonth_HRMF2360=&TranYear_Content_DataType=5&TranYear_Type_Fields=1&TranYear_HRMF2360=&DepartmentName_Content_DataType=7&DepartmentName_Type_Fields=1&DepartmentName_HRMF2360=&SectionName_Content_DataType=7&SectionName_Type_Fields=1&SectionName_HRMF2360=&SubsectionName_Content_DataType=7&SubsectionName_Type_Fields=1&SubsectionName_HRMF2360=&ProcessName_Content_DataType=7&ProcessName_Type_Fields=1&ProcessName_HRMF2360=&CreateUserName_Content_DataType=7&CreateUserName_Type_Fields=1&CreateUserName_HRMF2360=&StatusName_Content_DataType=7&StatusName_Type_Fields=1&StatusName_HRMF2360=&DivisionID_Content_DataType=7&DivisionID_Type_Fields=4&DivisionID_HRMF2360=&ID_Content_DataType=12&ID_Type_Fields=1&ID_HRMF2360=&Description_Content_DataType=12&Description_Type_Fields=1&Description_HRMF2360=&DepartmentID_Content_DataType=7&DepartmentID_Type_Fields=3&CheckInList%5B0%5D=DepartmentID_HRMF2360&CheckInList%5B1%5D=SectionID_HRMF2360&CheckInList%5B2%5D=SubsectionID_HRMF2360&CheckInList%5B3%5D=ProcessID_HRMF2360&CheckInList%5B4%5D=CreateUserID_HRMF2360&CheckInList%5B5%5D=Status_HRMF2360&DepartmentID_HRMF2360_input=&DepartmentID_HRMF2360=&SectionID_Content_DataType=7&SectionID_Type_Fields=3&SectionID_HRMF2360_input=&SectionID_HRMF2360=&SubsectionID_Content_DataType=7&SubsectionID_Type_Fields=3&SubsectionID_HRMF2360_input=&SubsectionID_HRMF2360=&ProcessID_Content_DataType=7&ProcessID_Type_Fields=3&ProcessID_HRMF2360_input=&ProcessID_HRMF2360=&CreateUserID_Content_DataType=7&CreateUserID_Type_Fields=3&CreateUserID_HRMF2360_input=&CreateUserID_HRMF2360=&CreateDate_Content_DataType=9&CreateDate_Type_Fields=5&CreateDate_HRMF2360=&LastModifyUserID_Content_DataType=7&LastModifyUserID_Type_Fields=1&LastModifyUserID_HRMF2360=&LastModifyDate_Content_DataType=13&LastModifyDate_Type_Fields=1&LastModifyDate_HRMF2360=&Status_Content_DataType=7&Status_Type_Fields=3&Status_HRMF2360_input=&Status_HRMF2360=&args%5B0%5D.Key=ftype%5B%5D&args%5B0%5D.Value%5B0%5D=&args%5B0%5D.Value%5B1%5D=5&args%5B0%5D.Value%5B2%5D=5&args%5B0%5D.Value%5B3%5D=&args%5B0%5D.Value%5B4%5D=1&args%5B0%5D.Value%5B5%5D=1&args%5B0%5D.Value%5B6%5D=1&args%5B0%5D.Value%5B7%5D=1&args%5B0%5D.Value%5B8%5D=1&args%5B0%5D.Value%5B9%5D=1&args%5B0%5D.Value%5B10%5D=1&args%5B0%5D.Value%5B11%5D=1&args%5B0%5D.Value%5B12%5D=1&args%5B0%5D.Value%5B13%5D=4&args%5B0%5D.Value%5B14%5D=1&args%5B0%5D.Value%5B15%5D=1&args%5B0%5D.Value%5B16%5D=3&args%5B0%5D.Value%5B17%5D=3&args%5B0%5D.Value%5B18%5D=3&args%5B0%5D.Value%5B19%5D=3&args%5B0%5D.Value%5B20%5D=3&args%5B0%5D.Value%5B21%5D=5&args%5B0%5D.Value%5B22%5D=1&args%5B0%5D.Value%5B23%5D=1&args%5B0%5D.Value%5B24%5D=3&args%5B1%5D.Key=dttype%5B%5D&args%5B1%5D.Value%5B0%5D=&args%5B1%5D.Value%5B1%5D=13&args%5B1%5D.Value%5B2%5D=13&args%5B1%5D.Value%5B3%5D=&args%5B1%5D.Value%5B4%5D=1&args%5B1%5D.Value%5B5%5D=5&args%5B1%5D.Value%5B6%5D=5&args%5B1%5D.Value%5B7%5D=7&args%5B1%5D.Value%5B8%5D=7&args%5B1%5D.Value%5B9%5D=7&args%5B1%5D.Value%5B10%5D=7&args%5B1%5D.Value%5B11%5D=7&args%5B1%5D.Value%5B12%5D=7&args%5B1%5D.Value%5B13%5D=7&args%5B1%5D.Value%5B14%5D=12&args%5B1%5D.Value%5B15%5D=12&args%5B1%5D.Value%5B16%5D=7&args%5B1%5D.Value%5B17%5D=7&args%5B1%5D.Value%5B18%5D=7&args%5B1%5D.Value%5B19%5D=7&args%5B1%5D.Value%5B20%5D=7&args%5B1%5D.Value%5B21%5D=9&args%5B1%5D.Value%5B22%5D=7&args%5B1%5D.Value%5B23%5D=13&args%5B1%5D.Value%5B24%5D=7&args%5B2%5D.Key=key%5B%5D&args%5B2%5D.Value%5B0%5D=rdoFilter&args%5B2%5D.Value%5B1%5D=FromDatePeriodControl&args%5B2%5D.Value%5B2%5D=ToDatePeriodControl&args%5B2%5D.Value%5B3%5D=IsPeriod&args%5B2%5D.Value%5B4%5D=APK&args%5B2%5D.Value%5B5%5D=TranMonth&args%5B2%5D.Value%5B6%5D=TranYear&args%5B2%5D.Value%5B7%5D=DepartmentName&args%5B2%5D.Value%5B8%5D=SectionName&args%5B2%5D.Value%5B9%5D=SubsectionName&args%5B2%5D.Value%5B10%5D=ProcessName&args%5B2%5D.Value%5B11%5D=CreateUserName&args%5B2%5D.Value%5B12%5D=StatusName&args%5B2%5D.Value%5B13%5D=DivisionID&args%5B2%5D.Value%5B14%5D=ID&args%5B2%5D.Value%5B15%5D=Description&args%5B2%5D.Value%5B16%5D=DepartmentID&args%5B2%5D.Value%5B17%5D=SectionID&args%5B2%5D.Value%5B18%5D=SubsectionID&args%5B2%5D.Value%5B19%5D=ProcessID&args%5B2%5D.Value%5B20%5D=CreateUserID&args%5B2%5D.Value%5B21%5D=CreateDate&args%5B2%5D.Value%5B22%5D=LastModifyUserID&args%5B2%5D.Value%5B23%5D=LastModifyDate&args%5B2%5D.Value%5B24%5D=Status&args%5B2%5D.Value%5B25%5D=OOT9000&args%5B3%5D.Key=value%5B%5D&args%5B3%5D.Value%5B0%5D=1&args%5B3%5D.Value%5B1%5D=01%2F02%2F2026&args%5B3%5D.Value%5B2%5D=28%2F02%2F2026&args%5B3%5D.Value%5B3%5D=0&args%5B3%5D.Value%5B4%5D=&args%5B3%5D.Value%5B5%5D=&args%5B3%5D.Value%5B6%5D=&args%5B3%5D.Value%5B7%5D=&args%5B3%5D.Value%5B8%5D=&args%5B3%5D.Value%5B9%5D=&args%5B3%5D.Value%5B10%5D=&args%5B3%5D.Value%5B11%5D=&args%5B3%5D.Value%5B12%5D=&args%5B3%5D.Value%5B13%5D=&args%5B3%5D.Value%5B14%5D=&args%5B3%5D.Value%5B15%5D=&args%5B3%5D.Value%5B16%5D=&args%5B3%5D.Value%5B17%5D=&args%5B3%5D.Value%5B18%5D=&args%5B3%5D.Value%5B19%5D=&args%5B3%5D.Value%5B20%5D=&args%5B3%5D.Value%5B21%5D=&args%5B3%5D.Value%5B22%5D=&args%5B3%5D.Value%5B23%5D=&args%5B3%5D.Value%5B24%5D=&args%5B4%5D.Key=systemInfo%5B%5D&args%5B4%5D.Value%5B0%5D=HRMF2360&args%5B4%5D.Value%5B1%5D=HRM&args%5B4%5D.Value%5B2%5D=OOT9000&strWhere="
```

---

# Bước 6 — Logout

```cmd
curl -s -o NUL -b cookies.txt -c cookies.txt ^
  "http://192.168.10.213:14444/?logout=1&returnUrl=%2FContentmaster%2FIndex%2FHRM%2FHRMF2260&returnModule=HRM"
```

---

# Bước 7 — Verify Logout

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
