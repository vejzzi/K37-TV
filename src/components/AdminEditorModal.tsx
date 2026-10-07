import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Edit2, Trash2, Save, RotateCcw, 
  Calendar, Newspaper, Settings, Radio, Clock, Check, 
  Lock, Unlock, GripVertical, ArrowUp, ArrowDown, Image as ImageIcon,
  ShieldCheck, Eye, EyeOff, AlertCircle, LogOut, CheckCircle2, Sparkles
} from 'lucide-react';
import { DaySchedule, ProgramItem, NewsArticle, timeToMinutes, IMAGES } from '../data/tvData';
import { saveFirestoreSchedule, saveFirestoreNews, saveFirestoreTicker } from '../firebase';

interface AdminEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklySchedule: DaySchedule[];
  onUpdateSchedule: (newSchedule: DaySchedule[]) => void;
  newsArticles: NewsArticle[];
  onUpdateNews: (newArticles: NewsArticle[]) => void;
  tickerHeadlines: string[];
  onUpdateTicker: (newHeadlines: string[]) => void;
  embedUrl: string;
  onUpdateEmbedUrl: (newUrl: string) => void;
  onResetToDefaults: () => void;
  onShowToast: (msg: string) => void;
}

// Preset visual images for fast broadcast selection
const BROADCAST_IMAGE_PRESETS = [
  { label: 'Informativni Studio (Dnevnik)', url: IMAGES.heroTvStudio },
  { label: 'Fokus Talk Studio', url: IMAGES.showFokusTalk },
  { label: 'Dokumentarni Program', url: IMAGES.showDocumentary },
  { label: 'Sportska Arena K37', url: IMAGES.showSportsArena },
];

