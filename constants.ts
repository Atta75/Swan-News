
import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Trending',
  'Technology',
  'Business',
  'Politics',
  'Sports',
  'Health',
  'Entertainment',
  'Science',
  'Weather'
];

export const APP_NAME = "SWAN NEWS";

export const CATEGORY_QUERIES: Record<Category, string> = {
  'Trending': 'latest major breaking news headlines from Pakistan and South Asia today',
  'Technology': 'latest technology news in Urdu context, global AI developments',
  'Business': 'Pakistan economy news, stock market updates, and global business trends',
  'Politics': 'Pakistan political situation, South Asian international relations',
  'Sports': 'Pakistan cricket news, global sports results and highlights',
  'Health': 'health and wellness news relevant to South Asia, medical breakthroughs',
  'Entertainment': 'Lollywood, Bollywood news, and global entertainment highlights',
  'Science': 'space exploration and scientific discoveries news from an Urdu perspective',
  'Weather': 'Pakistan weather forecast, climate change news in South Asia, and regional environmental updates'
};
