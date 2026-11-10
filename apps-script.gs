/**
 * toMix Card לעסקים – קליטת לידים
 * כל ליד נכנס לגיליון "לידים" ונשלח במייל ל-hadas@mixgroup.co.il
 *
 * התקנה: Extensions ← Apps Script בגיליון, להדביק את הקוד, Deploy ← New deployment ←
 * Web app ← Execute as: Me ← Who has access: Anyone ← Deploy, ולהעתיק את כתובת ה-Web app.
 */

var SHEET_ID = '1H-fk9fcI5bEAuOBZsXA_m2m-gV5rfsseqNFhWx4wl-o';
var SHEET_NAME = 'לידים';
var NOTIFY_TO = 'hadas@mixgroup.co.il';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var p = (e && e.parameter) || {};
    if (p.website) return out_({ ok: true }); // honeypot

    var clean = function (v) {
      v = String(v || '').trim().slice(0, 300);
      return /^[=+\-@]/.test(v) ? "'" + v : v; // הגנה מנוסחאות בגיליון
    };
    var row = [
      new Date(),
      clean(p.name), clean(p.phone), clean(p.email), clean(p.company),
      clean(p.utm_source), clean(p.utm_medium), clean(p.utm_campaign), clean(p.utm_content),
      clean(p.page)
    ];
    if (!row[1] || !row[2]) return out_({ ok: false });

    SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME).appendRow(row);

    var esc = function (v) { return String(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var html =
      '<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">' +
      '<h2 style="color:#E0005E;margin:0 0 12px">ליד חדש – toMix Card לעסקים</h2>' +
      '<table cellpadding="6" style="border-collapse:collapse">' +
      '<tr><td><b>שם:</b></td><td>' + esc(p.name) + '</td></tr>' +
      '<tr><td><b>טלפון:</b></td><td><a href="tel:' + esc(p.phone) + '">' + esc(p.phone) + '</a></td></tr>' +
      '<tr><td><b>מייל:</b></td><td><a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a></td></tr>' +
      '<tr><td><b>חברה:</b></td><td>' + esc(p.company) + '</td></tr>' +
      '<tr><td><b>מקור:</b></td><td>' + esc([p.utm_source, p.utm_medium, p.utm_campaign].filter(String).join(' / ') || 'ישיר') + '</td></tr>' +
      '</table>' +
      '<p style="margin-top:16px"><a href="https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit">לטבלת כל הלידים</a></p>' +
      '</div>';

    var mail = {
      to: NOTIFY_TO,
      subject: 'ליד חדש – toMix Card לעסקים: ' + (p.company || p.name),
      htmlBody: html,
      name: 'toMix Card לעסקים'
    };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email || '')) mail.replyTo = p.email;
    MailApp.sendEmail(mail);

    return out_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return out_({ ok: true, service: 'tomix-card-leads' });
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** להרצה ידנית פעם אחת מתוך העורך – מאשר הרשאות ושולח ליד בדיקה */
function testLead() {
  doPost({ parameter: { name: 'ליד בדיקה', phone: '050-0000000', email: 'test@example.com', company: 'בדיקה בע"מ', page: 'test' } });
}
