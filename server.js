
const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
// Add a root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Google Sheets API Backend', 
    status: 'Running',
    endpoints: ['/sheet-data']
  });
});
app.get('/sheet-data', async (req, res) => {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

    // Authenticate with service account credentials from environment variables
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    res.json(rows.map(row => row._rawData));
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    res.status(500).json({ error: 'Failed to fetch sheet data', details: error.message });
  }
});
app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});
