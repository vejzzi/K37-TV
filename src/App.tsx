/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CurrentOnAirHero } from './components/CurrentOnAirHero';
import { LivePlayer } from './components/LivePlayer';
import { ScheduleSection } from './components/ScheduleSection';
import { ProgramModal } from './components/ProgramModal';
import { ShowsArchive } from './components/ShowsArchive';
import { NewsSection } from './components/NewsSection';
import { FrequenciesSection } from './components/FrequenciesSection';
import { ReporterContactModal } from './components/ReporterContactModal';
import { RemindersDrawer } from './components/RemindersDrawer';
import { Footer } from './components/Footer';
import { VidiyoPlayer } from './components/VidiyoPlayer';
import { AdminEditorModal } from './components/AdminEditorModal';
import { 
  generateWeeklySchedule, 
  getCurrentlyAiringShow, 
  ProgramItem, 
  DaySchedule,
  NewsArticle,
  NEWS_ARTICLES,
  BREAKING_NEWS,
  IMAGES 
} from './data/tvData';
import { Check, Bell, BellRing, Play, X, Radio, Sparkles } from 'lucide-react';
import { 
  testFirebaseConnection, 
  loadFirestoreSchedule, 
  saveFirestoreSchedule, 
  loadFirestoreNews, 
  saveFirestoreNews, 
  loadFirestoreTicker, 
  saveFirestoreTicker 
} from './firebase';

