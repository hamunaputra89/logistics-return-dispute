import { ReturnRecord, SheetStats } from '../types/sheet';

export const SPREADSHEET_ID = '1Pdhc1lFf6QQHWieC--IpvtkyP87lke5-EyrBmUH8pOk';
export const SHEET_GID = '1021449465';
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}`;
export const EXPORT_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

let cachedSheetTitle: string | null = null;

/**
 * Robust CSV parser that handles quotes, escaped commas, newlines, and trailing lines.
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let inQuote = false;
  let cell = '';

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuote && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (c === ',' && !inQuote) {
      row.push(cell.trim());
      cell = '';
    } else if ((c === '\r' || c === '\n') && !inQuote) {
      if (c === '\r' && text[i + 1] === '\n') {
        i++;
      }
      row.push(cell.trim());
      if (row.some((val) => val.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += c;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((val) => val.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Determine Courier from waybill prefix
 */
export function detectCourier(resi: string, resiRetur: string): ReturnRecord['courier'] {
  const code = (resi || resiRetur || '').toUpperCase();
  if (code.startsWith('TG')) return 'Ninja';
  if (code.startsWith('JX')) return 'J&T';
  if (code.startsWith('SPX')) return 'Shopee Express';
  if (code.startsWith('JP')) return 'J&T Cargo';
  if (code) return 'Other';
  return 'Unknown';
}

/**
 * Categorize return / dispute case
 */
export function categorizeCase(updateCase: string, keterangan: string): ReturnRecord['categoryType'] {
  const combined = `${updateCase} ${keterangan}`.toLowerCase();
  
  if (
    combined.includes('tidak sesuai') ||
    combined.includes('minyak wangi') ||
    combined.includes('parfum') ||
    combined.includes('batu') ||
    combined.includes('kayu') ||
    combined.includes('cctv') ||
    combined.includes('jam tangan') ||
    combined.includes('box kosong') ||
    combined.includes('amplop') ||
    combined.includes('hp bekas') ||
    combined.includes('tanpa hp') ||
    combined.includes('lampu') ||
    combined.includes('sanggahan')
  ) {
    return 'fraud';
  }

  if (
    combined.includes('rusak') ||
    combined.includes('penyok') ||
    combined.includes('sobek') ||
    combined.includes('box rusak') ||
    combined.includes('dus')
  ) {
    return 'damage';
  }

  if (
    combined.includes('tidak segel') ||
    combined.includes('tdk segel') ||
    combined.includes('bad unit') ||
    combined.includes('segel')
  ) {
    return 'unsealed';
  }

  if (
    combined.includes('dp lain') ||
    combined.includes('tidak terima') ||
    combined.includes('terscan')
  ) {
    return 'courier_issue';
  }

  return 'normal';
}

/**
 * Transform raw CSV rows into structured ReturnRecord items
 */
export function transformRows(rawRows: string[][]): ReturnRecord[] {
  if (rawRows.length <= 1) return [];

  // Index 0 is header row
  const dataRows = rawRows.slice(1);
  const records: ReturnRecord[] = [];

  dataRows.forEach((row, idx) => {
    // Expected 18 columns
    const tanggal = row[0] || '';
    const resiRetur = row[1] || '';
    const dn = row[2] || '';
    const resiOriginal = row[3] || '';
    const sku = row[4] || '';
    const imei = row[5] || '';
    const sloc = row[6] || '';
    const docSanggahan = row[7] || '';
    const updateCase = row[8] || '';
    const keterangan = row[9] || '';
    const docHandover = row[10] || '';
    const noHo = row[11] || '';
    const notedApaKee = row[12] || '';
    const status = row[13] || '';
    const namaPacker = row[14] || '';
    const statusPrint = row[15] || '';
    const tglJamPacking = row[16] || '';
    const catatan = row[17] || '';

    // Ignore completely empty or repetitive header-like dummy rows
    if (!resiRetur && !resiOriginal && !updateCase && !dn && !sku) return;

    const courier = detectCourier(resiOriginal, resiRetur);
    const categoryType = categorizeCase(updateCase, keterangan);

    const isDriveLink = notedApaKee.includes('drive.google.com') || notedApaKee.startsWith('http');
    const isCctvFile = notedApaKee.toLowerCase().includes('.mp4') || notedApaKee.startsWith('D0');
    const hasEvidence = isDriveLink || isCctvFile || notedApaKee.length > 5;

    records.push({
      id: `row-${idx + 2}-${resiOriginal || resiRetur || idx}`,
      rowIndex: idx + 2,
      tanggal,
      resiRetur,
      dn,
      resiOriginal,
      sku,
      imei,
      sloc,
      docSanggahan,
      updateCase,
      keterangan,
      docHandover,
      noHo,
      notedApaKee,
      status: status || 'pending',
      namaPacker,
      statusPrint,
      tglJamPacking,
      catatan,
      courier,
      categoryType,
      hasEvidence,
      evidenceUrl: isDriveLink ? notedApaKee.trim() : undefined,
      isDriveLink,
      isCctvFile,
    });
  });

  return records;
}

/**
 * Fetch records from the live Google Sheet
 */
export async function fetchSheetData(accessToken?: string | null): Promise<{
  records: ReturnRecord[];
  sheetTitle: string;
  source: 'api' | 'csv';
}> {
  // If we have an OAuth token, we can first discover the sheet title via Sheets API v4
  if (accessToken) {
    try {
      const metaRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (metaRes.ok) {
        const meta = await metaRes.json();
        const sheetList = meta.sheets || [];
        const targetSheet =
          sheetList.find((s: any) => String(s.properties?.sheetId) === String(SHEET_GID)) ||
          sheetList[0];

        if (targetSheet?.properties?.title) {
          cachedSheetTitle = targetSheet.properties.title;
        }

        const title = cachedSheetTitle || 'Sheet1';
        const valuesRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(title)}!A1:R2000`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (valuesRes.ok) {
          const valuesData = await valuesRes.json();
          const rawRows: string[][] = valuesData.values || [];
          const records = transformRows(rawRows);
          return { records, sheetTitle: title, source: 'api' };
        }
      }
    } catch (err) {
      console.warn('Google Sheets API v4 call failed, falling back to export CSV:', err);
    }
  }

  // Fallback to live public CSV export (always fresh with cache buster)
  const timestamp = Date.now();
  const res = await fetch(`${EXPORT_CSV_URL}&_t=${timestamp}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to load sheet data: HTTP ${res.status}`);
  }

  const csvText = await res.text();
  const rawRows = parseCSV(csvText);
  const records = transformRows(rawRows);

  return {
    records,
    sheetTitle: cachedSheetTitle || 'SEMARANG - SANGGAHAN',
    source: 'csv',
  };
}

