import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Review, ReviewInsert } from '@/types/database';

interface UseReviewsOptions {
  car_id?: string;
  owner_id?: string;
  reviewer_id?: string;
  booking_id?: string;
}

interface UseReviewsReturn {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createReview: (review: ReviewInsert) => Promise<{ review: Review | null; error: string | null }>;
  updateReview: (id: string, updates: Partial<Review>) => Promise<{ error: string | null }>;
  deleteReview: (id: string) => Promise<{ error: string | null }>;
  averageRating: number;
}

export function useReviews(options: UseReviewsOptions = {}): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.car_id) {
        query = query.eq('car_id', options.car_id);
      }
      if (options.owner_id) {
        query = query.eq('owner_id', options.owner_id);
      }
      if (options.reviewer_id) {
        query = query.eq('reviewer_id', options.reviewer_id);
      }
      if (options.booking_id) {
        query = query.eq('booking_id', options.booking_id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setReviews(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const createReview = async (reviewData: ReviewInsert): Promise<{ review: Review | null; error: string | null }> => {
    try {
      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();

      if (insertError) return { review: null, error: insertError.message };

      // Update car's total_reviews and rating
      const { data: carData } = await supabase
        .from('cars')
        .select('rating, total_reviews')
        .eq('id', reviewData.car_id)
        .single();

      if (carData) {
        const newTotalReviews = (carData.total_reviews || 0) + 1;
        const newRating = ((carData.rating || 0) * (carData.total_reviews || 0) + reviewData.rating) / newTotalReviews;

        await supabase
          .from('cars')
          .update({
            rating: Math.round(newRating * 10) / 10,
            total_reviews: newTotalReviews,
          })
          .eq('id', reviewData.car_id);
      }

      await fetchReviews();
      return { review: data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create review';
      return { review: null, error: errorMessage };
    }
  };

  const updateReview = async (id: string, updates: Partial<Review>): Promise<{ error: string | null }> => {
    try {
      const { error: updateError } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id);

      if (updateError) return { error: updateError.message };
      await fetchReviews();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
      return { error: errorMessage };
    }
  };

  const deleteReview = async (id: string): Promise<{ error: string | null }> => {
    try {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (deleteError) return { error: deleteError.message };
      await fetchReviews();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete review';
      return { error: errorMessage };
    }
  };

  return {
    reviews,
    loading,
    error,
    refresh: fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    averageRating,
  };
}

export function useFavoriteCars(userId: string | undefined) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('car_id')
          .eq('user_id', userId);

        if (!error && data) {
          setFavorites(data.map(f => f.car_id));
        }
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  const toggleFavorite = async (carId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const isFavorite = favorites.includes(carId);

      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('car_id', carId);
        setFavorites(prev => prev.filter(id => id !== carId));
        return false;
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: userId, car_id: carId });
        setFavorites(prev => [...prev, carId]);
        return true;
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      return favorites.includes(carId);
    }
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite: (carId: string) => favorites.includes(carId),
  };
}
