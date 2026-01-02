
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  date: string;
  imageUrl?: string;
  category: string;
  isAdmin?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export type Category = 
  | 'Trending' 
  | 'Technology' 
  | 'Business' 
  | 'Politics' 
  | 'Sports' 
  | 'Health' 
  | 'Entertainment' 
  | 'Science'
  | 'Weather';

export interface AppState {
  articles: NewsArticle[];
  adminArticles: NewsArticle[];
  loading: boolean;
  error: string | null;
  currentCategory: Category;
  searchQuery: string;
  savedArticles: NewsArticle[];
  sources: GroundingSource[];
}
