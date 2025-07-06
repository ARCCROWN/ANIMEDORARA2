import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  username: string;
  profilePicture: string;
  joinDate: string;
  favoriteMovies: FavoriteMovie[];
  watchHistory: WatchHistoryItem[];
  movieRatings: MovieRating[];
}

export interface FavoriteMovie {
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  addedAt: string;
}

export interface WatchHistoryItem {
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  watchedAt: string;
  progress: number;
  duration: number;
}

export interface MovieRating {
  movieId: string;
  rating: number;
  ratedAt: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    id: user.id,
    username: user.username,
    profilePicture: user.profilePicture,
    joinDate: new Date().toISOString(),
    favoriteMovies: [],
    watchHistory: [],
    movieRatings: []
  });

  useEffect(() => {
    if (user.isAuthenticated) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      // Try to load from Supabase first
      const { data: supabaseProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (supabaseProfile) {
        // Load user data from Supabase tables
        const [favoritesResult, historyResult, ratingsResult] = await Promise.all([
          supabase.from('user_favorites').select('*').eq('user_id', user.id),
          supabase.from('user_watch_history').select('*').eq('user_id', user.id).order('watched_at', { ascending: false }),
          supabase.from('user_movie_ratings').select('*').eq('user_id', user.id)
        ]);

        setProfile({
          id: user.id,
          username: supabaseProfile.username,
          profilePicture: supabaseProfile.profile_picture,
          joinDate: supabaseProfile.join_date || supabaseProfile.created_at,
          favoriteMovies: favoritesResult.data?.map(fav => ({
            movieId: fav.movie_id,
            movieTitle: fav.movie_title,
            moviePoster: fav.movie_poster,
            addedAt: fav.added_at
          })) || [],
          watchHistory: historyResult.data?.map(item => ({
            movieId: item.movie_id,
            movieTitle: item.movie_title,
            moviePoster: item.movie_poster,
            watchedAt: item.watched_at,
            progress: item.progress || 0,
            duration: item.duration || 0
          })) || [],
          movieRatings: ratingsResult.data?.map(rating => ({
            movieId: rating.movie_id,
            rating: rating.rating,
            ratedAt: rating.rated_at
          })) || []
        });
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem(`userProfile_${user.id}`);
        if (stored) {
          const parsedProfile = JSON.parse(stored);
          setProfile({
            id: user.id,
            username: user.username,
            profilePicture: user.profilePicture,
            joinDate: parsedProfile.joinDate || new Date().toISOString(),
            favoriteMovies: parsedProfile.favoriteMovies || [],
            watchHistory: parsedProfile.watchHistory || [],
            movieRatings: parsedProfile.movieRatings || []
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveToSupabase = async (type: string, data: any) => {
    try {
      switch (type) {
        case 'favorite':
          await supabase.from('user_favorites').upsert({
            user_id: user.id,
            movie_id: data.movieId,
            movie_title: data.movieTitle,
            movie_poster: data.moviePoster,
            added_at: data.addedAt
          });
          break;
        case 'history':
          await supabase.from('user_watch_history').upsert({
            user_id: user.id,
            movie_id: data.movieId,
            movie_title: data.movieTitle,
            movie_poster: data.moviePoster,
            watched_at: data.watchedAt,
            progress: data.progress,
            duration: data.duration
          });
          break;
        case 'rating':
          await supabase.from('user_movie_ratings').upsert({
            user_id: user.id,
            movie_id: data.movieId,
            rating: data.rating,
            rated_at: data.ratedAt
          });
          break;
      }
    } catch (error) {
      console.error(`Error saving ${type} to Supabase:`, error);
    }
  };

  const updateUsername = (username: string) => {
    if (username.trim().length < 2) {
      throw new Error('Username must be at least 2 characters long');
    }
    if (username.length > 30) {
      throw new Error('Username must be less than 30 characters');
    }
    
    const updatedProfile = { ...profile, username: username.trim() };
    setProfile(updatedProfile);
    
    // Save to localStorage as backup
    localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(updatedProfile));
  };

  const updateProfilePicture = (imageUrl: string) => {
    if (!imageUrl.trim()) {
      throw new Error('Please provide a valid image URL');
    }

    try {
      new URL(imageUrl);
      const updatedProfile = { ...profile, profilePicture: imageUrl.trim() };
      setProfile(updatedProfile);
      
      // Save to localStorage as backup
      localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(updatedProfile));
    } catch {
      throw new Error('Please provide a valid image URL');
    }
  };

  const addToFavorites = async (movieId: string, movieTitle: string, moviePoster: string) => {
    const existingIndex = profile.favoriteMovies.findIndex(fav => fav.movieId === movieId);
    if (existingIndex !== -1) return;

    const newFavorite: FavoriteMovie = {
      movieId,
      movieTitle,
      moviePoster,
      addedAt: new Date().toISOString()
    };

    const updatedProfile = {
      ...profile,
      favoriteMovies: [newFavorite, ...profile.favoriteMovies]
    };
    setProfile(updatedProfile);
    
    // Save to Supabase and localStorage
    await saveToSupabase('favorite', newFavorite);
    localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(updatedProfile));
  };

  const removeFromFavorites = async (movieId: string) => {
    const updatedProfile = {
      ...profile,
      favoriteMovies: profile.favoriteMovies.filter(fav => fav.movieId !== movieId)
    };
    setProfile(updatedProfile);
    
    // Remove from Supabase
    try {
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId);
    } catch (error) {
      console.error('Error removing favorite from Supabase:', error);
    }
    
    localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(updatedProfile));
  };

  const addToWatchHistory = async (movieId: string, movieTitle: string, moviePoster: string, progress: number = 0, duration: number = 0) => {
    const filteredHistory = profile.watchHistory.filter(item => item.movieId !== movieId);
    
    const newHistoryItem: WatchHistoryItem = {
      movieId,
      movieTitle,
      moviePoster,
      watchedAt: new Date().toISOString(),
      progress,
      duration
    };

    const updatedProfile = {
      ...profile,
      watchHistory: [newHistoryItem, ...filteredHistory].slice(0, 50)
    };
    setProfile(updatedProfile);
    
    // Save to Supabase and localStorage
    await saveToSupabase('history', newHistoryItem);
    localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(updatedProfile));
  };

  const rateMovie = async (movieId: string, rating: number) => {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5 stars');
    }

    const existingRatingIndex = profile.movieRatings.findIndex(r => r.movieId === movieId);
    const newRating: MovieRating = {
      movieId,
      rating,
      ratedAt: new Date().toISOString()
    };

    let updatedRatings;
    if (existingRatingIndex !== -1) {
      updatedRatings = [...profile.movieRatings];
      updatedRatings[existingRatingIndex] = newRating;
    } else {
      updatedRatings = [newRating, ...profile.movieRatings];
    }

    const updatedProfile = {
      ...profile,
      movieRatings: updatedRatings
    };
    setProfile(updatedProfile);
    
    // Save to Supabase and localStorage
    await saveToSupabase('rating', newRating);
    localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(updatedProfile));
  };

  const getMovieRating = (movieId: string): number | null => {
    const rating = profile.movieRatings.find(r => r.movieId === movieId);
    return rating ? rating.rating : null;
  };

  const isFavorite = (movieId: string): boolean => {
    return profile.favoriteMovies.some(fav => fav.movieId === movieId);
  };

  const getRecentlyWatched = (limit: number = 10): WatchHistoryItem[] => {
    return profile.watchHistory.slice(0, limit);
  };

  const clearWatchHistory = async () => {
    const updatedProfile = { ...profile, watchHistory: [] };
    setProfile(updatedProfile);
    
    // Clear from Supabase
    try {
      await supabase
        .from('user_watch_history')
        .delete()
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error clearing watch history from Supabase:', error);
    }
    
    localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(updatedProfile));
  };

  const clearFavorites = async () => {
    const updatedProfile = { ...profile, favoriteMovies: [] };
    setProfile(updatedProfile);
    
    // Clear from Supabase
    try {
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error clearing favorites from Supabase:', error);
    }
    
    localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(updatedProfile));
  };

  return {
    profile,
    updateUsername,
    updateProfilePicture,
    addToFavorites,
    removeFromFavorites,
    addToWatchHistory,
    rateMovie,
    getMovieRating,
    isFavorite,
    getRecentlyWatched,
    clearWatchHistory,
    clearFavorites,
    loadProfile
  };
};