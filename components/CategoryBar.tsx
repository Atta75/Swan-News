
import React from 'react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface CategoryBarProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  disabled: boolean;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ activeCategory, onCategoryChange, disabled }) => {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-4 no-scrollbar mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200 dark:border-zinc-800">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          disabled={disabled}
          onClick={() => onCategoryChange(cat)}
          className={`
            relative whitespace-nowrap px-6 py-4 text-sm font-bold transition-all
            ${activeCategory === cat 
              ? 'text-brand-red dark:text-white' 
              : 'text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {cat}
          {activeCategory === cat && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-red"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;
