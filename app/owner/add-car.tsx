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
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  Car,
  DollarSign,
  MapPin,
  Camera,
  Upload,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button, Input, GlassCard } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { CarInsert } from '@/types/database';

export default function AddCarPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    registration_number: '',
    price_per_day: '',
    category: 'Sedan',
    transmission: 'Manual',
    fuel: 'Petrol',
    seats: '5',
    location: 'Mumbai',
    description: '',
  });

  const categories = ['Budget', 'Hatchback', 'Sedan', 'SUV', 'Luxury', 'EV'];
  const transmissions = ['Automatic', 'Manual'];
  const fuels = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Goa'];

  const handleSubmit = async () => {
    if (!user) {
      setError('Please sign in to add a car');
      return;
    }

    setError(null);

    if (!formData.brand || !formData.model || !formData.registration_number || !formData.price_per_day) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);

    const carData: CarInsert = {
      owner_id: user.id,
      owner_name: profile?.name || 'Unknown Owner',
      name: `${formData.brand} ${formData.model}`,
      brand: formData.brand,
      model: formData.model,
      registration_number: formData.registration_number,
      price_per_day: parseFloat(formData.price_per_day),
      category: formData.category as CarInsert['category'],
      transmission: formData.transmission as CarInsert['transmission'],
      fuel: formData.fuel as CarInsert['fuel'],
      seats: parseInt(formData.seats),
      location: formData.location,
      description: formData.description,
      status: 'pending',
    };

    const { error: insertError } = await supabase
      .from('cars')
      .insert(carData);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.replace('/owner/dashboard');
  };

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
        <Text style={styles.title}>Add New Car</Text>
        <Text style={styles.subtitle}>List your car for rental</Text>
      </LinearGradient>

      {/* Form */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Photos Upload */}
        <GlassCard style={styles.photoSection}>
          <View style={styles.photoHeader}>
            <Camera size={24} color={Colors.gold} />
            <Text style={styles.photoTitle}>Car Photos</Text>
          </View>
          <TouchableOpacity style={styles.uploadButton}>
            <LinearGradient
              colors={[Colors.surfaceSecondary, Colors.surface]}
              style={styles.uploadGradient}
            >
              <Upload size={32} color={Colors.gold} />
              <Text style={styles.uploadText}>Upload Photos</Text>
              <Text style={styles.uploadHint}>Tap to select images</Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>

        {/* Vehicle Details */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>

          <Input
            label="Brand *"
            placeholder="e.g., Porsche"
            value={formData.brand}
            onChangeText={(brand) => setFormData({ ...formData, brand })}
          />

          <Input
            label="Model *"
            placeholder="e.g., 911 Carrera"
            value={formData.model}
            onChangeText={(model) => setFormData({ ...formData, model })}
          />

          <Input
            label="Registration Number *"
            placeholder="e.g., MH01AB1234"
            value={formData.registration_number}
            onChangeText={(registration_number) => setFormData({ ...formData, registration_number })}
          />

          <Input
            label="Daily Rate *"
            placeholder="Enter price per day"
            value={formData.price_per_day}
            onChangeText={(price_per_day) => setFormData({ ...formData, price_per_day })}
            keyboardType="numeric"
            icon={<DollarSign size={20} color={Colors.textTertiary} />}
          />

          <Input
            label="Description"
            placeholder="Describe your car..."
            value={formData.description}
            onChangeText={(description) => setFormData({ ...formData, description })}
            multiline
            numberOfLines={4}
          />
        </GlassCard>

        {/* Category & Specs */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Category & Specs</Text>

          <Text style={styles.selectLabel}>Category</Text>
          <View style={styles.optionGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.optionChip, formData.category === cat && styles.optionActive]}
                onPress={() => setFormData({ ...formData, category: cat })}
              >
                <Text style={[styles.optionText, formData.category === cat && styles.optionActiveText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.selectLabel}>Transmission</Text>
          <View style={styles.optionGrid}>
            {transmissions.map((trans) => (
              <TouchableOpacity
                key={trans}
                style={[styles.optionChip, formData.transmission === trans && styles.optionActive]}
                onPress={() => setFormData({ ...formData, transmission: trans })}
              >
                <Text style={[styles.optionText, formData.transmission === trans && styles.optionActiveText]}>
                  {trans}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.selectLabel}>Fuel Type</Text>
          <View style={styles.optionGrid}>
            {fuels.map((fuel) => (
              <TouchableOpacity
                key={fuel}
                style={[styles.optionChip, formData.fuel === fuel && styles.optionActive]}
                onPress={() => setFormData({ ...formData, fuel })}
              >
                <Text style={[styles.optionText, formData.fuel === fuel && styles.optionActiveText]}>
                  {fuel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Seats"
            placeholder="Number of seats"
            value={formData.seats}
            onChangeText={(seats) => setFormData({ ...formData, seats })}
            keyboardType="numeric"
          />
        </GlassCard>

        {/* Location */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <Text style={styles.selectLabel}>City</Text>
          <View style={styles.optionGrid}>
            {cities.map((city) => (
              <TouchableOpacity
                key={city}
                style={[styles.optionChip, formData.location === city && styles.optionActive]}
                onPress={() => setFormData({ ...formData, location: city })}
              >
                <MapPin size={14} color={formData.location === city ? Colors.black : Colors.textTertiary} />
                <Text style={[styles.optionText, formData.location === city && styles.optionActiveText]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Submit */}
        <Button
          title="Submit for Approval"
          onPress={handleSubmit}
          loading={loading}
          variant="gold"
          size="lg"
          fullWidth
          style={styles.submitButton}
        />
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
  title: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 28,
  },
  subtitle: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  content: {
    padding: Spacing['2xl'],
    paddingBottom: Spacing['5xl'],
  },
  photoSection: {
    marginBottom: Spacing.lg,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  photoTitle: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  uploadButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  uploadGradient: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
  },
  uploadText: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginTop: Spacing.md,
  },
  uploadHint: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: Spacing.xs,
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
  selectLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  optionActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  optionText: {
    color: Colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  optionActiveText: {
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
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
  submitButton: {
    marginTop: Spacing.lg,
  },
});
