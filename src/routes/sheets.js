import express from 'express';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Initialize the sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SHEET_ID);

    // Authenticate
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    });

    // Load the document properties and sheets
    await doc.loadInfo();

    // Get the sheet named 'CR3' or the first sheet if CR3 doesn't exist
    const sheet = doc.sheetsByTitle['CR3'] || doc.sheetsByIndex[0];
    
    // Load all rows
    const rows = await sheet.getRows();

    // Convert rows to a more manageable format
    const data = rows.map(row => {
      // Get the header row (column titles)
      const headers = sheet.headerValues;
      let rowData = {};
      headers.forEach(header => {
        rowData[header] = row[header];
      });
      return rowData;
    });

    res.json({
      status: 'success',
      sheetTitle: sheet.title,
      rowCount: rows.length,
      data: data
    });

  } catch (error) {
    console.error('Google Sheets API Error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString(),
      path: req.path,
      sheetId: process.env.GOOGLE_SHEETS_SHEET_ID
    });
  }
});

// Add a test endpoint to verify credentials
router.get('/test', async (req, res) => {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SHEET_ID);
    
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();

    res.json({
      status: 'success',
      message: 'Authentication successful',
      documentTitle: doc.title,
      sheetCount: doc.sheetCount,
      sheets: doc.sheetsByIndex.map(sheet => ({
        title: sheet.title,
        index: sheet.index,
        rowCount: sheet.rowCount,
        columnCount: sheet.columnCount
      }))
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
