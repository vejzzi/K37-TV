import React from 'react';
import { X, Bell, Trash2, Calendar, Clock, Play } from 'lucide-react';
import { ProgramItem } from '../data/tvData';

interface RemindersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: string[];
  programs: ProgramItem[];
  onRemoveReminder: (id: string) => void;
  onClearAll: () => void;
  onSelectProgram: (prog: ProgramItem) => void;
}

export const RemindersDrawer: React.FC<RemindersDrawerProps> = ({
  isOpen,
  onClose,
  reminders,
  programs,
  onRemoveReminder,
  onClearAll,
  onSelectProgram
}) => {
  if (!isOpen) return null;

  // Match reminder IDs to programs
  const savedPrograms = programs.filter(p => reminders.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#0d121d] h-full border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-lg font-display">Moji Podsetnici</h3>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {savedPrograms.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {savedPrograms.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Bell className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">Nemate sačuvanih podsetnika</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                U programskoj šemi kliknite na ikonicu zvona ("Podseti me") pored bilo koje emisije kako biste bili na vreme obavešteni pre početka emitovanja.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedPrograms.map(prog => (
                <div
                  key={prog.id}
                  onClick={() => onSelectProgram(prog)}
                  className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{prog.startTime} - {prog.endTime}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400 uppercase text-[10px]">{prog.category}</span>
                    </div>

                    <h4 className="font-bold text-sm text-white group-hover:text-red-400 truncate">
                      {prog.title}
                    </h4>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveReminder(prog.id);
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Ukloni podsetnik"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {savedPrograms.length > 0 && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Ukloni sve podsetnike
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition-colors"
            >
              Zatvori
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
