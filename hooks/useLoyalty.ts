import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { LoyaltyPoints, PointsTransaction, ReferralCode, LoyaltyTier } from '@/types/database';

const TIER_THRESHOLDS: { tier: LoyaltyTier; minPoints: number }[] = [
  { tier: 'platinum', minPoints: 5000 },
  { tier: 'gold', minPoints: 1500 },
  { tier: 'silver', minPoints: 0 },
];

const TIER_MULTIPLIERS: Record<LoyaltyTier, number> = {
  silver: 1,
  gold: 1.25,
  platinum: 1.5,
};

export function useLoyalty(userId: string | undefined) {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyPoints | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoyaltyData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch or create loyalty points
      let { data: pointsData, error: pointsError } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!pointsData && !pointsError) {
        // Create initial loyalty record
        const { data: newPoints, error: createError } = await supabase
          .from('loyalty_points')
          .insert({ user_id: userId })
          .select()
          .single();

        if (createError) throw createError;
        pointsData = newPoints;
      }

      if (pointsError) throw pointsError;
      setLoyaltyData(pointsData);

      // Fetch points transactions
      const { data: txData, error: txError } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txError) throw txError;
      setTransactions(txData || []);

      // Fetch or create referral code
      let { data: codeData } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!codeData) {
        const code = generateReferralCode();
        const { data: newCode, error: codeError } = await supabase
          .from('referral_codes')
          .insert({ user_id: userId, code })
          .select()
          .single();

        if (!codeError && newCode) {
          codeData = newCode;
        }
      }

      setReferralCode(codeData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch loyalty data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  const calculateTier = (totalEarned: number): LoyaltyTier => {
    for (const { tier, minPoints } of TIER_THRESHOLDS) {
      if (totalEarned >= minPoints) return tier;
    }
    return 'silver';
  };

  const getMultiplier = () => {
    return loyaltyData ? TIER_MULTIPLIERS[loyaltyData.tier] : 1;
  };

  const earnPoints = useCallback(async (baseAmount: number, bookingId?: string) => {
    if (!userId || !loyaltyData) return { error: 'No user or loyalty data' };

    const multiplier = getMultiplier();
    const pointsToEarn = Math.round(baseAmount * multiplier);

    try {
      // Add points transaction
      const { error: txError } = await supabase.from('points_transactions').insert({
        user_id: userId,
        amount: pointsToEarn,
        type: 'earned',
        booking_id: bookingId || null,
        description: `Earned ${pointsToEarn} points (${multiplier}x multiplier)`,
      });

      if (txError) throw txError;

      // Update loyalty points
      const newTotalEarned = loyaltyData.total_earned + pointsToEarn;
      const newPoints = loyaltyData.points + pointsToEarn;
      const newTier = calculateTier(newTotalEarned);

      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({
          points: newPoints,
          total_earned: newTotalEarned,
          tier: newTier,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      await fetchLoyaltyData();
      return { error: null, pointsEarned: pointsToEarn };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to earn points';
      return { error: errorMessage };
    }
  }, [userId, loyaltyData, fetchLoyaltyData]);

  const redeemPoints = useCallback(async (points: number, description?: string) => {
    if (!userId || !loyaltyData) return { error: 'No user or loyalty data' };
    if (loyaltyData.points < points) return { error: 'Insufficient points' };

    try {
      // Add redemption transaction
      const { error: txError } = await supabase.from('points_transactions').insert({
        user_id: userId,
        amount: -points,
        type: 'redeemed',
        description: description || `Redeemed ${points} points`,
      });

      if (txError) throw txError;

      // Update loyalty points
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({
          points: loyaltyData.points - points,
          total_redeemed: loyaltyData.total_redeemed + points,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      await fetchLoyaltyData();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to redeem points';
      return { error: errorMessage };
    }
  }, [userId, loyaltyData, fetchLoyaltyData]);

  const applyReferralCode = useCallback(async (code: string) => {
    if (!userId) return { error: 'No user' };

    try {
      // Check if code exists
      const { data: refCode, error: codeError } = await supabase
        .from('referral_codes')
        .select('*, users!referral_codes_user_id_fkey(id)')
        .eq('code', code)
        .single();

      if (codeError || !refCode) return { error: 'Invalid referral code' };
      if (refCode.user_id === userId) return { error: 'Cannot use own referral code' };

      // Check if already referred
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_id', userId)
        .maybeSingle();

      if (existingReferral) return { error: 'Already used a referral code' };

      // Create referral record
      const { error: referralError } = await supabase.from('referrals').insert({
        referrer_id: refCode.user_id,
        referred_id: userId,
        reward_points: 100,
        status: 'completed',
      });

      if (referralError) throw referralError;

      // Update referrer's code uses
      await supabase
        .from('referral_codes')
        .update({ uses: (refCode.uses || 0) + 1 })
        .eq('user_id', refCode.user_id);

      // Give bonus points to referred user
      await supabase.from('points_transactions').insert({
        user_id: userId,
        amount: 50,
        type: 'referral',
        description: 'Welcome bonus for using referral code',
      });

      // Update referred user's points
      await supabase.rpc('increment_loyalty_points', {
        p_user_id: userId,
        p_points: 50,
      });

      // Give bonus points to referrer
      await supabase.from('points_transactions').insert({
        user_id: refCode.user_id,
        amount: 100,
        type: 'referral',
        description: 'Referral bonus',
      });

      // Try RPC function, fallback to direct update if it doesn't exist
      const { error: rpcError } = await supabase.rpc('increment_loyalty_points', {
        p_user_id: refCode.user_id,
        p_points: 100,
      });

      if (rpcError) {
        // Manual update fallback
        const { data: referrerLoyalty } = await supabase
          .from('loyalty_points')
          .select('*')
          .eq('user_id', refCode.user_id)
          .single();

        if (referrerLoyalty) {
          await supabase
            .from('loyalty_points')
            .update({
              points: referrerLoyalty.points + 100,
              total_earned: referrerLoyalty.total_earned + 100,
            })
            .eq('user_id', refCode.user_id);
        }
      }

      await fetchLoyaltyData();
      return { error: null, reward: 50 };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply referral code';
      return { error: errorMessage };
    }
  }, [userId, fetchLoyaltyData]);

  return {
    loyaltyData,
    transactions,
    referralCode,
    loading,
    error,
    refresh: fetchLoyaltyData,
    earnPoints,
    redeemPoints,
    applyReferralCode,
    getMultiplier,
    tierInfo: TIER_THRESHOLDS,
  };
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'RDZ';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
