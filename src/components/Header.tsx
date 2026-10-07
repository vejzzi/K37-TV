import React, { useState } from 'react';
import { Tv, Radio, Search, Calendar, Bell, Menu, X, Sparkles, Send, Lock } from 'lucide-react';
import { BREAKING_NEWS } from '../data/tvData';
import k37BadgeImg from '../assets/images/k37_gradient_logo_badge.png';

interface HeaderProps {
  onOpenLive: () => void;
  onOpenSchedule: () => void;
  onOpenShows: () => void;
  onOpenNews: () => void;
  onOpenFrequencies: () => void;
  onOpenReporterModal: () => void;
  onOpenEditor?: () => void;
  activeRemindersCount: number;
  onOpenReminders: () => void;
  tickerHeadlines?: string[];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLive,
  onOpenSchedule,
  onOpenShows,
  onOpenNews,
  onOpenFrequencies,
  onOpenReporterModal,
  onOpenEditor,
  activeRemindersCount,
  onOpenReminders,
  tickerHeadlines
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#080b11]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Strict Top Bar Contract: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Zone 1: Official K37 Gradient Logo Badge (Prominent Brand Header without extra text) */}
        <a 
          href="#top" 
          className="flex items-center group shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded-xl transition-transform active:scale-95"
          title="Televizija K37 - Početna"
          aria-label="K37 Početna"
        >
          <div className="relative overflow-hidden rounded-xl border border-slate-700/80 shadow-lg shadow-black/70 group-hover:border-slate-500/90 transition-all duration-200 bg-[#090d14]">
            <img
              src={k37BadgeImg}
              alt="K37"
              className="h-10 sm:h-12 md:h-13 w-auto max-w-[170px] sm:max-w-[210px] md:max-w-[245px] lg:max-w-[265px] object-cover block group-hover:scale-[1.02] transition-transform duration-200"
            />
          </div>
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button 
            onClick={onOpenLive}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Uživo
          </button>
          <button 
            onClick={onOpenSchedule} 
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Programska Šema
          </button>
          <button 
            onClick={onOpenShows} 
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Emisije & VOD
          </button>
          <button 
            onClick={onOpenNews} 
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Vesti
          </button>
          <button 
            onClick={onOpenFrequencies} 
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Frekvencije
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Admin Drag & Drop CMS Button */}
          <button
            onClick={onOpenEditor}
            className="flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 transition-all border border-red-500/50 whitespace-nowrap cursor-pointer shadow-lg shadow-red-600/30"
            title="Administratorska zona: Uređivanje programske šeme Drag & Drop metodom (Šifra/PIN: 3737)"
          >
            <Lock className="w-3.5 h-3.5 text-white" />
            <span>Admin Drag & Drop</span>
          </button>

          {/* Reporter tip button */}
          <button
            onClick={onOpenReporterModal}
            className="hidden lg:flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all border border-slate-700/60 whitespace-nowrap cursor-pointer"
            title="Pošaljite vest ili snimak redakciji K37"
          >
            <Send className="w-3.5 h-3.5 text-red-400" />
            <span>Dojavi vest</span>
          </button>

          {/* Active reminders badge */}
          {activeRemindersCount > 0 && (
            <button
              onClick={onOpenReminders}
              className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={`${activeRemindersCount} sačuvanih podsetnika za emisije`}
              aria-label="Podsetnici za emisije"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeRemindersCount}
              </span>
            </button>
          )}

          {/* Primary Action Button: Gledaj Uživo */}
          <button
            onClick={onOpenLive}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-all shadow-lg shadow-red-600/30 flex items-center gap-2 whitespace-nowrap cursor-pointer hover:shadow-red-600/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span>Gledaj Uživo</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            aria-label="Otvori navigacioni meni"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d121d] border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">
          <div className="flex flex-col gap-2 text-base font-medium">
            <button
              onClick={() => { onOpenLive(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-left text-red-400 hover:bg-slate-800/80"
            >
              <Radio className="w-4 h-4" />
              <span>Program Uživo</span>
            </button>
            <button
              onClick={() => { onOpenSchedule(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-left text-slate-200 hover:bg-slate-800/80"
            >
              <Calendar className="w-4 h-4" />
              <span>Programska Šema (EPG)</span>
            </button>
            <button
              onClick={() => { onOpenShows(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-left text-slate-200 hover:bg-slate-800/80"
            >
              <Tv className="w-4 h-4" />
              <span>Emisije & Video Arhiva</span>
            </button>
            <button
              onClick={() => { onOpenNews(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-left text-slate-200 hover:bg-slate-800/80"
            >
              <Sparkles className="w-4 h-4" />
              <span>Vesti & Izveštaji</span>
            </button>
            <button
              onClick={() => { onOpenFrequencies(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-left text-slate-200 hover:bg-slate-800/80"
            >
              <Tv className="w-4 h-4" />
              <span>Kako nas gledati (Frekvencije)</span>
            </button>
            <button
              onClick={() => { onOpenReporterModal(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-left text-amber-400 hover:bg-slate-800/80"
            >
              <Send className="w-4 h-4" />
              <span>Dojavi vest redakciji</span>
            </button>
          </div>
        </div>
      )}

      {/* Breaking News Ticker Bar */}
      <div className="bg-[#121824] border-t border-b border-slate-800/90 py-1.5 px-4 overflow-hidden relative flex items-center">
        <div className="shrink-0 flex items-center gap-2 pr-4 border-r border-slate-700/80 z-10 bg-[#121824]">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          <span className="text-[11px] font-black tracking-wider text-red-500 uppercase whitespace-nowrap">
            INFO K37
          </span>
        </div>

        <div className="overflow-hidden w-full ml-4 whitespace-nowrap">
          <div className="inline-block animate-ticker text-xs text-slate-300 font-medium">
            {(tickerHeadlines || BREAKING_NEWS).map((headline, idx) => (
              <span key={idx} className="mr-12">
                <span className="text-red-400 font-bold mr-2">/</span>
                {headline}
              </span>
            ))}
            {/* Repeat for seamless loop */}
            {(tickerHeadlines || BREAKING_NEWS).map((headline, idx) => (
              <span key={`rep-${idx}`} className="mr-12">
                <span className="text-red-400 font-bold mr-2">/</span>
                {headline}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
