import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Booking, BookingInsert, BookingUpdate } from '@/types/database';

interface UseBookingsOptions {
  customer_id?: string;
  owner_id?: string;
  status?: string;
}

interface UseBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBookings(options: UseBookingsOptions = {}): UseBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.customer_id) {
        query = query.eq('customer_id', options.customer_id);
      }

      if (options.owner_id) {
        query = query.eq('owner_id', options.owner_id);
      }

      if (options.status) {
        query = query.eq('status', options.status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setBookings(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, refresh: fetchBookings };
}

export function useBooking(id: string | undefined) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setBooking(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch booking';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  return { booking, loading, error };
}

export async function createBooking(bookingData: BookingInsert): Promise<{ booking: Booking | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) return { booking: null, error: error.message };

    // Create booking payment transaction
    if (data) {
      await supabase.from('transactions').insert({
        type: 'booking_payment',
        booking_id: data.id,
        customer_id: bookingData.customer_id,
        amount: bookingData.amount,
        commission: bookingData.commission,
      });

      // Create commission transaction for owner
      await supabase.from('transactions').insert({
        type: 'commission',
        booking_id: data.id,
        owner_id: bookingData.owner_id,
        amount: -bookingData.commission,
        commission: bookingData.commission,
        owner_credit: bookingData.owner_amount,
      });

      // Award loyalty points (1 point per $10 spent)
      const pointsToEarn = Math.floor(bookingData.amount / 10);
      if (pointsToEarn > 0) {
        // Get user's loyalty tier for multiplier
        const { data: loyaltyData } = await supabase
          .from('loyalty_points')
          .select('*')
          .eq('user_id', bookingData.customer_id)
          .maybeSingle();

        const multipliers: Record<string, number> = { silver: 1, gold: 1.25, platinum: 1.5 };
        const tier = loyaltyData?.tier || 'silver';
        const multiplier = multipliers[tier] || 1;
        const finalPoints = Math.round(pointsToEarn * multiplier);

        // Create points transaction
        await supabase.from('points_transactions').insert({
          user_id: bookingData.customer_id,
          amount: finalPoints,
          type: 'earned',
          booking_id: data.id,
          description: `Earned ${finalPoints} points from booking (${multiplier}x ${tier} bonus)`,
        });

        // Update loyalty points if record exists
        if (loyaltyData) {
          const newTotal = loyaltyData.total_earned + finalPoints;
          let newTier = 'silver';
          if (newTotal >= 5000) newTier = 'platinum';
          else if (newTotal >= 1500) newTier = 'gold';

          await supabase
            .from('loyalty_points')
            .update({
              points: loyaltyData.points + finalPoints,
              total_earned: newTotal,
              tier: newTier,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', bookingData.customer_id);
        } else {
          // Create new loyalty record
          await supabase.from('loyalty_points').insert({
            user_id: bookingData.customer_id,
            points: finalPoints,
            total_earned: finalPoints,
          });
        }
      }
    }

    return { booking: data, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
    return { booking: null, error: errorMessage };
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking['status']
): Promise<{ error: string | null }> {
  try {
    const updateData: BookingUpdate = { status };

    if (status === 'completed' || status === 'cancelled') {
      updateData.updated_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
    return { error: errorMessage };
  }
}
