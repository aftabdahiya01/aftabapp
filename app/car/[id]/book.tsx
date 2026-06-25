import React, { useState } from 'react';
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
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  Wallet,
  Shield,
  Check,
  Banknote,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button, GlassCard } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { createBooking } from '@/hooks/useBookings';

const sampleCar = {
  id: '1',
  brand: 'Porsche',
  model: '911 Carrera',
  name: 'Porsche 911 Carrera S',
  owner_id: 'owner1',
  owner_name: 'Premium Auto Rentals',
  price_per_day: 450,
  location: 'Mumbai',
  photo: 'https://images.unsplash.com/photo-1614162692292-7ac56d9f7f00?w=800',
};

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuth();

  const [pickupDate, setPickupDate] = useState('2026-06-25');
  const [returnDate, setReturnDate] = useState('2026-06-27');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'cash'>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const car = sampleCar;

  const days = Math.ceil(
    (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24)
  ) || 1;

  const subtotal = days * car.price_per_day;
  const tax = subtotal * 0.18;
  const commission = subtotal * 0.15;
  const total = subtotal + tax;

  const formatPrice = (price: number) => `Rs.${price.toLocaleString()}`;

  const handleBooking = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    setError(null);

    if (paymentMethod === 'wallet' && (profile?.wallet_balance || 0) < total) {
      setError('Insufficient wallet balance. Please add funds or choose cash payment.');
      setLoading(false);
      return;
    }

    try {
      const { error: bookingError } = await createBooking({
        car_id: car.id,
        car_name: car.name,
        car_photo: car.photo,
        customer_id: user.id,
        customer_name: profile?.name || 'Guest',
        owner_id: car.owner_id,
        pickup_date: pickupDate,
        return_date: returnDate,
        days,
        amount: total,
        commission,
        owner_amount: subtotal - commission,
        payment_status: paymentMethod === 'wallet' ? 'paid' : 'pending',
      });

      if (bookingError) {
        setError(bookingError);
        setLoading(false);
      } else {
        router.replace('/(tabs)/bookings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Booking failed';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Booking</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Car Summary */}
        <View style={styles.carSummary}>
          <View style={styles.carRow}>
            <View style={styles.carInfo}>
              <Text style={styles.carBrand}>{car.brand}</Text>
              <Text style={styles.carName}>{car.name}</Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color={Colors.primary} />
                <Text style={styles.locationText}>{car.location}</Text>
              </View>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceAmount}>{formatPrice(car.price_per_day)}</Text>
              <Text style={styles.priceUnit}>/day</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Date Selection */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Rental Period</Text>

          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <Calendar size={20} color={Colors.primary} />
              <View style={styles.datefield}>
                <Text style={styles.dateLabel}>Pickup Date</Text>
                <Text style={styles.dateValue}>
                  {new Date(pickupDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.dateDivider} />

            <View style={styles.dateInput}>
              <Calendar size={20} color={Colors.primary} />
              <View style={styles.datefield}>
                <Text style={styles.dateLabel}>Return Date</Text>
                <Text style={styles.dateValue}>
                  {new Date(returnDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.timeInput}>
            <Clock size={20} color={Colors.primary} />
            <View style={styles.datefield}>
              <Text style={styles.dateLabel}>Pickup Time</Text>
              <Text style={styles.dateValue}>{pickupTime}</Text>
            </View>
          </View>

          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{days} {days === 1 ? 'Day' : 'Days'}</Text>
          </View>
        </GlassCard>

        {/* Payment Method */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          {/* Cash Payment */}
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('cash')}
          >
            <View style={styles.paymentLeft}>
              <View style={[styles.paymentIcon, paymentMethod === 'cash' && styles.paymentIconActive]}>
                <Banknote size={20} color={paymentMethod === 'cash' ? Colors.background : Colors.primary} />
              </View>
              <View>
                <Text style={styles.paymentTitle}>Pay at Pickup</Text>
                <Text style={styles.paymentSubtitle}>Cash payment when you collect the car</Text>
              </View>
            </View>
            {paymentMethod === 'cash' && (
              <View style={styles.checkIcon}>
                <Check size={14} color={Colors.background} />
              </View>
            )}
          </TouchableOpacity>

          {/* Wallet Payment */}
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'wallet' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('wallet')}
          >
            <View style={styles.paymentLeft}>
              <View style={[styles.paymentIcon, paymentMethod === 'wallet' && styles.paymentIconActive]}>
                <Wallet size={20} color={paymentMethod === 'wallet' ? Colors.background : Colors.primary} />
              </View>
              <View>
                <Text style={styles.paymentTitle}>Wallet</Text>
                <Text style={styles.paymentSubtitle}>Balance: {formatPrice(profile?.wallet_balance || 0)}</Text>
              </View>
            </View>
            {paymentMethod === 'wallet' && (
              <View style={styles.checkIcon}>
                <Check size={14} color={Colors.background} />
              </View>
            )}
          </TouchableOpacity>

          {/* Card Payment - Coming Soon */}
          <View style={[styles.paymentOption, styles.paymentOptionDisabled]}>
            <View style={styles.paymentLeft}>
              <View style={[styles.paymentIcon, styles.paymentIconDisabled]}>
                <CreditCard size={20} color={Colors.textTertiary} />
              </View>
              <View>
                <Text style={[styles.paymentTitle, styles.paymentTitleDisabled]}>Credit/Debit Card</Text>
                <Text style={styles.paymentSubtitle}>Pay securely online</Text>
              </View>
            </View>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>
        </GlassCard>

        {/* Price Breakdown */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceBreakdownLabel}>
              {formatPrice(car.price_per_day)} x {days} {days === 1 ? 'day' : 'days'}
            </Text>
            <Text style={styles.priceBreakdownValue}>{formatPrice(subtotal)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceBreakdownLabel}>Tax (18%)</Text>
            <Text style={styles.priceBreakdownValue}>{formatPrice(Math.round(tax))}</Text>
          </View>

          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{formatPrice(Math.round(total))}</Text>
          </View>
        </GlassCard>

        {/* Terms */}
        <View style={styles.terms}>
          <Shield size={16} color={Colors.primary} />
          <Text style={styles.termsText}>
            By confirming, you agree to our Terms of Service and Cancellation Policy
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <View style={styles.totalDisplay}>
          <Text style={styles.totalLabelFooter}>Total Amount</Text>
          <Text style={styles.totalAmountFooter}>{formatPrice(Math.round(total))}</Text>
        </View>

        <Button
          title="Confirm Booking"
          onPress={handleBooking}
          loading={loading}
          variant="primary"
          size="lg"
          style={styles.confirmButton}
        />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing['2xl'],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  carSummary: {},
  carRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carInfo: {},
  carBrand: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  carName: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  locationText: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginLeft: Spacing.xs,
  },
  priceTag: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  priceUnit: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
    paddingBottom: 140,
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
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  datefield: {
    marginLeft: Spacing.sm,
  },
  dateLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  dateValue: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    marginTop: 2,
  },
  dateDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  durationBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.lg,
  },
  durationText: {
    color: Colors.background,
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  paymentOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceSecondary,
  },
  paymentOptionDisabled: {
    opacity: 0.6,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconActive: {
    backgroundColor: Colors.primary,
  },
  paymentIconDisabled: {
    backgroundColor: Colors.surface,
  },
  paymentTitle: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  paymentTitleDisabled: {
    color: Colors.textTertiary,
  },
  paymentSubtitle: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginTop: 2,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  comingSoonText: {
    color: Colors.background,
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  priceBreakdownLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  priceBreakdownValue: {
    color: Colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  totalRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  totalAmount: {
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 22,
  },
  terms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  termsText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  errorContainer: {
    backgroundColor: Colors.error + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  errorText: {
    color: Colors.error,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalDisplay: {},
  totalLabelFooter: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  totalAmountFooter: {
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginTop: 2,
  },
  confirmButton: {
    paddingHorizontal: Spacing['2xl'],
  },
});
