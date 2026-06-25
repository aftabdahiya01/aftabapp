import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  VerificationDocument,
  VerificationDocumentInsert,
  VehicleVerification,
  SecurityDeposit,
  VehicleInspection,
  InspectionPhoto,
  DamageReport,
  Dispute,
  RentalAgreement,
} from '@/types/database';

// Hook for user verification documents
export function useVerification(userId: string | undefined) {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setDocuments(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const uploadDocument = useCallback(async (
    doc: VerificationDocumentInsert,
    file: File
  ): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'User not authenticated' };

    setLoading(true);
    setError(null);

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${doc.document_type}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(fileName);

      // Insert document record
      const { error: insertError } = await supabase
        .from('verification_documents')
        .insert({
          ...doc,
          user_id: userId,
          document_url: urlData.publicUrl,
        });

      if (insertError) throw insertError;

      // Refresh documents
      await fetchDocuments();

      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [userId, fetchDocuments]);

  const getDocumentByType = useCallback((type: string) => {
    return documents.find(d => d.document_type === type);
  }, [documents]);

  const isFullyVerified = documents.some(d => d.document_type === 'aadhaar' && d.status === 'verified') &&
                          documents.some(d => d.document_type === 'driving_license' && d.status === 'verified');

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    getDocumentByType,
    isFullyVerified,
  };
}

// Hook for vehicle verification
export function useVehicleVerification(carId: string | undefined) {
  const [verification, setVerification] = useState<VehicleVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVerification = useCallback(async () => {
    if (!carId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('vehicle_verifications')
        .select('*')
        .eq('car_id', carId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      setVerification(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch verification';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [carId]);

  return {
    verification,
    loading,
    error,
    fetchVerification,
  };
}

// Hook for security deposits
export function useSecurityDeposit(bookingId: string | undefined) {
  const [deposit, setDeposit] = useState<SecurityDeposit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeposit = useCallback(async () => {
    if (!bookingId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('security_deposits')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      setDeposit(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch deposit';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  const releaseDeposit = useCallback(async (deductionAmount: number = 0, reason?: string) => {
    if (!deposit) return { success: false, error: 'No deposit found' };

    setLoading(true);
    setError(null);

    try {
      const updateData: Record<string, unknown> = {
        status: deductionAmount > 0 ? 'deducted' : 'released',
        released_at: new Date().toISOString(),
      };

      if (deductionAmount > 0) {
        updateData.deduction_amount = deductionAmount;
        updateData.deduction_reason = reason;
      }

      const { error: updateError } = await supabase
        .from('security_deposits')
        .update(updateData)
        .eq('id', deposit.id);

      if (updateError) throw updateError;

      await fetchDeposit();
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to release deposit';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [deposit, fetchDeposit]);

  return {
    deposit,
    loading,
    error,
    fetchDeposit,
    releaseDeposit,
  };
}

// Hook for vehicle inspections
export function useVehicleInspection(bookingId: string | undefined) {
  const [inspections, setInspections] = useState<VehicleInspection[]>([]);
  const [photos, setPhotos] = useState<InspectionPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInspections = useCallback(async () => {
    if (!bookingId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('vehicle_inspections')
        .select(`
          *,
          inspection_photos(*)
        `)
        .eq('booking_id', bookingId)
        .order('inspection_date', { ascending: true });

      if (fetchError) throw fetchError;

      // Flatten photos
      const allPhotos: InspectionPhoto[] = [];
      const inspectionsData = (data || []).map(insp => {
        if (insp.inspection_photos) {
          allPhotos.push(...insp.inspection_photos);
        }
        delete insp.inspection_photos;
        return insp as VehicleInspection;
      });

      setInspections(inspectionsData);
      setPhotos(allPhotos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inspections';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  const createInspection = useCallback(async (
    inspection: Omit<VehicleInspection, 'id' | 'created_at'>,
    inspectionPhotos: Array<{ photo_url: string; photo_type: string; damage_description?: string; damage_severity?: string }>
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Insert inspection
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('vehicle_inspections')
        .insert(inspection)
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      // Insert photos
      if (inspectionPhotos.length > 0 && inspectionData) {
        const photosData = inspectionPhotos.map(p => ({
          ...p,
          inspection_id: inspectionData.id,
        }));

        const { error: photosError } = await supabase
          .from('inspection_photos')
          .insert(photosData);

        if (photosError) throw photosError;
      }

      await fetchInspections();
      return { success: true, error: null, inspection: inspectionData };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create inspection';
      setError(errorMessage);
      return { success: false, error: errorMessage, inspection: null };
    } finally {
      setLoading(false);
    }
  }, [fetchInspections]);

  const getPickupInspection = useCallback(() => {
    return inspections.find(i => i.inspection_type === 'pickup');
  }, [inspections]);

  const getReturnInspection = useCallback(() => {
    return inspections.find(i => i.inspection_type === 'return');
  }, [inspections]);

  return {
    inspections,
    photos,
    loading,
    error,
    fetchInspections,
    createInspection,
    getPickupInspection,
    getReturnInspection,
  };
}

// Hook for damage reports
export function useDamageReports(bookingId: string | undefined) {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!bookingId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('damage_reports')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setReports(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch damage reports';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  const createReport = useCallback(async (report: Omit<DamageReport, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('damage_reports')
        .insert(report);

      if (insertError) throw insertError;

      await fetchReports();
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create report';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
  };
}

// Hook for disputes
export function useDisputes(bookingId: string | undefined) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputes = useCallback(async () => {
    if (!bookingId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('disputes')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setDisputes(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch disputes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  const createDispute = useCallback(async (dispute: Omit<Dispute, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('disputes')
        .insert(dispute);

      if (insertError) throw insertError;

      await fetchDisputes();
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create dispute';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchDisputes]);

  return {
    disputes,
    loading,
    error,
    fetchDisputes,
    createDispute,
  };
}

// Hook for rental agreements
export function useRentalAgreement(bookingId: string | undefined) {
  const [agreement, setAgreement] = useState<RentalAgreement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgreement = useCallback(async () => {
    if (!bookingId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('rental_agreements')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      setAgreement(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agreement';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  const signAgreement = useCallback(async (
    signatureUrl: string,
    isOwner: boolean
  ) => {
    if (!agreement) return { success: false, error: 'No agreement found' };

    setLoading(true);
    setError(null);

    try {
      const updateData: Record<string, unknown> = isOwner
        ? {
            owner_signature_url: signatureUrl,
            owner_signed_at: new Date().toISOString(),
            status: agreement.renter_signed_at ? 'completed' : 'signed_by_owner',
          }
        : {
            renter_signature_url: signatureUrl,
            renter_signed_at: new Date().toISOString(),
            status: agreement.owner_signed_at ? 'completed' : 'signed_by_renter',
          };

      const { error: updateError } = await supabase
        .from('rental_agreements')
        .update(updateData)
        .eq('id', agreement.id);

      if (updateError) throw updateError;

      await fetchAgreement();
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign agreement';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [agreement, fetchAgreement]);

  return {
    agreement,
    loading,
    error,
    fetchAgreement,
    signAgreement,
  };
}