export default function App() {
  // Weekly Schedule Data with LocalStorage & Server Sync
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(() => {
    try {
      const saved = localStorage.getItem('k37_schedule');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return generateWeeklySchedule();
  });

  // Sync with Firebase Firestore and server DB on initial mount
  useEffect(() => {
    testFirebaseConnection();

    // 1. Učitaj podatke iz Firebase Firestore
    loadFirestoreSchedule().then(firestoreSched => {
      if (firestoreSched && Array.isArray(firestoreSched) && firestoreSched.length > 0) {
        setWeeklySchedule(firestoreSched);
        localStorage.setItem('k37_schedule', JSON.stringify(firestoreSched));
      }
    });

    loadFirestoreNews().then(firestoreNews => {
      if (firestoreNews && Array.isArray(firestoreNews) && firestoreNews.length > 0) {
        setNewsArticles(firestoreNews);
        localStorage.setItem('k37_news', JSON.stringify(firestoreNews));
      }
    });

    loadFirestoreTicker().then(firestoreTicker => {
      if (firestoreTicker && Array.isArray(firestoreTicker) && firestoreTicker.length > 0) {
        setTickerHeadlines(firestoreTicker);
        localStorage.setItem('k37_ticker', JSON.stringify(firestoreTicker));
      }
    });

    // 2. Sinhronizuj i sa lokalnim serverom kao rezervu
    fetch('/api/v1/content/db')
      .then(res => res.json())
      .then(data => {
        if (data.schedule && Array.isArray(data.schedule) && data.schedule.length > 0) {
          setWeeklySchedule(prev => prev.length > 0 ? prev : data.schedule);
        }
        if (data.news && Array.isArray(data.news) && data.news.length > 0) {
          setNewsArticles(prev => prev.length > 0 ? prev : data.news);
        }
        if (data.ticker && Array.isArray(data.ticker) && data.ticker.length > 0) {
          setTickerHeadlines(prev => prev.length > 0 ? prev : data.ticker);
        }
      })
      .catch(() => {});
  }, []);

  // Secret keyboard shortcut (Ctrl + Alt + A) & Hash trigger (#admin)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminEditorOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);

    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminEditorOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  const syncToServer = (sched?: DaySchedule[], news?: NewsArticle[], tick?: string[]) => {
    const s = sched || weeklySchedule;
    const n = news || newsArticles;
    const t = tick || tickerHeadlines;

    // Sinhronizuj sa Firebase Firestore bazom
    saveFirestoreSchedule(s);
    saveFirestoreNews(n);
    saveFirestoreTicker(t);

    // Sinhronizuj i sa Express serverom
    fetch('/api/v1/admin/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schedule: s,
        news: n,
        ticker: t,
      })
    }).catch(() => {});
  };

  const handleUpdateSchedule = (newSchedule: DaySchedule[]) => {
    setWeeklySchedule(newSchedule);
    try {
      localStorage.setItem('k37_schedule', JSON.stringify(newSchedule));
    } catch (e) {
      console.error(e);
    }
    syncToServer(newSchedule);
  };

  // News Articles with LocalStorage Persistence
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(() => {
    try {
      const saved = localStorage.getItem('k37_news');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return NEWS_ARTICLES;
  });

  const handleUpdateNews = (newNews: NewsArticle[]) => {
    setNewsArticles(newNews);
    try {
      localStorage.setItem('k37_news', JSON.stringify(newNews));
    } catch (e) {
      console.error(e);
    }
    syncToServer(undefined, newNews);
  };

  // Ticker Headlines with LocalStorage Persistence
  const [tickerHeadlines, setTickerHeadlines] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('k37_ticker');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return BREAKING_NEWS;
  });

  const handleUpdateTicker = (newTicker: string[]) => {
    setTickerHeadlines(newTicker);
    try {
      localStorage.setItem('k37_ticker', JSON.stringify(newTicker));
    } catch (e) {
      console.error(e);
    }
    syncToServer(undefined, undefined, newTicker);
  };

  // Official Vidiyo Embed URL
  const [embedUrl, setEmbedUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('k37_embed_url') || 'https://vidiyo.com/embed/watch/k37';
    } catch {
      return 'https://vidiyo.com/embed/watch/k37';
    }
  });

  const handleUpdateEmbedUrl = (newUrl: string) => {
    setEmbedUrl(newUrl);
    try {
      localStorage.setItem('k37_embed_url', newUrl);
    } catch (e) {
      console.error(e);
    }
  };

  // Reset to default broadcast template
  const handleResetToDefaults = () => {
    const defaultSched = generateWeeklySchedule();
    setWeeklySchedule(defaultSched);
    setNewsArticles(NEWS_ARTICLES);
    setTickerHeadlines(BREAKING_NEWS);
    setEmbedUrl('https://vidiyo.com/embed/watch/k37');
    try {
      localStorage.removeItem('k37_schedule');
      localStorage.removeItem('k37_news');
      localStorage.removeItem('k37_ticker');
      localStorage.removeItem('k37_embed_url');
    } catch (e) {
      console.error(e);
    }
  };

  // Find Today's day schedule
  const todaySchedule = useMemo(() => {
    return weeklySchedule.find(d => d.isToday) || weeklySchedule[0];
  }, [weeklySchedule]);

  // Current On-Air show calculation with periodic re-evaluation
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setCurrentMinutes(d.getHours() * 60 + d.getMinutes());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const onAirData = useMemo(() => {
    return getCurrentlyAiringShow(todaySchedule.programs, currentMinutes);
  }, [todaySchedule, currentMinutes]);

  // Modal & Drawer States
  const [isLivePlayerOpen, setIsLivePlayerOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramItem | null>(null);
  const [isReporterModalOpen, setIsReporterModalOpen] = useState(false);
  const [isRemindersDrawerOpen, setIsRemindersDrawerOpen] = useState(false);
  const [isAdminEditorOpen, setIsAdminEditorOpen] = useState(false);

  // VOD / Episode player overlay state
  const [vodEpisode, setVodEpisode] = useState<{ title: string; image: string } | null>(null);

  // Reminders state synced with localStorage
  const [reminders, setReminders] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('k37_reminders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleReminder = (progId: string) => {
    setReminders(prev => {
      let updated: string[];
      if (prev.includes(progId)) {
        updated = prev.filter(id => id !== progId);
        showToast('Podsetnik je uklonjen.');
      } else {
        updated = [...prev, progId];
        const allProgs = weeklySchedule.flatMap(d => d.programs);
        const p = allProgs.find(item => item.id === progId);
        showToast(`Podsetnik postavljen za emisiju "${p?.title || 'Odabrana emisija'}"!`);
      }
      try {
        localStorage.setItem('k37_reminders', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleClearAllReminders = () => {
    setReminders([]);
    try {
      localStorage.removeItem('k37_reminders');
    } catch (e) {
      console.error(e);
    }
    showToast('Svi podsetnici su uklonjeni.');
  };

  const hasReminder = (progId: string) => reminders.includes(progId);

  // Smooth scroll helpers
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Flattened programs list for reminders lookup
  const allWeeklyPrograms = useMemo(() => {
    return weeklySchedule.flatMap(d => d.programs);
  }, [weeklySchedule]);

  return (
    <div className="min-h-screen bg-[#060910] text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white relative overflow-x-hidden" id="top">
      {/* Ambient Modern Broadcast Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-red-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[35%] -left-48 w-[600px] h-[600px] bg-red-600/5 blur-[160px] rounded-full" />
        <div className="absolute top-[70%] -right-48 w-[600px] h-[600px] bg-blue-600/5 blur-[160px] rounded-full" />
      </div>

      {/* Header with Top Bar Contract compliance */}
      <Header
        onOpenLive={() => setIsLivePlayerOpen(true)}
        onOpenSchedule={() => scrollToSection('raspored')}
        onOpenShows={() => scrollToSection('emisije')}
        onOpenNews={() => scrollToSection('vesti')}
        onOpenFrequencies={() => scrollToSection('frekvencije')}
        onOpenReporterModal={() => setIsReporterModalOpen(true)}
        onOpenEditor={() => setIsAdminEditorOpen(true)}
        activeRemindersCount={reminders.length}
        onOpenReminders={() => setIsRemindersDrawerOpen(true)}
        tickerHeadlines={tickerHeadlines}
      />

      {/* Main Broadcaster Content */}
      <main className="flex-1">
        
        {/* Core Requirement 1: Šta je trenutno na programu & Sledeće & Zvanični Vidiyo Player */}
        <CurrentOnAirHero
          programs={todaySchedule.programs}
          onOpenLiveModal={() => setIsLivePlayerOpen(true)}
          onSelectProgram={(prog) => setSelectedProgram(prog)}
          onToggleReminder={handleToggleReminder}
          hasReminder={hasReminder}
        />

        {/* Core Requirement 2: Kompletna programska šema (EPG) */}
        <ScheduleSection
          weeklySchedule={weeklySchedule}
          currentShowId={onAirData.currentShow.id}
          onSelectProgram={(prog) => setSelectedProgram(prog)}
          onToggleReminder={handleToggleReminder}
          hasReminder={hasReminder}
          onWatchLive={() => setIsLivePlayerOpen(true)}
          onOpenEditor={() => setIsAdminEditorOpen(true)}
        />

        {/* Core Requirement 3: Emisije K37 & Video na Zahtev (VOD) */}
        <ShowsArchive
          onWatchEpisode={(title, image) => setVodEpisode({ title, image })}
        />

        {/* Core Requirement 4: Najnovije vesti & Dopisnička mreža */}
        <NewsSection 
          articles={newsArticles}
        />

        {/* Core Requirement 5: Frekvencije i distributivna mreža operatora */}
        <FrequenciesSection />

      </main>

      {/* Broadcaster Footer */}
      <Footer
        onOpenLive={() => setIsLivePlayerOpen(true)}
        onOpenSchedule={() => scrollToSection('raspored')}
        onOpenShows={() => scrollToSection('emisije')}
        onOpenNews={() => scrollToSection('vesti')}
        onOpenFrequencies={() => scrollToSection('frekvencije')}
        onOpenReporterModal={() => setIsReporterModalOpen(true)}
        onOpenEditor={() => setIsAdminEditorOpen(true)}
      />

      {/* Live Stream Player Modal (Full Theater & Poll View) */}
      <LivePlayer
        currentShow={onAirData.currentShow}
        isOpen={isLivePlayerOpen}
        onClose={() => setIsLivePlayerOpen(false)}
      />

      {/* Program Details Modal */}
      <ProgramModal
        program={selectedProgram}
        isOpen={selectedProgram !== null}
        onClose={() => setSelectedProgram(null)}
        onToggleReminder={handleToggleReminder}
        hasReminder={selectedProgram ? hasReminder(selectedProgram.id) : false}
        onWatchLive={() => {
          setSelectedProgram(null);
          setIsLivePlayerOpen(true);
        }}
        isCurrentlyOnAir={selectedProgram ? selectedProgram.id === onAirData.currentShow.id : false}
      />

      {/* VOD / Episode Player Modal */}
      {vodEpisode && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#0d121d] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 bg-[#121824] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[11px] font-black uppercase px-2 py-0.5 rounded">
                  K37 VOD
                </span>
                <span className="text-white font-bold text-sm truncate max-w-md">
                  {vodEpisode.title}
                </span>
              </div>
              <button
                onClick={() => setVodEpisode(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Zatvori video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <VidiyoPlayer
                embedUrl={embedUrl}
                showTitle={vodEpisode.title}
                showSubtitle="Epizoda iz arhive Televizije K37"
                className="w-full h-full"
              />
            </div>

            <div className="p-4 bg-[#0d121d] text-xs text-slate-400 flex items-center justify-between">
              <span>Reprodukcija video sadržaja na zahtev Televizije K37</span>
              <button
                onClick={() => setVodEpisode(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold cursor-pointer"
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Web Editor & CMS Modal */}
      <AdminEditorModal
        isOpen={isAdminEditorOpen}
        onClose={() => setIsAdminEditorOpen(false)}
        weeklySchedule={weeklySchedule}
        onUpdateSchedule={handleUpdateSchedule}
        newsArticles={newsArticles}
        onUpdateNews={handleUpdateNews}
        tickerHeadlines={tickerHeadlines}
        onUpdateTicker={handleUpdateTicker}
        embedUrl={embedUrl}
        onUpdateEmbedUrl={handleUpdateEmbedUrl}
        onResetToDefaults={handleResetToDefaults}
        onShowToast={showToast}
      />

      {/* Reporter "Dojavi vest" Modal */}
      <ReporterContactModal
        isOpen={isReporterModalOpen}
        onClose={() => setIsReporterModalOpen(false)}
      />

      {/* Saved Reminders Drawer */}
      <RemindersDrawer
        isOpen={isRemindersDrawerOpen}
        onClose={() => setIsRemindersDrawerOpen(false)}
        reminders={reminders}
        programs={allWeeklyPrograms}
        onRemoveReminder={handleToggleReminder}
        onClearAll={handleClearAllReminders}
        onSelectProgram={(prog) => {
          setIsRemindersDrawerOpen(false);
          setSelectedProgram(prog);
        }}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121824] border border-red-500/60 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
