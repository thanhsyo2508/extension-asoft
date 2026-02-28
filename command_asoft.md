# Đăng xuất phiên đăng nhập tạo file coockies.txt lưu phiên đăng nhập
```bash
curl -b cookies.txt -c cookies.txt "http://192.168.10.213:14444/?logout=1&returnUrl=%2FS%2FSF0007&returnModule=S"

curl -s -o /dev/null -b cookies.txt -c cookies.txt "http://192.168.10.213:14444/?logout=1&returnUrl=%2FS%2FSF0007&returnModule=S"
```

# login

```bash
curl -s -o /dev/null -b cookies.txt -c cookies.txt "http://192.168.10.213:14444"
```

```bash
curl -c cookies.txt -X POST "http://192.168.10.213:14444/Login/GetDivisionByUser" ^
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" ^
  --data "userID=000174&divisionID=MA"
```

```json
{
    "DivisionID": "MA",
    "DivisionName": "MEIKO AUTOMATION JOINT STOCK COMPANY",
    "LogonDivisionID": null,
    "LogonDivisionName": null,
    "GroupID": null,
    "UserID": null,
    "Password": null,
    "Captcha": null,
    "ReturnUrl": null,
    "Logout": null,
    "Attempt": null,
    "CapcharRequired": false,
    "EncrypedSolution": null,
    "DateWork": null,
    "DeviceToken": null,
    "Note": null,
    "LanguageID": null,
    "SessionLocalID": null,
    "IsLoginQR": null,
    "InfoDevide": null
}
```

# Đăng nhập dùng user password và sesionId
```bash
curl -b cookies.txt -c cookies.txt -X POST "http://192.168.10.213:14444/Login/DoLogin" ^
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" ^
  --data "logOutBack=FALSE" ^
  --data "infoDevide=Chrome - Windows 10" ^
  --data "UserID=000174" ^
  --data "Password=Syo@13122" ^
  --data "LanguageID=vi-VN" ^
  --data "g-recaptcha-response=" ^
  --data "DeviceToken=" ^
  --data "DivisionID=MA" ^
  --data "DivisionName=MEIKO AUTOMATION JOINT STOCK COMPANY" ^
  --data "IsLoginQR=false"
```
- Response
```json
{
    "Message": "",
    "Status": 0,
    "Data": {
        "loginCount": 0,
        "CusNum": -1,
        "DivisionID": "MA",
        "DivisionName": "MEIKO AUTOMATION JOINT STOCK COMPANY",
        "UserID": "000174",
        "IsLoginQR": "false"
    },
    "MessageID": "",
    "Params": null,
    "UpdateSuccess": null,
    "VoucherPackages": []
}
```

```bash
curl -b cookies.txt -c cookies.txt -X POST "http://192.168.10.213:14444/Login/DoCheckLoginExist" ^
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" ^
  --data "logOutBack=True" ^
  --data "infoDevide=Chrome - Windows 10" ^
  --data "UserID=000174" ^
  --data "Password=Syo@13122" ^
  --data "LanguageID=vi-VN" ^
  --data "g-recaptcha-response=" ^
  --data "SessionLocalID="
```

```bash
curl -b cookies.txt -c cookies.txt -X POST "http://192.168.10.213:14444/Login/DoLoginDivision" ^
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" ^
  --data "LogonDivisionID=MA" ^
  --data "LogonDivisionName=MEIKO AUTOMATION JOINT STOCK COMPANY" ^
  --data "UserID=000174" ^
  --data "PortID=14444"
```

```json
{
    "Message": "",
    "Status": 0,
    "Data": {
        "urlRedirect": "/S/SF0007",
        "loginCount": 0,
        "sessionLocalID": "5mqfoxcbigosjppw543p5bof",
        "remainingModules": [
            {
                "ModuleName": "Quản trị Nhân sự - Tiền lương",
                "ModuleID": "ASOFTHRM"
            },
            {
                "ModuleName": "Quản lý chuỗi bán lẻ",
                "ModuleID": "ASOFTPOS"
            },
            {
                "ModuleName": "Thông tin dùng chung",
                "ModuleID": "ASOFTCI"
            },
            {
                "ModuleName": "Đánh giá KPI",
                "ModuleID": "ASOFTKPI"
            },
            {
                "ModuleName": "Đánh giá năng lực",
                "ModuleID": "ASOFTPA"
            },
            {
                "ModuleName": "Quản lý tương tác/liên hệ khách hàng",
                "ModuleID": "ASOFTCCM"
            },
            {
                "ModuleName": "Văn phòng thông minh",
                "ModuleID": "ASOFTIOT"
            }
        ]
    },
    "MessageID": "",
    "Params": null,
    "UpdateSuccess": null,
    "VoucherPackages": []
}
```

```bash
curl -b cookies.txt "http://192.168.10.213:14444/PopupMasterDetail/Index/HRM/HRMF2263?PK=000174,RNDS&Table=HT2408&key=DivisionID"
```

```bash
curl -b cookies.txt -X POST "http://192.168.10.213:14444/CoreCommon/GetWorkingDate" ^
  -H "Content-Type: application/json; charset=UTF-8" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  -H "Origin: http://192.168.10.213:14444" ^
  -H "Referer: http://192.168.10.213:14444/PopupMasterDetail/Index/HRM/HRMF2263?PK=000174,RNDS&Table=HT2408&key=DivisionID" ^
  --data "{}"
```

