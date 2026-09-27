import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Play,
  Video,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { getGoogleVideoEmbedUrl } from '../services/sheetService';

interface GoogleVideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  title?: string;
  sourceLabel?: string;
  resiOriginal?: string;
}

export const GoogleVideoPlayerModal: React.FC<GoogleVideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title = 'Pemutar Video Google',
  sourceLabel = 'Kolom H - Dokumen Sanggahan',
  resiOriginal,
}) => {
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
    setCopied(false);
  }, [videoUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !videoUrl) return null;

  const embedUrl = getGoogleVideoEmbedUrl(videoUrl) || videoUrl;
  const isDirectVideo = /\.(mp4|webm|ogg)($|\?)/i.test(videoUrl);

  const handleCopyLink = () => {
    if (!videoUrl) return;
    navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-800/90 border-b border-slate-700/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {title}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  {sourceLabel}
                </span>
                {resiOriginal && (
                  <span className="font-mono text-xs text-slate-400">
                    Resi: <strong className="text-slate-200">{resiOriginal}</strong>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-lg mt-0.5">
                {videoUrl}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={handleCopyLink}
              title="Salin Tautan Video"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/70 rounded-xl transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Buka Langsung di Google Drive"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-xs"
            >
              <span>Buka di Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              title="Tutup (Esc)"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/70 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Display Area */}
        <div className="relative w-full bg-black aspect-video max-h-[65vh] flex items-center justify-center">
          {isDirectVideo ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
              onError={() => setLoadError(true)}
            >
              Browser Anda tidak mendukung pemutar video HTML5.
            </video>
          ) : videoUrl.includes('/drive/search') ? (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Video className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                Berkas Video Sanggahan / Unboxing
              </h4>
              <p className="text-xs text-slate-300 font-mono mb-4 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                {title.replace('Video Sanggahan / Unboxing', '').replace(/[()]/g, '').trim() || videoUrl}
              </p>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Berkas video ini tersimpan di Google Drive. Klik tombol di bawah untuk langsung membuka dan memutar rekaman video di Google Drive.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Buka Video di Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              title="Pemutar Video Google"
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              onError={() => setLoadError(true)}
            />
          )}

          {loadError && (
            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center">
              <ShieldAlert className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-sm font-semibold text-white mb-1">
                Tampilan Pratinjau Terbatas
              </p>
              <p className="text-xs text-slate-400 max-w-md mb-4">
                File Google Drive mungkin memerlukan login akun Google Anda atau izin akses khusus.
              </p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
              >
                <span>Buka di Google Drive Tab Baru</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>
              Pemutar video langsung dari Google Drive. Anda juga dapat memperbesar layar penuh (fullscreen).
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[11px] text-slate-500 truncate max-w-xs">
              {sourceLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
