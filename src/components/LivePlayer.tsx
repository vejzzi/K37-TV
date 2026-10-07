import React, { useState, useEffect } from 'react';
import { 
  X, Users, MessageSquare, Sparkles, Check, 
  Settings, Radio, Tv, ExternalLink
} from 'lucide-react';
import { ProgramItem } from '../data/tvData';
import { VidiyoPlayer } from './VidiyoPlayer';

interface LivePlayerProps {
  currentShow: ProgramItem;
  isOpen: boolean;
  onClose: () => void;
}

export const LivePlayer: React.FC<LivePlayerProps> = ({
  currentShow,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'poll' | 'chat'>('poll');
  
  // Interactive poll state
  const [pollVoted, setPollVoted] = useState<number | null>(null);
  const [pollCounts, setPollCounts] = useState({ yes: 412, no: 188 });

  // Interactive live comments
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string; time: string }>>([
    { id: '1', user: 'Zoran M.', text: 'Odličan prilog o poljoprivredi u današnjem Dnevniku!', time: 'pre 2m' },
    { id: '2', user: 'Ana_NoviSad', text: 'Kvalitet slike i zvuka je fantastičan!', time: 'pre 1m' },
    { id: '3', user: 'Goran_82', text: 'Ko je gost u studiju nakon Dnevnika?', time: 'upravo' }
  ]);
  const [newComment, setNewComment] = useState('');

  // Clock in player
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTimeStr(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const handleVote = (optionIndex: number) => {
    if (pollVoted !== null) return;
    setPollVoted(optionIndex);
    if (optionIndex === 0) {
      setPollCounts(prev => ({ ...prev, yes: prev.yes + 1 }));
    } else {
      setPollCounts(prev => ({ ...prev, no: prev.no + 1 }));
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        user: 'Gledalac (Vi)',
        text: newComment.trim(),
        time: 'upravo'
      }
    ]);
    setNewComment('');
  };

  if (!isOpen) return null;

  const totalVotes = pollCounts.yes + pollCounts.no;
  const yesPct = Math.round((pollCounts.yes / totalVotes) * 100);
  const noPct = 100 - yesPct;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto">
      <div className="w-full max-w-6xl bg-[#0a0d14] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col my-auto">
        
        {/* Top title header of modal */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0d121d] border-b border-slate-800 text-sm">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 bg-red-600 text-white font-black text-[11px] px-2 py-0.5 rounded tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              UŽIVO EMITOVANJE
            </span>
            <span className="text-white font-bold tracking-tight">
              Televizija K37 HD
            </span>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-slate-300 text-xs hidden sm:inline truncate max-w-xs font-medium">
              {currentShow.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Zatvori plejer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Screen & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Zvanični Vidiyo Player sa zaštitom od preusmeravanja (8 cols on lg) */}
          <div className="lg:col-span-8 bg-black relative aspect-video flex items-center justify-center overflow-hidden">
            <VidiyoPlayer
              embedUrl="https://vidiyo.com/embed/watch/k37"
              showTitle={currentShow.title}
              showSubtitle={currentShow.subtitle || currentShow.presenter}
              className="w-full h-full"
            />
          </div>

          {/* Interactive Live Stream Sidebar (4 cols on lg) */}
          <div className="lg:col-span-4 bg-[#0d121d] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-[340px] lg:h-auto">
            {/* Tab header: Poll vs Chat */}
            <div className="flex items-center border-b border-slate-800 p-1 bg-[#090c13]">
              <button
                onClick={() => setActiveTab('poll')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'poll' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Anketa Gledalaca</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'chat' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>Reakcije Uživo</span>
              </button>
            </div>

            {/* Tab 1: Poll of the Day */}
            {activeTab === 'poll' && (
              <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1">
                    PITANJE DANA ZA EMISIJU
                  </div>
                  <h4 className="text-sm font-bold text-white mb-3 leading-snug">
                    Da li podržavate novu strategiju javnog gradskog prevoza i proširenje pešačkih zona?
                  </h4>

                  <div className="space-y-3">
                    {/* Option DA */}
                    <button
                      onClick={() => handleVote(0)}
                      disabled={pollVoted !== null}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        pollVoted === 0
                          ? 'bg-red-950/40 border-red-500 text-white'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-semibold mb-1">
                        <span>DA, podržavam</span>
                        {pollVoted !== null && <span className="font-mono">{yesPct}%</span>}
                      </div>
                      {pollVoted !== null && (
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${yesPct}%` }} />
                        </div>
                      )}
                    </button>

                    {/* Option NE */}
                    <button
                      onClick={() => handleVote(1)}
                      disabled={pollVoted !== null}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        pollVoted === 1
                          ? 'bg-red-950/40 border-red-500 text-white'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-semibold mb-1">
                        <span>NE, potrebna je dorada</span>
                        {pollVoted !== null && <span className="font-mono">{noPct}%</span>}
                      </div>
                      {pollVoted !== null && (
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-500 rounded-full" style={{ width: `${noPct}%` }} />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 text-center">
                  {pollVoted !== null ? (
                    <span className="text-emerald-400 font-semibold">
                      ✓ Hvala na glasanju! Vaš glas je zabeležen.
                    </span>
                  ) : (
                    <span>Glasanje je anonimno (Ukupno glasova: {totalVotes})</span>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Live Chat */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {comments.map(c => (
                    <div key={c.id} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/60 text-xs">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="font-bold text-slate-200">{c.user}</span>
                        <span className="text-[10px] font-mono">{c.time}</span>
                      </div>
                      <p className="text-slate-300 leading-snug">{c.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="mt-3 pt-2 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Napišite komentar..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Pošalji
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

        {/* Bottom Bar: Distribution Info & Stream source */}
        <div className="p-3 bg-[#0d121d] border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-semibold">Distribucija:</span>
            <span>MTS Iris kanal 114</span>
            <span aria-hidden="true">·</span>
            <span>SBB EON kanal 37</span>
            <span aria-hidden="true">·</span>
            <span>DVB-T2 Zemaljska MUX 2</span>
          </div>
          <div className="font-mono text-slate-400 flex items-center gap-2 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>K37 HD Emitovanje Uživo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
