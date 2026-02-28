async function fetchLeaveRequests({
  fromDate = "01/02/2026",
  toDate   = "28/02/2026",
  page     = 1,
  pageSize = 25
} = {}) {

  console.log("Fetching leave requests...");

  const body = new URLSearchParams({
    page,
    pageSize,

    "args[0].Key": "ftype[]",
    "args[0].Value[0]": 5,

    "args[1].Key": "dttype[]",
    "args[1].Value[0]": 13,

    "args[2].Key": "key[]",
    "args[2].Value[0]": "CreateDate",

    "args[3].Key": "value[]",
    "args[3].Value[0]": fromDate,
    "args[3].Value[1]": toDate,

    "args[4].Key": "systemInfo[]",
    "args[4].Value[0]": "HRMF2360",
    "args[4].Value[1]": "HRM",
    "args[4].Value[2]": "OOT9000"
  });

  try {
    const res = await fetch("/GridCommon/Read?TableName=HRMT2260", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest"
      },
      body
    });

    const text = await res.text();

    // Debug nếu bị redirect login
    if (text.startsWith("<!DOCTYPE")) {
      console.warn("⚠️ Server trả về HTML (có thể bị redirect login)");
      console.log(text);
      return null;
    }

    const json = JSON.parse(text);

    console.log("✅ JSON parsed:", json);
    console.table(json.Data);

    return json;

  } catch (err) {
    console.error("❌ API Error:", err);
    return null;
  }
}