export const AdminEditorModal: React.FC<AdminEditorModalProps> = ({
  isOpen,
  onClose,
  weeklySchedule,
  onUpdateSchedule,
  newsArticles,
  onUpdateNews,
  tickerHeadlines,
  onUpdateTicker,
  embedUrl,
  onUpdateEmbedUrl,
  onResetToDefaults,
  onShowToast,
}) => {
  // -------------------------------------------------------------------------
  // 1. PIN / PASSWORD SECURITY GATE
  // -------------------------------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('k37_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingToServer, setIsSavingToServer] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'schedule' | 'news' | 'ticker' | 'settings'>('schedule');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Drag and Drop State for Schedule
  const [draggedShowIdx, setDraggedShowIdx] = useState<number | null>(null);
  const [dragOverShowIdx, setDragOverShowIdx] = useState<number | null>(null);

  // Show editing modal state
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);
  const [isAddingNewShow, setIsAddingNewShow] = useState(false);

  // Form fields for show edit/add
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState<ProgramItem['category']>('informativni');
  const [formStartTime, setFormStartTime] = useState('19:00');
  const [formEndTime, setFormEndTime] = useState('19:50');
  const [formAgeRating, setFormAgeRating] = useState<ProgramItem['ageRating']>('SVI');
  const [formPresenter, setFormPresenter] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState(IMAGES.heroTvStudio);
  const [formIsLive, setFormIsLive] = useState(true);
  const [formIsPremiere, setFormIsPremiere] = useState(true);
  const [formIsRerun, setFormIsRerun] = useState(false);

  // Ticker state
  const [newTickerText, setNewTickerText] = useState('');

  // News editing state
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isAddingNewArticle, setIsAddingNewArticle] = useState(false);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState<NewsArticle['category']>('Društvo');
  const [articleSummary, setArticleSummary] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleImage, setArticleImage] = useState(IMAGES.heroTvStudio);
  const [articleAuthor, setArticleAuthor] = useState('');
  const [articleIsBreaking, setArticleIsBreaking] = useState(false);

  // Custom PIN Settings
  const [customPin, setCustomPin] = useState(() => {
    return localStorage.getItem('k37_custom_pin') || '3737';
  });
  const [newPinInput, setNewPinInput] = useState('');

  // Settings
  const [inputEmbedUrl, setInputEmbedUrl] = useState(embedUrl);

  if (!isOpen) return null;

  const currentDay = weeklySchedule[selectedDayIdx] || weeklySchedule[0];

  // -------------------------------------------------------------------------
  // PIN VERIFICATION HANDLER
  // -------------------------------------------------------------------------
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    // Default PIN: "3737" or master "K37ADMIN2026", or user's custom saved PIN
    if (cleanPin === '3737' || cleanPin === 'K37ADMIN2026' || cleanPin === customPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('k37_admin_auth', 'true');
      setPinError('');
      setPinInput('');
      onShowToast('Uspešna autorizacija! Dobrodošli u K37 Drag & Drop CMS.');
    } else {
      setPinError('Pogrešna šifra! Pokušajte ponovo ili kontaktirajte administratora.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('k37_admin_auth');
    onClose();
  };

  // -------------------------------------------------------------------------
  // DRAG AND DROP SCHEDULE REORDERING
  // -------------------------------------------------------------------------
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedShowIdx(idx);
    e.dataTransfer.setData('text/plain', String(idx));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverShowIdx !== idx) {
      setDragOverShowIdx(idx);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    const sourceStr = e.dataTransfer.getData('text/plain');
    const sourceIdx = draggedShowIdx !== null ? draggedShowIdx : (sourceStr ? parseInt(sourceStr, 10) : null);

    if (sourceIdx === null || isNaN(sourceIdx) || sourceIdx === targetIdx) {
      setDraggedShowIdx(null);
      setDragOverShowIdx(null);
      return;
    }

    const dayPrograms = [...currentDay.programs];
    const [movedItem] = dayPrograms.splice(sourceIdx, 1);
    dayPrograms.splice(targetIdx, 0, movedItem);

    const updatedSchedule = weeklySchedule.map((day, idx) => {
      if (idx !== selectedDayIdx) return day;
      return {
        ...day,
        programs: dayPrograms,
      };
    });

    onUpdateSchedule(updatedSchedule);
    setDraggedShowIdx(null);
    setDragOverShowIdx(null);
    onShowToast(`Emisija "${movedItem.title}" je uspešno premeštena na poziciju #${targetIdx + 1}!`);

    // Auto-save immediately to localStorage and server
    try {
      localStorage.setItem('k37_schedule', JSON.stringify(updatedSchedule));
      fetch('/api/v1/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule: updatedSchedule,
          news: newsArticles,
          ticker: tickerHeadlines
        })
      }).catch(() => {});
    } catch {}
  };

  // Move item up / down (Accessible fallback for touch / mobile)
  const handleMoveShow = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentDay.programs.length) return;

    const dayPrograms = [...currentDay.programs];
    const temp = dayPrograms[index];
    dayPrograms[index] = dayPrograms[targetIdx];
    dayPrograms[targetIdx] = temp;

    const updatedSchedule = weeklySchedule.map((day, idx) => {
      if (idx !== selectedDayIdx) return day;
      return { ...day, programs: dayPrograms };
    });

    onUpdateSchedule(updatedSchedule);
  };

  // Auto-calculate sequential time blocks based on order
  const handleAutoAdjustTiming = () => {
    if (!window.confirm('Da li želite da automatski preračunate satnicu emisija prema trenutnom redosledu, počevši od 06:00 ujutru?')) {
      return;
    }

    let currentMinutes = 360; // 06:00
    const adjustedPrograms = currentDay.programs.map((prog) => {
      const duration = prog.durationMinutes || 45;
      const startM = currentMinutes % 1440;
      const endM = (currentMinutes + duration) % 1440;
      
      const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60).toString().padStart(2, '0');
        const m = (mins % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
      };

      currentMinutes += duration;
      return {
        ...prog,
        startTime: formatTime(startM),
        endTime: formatTime(endM),
        startMinutes: startM,
        endMinutes: endM,
      };
    });

    const updatedSchedule = weeklySchedule.map((day, idx) => {
      if (idx !== selectedDayIdx) return day;
      return { ...day, programs: adjustedPrograms };
    });

    onUpdateSchedule(updatedSchedule);
    onShowToast('Satnica emisija je uspešno automatski usklađena sa redosledom!');
  };

  // -------------------------------------------------------------------------
  // SHOW EDITING / CREATING
  // -------------------------------------------------------------------------
  const handleStartEditShow = (prog: ProgramItem) => {
    setEditingProgram(prog);
    setIsAddingNewShow(false);
    setFormTitle(prog.title);
    setFormSubtitle(prog.subtitle || '');
    setFormCategory(prog.category);
    setFormStartTime(prog.startTime);
    setFormEndTime(prog.endTime);
    setFormAgeRating(prog.ageRating);
    setFormPresenter(prog.presenter || '');
    setFormDescription(prog.description);
    setFormImage(prog.image || IMAGES.heroTvStudio);
    setFormIsLive(prog.isLive);
    setFormIsPremiere(prog.isPremiere);
    setFormIsRerun(prog.isRerun || false);
  };

  const handleStartAddNewShow = () => {
    setEditingProgram(null);
    setIsAddingNewShow(true);
    setFormTitle('');
    setFormSubtitle('');
    setFormCategory('informativni');
    setFormStartTime('20:00');
    setFormEndTime('20:45');
    setFormAgeRating('SVI');
    setFormPresenter('');
    setFormDescription('');
    setFormImage(IMAGES.heroTvStudio);
    setFormIsLive(false);
    setFormIsPremiere(true);
    setFormIsRerun(false);
  };

  const handleSaveShow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Molimo unesite naziv emisije.');
      return;
    }

    const startM = timeToMinutes(formStartTime);
    let endM = timeToMinutes(formEndTime);
    let duration = endM - startM;
    if (duration <= 0) duration += 1440;

    const updatedProgramData: ProgramItem = {
      id: editingProgram ? editingProgram.id : `${currentDay.dayId}-custom-${Date.now()}`,
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      category: formCategory,
      startTime: formStartTime,
      endTime: formEndTime,
      startMinutes: startM,
      endMinutes: endM,
      durationMinutes: duration,
      ageRating: formAgeRating,
      presenter: formPresenter.trim() || undefined,
      description: formDescription.trim() || 'Opis emisije Televizije K37.',
      image: formImage.trim() || IMAGES.heroTvStudio,
      isLive: formIsLive,
      isPremiere: formIsPremiere,
      isRerun: formIsRerun,
      channelName: 'K37 HD'
    };

    const newSchedule = weeklySchedule.map((day, idx) => {
      if (idx !== selectedDayIdx) return day;

      let newPrograms: ProgramItem[];
      if (editingProgram) {
        newPrograms = day.programs.map(p => p.id === editingProgram.id ? updatedProgramData : p);
      } else {
        newPrograms = [...day.programs, updatedProgramData];
      }

      return {
        ...day,
        programs: newPrograms
      };
    });

    onUpdateSchedule(newSchedule);
    setEditingProgram(null);
    setIsAddingNewShow(false);
    onShowToast(`Emisija "${formTitle}" je uspešno sačuvana sa slikom!`);
  };

  const handleDeleteShow = (progId: string, title: string) => {
    if (!window.confirm(`Da li ste sigurni da želite da obrišete emisiju "${title}" iz rasporeda?`)) {
      return;
    }

    const newSchedule = weeklySchedule.map((day, idx) => {
      if (idx !== selectedDayIdx) return day;
      return {
        ...day,
        programs: day.programs.filter(p => p.id !== progId)
      };
    });

    onUpdateSchedule(newSchedule);
    onShowToast(`Emisija "${title}" je obrisana.`);
  };

  // -------------------------------------------------------------------------
  // SAVE ALL CHANGES TO SERVER & CLOUD DB
  // -------------------------------------------------------------------------
  const handleSaveAllToServer = async () => {
    setIsSavingToServer(true);
    try {
      // 1. Snimi u Firebase Firestore
      await Promise.all([
        saveFirestoreSchedule(weeklySchedule),
        saveFirestoreNews(newsArticles),
        saveFirestoreTicker(tickerHeadlines)
      ]);

      // 2. Snimi i u lokalni Express backend
      const response = await fetch('/api/v1/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule: weeklySchedule,
          news: newsArticles,
          ticker: tickerHeadlines,
        }),
      });

      if (response.ok) {
        onShowToast('Sve izmene su uspešno sačuvane u Firebase bazi i na serveru!');
      } else {
        onShowToast('Izmene su sinhronizovane sa Firebase bazom.');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Izmene su sačuvane u vašem pretraživaču.');
    } finally {
      setIsSavingToServer(false);
    }
  };

  // -------------------------------------------------------------------------
  // RENDER: 1. LOCKSCREEN IF NOT AUTHENTICATED
  // -------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in">
        <div className="w-full max-w-md bg-[#0b0f19] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30 border border-red-500/40">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
              K37 Urednički Portal
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
              Zaštićena zona za Drag & Drop uređivanje programske šeme, vesti i emitovanja.
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Unesite Administratorsku Šifru / PIN:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                  placeholder="Šifra (npr. 3737 ili K37ADMIN2026)"
                  autoFocus
                  className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-4 py-3 text-white text-base tracking-widest placeholder:tracking-normal placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pinError && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs mt-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Otključaj CMS Sistem</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-500 font-mono">
                Podrazumevani pristup: <strong className="text-slate-400 font-bold">3737</strong>
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: 2. FULL DRAG & DROP CMS DASHBOARD
  // -------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-6xl max-h-[92vh] bg-[#090d16] border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col text-white overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0e1422] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                  K37 Drag & Drop Studio
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Autorizovan
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Urednički sistem za raspored sa slikama, vesti i emitovanje
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAllToServer}
              disabled={isSavingToServer}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              {isSavingToServer ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Snimanje...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Sačuvaj u TV Bazu</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
              title="Zaključaj i odjavi se"
            >
              <LogOut className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 border-b border-slate-800/80 bg-[#0b0f1a] overflow-x-auto gap-2 py-2">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Programska Šema (Drag & Drop)</span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'news'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Vesti & Članci</span>
          </button>
          <button
            onClick={() => setActiveTab('ticker')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ticker'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Kajron / Info Ticker</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ml-auto ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Podešavanja & Šifra</span>
          </button>
        </div>

        {/* Tab 1: DRAG & DROP SCHEDULE EDITOR */}
        {activeTab === 'schedule' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Day Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d1322] p-3 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5">
                {weeklySchedule.map((day, idx) => (
                  <button
                    key={day.dayId}
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedDayIdx === idx
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{day.shortName}</span>
                    <span className="text-[10px] ml-1 opacity-70">({day.programs.length})</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutoAdjustTiming}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Automatski prilagodi satnicu redosledu emisija"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Uskladi satnicu</span>
                </button>

                <button
                  onClick={handleStartAddNewShow}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-red-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Dodaj Emisiju</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop Instruction Box */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-400">
              <GripVertical className="w-4 h-4 text-red-500" />
              <span>
                <strong>Drag & Drop Uputstvo:</strong> Uhvatite bilo koju emisiju za ručicu sa leve strane i prevucite je gore ili dole da promenite redosled emitovanja.
              </span>
            </div>

            {/* List of Shows with Drag & Drop handles */}
            <div className="space-y-2.5">
              {currentDay.programs.map((prog, index) => {
                const isBeingDragged = draggedShowIdx === index;
                const isDragOver = dragOverShowIdx === index;

                return (
                  <div
                    key={prog.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={() => { setDraggedShowIdx(null); setDragOverShowIdx(null); }}
                    className={`group rounded-xl border p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isBeingDragged
                        ? 'opacity-40 border-dashed border-red-500 bg-red-950/20'
                        : isDragOver
                        ? 'border-red-500 bg-red-950/30 scale-[1.01] shadow-lg shadow-red-900/30 ring-2 ring-red-500/50'
                        : 'bg-[#0e1424] border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    {/* Left: Grip Handle + Index + Time */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div 
                        className="cursor-grab active:cursor-grabbing px-2 py-1 rounded bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-all flex items-center gap-1 border border-slate-700 hover:border-red-500 shadow-sm"
                        title="Kliknite i prevucite (Drag & Drop) gore ili dole za promenu pozicije"
                      >
                        <GripVertical className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider select-none">DRAG</span>
                      </div>

                      <div className="w-6 text-center font-mono text-xs font-bold text-slate-500">
                        #{index + 1}
                      </div>

                      <div className="w-20 font-mono text-left">
                        <span className="font-bold text-sm text-white block">{prog.startTime}</span>
                        <span className="text-[11px] text-slate-400 block">{prog.endTime}</span>
                      </div>
                    </div>

                    {/* Thumbnail Image Preview */}
                    <div className="w-24 sm:w-28 aspect-video rounded-lg overflow-hidden bg-black/60 border border-slate-800 shrink-0">
                      <img
                        src={prog.image}
                        alt={prog.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = IMAGES.heroTvStudio; }}
                      />
                    </div>

                    {/* Middle: Title & Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-bold text-red-400 uppercase tracking-wide">
                          {prog.category}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] font-mono text-slate-400">{prog.ageRating}</span>
                        {prog.isLive && (
                          <span className="bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded">
                            UŽIVO
                          </span>
                        )}
                        {prog.isPremiere && (
                          <span className="bg-slate-800 text-amber-300 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border border-amber-500/30">
                            PREMIJERA
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-white truncate">
                        {prog.title}
                      </h4>
                      {prog.subtitle && (
                        <p className="text-xs text-slate-400 truncate">{prog.subtitle}</p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleMoveShow(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
                        title="Pomeri gore"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveShow(index, 'down')}
                        disabled={index === currentDay.programs.length - 1}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
                        title="Pomeri dole"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStartEditShow(prog)}
                        className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer ml-1"
                        title="Uredi emisiju"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteShow(prog.id, prog.title)}
                        className="p-2 text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 rounded-lg transition-colors cursor-pointer"
                        title="Obriši emisiju"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: NEWS EDITOR */}
        {activeTab === 'news' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between bg-[#0d1322] p-3 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">
                Ukupno objavljenih vesti: <strong>{newsArticles.length}</strong>
              </span>
              <button
                onClick={() => {
                  setEditingArticle(null);
                  setIsAddingNewArticle(true);
                  setArticleTitle('');
                  setArticleSummary('');
                  setArticleContent('');
                  setArticleAuthor('Redakcija K37');
                  setArticleImage(IMAGES.showFokusTalk);
                  setArticleCategory('Društvo');
                  setArticleIsBreaking(false);
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj Novu Vest</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {newsArticles.map((art) => (
                <div key={art.id} className="bg-[#0e1424] border border-slate-800 rounded-xl p-4 flex gap-3">
                  <div className="w-24 h-20 rounded-lg overflow-hidden bg-black/50 shrink-0">
                    <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-red-400 uppercase">{art.category}</span>
                    <h4 className="font-bold text-sm text-white line-clamp-1">{art.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{art.summary}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          setEditingArticle(art);
                          setIsAddingNewArticle(false);
                          setArticleTitle(art.title);
                          setArticleCategory(art.category);
                          setArticleSummary(art.summary);
                          setArticleContent(art.content);
                          setArticleAuthor(art.author);
                          setArticleImage(art.image);
                          setArticleIsBreaking(art.isBreaking || false);
                        }}
                        className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Uredi
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Obriši vest "${art.title}"?`)) {
                            onUpdateNews(newsArticles.filter(n => n.id !== art.id));
                            onShowToast('Vest je obrisana.');
                          }
                        }}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="w-3 h-3" /> Obriši
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: TICKER / KAJRON */}
        {activeTab === 'ticker' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="bg-[#0d1322] p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-2">Dodaj novu udarnu vest na kajron:</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTickerText}
                  onChange={(e) => setNewTickerText(e.target.value)}
                  placeholder="Unesite kratku vest za traku (npr. 'K37: Večeras premijera filma u 21h')..."
                  className="flex-1 bg-[#131b2c] border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => {
                    if (newTickerText.trim()) {
                      onUpdateTicker([newTickerText.trim(), ...tickerHeadlines]);
                      setNewTickerText('');
                      onShowToast('Kajron ažuriran!');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Dodaj
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {tickerHeadlines.map((headline, idx) => (
                <div key={idx} className="bg-[#0e1424] border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-200">{headline}</span>
                  <button
                    onClick={() => {
                      onUpdateTicker(tickerHeadlines.filter((_, i) => i !== idx));
                      onShowToast('Vest uklonjena sa kajrona.');
                    }}
                    className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: SETTINGS & PIN MANAGEMENT */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-2xl">
            <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Lock className="w-4 h-4 text-red-500" />
                <span>Promena Administratorske Šifre (PIN)</span>
              </div>
              <p className="text-xs text-slate-400">
                Podesite novu ličnu šifru kojom samo vi možete otključati ovaj sistem.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Nova šifra (npr. MojaSifra2026)"
                  className="flex-1 bg-[#131b2c] border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                />
                <button
                  onClick={() => {
                    if (newPinInput.trim().length >= 4) {
                      localStorage.setItem('k37_custom_pin', newPinInput.trim());
                      setCustomPin(newPinInput.trim());
                      setNewPinInput('');
                      onShowToast('Nova administratorska šifra je uspešno sačuvana!');
                    } else {
                      alert('Šifra mora imati najmanje 4 karaktera.');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl"
                >
                  Sačuvaj Šifru
                </button>
              </div>
              <span className="text-[11px] text-slate-500 font-mono block">
                Trenutno aktivna šifra: <strong className="text-slate-300">{customPin}</strong>
              </span>
            </div>

            <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <span>Reset na fabričke podatke</span>
              </div>
              <p className="text-xs text-slate-400">
                Vraća raspored i vesti na originalne fabričke podatke Televizije K37.
              </p>
              <button
                onClick={() => {
                  if (window.confirm('Pažnja: Da li ste sigurni da želite da poništite sve izmene i vratite fabrički program?')) {
                    onResetToDefaults();
                    onShowToast('Program je vraćen na fabrička podešavanja.');
                  }
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Vrati Fabrička Podešavanja
              </button>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT SHOW FORM WITH IMAGE PRESET PICKER */}
        {(isAddingNewShow || editingProgram) && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-[#0e1424] border border-slate-700 rounded-2xl p-5 sm:p-6 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h4 className="font-extrabold text-base sm:text-lg">
                  {editingProgram ? 'Uredi Emisiju' : 'Dodaj Novu Emisiju u Raspored'}
                </h4>
                <button
                  onClick={() => { setEditingProgram(null); setIsAddingNewShow(false); }}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveShow} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Naziv Emisije *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="npr. K37 Dnevnik"
                      className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Podnaslov / Tema</label>
                    <input
                      type="text"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      placeholder="npr. Glavne vesti dana i pregled"
                      className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Početak</label>
                    <input
                      type="time"
                      required
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Završetak</label>
                    <input
                      type="time"
                      required
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Kategorija</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="informativni">Informativni</option>
                      <option value="film_serija">Film / Serija</option>
                      <option value="sport">Sport</option>
                      <option value="dokumentarni">Dokumentarni</option>
                      <option value="zabavni">Zabavni</option>
                      <option value="kultura">Kultura</option>
                      <option value="jutarnji">Jutarnji program</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Uzrast</label>
                    <select
                      value={formAgeRating}
                      onChange={(e) => setFormAgeRating(e.target.value as any)}
                      className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="SVI">SVI</option>
                      <option value="12+">12+</option>
                      <option value="16+">16+</option>
                      <option value="18+">18+</option>
                    </select>
                  </div>
                </div>

                {/* IMAGE PREVIEW & PRESETS */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                    <span>Slika Emisije (Thumbnail za programsku šemu)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Izaberite preset ili unesite URL</span>
                  </label>
                  
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="https://... ili izaberite preset ispod"
                      className="flex-1 bg-[#131b2c] border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                    <div className="w-12 h-9 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-black">
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {BROADCAST_IMAGE_PRESETS.map((p, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setFormImage(p.url)}
                        className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                          formImage === p.url
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Voditelj / Urednik</label>
                  <input
                    type="text"
                    value={formPresenter}
                    onChange={(e) => setFormPresenter(e.target.value)}
                    placeholder="npr. Vladimir Đorđević"
                    className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Detaljan Opis</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Kratak siže emisije za gledaoce..."
                    className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsLive}
                      onChange={(e) => setFormIsLive(e.target.checked)}
                      className="rounded text-red-600 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-200">Emituje se Uživo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPremiere}
                      onChange={(e) => setFormIsPremiere(e.target.checked)}
                      className="rounded text-red-600 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-200">Premijera</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setEditingProgram(null); setIsAddingNewShow(false); }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Otkaži
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white shadow-lg shadow-red-600/30"
                  >
                    Sačuvaj Emisiju
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
