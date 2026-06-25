import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import {
  User,
  Wallet,
  Settings,
  Shield,
  Car,
  HelpCircle,
  ChevronRight,
  LogOut,
  MapPin,
  Calendar,
  Award,
  Gift,
  Star,
  TrendingUp,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLoyalty } from '@/hooks/useLoyalty';
import { Avatar, GlassCard, Button, Badge, LoadingSpinner } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  badge?: string;
  badgeVariant?: 'gold' | 'success' | 'warning' | 'error';
}

function MenuItem({ icon, title, subtitle, onPress, badge, badgeVariant = 'gold' }: MenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>{icon}</View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {badge && (
          <Badge text={badge} variant={badgeVariant} />
        )}
        <ChevronRight size={20} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { loyaltyData, transactions, referralCode, loading: loyaltyLoading } = useLoyalty(user?.id);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  const getRoleBadge = () => {
    if (profile?.role === 'owner') return 'Owner';
    if (profile?.role === 'admin') return 'Admin';
    return 'Customer';
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return Colors.platinum;
      case 'gold': return Colors.primary;
      default: return Colors.textTertiary;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Star size={20} color={Colors.platinum} fill={Colors.platinum} />;
      case 'gold': return <Award size={20} color={Colors.primary} fill={Colors.primary} />;
      default: return <Award size={20} color={Colors.textTertiary} />;
    }
  };

  const getNextTier = () => {
    if (!loyaltyData) return null;
    const tierThresholds = [
      { tier: 'platinum', min: 5000 },
      { tier: 'gold', min: 1500 },
    ];
    for (const t of tierThresholds) {
      if (loyaltyData.tier !== t.tier && loyaltyData.total_earned < t.min) {
        return { name: t.tier, pointsNeeded: t.min - loyaltyData.total_earned };
      }
    }
    return null;
  };

  const nextTier = getNextTier();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.header}
      >
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Avatar
            source={null}
            name={profile?.name || 'User'}
            size="xl"
          />
          <View style={styles.profileDetails}>
            <Text style={styles.userName}>{profile?.name || 'Guest User'}</Text>
            <Text style={styles.userEmail}>{profile?.email || user?.email}</Text>
            <View style={styles.roleRow}>
              <Badge
                text={getRoleBadge()}
                variant={profile?.role === 'owner' ? 'gold' : 'default'}
              />
              {profile?.kyc_verified && (
                <Badge text="Verified" variant="success" />
              )}
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <GlassCard style={styles.statsRow}>
            <View style={styles.statItem}>
              <Wallet size={20} color={Colors.primary} />
              <Text style={styles.statValue}>
                Rs.{profile?.wallet_balance?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>Wallet</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              {loyaltyLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                getTierIcon(loyaltyData?.tier || 'silver')
              )}
              <Text style={[styles.statValue, { color: getTierColor(loyaltyData?.tier || 'silver') }]}>
                {loyaltyData?.tier?.charAt(0).toUpperCase() + loyaltyData?.tier?.slice(1) || 'Silver'}
              </Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </GlassCard>
        </View>

        {/* Loyalty Card */}
        {loyaltyData && (
          <GlassCard style={styles.loyaltyCard}>
            <View style={styles.loyaltyHeader}>
              <View style={styles.loyaltyTitleRow}>
                <Gift size={20} color={Colors.primary} />
                <Text style={styles.loyaltyTitle}>Rewards Points</Text>
              </View>
              <View style={[styles.tierBadge, { borderColor: getTierColor(loyaltyData.tier) }]}>
                <Text style={[styles.tierBadgeText, { color: getTierColor(loyaltyData.tier) }]}>
                  {loyaltyData.tier.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.pointsValue}>{loyaltyData.points.toLocaleString()}</Text>
            <Text style={styles.pointsLabel}>Available Points</Text>
            <View style={styles.pointsRow}>
              <View style={styles.pointsRowItem}>
                <TrendingUp size={16} color={Colors.success} />
                <Text style={styles.pointsRowValue}>+{loyaltyData.total_earned.toLocaleString()}</Text>
                <Text style={styles.pointsRowLabel}>Earned</Text>
              </View>
              <View style={styles.pointsRowItem}>
                <Text style={styles.pointsRowValue}>-{loyaltyData.total_redeemed.toLocaleString()}</Text>
                <Text style={styles.pointsRowLabel}>Redeemed</Text>
              </View>
              {nextTier && (
                <View style={styles.pointsRowItem}>
                  <Text style={styles.pointsRowValue}>{nextTier.pointsNeeded}</Text>
                  <Text style={styles.pointsRowLabel}>to {nextTier.name}</Text>
                </View>
              )}
            </View>
          </GlassCard>
        )}
      </LinearGradient>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Loyalty Section */}
        {referralCode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rewards</Text>
            <GlassCard noPadding style={styles.menuContainer}>
              <MenuItem
                icon={<Gift size={20} color={Colors.primary} />}
                title="Referral Code"
                subtitle={referralCode.code}
                onPress={() => {}}
                badge={`${referralCode.uses} uses`}
              />
            </GlassCard>
          </View>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <GlassCard noPadding style={styles.menuContainer}>
            <MenuItem
              icon={<User size={20} color={Colors.primary} />}
              title="Edit Profile"
              subtitle="Update your personal info"
              onPress={() => {}}
            />
            <MenuItem
              icon={<Shield size={20} color={Colors.primary} />}
              title="KYC Verification"
              subtitle={profile?.kyc_verified ? 'Verified' : 'Pending verification'}
              onPress={() => router.push('/profile/kyc')}
              badge={profile?.kyc_verified ? 'Done' : 'Required'}
              badgeVariant={profile?.kyc_verified ? 'success' : 'warning'}
            />
            <MenuItem
              icon={<Wallet size={20} color={Colors.primary} />}
              title="Wallet"
              subtitle={`Balance: Rs.${profile?.wallet_balance?.toLocaleString() || '0'}`}
              onPress={() => router.push('/profile/wallet')}
              badge="Add Funds"
            />
          </GlassCard>
        </View>

        {/* Services Section */}
        {profile?.role === 'owner' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner Services</Text>
            <GlassCard noPadding style={styles.menuContainer}>
              <Link href="/owner/dashboard" asChild>
                <MenuItem
                  icon={<Car size={20} color={Colors.primary} />}
                  title="Owner Dashboard"
                  subtitle="Manage your listed cars"
                  onPress={() => {}}
                  badge="Owner"
                  badgeVariant="gold"
                />
              </Link>
              <MenuItem
                icon={<MapPin size={20} color={Colors.primary} />}
                title="Manage Locations"
                subtitle="Set pickup locations"
                onPress={() => {}}
              />
            </GlassCard>
          </View>
        )}

        {/* Admin Section */}
        {profile?.role === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Panel</Text>
            <GlassCard noPadding style={styles.menuContainer}>
              <Link href="/admin" asChild>
                <MenuItem
                  icon={<Settings size={20} color={Colors.primary} />}
                  title="Admin Dashboard"
                  subtitle="Manage platform"
                  onPress={() => {}}
                  badge="Admin"
                  badgeVariant="error"
                />
              </Link>
            </GlassCard>
          </View>
        )}

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <GlassCard noPadding style={styles.menuContainer}>
            <MenuItem
              icon={<HelpCircle size={20} color={Colors.primary} />}
              title="Help Center"
              subtitle="FAQs & support"
              onPress={() => {}}
            />
            <MenuItem
              icon={<Settings size={20} color={Colors.gold} />}
              title="Settings"
              subtitle="App preferences"
              onPress={() => {}}
            />
          </GlassCard>
        </View>

        {/* Sign Out */}
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          size="lg"
          fullWidth
          icon={<LogOut size={20} color={Colors.platinum} />}
          style={styles.signOutButton}
        />

        <Text style={styles.version}>Ridezy v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Spacing['4xl'],
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.xl,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  profileDetails: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  userName: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  userEmail: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statsContainer: {
    marginTop: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  statValue: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginTop: Spacing.sm,
  },
  statLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  loyaltyCard: {
    marginTop: Spacing.lg,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  loyaltyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loyaltyTitle: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  tierBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  tierBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  pointsValue: {
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 36,
  },
  pointsLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  pointsRow: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.xl,
  },
  pointsRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pointsRowValue: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  pointsRowLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  menuContainer: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    marginLeft: Spacing.md,
  },
  menuTitle: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  menuSubtitle: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  signOutButton: {
    marginTop: Spacing.lg,
  },
  version: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