```json
{
    "Message": "",
    "Status": 0,
    "Data": [
        {
            "EndBreak": 45900,
            "BeginBreak": 43200,
            "IsCompens": 0,
            "EndDayOff": "\/Date(1767200400000)\/",
            "StartDayOff": "\/Date(1767200400000)\/",
            "HoursWork": 8.00000000,
            "EndTime": 60300,
            "BeginTime": 28800,
            "IsWorkSun": 0,
            "IsWorkSat": 1,
            "IsWorkFri": 1,
            "IsWorkTues": 1,
            "IsWorkWed": 1,
            "IsWorkThurs": 1,
            "IsWorkMon": 1,
            "ToDate": "\/Date(1798650000000)\/",
            "FromDate": "\/Date(1767200400000)\/",
            "DivisionID": "MA",
            "APK": "8419525a-193c-411c-81ba-63e6a4f33ecd",
            "YearID": null,
            "Description": null,
            "CreateDate": "\/Date(-62135596800000)\/",
            "CreateUserID": null,
            "LastModifyDate": "\/Date(-62135596800000)\/",
            "LastModifyUserID": null,
            "RelatedToTypeID": 0,
            "PlanStartDate": "\/Date(-62135596800000)\/",
            "PlanEndDate": "\/Date(-62135596800000)\/",
            "Orders": 0,
            "Notes": null
        },
        {
            "EndBreak": 45900,
            "BeginBreak": 43200,
            "IsCompens": 0,
            "EndDayOff": "\/Date(1771520400000)\/",
            "StartDayOff": "\/Date(1771174800000)\/",
            "HoursWork": 8.00000000,
            "EndTime": 60300,
            "BeginTime": 28800,
            "IsWorkSun": 0,
            "IsWorkSat": 1,
            "IsWorkFri": 1,
            "IsWorkTues": 1,
            "IsWorkWed": 1,
            "IsWorkThurs": 1,
            "IsWorkMon": 1,
            "ToDate": "\/Date(1798650000000)\/",
            "FromDate": "\/Date(1767200400000)\/",
            "DivisionID": "MA",
            "APK": "8419525a-193c-411c-81ba-63e6a4f33ecd",
            "YearID": null,
            "Description": null,
            "CreateDate": "\/Date(-62135596800000)\/",
            "CreateUserID": null,
            "LastModifyDate": "\/Date(-62135596800000)\/",
            "LastModifyUserID": null,
            "RelatedToTypeID": 0,
            "PlanStartDate": "\/Date(-62135596800000)\/",
            "PlanEndDate": "\/Date(-62135596800000)\/",
            "Orders": 0,
            "Notes": null
        },
        {
            "EndBreak": 45900,
            "BeginBreak": 43200,
            "IsCompens": 0,
            "EndDayOff": "\/Date(1777222800000)\/",
            "StartDayOff": "\/Date(1777222800000)\/",
            "HoursWork": 8.00000000,
            "EndTime": 60300,
            "BeginTime": 28800,
            "IsWorkSun": 0,
            "IsWorkSat": 1,
            "IsWorkFri": 1,
            "IsWorkTues": 1,
            "IsWorkWed": 1,
            "IsWorkThurs": 1,
            "IsWorkMon": 1,
            "ToDate": "\/Date(1798650000000)\/",
            "FromDate": "\/Date(1767200400000)\/",
            "DivisionID": "MA",
            "APK": "8419525a-193c-411c-81ba-63e6a4f33ecd",
            "YearID": null,
            "Description": null,
            "CreateDate": "\/Date(-62135596800000)\/",
            "CreateUserID": null,
            "LastModifyDate": "\/Date(-62135596800000)\/",
            "LastModifyUserID": null,
            "RelatedToTypeID": 0,
            "PlanStartDate": "\/Date(-62135596800000)\/",
            "PlanEndDate": "\/Date(-62135596800000)\/",
            "Orders": 0,
            "Notes": null
        },
        {
            "EndBreak": 45900,
            "BeginBreak": 43200,
            "IsCompens": 0,
            "EndDayOff": "\/Date(1788368400000)\/",
            "StartDayOff": "\/Date(1788282000000)\/",
            "HoursWork": 8.00000000,
            "EndTime": 60300,
            "BeginTime": 28800,
            "IsWorkSun": 0,
            "IsWorkSat": 1,
            "IsWorkFri": 1,
            "IsWorkTues": 1,
            "IsWorkWed": 1,
            "IsWorkThurs": 1,
            "IsWorkMon": 1,
            "ToDate": "\/Date(1798650000000)\/",
            "FromDate": "\/Date(1767200400000)\/",
            "DivisionID": "MA",
            "APK": "8419525a-193c-411c-81ba-63e6a4f33ecd",
            "YearID": null,
            "Description": null,
            "CreateDate": "\/Date(-62135596800000)\/",
            "CreateUserID": null,
            "LastModifyDate": "\/Date(-62135596800000)\/",
            "LastModifyUserID": null,
            "RelatedToTypeID": 0,
            "PlanStartDate": "\/Date(-62135596800000)\/",
            "PlanEndDate": "\/Date(-62135596800000)\/",
            "Orders": 0,
            "Notes": null
        },
        {
            "EndBreak": 45900,
            "BeginBreak": 43200,
            "IsCompens": 0,
            "EndDayOff": "\/Date(1777568400000)\/",
            "StartDayOff": "\/Date(1777482000000)\/",
            "HoursWork": 8.00000000,
            "EndTime": 60300,
            "BeginTime": 28800,
            "IsWorkSun": 0,
            "IsWorkSat": 1,
            "IsWorkFri": 1,
            "IsWorkTues": 1,
            "IsWorkWed": 1,
            "IsWorkThurs": 1,
            "IsWorkMon": 1,
            "ToDate": "\/Date(1798650000000)\/",
            "FromDate": "\/Date(1767200400000)\/",
            "DivisionID": "MA",
            "APK": "8419525a-193c-411c-81ba-63e6a4f33ecd",
            "YearID": null,
            "Description": null,
            "CreateDate": "\/Date(-62135596800000)\/",
            "CreateUserID": null,
            "LastModifyDate": "\/Date(-62135596800000)\/",
            "LastModifyUserID": null,
            "RelatedToTypeID": 0,
            "PlanStartDate": "\/Date(-62135596800000)\/",
            "PlanEndDate": "\/Date(-62135596800000)\/",
            "Orders": 0,
            "Notes": null
        }
    ],
    "MessageID": "",
    "Params": null,
    "UpdateSuccess": null,
    "VoucherPackages": []
}
```

