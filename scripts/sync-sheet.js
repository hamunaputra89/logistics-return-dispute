import fs from 'fs';

const SPREADSHEET_ID = '1Pdhc1lFf6QQHWieC--IpvtkyP87lke5-EyrBmUH8pOk';
const SHEET_GID = '1021449465';
const EXPORT_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_GID}&_t=${Date.now()}`;

async function syncLatestSheetData() {
  console.log(`[Sync] Mengambil data terbaru dari Google Sheets (GID: ${SHEET_GID})...`);
  try {
    const res = await fetch(EXPORT_CSV_URL);
    if (!res.ok) {
      throw new Error(`Google Sheets mengembalikan status HTTP ${res.status}`);
    }
    const csvText = await res.text();
    if (!csvText || csvText.length < 500) {
      throw new Error('Data CSV kosong atau tidak valid.');
    }

    const lines = csvText.trim().split('\n');
    console.log(`[Sync] Berhasil mengunduh ${csvText.length.toLocaleString()} byte (${lines.length.toLocaleString()} baris data).`);

    const fileContent = `/**
 * Snapshot Data Resmi dari Google Sheets (GID: ${SHEET_GID})
 * Terakhir disinkronkan: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
 * Total Baris: ${lines.length}
 */
export const FALLBACK_CSV = ${JSON.stringify(csvText)};
`;

    fs.writeFileSync('src/data/fallbackData.ts', fileContent, 'utf8');
    console.log('[Sync] File src/data/fallbackData.ts berhasil diperbarui!');
  } catch (error) {
    console.error('[Sync Error]', error);
    process.exit(1);
  }
}

syncLatestSheetData();
