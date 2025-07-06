export interface Show {
  id: string;
  title: string;
  poster: string;
  moviesCount: string;
}

export interface WatchSource {
  type: 'dailymotion' | 'youtube' | 'facebook';
  id?: string;
  url?: string;
}

export interface DownloadSource {
  type: 'drive' | 'mediafire' | 'mega';
  url: string;
}

export interface Movie {
  id: string;
  title: string;
  poster: string;
  genre: string;
  rating: string;
  watchSources: WatchSource[];
  downloadSources: DownloadSource[];
  isNew: boolean;
}

export interface MoviesData {
  [key: string]: Movie[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  image?: string;
  read: boolean;
}

export interface SearchFilters {
  series: string;
  genre: string;
  rating: string;
  year: string;
  language: string;
}