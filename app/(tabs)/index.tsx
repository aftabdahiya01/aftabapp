import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  Car,
  Bike,
  Shield,
  Clock,
  Wallet,
  Zap,
  Crown,
  Star,
  Percent,
  ChevronRight,
  MessageCircle,
  Bike as BikeIcon,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useCars } from '@/hooks/useCars';
import { Button, GlassCard, LoadingSpinner, FadeInView, ScaleInView, CachedImage, preloadImages } from '@/components/ui';
import { Colors, Spacing, BorderRadius, PopularCities } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

// Car categories
const CarCategories = [
  { id: 'Budget', label: 'Budget', color: Colors.budget, icon: '💰' },
  { id: 'Hatchback', label: 'Hatchback', color: Colors.hatchback, icon: '🚗' },
  { id: 'Sedan', label: 'Sedan', color: Colors.sedan, icon: '🚙' },
  { id: 'SUV', label: 'SUV', color: Colors.suv, icon: '🚐' },
  { id: 'Luxury', label: 'Luxury', color: Colors.luxury, icon: '👑' },
  { id: 'EV', label: 'Electric', color: Colors.ev, icon: '⚡' },
];

// Bike categories
const BikeCategories = [
  { id: 'Scooter', label: 'Scooters', color: '#06B6D4', icon: '🛵' },
  { id: 'Commuter', label: 'Commuter', color: '#10B981', icon: '🏍️' },
  { id: 'Sports', label: 'Sports', color: '#EF4444', icon: '🏎️' },
  { id: 'Electric_Bike', label: 'Electric', color: '#8B5CF6', icon: '⚡' },
  { id: 'Premium', label: 'Premium', color: '#F59E0B', icon: '👑' },
];

// Sample cars
const sampleCars = [
  { id: '1', name: 'Maruti Alto', brand: 'Maruti', model: 'Alto', price_per_day: 350, category: 'Budget' as const, location: 'Mumbai', vehicle_type: 'car' as const, photos: ['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800'], rating: 4.5 },
  { id: '2', name: 'Honda City', brand: 'Honda', model: 'City', price_per_day: 1500, category: 'Sedan' as const, location: 'Delhi', vehicle_type: 'car' as const, photos: ['https://images.unsplash.com/photo-1621007947-8be8a54d5d9f?w=800'], rating: 4.7 },
  { id: '3', name: 'BMW 5 Series', brand: 'BMW', model: '530i', price_per_day: 6500, category: 'Luxury' as const, location: 'Mumbai', vehicle_type: 'car' as const, photos: ['https://images.unsplash.com/photo-1555215695-30049d0d849d?w=800'], rating: 4.9 },
  { id: '4', name: 'Tata Nexon EV', brand: 'Tata', model: 'Nexon EV', price_per_day: 1800, category: 'EV' as const, location: 'Bangalore', vehicle_type: 'car' as const, photos: ['https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800'], rating: 4.6 },
];

// Sample bikes
const sampleBikes = [
  { id: 'b1', name: 'Honda Activa', brand: 'Honda', model: 'Activa 6G', price_per_day: 300, category: 'Scooter' as const, location: 'Mumbai', vehicle_type: 'bike' as const, photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], rating: 4.6 },
  { id: 'b2', name: 'Royal Enfield Classic', brand: 'RE', model: 'Classic 350', price_per_day: 800, category: 'Premium' as const, location: 'Delhi', vehicle_type: 'bike' as const, photos: ['https://images.unsplash.com/photo-1558981803-24de8fdd6a1f?w=800'], rating: 4.8 },
  { id: 'b3', name: 'KTM Duke', brand: 'KTM', model: 'Duke 200', price_per_day: 1200, category: 'Sports' as const, location: 'Bangalore', vehicle_type: 'bike' as const, photos: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a8c?w=800'], rating: 4.7 },
  { id: 'b4', name: 'Ather 450X', brand: 'Ather', model: '450X', price_per_day: 900, category: 'Electric_Bike' as const, location: 'Pune', vehicle_type: 'bike' as const, photos: ['https://images.unsplash.com/photo-1617641810706-9e588a8a1b87?w=800'], rating: 4.5 },
];

