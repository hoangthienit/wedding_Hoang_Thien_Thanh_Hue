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

const SITE_URL = "https://hoangthienit.github.io/wedding_Hoang_Thien_Thanh_Hue/";

// Tab "KhachMoi": cột A = Mã (số), cột B = Tên khách, cột C = Link (tự tính)
function guestSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("KhachMoi");
  if (!sh) {
    sh = ss.insertSheet("KhachMoi");
    sh.appendRow(["Mã", "Tên khách", "Link"]);
    sh.setFrozenRows(1);
    [[1, "Anh A"], [2, "Chị B"], [3, "Gia đình Ông Bà C"]].forEach((r, i) =>
      sh.appendRow([r[0], r[1], '="' + SITE_URL + '"&A' + (i + 2)]));
  }
  return sh;
}

function doGet(e) {
  if (e.parameter.action === "guest") {
    const id = String(e.parameter.id || "").trim();
    const row = guestSheet_().getDataRange().getValues().slice(1)
      .find((r) => id && String(r[0]).trim() === id);
    const out = { name: row ? String(row[1]).trim() : "" };
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
  }
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
