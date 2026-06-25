import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { BookingCard, Button, EmptyState, LoadingSpinner } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const tabs = [
  { id: 'all', label: 'All', icon: Calendar },
  { id: 'confirmed', label: 'Upcoming', icon: Clock },
  { id: 'ongoing', label: 'Active', icon: CheckCircle },
  { id: 'completed', label: 'Completed', icon: CheckCircle },
];

export default function BookingsScreen() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const { bookings, loading, error, refresh } = useBookings({
    customer_id: user?.id,
    ...(activeTab !== 'all' && { status: activeTab }),
  });

  const filteredBookings = activeTab === 'all'
    ? bookings
    : bookings;

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => b.status === 'confirmed').length,
    active: bookings.filter(b => b.status === 'ongoing').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.header}
      >
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>{stats.total} total bookings</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tab, isActive && styles.tabActive]}
              >
                <Icon size={18} color={isActive ? Colors.primary : Colors.textTertiary} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {stats[tab.id as keyof typeof stats] > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>
                      {stats[tab.id as keyof typeof stats]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <LoadingSpinner message="Loading bookings..." />
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={refresh} variant="outline" style={styles.retryButton} />
          </View>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={<Calendar size={48} color={Colors.textTertiary} />}
            title="No bookings yet"
            description="Start your journey by booking a luxury car"
            action={
              activeTab !== 'all' && (
                <Button
                  title="View All Bookings"
                  onPress={() => setActiveTab('all')}
                  variant="outline"
                />
              )
            }
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bookingsList}
          >
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                variant="renter"
                onPress={() => {}}
                style={styles.bookingCard}
              />
            ))}
          </ScrollView>
        )}
      </View>
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
    paddingBottom: Spacing['2xl'],
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
    marginTop: Spacing.sm,
  },
  tabs: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsContent: {
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
  tabTextActive: {
    color: Colors.background,
    fontFamily: 'Inter-SemiBold',
  },
  tabBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.xs,
  },
  tabBadgeText: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  bookingsList: {
    paddingVertical: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  bookingCard: {
    marginBottom: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  errorText: {
    color: Colors.error,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.lg,
  },
});
