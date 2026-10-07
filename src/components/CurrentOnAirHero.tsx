import React, { useEffect, useState } from 'react';
import { Play, Clock, Sparkles, Tv, Bell, BellRing, ChevronRight, Info, Radio, Volume2, Maximize2, Pause } from 'lucide-react';
import { ProgramItem, getCurrentlyAiringShow } from '../data/tvData';
import { VidiyoPlayer } from './VidiyoPlayer';

interface CurrentOnAirHeroProps {
  programs: ProgramItem[];
  onOpenLiveModal: () => void;
  onSelectProgram: (prog: ProgramItem) => void;
  onToggleReminder: (progId: string) => void;
  hasReminder: (progId: string) => boolean;
}

export const CurrentOnAirHero: React.FC<CurrentOnAirHeroProps> = ({
  programs,
  onOpenLiveModal,
  onSelectProgram,
  onToggleReminder,
  hasReminder
}) => {
  // Live clock state
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('');
  const [inlineStreamActive, setInlineStreamActive] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentMinutes(d.getHours() * 60 + d.getMinutes());
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      const secs = d.getSeconds().toString().padStart(2, '0');
      setCurrentTimeFormatted(`${hours}:${mins}:${secs}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const onAirData = getCurrentlyAiringShow(programs, currentMinutes);
  const { currentShow, nextShows, progressPercent, minutesRemaining, elapsedMinutes } = onAirData;

  const isReminderActive = hasReminder(currentShow.id);

  return (
    <section className="relative pt-6 pb-12 overflow-hidden border-b border-slate-800/80">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section lead header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
              TRENUTNO NA PROGRAMU
            </h2>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="text-xs sm:text-sm font-mono text-slate-400 font-medium">
              K37 HD LIVE STREAM
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-400 font-mono-nums">
            <Clock className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-slate-200">Tačno vreme:</span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-red-400 font-bold">
              {currentTimeFormatted || 'UŽIVO'}
            </span>
          </div>
        </div>

        {/* Main Grid: On-Air Display Card + Up Next Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main On-Air Display Card (8 cols) */}
          <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0d121d] flex flex-col justify-between group shadow-2xl shadow-black/60 min-h-[460px]">
            
            {inlineStreamActive ? (
              /* Embedded Live Video Player with Vidiyo Player */
              <div className="relative w-full h-full min-h-[420px] bg-black flex flex-col justify-between">
                <VidiyoPlayer
                  embedUrl="https://vidiyo.com/embed/watch/k37"
                  showTitle={currentShow.title}
                  showSubtitle={currentShow.subtitle || currentShow.presenter}
                  className="w-full h-full min-h-[380px]"
                />
                <div className="p-3 bg-[#0d121d] border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>Uživo prenos Televizije K37</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenLiveModal}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Teatar prikaz & Anketa</span>
                    </button>
                    <button
                      onClick={() => setInlineStreamActive(false)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      Zatvori video
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Broadcaster Hero Screen with Scrim & Details */
              <>
                {/* Background Image with Scrim */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={currentShow.image}
                    alt={currentShow.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.7]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-[#080b11]/75 to-black/40" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#080b11]/90 via-[#080b11]/50 to-transparent" />
                </div>

                {/* Top Bar inside Player card */}
                <div className="relative z-10 p-5 sm:p-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded tracking-wider uppercase flex items-center gap-1.5 shadow-md shadow-red-600/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      EMITUJE SE UŽIVO
                    </span>
                    {currentShow.isPremiere && (
                      <span className="bg-blue-600/90 text-white font-bold text-xs px-2.5 py-1 rounded tracking-wide uppercase">
                        PREMIJERA
                      </span>
                    )}
                  </div>

                  {/* Age & Stream indicator */}
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span className="border border-slate-700 px-2 py-0.5 rounded bg-black/40">
                      {currentShow.ageRating}
                    </span>
                    <span className="border border-red-900/60 text-red-400 font-bold px-2 py-0.5 rounded bg-red-950/40">
                      HD LIVE
                    </span>
                  </div>
                </div>

                {/* Center / Bottom Info Block */}
                <div className="relative z-10 p-5 sm:p-8 mt-12 sm:mt-20">
                  {/* Zero-Pill Metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-300 mb-2 font-medium">
                    <span className="text-red-400 font-semibold uppercase tracking-wider">
                      {currentShow.category.replace('_', ' ')}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="font-mono-nums">{currentShow.startTime} - {currentShow.endTime}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>Trajanje {currentShow.durationMinutes} min</span>
                    {currentShow.presenter && (
                      <>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-200">Voditelj: {currentShow.presenter}</span>
                      </>
                    )}
                  </div>

                  {/* Show Title */}
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display mb-3 text-balance leading-tight">
                    {currentShow.title}
                  </h1>

                  {/* Subtitle / Description */}
                  <p className="text-sm sm:text-base text-slate-300 max-w-2xl line-clamp-2 sm:line-clamp-3 mb-6 leading-relaxed">
                    {currentShow.description}
                  </p>

                  {/* Live Timeline & Progress Bar */}
                  <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800/80 p-3.5 rounded-xl mb-6 max-w-2xl">
                    <div className="flex items-center justify-between text-xs font-mono-nums mb-2 text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-200">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Proteklo: <strong className="text-white">{elapsedMinutes} min</strong>
                      </span>
                      <span className="text-red-400 font-semibold">
                        Preostalo još: <strong>{minutesRemaining} min</strong> ({progressPercent}%)
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Inline play */}
                    <button
                      onClick={() => setInlineStreamActive(true)}
                      className="px-6 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-500 transition-all shadow-xl shadow-red-600/40 flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Pokreni Stream Uživo</span>
                    </button>

                    <button
                      onClick={onOpenLiveModal}
                      className="px-4 py-3 text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white rounded-xl transition-colors border border-slate-700/60 flex items-center gap-2 cursor-pointer"
                    >
                      <Maximize2 className="w-4 h-4 text-slate-400" />
                      <span>Otvori Plejer i Anketu</span>
                    </button>

                    <button
                      onClick={() => onSelectProgram(currentShow)}
                      className="px-4 py-3 text-sm font-semibold text-slate-200 bg-slate-800/50 hover:bg-slate-700/60 hover:text-white rounded-xl transition-colors border border-slate-700/50 flex items-center gap-2 cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-slate-400" />
                      <span>Detalji emisije</span>
                    </button>

                    <button
                      onClick={() => onToggleReminder(currentShow.id)}
                      className={`px-4 py-3 text-sm font-semibold rounded-xl transition-colors border flex items-center gap-2 cursor-pointer ${
                        isReminderActive
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                      title={isReminderActive ? 'Podsetnik uključen' : 'Postavi podsetnik za reprizu'}
                    >
                      {isReminderActive ? (
                        <>
                          <BellRing className="w-4 h-4 text-amber-400" />
                          <span>Podsetnik aktivan</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          <span>Podseti me</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Up Next Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl bg-[#0d121d] border border-slate-800 p-5 sm:p-6 shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-red-500" />
                  <h3 className="font-bold text-white text-base font-display">
                    SLEDEĆE NA K37
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Naredni program
                </span>
              </div>

              {/* Next Shows List */}
              <div className="space-y-4">
                {nextShows.map((show) => {
                  const reminderOn = hasReminder(show.id);
                  return (
                    <div
                      key={show.id}
                      onClick={() => onSelectProgram(show)}
                      className="group p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/90 border border-slate-800/70 hover:border-slate-700 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <span className="font-mono text-sm font-bold text-red-400 bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded">
                          {show.startTime}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
                            {show.ageRating}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleReminder(show.id);
                            }}
                            className={`p-1 rounded hover:bg-slate-700 transition-colors ${
                              reminderOn ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                            }`}
                            title="Postavi podsetnik"
                          >
                            {reminderOn ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-100 text-sm group-hover:text-white line-clamp-1 mb-1">
                        {show.title}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                        <span className="capitalize">{show.category.replace('_', ' ')}</span>
                        <span aria-hidden="true">·</span>
                        <span>{show.durationMinutes} min</span>
                        {show.isLive && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-red-400 font-bold">Uživo</span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {show.subtitle || show.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick jump to complete EPG */}
            <div className="pt-5 mt-4 border-t border-slate-800">
              <a
                href="#raspored"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors group"
              >
                <span>Pogledaj kompletnu 7-dnevnu šemu</span>
                <ChevronRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
