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
  Car as CarIcon,
  DollarSign,
  Calendar,
  TrendingUp,
  Plus,
  ArrowLeft,
  Users,
  Clock,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useCars } from '@/hooks/useCars';
import { useBookings } from '@/hooks/useBookings';
import { GlassCard, Button, CarCard, LoadingSpinner, Badge } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

export default function OwnerDashboardPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'bookings'>('overview');

  const { cars, loading: carsLoading } = useCars({ owner_id: user?.id });
  const { bookings, loading: bookingsLoading } = useBookings({ owner_id: user?.id });

  const totalEarnings = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.owner_amount, 0);

  const pendingEarnings = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'ongoing')
    .reduce((sum, b) => sum + b.owner_amount, 0);

  const activeListings = cars.filter(c => c.status === 'approved').length;
  const pendingBookings = bookings.filter(b => b.status === 'confirmed').length;

  if (carsLoading || bookingsLoading) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
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
          <Text style={styles.title}>Owner Dashboard</Text>
          <Text style={styles.subtitle}>Manage your fleet</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <DollarSign size={24} color={Colors.gold} />
            <Text style={styles.statValue}>Rs.{totalEarnings.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <TrendingUp size={24} color={Colors.gold} />
            <Text style={styles.statValue}>Rs.{pendingEarnings.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <CarIcon size={24} color={Colors.gold} />
            <Text style={styles.statValue}>{activeListings}</Text>
            <Text style={styles.statLabel}>Active Cars</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Calendar size={24} color={Colors.gold} />
            <Text style={styles.statValue}>{pendingBookings}</Text>
            <Text style={styles.statLabel}>Pending Bkgs</Text>
          </GlassCard>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['overview', 'cars', 'bookings'] as const).map((tab) => (
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
            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/owner/add-car')}>
                <View style={styles.actionGradient}>
                  <Plus size={24} color={Colors.black} />
                  <Text style={styles.actionText}>Add New Car</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Recent Activity */}
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {bookings.slice(0, 5).map((booking) => (
                <View key={booking.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Clock size={16} color={Colors.gold} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{booking.car_name}</Text>
                    <Text style={styles.activityMeta}>
                      {booking.customer_name} - {booking.days} days
                    </Text>
                  </View>
                  <Text style={styles.activityAmount}>Rs.{booking.owner_amount}</Text>
                </View>
              ))}
            </GlassCard>

            {/* Performance */}
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>Performance</Text>
              <View style={styles.performanceRow}>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceValue}>{cars.length}</Text>
                  <Text style={styles.performanceLabel}>Total Cars</Text>
                </View>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceValue}>{bookings.length}</Text>
                  <Text style={styles.performanceLabel}>Total Bookings</Text>
                </View>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceValue}>
                    {(bookings.reduce((sum, b) => sum + b.owner_amount, 0) / Math.max(bookings.length, 1)).toFixed(0)}
                  </Text>
                  <Text style={styles.performanceLabel}>Avg/Booking</Text>
                </View>
              </View>
            </GlassCard>
          </>
        )}

        {activeTab === 'cars' && (
          <>
            {/* My Cars Header */}
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>My Cars ({cars.length})</Text>
              <Button
                title="Add Car"
                onPress={() => router.push('/owner/add-car')}
                variant="gold"
                size="sm"
                icon={<Plus size={16} color={Colors.black} />}
              />
            </View>

            {cars.length === 0 ? (
              <GlassCard style={styles.emptyState}>
                <CarIcon size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>No cars yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start listing your cars to earn money
                </Text>
                <Button
                  title="Add Your First Car"
                  onPress={() => router.push('/owner/add-car')}
                  variant="gold"
                  style={styles.emptyButton}
                />
              </GlassCard>
            ) : (
              cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  onPress={() => router.push(`/owner/car/${car.id}`)}
                  showStatus={true}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'bookings' && (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Bookings ({bookings.length})</Text>
            </View>

            {bookings.length === 0 ? (
              <GlassCard style={styles.emptyState}>
                <Calendar size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>No bookings yet</Text>
                <Text style={styles.emptySubtitle}>
                  Your bookings will appear here
                </Text>
              </GlassCard>
            ) : (
              bookings.map((booking) => (
                <GlassCard key={booking.id} style={styles.bookingItem}>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.bookingCarName}>{booking.car_name}</Text>
                    <Badge
                      text={booking.status}
                      variant={
                        booking.status === 'confirmed' ? 'success' :
                        booking.status === 'ongoing' ? 'gold' : 'default'
                      }
                    />
                  </View>
                  <View style={styles.bookingDetails}>
                    <View style={styles.bookingInfo}>
                      <Users size={14} color={Colors.textTertiary} />
                      <Text style={styles.bookingText}>{booking.customer_name}</Text>
                    </View>
                    <Text style={styles.bookingAmount}>Rs.{booking.owner_amount}</Text>
                  </View>
                </GlassCard>
              ))
            )}
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
    marginBottom: Spacing['2xl'],
  },
  title: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 32,
  },
  subtitle: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
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
    fontSize: 24,
    marginTop: Spacing.sm,
  },
  statLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
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
    borderBottomColor: Colors.gold,
  },
  tabText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Medium',
    fontSize: 15,
  },
  activeTabText: {
    color: Colors.gold,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    padding: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  quickActions: {
    marginBottom: Spacing['2xl'],
  },
  actionButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  actionText: {
    color: Colors.black,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: Spacing.md,
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
    backgroundColor: Colors.gold + '20',
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
  activityAmount: {
    color: Colors.gold,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceValue: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  performanceLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: Spacing.xs,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyTitle: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: Spacing.xl,
  },
  bookingItem: {
    marginBottom: Spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bookingCarName: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bookingText: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  bookingAmount: {
    color: Colors.gold,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
});
