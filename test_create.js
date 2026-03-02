async function insertVoucherREAL(dateStr = "03/03/2026") {

  console.log("🚀 CREATE FULL ERP PAYLOAD");

  // STEP 1 — Lấy key
  const keyData = await getNewVoucherKey();

  const lastKey = keyData.LastKey;
  const lastKeyAPK = keyData.LastKeyAPK;

  // STEP 2 — Sinh ApplicationID đúng format hệ thống
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year  = String(now.getFullYear()).slice(-2);
  const running = String(Number(lastKey) + 1).padStart(4, "0");

  const applicationID = `DXP/${month}/${year}/${running}`;

  console.log("ApplicationID:", applicationID);

  // STEP 3 — FULL PAYLOAD (giữ nguyên cấu trúc)
  const payload = {
    dataScreen: [[{
      RequestTypeID: "7,DXP",
      ApplicationID: "7," + applicationID,
      AbsentTypeID: "7,NP",
      Description: "12,Đơn xin phép (AUTO)",
      DepartmentID: "7,RNDS",
      SectionID: "7,",
      SubsectionID: "7,",
      ProcessID: "7,",
      EmployeeName: "7,Nguyễn Văn Thanh",

      RequestFromDate: "9," + dateStr,
      RequestFromDate_DT: "13,",
      RequestToDate: "9," + dateStr,
      RequestToDate_DT: "13,",

      DailyHours: "8,8",
      TotalTime: "8,8.00",
      OverTime: "8,0.00",
      OverTimeNN: "8,0.00",
      OverTimeCompany: "8,0.00",

      ShiftNow: "9,",
      ShiftID: "9,CA01-08:00",

      Reason: "7,",
      Date: "13,",
      InOutID: "7,",
      Place: "7,",
      Note: "7,",

      DaysRemained: "8,2.0",
      OTDaysRemained: "8,0.0",
      UseVehicle: "7,",

      APK: "1,",
      APKDetail: "1,",
      FromToDate: "9,",
      DivisionID: "7,",

      DepartmentName: "7,R&D S",
      SectionName: "7,",
      SubsectionName: "7,",
      ProcessName: "7,",

      EmployeeID: "7,000174",
      CreateUserID: "7,",
      CreateDate: "9,",
      LastModifyUserID: "7,",
      LastModifyDate: "9,",

      LastKey: "7," + lastKey,
      LastKeyAPK: "7," + lastKeyAPK,

      FormStatus: "7,AddNew",
      Level: "7,",
      TypeName: "7,DXP",
      ApproveLevel: "7,1",
      ApprovingLevel: "7,",
      Type_9000: "7,",

      GoStraightName: "7,",
      ComeStraightName: "7,",
      AbsentTypeName: "7,",
      ShiftName: "9,",
      IsPreShiftOTName: "7,",
      InOut: "7,",
      AskForVehicleName: "7,",
      UseVehicleName: "7,",
      HaveLunchName: "7,",
      IsOnTripOTName: "7,",
      StatusName: "7,",

      Status: "6,0",
      ApprovalNotes: "7,",
      Day: "0,200",

      ApprovePerson01ID: "7,000018",

      IsSeri: "6,0",
      GoStraight: "6,0",
      ComeStraight: "6,0",
      IsPreShiftOT: "6,0",
      AskForVehicle: "6,0",
      HaveLunch: "6,0",
      IsOnTripOT: "6,0",
      IsCompen: "6,0"
    }]],
    voucherPackages: []
  };

  console.log("📦 FULL Payload:", payload);

  const res = await api(
    "/GridCommon/InsertUpdatePopupMasterDetailV2/HRM/HRMF2361?isUpdate=false",
    payload
  );

  console.log("🎉 CREATED:", res);
  return res;
}

insertVoucherREAL("04/03/2026");