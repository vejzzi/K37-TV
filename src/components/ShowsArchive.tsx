import React, { useState } from 'react';
import { Tv, Play, User, Calendar, Clock, ChevronRight, Eye } from 'lucide-react';
import { FEATURED_SHOWS, FeaturedShow } from '../data/tvData';

interface ShowsArchiveProps {
  onWatchEpisode: (title: string, showImage: string) => void;
}

export const ShowsArchive: React.FC<ShowsArchiveProps> = ({ onWatchEpisode }) => {
  const [selectedShow, setSelectedShow] = useState<FeaturedShow>(FEATURED_SHOWS[0]);

  return (
    <section id="emisije" className="py-14 bg-[#0a0d14] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-widest mb-1.5">
              <Tv className="w-4 h-4" />
              <span>Autorska Produkcija & Arhiva</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-display tracking-tight">
              K37 Emisije & Video na Zahtev
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Gledajte propuštene epizode naših najpopularnijih informativnih, političkih, sportskih i dokumentarnih emisija u bilo koje vreme.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Dostupno u Full HD i 4K rezoluciji
          </div>
        </div>

        {/* Show Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {FEATURED_SHOWS.map((show) => {
            const isActive = selectedShow.id === show.id;
            return (
              <button
                key={show.id}
                onClick={() => setSelectedShow(show)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-900 border-red-500 text-white shadow-lg shadow-red-900/10 ring-1 ring-red-500/50'
                    : 'bg-[#0d121d] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="text-[11px] font-mono text-red-400 mb-1">
                    {show.category.split(' ')[0]}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base leading-snug">
                    {show.title}
                  </h3>
                </div>
                <div className="text-xs text-slate-400 mt-2 font-medium">
                  {show.airTime}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Show Spotlight Banner */}
        <div className="bg-[#0d121d] border border-slate-800 rounded-2xl overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* Show Image / Visual (5 cols) */}
            <div className="lg:col-span-5 relative min-h-[260px] sm:min-h-[320px] bg-slate-900">
              <img
                src={selectedShow.image}
                alt={selectedShow.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover brightness-[0.8]"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent to-[#0d121d]" />
              
              <div className="absolute bottom-4 left-4 z-10">
                <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded uppercase tracking-wider">
                  K37 ORIGINALS
                </span>
              </div>
            </div>

            {/* Show Details (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <span className="text-red-400 font-semibold">{selectedShow.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-300">{selectedShow.airTime}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-2">
                  {selectedShow.title}
                </h3>

                <p className="text-sm font-semibold text-slate-300 italic mb-4">
                  "{selectedShow.tagline}"
                </p>

                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {selectedShow.description}
                </p>

                {/* Host Info */}
                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 max-w-md">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <User className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{selectedShow.host}</div>
                    <div className="text-[11px] text-slate-400">{selectedShow.hostRole}</div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Ukupno u arhivi: <strong className="text-white font-mono">{selectedShow.episodesCount}</strong> epizoda</span>
                <span className="text-slate-300">Dostupno besplatno za sve posetioce</span>
              </div>
            </div>

          </div>
        </div>

        {/* Recent Episodes Grid */}
        <div>
          <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2 font-display">
            <span>Poslednje epizode emisije "{selectedShow.title}"</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedShow.episodes.map((ep) => (
              <div
                key={ep.id}
                onClick={() => onWatchEpisode(ep.title, selectedShow.image)}
                className="group bg-[#0d121d] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between hover:bg-slate-900/80"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                    <span className="text-red-400 font-semibold">{ep.airDate}</span>
                    <span>{ep.duration}</span>
                  </div>

                  <h5 className="font-bold text-sm sm:text-base text-white group-hover:text-red-400 transition-colors line-clamp-2 mb-2">
                    {ep.title}
                  </h5>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {ep.synopsis}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    {ep.views}
                  </span>
                  
                  <button
                    className="text-xs font-bold text-white group-hover:text-red-400 flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Gledaj</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
