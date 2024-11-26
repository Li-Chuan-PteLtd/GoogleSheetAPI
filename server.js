const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Route to fetch data from Google Sheet
app.get('/sheet-data', async (req, res) => {
  try {
    // Load the service account credentials
    const creds = require('./credentials/service-account.json');
    
    // Create a document instance
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
    
    // Authenticate with service account
    await doc.useServiceAccountAuth(creds);
    
    // Load the document
    await doc.loadInfo();
    
    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];
    
    // Fetch rows
    const rows = await sheet.getRows();
    
    // Return rows as JSON
    res.json(rows.map(row => row._rawData));
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    res.status(500).json({ error: 'Failed to fetch sheet data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
