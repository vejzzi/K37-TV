import React, { useState } from 'react';
import { X, Send, CheckCircle, Upload, AlertCircle } from 'lucide-react';

interface ReporterContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReporterContactModal: React.FC<ReporterContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneOrEmail: '',
    location: '',
    category: 'Vanredna vest',
    message: '',
    attachmentNote: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phoneOrEmail.trim() || !formData.message.trim()) {
      setError('Molimo popunite sva obavezna polja (ime, kontakt i opis događaja).');
      return;
    }
    setError('');
    setSubmitted(true);
    setTimeout(() => {
      // Keep feedback for 3 seconds then close
    }, 3000);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      phoneOrEmail: '',
      location: '',
      category: 'Vanredna vest',
      message: '',
      attachmentNote: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0d121d] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 bg-[#121824] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Budi K37 Reporter</h3>
              <p className="text-[11px] text-slate-400">Pošaljite vest, fotografiju ili video zapis direktno u centralni desk</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-xl font-bold text-white font-display">Vest je uspešno poslata!</h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Hvala vam što doprinosite pravovremenom informisanju. Naša dežurna informativna redakcija će odmah pregledati vašu prijavu i po potrebi vas kontaktirati.
            </p>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Zatvori prozor
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Vaše Ime i Prezime <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="npr. Petar Petrović"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Broj telefona ili Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="npr. 064 123 4567"
                  value={formData.phoneOrEmail}
                  onChange={e => setFormData({ ...formData, phoneOrEmail: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mesto / Opština događaja
                </label>
                <input
                  type="text"
                  placeholder="npr. Beograd, Kragujevac, Niš..."
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Kategorija dojave
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Vanredna vest">Vanredna vest / Saobraćaj</option>
                  <option value="Društvo i komunalni problemi">Društvo i komunalni problemi</option>
                  <option value="Privreda i ekonomija">Privreda i ekonomija</option>
                  <option value="Sport i kultura">Sport i kultura</option>
                  <option value="Pohvala ili sugestija">Pohvala ili sugestija za program</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Opis događaja / Šta se desilo? <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Detaljno opišite šta ste zabeležili, vreme i tačnu lokaciju..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Link do video snimka ili fotografije (opciono)
              </label>
              <input
                type="text"
                placeholder="npr. WeTransfer, Google Drive, YouTube link ili opis fajla..."
                value={formData.attachmentNote}
                onChange={e => setFormData({ ...formData, attachmentNote: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Vaši podaci su zaštićeni novinarskim kodeksom privatnosti.
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-md shadow-red-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Pošalji redakciji</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
