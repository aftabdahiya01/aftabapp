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
  AlertTriangle,
  Camera,
  MessageCircle,
  Send,
  Clock,
  CheckCircle,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button, GlassCard, Badge, LoadingSpinner } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useDamageReports, useDisputes } from '@/hooks/useVerification';

const damageTypes = [
  { value: 'scratch', label: 'Scratch', icon: '🔧' },
  { value: 'dent', label: 'Dent', icon: '🔨' },
  { value: 'crack', label: 'Crack', icon: '💔' },
  { value: 'break', label: 'Broken Part', icon: '💥' },
  { value: 'mechanical', label: 'Mechanical', icon: '⚙️' },
  { value: 'interior', label: 'Interior', icon: '🚗' },
  { value: 'other', label: 'Other', icon: '📋' },
];

const damageLocations = [
  'Front Bumper',
  'Rear Bumper',
  'Left Side',
  'Right Side',
  'Hood',
  'Trunk',
  'Windshield',
  'Windows',
  'Headlights',
  'Taillights',
  'Wheels',
  'Interior',
];

const disputeTypes = [
  { value: 'damage', label: 'Damage Dispute' },
  { value: 'deposit', label: 'Security Deposit' },
  { value: 'payment', label: 'Payment Issue' },
  { value: 'late_return', label: 'Late Return' },
  { value: 'fuel', label: 'Fuel Dispute' },
  { value: 'other', label: 'Other' },
];

