import express from 'express';
import { google } from 'googleapis';

const router = express.Router();

// Initialize Google Sheets API client
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

// Create Google Sheets instance
const sheets = google.sheets({ version: 'v4' });

router.get('/', async (req, res) => {
  try {
    // Get auth client
    const authClient = await auth.getClient();
    
    // Get the sheet data
    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId: process.env.GOOGLE_SHEETS_SHEET_ID,
      range: req.query.range || 'CR3!A:C', // Using CR3 as the sheet name from your error
    });

    res.json({
      status: 'success',
      data: response.data.values
    });

  } catch (error) {
    console.error('Google Sheets API Error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString(),
      path: req.path,
      sheetId: process.env.GOOGLE_SHEETS_SHEET_ID,
      sheetName: req.query.range || 'CR3'
    });
  }
});

// Add a test endpoint to verify credentials
router.get('/test', async (req, res) => {
  try {
    const authClient = await auth.getClient();
    res.json({
      status: 'success',
      message: 'Authentication successful',
      clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      sheetId: process.env.GOOGLE_SHEETS_SHEET_ID
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