// Sample reviews
const sampleReviews = [
  { id: '1', name: 'Rahul S.', rating: 5, comment: 'Amazing experience! The car was in perfect condition and the owner was very helpful.', date: '2 days ago', car: 'BMW 5 Series' },
  { id: '2', name: 'Priya M.', rating: 5, comment: 'Super smooth booking process. Will definitely use Ridezy again!', date: '1 week ago', car: 'Honda City' },
  { id: '3', name: 'Amit K.', rating: 4, comment: 'Great service and affordable prices. The scooter was perfect for city rides.', date: '2 weeks ago', car: 'Honda Activa' },
];

// Sample offers
const sampleOffers = [
  { id: '1', title: 'First Ride Free', subtitle: 'Get 20% off on your first booking', code: 'FIRST20', discount: '20%', color: Colors.primary },
  { id: '2', title: 'Weekend Special', subtitle: 'Extra 15% off on weekend rentals', code: 'WEEKEND15', discount: '15%', color: Colors.accent },
  { id: '3', title: 'Long Trip Savings', subtitle: 'Book 5+ days, save 25%', code: 'LONG25', discount: '25%', color: Colors.success },
];

export default function HomePage() {
  const { user, profile } = useAuth();
  const [vehicleType, setVehicleType] = useState<'car' | 'bike'>('car');
  const [refreshing, setRefreshing] = useState(false);

  const { cars, loading, error, refresh } = useCars({
    status: 'approved',
  });

  // Always compute filtered vehicles - use sample data as fallback
  const filteredVehicles = useMemo(() => {
    const sampleData = vehicleType === 'car' ? sampleCars : sampleBikes;
    const dbVehicles = cars.filter(c => c.vehicle_type === vehicleType || !c.vehicle_type);
    // Only use DB vehicles if we have them, otherwise use sample
    return dbVehicles.length > 0 ? dbVehicles : sampleData;
  }, [cars, vehicleType]);

  // Preload images only once when vehicles change
  const preloadedRef = React.useRef(false);
  useEffect(() => {
    if (!preloadedRef.current && filteredVehicles.length > 0) {
      preloadedRef.current = true;
      const allImages = filteredVehicles.map(v => v.photos?.[0]).filter(Boolean) as string[];
      preloadImages(allImages);
    }
  }, [filteredVehicles]);

  // Preload images
  useEffect(() => {
    const allImages = filteredVehicles.map(v => v.photos?.[0]).filter(Boolean) as string[];
    preloadImages(allImages);
  }, [filteredVehicles]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const formatPrice = (price: number) => `Rs.${price.toLocaleString()}`;

  const currentCategories = vehicleType === 'car' ? CarCategories : BikeCategories;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Hero Banner */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.heroBanner}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroGreeting}>
              {profile ? `Hello, ${profile.name?.split(' ')[0]}` : 'Welcome to'}
            </Text>
            <View style={styles.heroLogoRow}>
              <Sparkles size={28} color={Colors.text} />
              <Text style={styles.heroBrand}>Ridezy</Text>
            </View>
            <Text style={styles.heroSubtitle}>
              {vehicleType === 'car' ? 'Self-Drive Cars for Every Journey' : 'Ride Free, Ride Easy'}
            </Text>
            <Text style={styles.heroTagline}>
              {vehicleType === 'car' ? 'From Alto to Audi' : 'From Activa to Duke'}
            </Text>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.heroSearchBar}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Search size={20} color={Colors.textTertiary} />
            <Text style={styles.heroSearchPlaceholder}>
              Search {vehicleType === 'car' ? 'cars' : 'bikes'} by name, city...
            </Text>
            <ArrowRight size={20} color={Colors.primary} />
          </TouchableOpacity>

          {/* Book Now Button */}
          <TouchableOpacity
            style={styles.bookNowButton}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Text style={styles.bookNowText}>Book Now</Text>
            <ChevronRight size={20} color={Colors.primary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Vehicle Type Tabs */}
        <View style={styles.vehicleTabs}>
          <TouchableOpacity
            style={[styles.vehicleTab, vehicleType === 'car' && styles.vehicleTabActive]}
            onPress={() => setVehicleType('car')}
          >
            <Car size={24} color={vehicleType === 'car' ? Colors.primary : Colors.textTertiary} />
            <Text style={[styles.vehicleTabText, vehicleType === 'car' && styles.vehicleTabTextActive]}>
              Cars
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.vehicleTab, vehicleType === 'bike' && styles.vehicleTabActive]}
            onPress={() => setVehicleType('bike')}
          >
            <BikeIcon size={24} color={vehicleType === 'bike' ? Colors.primary : Colors.textTertiary} />
            <Text style={[styles.vehicleTabText, vehicleType === 'bike' && styles.vehicleTabTextActive]}>
              Bikes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {currentCategories.map((category, index) => (
              <Link
                key={category.id}
                href={`/(tabs)/explore?category=${category.id}&type=${vehicleType}`}
                asChild
              >
                <TouchableOpacity style={styles.categoryCard}>
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.label}</Text>
                </TouchableOpacity>
              </Link>
            ))}
          </ScrollView>
        </View>

        {/* Popular Cities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Cities</Text>
          <View style={styles.citiesGrid}>
            {PopularCities.slice(0, 6).map((city) => (
              <Link key={city} href={`/(tabs)/explore?location=${city}`} asChild>
                <TouchableOpacity style={styles.cityChip}>
                  <MapPin size={14} color={Colors.primary} />
                  <Text style={styles.cityText}>{city}</Text>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>

        {/* Featured Vehicles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Crown size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Featured {vehicleType === 'car' ? 'Cars' : 'Bikes'}</Text>
            </View>
            <Link href="/(tabs)/explore" asChild>
              <TouchableOpacity style={styles.seeAll}>
                <Text style={styles.seeAllText}>See All</Text>
                <ArrowRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            </Link>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {filteredVehicles.slice(0, 6).map((vehicle, index) => (
              <Link key={vehicle.id} href={`/car/${vehicle.id}`} asChild>
                <TouchableOpacity style={styles.featuredCard}>
                  <CachedImage
                    uri={vehicle.photos?.[0]}
                    style={styles.featuredImage}
                    fadeInDuration={200}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.featuredOverlay}
                  />
                  <View style={styles.featuredRating}>
                    <Star size={12} color={Colors.gold} fill={Colors.gold} />
                    <Text style={styles.featuredRatingText}>{vehicle.rating || 4.5}</Text>
                  </View>
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredBrand}>{vehicle.brand}</Text>
                    <Text style={styles.featuredName}>{vehicle.name}</Text>
                    <View style={styles.featuredPriceRow}>
                      <Text style={styles.featuredPrice}>{formatPrice(vehicle.price_per_day)}</Text>
                      <Text style={styles.featuredUnit}>/day</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </ScrollView>
        </View>

        {/* Offers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Percent size={20} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Offers & Discounts</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offersScroll}
          >
            {sampleOffers.map((offer) => (
              <View key={offer.id} style={[styles.offerCard, { backgroundColor: offer.color + '20' }]}>
                <Text style={styles.offerDiscount}>{offer.discount} OFF</Text>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                <View style={styles.offerCodeRow}>
                  <Text style={styles.offerCodeLabel}>Code:</Text>
                  <Text style={styles.offerCode}>{offer.code}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Customer Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MessageCircle size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
            </View>
          </View>
          {sampleReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{review.name[0]}</Text>
                </View>
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewName}>{review.name}</Text>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} color={i < review.rating ? Colors.gold : Colors.border} fill={i < review.rating ? Colors.gold : 'transparent'} />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewCar}>Rented: {review.car}</Text>
            </View>
          ))}
        </View>

        {/* Why Ridezy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Ridezy</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Shield size={28} color={Colors.primary} />
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.statCard}>
              <Wallet size={28} color={Colors.success} />
              <Text style={styles.statValue}>Rs.300</Text>
              <Text style={styles.statLabel}>From/Day</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={28} color={Colors.accent} />
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Support</Text>
            </View>
          </View>
        </View>

        {/* Owner CTA */}
        <View style={styles.ownerCTA}>
          <LinearGradient
            colors={[Colors.surface, Colors.background]}
            style={styles.ownerCTAGradient}
          >
            <Car size={40} color={Colors.primary} />
            <Text style={styles.ownerCTATitle}>Own a {vehicleType === 'car' ? 'Car' : 'Bike'}?</Text>
            <Text style={styles.ownerCTASubtitle}>
              Earn money by renting it out when you're not using it
            </Text>
            <Link href="/owner/dashboard" asChild>
              <Button
                title="Start Earning"
                variant="primary"
                size="md"
                icon={<ArrowRight size={18} color={Colors.text} />}
                style={{ marginTop: Spacing.md }}
              />
            </Link>
          </LinearGradient>
        </View>

        {/* App Download CTA */}
        <View style={styles.appCTA}>
          <Text style={styles.appCTATitle}>Download the App</Text>
          <Text style={styles.appCTASubtitle}>Book on the go, track your rides</Text>
          <View style={styles.appButtons}>
            <TouchableOpacity style={styles.appButton}>
              <Text style={styles.appButtonText}>App Store</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.appButton}>
              <Text style={styles.appButtonText}>Play Store</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 120, // Extra padding for tab bar
  },
  heroBanner: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['3xl'],
    borderBottomLeftRadius: BorderRadius['3xl'],
    borderBottomRightRadius: BorderRadius['3xl'],
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  heroGreeting: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  heroLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  heroBrand: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    marginLeft: Spacing.sm,
  },
  heroSubtitle: {
    color: Colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    marginTop: Spacing.sm,
  },
  heroTagline: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  heroSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.text,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  heroSearchPlaceholder: {
    flex: 1,
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginHorizontal: Spacing.md,
  },
  bookNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.text,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius.full,
    alignSelf: 'center',
    gap: Spacing.sm,
  },
  bookNowText: {
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  vehicleTabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing['2xl'],
    marginTop: -Spacing['2xl'],
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  vehicleTabActive: {
    backgroundColor: Colors.primary + '20',
  },
  vehicleTabText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  vehicleTabTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
  },
  section: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  seeAllText: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  categoriesScroll: {
    paddingRight: Spacing['2xl'],
    gap: Spacing.md,
  },
  categoryCard: {
    width: 80,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  categoryName: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    textAlign: 'center',
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cityText: {
    color: Colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
  horizontalScroll: {
    paddingRight: Spacing['2xl'],
    gap: Spacing.md,
  },
  featuredCard: {
    width: width * 0.6,
    height: 200,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  featuredRating: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  featuredRatingText: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  featuredContent: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing.lg,
  },
  featuredBrand: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  featuredName: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  featuredPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.xs,
  },
  featuredPrice: {
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  featuredUnit: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 2,
  },
  errorState: {
    padding: Spacing['2xl'],
    alignItems: 'center',
  },
  errorText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  offersScroll: {
    paddingRight: Spacing['2xl'],
    gap: Spacing.md,
  },
  offerCard: {
    width: width * 0.4,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  offerDiscount: {
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  offerTitle: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginTop: Spacing.sm,
  },
  offerSubtitle: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  offerCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  offerCodeLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 11,
  },
  offerCode: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    marginLeft: Spacing.xs,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  reviewInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  reviewName: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewDate: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 11,
  },
  reviewComment: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.md,
  },
  reviewCar: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginTop: Spacing.md,
  },
  statLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    marginTop: Spacing.xs,
  },
  ownerCTA: {
    marginHorizontal: Spacing['2xl'],
    marginTop: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
  },
  ownerCTAGradient: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius['2xl'],
  },
  ownerCTATitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    marginTop: Spacing.lg,
  },
  ownerCTASubtitle: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  appCTA: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    alignItems: 'center',
  },
  appCTATitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  appCTASubtitle: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  appButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  appButton: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  appButtonText: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});
