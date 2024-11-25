import { GoogleSpreadsheet } from 'google-spreadsheet';
import { readFile } from 'fs/promises';

export async function getSheetService() {
  try {
    const credentials = JSON.parse(
      await readFile(new URL('../../credentials.json', import.meta.url))
    );
    console.log('✓ Credentials loaded successfully');
    console.log('🔑 Service Account Email:', credentials.client_email);
    return credentials;
  } catch (error) {
    console.error('❌ Error loading credentials:', error);
    throw new Error(`Failed to load credentials: ${error.message}`);
  }
}

export async function getSheetData(sheetId, sheetName) {
  console.log('\n🔄 Starting Google Sheets data retrieval...');
  console.log(`📑 Sheet ID: ${sheetId}`);
  console.log(`📘 Sheet Name: ${sheetName}\n`);

  try {
    const credentials = await getSheetService();
    
    const doc = new GoogleSpreadsheet(sheetId);
    console.log('🔐 Authenticating with Google...');
    await doc.useServiceAccountAuth(credentials);
    console.log('✓ Authentication successful');

    console.log('📂 Loading spreadsheet info...');
    await doc.loadInfo();
    console.log('✓ Spreadsheet loaded:', doc.title);

    const sheet = doc.sheetsByTitle[sheetName];
    if (!sheet) {
      console.error('❌ Available sheets:', Object.keys(doc.sheetsByTitle));
      throw new Error(`Sheet "${sheetName}" not found. Available sheets: ${Object.keys(doc.sheetsByTitle).join(', ')}`);
    }
    
    console.log(`✓ Found sheet: ${sheet.title}`);
    console.log(`📊 Row count: ${sheet.rowCount}`);
    console.log(`📊 Column count: ${sheet.columnCount}`);

    console.log('📥 Loading rows...');
    const rows = await sheet.getRows();
    console.log(`✓ Retrieved ${rows.length} rows of data`);

    const headers = sheet.headerValues;
    console.log('📋 Headers:', headers);

    const data = rows.map(row => row.toObject());
    console.log('✅ Data retrieval complete!\n');
    
    return data;
  } catch (error) {
    console.error('\n❌ Error in getSheetData:', {
      error: error.message,
      stack: error.stack,
      sheetId,
      sheetName
    });
    throw error;
  }
}
