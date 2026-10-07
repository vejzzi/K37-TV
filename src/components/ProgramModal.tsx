import React, { useState } from 'react';
import { 
  X, Clock, Calendar, Bell, BellRing, Share2, 
  Tv, Play, ShieldAlert, Check, User, Sparkles, Download
} from 'lucide-react';
import { ProgramItem } from '../data/tvData';

interface ProgramModalProps {
  program: ProgramItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleReminder: (progId: string) => void;
  hasReminder: boolean;
  onWatchLive: () => void;
  isCurrentlyOnAir?: boolean;
}

export const ProgramModal: React.FC<ProgramModalProps> = ({
  program,
  isOpen,
  onClose,
  onToggleReminder,
  hasReminder,
  onWatchLive,
  isCurrentlyOnAir = false
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadedIcs, setDownloadedIcs] = useState(false);

  if (!isOpen || !program) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export .ics calendar invite file
  const handleExportIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Televizija K37//EPG Vodic//SR',
      'BEGIN:VEVENT',
      `SUMMARY:K37: ${program.title}`,
      `DESCRIPTION:${program.description.replace(/\n/g, ' ')}`,
      `LOCATION:Televizija K37 HD (Kanal 37)`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `K37_${program.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadedIcs(true);
    setTimeout(() => setDownloadedIcs(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0d121d] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Backdrop Image */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-900 overflow-hidden">
          <img
            src={program.image}
            alt={program.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d121d] via-[#0d121d]/60 to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-slate-300 hover:text-white hover:bg-black/90 transition-colors cursor-pointer"
            aria-label="Zatvori"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top badges */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded uppercase tracking-wider">
              {program.channelName}
            </span>
            {isCurrentlyOnAir && (
              <span className="bg-red-950/80 text-red-400 border border-red-800 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                UŽIVO EMITOVANJE
              </span>
            )}
            {program.isPremiere && (
              <span className="bg-blue-600/90 text-white text-xs font-bold px-2 py-0.5 rounded">
                PREMIJERA
              </span>
            )}
          </div>

          {/* Floating Time in Hero */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold mb-1">
              <Clock className="w-4 h-4" />
              <span>{program.startTime} - {program.endTime} ({program.durationMinutes} min)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display leading-tight drop-shadow-md">
              {program.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Metadata Row: Zero-Pill style */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400 border-b border-slate-800 pb-4">
            <span className="text-red-400 font-semibold uppercase">{program.category.replace('_', ' ')}</span>
            <span aria-hidden="true">·</span>
            <span>Preporučeni uzrast: <strong className="text-slate-200">{program.ageRating}</strong></span>
            {program.seasonEpisode && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-200">{program.seasonEpisode}</span>
              </>
            )}
            {program.isRerun && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400">Reprizno emitovanje</span>
              </>
            )}
          </div>

          {/* Subtitle / Kicker */}
          {program.subtitle && (
            <p className="text-sm font-semibold text-slate-200 italic">
              "{program.subtitle}"
            </p>
          )}

          {/* Full Synopsis */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Sinopsis i O Emisiji
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {program.description}
            </p>
          </div>

          {/* Presenter / Production box */}
          {program.presenter && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
                <User className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Voditelj / Autorski tim</div>
                <div className="text-sm font-bold text-white">{program.presenter}</div>
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              {/* Set Reminder Button */}
              <button
                onClick={() => onToggleReminder(program.id)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  hasReminder
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {hasReminder ? <BellRing className="w-4 h-4 text-amber-400" /> : <Bell className="w-4 h-4" />}
                <span>{hasReminder ? 'Podsetnik je postavljen' : 'Postavi podsetnik'}</span>
              </button>

              {/* Add to Calendar (.ics) */}
              <button
                onClick={handleExportIcs}
                className="px-3 py-2.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Preuzmi kalendar podsetnik (.ics fajl za Google/Apple kalendar)"
              >
                {downloadedIcs ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
                <span>{downloadedIcs ? 'Preuzeto!' : 'U kalendar (.ics)'}</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-2.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
                title="Kopiraj link emisije"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Watch Live CTA if active */}
            {isCurrentlyOnAir && (
              <button
                onClick={() => {
                  onClose();
                  onWatchLive();
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Gledaj prenos uživo</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
