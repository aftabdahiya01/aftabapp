import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Gauge,
  Zap,
  Users,
  Fuel,
  Shield,
  Star,
  Check,
  ShieldCheck,
  Navigation,
} from 'lucide-react-native';
import { useCar } from '@/hooks/useCars';
import { Button, GlassCard, LoadingSpinner, Badge, CachedImage, preloadImages } from '@/components/ui';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const sampleCar = {
  id: '1',
  brand: 'Porsche',
  model: '911 Carrera',
  name: 'Porsche 911 Carrera S',
  owner_id: 'owner1',
  owner_name: 'Premium Auto Rentals',
  registration_number: 'MH01AB1234',
  price_per_day: 450,
  category: 'Luxury' as const,
  transmission: 'Automatic' as const,
  fuel: 'Petrol' as const,
  seats: 4,
  location: 'Mumbai',
  description: 'Experience the pinnacle of German engineering with the Porsche 911 Carrera S. This iconic sports car combines timeless design with cutting-edge technology.',
  photos: [
    'https://images.unsplash.com/photo-1614162692292-7ac56d9f7f00?w=800',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    'https://images.unsplash.com/photo-1614162692292-7ac56d9f7f00?w=800',
  ],
  status: 'approved' as const,
  rating: 4.9,
  total_bookings: 120,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const { car: fetchedCar, loading, error } = useCar(id);
  const car = fetchedCar || sampleCar;

  // Preload all car images
  useEffect(() => {
    if (car.photos && car.photos.length > 0) {
      preloadImages(car.photos);
    }
  }, [car.photos]);

  const handleSubmitBooking = () => {
    router.push(`/car/${id}/book`);
  };

  const features = [
    'Paddle Shift',
    'Navigation',
    'Bluetooth',
    'Climate Control',
    'Parking Sensors',
    'Sunroof',
    'Heated Seats',
    '360° Camera',
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
        >
          {(car.photos?.length > 0 ? car.photos : sampleCar.photos).map((photo, index) => (
            <CachedImage
              key={index}
              uri={photo}
              style={styles.carImage}
              resizeMode="cover"
              fadeInDuration={200}
            />
          ))}
        </ScrollView>

        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />

        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.headerButton}>
              <Heart
                size={24}
                color={Colors.text}
                fill={isFavorite ? Colors.error : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Share2 size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Dots */}
        <View style={styles.imageDots}>
          {(car.photos?.length > 0 ? car.photos : sampleCar.photos).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentImageIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Car Info */}
        <View style={styles.carInfo}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.brand}>{car.brand}</Text>
              <Text style={styles.model}>{car.name}</Text>
            </View>
            <View style={styles.rating}>
              <Star size={18} color={Colors.gold} fill={Colors.gold} />
              <Text style={styles.ratingText}>{car.rating?.toFixed(1) || '4.9'}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={16} color={Colors.gold} />
            <Text style={styles.locationText}>{car.location}</Text>
          </View>

          <View style={styles.specsGrid}>
            <View style={styles.specCard}>
              <Users size={20} color={Colors.gold} />
              <Text style={styles.specValue}>{car.seats}</Text>
              <Text style={styles.specLabel}>Seats</Text>
            </View>
            <View style={styles.specCard}>
              <Gauge size={20} color={Colors.gold} />
              <Text style={styles.specValue}>{car.transmission}</Text>
              <Text style={styles.specLabel}>Transmission</Text>
            </View>
            <View style={styles.specCard}>
              <Fuel size={20} color={Colors.gold} />
              <Text style={styles.specValue}>{car.fuel}</Text>
              <Text style={styles.specLabel}>Fuel</Text>
            </View>
            <View style={styles.specCard}>
              <Shield size={20} color={Colors.gold} />
              <Text style={styles.specValue}>Safety</Text>
              <Text style={styles.specLabel}>5 Star</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>About this car</Text>
          <Text style={styles.description}>
            {car.description || sampleCar.description}
          </Text>
        </GlassCard>

        {/* Features */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Check size={14} color={Colors.gold} />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Owner Info */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Owner</Text>
          <View style={styles.ownerRow}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerInitials}>
                {(car.owner_name?.[0] || 'P').toUpperCase()}
              </Text>
            </View>
            <View style={styles.ownerDetails}>
              <View style={styles.ownerNameRow}>
                <Text style={styles.ownerName}>{car.owner_name || sampleCar.owner_name}</Text>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={14} color={Colors.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
              <View style={styles.ownerStats}>
                <Star size={14} color={Colors.primary} fill={Colors.primary} />
                <Text style={styles.ownerRating}>4.9</Text>
                <Text style={styles.ownerTrips}> . {car.total_bookings || 120} trips</Text>
              </View>
            </View>
          </View>
          {/* Verification Details */}
          <View style={styles.verificationDetails}>
            <View style={styles.verificationItem}>
              <Check size={12} color={Colors.success} />
              <Text style={styles.verificationItemText}>ID Verified</Text>
            </View>
            <View style={styles.verificationItem}>
              <Check size={12} color={Colors.success} />
              <Text style={styles.verificationItemText}>License Verified</Text>
            </View>
            <View style={styles.verificationItem}>
              <Check size={12} color={Colors.success} />
              <Text style={styles.verificationItemText}>Vehicle RC Verified</Text>
            </View>
          </View>
        </GlassCard>

        {/* Security Deposit Info */}
        <GlassCard style={styles.section}>
          <View style={styles.depositHeader}>
            <Shield size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Security Deposit</Text>
          </View>
          <Text style={styles.depositInfo}>
            A refundable security deposit of Rs.{(car.security_deposit || 5000).toLocaleString()} will be held during your rental.
          </Text>
          <View style={styles.depositFeatures}>
            <View style={styles.depositFeature}>
              <Check size={14} color={Colors.success} />
              <Text style={styles.depositFeatureText}>Released within 24 hours after return</Text>
            </View>
            <View style={styles.depositFeature}>
              <Check size={14} color={Colors.success} />
              <Text style={styles.depositFeatureText}>Includes vehicle insurance</Text>
            </View>
            <View style={styles.depositFeature}>
              <Check size={14} color={Colors.success} />
              <Text style={styles.depositFeatureText}>Damage protection included</Text>
            </View>
          </View>
        </GlassCard>

        {/* Pricing */}
        <View style={styles.pricingCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price per day</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>Rs.{car.price_per_day}</Text>
            </View>
          </View>

          <Button
            title={`Book ${car.name}`}
            onPress={handleSubmitBooking}
            variant="primary"
            size="lg"
            fullWidth
            icon={<Calendar size={20} color={Colors.black} />}
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
  imageContainer: {
    height: height * 0.45,
    position: 'relative',
  },
  carImage: {
    width: width,
    height: height * 0.45,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
  },
  imageDots: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.textSecondary,
  },
  activeDot: {
    backgroundColor: Colors.gold,
    width: 24,
  },
  content: {
    padding: Spacing['2xl'],
    paddingBottom: Spacing['6xl'],
  },
  carInfo: {
    marginBottom: Spacing['2xl'],
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  brand: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  model: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginTop: 2,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.titanium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  ratingText: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  locationText: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    marginLeft: Spacing.xs,
  },
  specsGrid: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  specCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
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
    fontSize: 11,
    marginTop: 2,
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
  description: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    marginBottom: Spacing.sm,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    color: Colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.titanium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitials: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  ownerDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  verifiedText: {
    color: Colors.success,
    fontFamily: 'Inter-Medium',
    fontSize: 11,
  },
  verificationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verificationItemText: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  depositHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  depositInfo: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  depositFeatures: {
    gap: Spacing.sm,
  },
  depositFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  depositFeatureText: {
    color: Colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  ownerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ownerRating: {
    color: Colors.gold,
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    marginLeft: 2,
  },
  ownerTrips: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  pricingCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  priceLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    color: Colors.gold,
    fontFamily: 'Inter-Bold',
    fontSize: 32,
  },
});
