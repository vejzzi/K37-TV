import React, { useState } from 'react';
import { Tv, Radio, Satellite, Smartphone, Check, HelpCircle, ShieldCheck } from 'lucide-react';
import { OPERATOR_FREQUENCIES, OperatorFrequency } from '../data/tvData';

export const FrequenciesSection: React.FC = () => {
  const [platformFilter, setPlatformFilter] = useState<string>('Sve');

  const platforms = ['Sve', 'IPTV', 'Kabl', 'Zemaljska', 'Satelit'];

  const filteredFrequencies = platformFilter === 'Sve'
    ? OPERATOR_FREQUENCIES
    : OPERATOR_FREQUENCIES.filter(f => f.platform === platformFilter);

  return (
    <section id="frekvencije" className="py-14 bg-[#0a0d14] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-widest mb-1.5">
              <Radio className="w-4 h-4" />
              <span>Tehnički Prijem & Mreže</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-display tracking-tight">
              Kako Gledati Televiziju K37
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Pronađite broj kanala Televizije K37 kod vašeg kablovskog, IPTV ili satelitskog operatora, kao i na digitalnoj zemaljskoj mreži (DVB-T2).
            </p>
          </div>

          {/* Platform Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {platforms.map(p => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  platformFilter === p
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Operators Table / Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {filteredFrequencies.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#0d121d] border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
                    {item.platform}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                    {item.quality}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">
                  {item.operator}
                </h3>

                <div className="text-sm font-mono font-bold text-red-400 bg-red-950/40 border border-red-900/30 p-2.5 rounded-lg mb-3">
                  {item.channelNumber}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  {item.coverage}
                </p>
              </div>

              {item.notes && (
                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                  {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Smart TV & Mobile Apps Banner */}
        <div className="bg-gradient-to-r from-[#0d121d] to-[#121824] border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider bg-red-950/60 border border-red-900/40 px-2.5 py-1 rounded">
              <Smartphone className="w-3.5 h-3.5" />
              <span>K37 Smart Aplikacije</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              Gledajte K37 na Vašem Pametnom Televizoru i Telefonu
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Besplatna zvanična aplikacija dostupna je za Samsung Tizen, LG webOS, Android TV, Google TV, Apple TV, kao i na Google Play i Apple App Store.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {['Samsung Smart TV', 'LG webOS', 'Android TV', 'Apple TV'].map((os) => (
              <div
                key={os}
                className="px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2"
              >
                <Check className="w-3.5 h-3.5 text-red-500" />
                <span>{os}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
