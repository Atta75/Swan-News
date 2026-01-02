
import React from 'react';
import { NewsArticle, GroundingSource } from '../types';

interface ArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  sources: GroundingSource[];
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose, sources }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-zinc-950 w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] shadow-2xl overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-bottom duration-300">
        <button 
          onClick={onClose}
          className="fixed top-4 right-4 z-50 p-3 bg-brand-red text-white shadow-xl hover:bg-brand-darkRed transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="relative h-64 sm:h-96 w-full">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 via-transparent to-transparent"></div>
        </div>

        <div className="px-6 sm:px-16 pb-16 relative">
          <div className="flex flex-wrap items-center gap-3 mb-6 -mt-10 bg-white dark:bg-zinc-950 p-4 shadow-lg border-t-4 border-brand-red inline-flex">
            <span className="text-xs font-black uppercase tracking-widest text-brand-red">
              {article.source}
            </span>
            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">
              {article.date}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-8 leading-tight font-urdu">
            {article.title}
          </h2>

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="text-xl text-gray-700 dark:text-zinc-300 leading-relaxed mb-8 font-medium font-urdu">
              {article.summary}
            </p>
            
            <div className="p-6 bg-gray-50 dark:bg-zinc-900 border-l-4 border-brand-red mb-10">
              <h4 className="text-brand-red font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                SWAN Intelligence
              </h4>
              <p className="text-gray-600 dark:text-zinc-400 text-sm font-urdu">
                یہ مواد گوگل سرچ گراؤنڈنگ اور جیمنی 3 فلیش کی مدد سے تیار کیا گیا ہے۔
              </p>
            </div>

            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500 mb-6 border-b border-gray-100 dark:border-zinc-800 pb-2 font-urdu">متعلقہ ذرائع</h3>
            <div className="grid gap-4 mb-10">
              {sources.length > 0 ? sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-brand-red dark:hover:border-brand-red transition-all"
                >
                  <span className="font-bold text-gray-800 dark:text-zinc-200 group-hover:text-brand-red truncate pr-4 font-urdu">
                    {source.title}
                  </span>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-brand-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              )) : (
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-brand-red transition-all"
                >
                  <span className="font-bold text-gray-800 dark:text-zinc-200 font-urdu">پوری رپورٹ دیکھیں</span>
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              )}
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full py-4 bg-brand-red text-white font-black uppercase tracking-widest hover:bg-brand-darkRed transition-colors font-urdu"
          >
            بند کریں
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
