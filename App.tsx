
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CategoryBar from './components/CategoryBar';
import NewsCard from './components/NewsCard';
import ArticleModal from './components/ArticleModal';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import LiveChannel from './components/LiveChannel';
import { fetchNews } from './services/geminiService';
import { AppState, Category, NewsArticle } from './types';
import { CATEGORY_QUERIES, APP_NAME } from './constants';

const ADMIN_PASSWORD = "123";

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    articles: [],
    adminArticles: [],
    loading: true,
    error: null,
    currentCategory: 'Trending',
    searchQuery: '',
    savedArticles: [],
    sources: []
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [viewingSaved, setViewingSaved] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showLive, setShowLive] = useState(false);

  // Persistence for admin articles and session
  useEffect(() => {
    const savedAdmin = localStorage.getItem('swan_admin_articles');
    if (savedAdmin) {
      setState(prev => ({ ...prev, adminArticles: JSON.parse(savedAdmin) }));
    }
    const session = localStorage.getItem('swan_admin_session');
    if (session === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('swan_admin_articles', JSON.stringify(state.adminArticles));
  }, [state.adminArticles]);

  const loadInitialNews = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const query = CATEGORY_QUERIES['Trending'];
      const { articles, sources } = await fetchNews(query);
      setState(prev => ({ 
        ...prev, 
        articles, 
        sources,
        loading: false 
      }));
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: "خبریں لوڈ کرنے میں دشواری ہو رہی ہے۔ دوبارہ کوشش کریں۔" }));
    }
  }, []);

  useEffect(() => {
    loadInitialNews();
  }, [loadInitialNews]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleCategoryChange = async (category: Category) => {
    setViewingSaved(false);
    setIsAdminView(false);
    setState(prev => ({ ...prev, currentCategory: category, loading: true, error: null, searchQuery: '' }));
    try {
      const { articles, sources } = await fetchNews(CATEGORY_QUERIES[category]);
      setState(prev => ({ ...prev, articles, sources, loading: false }));
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: `خبریں لوڈ کرنے میں دشواری ہو رہی ہے۔` }));
    }
  };

  const handleSearch = async (query: string) => {
    setViewingSaved(false);
    setIsAdminView(false);
    setState(prev => ({ ...prev, loading: true, error: null, searchQuery: query }));
    try {
      const { articles, sources } = await fetchNews(query);
      setState(prev => ({ ...prev, articles, sources, loading: false }));
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: "تلاش میں دشواری پیش آئی ہے۔" }));
    }
  };

  const toggleSaveArticle = (article: NewsArticle) => {
    setState(prev => {
      const isAlreadySaved = prev.savedArticles.find(a => a.id === article.id);
      if (isAlreadySaved) {
        return { ...prev, savedArticles: prev.savedArticles.filter(a => a.id !== article.id) };
      }
      return { ...prev, savedArticles: [...prev.savedArticles, article] };
    });
  };

  const handleAdminNav = () => {
    if (isLoggedIn) {
      setIsAdminView(!isAdminView);
      setViewingSaved(false);
    } else {
      setShowLogin(true);
    }
  };

  const handleLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setIsAdminView(true);
      setShowLogin(false);
      localStorage.setItem('swan_admin_session', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdminView(false);
    localStorage.removeItem('swan_admin_session');
  };

  const handleAddAdminArticle = (article: NewsArticle) => {
    setState(prev => ({ ...prev, adminArticles: [article, ...prev.adminArticles] }));
  };

  const handleDeleteAdminArticle = (id: string) => {
    setState(prev => ({ ...prev, adminArticles: prev.adminArticles.filter(a => a.id !== id) }));
  };

  const displayArticles = viewingSaved 
    ? state.savedArticles 
    : [...state.adminArticles.filter(a => a.category === state.currentCategory || state.currentCategory === 'Trending'), ...state.articles];

  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-brand-zinc transition-colors selection:bg-brand-red selection:text-white">
      <Header 
        onSavedClick={() => { setViewingSaved(!viewingSaved); setIsAdminView(false); }}
        onAdminClick={handleAdminNav}
        onLogout={handleLogout}
        onLiveClick={() => setShowLive(true)}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        savedCount={state.savedArticles.length}
        isAdminView={isAdminView}
        isLoggedIn={isLoggedIn}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="mb-12 border-l-8 border-brand-red pl-6">
          <h2 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter uppercase font-urdu">
            {isAdminView ? 'ایڈمن پینل' : viewingSaved ? 'محفوظ خبریں' : state.searchQuery ? `تلاش: ${state.searchQuery}` : state.currentCategory}
          </h2>
          <p className="text-lg text-gray-500 dark:text-zinc-400 font-bold max-w-2xl font-urdu">
            {APP_NAME} | {isAdminView ? 'ادارتی کنٹرول مرکز' : 'تازہ ترین خبریں اور تجزیے'}
          </p>
        </div>

        {isAdminView ? (
          <AdminPanel 
            articles={state.adminArticles} 
            onAddArticle={handleAddAdminArticle} 
            onDeleteArticle={handleDeleteAdminArticle} 
          />
        ) : (
          <>
            {!viewingSaved && (
              <>
                <SearchBar onSearch={handleSearch} isLoading={state.loading} />
                <CategoryBar 
                  activeCategory={state.currentCategory} 
                  onCategoryChange={handleCategoryChange} 
                  disabled={state.loading}
                />
              </>
            )}

            {state.error && (
              <div className="p-10 bg-gray-50 dark:bg-zinc-900 border-t-4 border-brand-red text-center mb-12">
                <p className="text-brand-red font-black text-xl mb-6 font-urdu">{state.error}</p>
                <button 
                  onClick={() => state.searchQuery ? handleSearch(state.searchQuery) : handleCategoryChange(state.currentCategory)}
                  className="px-10 py-3 bg-brand-red text-white font-black rounded hover:bg-brand-darkRed transition-colors font-urdu"
                >
                  دوبارہ کوشش کریں
                </button>
              </div>
            )}

            {state.loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 sm:gap-x-12">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse flex flex-col h-[450px]">
                    <div className="bg-gray-100 dark:bg-zinc-800 h-56 w-full mb-4"></div>
                    <div className="h-2 bg-gray-100 dark:bg-zinc-800 w-1/4 mb-3"></div>
                    <div className="h-8 bg-gray-100 dark:bg-zinc-800 w-full mb-4"></div>
                    <div className="h-4 bg-gray-100 dark:bg-zinc-800 w-full mb-2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 sm:gap-x-12">
                {displayArticles.length > 0 ? (
                  displayArticles.map(article => (
                    <NewsCard 
                      key={article.id} 
                      article={article} 
                      onSave={toggleSaveArticle}
                      isSaved={!!state.savedArticles.find(a => a.id === article.id)}
                      onOpen={setSelectedArticle}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 dark:border-zinc-800">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 font-urdu">
                      {viewingSaved ? "آپ نے کوئی خبر محفوظ نہیں کی ہے۔" : "کوئی خبر نہیں ملی۔"}
                    </h3>
                    <button 
                      onClick={() => setViewingSaved(false)}
                      className="px-8 py-3 bg-brand-red text-white font-black uppercase tracking-widest hover:bg-brand-darkRed font-urdu"
                    >
                      مرکزی صفحہ پر واپس جائیں
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {showLogin && (
        <LoginModal 
          onLogin={handleLogin} 
          onClose={() => setShowLogin(false)} 
        />
      )}

      {showLive && (
        <LiveChannel onClose={() => setShowLive(false)} />
      )}

      <ArticleModal 
        article={selectedArticle} 
        onClose={() => setSelectedArticle(null)} 
        sources={state.sources}
      />

      <footer className="mt-40 py-20 bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-3">
            <div className="flex gap-0.5 mb-6">
              {['S', 'W', 'A', 'N'].map((char, i) => (
                <div key={i} className="w-8 h-8 bg-white flex items-center justify-center">
                  <span className="text-brand-red font-black text-lg pt-0.5">{char}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed font-urdu">
              SWAN NEWS: جیمنی آرٹیفیشل انٹیلی جنس کی مدد سے تیار کردہ خبریں اور تجزیے۔
            </p>
          </div>
          
          <div className="md:col-span-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4 font-urdu">پتہ اور مقام</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-red rounded-lg shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-200 font-urdu leading-tight mb-1">گلی نمبر 16، اشرف ٹاؤن، چکوال</p>
                  <p className="text-[11px] text-gray-500 font-medium tracking-tight uppercase">St.16 Ashraf Town Chakwal, Pakistan</p>
                </div>
              </div>
              <a 
                href="https://www.google.com/maps/search/St.16+Ashraf+Town+Chakwal+Pakistan" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black text-brand-red hover:text-white transition-colors uppercase tracking-widest font-urdu group"
              >
                گوگل میپس پر دیکھیں
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4 font-urdu">ہمیں فالو کریں</h3>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="p-3 bg-zinc-800 rounded-full text-gray-400 hover:bg-brand-red hover:text-white transition-all transform hover:-translate-y-1 shadow-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="#" className="p-3 bg-zinc-800 rounded-full text-gray-400 hover:bg-brand-red hover:text-white transition-all transform hover:-translate-y-1 shadow-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="p-3 bg-zinc-800 rounded-full text-gray-400 hover:bg-brand-red hover:text-white transition-all transform hover:-translate-y-1 shadow-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.607.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.246-3.607 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.245-2.242-1.308-3.607-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.607-1.308 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324A4.162 4.162 0 0112 16zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="p-3 bg-zinc-800 rounded-full text-gray-400 hover:bg-brand-red hover:text-white transition-all transform hover:-translate-y-1 shadow-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://wa.me/923450000000" target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-800 rounded-full text-gray-400 hover:bg-green-600 hover:text-white transition-all transform hover:-translate-y-1 shadow-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col md:items-end justify-center">
            <p className="text-gray-500 text-xs mb-2 uppercase tracking-widest">Powered by Gemini 2.5 & 3 Flash</p>
            <p className="text-gray-500 text-xs">© 2024 SWAN NEWS URDU</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
