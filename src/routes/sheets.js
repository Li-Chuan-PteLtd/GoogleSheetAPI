import express from 'express';
import { getSheetData } from '../service/googleSheet.js';
import { SHEET_CONFIG } from '../config/sheets.js';

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('📝 Received request for default sheet');
  try {
    const data = await getSheetData(
      SHEET_CONFIG.defaultSheetId,
      SHEET_CONFIG.defaultSheetName
    );
    console.log(`✓ Successfully retrieved ${data.length} records`);
    res.json(data);
  } catch (error) {
    console.error('❌ Error in default route:', error.message);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString(),
      path: '/',
      sheetId: SHEET_CONFIG.defaultSheetId,
      sheetName: SHEET_CONFIG.defaultSheetName
    });
  }
});

router.get('/:sheetId/:sheetName', async (req, res) => {
  const { sheetId, sheetName } = req.params;
  console.log(`📝 Received request for sheet: ${sheetName} (${sheetId})`);
  try {
    const data = await getSheetData(sheetId, sheetName);
    console.log(`✓ Successfully retrieved ${data.length} records`);
    res.json(data);
  } catch (error) {
    console.error('❌ Error in dynamic route:', error.message);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString(),
      path: `/${sheetId}/${sheetName}`,
      sheetId,
      sheetName
    });
  }
});

export default router;
