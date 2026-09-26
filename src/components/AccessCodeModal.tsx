import React, { useState } from 'react';
import { KeyRound, Lock, ShieldCheck, X, AlertCircle, Sparkles, Heart } from 'lucide-react';

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Allowed default passcodes (case-insensitive)
const VALID_ACCESS_CODES = ['HERY', 'HERY2026', 'SEMARANG', 'SEMARANG2026', '8989'];

export const AccessCodeModal: React.FC<AccessCodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanInput = code.trim().toUpperCase();
    const storedCustomCode = localStorage.getItem('custom_access_code')?.toUpperCase();

    const isMatch =
      VALID_ACCESS_CODES.includes(cleanInput) ||
      (storedCustomCode && cleanInput === storedCustomCode);

    if (isMatch) {
      sessionStorage.setItem('access_code_verified', 'true');
      setCode('');
      onSuccess();
    } else {
      setError('Kode akses tidak valid. Silakan coba lagi atau cek petunjuk kode.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Verifikasi Kode Akses</h3>
              <p className="text-[11px] text-slate-500">Sign in with Google & Otorisasi Sheets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Diperlukan kode akses internal sebelum melakukan <strong>Sign in with Google</strong>.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Masukkan Kode Akses Internal
            </label>
            <input
              type="password"
              autoFocus
              required
              placeholder="Masukkan kode akses (PIN)..."
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3.5 py-2.5 text-sm font-mono tracking-widest text-center rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Hint section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800 underline transition-colors"
            >
              {showHint ? 'Sembunyikan Petunjuk Kode' : 'Lihat Petunjuk Kode Akses'}
            </button>

            {showHint && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p>
                  Gunakan kode default: <code className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">HERY2026</code> atau <code className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">SEMARANG2026</code>
                </p>
                <p className="text-[10px] text-slate-400">
                  Diverifikasi khusus untuk tim operasional gudang Semarang.
                </p>
              </div>
            )}
          </div>

          {/* Handcraft badge */}
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
            <span>Handcraft with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
            <span className="text-slate-800 font-bold">Hery</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verifikasi & Lanjut</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
