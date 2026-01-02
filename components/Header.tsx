
import React from 'react';
import { APP_NAME } from '../constants';

interface HeaderProps {
  onSavedClick: () => void;
  onAdminClick: () => void;
  onLogout: () => void;
  onLiveClick: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  savedCount: number;
  isAdminView: boolean;
  isLoggedIn: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onSavedClick, 
  onAdminClick, 
  onLogout,
  onLiveClick,
  isDarkMode, 
  toggleDarkMode, 
  savedCount, 
  isAdminView,
  isLoggedIn
}) => {
  return (
    <header className="sticky top-0 z-50 bg-brand-red dark:bg-zinc-900 border-b border-black/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.location.reload()}>
          {/* SWAN Blocks Logo in BBC Style */}
          <div className="flex gap-0.5">
            {['S', 'W', 'A', 'N'].map((char, i) => (
              <div key={i} className="w-8 h-8 bg-white dark:bg-brand-red flex items-center justify-center">
                <span className="text-brand-red dark:text-white font-black text-lg leading-none pt-0.5">{char}</span>
              </div>
            ))}
          </div>
          <h1 className="hidden sm:block text-xl font-bold text-white tracking-tighter uppercase">
            NEWS URDU
          </h1>
        </div>

        <nav className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          
          <div className="flex items-center bg-black/10 rounded-lg p-0.5">
            <button 
              onClick={onAdminClick}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold rounded-md transition-all ${isAdminView ? 'bg-white text-brand-red shadow-sm' : 'text-white/90 hover:text-white'}`}
            >
               <span className="font-urdu">ایڈمن</span>
            </button>
            {isLoggedIn && (
              <button 
                onClick={onLogout}
                className="px-2 py-1.5 text-white/60 hover:text-white transition-colors"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            )}
          </div>

          <button 
            onClick={onSavedClick}
            className="relative flex items-center gap-2 px-3 py-2 text-sm font-bold text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="font-urdu">محفوظ</span>
            {savedCount > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] bg-white text-brand-red text-[10px] font-black rounded-full px-1">
                {savedCount}
              </span>
            )}
          </button>

          <button 
            onClick={onLiveClick}
            className="flex items-center gap-2 px-4 py-2 bg-white text-brand-red hover:bg-gray-100 text-xs font-black uppercase tracking-widest rounded transition-all active:scale-95 group"
          >
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse group-hover:scale-125 transition-transform"></span>
            LIVE
          </button>
        </nav>
      </div>
      {isDarkMode && <div className="h-1 bg-brand-red w-full"></div>}
    </header>
  );
};

export default Header;
