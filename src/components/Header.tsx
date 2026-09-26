import React from 'react';
import {
  RefreshCw,
  ExternalLink,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SPREADSHEET_URL } from '../services/sheetService';

interface HeaderProps {
  user: User | null;
  hasToken: boolean;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenAddModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  totalRecords: number;
  syncInterval: number; // in seconds, 0 = manual
  onChangeSyncInterval: (sec: number) => void;
  isLiveConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  hasToken,
  isLoggingIn,
  onLogin,
  onLogout,
  onOpenAddModal,
  onRefresh,
  isRefreshing,
  lastUpdated,
  totalRecords,
  syncInterval,
  onChangeSyncInterval,
  isLiveConnected,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand & Status */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Semarang Return & Dispute Hub
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isLiveConnected ? 'Live Sheet' : 'Public Sync'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-200/80 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Handcraft with <strong className="text-slate-900 font-bold">Hery</strong></span>
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>Tab: SEMARANG - SANGGAHAN (gid: 1021449465)</span>
                <span>•</span>
                <span className="font-medium text-slate-700">{totalRecords.toLocaleString()} Total Baris</span>
                {lastUpdated && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400">
                      Update: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Actions & Integration Bar */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Auto-Sync Select */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                value={syncInterval}
                onChange={(e) => onChangeSyncInterval(Number(e.target.value))}
                className="bg-transparent text-slate-700 font-medium text-xs rounded-lg focus:outline-none cursor-pointer pr-1"
                aria-label="Auto-sync interval"
              >
                <option value={15}>Auto 15 detik</option>
                <option value={30}>Auto 30 detik</option>
                <option value={60}>Auto 1 menit</option>
                <option value={0}>Manual Sync</option>
              </select>
            </div>

            {/* Manual Sync Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              title="Sinkronkan data terbaru dari Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            {/* Direct Google Sheets Link */}
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-xs"
              title="Buka Spreadsheet langsung di Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Buka Sheets</span>
              <ExternalLink className="w-3 h-3 text-emerald-500" />
            </a>

            {/* Add New Record CTA */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition-all transform active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Data Baru</span>
            </button>

            {/* Google Authentication Section */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-6 h-6 rounded-full border border-slate-300"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="max-w-[110px] sm:max-w-[140px] truncate text-left">
                    <p className="text-[11px] font-semibold text-slate-800 truncate">
                      {user.displayName || 'Authorized User'}
                    </p>
                    <p className="text-[9px] text-emerald-600 font-medium leading-none">
                      Sheets Write Ready
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                    title="Keluar / Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="gsi-material-button text-xs"
                title="Hubungkan akun Google untuk menulis langsung ke Spreadsheet"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-medium">
                    {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
