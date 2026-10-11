export interface ReturnRecord {
  id: string; // unique ID generated for row tracking
  rowIndex: number; // 1-indexed row number in the spreadsheet
  tanggal: string; // Tanggal (e.g. "10/10/2026", "9/24/2026")
  orderId: string; // Marketplace Order ID (e.g. "586302135505749200")
  resiRetur: string; // Resi Retur (e.g. "RTSRG26034999357", "JX4524702311")
  dn: string; // DN (Delivery Note, e.g. "4177354522")
  resiOriginal: string; // Resi Original (e.g. "TG3579914036", "JX3929722651")
  sku: string; // SKU (e.g. "X6840-BLK-256/4", "X6879-GLD-256/8")
  imei: string; // IMEI / Serial (e.g. "000353141150083611")
  sloc: string; // Sloc (e.g. "1655", "1653")
  receivedKetUnit: string; // Received / KET UNIT (Keluhan barang retur, e.g. "user info menerima paket isi sabun", "dus penyok")
  docSanggahan: string; // Doc Sanggahan
  updateCase: string; // Update Case (e.g. "done", "ancol", "Isi Tidak Sesuai")
  keterangan: string; // KETERANGAN
  docHandover: string; // Doc Handover (e.g. "HO-20260730-D447D")
  noHo: string; // NO HO (e.g. "108", "102")
  notedApaKee: string; // Noted apa kee (CCTV file e.g. "D01_20250707164321.mp4" or Drive URL)
  status: string; // Status (e.g. "done", "pending")
  deletedLinkSanggah?: string; // Deleted link sanggah
  namaPacker: string; // Nama Packer (e.g. "Krisna Maulana", "Lukman Hakim", "Hery")
  statusPrint: string; // Status Print (e.g. "Success")
  tglJamPacking: string; // Tgl & Jam Packing (e.g. "2026-10-03 10:20:52")
  catatan: string; // Catatan
  
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