# Xử lý lọc và thời gian lấy

```bash
curl -b cookies.txt -X POST "http://192.168.10.213:14444/GridCommon/Read?TableName=HRMT2260" ^
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  -H "Origin: http://192.168.10.213:14444" ^
  -H "Referer: http://192.168.10.213:14444/Contentmaster/Index/HRM/HRMF2260" ^
  --data "sort=&page=1&pageSize=25&group=&filter=&rdoFilter=1&FromDatePeriodControl=01%2F12%2F2025&ToDatePeriodControl=03%2F12%2F2025&FromToDate_Content_DataType=9&FromToDate_Type_Fields=5&IsPeriod=0&FromDatePeriodControl_Type_Fields=5&ToDatePeriodControl_Type_Fields=5&FromDatePeriodControl_Content_DataType=13&ToDatePeriodControl_Content_DataType=13&CheckListPeriodControl_Type_Fields=4&CheckListPeriodControl_Content_DataType=13&DivisionID_Content_DataType=7&DivisionID_Type_Fields=4&DivisionID_HRMF2260=&DivisionID1_Content_DataType=7&DivisionID1_Type_Fields=1&DivisionID1_HRMF2260=&Period_Content_DataType=7&Period_Type_Fields=1&Period_HRMF2260=&FromDate_Content_DataType=9&FromDate_Type_Fields=5&FromDate_HRMF2260=&ToDate_Content_DataType=9&ToDate_Type_Fields=5&ToDate_HRMF2260=&DepartmentID1_Content_DataType=7&DepartmentID1_Type_Fields=3&DepartmentID1_HRMF2260=&View_Content_DataType=7&View_Type_Fields=1&View_HRMF2260=&CreateUserID_Content_DataType=7&CreateUserID_Type_Fields=1&CreateUserID_HRMF2260=&CreateDate_Content_DataType=13&CreateDate_Type_Fields=1&CreateDate_HRMF2260=&LastModifyUserID_Content_DataType=7&LastModifyUserID_Type_Fields=1&LastModifyUserID_HRMF2260=&LastModifyDate_Content_DataType=13&LastModifyDate_Type_Fields=1&LastModifyDate_HRMF2260=&EmployeeID_Content_DataType=7&EmployeeID_Type_Fields=1&EmployeeID_HRMF2260=00174&FullName_Content_DataType=7&FullName_Type_Fields=1&FullName_HRMF2260=&DepartmentID_Content_DataType=7&DepartmentID_Type_Fields=3&CheckInList=DepartmentID_HRMF2260&DepartmentID_HRMF2260_input=&DepartmentID_HRMF2260=&DepartmentName_Content_DataType=7&DepartmentName_Type_Fields=1&DepartmentName_HRMF2260=&AbsentCardNo_Content_DataType=4&AbsentCardNo_Type_Fields=1&AbsentCardNo_HRMF2260=&args%5B0%5D.Key=ftype%5B%5D&args%5B0%5D.Value%5B0%5D=&args%5B0%5D.Value%5B1%5D=5&args%5B0%5D.Value%5B2%5D=5&args%5B0%5D.Value%5B3%5D=&args%5B0%5D.Value%5B4%5D=4&args%5B0%5D.Value%5B5%5D=1&args%5B0%5D.Value%5B6%5D=1&args%5B0%5D.Value%5B7%5D=5&args%5B0%5D.Value%5B8%5D=5&args%5B0%5D.Value%5B9%5D=3&args%5B0%5D.Value%5B10%5D=1&args%5B0%5D.Value%5B11%5D=1&args%5B0%5D.Value%5B12%5D=1&args%5B0%5D.Value%5B13%5D=1&args%5B0%5D.Value%5B14%5D=1&args%5B0%5D.Value%5B15%5D=1&args%5B0%5D.Value%5B16%5D=1&args%5B0%5D.Value%5B17%5D=3&args%5B0%5D.Value%5B18%5D=1&args%5B0%5D.Value%5B19%5D=1&args%5B1%5D.Key=dttype%5B%5D&args%5B1%5D.Value%5B0%5D=&args%5B1%5D.Value%5B1%5D=13&args%5B1%5D.Value%5B2%5D=13&args%5B1%5D.Value%5B3%5D=&args%5B1%5D.Value%5B4%5D=7&args%5B1%5D.Value%5B5%5D=7&args%5B1%5D.Value%5B6%5D=7&args%5B1%5D.Value%5B7%5D=9&args%5B1%5D.Value%5B8%5D=9&args%5B1%5D.Value%5B9%5D=7&args%5B1%5D.Value%5B10%5D=7&args%5B1%5D.Value%5B11%5D=7&args%5B1%5D.Value%5B12%5D=13&args%5B1%5D.Value%5B13%5D=7&args%5B1%5D.Value%5B14%5D=13&args%5B1%5D.Value%5B15%5D=7&args%5B1%5D.Value%5B16%5D=7&args%5B1%5D.Value%5B17%5D=7&args%5B1%5D.Value%5B18%5D=7&args%5B1%5D.Value%5B19%5D=4&args%5B2%5D.Key=key%5B%5D&args%5B2%5D.Value%5B0%5D=rdoFilter&args%5B2%5D.Value%5B1%5D=FromDatePeriodControl&args%5B2%5D.Value%5B2%5D=ToDatePeriodControl&args%5B2%5D.Value%5B3%5D=IsPeriod&args%5B2%5D.Value%5B4%5D=DivisionID&args%5B2%5D.Value%5B5%5D=DivisionID1&args%5B2%5D.Value%5B6%5D=Period&args%5B2%5D.Value%5B7%5D=FromDate&args%5B2%5D.Value%5B8%5D=ToDate&args%5B2%5D.Value%5B9%5D=DepartmentID1&args%5B2%5D.Value%5B10%5D=View&args%5B2%5D.Value%5B11%5D=CreateUserID&args%5B2%5D.Value%5B12%5D=CreateDate&args%5B2%5D.Value%5B13%5D=LastModifyUserID&args%5B2%5D.Value%5B14%5D=LastModifyDate&args%5B2%5D.Value%5B15%5D=EmployeeID&args%5B2%5D.Value%5B16%5D=FullName&args%5B2%5D.Value%5B17%5D=DepartmentID&args%5B2%5D.Value%5B18%5D=DepartmentName&args%5B2%5D.Value%5B19%5D=AbsentCardNo&args%5B2%5D.Value%5B20%5D=HRMT2260&args%5B3%5D.Key=value%5B%5D&args%5B3%5D.Value%5B0%5D=1&args%5B3%5D.Value%5B1%5D=01%2F12%2F2025&args%5B3%5D.Value%5B2%5D=03%2F12%2F2025&args%5B3%5D.Value%5B3%5D=0&args%5B3%5D.Value%5B4%5D=&args%5B3%5D.Value%5B5%5D=&args%5B3%5D.Value%5B6%5D=&args%5B3%5D.Value%5B7%5D=&args%5B3%5D.Value%5B8%5D=&args%5B3%5D.Value%5B9%5D=&args%5B3%5D.Value%5B10%5D=&args%5B3%5D.Value%5B11%5D=&args%5B3%5D.Value%5B12%5D=&args%5B3%5D.Value%5B13%5D=&args%5B3%5D.Value%5B14%5D=&args%5B3%5D.Value%5B15%5D=00174&args%5B3%5D.Value%5B16%5D=&args%5B3%5D.Value%5B17%5D=&args%5B3%5D.Value%5B18%5D=&args%5B3%5D.Value%5B19%5D=&args%5B4%5D.Key=systemInfo%5B%5D&args%5B4%5D.Value%5B0%5D=HRMF2260&args%5B4%5D.Value%5B1%5D=HRM&args%5B4%5D.Value%5B2%5D=HRMT2260&strWhere="
```

