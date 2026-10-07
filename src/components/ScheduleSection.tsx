import React, { useState, useMemo, useRef } from 'react';
import { 
  Calendar, Clock, Search, Filter, Bell, BellRing, 
  ChevronRight, Play, Check, Sparkles, Radio, Eye, Layers
} from 'lucide-react';
import { DaySchedule, ProgramItem } from '../data/tvData';

interface ScheduleSectionProps {
  weeklySchedule: DaySchedule[];
  currentShowId?: string;
  onSelectProgram: (prog: ProgramItem) => void;
  onToggleReminder: (progId: string) => void;
  hasReminder: (progId: string) => boolean;
  onWatchLive: () => void;
  onOpenEditor?: () => void;
}

type CategoryFilter = 'all' | 'informativni' | 'film_serija' | 'sport' | 'dokumentarni' | 'zabavni' | 'kultura';

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  weeklySchedule,
  currentShowId,
  onSelectProgram,
  onToggleReminder,
  hasReminder,
  onWatchLive,
  onOpenEditor,
}) => {
  // Find index of today
  const defaultDayIndex = useMemo(() => {
    const todayIdx = weeklySchedule.findIndex(d => d.isToday);
    return todayIdx !== -1 ? todayIdx : 0;
  }, [weeklySchedule]);

  const [selectedDayIdx, setSelectedDayIdx] = useState(defaultDayIndex);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyLive, setOnlyLive] = useState(false);
  const [onlyPremiere, setOnlyPremiere] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  const currentDay = weeklySchedule[selectedDayIdx] || weeklySchedule[0];

  // Filter programs for current day
  const filteredPrograms = useMemo(() => {
    return currentDay.programs.filter(prog => {
      // Category filter
      if (selectedCategory !== 'all' && prog.category !== selectedCategory) {
        return false;
      }
      // Live filter
      if (onlyLive && !prog.isLive) {
        return false;
      }
      // Premiere filter
      if (onlyPremiere && !prog.isPremiere) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = prog.title.toLowerCase().includes(q);
        const matchSub = prog.subtitle?.toLowerCase().includes(q) || false;
        const matchDesc = prog.description?.toLowerCase().includes(q) || false;
        const matchPresenter = prog.presenter?.toLowerCase().includes(q) || false;
        return matchTitle || matchSub || matchDesc || matchPresenter;
      }
      return true;
    });
  }, [currentDay, selectedCategory, onlyLive, onlyPremiere, searchQuery]);

  // Jump to current show in list
  const activeShowRef = useRef<HTMLDivElement>(null);
  const handleJumpToNow = () => {
    // Switch to today first if not already
    setSelectedDayIdx(defaultDayIndex);
    setSelectedCategory('all');
    setSearchQuery('');
    setTimeout(() => {
      activeShowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  return (
    <section id="raspored" className="py-12 bg-[#080b11] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-widest mb-1.5">
              <Calendar className="w-4 h-4" />
              <span>Elektronski Programski Vodič (EPG)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-display tracking-tight">
              Programska Šema K37
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Kompletan raspored emitovanja za 7 dana. Izaberite dan, filtrirajte po kategorijama i postavite podsetnike za vaše omiljene emisije.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Drag & Drop button */}
            {onOpenEditor && (
              <button
                onClick={onOpenEditor}
                className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 rounded-xl border border-red-500/50 flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/30 whitespace-nowrap"
                title="Otključaj zaštićenu zonu za Drag & Drop uređivanje programske šeme (Šifra/PIN: 3737)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Uredi Šemu (Drag & Drop)</span>
              </button>
            )}

            {/* Jump to now button */}
            <button
              onClick={handleJumpToNow}
              className="px-3.5 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>Skoči na trenutnu emisiju</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'timeline' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Vremenska Linija
              </button>
            </div>
          </div>
        </div>

        {/* 7-Days Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
          {weeklySchedule.map((day, idx) => {
            const isSelected = selectedDayIdx === idx;
            return (
              <button
                key={day.dayId}
                onClick={() => setSelectedDayIdx(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-red-950/40 border-red-600 text-white shadow-lg shadow-red-900/20'
                    : 'bg-[#0d121d] border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                {day.isToday && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    Danas
                  </span>
                )}
                <div className="text-xs font-bold tracking-tight mb-0.5">
                  {day.dayName}
                </div>
                <div className="font-mono text-xs text-slate-400">
                  {day.dateString}
                </div>
              </button>
            );
          })}
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-[#0d121d] border border-slate-800 rounded-2xl p-4 mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Category Segmented Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Sve emisije' },
                { id: 'informativni', label: 'Informativni' },
                { id: 'sport', label: 'Sport' },
                { id: 'film_serija', label: 'Filmovi & Serije' },
                { id: 'dokumentarni', label: 'Dokumentarni' },
                { id: 'zabavni', label: 'Zabavni' },
                { id: 'kultura', label: 'Kultura' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretraži po nazivu ili voditelju..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Secondary Checkboxes */}
          <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={onlyLive}
                onChange={(e) => setOnlyLive(e.target.checked)}
                className="rounded border-slate-700 text-red-600 focus:ring-red-500 bg-slate-900"
              />
              <span>Samo prenosi uživo</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={onlyPremiere}
                onChange={(e) => setOnlyPremiere(e.target.checked)}
                className="rounded border-slate-700 text-red-600 focus:ring-red-500 bg-slate-900"
              />
              <span>Samo premijere</span>
            </label>

            <span className="text-slate-500 ml-auto font-mono text-[11px]">
              Prikazano: <strong className="text-slate-300">{filteredPrograms.length}</strong> od {currentDay.programs.length} emisija
            </span>
          </div>
        </div>

        {/* Content View 1: Detailed List View */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {filteredPrograms.length === 0 ? (
              <div className="p-12 text-center bg-[#0d121d] border border-slate-800 rounded-2xl">
                <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-1">Nema pronađenih emisija</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Pokušajte sa drugačijim kriterijumima pretrage ili izaberite drugu kategoriju programa.
                </p>
                <button
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setOnlyLive(false); setOnlyPremiere(false); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
                >
                  Poništi sve filtere
                </button>
              </div>
            ) : (
              filteredPrograms.map((prog) => {
                const isCurrent = currentDay.isToday && prog.id === currentShowId;
                const reminderOn = hasReminder(prog.id);

                return (
                  <div
                    key={prog.id}
                    ref={isCurrent ? activeShowRef : null}
                    onClick={() => onSelectProgram(prog)}
                    className={`group relative rounded-xl border p-4 sm:p-5 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-red-950/40 via-[#0d121d] to-[#0d121d] border-red-500/80 shadow-lg shadow-red-900/20'
                        : 'bg-[#0d121d] border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    {/* Time & On-Air badge block */}
                    <div className="flex items-center gap-4 min-w-[170px] shrink-0">
                      <div className="text-left font-mono">
                        <div className="text-base sm:text-lg font-extrabold text-white flex items-center gap-1.5">
                          <span>{prog.startTime}</span>
                          <span className="text-slate-600 text-xs font-normal">- {prog.endTime}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {prog.durationMinutes} minuta
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          UŽIVO
                        </span>
                      ) : prog.isLive ? (
                        <span className="bg-slate-800 text-red-400 border border-red-900/40 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                          Uživo
                        </span>
                      ) : null}
                    </div>

                    {/* Show Information */}
                    <div className="flex-1 min-w-0">
                      {/* Zero-Pill metadata */}
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 font-medium">
                        <span className="capitalize text-red-400 font-semibold">{prog.category.replace('_', ' ')}</span>
                        <span aria-hidden="true">·</span>
                        <span>{prog.channelName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-400">{prog.ageRating}</span>
                        {prog.presenter && (
                          <>
                            <span aria-hidden="true" className="hidden sm:inline">·</span>
                            <span className="hidden sm:inline text-slate-300">Voditelj: {prog.presenter}</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-red-400 transition-colors truncate">
                        {prog.title}
                      </h3>

                      {/* Slika emisije ispod naziva programa */}
                      {prog.image && (
                        <div className="mt-2.5 mb-2 relative overflow-hidden rounded-xl w-full max-w-xs sm:max-w-sm aspect-video max-h-36 bg-[#070a12] border border-slate-800/80 shadow-md group-hover:border-slate-700 transition-colors">
                          <img
                            src={prog.image}
                            alt={prog.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          {prog.isPremiere && (
                            <span className="absolute top-2 left-2 bg-red-600/95 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-md backdrop-blur-sm">
                              PREMIJERA
                            </span>
                          )}
                          <span className="absolute bottom-1.5 right-2 text-[10px] font-mono text-slate-300 bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-sm">
                            {prog.durationMinutes} min
                          </span>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mt-0.5">
                        {prog.subtitle || prog.description}
                      </p>
                    </div>

                    {/* Actions: Watch live / Set Reminder / View Details */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                      {isCurrent ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onWatchLive();
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Gledaj</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleReminder(prog.id);
                          }}
                          className={`px-3 py-2 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                            reminderOn
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800'
                          }`}
                          title={reminderOn ? 'Ukloni podsetnik' : 'Podseti me'}
                        >
                          {reminderOn ? <BellRing className="w-3.5 h-3.5 text-amber-400" /> : <Bell className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{reminderOn ? 'Podsetnik' : 'Podseti me'}</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProgram(prog);
                        }}
                        className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
                        title="Detalji emisije"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Content View 2: Horizontal Timeline Grid */}
        {viewMode === 'timeline' && (
          <div className="bg-[#0d121d] border border-slate-800 rounded-2xl p-6 overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Timeline Hour Markers */}
              <div className="grid grid-cols-6 border-b border-slate-800 pb-3 mb-4 text-xs font-mono text-slate-400 font-semibold">
                <div>06:00 - 09:00 (Jutro)</div>
                <div>09:00 - 12:00 (Prepodne)</div>
                <div>12:00 - 15:00 (Podne)</div>
                <div>15:00 - 18:00 (Popodne)</div>
                <div>18:00 - 22:00 (Prajm-tajm)</div>
                <div>22:00 - 02:00 (Kasni program)</div>
              </div>

              {/* Visual Show Blocks */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-600" />
                  <span>K37 HD Glavni Kanal</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredPrograms.map(prog => {
                    const isCurrent = currentDay.isToday && prog.id === currentShowId;
                    return (
                      <div
                        key={prog.id}
                        onClick={() => onSelectProgram(prog)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] ${
                          isCurrent
                            ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-900/30'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                          <span className="font-bold text-red-400">{prog.startTime}</span>
                          <span className="text-[11px] text-slate-400">{prog.durationMinutes}m</span>
                        </div>
                        <h4 className="font-bold text-sm text-white line-clamp-1 mb-1">
                          {prog.title}
                        </h4>
                        {/* Slika emisije ispod naziva programa u vremenskoj liniji */}
                        {prog.image && (
                          <div className="my-1.5 rounded-lg overflow-hidden aspect-video bg-black/60 border border-slate-800">
                            <img src={prog.image} alt={prog.title} loading="lazy" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="text-xs text-slate-400 capitalize truncate">
                          {prog.category.replace('_', ' ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
