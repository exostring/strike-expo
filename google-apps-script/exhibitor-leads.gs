const SHEET_NAME = 'Заявки экспонентов';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'strike-expo-leads' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = getLeadSheet_();
  const data = JSON.parse(e.postData.contents || '{}');

  sheet.appendRow([
    new Date(),
    data.name || '',
    normalizePhoneForSheet_(data.phone),
    contactMethodLabel_(data.contactMethod),
    data.page || '',
    data.userAgent || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getLeadSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Дата',
      'Имя',
      'Телефон',
      'Способ связи',
      'Страница',
      'User Agent'
    ]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function contactMethodLabel_(value) {
  const labels = {
    call: 'Звонок',
    telegram: 'Telegram',
    max: 'MAX',
    whatsapp: 'WhatsApp'
  };
  return labels[value] || 'Звонок';
}

function normalizePhoneForSheet_(value) {
  return String(value || '').replace(/^\+/, '');
}

function testWrite() {
  return doPost({
    postData: {
      contents: JSON.stringify({
        name: 'Тест Apps Script',
        phone: '+7 (999) 000-00-00',
        contactMethod: 'call',
        page: 'manual test',
        userAgent: 'Apps Script'
      })
    }
  });
}
