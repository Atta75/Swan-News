
import React from 'react';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
  onSave: (article: NewsArticle) => void;
  isSaved: boolean;
  onOpen: (article: NewsArticle) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onSave, isSaved, onOpen }) => {
  return (
    <article className="group bg-white dark:bg-zinc-900 overflow-hidden hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all duration-300 flex flex-col h-full border-b border-gray-100 dark:border-zinc-800 pb-6 sm:pb-0 sm:border-0 sm:mb-0">
      <div 
        className="relative h-56 w-full overflow-hidden cursor-pointer"
        onClick={() => onOpen(article)}
      >
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
        />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSave(article);
          }}
          className={`absolute bottom-4 right-4 p-2.5 rounded shadow-lg transition-all active:scale-90 ${
            isSaved 
              ? 'bg-brand-red text-white' 
              : 'bg-white/95 text-gray-600 hover:text-brand-red'
          }`}
        >
          <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-tighter text-brand-red dark:text-red-500">
            {article.source}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            • {article.date}
          </span>
        </div>
        
        <h3 
          className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight cursor-pointer hover:text-brand-red dark:hover:text-red-500 transition-colors font-urdu"
          onClick={() => onOpen(article)}
        >
          {article.title}
        </h3>
        
        <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-3 font-urdu">
          {article.summary}
        </p>

        <div className="mt-auto">
          <button 
            onClick={() => onOpen(article)}
            className="text-xs font-black text-brand-red dark:text-red-500 uppercase tracking-widest flex items-center gap-1 group/btn hover:underline"
          >
            تفصیلات
            <svg className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
