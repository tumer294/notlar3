// Bu dosyayı Google Apps Script editöründe kullanın
// script.google.com adresine gidin ve yeni bir proje oluşturun

const SPREADSHEET_ID = '1TMuX31dbctN4osdQtBvKDV_i8GTOHFr0dz3P9X1cwRo'; // Bu ID'yi kendi Google Sheets belgenizin ID'si ile değiştirin
const SHEET_NAME = 'notlar';

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : null;
  
  try {
    switch (action) {
      case 'getAllNotes':
        const notes = getAllNotes();
        return ContentService
          .createTextOutput(JSON.stringify({ notes: notes }))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
      
      case 'testConnection':
        return ContentService
          .createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
      
      case null:
      case undefined:
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'No action parameter provided' }))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
      
      default:
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Invalid action' }))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
    }
  } catch (error) {
    console.error('doGet error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString(), stack: error.stack }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

function doPost(e) {
  try {
    const data = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const action = data.action;
    
    switch (action) {
      case 'addNote':
        const addResult = addNote(data.note);
        return ContentService
          .createTextOutput(JSON.stringify({ success: addResult }))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
      
      case 'updateNote':
        const updateResult = updateNote(data.noteId, data.note);
        return ContentService
          .createTextOutput(JSON.stringify({ success: updateResult }))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
      
      case 'deleteNote':
        const deleteResult = deleteNote(data.noteId);
        return ContentService
          .createTextOutput(JSON.stringify({ success: deleteResult }))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
      
      case 'initializeSheet':
        const initResult = initializeSheet();
        return ContentService
          .createTextOutput(JSON.stringify({ success: initResult }))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
      
      default:
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Invalid action' }))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
    }
  } catch (error) {
    console.error('doPost error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString(), stack: error.stack }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

function getAllNotes() {
  try {
    console.log('Getting all notes from spreadsheet:', SPREADSHEET_ID);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.error('Sheet not found:', SHEET_NAME);
      throw new Error(`Sheet '${SHEET_NAME}' not found`);
    }
    
    const data = sheet.getDataRange().getValues();
    console.log('Data retrieved, rows:', data.length);
    
    if (data.length <= 1) {
      return [];
    }
    
    // Skip header row and convert to objects
    return data.slice(1)
      .filter(row => row[0]) // Filter out empty rows
      .map(row => ({
        id: row[0] || '',
        title: row[1] || '',
        content: row[2] || '',
        category: row[3] || 'Genel',
        tags: row[4] || '',
        createdAt: row[5] || new Date().toISOString(),
        updatedAt: row[6] || new Date().toISOString(),
        isPinned: row[7] || 'false'
      }));
  } catch (error) {
    console.error('Error getting all notes:', error);
    throw error;
  }
}

function addNote(note) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // Initialize sheet if needed
    if (sheet.getLastRow() === 0) {
      initializeSheet();
    }
    
    const values = [
      note.id,
      note.title,
      note.content,
      note.category,
      note.tags,
      note.createdAt,
      note.updatedAt,
      note.isPinned
    ];
    
    sheet.appendRow(values);
    return true;
  } catch (error) {
    console.error('Error adding note:', error);
    return false;
  }
}

function updateNote(noteId, updatedNote) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Find the row index (skip header)
    const rowIndex = data.findIndex((row, index) => index > 0 && row[0] === noteId);
    
    if (rowIndex === -1) {
      return false;
    }
    
    const actualRowIndex = rowIndex + 1; // Convert to 1-based index
    
    const values = [
      updatedNote.id,
      updatedNote.title,
      updatedNote.content,
      updatedNote.category,
      updatedNote.tags,
      updatedNote.createdAt,
      updatedNote.updatedAt,
      updatedNote.isPinned
    ];
    
    const range = sheet.getRange(actualRowIndex, 1, 1, 8);
    range.setValues([values]);
    
    return true;
  } catch (error) {
    console.error('Error updating note:', error);
    return false;
  }
}

function deleteNote(noteId) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Find the row index (skip header)
    const rowIndex = data.findIndex((row, index) => index > 0 && row[0] === noteId);
    
    if (rowIndex === -1) {
      return false;
    }
    
    const actualRowIndex = rowIndex + 1; // Convert to 1-based index
    sheet.deleteRow(actualRowIndex);
    
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    return false;
  }
}

function initializeSheet() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // Check if headers already exist
    if (sheet.getLastRow() > 0) {
      const headers = sheet.getRange(1, 1, 1, 8).getValues()[0];
      if (headers[0] === 'ID' || headers[0] === 'id') {
        return true; // Headers already exist
      }
    }
    
    // Add headers
    const headers = ['ID', 'Başlık', 'İçerik', 'Kategori', 'Etiketler', 'Oluşturulma', 'Güncellenme', 'Sabitlenmiş'];
    sheet.getRange(1, 1, 1, 8).setValues([headers]);
    
    return true;
  } catch (error) {
    console.error('Error initializing sheet:', error);
    return false;
  }
}