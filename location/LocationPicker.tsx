import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { MapPin, Search, Navigation, Check, X } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, PopularCities } from '@/constants/theme';
import { Badge, GlassCard, Button } from '@/components/ui';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
  showCurrentLocation?: boolean;
}

// Sample locations for Indian cities
const sampleLocations: Record<string, LocationData[]> = {
  Mumbai: [
    { latitude: 19.0760, longitude: 72.8777, address: 'Andheri West, Mumbai', city: 'Mumbai' },
    { latitude: 19.0176, longitude: 72.8562, address: 'Bandra West, Mumbai', city: 'Mumbai' },
    { latitude: 19.0330, longitude: 72.9297, address: 'Powai, Mumbai', city: 'Mumbai' },
    { latitude: 18.9400, longitude: 72.8268, address: 'Colaba, Mumbai', city: 'Mumbai' },
  ],
  Delhi: [
    { latitude: 28.6139, longitude: 77.2090, address: 'Connaught Place, Delhi', city: 'Delhi' },
    { latitude: 28.5355, longitude: 77.3910, address: 'Noida, Delhi NCR', city: 'Delhi' },
    { latitude: 28.4595, longitude: 77.0266, address: 'Gurgaon, Delhi NCR', city: 'Delhi' },
    { latitude: 28.6322, longitude: 77.2173, address: 'Civil Lines, Delhi', city: 'Delhi' },
  ],
  Bangalore: [
    { latitude: 12.9716, longitude: 77.5946, address: 'MG Road, Bangalore', city: 'Bangalore' },
    { latitude: 12.9352, longitude: 77.6245, address: 'Koramangala, Bangalore', city: 'Bangalore' },
    { latitude: 12.9941, longitude: 77.6619, address: 'Whitefield, Bangalore', city: 'Bangalore' },
    { latitude: 12.9698, longitude: 77.7500, address: 'Electronic City, Bangalore', city: 'Bangalore' },
  ],
  Hyderabad: [
    { latitude: 17.3850, longitude: 78.4867, address: 'Banjara Hills, Hyderabad', city: 'Hyderabad' },
    { latitude: 17.4156, longitude: 78.4347, address: 'HITEC City, Hyderabad', city: 'Hyderabad' },
  ],
  Chennai: [
    { latitude: 13.0827, longitude: 80.2707, address: 'T. Nagar, Chennai', city: 'Chennai' },
    { latitude: 13.0569, longitude: 80.2438, address: 'Nungambakkam, Chennai', city: 'Chennai' },
  ],
  Pune: [
    { latitude: 18.5204, longitude: 73.8567, address: 'Koregaon Park, Pune', city: 'Pune' },
    { latitude: 18.5595, longitude: 73.9060, address: 'Hinjewadi, Pune', city: 'Pune' },
  ],
};

// Calculate distance between two points (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function LocationPicker({
  onLocationSelect,
  initialLocation,
  showCurrentLocation = true,
}: LocationPickerProps) {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation || null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

  // Get current location (web: use geolocation API)
  useEffect(() => {
    if (showCurrentLocation && Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current Location',
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, [showCurrentLocation]);

  const filteredCities = PopularCities.filter(city =>
    city.toLowerCase().includes(search.toLowerCase())
  );

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const handleCurrentLocation = () => {
    if (currentLocation) {
      handleLocationSelect({
        ...currentLocation,
        address: 'Your Current Location',
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city or location..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Current Location Button */}
      {showCurrentLocation && (
        <TouchableOpacity style={styles.currentLocationButton} onPress={handleCurrentLocation}>
          <Navigation size={20} color={Colors.primary} />
          <Text style={styles.currentLocationText}>Use Current Location</Text>
        </TouchableOpacity>
      )}

      {/* Cities List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {!selectedCity ? (
          <>
            <Text style={styles.sectionTitle}>Popular Cities</Text>
            <View style={styles.citiesGrid}>
              {filteredCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={styles.cityCard}
                  onPress={() => setSelectedCity(city)}
                >
                  <MapPin size={24} color={Colors.primary} />
                  <Text style={styles.cityName}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Back to cities */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedCity(null)}
            >
              <Text style={styles.backButtonText}>← All Cities</Text>
            </TouchableOpacity>

            {/* Locations in selected city */}
            <Text style={styles.sectionTitle}>Locations in {selectedCity}</Text>
            {(sampleLocations[selectedCity] || []).map((location, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.locationCard,
                  selectedLocation?.address === location.address && styles.locationCardActive,
                ]}
                onPress={() => handleLocationSelect(location)}
              >
                <View style={styles.locationCardLeft}>
                  <MapPin
                    size={20}
                    color={selectedLocation?.address === location.address ? Colors.primary : Colors.textTertiary}
                  />
                  <View>
                    <Text
                      style={[
                        styles.locationAddress,
                        selectedLocation?.address === location.address && styles.locationAddressActive,
                      ]}
                    >
                      {location.address}
                    </Text>
                    <Text style={styles.locationCoords}>
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>
                {selectedLocation?.address === location.address && (
                  <Check size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* Selected Location Preview */}
      {selectedLocation && (
        <View style={styles.selectedPreview}>
          <View style={styles.selectedContent}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.selectedText}>{selectedLocation.address}</Text>
          </View>
          <Badge text="Selected" variant="success" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
  },
  searchBox: {
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
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing['2xl'],
    padding: Spacing.md,
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  currentLocationText: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 100,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: Spacing.lg,
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cityName: {
    color: Colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  backButton: {
    marginBottom: Spacing.lg,
  },
  backButtonText: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  locationCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  locationCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  locationAddress: {
    color: Colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  locationAddressActive: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  locationCoords: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    marginTop: 2,
  },
  selectedPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  selectedText: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    flex: 1,
  },
});
