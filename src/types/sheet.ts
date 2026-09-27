export interface ReturnRecord {
  id: string; // unique ID generated for row tracking
  rowIndex: number; // 1-indexed row number in the spreadsheet
  tanggal: string; // Col 0: Tanggal (e.g. "4/8/2026", "9/24/2026")
  resiRetur: string; // Col 1: Resi Retur (e.g. "RTSRG26034999357", "JX4524702311")
  dn: string; // Col 2: DN (Delivery Note, e.g. "4177354522")
  resiOriginal: string; // Col 3: Resi Original (e.g. "TG3579914036", "JX3929722651")
  sku: string; // Col 4: SKU (e.g. "X6879-GLD-256/8", "XP06-GRY")
  imei: string; // Col 5: IMEI (e.g. "358541740578456")
  sloc: string; // Col 6: Sloc (e.g. "1655", "1653")
  docSanggahan: string; // Col 7: Doc Sanggahan
  updateCase: string; // Col 8: Update Case (e.g. "Isi Tidak Sesuai", "dus sobek", "isi minyak wangi")
  keterangan: string; // Col 9: KETERANGAN
  docHandover: string; // Col 10: Doc Handover (e.g. "HO-20260730-D447D")
  noHo: string; // Col 11: NO HO (e.g. "108", "102")
  notedApaKee: string; // Col 12: Noted apa kee (CCTV file e.g. "D01_20250707164321.mp4" or Drive URL)
  status: string; // Col 13: Status (e.g. "done", "daily", "submit email")
  namaPacker: string; // Col 14: Nama Packer (e.g. "Lukman Hakim", "Reza")
  statusPrint: string; // Col 15: Status Print (e.g. "Success")
  tglJamPacking: string; // Col 16: Tgl & Jam Packing (e.g. "7/30/2026 14:42:58")
  catatan: string; // Col 17: catatan
  
  // Computed helpers
  courier: 'JNE' | 'J&T' | 'Shopee Express' | 'J&T Cargo' | 'Other' | 'Unknown';
  categoryType: 'fraud' | 'damage' | 'unsealed' | 'courier_issue' | 'normal' | 'other';
  hasEvidence: boolean;
  evidenceUrl?: string;
  isDriveLink: boolean;
  isCctvFile: boolean;
  isDocSanggahanLink?: boolean;
  isDocSanggahanVideoFile?: boolean;
  docSanggahanUrl?: string;
  docSanggahanEmbedUrl?: string;
}

export type CategoryFilter = 'all' | 'fraud' | 'damage' | 'unsealed' | 'courier_issue' | 'normal';
export type CourierFilter = 'all' | 'JNE' | 'J&T' | 'Shopee Express' | 'Other';
export type SlocFilter = 'all' | '1655' | '1653' | 'other';
export type StatusFilter = 'all' | 'done' | 'pending';

export interface SheetStats {
  total: number;
  doneCount: number;
  pendingCount: number;
  fraudCount: number;
  damageCount: number;
  unsealedCount: number;
  courierIssueCount: number;
  hasEvidenceCount: number;
  handoverDocCount: number;
  onProsesCount: number;
  courierCounts: { [key: string]: number };
  slocCounts: { [key: string]: number };
  packerCounts: { [key: string]: number };
  topCases: { name: string; count: number; category: string }[];
  dailyTrends: { date: string; count: number }[];
}
