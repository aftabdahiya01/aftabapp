import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Users,
  Car,
  DollarSign,
  Shield,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  XCircle,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useCars } from '@/hooks/useCars';
import { useBookings } from '@/hooks/useBookings';
import { supabase } from '@/lib/supabase';
import { GlassCard, Button, Badge, LoadingSpinner } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'users' | 'analytics'>('overview');

  const { cars, loading: carsLoading, refresh: refreshCars } = useCars({});
  const { bookings, loading: bookingsLoading } = useBookings({});

  const pendingCars = cars.filter(c => c.status === 'pending');
  const approvedCars = cars.filter(c => c.status === 'approved');

  const totalRevenue = bookings.reduce((sum, b) => sum + b.commission, 0);
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'ongoing').length;

  const formatPrice = (price: number) => `Rs.${price.toLocaleString()}`;

  const handleCarApproval = async (carId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ status: approved ? 'approved' : 'rejected' })
        .eq('id', carId);

      if (!error) {
        refreshCars();
      }
    } catch (err) {
      console.error('Failed to update car:', err);
    }
  };

  if (carsLoading || bookingsLoading) {
    return <LoadingSpinner fullScreen message="Loading admin data..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Shield size={28} color={Colors.error} />
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Platform Administration</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <DollarSign size={22} color={Colors.primary} />
            <Text style={styles.statValue}>{formatPrice(totalRevenue)}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Activity size={22} color={Colors.accent} />
            <Text style={styles.statValue}>{activeBookings}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Car size={22} color={Colors.success} />
            <Text style={styles.statValue}>{approvedCars.length}</Text>
            <Text style={styles.statLabel}>Cars</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <AlertTriangle size={22} color={Colors.warning} />
            <Text style={styles.statValue}>{pendingCars.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </GlassCard>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['overview', 'cars', 'users', 'analytics'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {activeTab === 'overview' && (
          <>
            {/* Pending Approvals Alert */}
            {pendingCars.length > 0 && (
              <GlassCard style={[styles.alertCard, styles.alertWarning]}>
                <View style={styles.alertHeader}>
                  <AlertTriangle size={20} color={Colors.warning} />
                  <Text style={styles.alertTitle}>Pending Approvals</Text>
                </View>
                <Text style={styles.alertText}>
                  {pendingCars.length} car listing{pendingCars.length > 1 ? 's' : ''} awaiting approval
                </Text>
                <Button
                  title="Review Now"
                  onPress={() => setActiveTab('cars')}
                  variant="outline"
                  size="sm"
                  style={styles.alertButton}
                />
              </GlassCard>
            )}

            {/* Quick Stats */}
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>Platform Statistics</Text>

              <View style={styles.statRow}>
                <Text style={styles.statRowLabel}>Total Cars</Text>
                <Text style={styles.statRowValue}>{cars.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statRowLabel}>Approved Listings</Text>
                <Text style={styles.statRowValue}>{approvedCars.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statRowLabel}>Total Bookings</Text>
                <Text style={styles.statRowValue}>{bookings.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statRowLabel}>Total Commission</Text>
                <Text style={[styles.statRowValue, { color: Colors.primary }]}>
                  Rs.{totalRevenue.toFixed(0)}
                </Text>
              </View>
            </GlassCard>

            {/* Recent Bookings */}
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Bookings</Text>
              {bookings.slice(0, 5).map((booking) => (
                <View key={booking.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    {booking.status === 'completed' ? (
                      <CheckCircle size={16} color={Colors.success} />
                    ) : (
                      <Clock size={16} color={Colors.gold} />
                    )}
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{booking.car_name}</Text>
                    <Text style={styles.activityMeta}>
                      Rs.{booking.amount} . {booking.status}
                    </Text>
                  </View>
                  <Text style={styles.commissionText}>Rs.{booking.commission.toFixed(0)}</Text>
                </View>
              ))}
            </GlassCard>
          </>
        )}

        {activeTab === 'cars' && (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Car Management</Text>
              <Badge text={`${cars.length} total`} variant="gold" />
            </View>

            {/* Pending Cars Section */}
            {pendingCars.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionSubtitle}>
                  Pending Approval ({pendingCars.length})
                </Text>
                {pendingCars.map((car) => (
                  <GlassCard key={car.id} style={styles.pendingCarCard}>
                    <View style={styles.carCardHeader}>
                      <View>
                        <Text style={styles.carBrand}>{car.brand}</Text>
                        <Text style={styles.carName}>{car.name}</Text>
                      </View>
                      <Badge text="Pending" variant="warning" />
                    </View>
                    <View style={styles.carDetails}>
                      <Text style={styles.ownerText}>Owner: {car.owner_name}</Text>
                      <Text style={styles.priceText}>Rs.{car.price_per_day}/day</Text>
                    </View>
                    <View style={styles.carActions}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleCarApproval(car.id, false)}
                      >
                        <XCircle size={18} color={Colors.error} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleCarApproval(car.id, true)}
                      >
                        <CheckCircle size={18} color={Colors.success} />
                      </TouchableOpacity>
                    </View>
                  </GlassCard>
                ))}
              </View>
            )}

            {/* All Cars */}
            <GlassCard style={styles.section}>
              <Text style={styles.sectionSubtitle}>All Listings</Text>
              {cars.map((car) => (
                <View key={car.id} style={styles.carListItem}>
                  <View style={styles.carListItemContent}>
                    <Text style={styles.carListItemName}>{car.name}</Text>
                    <Text style={styles.carListItemOwner}>{car.owner_name}</Text>
                  </View>
                  <Badge
                    text={car.status}
                    variant={car.status === 'approved' ? 'success' : 'default'}
                  />
                </View>
              ))}
            </GlassCard>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>User Statistics</Text>
            </View>
            <GlassCard style={styles.section}>
              <View style={styles.managementRow}>
                <View style={styles.managementItem}>
                  <Users size={24} color={Colors.primary} />
                  <Text style={styles.managementValue}>{bookings.length}</Text>
                  <Text style={styles.managementLabel}>Total Bookings</Text>
                </View>
                <View style={styles.managementItem}>
                  <Car size={24} color={Colors.accent} />
                  <Text style={styles.managementValue}>{cars.length}</Text>
                  <Text style={styles.managementLabel}>Total Cars</Text>
                </View>
              </View>
            </GlassCard>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Platform Analytics</Text>
            </View>
            <GlassCard style={styles.section}>
              <View style={styles.analyticsRow}>
                <BarChart3 size={48} color={Colors.primary} />
                <Text style={styles.analyticsTitle}>Total Revenue</Text>
                <Text style={styles.analyticsValue}>{formatPrice(totalRevenue)}</Text>
                <Text style={styles.analyticsSubtext}>
                  From {bookings.length} bookings across {cars.length} cars
                </Text>
              </View>
              <View style={styles.analyticsDetails}>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsLabel}>Active Bookings</Text>
                  <Text style={styles.analyticsValue}>{activeBookings}</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsLabel}>Completed</Text>
                  <Text style={styles.analyticsValue}>{bookings.filter(b => b.status === 'completed').length}</Text>
                </View>
              </View>
            </GlassCard>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.titanium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 32,
  },
  subtitle: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  statValue: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    marginTop: Spacing.sm,
  },
  statLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    marginTop: Spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.error,
  },
  tabText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Medium',
    fontSize: 15,
  },
  activeTabText: {
    color: Colors.error,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    padding: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  alertCard: {
    marginBottom: Spacing.lg,
  },
  alertWarning: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  alertTitle: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
  alertText: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  alertButton: {
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: Spacing.lg,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statRowLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  statRowValue: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.titanium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  activityTitle: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  activityMeta: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  commissionText: {
    color: Colors.gold,
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  listTitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  pendingCarCard: {
    marginBottom: Spacing.md,
  },
  carCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  carBrand: {
    color: Colors.gold,
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  carName: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginTop: 2,
  },
  carDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  ownerText: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  priceText: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  carActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  managementRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.lg,
  },
  managementItem: {
    alignItems: 'center',
  },
  managementValue: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginTop: Spacing.sm,
  },
  managementLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  analyticsRow: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  analyticsTitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginTop: Spacing.lg,
  },
  analyticsValue: {
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginTop: Spacing.sm,
  },
  analyticsSubtext: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  analyticsDetails: {
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  analyticsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  analyticsLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});
