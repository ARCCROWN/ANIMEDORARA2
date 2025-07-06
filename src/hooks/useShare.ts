import { useState } from 'react';
import { Movie } from '../types';

export const useShare = () => {
  const [isSharing, setIsSharing] = useState(false);

  const generateMovieUrl = (movie: Movie): string => {
    const baseUrl = window.location.origin;
    const movieSlug = movie.title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    return `${baseUrl}/movie/${movie.id}/${movieSlug}`;
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        return result;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  };

  const shareMovie = async (movie: Movie): Promise<boolean> => {
    setIsSharing(true);
    try {
      const movieUrl = generateMovieUrl(movie);
      const shareData = {
        title: `Watch ${movie.title} - AnimeStream`,
        text: `Check out ${movie.title} on AnimeStream! ${movie.genre} • ${movie.rating}`,
        url: movieUrl
      };

      // Try native Web Share API first (mobile devices)
      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        await navigator.share(shareData);
        return true;
      } else {
        // Fallback to copying URL
        const success = await copyToClipboard(movieUrl);
        return success;
      }
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  const shareToSocial = (movie: Movie, platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const movieUrl = generateMovieUrl(movie);
    const text = `Watch ${movie.title} on AnimeStream! ${movie.genre} • ${movie.rating}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(movieUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(movieUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${movieUrl}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return {
    shareMovie,
    shareToSocial,
    copyToClipboard,
    generateMovieUrl,
    isSharing
  };
};