/**
 * Append a new record directly to the Google Sheet via Sheets API v4
 */
export async function appendSheetRecord(
  record: Omit<ReturnRecord, 'id' | 'rowIndex' | 'courier' | 'categoryType' | 'hasEvidence' | 'isDriveLink' | 'isCctvFile'>,
  accessToken: string
): Promise<{ success: boolean; updatedRange?: string }> {
  // Ensure we know the sheet title
  let title = cachedSheetTitle;
  if (!title) {
    try {
      const metaRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (metaRes.ok) {
        const meta = await metaRes.json();
        const sheetList = meta.sheets || [];
        const targetSheet =
          sheetList.find((s: any) => String(s.properties?.sheetId) === String(SHEET_GID)) ||
          sheetList[0];
        if (targetSheet?.properties?.title) {
          title = targetSheet.properties.title;
          cachedSheetTitle = title;
        }
      }
    } catch {
      // ignore
    }
  }

  const rangeTarget = title ? `${encodeURIComponent(title)}!A:R` : 'A:R';

  // Format 18 columns
  const rowValues = [
    record.tanggal || new Date().toLocaleDateString('en-US'),
    record.resiRetur || '',
    record.dn || '',
    record.resiOriginal || '',
    record.sku || '',
    record.imei || '',
    record.sloc || '1655',
    record.docSanggahan || '',
    record.updateCase || '',
    record.keterangan || '',
    record.docHandover || '',
    record.noHo || '',
    record.notedApaKee || '',
    record.status || 'done',
    record.namaPacker || '',
    record.statusPrint || 'Success',
    record.tglJamPacking || new Date().toLocaleString('en-US'),
    record.catatan || '',
  ];

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${rangeTarget}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Google Sheets API Error (${res.status}): Failed to append row`
    );
  }

  const data = await res.json();
  return { success: true, updatedRange: data?.updates?.updatedRange };
}

/**
 * Calculate KPI summary & analytical statistics
 */
export function computeSheetStats(records: ReturnRecord[]): SheetStats {
  let doneCount = 0;
  let pendingCount = 0;
  let fraudCount = 0;
  let damageCount = 0;
  let unsealedCount = 0;
  let courierIssueCount = 0;
  let hasEvidenceCount = 0;
  let handoverDocCount = 0;

  const courierCounts: { [key: string]: number } = {
    Ninja: 0,
    'J&T': 0,
    'Shopee Express': 0,
    'J&T Cargo': 0,
    Other: 0,
  };

  const slocCounts: { [key: string]: number } = {};
  const packerCounts: { [key: string]: number } = {};
  const caseMap: { [key: string]: { count: number; category: string } } = {};
  const dailyMap: { [key: string]: number } = {};

  records.forEach((r) => {
    // Status
    if (r.status.toLowerCase().includes('done')) {
      doneCount++;
    } else {
      pendingCount++;
    }

    // Categories
    if (r.categoryType === 'fraud') fraudCount++;
    else if (r.categoryType === 'damage') damageCount++;
    else if (r.categoryType === 'unsealed') unsealedCount++;
    else if (r.categoryType === 'courier_issue') courierIssueCount++;

    // Evidence
    if (r.hasEvidence) hasEvidenceCount++;

    // Handover
    if (r.docHandover && r.docHandover !== 'Tidak ditemukan' && r.docHandover.length > 2) {
      handoverDocCount++;
    }

    // Couriers
    if (courierCounts[r.courier] !== undefined) {
      courierCounts[r.courier]++;
    } else {
      courierCounts.Other++;
    }

    // Sloc
    const slocKey = r.sloc && r.sloc !== 'Tidak ditemukan' ? r.sloc : 'Unassigned';
    slocCounts[slocKey] = (slocCounts[slocKey] || 0) + 1;

    // Packer
    if (r.namaPacker && r.namaPacker !== 'Tidak ditemukan') {
      packerCounts[r.namaPacker] = (packerCounts[r.namaPacker] || 0) + 1;
    }

    // Cases
    if (r.updateCase && r.updateCase !== 'Tidak ditemukan' && r.updateCase.length > 1) {
      const cleanCase = r.updateCase
        .replace(/^done\s+submit\.\s*/i, '')
        .replace(/^done\s+satu\.\s*/i, '')
        .replace(/^done\s+daily\.\s*/i, '')
        .trim();
      const key = cleanCase.toLowerCase();
      if (!caseMap[key]) {
        caseMap[key] = { count: 0, category: r.categoryType };
      }
      caseMap[key].count++;
    }

    // Date
    if (r.tanggal && r.tanggal !== 'Tanggal' && r.tanggal !== 'Tidak ditemukan') {
      // Standardize date label
      dailyMap[r.tanggal] = (dailyMap[r.tanggal] || 0) + 1;
    }
  });

  const topCases = Object.entries(caseMap)
    .map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count: data.count,
      category: data.category,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Parse and sort daily trends chronologically
  const dailyTrends = Object.entries(dailyMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => {
      const da = new Date(a.date).getTime() || 0;
      const db = new Date(b.date).getTime() || 0;
      return da - db;
    });

  return {
    total: records.length,
    doneCount,
    pendingCount,
    fraudCount,
    damageCount,
    unsealedCount,
    courierIssueCount,
    hasEvidenceCount,
    handoverDocCount,
    courierCounts,
    slocCounts,
    packerCounts,
    topCases,
    dailyTrends,
  };
}