export default function DamageReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { reports, loading: reportsLoading, createReport } = useDamageReports(id);
  const { disputes, loading: disputesLoading, createDispute } = useDisputes(id);

  const [activeTab, setActiveTab] = useState<'report' | 'dispute'>('report');

  // Damage report form
  const [damageType, setDamageType] = useState('');
  const [damageLocation, setDamageLocation] = useState('');
  const [damageDescription, setDamageDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Dispute form
  const [disputeType, setDisputeType] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');

  const handleCreateReport = async () => {
    if (!id || !user || !damageType || !damageLocation || !damageDescription) return;

    setSubmitting(true);

    const result = await createReport({
      booking_id: id,
      reported_by: user.id,
      damage_type: damageType as any,
      damage_location: damageLocation,
      description: damageDescription,
      estimated_cost: estimatedCost ? parseFloat(estimatedCost) : null,
    });

    setSubmitting(false);

    if (result.success) {
      setDamageType('');
      setDamageLocation('');
      setDamageDescription('');
      setEstimatedCost('');
    }
  };

  const handleCreateDispute = async () => {
    if (!id || !user || !disputeType || !disputeDescription) return;

    setSubmitting(true);

    const result = await createDispute({
      booking_id: id,
      opened_by: user.id,
      dispute_type: disputeType as any,
      description: disputeDescription,
      damage_report_id: null,
    });

    setSubmitting(false);

    if (result.success) {
      setDisputeType('');
      setDisputeDescription('');
    }
  };

  const loading = reportsLoading || disputesLoading;

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
          <Text style={styles.headerTitle}>Damage & Disputes</Text>
          <View style={{ width: 44 }} />
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'report' && styles.tabActive]}
          onPress={() => setActiveTab('report')}
        >
          <AlertTriangle size={18} color={activeTab === 'report' ? Colors.background : Colors.textTertiary} />
          <Text style={[styles.tabText, activeTab === 'report' && styles.tabTextActive]}>
            Report Damage
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dispute' && styles.tabActive]}
          onPress={() => setActiveTab('dispute')}
        >
          <MessageCircle size={18} color={activeTab === 'dispute' ? Colors.background : Colors.textTertiary} />
          <Text style={[styles.tabText, activeTab === 'dispute' && styles.tabTextActive]}>
            Open Dispute
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {loading ? (
          <LoadingSpinner message="Loading..." />
        ) : activeTab === 'report' ? (
          <>
            {/* Existing Reports */}
            {reports.length > 0 && (
              <GlassCard style={styles.section}>
                <Text style={styles.sectionTitle}>Previous Reports</Text>
                {reports.map((report) => (
                  <View key={report.id} style={styles.reportCard}>
                    <View style={styles.reportHeader}>
                      <Badge
                        text={report.damage_type}
                        variant="warning"
                      />
                      <Badge
                        text={report.status}
                        variant={report.status === 'resolved' ? 'success' : 'warning'}
                      />
                    </View>
                    <Text style={styles.reportLocation}>{report.damage_location}</Text>
                    <Text style={styles.reportDesc}>{report.description}</Text>
                    {report.estimated_cost && (
                      <Text style={styles.reportCost}>
                        Est. Cost: Rs.{report.estimated_cost.toLocaleString()}
                      </Text>
                    )}
                  </View>
                ))}
              </GlassCard>
            )}

            {/* New Report Form */}
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>New Damage Report</Text>

              {/* Photo Upload */}
              <TouchableOpacity style={styles.photoUpload}>
                <Camera size={24} color={Colors.primary} />
                <Text style={styles.photoUploadText}>Add Photos</Text>
              </TouchableOpacity>

              {/* Damage Type */}
              <Text style={styles.label}>Damage Type</Text>
              <View style={styles.damageTypesGrid}>
                {damageTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.damageTypeOption,
                      damageType === type.value && styles.damageTypeOptionActive,
                    ]}
                    onPress={() => setDamageType(type.value)}
                  >
                    <Text style={styles.damageTypeIcon}>{type.icon}</Text>
                    <Text
                      style={[
                        styles.damageTypeLabel,
                        damageType === type.value && styles.damageTypeLabelActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Location */}
              <Text style={styles.label}>Location</Text>
              <View style={styles.locationsGrid}>
                {damageLocations.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={[
                      styles.locationOption,
                      damageLocation === loc && styles.locationOptionActive,
                    ]}
                    onPress={() => setDamageLocation(loc)}
                  >
                    <Text
                      style={[
                        styles.locationText,
                        damageLocation === loc && styles.locationTextActive,
                      ]}
                    >
                      {loc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <View style={styles.textArea}>
                <Text style={damageDescription ? styles.textAreaText : styles.textAreaPlaceholder}>
                  {damageDescription || 'Describe the damage...'}
                </Text>
              </View>

              {/* Estimated Cost */}
              <Text style={styles.label}>Estimated Repair Cost (Optional)</Text>
              <View style={styles.costInput}>
                <Text style={styles.costPrefix}>Rs.</Text>
                <Text style={styles.costValue}>{estimatedCost || '0'}</Text>
              </View>

              <Button
                title="Submit Report"
                onPress={handleCreateReport}
                loading={submitting}
                disabled={!damageType || !damageLocation || !damageDescription}
                variant="primary"
                fullWidth
                style={styles.submitButton}
              />
            </GlassCard>
          </>
        ) : (
          <>
            {/* Existing Disputes */}
            {disputes.length > 0 && (
              <GlassCard style={styles.section}>
                <Text style={styles.sectionTitle}>Your Disputes</Text>
                {disputes.map((dispute) => (
                  <View key={dispute.id} style={styles.disputeCard}>
                    <View style={styles.disputeHeader}>
                      <Text style={styles.disputeType}>{dispute.dispute_type}</Text>
                      <Badge
                        text={dispute.status}
                        variant={
                          dispute.status === 'resolved' ? 'success' :
                          dispute.status === 'under_review' ? 'warning' : 'error'
                        }
                      />
                    </View>
                    <Text style={styles.disputeDesc}>{dispute.description}</Text>
                    {dispute.resolution && (
                      <View style={styles.resolutionBox}>
                        <CheckCircle size={16} color={Colors.success} />
                        <Text style={styles.resolutionText}>{dispute.resolution}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </GlassCard>
            )}

            {/* New Dispute Form */}
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>Open New Dispute</Text>

              {/* Dispute Type */}
              <Text style={styles.label}>Dispute Type</Text>
              {disputeTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.disputeTypeOption,
                    disputeType === type.value && styles.disputeTypeOptionActive,
                  ]}
                  onPress={() => setDisputeType(type.value)}
                >
                  <Text
                    style={[
                      styles.disputeTypeLabel,
                      disputeType === type.value && styles.disputeTypeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <View style={styles.textArea}>
                <Text style={disputeDescription ? styles.textAreaText : styles.textAreaPlaceholder}>
                  {disputeDescription || 'Describe your dispute in detail...'}
                </Text>
              </View>

              <Button
                title="Submit Dispute"
                onPress={handleCreateDispute}
                loading={submitting}
                disabled={!disputeType || !disputeDescription}
                variant="primary"
                fullWidth
                style={styles.submitButton}
              />
            </GlassCard>
          </>
        )}
      </ScrollView>
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
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  tabTextActive: {
    color: Colors.background,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  section: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  reportCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  reportHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  reportLocation: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  reportDesc: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  reportCost: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: Spacing.sm,
  },
  photoUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '15',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    marginBottom: Spacing.lg,
  },
  photoUploadText: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  label: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  damageTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  damageTypeOption: {
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    minWidth: 60,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  damageTypeOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  damageTypeIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  damageTypeLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 10,
  },
  damageTypeLabelActive: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  locationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  locationOption: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  locationText: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  locationTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
  },
  textArea: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    minHeight: 80,
  },
  textAreaText: {
    color: Colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  textAreaPlaceholder: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  costInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  costPrefix: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  costValue: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginLeft: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
  disputeCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  disputeTypeText: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  disputeDesc: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  resolutionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.success + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  resolutionText: {
    flex: 1,
    color: Colors.success,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  disputeTypeOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  disputeTypeOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  disputeTypeLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  disputeTypeLabelActive: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
});
