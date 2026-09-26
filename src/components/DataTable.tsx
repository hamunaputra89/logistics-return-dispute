import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  Video,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertOctagon,
  ShieldAlert,
  HelpCircle,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import {
  ReturnRecord,
  CategoryFilter,
  CourierFilter,
  SlocFilter,
  StatusFilter,
} from '../types/sheet';

interface DataTableProps {
  records: ReturnRecord[];
  onSelectRecord: (record: ReturnRecord) => void;
  selectedCategoryFilter: CategoryFilter;
  onChangeCategoryFilter: (cat: CategoryFilter) => void;
  selectedCourierFilter: CourierFilter;
  onChangeCourierFilter: (courier: CourierFilter) => void;
  selectedSlocFilter: SlocFilter;
  onChangeSlocFilter: (sloc: SlocFilter) => void;
  selectedStatusFilter: StatusFilter;
  onChangeStatusFilter: (status: StatusFilter) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onResetFilters: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  records,
  onSelectRecord,
  selectedCategoryFilter,
  onChangeCategoryFilter,
  selectedCourierFilter,
  onChangeCourierFilter,
  selectedSlocFilter,
  onChangeSlocFilter,
  selectedStatusFilter,
  onChangeStatusFilter,
  searchQuery,
  onChangeSearchQuery,
  onResetFilters,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'rowIndex' | 'tanggal' | 'status' | 'courier'>('rowIndex');
  const [sortAsc, setSortAsc] = useState(false);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          r.resiOriginal.toLowerCase().includes(q) ||
          r.resiRetur.toLowerCase().includes(q) ||
          r.dn.toLowerCase().includes(q) ||
          r.imei.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          r.updateCase.toLowerCase().includes(q) ||
          r.namaPacker.toLowerCase().includes(q) ||
          r.docHandover.toLowerCase().includes(q) ||
          r.noHo.toLowerCase().includes(q) ||
          r.keterangan.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Category filter
      if (selectedCategoryFilter !== 'all') {
        if (r.categoryType !== selectedCategoryFilter) return false;
      }

      // Courier filter
      if (selectedCourierFilter !== 'all') {
        if (r.courier !== selectedCourierFilter) return false;
      }

      // Sloc filter
      if (selectedSlocFilter !== 'all') {
        if (selectedSlocFilter === 'other') {
          if (r.sloc === '1655' || r.sloc === '1653') return false;
        } else if (r.sloc !== selectedSlocFilter) {
          return false;
        }
      }

      // Status filter
      if (selectedStatusFilter !== 'all') {
        const isDone = r.status.toLowerCase().includes('done');
        if (selectedStatusFilter === 'done' && !isDone) return false;
        if (selectedStatusFilter === 'pending' && isDone) return false;
      }

