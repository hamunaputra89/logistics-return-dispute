import React from 'react';
import {
  PackageCheck,
  ShieldAlert,
  Boxes,
  FileCheck2,
  Video,
  Truck,
  TrendingUp,
  AlertOctagon,
} from 'lucide-react';
import { SheetStats } from '../types/sheet';

interface KpiCardsProps {
  stats: SheetStats;
  onFilterCategory?: (category: string) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ stats, onFilterCategory }) => {
  const donePercent = stats.total > 0 ? ((stats.doneCount / stats.total) * 100).toFixed(1) : '0';
  const fraudPercent = stats.total > 0 ? ((stats.fraudCount / stats.total) * 100).toFixed(1) : '0';
  const damagePercent = stats.total > 0 ? (((stats.damageCount + stats.unsealedCount) / stats.total) * 100).toFixed(1) : '0';
  const evidencePercent = stats.total > 0 ? ((stats.hasEvidenceCount / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Total Volume */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Retur
          </span>
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
            <Boxes className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats.total.toLocaleString()}
          </span>
          <span className="text-[11px] font-medium text-slate-500">Unit</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          <span>Gudang Retur Semarang</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-b-2xl" />
      </div>

      {/* 2. Done / Resolved */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Status Selesai
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-600 tracking-tight">
            {stats.doneCount.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
            {donePercent}%
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${donePercent}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
          <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
            {stats.onProsesCount.toLocaleString()} On Proses
          </span>
          <span>{stats.doneCount.toLocaleString()} selesai</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-b-2xl" />
      </div>

      {/* 3. Fraud / Sanggahan Isi Tidak Sesuai */}
      <div
        onClick={() => onFilterCategory && onFilterCategory('fraud')}
        className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group cursor-pointer hover:border-rose-300"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 flex items-center gap-1">
            <span>Isi Tidak Sesuai</span>
          </span>
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-600 tracking-tight">
            {stats.fraudCount.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md">
            {fraudPercent}%
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate">Batu, Minyak, Box Kosong</span>
          <span className="text-rose-600 font-medium group-hover:underline">Filter</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-b-2xl" />
      </div>

      {/* 4. Rusak / Segel Terbuka */}
      <div
        onClick={() => onFilterCategory && onFilterCategory('damage')}
        className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group cursor-pointer hover:border-amber-300"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Kerusakan & Segel
          </span>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-700 tracking-tight">
            {(stats.damageCount + stats.unsealedCount).toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md">
            {damagePercent}%
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <span>Dus Penyok / Bad Unit</span>
          <span className="text-amber-600 font-medium group-hover:underline">Filter</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-b-2xl" />
      </div>

      {/* 5. Handover / Serah Terima */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Dokumen Serah Terima
          </span>
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-indigo-700 tracking-tight">
            {stats.handoverDocCount.toLocaleString()}
          </span>
          <span className="text-[11px] font-medium text-slate-500">HO Docs</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
          <span>Batch NO HO Terdata</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-b-2xl" />
      </div>

      {/* 6. Bukti CCTV / Drive Links */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Bukti CCTV / Drive
          </span>
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600 group-hover:scale-105 transition-transform">
            <Video className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-sky-700 tracking-tight">
            {stats.hasEvidenceCount.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded-md">
            {evidencePercent}%
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-sky-500" />
          <span>Rekaman MP4 & Folder Link</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500 rounded-b-2xl" />
      </div>
    </div>
  );
};
