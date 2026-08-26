const SHEET_NAME = 'Заявки экспонентов';
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1bi0XBiBy5ecQT0GBw_txJl3B9Iqn0hVAKjlyC09VLRE';
const TELEGRAM_BOT_TOKEN = '8905480869:AAGozqhW_YeDK4UqTEeSjeblqDJCIQwXhdI';
const TELEGRAM_CHAT_IDS = ['442509142', '383125035', '1106530859'];

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

  const notification = notifyTelegramRecipients_(data);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, telegramSent: notification.ok, telegramError: notification.error || '' }))
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

function notifyTelegramRecipients_(data) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const spreadsheetUrl = spreadsheet ? spreadsheet.getUrl() : SPREADSHEET_URL;
  const message = [
    'Получена новая заявка',
    `Имя: ${data.name || '-'}`,
    `Телефон: ${data.phone || '-'}`,
    `Таблица: ${spreadsheetUrl || SPREADSHEET_URL}`
  ].join('\n');
  const errors = [];

  TELEGRAM_CHAT_IDS.forEach((chatId) => {
    try {
      const response = UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          chat_id: chatId,
          text: message,
          disable_web_page_preview: true
        }),
        muteHttpExceptions: true
      });

      if (response.getResponseCode() !== 200) {
        errors.push(`${chatId}: ${response.getContentText()}`);
      }
    } catch (error) {
      errors.push(`${chatId}: ${String(error && error.message ? error.message : error)}`);
    }
  });

  if (errors.length) {
    console.error(`Telegram notification errors: ${errors.join(' | ')}`);
  } else {
    console.log('Telegram lead notification sent');
  }

  return { ok: errors.length < TELEGRAM_CHAT_IDS.length, error: errors.join(' | ') };
}

function testNotify() {
  return notifyTelegramRecipients_({
    name: 'Тест Apps Script',
    phone: '+7 (999) 000-00-00'
  });
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