# lấy dữ lieu chấm công
```bash
curl -b cookies.txt -X POST "http://192.168.10.213:14444/GridCommon/ReadEdit?TableName=HRMT2263" ^
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  -H "Origin: http://192.168.10.213:14444" ^
  -H "Referer: http://192.168.10.213:14444/PopupMasterDetail/Index/HRM/HRMF2263?PK=000174,RNDS&Table=HT2408&key=DivisionID" ^
  --data "sort=" ^
  --data "page=1" ^
  --data "pageSize=25" ^
  --data "group=" ^
  --data "filter=" ^
  --data "args[0].Key=key[]" ^
  --data "args[0].Value[0]=EmployeeID" ^
  --data "args[0].Value[1]=HRMT2263" ^
  --data "args[1].Key=value[]" ^
  --data "args[1].Value[0]=000174,RNDS" ^
  --data "args[2].Key=systemInfo[]" ^
  --data "args[2].Value[0]=HRM" ^
  --data "args[2].Value[1]=HRMF2263" ^
  --data "args[2].Value[2]=HRMT2263"
```

# Lấy danh sách đơn xin phép

```bash
curl -b cookies.txt -X POST "http://192.168.10.213:14444/GridCommon/Read?TableName=HRMT2260" ^
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  -H "Origin: http://192.168.10.213:14444" ^
  -H "Referer: http://192.168.10.213:14444/Contentmaster/Index/HRM/HRMF2260" ^
  --data "sort=&page=1&pageSize=25&group=&filter=&FromToDate_Content_DataType=9&FromToDate_Type_Fields=5&rdoFilter=1&FromDatePeriodControl=01%2F02%2F2026&ToDatePeriodControl=28%2F02%2F2026&IsPeriod=0&FromDatePeriodControl_Type_Fields=5&ToDatePeriodControl_Type_Fields=5&FromDatePeriodControl_Content_DataType=13&ToDatePeriodControl_Content_DataType=13&CheckListPeriodControl_Type_Fields=4&CheckListPeriodControl_Content_DataType=13&APK_Content_DataType=1&APK_Type_Fields=1&APK_HRMF2360=&TranMonth_Content_DataType=5&TranMonth_Type_Fields=1&TranMonth_HRMF2360=&TranYear_Content_DataType=5&TranYear_Type_Fields=1&TranYear_HRMF2360=&DepartmentName_Content_DataType=7&DepartmentName_Type_Fields=1&DepartmentName_HRMF2360=&SectionName_Content_DataType=7&SectionName_Type_Fields=1&SectionName_HRMF2360=&SubsectionName_Content_DataType=7&SubsectionName_Type_Fields=1&SubsectionName_HRMF2360=&ProcessName_Content_DataType=7&ProcessName_Type_Fields=1&ProcessName_HRMF2360=&CreateUserName_Content_DataType=7&CreateUserName_Type_Fields=1&CreateUserName_HRMF2360=&StatusName_Content_DataType=7&StatusName_Type_Fields=1&StatusName_HRMF2360=&DivisionID_Content_DataType=7&DivisionID_Type_Fields=4&DivisionID_HRMF2360=&ID_Content_DataType=12&ID_Type_Fields=1&ID_HRMF2360=&Description_Content_DataType=12&Description_Type_Fields=1&Description_HRMF2360=&DepartmentID_Content_DataType=7&DepartmentID_Type_Fields=3&CheckInList%5B0%5D=DepartmentID_HRMF2360&CheckInList%5B1%5D=SectionID_HRMF2360&CheckInList%5B2%5D=SubsectionID_HRMF2360&CheckInList%5B3%5D=ProcessID_HRMF2360&CheckInList%5B4%5D=CreateUserID_HRMF2360&CheckInList%5B5%5D=Status_HRMF2360&DepartmentID_HRMF2360_input=&DepartmentID_HRMF2360=&SectionID_Content_DataType=7&SectionID_Type_Fields=3&SectionID_HRMF2360_input=&SectionID_HRMF2360=&SubsectionID_Content_DataType=7&SubsectionID_Type_Fields=3&SubsectionID_HRMF2360_input=&SubsectionID_HRMF2360=&ProcessID_Content_DataType=7&ProcessID_Type_Fields=3&ProcessID_HRMF2360_input=&ProcessID_HRMF2360=&CreateUserID_Content_DataType=7&CreateUserID_Type_Fields=3&CreateUserID_HRMF2360_input=&CreateUserID_HRMF2360=&CreateDate_Content_DataType=9&CreateDate_Type_Fields=5&CreateDate_HRMF2360=&LastModifyUserID_Content_DataType=7&LastModifyUserID_Type_Fields=1&LastModifyUserID_HRMF2360=&LastModifyDate_Content_DataType=13&LastModifyDate_Type_Fields=1&LastModifyDate_HRMF2360=&Status_Content_DataType=7&Status_Type_Fields=3&Status_HRMF2360_input=&Status_HRMF2360=&args%5B0%5D.Key=ftype%5B%5D&args%5B0%5D.Value%5B0%5D=&args%5B0%5D.Value%5B1%5D=5&args%5B0%5D.Value%5B2%5D=5&args%5B0%5D.Value%5B3%5D=&args%5B0%5D.Value%5B4%5D=1&args%5B0%5D.Value%5B5%5D=1&args%5B0%5D.Value%5B6%5D=1&args%5B0%5D.Value%5B7%5D=1&args%5B0%5D.Value%5B8%5D=1&args%5B0%5D.Value%5B9%5D=1&args%5B0%5D.Value%5B10%5D=1&args%5B0%5D.Value%5B11%5D=1&args%5B0%5D.Value%5B12%5D=1&args%5B0%5D.Value%5B13%5D=4&args%5B0%5D.Value%5B14%5D=1&args%5B0%5D.Value%5B15%5D=1&args%5B0%5D.Value%5B16%5D=3&args%5B0%5D.Value%5B17%5D=3&args%5B0%5D.Value%5B18%5D=3&args%5B0%5D.Value%5B19%5D=3&args%5B0%5D.Value%5B20%5D=3&args%5B0%5D.Value%5B21%5D=5&args%5B0%5D.Value%5B22%5D=1&args%5B0%5D.Value%5B23%5D=1&args%5B0%5D.Value%5B24%5D=3&args%5B1%5D.Key=dttype%5B%5D&args%5B1%5D.Value%5B0%5D=&args%5B1%5D.Value%5B1%5D=13&args%5B1%5D.Value%5B2%5D=13&args%5B1%5D.Value%5B3%5D=&args%5B1%5D.Value%5B4%5D=1&args%5B1%5D.Value%5B5%5D=5&args%5B1%5D.Value%5B6%5D=5&args%5B1%5D.Value%5B7%5D=7&args%5B1%5D.Value%5B8%5D=7&args%5B1%5D.Value%5B9%5D=7&args%5B1%5D.Value%5B10%5D=7&args%5B1%5D.Value%5B11%5D=7&args%5B1%5D.Value%5B12%5D=7&args%5B1%5D.Value%5B13%5D=7&args%5B1%5D.Value%5B14%5D=12&args%5B1%5D.Value%5B15%5D=12&args%5B1%5D.Value%5B16%5D=7&args%5B1%5D.Value%5B17%5D=7&args%5B1%5D.Value%5B18%5D=7&args%5B1%5D.Value%5B19%5D=7&args%5B1%5D.Value%5B20%5D=7&args%5B1%5D.Value%5B21%5D=9&args%5B1%5D.Value%5B22%5D=7&args%5B1%5D.Value%5B23%5D=13&args%5B1%5D.Value%5B24%5D=7&args%5B2%5D.Key=key%5B%5D&args%5B2%5D.Value%5B0%5D=rdoFilter&args%5B2%5D.Value%5B1%5D=FromDatePeriodControl&args%5B2%5D.Value%5B2%5D=ToDatePeriodControl&args%5B2%5D.Value%5B3%5D=IsPeriod&args%5B2%5D.Value%5B4%5D=APK&args%5B2%5D.Value%5B5%5D=TranMonth&args%5B2%5D.Value%5B6%5D=TranYear&args%5B2%5D.Value%5B7%5D=DepartmentName&args%5B2%5D.Value%5B8%5D=SectionName&args%5B2%5D.Value%5B9%5D=SubsectionName&args%5B2%5D.Value%5B10%5D=ProcessName&args%5B2%5D.Value%5B11%5D=CreateUserName&args%5B2%5D.Value%5B12%5D=StatusName&args%5B2%5D.Value%5B13%5D=DivisionID&args%5B2%5D.Value%5B14%5D=ID&args%5B2%5D.Value%5B15%5D=Description&args%5B2%5D.Value%5B16%5D=DepartmentID&args%5B2%5D.Value%5B17%5D=SectionID&args%5B2%5D.Value%5B18%5D=SubsectionID&args%5B2%5D.Value%5B19%5D=ProcessID&args%5B2%5D.Value%5B20%5D=CreateUserID&args%5B2%5D.Value%5B21%5D=CreateDate&args%5B2%5D.Value%5B22%5D=LastModifyUserID&args%5B2%5D.Value%5B23%5D=LastModifyDate&args%5B2%5D.Value%5B24%5D=Status&args%5B2%5D.Value%5B25%5D=OOT9000&args%5B3%5D.Key=value%5B%5D&args%5B3%5D.Value%5B0%5D=1&args%5B3%5D.Value%5B1%5D=01%2F02%2F2026&args%5B3%5D.Value%5B2%5D=28%2F02%2F2026&args%5B3%5D.Value%5B3%5D=0&args%5B3%5D.Value%5B4%5D=&args%5B3%5D.Value%5B5%5D=&args%5B3%5D.Value%5B6%5D=&args%5B3%5D.Value%5B7%5D=&args%5B3%5D.Value%5B8%5D=&args%5B3%5D.Value%5B9%5D=&args%5B3%5D.Value%5B10%5D=&args%5B3%5D.Value%5B11%5D=&args%5B3%5D.Value%5B12%5D=&args%5B3%5D.Value%5B13%5D=&args%5B3%5D.Value%5B14%5D=&args%5B3%5D.Value%5B15%5D=&args%5B3%5D.Value%5B16%5D=&args%5B3%5D.Value%5B17%5D=&args%5B3%5D.Value%5B18%5D=&args%5B3%5D.Value%5B19%5D=&args%5B3%5D.Value%5B20%5D=&args%5B3%5D.Value%5B21%5D=&args%5B3%5D.Value%5B22%5D=&args%5B3%5D.Value%5B23%5D=&args%5B3%5D.Value%5B24%5D=&args%5B4%5D.Key=systemInfo%5B%5D&args%5B4%5D.Value%5B0%5D=HRMF2360&args%5B4%5D.Value%5B1%5D=HRM&args%5B4%5D.Value%5B2%5D=OOT9000&strWhere="
```

