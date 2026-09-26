import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  Users,
  Building2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { SheetStats } from '../types/sheet';

interface AnalyticsChartsProps {
  stats: SheetStats;
  onSelectCase?: (caseName: string) => void;
  onSelectCourier?: (courier: string) => void;
  onSelectPacker?: (packer: string) => void;
  onSelectSloc?: (sloc: string) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  stats,
  onSelectCase,
  onSelectCourier,
  onSelectPacker,
  onSelectSloc,
}) => {
  const [activeTab, setActiveTab] = useState<'cases' | 'courier' | 'sloc' | 'packers' | 'trends'>('cases');

  const maxCaseCount = stats.topCases.length > 0 ? stats.topCases[0].count : 1;

  // Courier totals calculation
  const totalCourierShipments = Object.values(stats.courierCounts).reduce((a, b) => a + b, 0) || 1;
  const courierList = [
    { name: 'Ninja (TG)', key: 'Ninja', count: stats.courierCounts['Ninja'] || 0, color: 'bg-rose-500' },
    { name: 'J&T (JX)', key: 'J&T', count: stats.courierCounts['J&T'] || 0, color: 'bg-red-600' },
    { name: 'Shopee Express (SPX)', key: 'Shopee Express', count: stats.courierCounts['Shopee Express'] || 0, color: 'bg-orange-500' },
    { name: 'Lainnya / Cargo', key: 'Other', count: (stats.courierCounts['Other'] || 0) + (stats.courierCounts['J&T Cargo'] || 0), color: 'bg-slate-500' },
  ];

  // Sloc calculation
  const totalSloc = Object.values(stats.slocCounts).reduce((a, b) => a + b, 0) || 1;
  const slocList = Object.entries(stats.slocCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([sloc, count]) => ({
      sloc,
      count,
      label: sloc === '1655' ? '1655 - Gudang Retur Reguler' : sloc === '1653' ? '1653 - Sanggahan & Rusak' : sloc,
      percent: ((count / totalSloc) * 100).toFixed(1),
    }));

  // Top packers
  const packerList = Object.entries(stats.packerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxPackerCount = packerList.length > 0 ? packerList[0][1] : 1;

  // Recent trends
  const trendSamples = stats.dailyTrends.slice(-14);
  const maxTrendCount = Math.max(...trendSamples.map((t) => t.count), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Chart Nav Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3 bg-slate-50/70 gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Analitik & Pola Sanggahan Retur
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold">
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'cases' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kasus Terbanyak
          </button>
          <button
            onClick={() => setActiveTab('courier')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'courier' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Distribusi Kurir
          </button>
          <button
            onClick={() => setActiveTab('sloc')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'sloc' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lokasi Sloc
          </button>
          <button
            onClick={() => setActiveTab('packers')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'packers' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Packer
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'trends' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tren Tanggal
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="p-4 sm:p-6">
        {/* TAB 1: CASES BREAKDOWN */}
        {activeTab === 'cases' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  10 Kasus & Keluhan Retur Tertinggi
                </h3>
                <p className="text-xs text-slate-500">
                  Klik pada baris atau bar untuk memfilter daftar barang berdasarkan kasus tertentu.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Peringatan: {stats.fraudCount} Kasus Fraud / Barang Ditukar
              </span>
            </div>

            <div className="space-y-3">
              {stats.topCases.map((item, idx) => {
                const percent = ((item.count / maxCaseCount) * 100).toFixed(0);
                const isFraud = item.category === 'fraud';
                const isDamage = item.category === 'damage';

                return (
                  <div
                    key={idx}
                    onClick={() => onSelectCase && onSelectCase(item.name)}
                    className="group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 font-semibold w-5 text-right">
                          #{idx + 1}
                        </span>
                        <span className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </span>
                        {isFraud && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700">
                            Fraud / Tidak Sesuai
                          </span>
                        )}
                        {isDamage && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            Kerusakan Fisik
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.count}</span>
                        <span className="text-slate-400 text-[11px]">kasus</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          isFraud
                            ? 'bg-rose-500 group-hover:bg-rose-600'
                            : isDamage
                            ? 'bg-amber-500 group-hover:bg-amber-600'
                            : 'bg-blue-500 group-hover:bg-blue-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: COURIER DISTRIBUTION */}
        {activeTab === 'courier' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Proporsi Retur per Ekspedisi Kurir
                </h3>
                <p className="text-xs text-slate-500">
                  Dideteksi otomatis dari kode awalan resi pengiriman (TG = Ninja, JX = J&T, SPX = Shopee).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left Bar Graph */}
              <div className="space-y-4">
                {courierList.map((c, idx) => {
                  const percent = ((c.count / totalCourierShipments) * 100).toFixed(1);
                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectCourier && onSelectCourier(c.key)}
                      className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-semibold text-slate-800">{c.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{c.count.toLocaleString()} resi</span>
                          <span className="text-slate-500 font-medium">({percent}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full ${c.color}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Ringkasan Analisis Logistik
                </h4>
                <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-slate-900">Ninja Xpress (TG)</strong> mendominasi volume pengembalian terbesar dengan lebih dari 50% total retur terdata.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-slate-900">J&T Express (JX)</strong> merupakan kontributor kedua terbesar dengan 400+ rekaman pengembalian dan sanggahan.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-slate-900">Shopee Express (SPX)</strong> memiliki tingkat penyerahan serah terima cepat dengan mayoritas dokumen HO terlampir.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SLOC STORAGE */}
        {activeTab === 'sloc' && (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Alokasi Lokasi Penyimpanan (Storage Location / Sloc)
              </h3>
              <p className="text-xs text-slate-500">
                Pemisahan penyimpanan antara gudang retur reguler dan area klaim/sanggahan rusak.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slocList.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectSloc && onSelectSloc(s.sloc)}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer bg-gradient-to-br from-white to-slate-50/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-slate-900 text-sm">{s.label}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {s.percent}%
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mb-2">
                    {s.count.toLocaleString()}{' '}
                    <span className="text-sm font-medium text-slate-500">Unit</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PACKERS LEADERBOARD */}
        {activeTab === 'packers' && (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Akuntabilitas Packer & Petugas Penanganan
              </h3>
              <p className="text-xs text-slate-500">
                Pelacakan personil gudang yang bertugas pada paket retur dan serah terima unit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {packerList.map(([name, count], idx) => {
                const percent = ((count / maxPackerCount) * 100).toFixed(0);
                return (
                  <div
                    key={idx}
                    onClick={() => onSelectPacker && onSelectPacker(name)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {idx + 1}
                        </div>
                        <span className="font-semibold text-xs text-slate-800 group-hover:text-blue-600 truncate max-w-[120px]">
                          {name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: TRENDS */}
        {activeTab === 'trends' && (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Tren Volume Masuk Harian (14 Tanggal Terakhir Terdata)
              </h3>
              <p className="text-xs text-slate-500">
                Fluktuasi jumlah paket retur & sanggahan yang diproses per tanggal pencatatan.
              </p>
            </div>

            <div className="h-48 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-200">
              {trendSamples.map((t, idx) => {
                const heightPercent = Math.max(((t.count / maxTrendCount) * 100), 10);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute -top-8 hidden group-hover:flex flex-col items-center z-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md shadow-md pointer-events-none whitespace-nowrap">
                      <span>{t.date}</span>
                      <span className="font-bold">{t.count} unit retur</span>
                    </div>

                    <div
                      className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all group-hover:brightness-110"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[9px] text-slate-400 mt-2 truncate w-full text-center rotate-45 sm:rotate-0 origin-left">
                      {t.date.split('/')[0]}/{t.date.split('/')[1]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
