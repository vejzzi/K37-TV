import React, { useState } from 'react';
import { Sparkles, Clock, User, Share2, X, ChevronRight, Check } from 'lucide-react';
import { NEWS_ARTICLES, NewsArticle } from '../data/tvData';

interface NewsSectionProps {
  articles?: NewsArticle[];
  onOpenEditor?: () => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ 
  articles = NEWS_ARTICLES,
  onOpenEditor
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Sve');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = ['Sve', 'Društvo', 'Ekonomija', 'Sport', 'Kultura'];

  const filteredNews = selectedCategory === 'Sve' 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="vesti" className="py-14 bg-[#080b11] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-widest mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Informativni Portal K37</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-display tracking-tight">
              Najnovije Vesti i Izveštaji
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Proverene, pravovremene i objektivne informacije dopisničke mreže Televizije K37 iz cele zemlje i sveta.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid: 1 Big Spotlight + Side Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Spotlight News (7 cols) */}
          {filteredNews[0] && (
            <div
              onClick={() => setActiveArticle(filteredNews[0])}
              className="lg:col-span-7 group bg-[#0d121d] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
                <img
                  src={filteredNews[0].image}
                  alt={filteredNews[0].title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-[0.8]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d121d] via-black/40 to-transparent" />
                
                {filteredNews[0].isBreaking && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded tracking-wider shadow-md">
                      PRELOMNA VEST
                    </span>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 text-xs font-mono text-slate-300">
                  <span>{filteredNews[0].timestamp}</span>
                  <span aria-hidden="true" className="mx-2">·</span>
                  <span>{filteredNews[0].readTime}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                  {filteredNews[0].category}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-red-400 transition-colors mb-3 leading-snug">
                  {filteredNews[0].title}
                </h3>
                <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                  {filteredNews[0].summary}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>{filteredNews[0].author}</span>
                  <span className="text-red-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Pročitaj više <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Secondary News Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {filteredNews.slice(1).map((article) => (
              <div
                key={article.id}
                onClick={() => setActiveArticle(article)}
                className="group p-4 bg-[#0d121d] border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer flex gap-4 hover:bg-slate-900/60"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-slate-900">
                  <img
                    src={article.image}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-[0.85]"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    {/* Zero-Pill metadata */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                      <span className="text-red-400 font-semibold uppercase">{article.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{article.timestamp}</span>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-1">
                      {article.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {article.summary}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-2 font-mono">
                    {article.readTime}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Article Detail Modal Reader */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0d121d] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
            
            <div className="relative h-60 sm:h-72 w-full bg-slate-900">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover brightness-[0.75]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d121d] via-[#0d121d]/40 to-transparent" />
              
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-slate-300 hover:text-white hover:bg-black/90 transition-colors cursor-pointer"
                aria-label="Zatvori vest"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-4 right-4">
                <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                  {activeArticle.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display mt-2 leading-tight">
                  {activeArticle.title}
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Zero-Pill Article Metadata */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-semibold">{activeArticle.author}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{activeArticle.timestamp}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeArticle.readTime}</span>
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopirano' : 'Podeli vest'}</span>
                </button>
              </div>

              {/* Article Content */}
              <div className="text-sm text-slate-300 leading-relaxed space-y-4 whitespace-pre-line font-normal">
                {activeArticle.content}
              </div>

              {/* Tags */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Povezane teme:</span>
                {activeArticle.tags.map((tag) => (
                  <span key={tag} className="text-slate-400 hover:text-slate-200">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
