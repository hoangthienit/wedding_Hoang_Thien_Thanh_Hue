/**
 * Google Apps Script — lưu Xác nhận tham dự & Lời chúc vào Google Sheets
 * Cách dùng: xem HUONG_DAN.md (mục 4)
 */
function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

function clean_(v, max) {
  return String(v || "").replace(/^[=+\-@]/, "'$&").slice(0, max || 500);
}

function doPost(e) {
  const d = JSON.parse(e.postData.contents || "{}");
  if (d.type === "rsvp") {
    getSheet_("XacNhanThamDu", ["Thời gian", "Mã khách", "Họ tên", "Khách của", "Tham dự", "Số người"])
      .appendRow([new Date(), clean_(d.guestId, 10), clean_(d.name, 80), clean_(d.side, 20), clean_(d.attend, 30), clean_(d.count, 5)]);
  } else if (d.type === "wish") {
    getSheet_("LoiChuc", ["Thời gian", "Mã khách", "Họ tên", "Lời chúc", "Hiển thị"])
      .appendRow([new Date(), clean_(d.guestId, 10), clean_(d.name, 80), clean_(d.message, 500), true]);
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (e.parameter.action === "wishes") {
    const sh = getSheet_("LoiChuc", ["Thời gian", "Mã khách", "Họ tên", "Lời chúc", "Hiển thị"]);
    const rows = sh.getDataRange().getValues().slice(1)
      .filter((r) => r[4] !== false && String(r[4]).toUpperCase() !== "FALSE") // đổi cột "Hiển thị" thành FALSE để ẩn lời chúc
      .reverse().slice(0, 200)
      .map((r) => ({ name: String(r[2]), message: String(r[3]) }));
    return ContentService.createTextOutput(JSON.stringify(rows)).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("OK");
}
