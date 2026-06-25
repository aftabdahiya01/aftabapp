import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useLoyalty } from '@/hooks/useLoyalty';
import { Button, GlassCard, LoadingSpinner, FadeInView, ScaleInView } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  Gift,
  Star,
  Crown,
  Share2,
  Copy,
  Check,
  TrendingUp,
  ArrowRight,
  Zap,
} from 'lucide-react-native';

const tierInfo = [
  { tier: 'silver', name: 'Silver', minPoints: 0, color: Colors.textTertiary, multiplier: 1, perks: ['1x Points on bookings', 'Basic support'] },
  { tier: 'gold', name: 'Gold', minPoints: 1500, color: Colors.primary, multiplier: 1.25, perks: ['1.25x Points on bookings', 'Priority support', '5% booking discount'] },
  { tier: 'platinum', name: 'Platinum', minPoints: 5000, color: Colors.platinum, multiplier: 1.5, perks: ['1.5x Points on bookings', 'VIP support', '10% booking discount', 'Free delivery'] },
];

export default function LoyaltyScreen() {
  const { user } = useAuth();
  const { loyaltyData, transactions, referralCode, loading, earnPoints, getMultiplier } = useLoyalty(user?.id);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTierIndex = (tier: string) => {
    return tierInfo.findIndex(t => t.tier === tier);
  };

  const currentTierIndex = loyaltyData ? getTierIndex(loyaltyData.tier) : 0;
  const nextTier = currentTierIndex < tierInfo.length - 1 ? tierInfo[currentTierIndex + 1] : null;
  const pointsToNext = nextTier ? nextTier.minPoints - (loyaltyData?.total_earned || 0) : 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner fullScreen message="Loading rewards..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <LinearGradient
          colors={[Colors.surface, Colors.background]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Gift size={32} color={Colors.primary} />
            <Text style={styles.headerTitle}>Rewards Program</Text>
            <Text style={styles.headerSubtitle}>
              Earn points on every booking and unlock exclusive perks
            </Text>
          </View>
        </LinearGradient>

        {/* Points Balance Card */}
        <FadeInView style={styles.section}>
          <GlassCard style={styles.pointsCard}>
            <View style={styles.pointsHeader}>
              <View style={styles.pointsLabelRow}>
                <Star size={20} color={Colors.primary} />
                <Text style={styles.pointsLabel}>Available Points</Text>
              </View>
              <View style={[styles.tierBadge, { borderColor: loyaltyData ? tierInfo[getTierIndex(loyaltyData.tier)].color : Colors.textTertiary }]}>
                <Text style={[styles.tierBadgeText, { color: loyaltyData ? tierInfo[getTierIndex(loyaltyData.tier)].color : Colors.textTertiary }]}>
                  {(loyaltyData?.tier || 'silver').toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.pointsValue}>{(loyaltyData?.points || 0).toLocaleString()}</Text>
            <Text style={styles.pointsSubtext}>
              {getMultiplier()}x earning rate active
            </Text>

            {/* Progress to next tier */}
            {nextTier && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress to {nextTier.name}</Text>
                  <Text style={styles.progressValue}>{pointsToNext} pts needed</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(100, ((loyaltyData?.total_earned || 0) / nextTier.minPoints) * 100)}%`,
                        backgroundColor: nextTier.color,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </GlassCard>
        </FadeInView>

        {/* Referral Code */}
        {referralCode && (
          <FadeInView delay={100} style={styles.section}>
            <Text style={styles.sectionTitle}>Share & Earn</Text>
            <GlassCard style={styles.referralCard}>
              <View style={styles.referralHeader}>
                <Share2 size={20} color={Colors.primary} />
                <Text style={styles.referralTitle}>Your Referral Code</Text>
              </View>
              <View style={styles.referralCodeRow}>
                <Text style={styles.referralCode}>{referralCode.code}</Text>
                <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
                  {copied ? (
                    <Check size={20} color={Colors.success} />
                  ) : (
                    <Copy size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.referralBonus}>
                You earn 100 points for each friend who books. They get 50 points too!
              </Text>
            </GlassCard>
          </FadeInView>
        )}

        {/* Tier Perks */}
        <FadeInView delay={200} style={styles.section}>
          <Text style={styles.sectionTitle}>Membership Tiers</Text>
          {tierInfo.map((tier, index) => {
            const isCurrent = loyaltyData?.tier === tier.tier;
            return (
              <ScaleInView key={tier.tier} delay={index * 100}>
                <GlassCard style={[styles.tierCard, isCurrent && styles.tierCardActive]}>
                  <View style={styles.tierHeader}>
                    <View style={styles.tierNameRow}>
                      {tier.tier === 'platinum' ? (
                        <Crown size={24} color={tier.color} fill={tier.color} />
                      ) : tier.tier === 'gold' ? (
                        <Star size={24} color={tier.color} fill={tier.color} />
                      ) : (
                        <Star size={24} color={tier.color} />
                      )}
                      <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
                    </View>
                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <Zap size={12} color={Colors.black} />
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.tierPoints}>
                    {tier.minPoints.toLocaleString()}+ total points
                  </Text>
                  <View style={styles.perksList}>
                    {tier.perks.map((perk, i) => (
                      <View key={i} style={styles.perkItem}>
                        <View style={[styles.perkDot, { backgroundColor: tier.color }]} />
                        <Text style={styles.perkText}>{perk}</Text>
                      </View>
                    ))}
                  </View>
                </GlassCard>
              </ScaleInView>
            );
          })}
        </FadeInView>

        {/* Recent Points Activity */}
        {transactions && transactions.length > 0 && (
          <FadeInView delay={300} style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <GlassCard noPadding style={styles.activityCard}>
              {transactions.slice(0, 5).map((tx, index) => (
                <View
                  key={tx.id}
                  style={[
                    styles.activityItem,
                    index < transactions.length - 1 && styles.activityItemBorder,
                  ]}
                >
                  <View style={styles.activityLeft}>
                    <TrendingUp
                      size={16}
                      color={tx.amount > 0 ? Colors.success : Colors.error}
                    />
                    <View style={styles.activityText}>
                      <Text style={styles.activityDesc}>{tx.description || tx.type}</Text>
                      <Text style={styles.activityDate}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.activityAmount,
                      { color: tx.amount > 0 ? Colors.success : Colors.error },
                    ]}
                  >
                    {tx.amount > 0 ? '+' : ''}{tx.amount} pts
                  </Text>
                </View>
              ))}
            </GlassCard>
          </FadeInView>
        )}

        {/* Points Value */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            100 points = $1 discount on bookings
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing['5xl'],
  },
  header: {
    paddingTop: Spacing['4xl'],
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
    borderBottomLeftRadius: BorderRadius['3xl'],
    borderBottomRightRadius: BorderRadius['3xl'],
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginTop: Spacing.sm,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  section: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  pointsCard: {
    padding: Spacing['2xl'],
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  pointsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pointsLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  tierBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  tierBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  pointsValue: {
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 48,
  },
  pointsSubtext: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  progressSection: {
    marginTop: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  progressValue: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  referralCard: {
    padding: Spacing.lg,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  referralTitle: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  referralCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  referralCode: {
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    letterSpacing: 2,
  },
  copyButton: {
    padding: Spacing.sm,
  },
  referralBonus: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  tierCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tierCardActive: {
    borderColor: Colors.gold,
    borderWidth: 1,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  tierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tierName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  tierPoints: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: Spacing.md,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  currentBadgeText: {
    color: Colors.black,
    fontFamily: 'Inter-Bold',
    fontSize: 10,
  },
  perksList: {
    gap: Spacing.xs,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  perkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  perkText: {
    color: Colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  activityCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  activityText: {
    flex: 1,
  },
  activityDesc: {
    color: Colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  activityDate: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  activityAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  infoSection: {
    padding: Spacing['2xl'],
    alignItems: 'center',
  },
  infoText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});
