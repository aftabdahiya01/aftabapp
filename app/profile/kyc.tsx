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
  Shield,
  Upload,
  Check,
  AlertCircle,
  FileCheck,
  Camera,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button, GlassCard } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const documentTypes = [
  {
    id: 'id_card',
    label: 'ID Card',
    description: 'Government issued ID card',
    required: true,
  },
  {
    id: 'driving_license',
    label: 'Driving License',
    description: 'Valid driving license',
    required: true,
  },
  {
    id: 'passport',
    label: 'Passport',
    description: 'Valid passport (optional)',
    required: false,
  },
  {
    id: 'utility_bill',
    label: 'Utility Bill',
    description: 'Proof of address (last 3 months)',
    required: true,
  },
];

export default function KYCScreen() {
  const { profile, updateProfile } = useAuth();
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = (docType: string) => {
    // In a real app, this would open camera/gallery and upload to storage
    if (!uploadedDocs.includes(docType)) {
      setUploadedDocs([...uploadedDocs, docType]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // In a real app, this would submit all documents for verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    await updateProfile({
      kyc_verified: true,
    });

    setLoading(false);
    router.back();
  };

  const allRequiredUploaded = documentTypes
    .filter(d => d.required)
    .every(d => uploadedDocs.includes(d.id));

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

        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Shield size={40} color={Colors.gold} />
          </View>
          <Text style={styles.title}>KYC Verification</Text>
          <Text style={styles.subtitle}>
            Upload documents to verify your identity
          </Text>
        </View>

        {/* Progress */}
        <GlassCard style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Documents Uploaded</Text>
            <Text style={styles.progressValue}>
              {uploadedDocs.length} / {documentTypes.filter(d => d.required).length}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(uploadedDocs.length / documentTypes.filter(d => d.required).length) * 100}%`,
                },
              ]}
            />
          </View>
        </GlassCard>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Alert */}
        <View style={styles.alertContainer}>
          <View style={styles.alertHeader}>
            <AlertCircle size={18} color={Colors.gold} />
            <Text style={styles.alertTitle}>Why Verify?</Text>
          </View>
          <Text style={styles.alertText}>
            VERIFICATION REQUIRED{'\n'}KYC verification is required to book cars and receive payments.
          </Text>
        </View>

        {/* Document Cards */}
        {documentTypes.map((doc) => {
          const isUploaded = uploadedDocs.includes(doc.id);
          return (
            <GlassCard key={doc.id} style={styles.docCard}>
              <View style={styles.docHeader}>
                <View style={styles.docIconContainer}>
                  {isUploaded ? (
                    <Check size={24} color={Colors.black} />
                  ) : (
                    <FileCheck size={24} color={Colors.gold} />
                  )}
                </View>
                <View style={styles.docInfo}>
                  <View style={styles.docTitleRow}>
                    <Text style={styles.docLabel}>{doc.label}</Text>
                    {doc.required && (
                      <View style={styles.requiredBadge}>
                        <Text style={styles.requiredText}>Required</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.docDescription}>{doc.description}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.uploadButton, isUploaded && styles.uploadedButton]}
                onPress={() => handleUpload(doc.id)}
              >
                <View style={[
                  styles.uploadGradient,
                  isUploaded && styles.uploadedGradient
                ]}>
                  {isUploaded ? (
                    <Text style={styles.uploadedText}>Uploaded</Text>
                  ) : (
                    <>
                      <Camera size={18} color={Colors.black} />
                      <Text style={styles.uploadText}>Upload</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </GlassCard>
          );
        })}

        {/* Submit Button */}
        <Button
          title="Submit for Verification"
          onPress={handleSubmit}
          loading={loading}
          disabled={!allRequiredUploaded}
          variant={allRequiredUploaded ? 'gold' : 'outline'}
          size="lg"
          fullWidth
          style={styles.submitButton}
        />

        <Text style={styles.disclaimer}>
          Your documents will be reviewed within 24-48 hours. You'll receive a notification once approved.
        </Text>
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
    marginBottom: Spacing['2xl'],
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.titanium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
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
    textAlign: 'center',
  },
  progressCard: {
    padding: Spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    color: Colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  progressValue: {
    color: Colors.gold,
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.full,
  },
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  alertContainer: {
    backgroundColor: Colors.titanium,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  alertTitle: {
    color: Colors.gold,
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  alertText: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  docCard: {
    marginBottom: Spacing.lg,
  },
  docHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  docIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.titanium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  docLabel: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  requiredBadge: {
    backgroundColor: Colors.warning + '30',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  requiredText: {
    color: Colors.warning,
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  docDescription: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginTop: 2,
  },
  uploadButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  uploadedButton: {},
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.gold,
  },
  uploadedGradient: {
    backgroundColor: Colors.success,
  },
  uploadText: {
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  uploadedText: {
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  submitButton: {
    marginTop: Spacing['2xl'],
  },
  disclaimer: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
