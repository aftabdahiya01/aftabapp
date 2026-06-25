import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Car,
  User,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Booking } from '@/types/database';

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
  variant?: 'renter' | 'owner' | 'admin';
  showActions?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BookingCard({
  booking,
  onPress,
  variant = 'renter',
  showActions = false,
  style,
}: BookingCardProps) {
  const statusColors: Record<string, string> = {
    confirmed: Colors.success,
    ongoing: Colors.gold,
    completed: Colors.platinum,
    cancelled: Colors.error,
  };

  const statusIcons: Record<string, React.ReactNode> = {
    confirmed: <CheckCircle size={14} color={Colors.success} />,
    ongoing: <Clock size={14} color={Colors.gold} />,
    completed: <CheckCircle size={14} color={Colors.platinum} />,
    cancelled: <XCircle size={14} color={Colors.error} />,
  };

  const totalDays = Math.ceil(
    (new Date(booking.return_date).getTime() - new Date(booking.pickup_date).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.container, style]}>
      <LinearGradient
        colors={[Colors.surfaceSecondary, Colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.carInfo}>
            <Text style={styles.carName}>{booking.car_name}</Text>
            <View style={styles.idRow}>
              <Text style={styles.idLabel}>ID: </Text>
              <Text style={styles.idValue}>{booking.id.slice(0, 8).toUpperCase()}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColors[booking.status] }]}>
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.datesContainer}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Pickup</Text>
            <View style={styles.dateRow}>
              <Calendar size={14} color={Colors.gold} />
              <Text style={styles.dateText}>
                {new Date(booking.pickup_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.duration}>
            <ArrowRight size={16} color={Colors.textTertiary} />
            <Text style={styles.durationText}>{totalDays} days</Text>
          </View>

          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Return</Text>
            <View style={styles.dateRow}>
              <Calendar size={14} color={Colors.gold} />
              <Text style={styles.dateText}>
                {new Date(booking.return_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amount}>Rs.{booking.amount.toFixed(0)}</Text>
          </View>

          {variant === 'owner' && (
            <View style={styles.ownerInfo}>
              <User size={14} color={Colors.textTertiary} />
              <Text style={styles.ownerText}>{booking.customer_name}</Text>
            </View>
          )}

          {variant === 'renter' && (
            <View style={styles.statItem}>
              {statusIcons[booking.status]}
              <Text style={[styles.statusTextDetail, { color: statusColors[booking.status] }]}>
                {booking.status === 'confirmed' ? 'Ready for pickup' : booking.status === 'ongoing' ? 'Currently active' : booking.status}
              </Text>
            </View>
          )}

          {variant === 'admin' && (
            <View style={styles.adminAmounts}>
              <Text style={styles.commissionText}>Commission: Rs.{booking.commission.toFixed(0)}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  gradient: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  idRow: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  idLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  idValue: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  datesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dateBlock: {
    flex: 1,
  },
  dateLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    marginLeft: Spacing.xs,
  },
  duration: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  durationText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  amountContainer: {},
  amountLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    color: Colors.gold,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginTop: 2,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerText: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginLeft: Spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextDetail: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    marginLeft: Spacing.xs,
  },
  adminAmounts: {},
  commissionText: {
    color: Colors.gold,
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
});
