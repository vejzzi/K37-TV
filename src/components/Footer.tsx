import React from 'react';
import { Tv, Radio, Mail, Phone, MapPin, Shield, ExternalLink, Lock } from 'lucide-react';
import k37BadgeImg from '../assets/images/k37_gradient_logo_badge.png';

interface FooterProps {
  onOpenLive: () => void;
  onOpenSchedule: () => void;
  onOpenShows: () => void;
  onOpenNews: () => void;
  onOpenFrequencies: () => void;
  onOpenReporterModal: () => void;
  onOpenEditor?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLive,
  onOpenSchedule,
  onOpenShows,
  onOpenNews,
  onOpenFrequencies,
  onOpenReporterModal,
  onOpenEditor
}) => {
  return (
    <footer className="bg-[#05070b] border-t border-slate-800/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand & Editorial mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <img
                src={k37BadgeImg}
                alt="Televizija K37"
                className="h-10 w-auto rounded-xl border border-slate-800 shadow-lg object-contain"
              />
            </div>
            
            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              Televizija K37 je nezavisna televizijska stanica sa nacionalnom i regionalnom pokrivenošću. Posvećeni smo objektivnom informisanju, vrhunskoj autorskoj produkciji i promociji kulture i sporta.
            </p>

            <div className="flex flex-col gap-1 text-[11px] text-slate-500 pt-2 font-mono">
              <span>Registar medija br: IN001248</span>
              <span>Dozvola REM za pružanje medijskih usluga: K37-DVB-T2</span>
              <span>HD / 4K Digital Broadcast Center</span>
            </div>
          </div>

          {/* Quick Nav Mirror (1 col) */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-display">
              Program & Sadržaj
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenLive} className="hover:text-white transition-colors cursor-pointer">
                  Program Uživo (Live Stream)
                </button>
              </li>
              <li>
                <button onClick={onOpenSchedule} className="hover:text-white transition-colors cursor-pointer">
                  Programska Šema (7 dana EPG)
                </button>
              </li>
              <li>
                <button onClick={onOpenShows} className="hover:text-white transition-colors cursor-pointer">
                  Emisije i Video Arhiva
                </button>
              </li>
              <li>
                <button onClick={onOpenNews} className="hover:text-white transition-colors cursor-pointer">
                  Informativni Portal Vesti
                </button>
              </li>
              <li>
                <button onClick={onOpenFrequencies} className="hover:text-white transition-colors cursor-pointer">
                  Frekvencije i Operateri
                </button>
              </li>
            </ul>
          </div>

          {/* Production & Desks (1 col) */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-display">
              Redakcije K37
            </h4>
            <ul className="space-y-2">
              <li>Informativni Program (Dnevnik)</li>
              <li>Političko-društveni Talk Show (Fokus 37)</li>
              <li>Sportska Redakcija (Arena 37)</li>
              <li>Dokumentarni Program (Horizonti)</li>
              <li>Kulturni & Noćni Magazin</li>
              <li>
                <button 
                  onClick={onOpenReporterModal} 
                  className="text-red-400 font-semibold hover:underline cursor-pointer"
                >
                  Pošaljite vest desku
                </button>
              </li>
              {onOpenEditor && (
                <li>
                  <button 
                    onClick={onOpenEditor} 
                    className="text-red-500 font-bold hover:text-red-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Uređivački Web Editor & CMS</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact & Studio (1 col) */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-display">
              Studio i Kontakt
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Bulevar Oslobođenja 37, Televizijski Studio K37</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>+381 11 370 0037 (Desk)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>redakcija@k37.tv</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Televizija K37 d.o.o. Sva prava emitovanja i reprodukcije zadržana.
          </div>

          <div className="flex items-center gap-4">
            <a href="#impressum" onClick={(e) => { e.preventDefault(); alert("Televizija K37 Impressum:\nGlavni i odgovorni urednik: Dragan Vasić\nUrednik informativnog programa: Vladimir Đorđević\nTehnički direktor: Ivan Marinković\nSedište: Bulevar Oslobođenja 37"); }} className="hover:text-slate-300 transition-colors">
              Impressum
            </a>
            <span aria-hidden="true">·</span>
            <a href="#pravila" onClick={(e) => { e.preventDefault(); alert("Pravila privatnosti Televizije K37:\nPodaci prikupljeni putem formulara za dojavu vesti koriste se isključivo u novinarske svrhe u skladu sa Zakonom o javnom informisanju."); }} className="hover:text-slate-300 transition-colors">
              Pravila Privatnosti
            </a>
            <span aria-hidden="true">·</span>
            <a href="#uslovi" onClick={(e) => { e.preventDefault(); alert("Uslovi korišćenja: Svi video materijali i tekstovi na portalu K37 vlasništvo su Televizije K37."); }} className="hover:text-slate-300 transition-colors">
              Uslovi Korišćenja
            </a>
            {onOpenEditor && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  onClick={onOpenEditor}
                  className="text-slate-600 hover:text-slate-400 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Administratorska zona (Zaštićeno šifrom - Ctrl+Alt+A)"
                >
                  <Lock className="w-3 h-3" />
                  <span>Urednički Portal</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
