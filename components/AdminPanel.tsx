
import React, { useState } from 'react';
import { NewsArticle, Category } from '../types';
import { CATEGORIES } from '../constants';

interface AdminPanelProps {
  articles: NewsArticle[];
  onAddArticle: (article: NewsArticle) => void;
  onDeleteArticle: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ articles, onAddArticle, onDeleteArticle }) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    url: '',
    source: 'SWAN Editorial',
    category: 'Trending' as Category,
    imageUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.summary) return;

    const newArticle: NewsArticle = {
      id: `admin-${Date.now()}`,
      ...formData,
      date: new Date().toLocaleString('ur-PK'),
      isAdmin: true
    };

    onAddArticle(newArticle);
    setFormData({
      title: '',
      summary: '',
      url: '',
      source: 'SWAN Editorial',
      category: 'Trending',
      imageUrl: ''
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* Form Section */}
      <div className="lg:col-span-1 bg-white dark:bg-zinc-900 p-8 shadow-xl border-t-4 border-brand-red">
        <h2 className="text-2xl font-black mb-6 font-urdu text-gray-900 dark:text-white border-b pb-2">نئی خبر شامل کریں</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Title (اردو میں)</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border dark:border-zinc-700 text-gray-900 dark:text-white font-urdu" 
              placeholder="خبر کی سرخی..."
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Summary (اردو میں)</label>
            <textarea 
              rows={4}
              value={formData.summary}
              onChange={e => setFormData({...formData, summary: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border dark:border-zinc-700 text-gray-900 dark:text-white font-urdu" 
              placeholder="خبر کا خلاصہ..."
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value as Category})}
              className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border dark:border-zinc-700 text-gray-900 dark:text-white font-urdu"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Image URL</label>
            <input 
              type="text" 
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border dark:border-zinc-700 text-gray-900 dark:text-white" 
              placeholder="https://..."
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-brand-red text-white font-black uppercase tracking-widest hover:bg-brand-darkRed transition-colors font-urdu"
          >
            خبر شائع کریں
          </button>
        </form>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-black mb-6 font-urdu text-gray-900 dark:text-white">انتظامی فہرست</h2>
        {articles.length === 0 ? (
          <div className="p-20 text-center border-2 border-dashed border-gray-200 dark:border-zinc-800 text-gray-400 font-urdu">
            کوئی خبر دستیاب نہیں ہے
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map(article => (
              <div key={article.id} className="bg-white dark:bg-zinc-900 p-4 flex gap-4 items-center shadow border-l-4 border-brand-red">
                {article.imageUrl && <img src={article.imageUrl} alt="" className="w-20 h-20 object-cover rounded" />}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white font-urdu line-clamp-1">{article.title}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">{article.category} • {article.date}</p>
                </div>
                <button 
                  onClick={() => onDeleteArticle(article.id)}
                  className="p-3 text-gray-400 hover:text-brand-red hover:bg-brand-red/10 rounded transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
