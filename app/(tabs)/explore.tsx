import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, Link } from 'expo-router';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  DollarSign,
  Star,
  Gauge,
  Fuel,
  Users,
  ChevronDown,
  ChevronUp,
  Car,
} from 'lucide-react-native';
import { Bike } from 'lucide-react-native';
import { useCars } from '@/hooks/useCars';
import { CarCard, Button, GlassCard, LoadingSpinner } from '@/components/ui';
import { Colors, Spacing, BorderRadius, CarCategories, BikeCategories, PopularCities, PriceRanges } from '@/constants/theme';

const transmissions = ['Any', 'Automatic', 'Manual'];
const fuelTypes = ['Any', 'Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const seatOptions = ['Any', '2', '4', '5', '6', '7+'];
const ratingOptions = ['Any', '4.5+', '4.0+', '3.5+'];
const sortOptions = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Newest', 'Rating'];

export default function ExploreScreen() {
  const params = useLocalSearchParams();
  const [vehicleType, setVehicleType] = useState<'car' | 'bike'>((params.type as 'car' | 'bike') || 'car');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.category as string || 'All');
  const [selectedLocation, setSelectedLocation] = useState(params.location as string || 'All Cities');
  const [selectedTransmission, setSelectedTransmission] = useState('Any');
  const [selectedFuel, setSelectedFuel] = useState('Any');
  const [selectedSeats, setSelectedSeats] = useState('Any');
  const [selectedPriceRange, setSelectedPriceRange] = useState({ label: 'All Prices', min: 0, max: 100000 });
  const [selectedRating, setSelectedRating] = useState('Any');
  const [sortBy, setSortBy] = useState('Recommended');
  const [showFilters, setShowFilters] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const { cars, loading, error } = useCars({
    category: selectedCategory,
    location: selectedLocation,
    transmission: selectedTransmission,
    fuel: selectedFuel,
    minPrice: selectedPriceRange.min,
    maxPrice: selectedPriceRange.max,
    search,
    status: 'approved',
  });

  // Filter by vehicle type
  const vehiclesByType = useMemo(() => {
    return cars.filter(car => car.vehicle_type === vehicleType || (!car.vehicle_type && vehicleType === 'car'));
  }, [cars, vehicleType]);

  // Filter by seats and rating client-side
  const filteredCars = vehiclesByType.filter(car => {
    if (selectedSeats !== 'Any') {
      const seats = selectedSeats === '7+' ? 7 : parseInt(selectedSeats);
      if (selectedSeats === '7+') {
        if ((car.seats || 4) < 7) return false;
      } else {
        if ((car.seats || 4) !== seats) return false;
      }
    }
    if (selectedRating !== 'Any') {
      const minRating = parseFloat(selectedRating);
      if ((car.rating || 0) < minRating) return false;
    }
    return true;
  });

  // Get categories based on vehicle type
  const categories = vehicleType === 'car' ? CarCategories : BikeCategories;

  // Sort cars
  const sortedCars = [...filteredCars].sort((a, b) => {
    switch (sortBy) {
      case 'Price: Low to High':
        return a.price_per_day - b.price_per_day;
      case 'Price: High to Low':
        return b.price_per_day - a.price_per_day;
      case 'Rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'Newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedLocation('All Cities');
    setSelectedTransmission('Any');
    setSelectedFuel('Any');
    setSelectedSeats('Any');
    setSelectedPriceRange({ label: 'All Prices', min: 0, max: 100000 });
    setSelectedRating('Any');
    setSortBy('Recommended');
  };

  const handleVehicleTypeChange = (type: 'car' | 'bike') => {
    setVehicleType(type);
    setSelectedCategory('All');
  };

  const activeFiltersCount = [
    selectedCategory !== 'All',
    selectedLocation !== 'All Cities',
    selectedTransmission !== 'Any',
    selectedFuel !== 'Any',
    selectedSeats !== 'Any',
    selectedPriceRange.label !== 'All Prices',
    selectedRating !== 'Any',
  ].filter(Boolean).length;

  const formatPrice = (price: number) => `Rs.${price.toLocaleString()}`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.header}
      >
        {/* Vehicle Type Tabs */}
        <View style={styles.vehicleTabs}>
          <TouchableOpacity
            style={[styles.vehicleTab, vehicleType === 'car' && styles.vehicleTabActive]}
            onPress={() => handleVehicleTypeChange('car')}
          >
            <Car size={22} color={vehicleType === 'car' ? Colors.primary : Colors.textTertiary} />
            <Text style={[styles.vehicleTabText, vehicleType === 'car' && styles.vehicleTabTextActive]}>
              Cars
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.vehicleTab, vehicleType === 'bike' && styles.vehicleTabActive]}
            onPress={() => handleVehicleTypeChange('bike')}
          >
            <Bike size={22} color={vehicleType === 'bike' ? Colors.primary : Colors.textTertiary} />
            <Text style={[styles.vehicleTabText, vehicleType === 'bike' && styles.vehicleTabTextActive]}>
              Bikes
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textTertiary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search cars, brands..."
              placeholderTextColor={Colors.textTertiary}
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={20} color={showFilters ? Colors.primary : Colors.text} />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Chips */}
        <View style={styles.categoriesScroll}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === 'All' && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory('All')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'All' && styles.categoryChipTextActive,
                ]}
              >
                All {vehicleType === 'car' ? 'Cars' : 'Bikes'}
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.categoryChipTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Filters Panel */}
        {showFilters && (
          <GlassCard style={styles.filtersPanel}>
            <View style={styles.filtersHeader}>
              <Text style={styles.filtersTitle}>Filters</Text>
              {activeFiltersCount > 0 && (
                <TouchableOpacity onPress={resetFilters}>
                  <Text style={styles.clearFilters}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Location */}
            <View style={styles.filterGroup}>
              <View style={styles.filterLabelRow}>
                <MapPin size={14} color={Colors.primary} />
                <Text style={styles.filterLabel}>Location</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[styles.filterChip, selectedLocation === 'All Cities' && styles.filterChipActive]}
                    onPress={() => setSelectedLocation('All Cities')}
                  >
                    <Text style={[styles.filterChipText, selectedLocation === 'All Cities' && styles.filterChipTextActive]}>
                      All Cities
                    </Text>
                  </TouchableOpacity>
                  {PopularCities.map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={[styles.filterChip, selectedLocation === city && styles.filterChipActive]}
                      onPress={() => setSelectedLocation(city)}
                    >
                      <Text style={[styles.filterChipText, selectedLocation === city && styles.filterChipTextActive]}>
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Price Range */}
            <View style={styles.filterGroup}>
              <View style={styles.filterLabelRow}>
                <DollarSign size={14} color={Colors.primary} />
                <Text style={styles.filterLabel}>Price per Day</Text>
              </View>
              <View style={styles.filterOptions}>
                {PriceRanges.map((range) => (
                  <TouchableOpacity
                    key={range.label}
                    style={[styles.filterChip, selectedPriceRange.label === range.label && styles.filterChipActive]}
                    onPress={() => setSelectedPriceRange(range)}
                  >
                    <Text style={[styles.filterChipText, selectedPriceRange.label === range.label && styles.filterChipTextActive]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Show More Toggle */}
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowMoreFilters(!showMoreFilters)}
            >
              <Text style={styles.showMoreText}>
                {showMoreFilters ? 'Less Filters' : 'More Filters'}
              </Text>
              {showMoreFilters ? <ChevronUp size={16} color={Colors.primary} /> : <ChevronDown size={16} color={Colors.primary} />}
            </TouchableOpacity>

            {/* Additional Filters */}
            {showMoreFilters && (
              <>
                {/* Transmission */}
                <View style={styles.filterGroup}>
                  <View style={styles.filterLabelRow}>
                    <Gauge size={14} color={Colors.primary} />
                    <Text style={styles.filterLabel}>Transmission</Text>
                  </View>
                  <View style={styles.filterOptions}>
                    {transmissions.map((trans) => (
                      <TouchableOpacity
                        key={trans}
                        style={[styles.filterChip, selectedTransmission === trans && styles.filterChipActive]}
                        onPress={() => setSelectedTransmission(trans)}
                      >
                        <Text style={[styles.filterChipText, selectedTransmission === trans && styles.filterChipTextActive]}>
                          {trans}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Fuel Type */}
                <View style={styles.filterGroup}>
                  <View style={styles.filterLabelRow}>
                    <Fuel size={14} color={Colors.primary} />
                    <Text style={styles.filterLabel}>Fuel Type</Text>
                  </View>
                  <View style={styles.filterOptions}>
                    {fuelTypes.map((fuel) => (
                      <TouchableOpacity
                        key={fuel}
                        style={[styles.filterChip, selectedFuel === fuel && styles.filterChipActive]}
                        onPress={() => setSelectedFuel(fuel)}
                      >
                        <Text style={[styles.filterChipText, selectedFuel === fuel && styles.filterChipTextActive]}>
                          {fuel}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Seats */}
                <View style={styles.filterGroup}>
                  <View style={styles.filterLabelRow}>
                    <Users size={14} color={Colors.primary} />
                    <Text style={styles.filterLabel}>Seats</Text>
                  </View>
                  <View style={styles.filterOptions}>
                    {seatOptions.map((seats) => (
                      <TouchableOpacity
                        key={seats}
                        style={[styles.filterChip, selectedSeats === seats && styles.filterChipActive]}
                        onPress={() => setSelectedSeats(seats)}
                      >
                        <Text style={[styles.filterChipText, selectedSeats === seats && styles.filterChipTextActive]}>
                          {seats}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Rating */}
                <View style={styles.filterGroup}>
                  <View style={styles.filterLabelRow}>
                    <Star size={14} color={Colors.primary} />
                    <Text style={styles.filterLabel}>Minimum Rating</Text>
                  </View>
                  <View style={styles.filterOptions}>
                    {ratingOptions.map((rating) => (
                      <TouchableOpacity
                        key={rating}
                        style={[styles.filterChip, selectedRating === rating && styles.filterChipActive]}
                        onPress={() => setSelectedRating(rating)}
                      >
                        <Text style={[styles.filterChipText, selectedRating === rating && styles.filterChipTextActive]}>
                          {rating}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}

            <Button
              title={`Show ${sortedCars.length} ${vehicleType === 'car' ? 'Cars' : 'Bikes'}`}
              onPress={() => setShowFilters(false)}
              variant="primary"
              size="md"
              fullWidth
              style={styles.applyButton}
            />
          </GlassCard>
        )}

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {sortedCars.length} {sortedCars.length === 1 ? vehicleType : vehicleType + 's'} available
          </Text>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const currentIndex = sortOptions.indexOf(sortBy);
              const nextIndex = (currentIndex + 1) % sortOptions.length;
              setSortBy(sortOptions[nextIndex]);
            }}
          >
            <Text style={styles.sortLabel}>{sortBy}</Text>
            <ChevronDown size={14} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Cars List */}
        {loading ? (
          <LoadingSpinner message="Finding cars for you..." />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={resetFilters} variant="outline" />
          </View>
        ) : sortedCars.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No {vehicleType === 'car' ? 'cars' : 'bikes'} found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your filters or search term
            </Text>
            <Button
              title="Reset Filters"
              onPress={resetFilters}
              variant="outline"
              style={styles.resetButton}
            />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.carsList}
          >
            {sortedCars.map((car) => (
              <Link key={car.id} href={`/car/${car.id}`} asChild>
                <TouchableOpacity activeOpacity={0.95}>
                  <CarCard car={car} onPress={() => {}} />
                </TouchableOpacity>
              </Link>
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
    paddingTop: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.lg,
  },
  vehicleTabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  vehicleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vehicleTabActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  vehicleTabText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  vehicleTabTextActive: {
    color: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceSecondary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 10,
  },
  categoriesScroll: {
    marginTop: Spacing.lg,
    marginLeft: -Spacing['2xl'],
    paddingLeft: Spacing['2xl'],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryChipText: {
    color: Colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
  categoryChipTextActive: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  filtersPanel: {
    marginBottom: Spacing.lg,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  filtersTitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  clearFilters: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  filterGroup: {
    marginBottom: Spacing.md,
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  filterLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  filterChipText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  showMoreText: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  applyButton: {
    marginTop: Spacing.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  resultsCount: {
    color: Colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  sortLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  carsList: {
    paddingBottom: Spacing['4xl'],
    gap: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['5xl'],
  },
  emptyTitle: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  emptySubtitle: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: Spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  errorText: {
    color: Colors.error,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
});
