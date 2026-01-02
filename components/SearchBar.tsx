
import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto w-full mb-8">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-brand-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="SWAN NEWS تلاش کریں..."
        disabled={isLoading}
        className="block w-full pl-11 pr-32 py-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:bg-white focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red dark:text-white transition-all outline-none text-lg placeholder-gray-400 font-urdu"
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="absolute right-2 top-2 bottom-2 px-6 bg-brand-red hover:bg-brand-darkRed disabled:bg-gray-400 text-white font-black transition-all flex items-center gap-2"
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : 'تلاش'}
      </button>
    </form>
  );
};

export default SearchBar;
