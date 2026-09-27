import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Video,
  PackageCheck,
  Building2,
  Calendar,
  UserCheck,
  FileSpreadsheet,
  AlertOctagon,
  ShieldAlert,
  Play,
} from 'lucide-react';
import { ReturnRecord } from '../types/sheet';

interface RecordDetailModalProps {
  record: ReturnRecord | null;
  onClose: () => void;
  onPlayVideo?: (videoUrl: string, record: ReturnRecord, label?: string) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({ record, onClose, onPlayVideo }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!record) return null;

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const isDone = record.status.toLowerCase().includes('done');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150 my-6"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {record.resiOriginal || record.resiRetur || `Row #${record.rowIndex}`}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {record.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Baris Spreadsheet #{record.rowIndex} • Kurir: {record.courier} • Tanggal: {record.tanggal || 'N/A'}
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section 1: Identifikasi Pengiriman & Nomor Resi */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Informasi Resi & Dokumen
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block mb-1">Resi Original (Asli)</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {record.resiOriginal || '-'}
                  </span>
                  {record.resiOriginal && (
                    <button
                      onClick={() => handleCopy('resiOriginal', record.resiOriginal)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                      title="Salin Resi Original"
                    >
                      {copiedField === 'resiOriginal' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block mb-1">Resi Retur (Kembali)</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {record.resiRetur || '-'}
                  </span>
                  {record.resiRetur && (
                    <button
                      onClick={() => handleCopy('resiRetur', record.resiRetur)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                      title="Salin Resi Retur"
                    >
                      {copiedField === 'resiRetur' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block mb-1">Delivery Note (DN)</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">
                    {record.dn || '-'}
                  </span>
                  {record.dn && (
                    <button
                      onClick={() => handleCopy('dn', record.dn)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                      title="Salin DN"
                    >
                      {copiedField === 'dn' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block mb-1">Lokasi Sloc (Storage)</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                  {record.sloc || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Unit Hardware & SKU */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Spesifikasi Produk & IMEI
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block mb-1">SKU Barang</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {record.sku || '-'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block mb-1">IMEI / Serial Number</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-slate-900">
                    {record.imei || '-'}
                  </span>
                  {record.imei && record.imei !== 'NO SN' && (
                    <button
                      onClick={() => handleCopy('imei', record.imei)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                      title="Salin IMEI"
                    >
                      {copiedField === 'imei' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Kasus Sanggahan & Handover */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Kasus Sanggahan & Serah Terima
            </h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div>
                <span className="text-slate-500 font-medium block mb-1">Update Kasus</span>
                <p className="font-semibold text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200">
                  {record.updateCase || '-'}
                </p>
              </div>

              {record.keterangan && (
                <div>
                  <span className="text-slate-500 font-medium block mb-1">Keterangan Tambahan</span>
                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    {record.keterangan}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 font-medium block mb-1">Doc Sanggahan</span>
                  {record.docSanggahan === 'On Proses' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      On Proses
                    </span>
                  ) : record.isDocSanggahanLink || record.docSanggahan.startsWith('http') || record.docSanggahan.includes('drive.google.com') ? (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const targetUrl = record.docSanggahanUrl || record.docSanggahan;
                          if (onPlayVideo) {
                            onPlayVideo(targetUrl, record, 'Doc Sanggahan');
                          } else {
                            window.open(targetUrl, '_blank');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Putar Video Google</span>
                      </button>
                      <div>
                        <a
                          href={record.docSanggahanUrl || record.docSanggahan}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-medium"
                        >
                          <span>Buka di Google Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ) : record.isDocSanggahanVideoFile || record.docSanggahan.toLowerCase().includes('.mp4') || record.docSanggahan.toLowerCase().startsWith('unboxing') ? (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const targetUrl =
                            record.docSanggahanUrl ||
                            (record.isDriveLink
                              ? record.evidenceUrl!
                              : `https://drive.google.com/drive/search?q=${encodeURIComponent(record.docSanggahan)}`);
                          if (onPlayVideo) {
                            onPlayVideo(targetUrl, record, `Doc Sanggahan: ${record.docSanggahan}`);
                          } else {
                            window.open(targetUrl, '_blank');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span className="truncate max-w-[200px]">Putar Video: {record.docSanggahan}</span>
                      </button>
                      <div>
                        <a
                          href={
                            record.docSanggahanUrl ||
                            (record.isDriveLink
                              ? record.evidenceUrl
                              : `https://drive.google.com/drive/search?q=${encodeURIComponent(record.docSanggahan)}`)
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline font-medium"
                        >
                          <span>Cari Berkas di Google Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-slate-900">
                        {record.docSanggahan || '-'}
                      </span>
                      {record.docSanggahan && record.docSanggahan !== '-' && (
                        <button
                          onClick={() => handleCopy('docSanggahan', record.docSanggahan)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Salin Dokumen Sanggahan"
                        >
                          {copiedField === 'docSanggahan' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-1">Doc Handover</span>
                  <span className="font-mono font-semibold text-indigo-700">
                    {record.docHandover || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-1">NO HO (Batch Serah Terima)</span>
                  <span className="font-mono font-bold text-slate-900">
                    {record.noHo ? `#${record.noHo}` : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Bukti CCTV / Google Drive */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Bukti Video CCTV & Dokumentasi
            </h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              {record.isDriveLink ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Tersedia Tautan Google Drive</p>
                      <p className="text-slate-500 text-[11px] truncate max-w-sm">
                        {record.evidenceUrl}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (record.evidenceUrl && onPlayVideo) {
                          onPlayVideo(record.evidenceUrl, record, 'Kolom M - CCTV Bukti');
                        } else if (record.evidenceUrl) {
                          window.open(record.evidenceUrl, '_blank');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs text-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Putar Video</span>
                    </button>
                    <a
                      href={record.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors text-xs"
                    >
                      <span>Buka Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : record.isCctvFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-sky-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Rekaman File Video CCTV Gudang</p>
                      <p className="font-mono text-slate-600">{record.notedApaKee}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy('cctv', record.notedApaKee)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors font-medium"
                  >
                    {copiedField === 'cctv' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Salin Nama File</span>
                  </button>
                </div>
              ) : (
                <p className="text-slate-500 italic">Tidak ada lampiran bukti CCTV / Drive pada baris ini.</p>
              )}
            </div>
          </div>

          {/* Section 5: Operasional Packing */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Data Packing & Petugas Gudang
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block mb-1">Nama Packer</span>
                <span className="font-semibold text-slate-900">
                  {record.namaPacker || '-'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block mb-1">Status Print</span>
                <span className="font-semibold text-emerald-700">
                  {record.statusPrint || '-'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block mb-1">Waktu Packing</span>
                <span className="font-medium text-slate-800">
                  {record.tglJamPacking || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
