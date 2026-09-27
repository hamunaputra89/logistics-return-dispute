import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReturnRecord } from '../types/sheet';
import { detectCourier, categorizeCase } from '../services/sheetService';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newRecord: Omit<ReturnRecord, 'id' | 'rowIndex' | 'courier' | 'categoryType' | 'hasEvidence' | 'isDriveLink' | 'isCctvFile' | 'isDocSanggahanLink' | 'docSanggahanUrl' | 'docSanggahanEmbedUrl'>) => Promise<void>;
  hasGoogleToken: boolean;
  isSubmitting: boolean;
  onLoginGoogle?: () => void;
}

const COMMON_PACKERS = [
  'Lukman Hakim',
  'Krisna Maulana',
  'Kholis',
  'Hery',
  'Nando',
  'Reza',
  'Birul',
  'Admin Satria',
];

const PRESET_CASES = [
  '(Isi Tidak Sesuai)',
  'done submit. bad unit tdk segel',
  'done submit. box rusak',
  'dus penyok',
  'hanya box kosong',
  'done submit. isi batu',
  'isi minyak wangi',
  'resi terscan di DP lain',
  'box sobek',
];

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  hasGoogleToken,
  isSubmitting,
  onLoginGoogle,
}) => {
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  const timestampStr = `${today.toLocaleDateString('en-US')} ${today.toLocaleTimeString('en-US')}`;

  const [form, setForm] = useState({
    tanggal: dateStr,
    resiRetur: '',
    dn: '',
    resiOriginal: '',
    sku: '',
    imei: '',
    sloc: '1655',
    docSanggahan: 'On Proses',
    updateCase: '',
    keterangan: '',
    docHandover: '',
    noHo: '',
    notedApaKee: '',
    status: 'done',
    namaPacker: 'Lukman Hakim',
    statusPrint: 'Success',
    tglJamPacking: timestampStr,
    catatan: '',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateHandover = () => {
    const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(
      today.getDate()
    ).padStart(2, '0')}`;
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    setForm((prev) => ({
      ...prev,
      docHandover: `HO-${ymd}-${rand}`,
    }));
  };

  const handleApplyPresetCase = (preset: string) => {
    setForm((prev) => ({
      ...prev,
      updateCase: preset,
    }));
  };

  const detectedCourier = detectCourier(form.resiOriginal, form.resiRetur);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.resiOriginal && !form.resiRetur) {
      setErrorMsg('Wajib mengisi minimal salah satu antara Resi Original atau Resi Retur.');
      return;
    }

    try {
      await onSubmit({
        tanggal: form.tanggal || dateStr,
        resiRetur: form.resiRetur.trim(),
        dn: form.dn.trim(),
        resiOriginal: form.resiOriginal.trim(),
        sku: form.sku.trim(),
        imei: form.imei.trim(),
        sloc: form.sloc || '1655',
        docSanggahan: form.docSanggahan.trim() || 'On Proses',
        updateCase: form.updateCase.trim(),
        keterangan: form.keterangan.trim(),
        docHandover: form.docHandover.trim(),
        noHo: form.noHo.trim(),
        notedApaKee: form.notedApaKee.trim(),
        status: form.status || 'done',
        namaPacker: form.namaPacker.trim(),
        statusPrint: form.statusPrint || 'Success',
        tglJamPacking: form.tglJamPacking || timestampStr,
        catatan: form.catatan.trim(),
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data ke Google Sheets');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150 my-6"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Input Data Retur & Sanggahan Baru
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Data akan langsung ditambahkan ke Google Sheets tab{' '}
                <strong className="text-slate-700">SEMARANG - SANGGAHAN</strong> dan terupdate otomatis di dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Integration Status Badge */}
        <div className="px-6 py-2.5 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-medium">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Target Google Sheets:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-700">
              gid: 1021449465
            </span>
          </div>

          {hasGoogleToken ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tersambung Google Sheets API
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-amber-800">
                Belum login Google
              </span>
              {onLoginGoogle && (
                <button
                  type="button"
                  onClick={onLoginGoogle}
                  className="text-[11px] font-bold text-blue-700 underline hover:text-blue-900"
                >
                  Login sekarang
                </button>
              )}
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Resi & Identitas Pengiriman */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                1. Nomor Resi & Dokumen Pengiriman
              </h4>
              {detectedCourier !== 'Unknown' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  Terdeteksi: {detectedCourier}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Resi Original <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TG3579914036 / JX5036719078"
                  value={form.resiOriginal}
                  onChange={(e) => setForm({ ...form, resiOriginal: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Resi Retur
                </label>
                <input
                  type="text"
                  placeholder="Contoh: RTSRG26034999357"
                  value={form.resiRetur}
                  onChange={(e) => setForm({ ...form, resiRetur: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Delivery Note (DN)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 4177354522"
                  value={form.dn}
                  onChange={(e) => setForm({ ...form, dn: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: SKU, IMEI & Sloc */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              2. Unit Hardware & Lokasi Gudang
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  SKU Produk
                </label>
                <input
                  type="text"
                  placeholder="Contoh: X6879-GLD-256/8"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  IMEI / Serial Number
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 358541740578456 atau NO SN"
                  value={form.imei}
                  onChange={(e) => setForm({ ...form, imei: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Lokasi Sloc Gudang
                </label>
                <select
                  value={form.sloc}
                  onChange={(e) => setForm({ ...form, sloc: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="1655">1655 - Gudang Retur Reguler</option>
                  <option value="1653">1653 - Sanggahan & Unit Rusak</option>
                  <option value="Lainnya">Lainnya / Area Khusus</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Kasus Sanggahan & Keterangan */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              3. Kasus Sanggahan & Kondisi Paket
            </h4>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="text-[11px] text-slate-400 py-1">Pilih cepat:</span>
              {PRESET_CASES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPresetCase(preset)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 rounded-lg text-[10px] font-medium transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Update Case (Kasus) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: (Isi Tidak Sesuai) atau dus penyok"
                  value={form.updateCase}
                  onChange={(e) => setForm({ ...form, updateCase: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Keterangan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Catatan kendala atau keluhan buyer..."
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Handover Serah Terima & Bukti CCTV/Drive */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              4. Dokumen Sanggahan, Serah Terima & Bukti CCTV
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Doc Sanggahan
                </label>
                <input
                  type="text"
                  placeholder="On Proses (default)"
                  value={form.docSanggahan}
                  onChange={(e) => setForm({ ...form, docSanggahan: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-medium">Doc Handover</label>
                  <button
                    type="button"
                    onClick={handleGenerateHandover}
                    className="text-[10px] font-bold text-blue-600 hover:underline"
                  >
                    Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Contoh: HO-20260926-XXXX"
                  value={form.docHandover}
                  onChange={(e) => setForm({ ...form, docHandover: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  NO HO (Nomor Batch)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 108 atau 156"
                  value={form.noHo}
                  onChange={(e) => setForm({ ...form, noHo: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Bukti CCTV / Link Drive
                </label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/... atau D01_...mp4"
                  value={form.notedApaKee}
                  onChange={(e) => setForm({ ...form, notedApaKee: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Petugas Packer & Status */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              5. Petugas Packing & Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Tanggal Pencatatan
                </label>
                <input
                  type="text"
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Nama Packer
                </label>
                <input
                  type="text"
                  list="packer-list"
                  value={form.namaPacker}
                  onChange={(e) => setForm({ ...form, namaPacker: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
                <datalist id="packer-list">
                  {COMMON_PACKERS.map((p, i) => (
                    <option key={i} value={p} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="done">done (Selesai)</option>
                  <option value="daily">daily (Harian)</option>
                  <option value="submit email">submit email</option>
                  <option value="ancol">ancol</option>
                  <option value="pending">pending</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Status Print
                </label>
                <select
                  value={form.statusPrint}
                  onChange={(e) => setForm({ ...form, statusPrint: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Success">Success</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
            <p className="text-slate-500 text-[11px]">
              {hasGoogleToken
                ? 'Data akan ditulis ke Google Sheets dengan akun Google Anda dan diverifikasi sebelum dikirim.'
                : 'Belum terhubung Google Sheets API: Data akan langsung disimpan di sesi realtime & dashboard.'}
            </p>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan ke Sheets...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Simpan & Sinkronkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