      return true;
    });
  }, [
    records,
    searchQuery,
    selectedCategoryFilter,
    selectedCourierFilter,
    selectedSlocFilter,
    selectedStatusFilter,
  ]);

  // Sort records
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      if (sortField === 'rowIndex') {
        return sortAsc ? a.rowIndex - b.rowIndex : b.rowIndex - a.rowIndex;
      }
      if (sortField === 'tanggal') {
        const da = new Date(a.tanggal).getTime() || 0;
        const db = new Date(b.tanggal).getTime() || 0;
        return sortAsc ? da - db : db - da;
      }
      if (sortField === 'status') {
        return sortAsc
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      if (sortField === 'courier') {
        return sortAsc
          ? a.courier.localeCompare(b.courier)
          : b.courier.localeCompare(a.courier);
      }
      return 0;
    });
  }, [filteredRecords, sortField, sortAsc]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const currentSafePage = Math.min(currentPage, totalPages);
  const pagedRecords = useMemo(() => {
    const start = (currentSafePage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentSafePage, pageSize]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Tanggal',
      'Resi Retur',
      'DN',
      'Resi Original',
      'SKU',
      'IMEI',
      'Sloc',
      'Doc Sanggahan',
      'Update Case',
      'KETERANGAN',
      'Doc Handover',
      'NO HO',
      'Noted apa kee',
      'Status',
      'Nama Packer',
      'Status Print',
      'Tgl & Jam Packing',
      'catatan',
    ];

    const rows = sortedRecords.map((r) => [
      `"${r.tanggal}"`,
      `"${r.resiRetur}"`,
      `"${r.dn}"`,
      `"${r.resiOriginal}"`,
      `"${r.sku}"`,
      `"${r.imei}"`,
      `"${r.sloc}"`,
      `"${r.docSanggahan}"`,
      `"${r.updateCase.replace(/"/g, '""')}"`,
      `"${r.keterangan.replace(/"/g, '""')}"`,
      `"${r.docHandover}"`,
      `"${r.noHo}"`,
      `"${r.notedApaKee.replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.namaPacker}"`,
      `"${r.statusPrint}"`,
      `"${r.tglJamPacking}"`,
      `"${r.catatan.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Semarang_Sanggahan_Retur_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategoryFilter !== 'all' ||
    selectedCourierFilter !== 'all' ||
    selectedSlocFilter !== 'all' ||
    selectedStatusFilter !== 'all';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Search & Filter Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onChangeSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari Resi, DN, IMEI, SKU, Packer, Kasus..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => onChangeSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Stats & Export */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium hidden sm:inline">
              Menampilkan <strong className="text-slate-900">{filteredRecords.length.toLocaleString()}</strong> data
            </span>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
              title="Unduh data terfilter ke format CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Category */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => {
              onChangeCategoryFilter(e.target.value as CategoryFilter);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Kategori Kasus</option>
            <option value="fraud">Fraud & Isi Tidak Sesuai</option>
            <option value="damage">Kerusakan Fisik & Penyok</option>
            <option value="unsealed">Segel Terbuka & Bad Unit</option>
            <option value="courier_issue">Masalah Kurir / DP Lain</option>
            <option value="normal">Normal / Selesai</option>
          </select>

          {/* Courier */}
          <select
            value={selectedCourierFilter}
            onChange={(e) => {
              onChangeCourierFilter(e.target.value as CourierFilter);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Kurir</option>
            <option value="Ninja">Ninja Xpress (TG)</option>
            <option value="J&T">J&T Express (JX)</option>
            <option value="Shopee Express">Shopee Express (SPX)</option>
            <option value="Other">Lainnya / Cargo</option>
          </select>

          {/* Sloc */}
          <select
            value={selectedSlocFilter}
            onChange={(e) => {
              onChangeSlocFilter(e.target.value as SlocFilter);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Sloc</option>
            <option value="1655">Sloc 1655 (Retur)</option>
            <option value="1653">Sloc 1653 (Sanggahan)</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => {
              onChangeStatusFilter(e.target.value as StatusFilter);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="done">Done / Selesai</option>
            <option value="pending">Pending / Proses</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto min-h-[380px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-600 font-semibold uppercase tracking-wider text-[11px] select-none">
              <th
                onClick={() => {
                  setSortField('rowIndex');
                  setSortAsc(!sortAsc);
                }}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 w-12"
              >
                No
              </th>
              <th
                onClick={() => {
                  setSortField('tanggal');
                  setSortAsc(!sortAsc);
                }}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900"
              >
                Tanggal
              </th>
              <th
                onClick={() => {
                  setSortField('courier');
                  setSortAsc(!sortAsc);
                }}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900"
              >
                Resi Original & Kurir
              </th>
              <th className="py-3 px-3.5">Resi Retur & DN</th>
              <th className="py-3 px-3.5">SKU & IMEI</th>
              <th className="py-3 px-3.5">Kasus / Sanggahan</th>
              <th className="py-3 px-3.5">Sloc</th>
              <th className="py-3 px-3.5">Handover & CCTV</th>
              <th className="py-3 px-3.5">Packer</th>
              <th
                onClick={() => {
                  setSortField('status');
                  setSortAsc(!sortAsc);
                }}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900"
              >
                Status
              </th>
              <th className="py-3 px-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {pagedRecords.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-semibold text-slate-700">Tidak ada data ditemukan</p>
                    <p className="text-xs text-slate-400">
                      Coba sesuaikan kata kunci pencarian atau bersihkan filter di atas.
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={onResetFilters}
                        className="mt-2 text-xs font-medium text-blue-600 hover:underline"
                      >
                        Reset semua filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              pagedRecords.map((r) => {
                const isFraud = r.categoryType === 'fraud';
                const isDamage = r.categoryType === 'damage';
                const isUnsealed = r.categoryType === 'unsealed';
                const isDone = r.status.toLowerCase().includes('done');

                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRecord(r)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* Row Index */}
                    <td className="py-3 px-3.5 font-mono text-slate-400 font-semibold text-[11px]">
                      {r.rowIndex}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3.5 font-medium text-slate-700 whitespace-nowrap">
                      {r.tanggal || '-'}
                    </td>

                    {/* Resi Original & Courier */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-slate-900">
                          {r.resiOriginal || '-'}
                        </span>
                        {r.resiOriginal && (
                          <button
                            onClick={(e) => handleCopy(r.resiOriginal, e)}
                            className="text-slate-300 hover:text-slate-600 p-0.5"
                            title="Salin Resi Original"
                          >
                            {copiedText === r.resiOriginal ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            r.courier === 'Ninja'
                              ? 'bg-rose-100 text-rose-800'
                              : r.courier === 'J&T'
                              ? 'bg-red-100 text-red-800'
                              : r.courier === 'Shopee Express'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {r.courier}
                        </span>
                      </div>
                    </td>

                    {/* Resi Retur & DN */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-mono text-slate-800 font-medium">
                        {r.resiRetur || '-'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        DN: {r.dn || '-'}
                      </div>
                    </td>

                    {/* SKU & IMEI */}
                    <td className="py-3 px-3.5 max-w-[150px]">
                      <div className="font-semibold text-slate-800 truncate" title={r.sku}>
                        {r.sku || '-'}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 truncate" title={r.imei}>
                        IMEI: {r.imei || '-'}
                      </div>
                    </td>

                    {/* Update Case & Sanggahan */}
                    <td className="py-3 px-3.5 max-w-[200px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isFraud && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 shrink-0">
                            <AlertOctagon className="w-3 h-3" />
                            Fraud
                          </span>
                        )}
                        {isDamage && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                            <ShieldAlert className="w-3 h-3" />
                            Rusak
                          </span>
                        )}
                        {isUnsealed && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 shrink-0">
                            Tidak Segel
                          </span>
                        )}
                        <span
                          className="font-medium text-slate-800 truncate max-w-[170px]"
                          title={r.updateCase || r.keterangan}
                        >
                          {r.updateCase || r.keterangan || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Sloc */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md ${
                          r.sloc === '1655'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : r.sloc === '1653'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.sloc || '-'}
                      </span>
                    </td>

                    {/* Handover & Evidence */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {r.noHo && r.noHo !== 'Tidak ditemukan' && (
                        <div className="font-semibold text-indigo-700 text-xs">
                          HO #{r.noHo}
                        </div>
                      )}
                      {r.isDriveLink ? (
                        <a
                          href={r.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Buka Drive</span>
                        </a>
                      ) : r.isCctvFile ? (
                        <div
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-sky-700 mt-0.5 max-w-[120px] truncate"
                          title={r.notedApaKee}
                        >
                          <Video className="w-3 h-3 text-sky-500 shrink-0" />
                          <span className="truncate">{r.notedApaKee}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>

                    {/* Packer */}
                    <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-700">
                      {r.namaPacker || '-'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status || 'Pending'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord(r);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs group-hover:border-blue-300 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <span>Halaman</span>
          <strong className="text-slate-900">{currentSafePage}</strong>
          <span>dari</span>
          <strong className="text-slate-900">{totalPages}</strong>
          <span className="mx-2 text-slate-300">|</span>
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value={15}>15 baris</option>
            <option value={25}>25 baris</option>
            <option value={50}>50 baris</option>
            <option value={100}>100 baris</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentSafePage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono font-medium text-slate-700">
            {currentSafePage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentSafePage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