Rút gọn

```cmd
curl -b cookies.txt ^
  -X POST "http://192.168.10.213:14444/GridCommon/Read?TableName=HRMT2260" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  --data "page=1&pageSize=25" ^
  --data "args[0].Key=ftype[]" ^
  --data "args[0].Value[0]=5" ^
  --data "args[1].Key=dttype[]" ^
  --data "args[1].Value[0]=13" ^
  --data "args[2].Key=key[]" ^
  --data "args[2].Value[0]=CreateDate" ^
  --data-urlencode "args[3].Key=value[]" ^
  --data-urlencode "args[3].Value[0]=01/02/2026" ^
  --data-urlencode "args[3].Value[1]=28/02/2026" ^
  --data "args[4].Key=systemInfo[]" ^
  --data "args[4].Value[0]=HRMF2360" ^
  --data "args[4].Value[1]=HRM" ^
  --data "args[4].Value[2]=OOT9000"
```

```json

{
    "Data": [
        {
            "RowNum": 1,
            "TotalRow": 11,
            "APK": "02a98b81-6d7d-46c4-bee3-09aed685e4d9",
            "DivisionID": "MA",
            "TranMonth": 2,
            "TranYear": 2026,
            "ID": "DOT/02/26/0360",
            "Description": "Đơn xin làm thêm giờ",
            "DepartmentID": "RNDS",
            "SectionID": "",
            "SubsectionID": "",
            "ProcessID": "",
            "Status": 0,
            "CreateUserID": "000174",
            "CreateUserName": "Nguyễn Văn Thanh",
            "CreateDate": "\/Date(1772242451820)\/",
            "LastModifyUserID": "000174",
            "LastModifyDate": "\/Date(1772242451820)\/",
            "DepartmentName": "R\u0026D S",
            "SectionName": null,
            "SubsectionName": "",
            "ProcessName": "",
            "StatusName": "Chờ duyệt"
        },
        {
            "RowNum": 2,
            "TotalRow": 11,
            "APK": "6860ad51-0d9f-4b82-9ed9-2c5d1134e8c1",
            "DivisionID": "MA",
            "TranMonth": 2,
            "TranYear": 2026,
            "ID": "DOT/02/26/0359",
            "Description": "Đơn xin làm thêm giờ",
            "DepartmentID": "RNDS",
            "SectionID": "",
            "SubsectionID": "",
            "ProcessID": "",
            "Status": 0,
            "CreateUserID": "000174",
            "CreateUserName": "Nguyễn Văn Thanh",
            "CreateDate": "\/Date(1772242357853)\/",
            "LastModifyUserID": "000174",
            "LastModifyDate": "\/Date(1772242357853)\/",
            "DepartmentName": "R\u0026D S",
            "SectionName": null,
            "SubsectionName": "",
            "ProcessName": "",
            "StatusName": "Chờ duyệt"
        },
        {
            "RowNum": 3,
            "TotalRow": 11,
            "APK": "3cd0e968-4002-464d-8241-2ba9dbdb98ce",
            "DivisionID": "MA",
            "TranMonth": 2,
            "TranYear": 2026,
            "ID": "DOT/02/26/0328",
            "Description": "Đơn xin làm thêm giờ",
            "DepartmentID": "RNDS",
            "SectionID": "",
            "SubsectionID": "",
            "ProcessID": "",
            "Status": 1,
            "CreateUserID": "000174",
            "CreateUserName": "Nguyễn Văn Thanh",
            "CreateDate": "\/Date(1772153530853)\/",
            "LastModifyUserID": "000018",
            "LastModifyDate": "\/Date(1772185488310)\/",
            "DepartmentName": "R\u0026D S",
            "SectionName": null,
            "SubsectionName": "",
            "ProcessName": "",
            "StatusName": "Duyệt"
        },
        {
            "RowNum": 4,
            "TotalRow": 11,
            "APK": "9c15e393-9875-4dbd-907a-cbf46899e0d9",
            "DivisionID": "MA",
            "TranMonth": 2,
            "TranYear": 2026,
            "ID": "DOT/02/26/0324",
            "Description": "Đơn xin làm thêm giờ",
            "DepartmentID": "RNDS",
            "SectionID": "",
            "SubsectionID": "",
            "ProcessID": "",
            "Status": 1,
            "CreateUserID": "000174",
            "CreateUserName": "Nguyễn Văn Thanh",
            "CreateDate": "\/Date(1772101516950)\/",
            "LastModifyUserID": "000018",
            "LastModifyDate": "\/Date(1772185488480)\/",
            "DepartmentName": "R\u0026D S",
            "SectionName": null,
            "SubsectionName": "",
            "ProcessName": "",
            "StatusName": "Duyệt"
        },
        {
            "RowNum": 5,
            "TotalRow": 11,
            "APK": "806dcbea-505d-4f92-8086-4b9e32e05c59",
            "DivisionID": "MA",
            "TranMonth": 2,
            "TranYear": 2026,
            "ID": "DOT/02/26/0287",
            "Description": "Đơn xin làm thêm giờ",
            "DepartmentID": "RNDS",
            "SectionID": "",
            "SubsectionID": "",
            "ProcessID": "",
            "Status": 1,
            "CreateUserID": "000174",
            "CreateUserName": "Nguyễn Văn Thanh",
            "CreateDate": "\/Date(1771923087897)\/",
            "LastModifyUserID": "000018",
            "LastModifyDate": "\/Date(1772185488437)\/",
            "DepartmentName": "R\u0026D S",
            "SectionName": null,
            "SubsectionName": "",
            "ProcessName": "",
            "StatusName": "Duyệt"
        },
        {
            "RowNum": 6,
            "TotalRow": 11,
            "APK": "a70764e5-c00b-44a5-88d7-7e1c36d5b90c",
            "DivisionID": "MA",
            "TranMonth": 2,
            "TranYear": 2026,
            "ID": "DOT/02/26/0214",
            "Description": "Đơn xin làm thêm giờ",
            "DepartmentID": "RNDS",
            "SectionID": "",
            "SubsectionID": "",
            "ProcessID": "",
            "Status": 1,
            "CreateUserID": "000174",
            "CreateUserName": "Nguyễn Văn Thanh",
            "CreateDate": "\/Date(1770970794347)\/",
            "LastModifyUserID": "000018",
            "LastModifyDate": "\/Date(1772185488510)\/",
            "DepartmentName": "R\u0026D S",
            "SectionName": null,
            "SubsectionName": "",
            "ProcessName": "",
            "StatusName": "Duyệt"
        },
        {
            "RowNum": 7,
            "TotalRow": 11,
            "APK": "aba45c7d-cb8f-47cc-9004-df8c3a6ed661",
            "DivisionID": "MA",
            "TranMonth": 2,
            "TranYear": 2026,
            "ID": "DOT/02/26/0188",
            "Description": "Đơn xin làm thêm giờ",
            "DepartmentID": "RNDS",
            "SectionID": "",
            "SubsectionID": "",
            "ProcessID": "",
            "Status": 1,
            "CreateUserID": "000174",
            "CreateUserName": "Nguyễn Văn Thanh",
            "CreateDate": "\/Date(1770806626740)\/",
            "LastModifyUserID": "000018",
            "LastModifyDate": "\/Date(1770864474743)\/",
            "DepartmentName": "R\u0026D S",
            "SectionName": null,
            "SubsectionName": "",
            "ProcessName": "",
            "StatusName": "Duyệt"
        },
        {
            "RowNum": 8,
            "TotalRow": 11,
            "APK": "a2816571-93d1-4b82-bf8b-051ec2393b8a",
            "DivisionID": "MA",
            "TranMonth": 2,
            "TranYear": 2026,
            "ID": "DOT/02/26/0187",
            "Description": "Đơn xin làm thêm giờ",
            "DepartmentID": "RNDS",
            "SectionID": "",
            "SubsectionID": "",
            "ProcessID": "",
            "Status": 1,
            "CreateUserID": "000174",
            "CreateUserName": "Nguyễn Văn Thanh",
            "CreateDate": "\/Date(1770806593357)\/",
            "LastModifyUserID": "000018",
            "LastModifyDate": "\/Date(1770864474727)\/",
            "DepartmentName": "R\u0026D S",
            "SectionName": null,
            "SubsectionName": "",
            "ProcessName": "",
            "StatusName": "Duyệt"
        },
        {
            "RowNum": 9,
            "TotalRow": 11,
            "APK": "4f11294a-1be8-4b32-8945-8ceee2c99da3",
            "DivisionID": "MA",
            "TranMonth": 2,
            "TranYear": 2026,
            "ID": "DOT/02/26/0111",
            "Description": "Đơn xin làm thêm giờ",
            "DepartmentID": "RNDS",
            "SectionID": "",
            "SubsectionID": "",
            "ProcessID": "",
            "Status": 1,
            "CreateUserID": "000174",
            "CreateUserName": "Nguyễn Văn Thanh",
            "CreateDate": "\/Date(1770429531287)\/",
            "LastModifyUserID": "000018",
            "LastModifyDate": "\/Date(1770864474677)\/",
            "DepartmentName": "R\u0026D S",
            "SectionName": null,
            "SubsectionName": "",
            "ProcessName": "",
            "StatusName": "Duyệt"
        },
        {
            "RowNum": 10,
            "TotalRow": 11,
            "APK": "46720c1b-6842-4881-b960-fc671ecf6716",
            "DivisionID": "MA",
            "TranMonth": 2,
            "TranYear": 2026,
            "ID": "DOT/02/26/0096",
            "Description": "Đơn xin làm thêm giờ",
            "DepartmentID": "RNDS",
            "SectionID": "",
            "SubsectionID": "",
            "ProcessID": "",
            "Status": 1,
            "CreateUserID": "000174",
            "CreateUserName": "Nguyễn Văn Thanh",
            "CreateDate": "\/Date(1770366744983)\/",
            "LastModifyUserID": "000018",
            "LastModifyDate": "\/Date(1770864474660)\/",
            "DepartmentName": "R\u0026D S",
            "SectionName": null,
            "SubsectionName": "",
            "ProcessName": "",
            "StatusName": "Duyệt"
        },
        {
            "RowNum": 11,
            "TotalRow": 11,
            "APK": "6e7a9bd2-9bb8-4618-afd3-4a84dd16c7e9",
            "DivisionID": "MA",
            "TranMonth": 2,
            "TranYear": 2026,
            "ID": "DOT/02/26/0046",
            "Description": "Đơn xin làm thêm giờ",
            "DepartmentID": "RNDS",
            "SectionID": "",
            "SubsectionID": "",
            "ProcessID": "",
            "Status": 1,
            "CreateUserID": "000174",
            "CreateUserName": "Nguyễn Văn Thanh",
            "CreateDate": "\/Date(1770168373743)\/",
            "LastModifyUserID": "000018",
            "LastModifyDate": "\/Date(1770864474683)\/",
            "DepartmentName": "R\u0026D S",
            "SectionName": null,
            "SubsectionName": "",
            "ProcessName": "",
            "StatusName": "Duyệt"
        }
    ],
    "Total": 11,
    "AggregateResults": null,
    "Errors": null
}
```

# Lấy danh sách chấm công rút gọn api
```cmd
curl -b cookies.txt ^
  -X POST "http://192.168.10.213:14444/GridCommon/Read?TableName=HRMT2260" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  --data "page=1&pageSize=25" ^
  --data "args[0].Key=ftype[]" ^
  --data "args[0].Value[0]=5" ^
  --data "args[1].Key=dttype[]" ^
  --data "args[1].Value[0]=9" ^
  --data "args[2].Key=key[]" ^
  --data "args[2].Value[0]=AbsentDate" ^
  --data-urlencode "args[3].Key=value[]" ^
  --data-urlencode "args[3].Value[0]=01/02/2026" ^
  --data-urlencode "args[3].Value[1]=28/02/2026" ^
  --data "args[4].Key=systemInfo[]" ^
  --data "args[4].Value[0]=HRMF2260" ^
  --data "args[4].Value[1]=HRM" ^
  --data "args[4].Value[2]=HRMT2260"
  ```