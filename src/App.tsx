import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Layers,
  Sparkles,
  Heart,
} from 'lucide-react';
import {
  ReturnRecord,
  CategoryFilter,
  CourierFilter,
  SlocFilter,
  StatusFilter,
  SheetStats,
} from './types/sheet';
import {
  fetchSheetData,
  appendSheetRecord,
  computeSheetStats,
  SPREADSHEET_URL,
  getGoogleVideoEmbedUrl,
} from './services/sheetService';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/googleAuth';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { DataTable } from './components/DataTable';
import { RecordDetailModal } from './components/RecordDetailModal';
import { AddRecordModal } from './components/AddRecordModal';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { GoogleVideoPlayerModal } from './components/GoogleVideoPlayerModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Application Data States
  const [records, setRecords] = useState<ReturnRecord[]>([]);
  const [stats, setStats] = useState<SheetStats>(() => computeSheetStats([]));
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [syncInterval, setSyncInterval] = useState(30); // 30s auto-refresh by default
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [courierFilter, setCourierFilter] = useState<CourierFilter>('all');
  const [slocFilter, setSlocFilter] = useState<SlocFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ReturnRecord | null>(null);
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);
  const [activeVideo, setActiveVideo] = useState<{
    url: string;
    title: string;
    sourceLabel: string;
    resiOriginal?: string;
  } | null>(null);

  const handlePlayVideo = (videoUrl: string, record: ReturnRecord, label?: string) => {
    setActiveVideo({
      url: videoUrl,
      title: `Video Sanggahan / Unboxing (${record.resiOriginal || record.resiRetur || 'Retur'})`,
      sourceLabel: label || 'Doc Sanggahan',
      resiOriginal: record.resiOriginal,
    });
  };

  // User Confirmation Dialog State (for Google Workspace API mutation compliance)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    pendingData: any;
    details: { label: string; value: string }[];
  }>({
    isOpen: false,
    pendingData: null,
    details: [],
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setHasToken(!!token);
      },
      () => {
        setUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch data function
  const loadData = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setIsLoading(records.length === 0);
        setIsRefreshing(true);
      }
      setLoadError(null);

      try {
        const token = await getAccessToken();
        const res = await fetchSheetData(token);

        setRecords((prev) => {
          // If background refresh brought in new records, notify user
          if (prev.length > 0 && res.records.length > prev.length) {
            const diff = res.records.length - prev.length;
            addToast(
              'info',
              'Update Spreadsheet Diterima',
              `${diff} data baru berhasil disinkronkan ke dashboard.`
            );
          }
          return res.records;
        });

        setStats(computeSheetStats(res.records));
        setLastUpdated(new Date());
        setIsLiveConnected(res.source === 'api' || res.source === 'csv');
      } catch (err: any) {
        console.error('Failed to load sheet data:', err);
        setLoadError(err.message || 'Gagal memuat data dari spreadsheet');
        if (!isBackground) {
          addToast('error', 'Gagal Sinkronisasi', err.message);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [records.length, addToast]
  );

  // Initial load
  useEffect(() => {
    loadData(false);
  }, []);

  // Auto-sync ticker
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (syncInterval > 0) {
      timerRef.current = setInterval(() => {
        loadData(true);
      }, syncInterval * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [syncInterval, loadData]);

  // Handle Google Sign In
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setHasToken(true);
        addToast(
          'success',
          'Login Google Berhasil',
          `Selamat datang, ${result.user.displayName || 'User'}! Siap menulis langsung ke Spreadsheet.`
        );
        // Refresh with API
        loadData(false);
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        const currentDomain = window.location.hostname;
        addToast(
          'error',
          'Domain Belum Diizinkan di Firebase',
          `Domain "${currentDomain}" belum didaftarkan di Firebase Authentication > Settings > Authorized Domains. Tambahkan domain ini agar login Google dapat digunakan di GitHub Pages.`
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        addToast('info', 'Login Dibatalkan', 'Jendela login Google ditutup sebelum proses selesai.');
      } else {
        addToast('error', 'Login Gagal', err.message || 'Tidak dapat login dengan Google.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Sign Out
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setHasToken(false);
      addToast('info', 'Berhasil Keluar', 'Sesi Google telah dihentikan.');
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  // Pre-submit hook from AddRecordModal
  const handleInitiateAddRecord = async (newRecordData: any) => {
    const token = await getAccessToken();

    // If user has active Google Sheets access token, mandatory user confirmation is requested
    if (token) {
      setConfirmModal({
        isOpen: true,
        pendingData: newRecordData,
        details: [
          { label: 'Target Spreadsheet', value: 'SEMARANG - SANGGAHAN' },
          { label: 'Resi Original', value: newRecordData.resiOriginal || '-' },
          { label: 'Resi Retur', value: newRecordData.resiRetur || '-' },
          { label: 'Update Case', value: newRecordData.updateCase || '-' },
          { label: 'Petugas Packer', value: newRecordData.namaPacker || '-' },
          { label: 'Sloc', value: newRecordData.sloc || '1655' },
        ],
      });
      return;
    }

    // Fallback: If not logged in, perform local optimistic update
    executeSaveRecord(newRecordData, null);
  };

  // Execute save to Google Sheets API / local state
  const executeSaveRecord = async (data: any, token: string | null) => {
    setIsSubmittingRecord(true);
    try {
      if (token) {
        // Real API append to Google Sheets
        await appendSheetRecord(data, token);
        addToast(
          'success',
          'Data Berhasil Disimpan ke Google Sheets!',
          `Resi ${data.resiOriginal || data.resiRetur} telah ditambahkan ke tab SEMARANG - SANGGAHAN.`
        );
      } else {
        addToast(
          'success',
          'Data Disimpan ke Dashboard!',
          `Perubahan tercermin seketika di visualisasi. Hubungkan Google untuk menyimpan permanen ke spreadsheet online.`
        );
      }

      // Optimistically append new record into local records array
      const newRecord: ReturnRecord = {
        id: `row-new-${Date.now()}`,
        rowIndex: records.length + 2,
        tanggal: data.tanggal,
        resiRetur: data.resiRetur,
        dn: data.dn,
        resiOriginal: data.resiOriginal,
        sku: data.sku,
        imei: data.imei,
        sloc: data.sloc,
        docSanggahan: data.docSanggahan?.trim() ? data.docSanggahan.trim() : 'On Proses',
        updateCase: data.updateCase,
        keterangan: data.keterangan,
        docHandover: data.docHandover,
        noHo: data.noHo,
        notedApaKee: data.notedApaKee,
        status: data.status,
        namaPacker: data.namaPacker,
        statusPrint: data.statusPrint,
        tglJamPacking: data.tglJamPacking,
        catatan: data.catatan,
        courier: (data.resiOriginal.startsWith('TG')
          ? 'JNE'
          : data.resiOriginal.startsWith('JX')
          ? 'J&T'
          : data.resiOriginal.startsWith('SPX')
          ? 'Shopee Express'
          : 'Other') as any,
        categoryType: data.updateCase.toLowerCase().includes('tidak sesuai')
          ? 'fraud'
          : data.updateCase.toLowerCase().includes('rusak') ||
            data.updateCase.toLowerCase().includes('penyok')
          ? 'damage'
          : 'normal',
        hasEvidence:
          data.notedApaKee.includes('drive.google.com') ||
          data.notedApaKee.toLowerCase().includes('.mp4'),
        evidenceUrl: data.notedApaKee.includes('drive.google.com') ? data.notedApaKee : undefined,
        isDriveLink: data.notedApaKee.includes('drive.google.com'),
        isCctvFile: data.notedApaKee.toLowerCase().includes('.mp4'),
        isDocSanggahanLink:
          data.docSanggahan !== 'On Proses' &&
          (data.docSanggahan.startsWith('http://') ||
            data.docSanggahan.startsWith('https://') ||
            data.docSanggahan.includes('drive.google.com')),
        docSanggahanUrl:
          data.docSanggahan !== 'On Proses' &&
          (data.docSanggahan.startsWith('http') || data.docSanggahan.includes('drive.google.com'))
            ? data.docSanggahan.startsWith('http')
              ? data.docSanggahan
              : `https://${data.docSanggahan}`
            : undefined,
        docSanggahanEmbedUrl:
          data.docSanggahan !== 'On Proses' &&
          (data.docSanggahan.startsWith('http') || data.docSanggahan.includes('drive.google.com'))
            ? getGoogleVideoEmbedUrl(data.docSanggahan) || undefined
            : undefined,
      };

      setRecords((prev) => [newRecord, ...prev]);
      setStats((prev) => computeSheetStats([newRecord, ...records]));
      setLastUpdated(new Date());

      // If token was used, reload full dataset shortly after
      if (token) {
        setTimeout(() => loadData(true), 1500);
      }
    } catch (err: any) {
      console.error('Error saving record:', err);
      addToast('error', 'Gagal Menulis ke Google Sheets', err.message);
      throw err;
    } finally {
      setIsSubmittingRecord(false);
      setConfirmModal({ isOpen: false, pendingData: null, details: [] });
    }
  };

  const handleConfirmModalProceed = async () => {
    const token = await getAccessToken();
    if (confirmModal.pendingData) {
      await executeSaveRecord(confirmModal.pendingData, token);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setCourierFilter('all');
    setSlocFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navigation & Real-time Integration Bar */}
      <Header
        user={user}
        hasToken={hasToken}
        isLoggingIn={isLoggingIn}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onRefresh={() => loadData(false)}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        totalRecords={records.length}
        syncInterval={syncInterval}
        onChangeSyncInterval={setSyncInterval}
        isLiveConnected={isLiveConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Connection Notice / Google Sheets Info Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-blue-300">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">
                  Dashboard Analisis & Manajemen Retur Semarang
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Real-time Sync
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-1 max-w-2xl leading-relaxed">
                Terhubung dengan Google Sheet <strong>SEMARANG - SANGGAHAN</strong> (gid 1021449465). 
                Setiap pembaruan data yang diinput akan langsung tersinkronkan dan tercermin otomatis pada visualisasi analitik di bawah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all transform active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Data Baru</span>
            </button>
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Buka Sheet Asli</span>
              <ExternalLink className="w-3 h-3 text-slate-300" />
            </a>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && records.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <p className="font-bold text-slate-900 text-base">
                Memuat Data Spreadsheet Semarang...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Menghubungkan ke Google Docs & mengekstrak 1,165+ baris riwayat retur & sanggahan
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 1. KPI Stats Cards */}
            <KpiCards
              stats={stats}
              onFilterCategory={(cat) => {
                setCategoryFilter(cat as CategoryFilter);
                window.scrollTo({ top: 580, behavior: 'smooth' });
              }}
            />

            {/* 2. Visual Analytics Charts */}
            <AnalyticsCharts
              stats={stats}
              onSelectCase={(caseName) => {
                setSearchQuery(caseName);
                window.scrollTo({ top: 650, behavior: 'smooth' });
              }}
              onSelectCourier={(courier) => {
                setCourierFilter(courier as CourierFilter);
                window.scrollTo({ top: 650, behavior: 'smooth' });
              }}
              onSelectPacker={(packer) => {
                setSearchQuery(packer);
                window.scrollTo({ top: 650, behavior: 'smooth' });
              }}
              onSelectSloc={(sloc) => {
                setSlocFilter(sloc as SlocFilter);
                window.scrollTo({ top: 650, behavior: 'smooth' });
              }}
            />

            {/* 3. High Performance Data Explorer Table */}
            <DataTable
              records={records}
              onSelectRecord={(r) => setSelectedRecord(r)}
              onPlayVideo={handlePlayVideo}
              selectedCategoryFilter={categoryFilter}
              onChangeCategoryFilter={setCategoryFilter}
              selectedCourierFilter={courierFilter}
              onChangeCourierFilter={setCourierFilter}
              selectedSlocFilter={slocFilter}
              onChangeSlocFilter={setSlocFilter}
              selectedStatusFilter={statusFilter}
              onChangeStatusFilter={setStatusFilter}
              searchQuery={searchQuery}
              onChangeSearchQuery={setSearchQuery}
              onResetFilters={handleResetFilters}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p>© 2026 Semarang Fulfillment & Logistics Operations Hub • Live Google Sheets Sync</p>
            <span className="hidden sm:inline text-slate-300">•</span>
            <p className="flex items-center gap-1 font-medium text-slate-700">
              <span>Handcrafted with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
              <span>by <strong className="text-slate-900">Hery</strong></span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Sistem Aktif
            </span>
            <span>•</span>
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Spreadsheet Tab 1021449465
            </a>
          </div>
        </div>
      </footer>

      {/* Record Details Modal */}
      <RecordDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onPlayVideo={handlePlayVideo}
      />

      {/* Google Video Player Modal */}
      <GoogleVideoPlayerModal
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        videoUrl={activeVideo?.url || null}
        title={activeVideo?.title}
        sourceLabel={activeVideo?.sourceLabel}
        resiOriginal={activeVideo?.resiOriginal}
      />

      {/* Add New Record Modal */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleInitiateAddRecord}
        hasGoogleToken={hasToken}
        isSubmitting={isSubmittingRecord}
        onLoginGoogle={handleGoogleLogin}
      />

      {/* Mandatory User Confirmation Dialog before writing to Google Sheets */}
      <ConfirmationDialog
        isOpen={confirmModal.isOpen}
        title="Konfirmasi Penulisan ke Google Sheets"
        description="Apakah Anda yakin ingin menambahkan data pengembalian retur ini langsung ke spreadsheet Google Sheet 'SEMARANG - SANGGAHAN'?"
        details={confirmModal.details}
        confirmText="Ya, Tulis ke Google Sheets"
        cancelText="Batal"
        isLoading={isSubmittingRecord}
        onConfirm={handleConfirmModalProceed}
        onCancel={() => setConfirmModal({ isOpen: false, pendingData: null, details: [] })}
      />

      {/* Floating Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
