const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Google Sheets API Backend', 
    status: 'Running',
    endpoints: ['/sheet-data', '/debug-credentials']
  });
});

// Debug route to check credentials
app.get('/debug-credentials', (req, res) => {
  res.json({
    sheetId: process.env.GOOGLE_SHEET_ID ? 'Present' : 'Missing',
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'Present' : 'Missing',
    privateKeyLength: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.length : 'Missing',
  });
});

// Sheet data route
app.get('/sheet-data', async (req, res) => {
  try {
    // Validate environment variables
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('Google Sheet ID is not configured');
    }
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('Google Service Account Email is not configured');
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('Google Private Key is not configured');
    }

    // Initialize the document
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
    
    // Process private key to handle potential newline issues
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      .replace(/\\n/g, '\n')
      .replace(/^"/, '')
      .replace(/"$/, '');

    // Authenticate with service account credentials
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey
    });
    
    // Load sheet information
    await doc.loadInfo();
    
    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];
    
    // Fetch rows
    const rows = await sheet.getRows();
    
    // Return raw data
    res.json(rows.map(row => row._rawData));
  } catch (error) {
    console.error('Error in /sheet-data:', error);
    
    // Detailed error response
    res.status(500).json({ 
      error: 'Failed to fetch sheet data', 
      message: error.message,
      details: {
        name: error.name,
        stack: error.stack
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});
