import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import {
  ArrowLeft,
  Shield,
  Camera,
  Fuel,
  Gauge,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react-native';
import { Button, GlassCard, LoadingSpinner, Badge } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useVehicleInspection } from '@/hooks/useVerification';
import { useAuth } from '@/contexts/AuthContext';

const fuelLevels = [
  { value: 'empty', label: 'Empty', icon: '⛽' },
  { value: 'quarter', label: '1/4 Tank', icon: '⛽' },
  { value: 'half', label: '1/2 Tank', icon: '⛽⛽' },
  { value: 'three_quarter', label: '3/4 Tank', icon: '⛽⛽⛽' },
  { value: 'full', label: 'Full', icon: '⛽⛽⛽⛽' },
];

const conditions = [
  { value: 'excellent', label: 'Excellent', description: 'No visible damage' },
  { value: 'good', label: 'Good', description: 'Minor wear only' },
  { value: 'fair', label: 'Fair', description: 'Some visible wear' },
  { value: 'poor', label: 'Poor', description: 'Significant wear' },
];

export default function InspectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const inspectionType = id?.includes('pickup') ? 'pickup' : 'return';

  const { inspections, loading, error, createInspection } = useVehicleInspection(id);

  const [selectedFuel, setSelectedFuel] = useState<string>('half');
  const [exteriorCondition, setExteriorCondition] = useState<string>('good');
  const [interiorCondition, setInteriorCondition] = useState<string>('good');
  const [odometer, setOdometer] = useState('');
  const [damageFound, setDamageFound] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!id || !user) return;

    setSubmitting(true);

    const result = await createInspection({
      booking_id: id,
      inspection_type: inspectionType,
      inspector_id: user.id,
      fuel_level: selectedFuel as 'empty' | 'quarter' | 'half' | 'three_quarter' | 'full',
      exterior_condition: exteriorCondition as 'excellent' | 'good' | 'fair' | 'poor',
      interior_condition: interiorCondition as 'excellent' | 'good' | 'fair' | 'poor',
      odometer_reading: odometer ? parseInt(odometer) : null,
      damage_found: damageFound,
      notes: notes || null,
    });

    setSubmitting(false);

    if (result.success) {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>
              {inspectionType === 'pickup' ? 'Pickup Inspection' : 'Return Inspection'}
            </Text>
            <Text style={styles.headerSubtitle}>
              Document vehicle condition
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Info size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Take clear photos of the vehicle from all angles. This protects both parties.
          </Text>
        </View>

        {/* Odometer Reading */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Odometer Reading</Text>
          <View style={styles.odometerInput}>
            <Gauge size={24} color={Colors.primary} />
            <Text style={styles.odometerValue}>{odometer || '0'}</Text>
            <Text style={styles.odometerUnit}>km</Text>
          </View>
          <View style={styles.odometerButtons}>
            {[10000, 20000, 30000, 50000].map((val) => (
              <TouchableOpacity
                key={val}
                style={styles.odometerButton}
                onPress={() => setOdometer(val.toString())}
              >
                <Text style={styles.odometerButtonText}>{val.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* Fuel Level */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Fuel size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Fuel Level</Text>
          </View>
          <View style={styles.fuelGrid}>
            {fuelLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.fuelOption,
                  selectedFuel === level.value && styles.fuelOptionActive,
                ]}
                onPress={() => setSelectedFuel(level.value)}
              >
                <Text style={styles.fuelIcon}>{level.icon}</Text>
                <Text
                  style={[
                    styles.fuelLabel,
                    selectedFuel === level.value && styles.fuelLabelActive,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* Exterior Condition */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Exterior Condition</Text>
          {conditions.map((condition) => (
            <TouchableOpacity
              key={condition.value}
              style={[
                styles.conditionOption,
                exteriorCondition === condition.value && styles.conditionOptionActive,
              ]}
              onPress={() => setExteriorCondition(condition.value)}
            >
              <View style={styles.conditionLeft}>
                <Text style={styles.conditionLabel}>{condition.label}</Text>
                <Text style={styles.conditionDesc}>{condition.description}</Text>
              </View>
              {exteriorCondition === condition.value && (
                <Check size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </GlassCard>

        {/* Interior Condition */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Interior Condition</Text>
          {conditions.map((condition) => (
            <TouchableOpacity
              key={condition.value}
              style={[
                styles.conditionOption,
                interiorCondition === condition.value && styles.conditionOptionActive,
              ]}
              onPress={() => setInteriorCondition(condition.value)}
            >
              <View style={styles.conditionLeft}>
                <Text style={styles.conditionLabel}>{condition.label}</Text>
                <Text style={styles.conditionDesc}>{condition.description}</Text>
              </View>
              {interiorCondition === condition.value && (
                <Check size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </GlassCard>

        {/* Damage Check */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Damage Found?</Text>
          <View style={styles.damageButtonRow}>
            <TouchableOpacity
              style={[
                styles.damageButton,
                !damageFound && styles.damageButtonActive,
              ]}
              onPress={() => setDamageFound(false)}
            >
              <Check size={24} color={!damageFound ? Colors.background : Colors.text} />
              <Text
                style={[
                  styles.damageButtonText,
                  !damageFound && styles.damageButtonTextActive,
                ]}
              >
                No Damage
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.damageButton,
                damageFound && styles.damageButtonActiveError,
              ]}
              onPress={() => setDamageFound(true)}
            >
              <AlertTriangle size={24} color={damageFound ? Colors.background : Colors.error} />
              <Text
                style={[
                  styles.damageButtonText,
                  damageFound && styles.damageButtonTextActive,
                ]}
              >
                Damage Found
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Notes */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <View style={styles.notesInput}>
            <Text style={styles.notesPlaceholder}>
              {notes || 'Add any additional observations...'}
            </Text>
          </View>
        </GlassCard>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <Button
          title={inspectionType === 'pickup' ? 'Complete Pickup Inspection' : 'Complete Return Inspection'}
          onPress={handleSubmit}
          loading={submitting}
          variant="primary"
          fullWidth
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
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
  headerSubtitle: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 100,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  infoText: {
    flex: 1,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  section: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  odometerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  odometerValue: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 48,
  },
  odometerUnit: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  odometerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  odometerButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  odometerButtonText: {
    color: Colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  fuelGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fuelOption: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fuelOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  fuelIcon: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  fuelLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    textAlign: 'center',
  },
  fuelLabelActive: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  conditionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  conditionOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  conditionLeft: {},
  conditionLabel: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  conditionDesc: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  damageButtonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  damageButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  damageButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  damageButtonActiveError: {
    borderColor: Colors.error,
    backgroundColor: Colors.error,
  },
  damageButtonText: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
  },
  damageButtonTextActive: {
    color: Colors.background,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    minHeight: 80,
  },
  notesPlaceholder: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
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
  },
});
