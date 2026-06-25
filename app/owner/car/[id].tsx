import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import {
  ArrowLeft,
  Users,
  Gauge,
  Fuel,
  Calendar,
  DollarSign,
  MapPin,
  Edit,
  Trash2,
} from 'lucide-react-native';
import { useCar } from '@/hooks/useCars';
import { Button, Badge, LoadingSpinner, GlassCard } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

export default function OwnerCarDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { car, loading, error } = useCar(id);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading car details..." />;
  }

  if (!car) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Car not found</Text>
          <Button title="Go Back" onPress={() => router.back()} variant="gold" />
        </View>
      </View>
    );
  }

  const statusVariant = car.status === 'approved' ? 'success' : car.status === 'pending' ? 'warning' : 'error';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.title}>{car.brand}</Text>
          <Text style={styles.subtitle}>{car.name}</Text>
          <View style={styles.statusRow}>
            <Badge text={car.status} variant={statusVariant} />
            <Text style={styles.priceTag}>Rs.{car.price_per_day}/day</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Specifications */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Users size={18} color={Colors.gold} />
              <Text style={styles.specValue}>{car.seats}</Text>
              <Text style={styles.specLabel}>Seats</Text>
            </View>
            <View style={styles.specItem}>
              <Gauge size={18} color={Colors.gold} />
              <Text style={styles.specValue}>{car.transmission}</Text>
              <Text style={styles.specLabel}>Transmission</Text>
            </View>
            <View style={styles.specItem}>
              <Fuel size={18} color={Colors.gold} />
              <Text style={styles.specValue}>{car.fuel}</Text>
              <Text style={styles.specLabel}>Fuel</Text>
            </View>
            <View style={styles.specItem}>
              <Calendar size={18} color={Colors.gold} />
              <Text style={styles.specValue}>{car.total_bookings || 0}</Text>
              <Text style={styles.specLabel}>Bookings</Text>
            </View>
          </View>
        </GlassCard>

        {/* Details */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{car.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Registration</Text>
            <Text style={styles.detailValue}>{car.registration_number}</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={16} color={Colors.gold} />
            <Text style={styles.detailValue}>{car.location}</Text>
          </View>
        </GlassCard>

        {/* Description */}
        {car.description && (
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{car.description}</Text>
          </GlassCard>
        )}

        {/* Stats */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <DollarSign size={20} color={Colors.gold} />
              <Text style={styles.statValue}>
                ${(car.price_per_day * (car.total_bookings || 0)).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{car.rating?.toFixed(1) || '4.5'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </GlassCard>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Edit Listing"
            onPress={() => {}}
            variant="primary"
            size="lg"
            icon={<Edit size={20} color={Colors.text} />}
            style={styles.actionButton}
          />
          <Button
            title="Delete"
            onPress={() => {}}
            variant="outline"
            size="lg"
            icon={<Trash2 size={20} color={Colors.error} />}
            textStyle={{ color: Colors.error }}
          />
        </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
  headerContent: {},
  title: {
    color: Colors.gold,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  priceTag: {
    color: Colors.gold,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  content: {
    padding: Spacing['2xl'],
    paddingBottom: Spacing['5xl'],
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
  specsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    alignItems: 'center',
    flex: 1,
  },
  specValue: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  specLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  detailValue: {
    color: Colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  description: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  errorText: {
    color: Colors.error,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
});
