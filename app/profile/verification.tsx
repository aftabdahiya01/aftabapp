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
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  Shield,
  Upload,
  Check,
  Clock,
  X,
  FileText,
  AlertCircle,
  Award,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/hooks/useVerification';
import { Button, GlassCard, LoadingSpinner, Badge } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { DocumentType, VerificationStatus } from '@/types/database';

const documentTypes: Array<{
  type: DocumentType;
  title: string;
  description: string;
  points: number;
  required: boolean;
}> = [
  {
    type: 'aadhaar',
    title: 'Aadhaar Card',
    description: 'Identity verification document',
    points: 30,
    required: true,
  },
  {
    type: 'driving_license',
    title: 'Driving License',
    description: 'Valid driving license for vehicle operation',
    points: 30,
    required: true,
  },
  {
    type: 'pan_card',
    title: 'PAN Card',
    description: 'Tax identification document',
    points: 20,
    required: false,
  },
  {
    type: 'bank_statement',
    title: 'Bank Statement',
    description: 'Last 3 months bank statement',
    points: 20,
    required: false,
  },
];

export default function VerificationScreen() {
  const { user, profile } = useAuth();
  const { documents, loading, error, fetchDocuments } = useVerification(user?.id);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const getDocumentStatus = (type: DocumentType): VerificationStatus | 'not_uploaded' => {
    const doc = documents.find(d => d.document_type === type);
    return doc?.status || 'not_uploaded';
  };

  const getStatusIcon = (status: VerificationStatus | 'not_uploaded') => {
    switch (status) {
      case 'verified':
        return <Check size={16} color={Colors.success} />;
      case 'pending':
        return <Clock size={16} color={Colors.warning} />;
      case 'rejected':
        return <X size={16} color={Colors.error} />;
      default:
        return <Upload size={16} color={Colors.textTertiary} />;
    }
  };

  const getStatusColor = (status: VerificationStatus | 'not_uploaded') => {
    switch (status) {
      case 'verified':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'rejected':
        return Colors.error;
      default:
        return Colors.border;
    }
  };

  const totalPoints = documents
    .filter(d => d.status === 'verified')
    .reduce((sum, d) => {
      const docType = documentTypes.find(dt => dt.type === d.document_type);
      return sum + (docType?.points || 0);
    }, 0);

  const verifiedCount = documentTypes.filter(dt => getDocumentStatus(dt.type) === 'verified').length;

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
          <Text style={styles.headerTitle}>Verification Center</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Verification Score */}
        <GlassCard style={styles.scoreCard}>
          <View style={styles.scoreContent}>
            <View style={styles.scoreLeft}>
              <Award size={32} color={Colors.primary} />
              <View style={styles.scoreText}>
                <Text style={styles.scoreLabel}>Verification Score</Text>
                <Text style={styles.scoreValue}>{totalPoints}/100</Text>
              </View>
            </View>
            <Badge
              text={`${verifiedCount}/${documentTypes.length} Documents`}
              variant={verifiedCount === documentTypes.length ? 'success' : 'warning'}
            />
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${totalPoints}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {verifiedCount === documentTypes.length
              ? 'All documents verified!'
              : `${documentTypes.length - verifiedCount} documents remaining`}
          </Text>
        </GlassCard>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {loading ? (
          <LoadingSpinner fullScreen message="Loading documents..." />
        ) : (
          <>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <Shield size={20} color={Colors.primary} />
              <Text style={styles.infoText}>
                Verified users get priority in search results and can access exclusive features
              </Text>
            </View>

            {/* Document List */}
            {documentTypes.map((docType) => {
              const status = getDocumentStatus(docType.type);
              const doc = documents.find(d => d.document_type === docType.type);

              return (
                <GlassCard key={docType.type} style={styles.documentCard}>
                  <View style={styles.documentHeader}>
                    <View style={[styles.statusIcon, { borderColor: getStatusColor(status) }]}>
                      {getStatusIcon(status)}
                    </View>
                    <View style={styles.documentInfo}>
                      <View style={styles.documentTitleRow}>
                        <Text style={styles.documentTitle}>{docType.title}</Text>
                        {docType.required && (
                          <Badge text="Required" variant="warning" size="sm" />
                        )}
                      </View>
                      <Text style={styles.documentDescription}>{docType.description}</Text>
                      <Text style={styles.documentPoints}>+{docType.points} points</Text>
                    </View>
                    <Badge
                      text={status === 'not_uploaded' ? 'Upload' : status}
                      variant={
                        status === 'verified' ? 'success' :
                        status === 'pending' ? 'warning' :
                        status === 'rejected' ? 'error' : 'default'
                      }
                    />
                  </View>

                  {status === 'rejected' && doc?.rejection_reason && (
                    <View style={styles.rejectionReason}>
                      <AlertCircle size={16} color={Colors.error} />
                      <Text style={styles.rejectionText}>{doc.rejection_reason}</Text>
                    </View>
                  )}

                  {status !== 'verified' && (
                    <Button
                      title={status === 'not_uploaded' ? 'Upload Document' : 'Re-upload'}
                      onPress={() => {
                        // Navigate to upload screen or open file picker
                        router.push(`/profile/upload-document?type=${docType.type}`);
                      }}
                      variant={status === 'rejected' ? 'outline' : 'primary'}
                      size="sm"
                      style={styles.uploadButton}
                    />
                  )}

                  {status === 'verified' && doc?.verified_at && (
                    <Text style={styles.verifiedText}>
                      Verified on {new Date(doc.verified_at).toLocaleDateString()}
                    </Text>
                  )}
                </GlassCard>
              );
            })}
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
    paddingBottom: Spacing['2xl'],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing['2xl'],
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
  scoreCard: {
    padding: Spacing.lg,
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scoreText: {},
  scoreLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  scoreValue: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  infoCard: {
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
  documentCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  documentTitle: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  documentDescription: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginTop: 2,
  },
  documentPoints: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 4,
  },
  rejectionReason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.error + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  rejectionText: {
    flex: 1,
    color: Colors.error,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  uploadButton: {
    marginTop: Spacing.md,
  },
  verifiedText: {
    color: Colors.success,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
