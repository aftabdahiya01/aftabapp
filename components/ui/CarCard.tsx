import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Heart, MapPin, Zap, Gauge, Users } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Car } from '@/types/database';
import { CachedImage, preloadImage } from './CachedImage';

interface CarCardProps {
  car: Car;
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  showStatus?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing['2xl'] * 2;

const categoryColors: Record<string, string> = {
  Budget: Colors.budget,
  Hatchback: Colors.hatchback,
  Sedan: Colors.sedan,
  SUV: Colors.suv,
  Luxury: Colors.luxury,
  EV: Colors.ev,
};

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1544636331-e2689cd47cad?w=400&q=80';

export function CarCard({ car, onPress, onFavoritePress, isFavorite = false, showStatus = false }: CarCardProps) {
  const displayPhoto = car.photos?.[0] || PLACEHOLDER_IMAGE;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Preload image when card mounts
    preloadImage(displayPhoto);
  }, [displayPhoto]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const formatPrice = (price: number) => `Rs.${price.toLocaleString()}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.imageContainer}>
          <CachedImage
            uri={displayPhoto}
            style={styles.image}
            resizeMode="cover"
            fadeInDuration={200}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageOverlay}
          />

          {/* Favorite Button */}
          {onFavoritePress && (
            <TouchableOpacity
              onPress={onFavoritePress}
              style={styles.favoriteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Heart
                size={20}
                color={isFavorite ? Colors.error : Colors.text}
                fill={isFavorite ? Colors.error : 'transparent'}
              />
            </TouchableOpacity>
          )}

          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryColors[car.category] || Colors.primary }]}>
            <Text style={styles.categoryText}>{car.category}</Text>
          </View>

          {/* Status Badge (for owners) */}
          {showStatus && (
            <View style={[styles.statusBadge, car.status === 'approved' && styles.statusApproved]}>
              <Text style={styles.statusText}>{car.status}</Text>
            </View>
          )}

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Star size={14} color={Colors.accent} fill={Colors.accent} />
            <Text style={styles.ratingText}>{(car.rating || 4.5).toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.brand}>{car.brand}</Text>
            <Text style={styles.name}>{car.name}</Text>
          </View>

          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Users size={14} color={Colors.textTertiary} />
              <Text style={styles.specText}>{car.seats || 4} seats</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Gauge size={14} color={Colors.textTertiary} />
              <Text style={styles.specText}>{car.transmission}</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Zap size={14} color={Colors.textTertiary} />
              <Text style={styles.specText}>{car.fuel}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.locationRow}>
              <MapPin size={14} color={Colors.primary} />
              <Text style={styles.locationText}>{car.location}</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatPrice(car.price_per_day)}</Text>
              <Text style={styles.priceUnit}>/day</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.warning,
  },
  statusApproved: {
    backgroundColor: Colors.success,
  },
  statusText: {
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  ratingContainer: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  ratingText: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    marginLeft: 4,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  brand: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginTop: 2,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  specItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specText: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    marginLeft: Spacing.xs,
  },
  specDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginLeft: Spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  priceUnit: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 2,
  },
});
