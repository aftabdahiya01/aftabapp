import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, ArrowRight } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState, CarCard, Button } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const sampleFavorites = [
  {
    id: '1',
    brand: 'Porsche',
    model: '911 Carrera',
    name: 'Porsche 911 Carrera',
    owner_id: '',
    owner_name: '',
    registration_number: '',
    price_per_day: 450,
    category: 'Luxury' as const,
    transmission: 'Automatic' as const,
    fuel: 'Petrol' as const,
    seats: 4,
    location: 'Mumbai',
    description: '',
    photos: ['https://images.unsplash.com/photo-1614162692292-7ac56d9f7f00?w=800'],
    status: 'approved' as const,
    rating: 4.9,
    total_bookings: 120,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    brand: 'BMW',
    model: 'M4 Competition',
    name: 'BMW M4 Competition',
    owner_id: '',
    owner_name: '',
    registration_number: '',
    price_per_day: 380,
    category: 'Luxury' as const,
    transmission: 'Automatic' as const,
    fuel: 'Petrol' as const,
    seats: 4,
    location: 'Delhi',
    description: '',
    photos: ['https://images.unsplash.com/photo-1617531653332-bd46324f0b0a?w=800'],
    status: 'approved' as const,
    rating: 4.8,
    total_bookings: 95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function FavoritesScreen() {
  const { user } = useAuth();

  const favorites = sampleFavorites;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Heart size={28} color={Colors.primary} fill={Colors.primary} />
          <View>
            <Text style={styles.title}>Favorites</Text>
            <Text style={styles.subtitle}>
              Your saved cars
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {favorites.length === 0 ? (
          <EmptyState
            icon={<Heart size={48} color={Colors.textTertiary} />}
            title="No favorites yet"
            description="Start adding cars to your wishlist to keep track of your dream rides"
            action={
              <Link href="/(tabs)/explore" asChild>
                <Button
                  title="Explore Cars"
                  onPress={() => {}}
                  variant="primary"
                  icon={<ArrowRight size={18} color={Colors.black} />}
                  iconPosition="right"
                />
              </Link>
            }
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          >
            {favorites.map((car, index) => (
              <Link key={car.id} href={`/car/${car.id}`} asChild>
                <CarCard
                  car={car}
                  onPress={() => {}}
                  onFavoritePress={() => {}}
                  isFavorite={true}
                />
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
    paddingTop: Spacing['4xl'],
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 28,
  },
  subtitle: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  list: {
    paddingVertical: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
});
