async function api(url, body, isJson = true) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": isJson
        ? "application/json; charset=UTF-8"
        : "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest"
    },
    body: isJson ? JSON.stringify(body) : body
  });

  const text = await res.text();
  try { return JSON.parse(text); }
  catch { console.log("RAW:", text); throw "Not JSON"; }
}

async function getPeriod(division = "MA", month = 2, year = 2026) {

  console.log("📅 Get Period");

  const body = new URLSearchParams({
    DivisionIDPeriod: division,
    TranMonth: month,
    TranYear: year
  });

  const res = await api(
    "/Period/BeginEndDate",
    body.toString(),
    false
  );

  console.log("Period info:", res);

  return res;
}

async function updatePeriod(division = "MA", month = 2, year = 2026) {

  console.log("🔄 Update Period");

  const period = String(month).padStart(2, "0") + "/" + year;

  const today = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "/");

  const body = new URLSearchParams({
    IsNoReset: "",
    periodTitle: "Chọn kỳ kế toán",
    UrlUpdatePeriod: "/Period/Update",
    DivisionIDPeriod: division,
    Period: period,
    VoucherDate: today,
    BeginDate: today,
    EndDate: today,
    TranMonth: month,
    TranYear: year,
    Closing: 0
  });

  const res = await api(
    "/Period/Update",
    body.toString(),
    false
  );

  console.log("Period updated:", res);

  return res;
}

async function getOTList() {

  const body = new URLSearchParams();

  body.append("page", "1");
  body.append("pageSize", "25");

  body.append("args[0].Key", "ftype[]");
  body.append("args[0].Value[0]", "5");

  body.append("args[1].Key", "dttype[]");
  body.append("args[1].Value[0]", "13");

  body.append("args[2].Key", "key[]");
  body.append("args[2].Value[0]", "FromDatePeriodControl");

  body.append("args[3].Key", "value[]");
  body.append("args[3].Value[0]", "01/01/2026");
  body.append("args[3].Value[1]", "31/01/2026");

  body.append("args[4].Key", "systemInfo[]");
  body.append("args[4].Value[0]", "HRMF2320");
  body.append("args[4].Value[1]", "HRM");
  body.append("args[4].Value[2]", "HRMT2320");

  const res = await fetch(
    "/GridCommon/Read?TableName=HRMT2320",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest"
      },
      body
    }
  );

  const data = await res.json();
  console.log(data);

  /** có thể trả ra các thông tin như sau. hoặc thiếu các trường do thiếu dữ liệu
   {
    "Data": [
        {
            "RowNum": 1,
            "TotalRow": 1,
            "DivisionID": "MA",
            "DepartmentID": "RNDS",
            "TeamID": "",
            "EmployeeID": "000174",
            "FullName": "Nguyễn Văn Thanh",
            "Notes": null,
            "GCN": 152,
            "GCTT": 192,
            "NP": 16,
            "OTN20": 8,
            "OTT15": 7.25
        }
    ],
    "Total": 1,
    "AggregateResults": null,
    "Errors": null
}  hoặc
  {
    "Data": [
        {
            "RowNum": 1,
            "TotalRow": 1,
            "DivisionID": "MA",
            "DepartmentID": "RNDS",
            "TeamID": "",
            "EmployeeID": "000174",
            "FullName": "Nguyễn Văn Thanh",
            "Notes": null,
            "GCN": 128,
            "GCTT": 224,
            "OTT15": 14.25
        }
    ],
    "Total": 1,
    "AggregateResults": null,
    "Errors": null
}

   */
}


async function testOTFlow() {

  await getPeriod("MA", 1, 2026);

  await updatePeriod("MA", 1, 2026);

  await getOTList();
}

testOTFlow();