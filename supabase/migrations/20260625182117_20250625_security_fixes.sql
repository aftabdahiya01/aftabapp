-- ============================================
-- SECURITY FIX MIGRATION
-- ============================================

-- ============================================
-- 1. Fix SECURITY DEFINER function with search_path
-- ============================================

-- Drop and recreate calculate_verification_score with secure search_path
DROP FUNCTION IF EXISTS calculate_verification_score(UUID);

CREATE OR REPLACE FUNCTION calculate_verification_score(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Aadhaar: 30 points
  SELECT CASE WHEN COUNT(*) > 0 THEN 30 ELSE 0 END INTO score
  FROM verification_documents 
  WHERE user_id = p_user_id 
  AND document_type = 'aadhaar' 
  AND status = 'verified';
  
  -- Driving License: 30 points
  SELECT score + CASE WHEN COUNT(*) > 0 THEN 30 ELSE 0 END INTO score
  FROM verification_documents 
  WHERE user_id = p_user_id 
  AND document_type = 'driving_license' 
  AND status = 'verified';
  
  -- Pan Card: 20 points
  SELECT score + CASE WHEN COUNT(*) > 0 THEN 20 ELSE 0 END INTO score
  FROM verification_documents 
  WHERE user_id = p_user_id 
  AND document_type = 'pan_card' 
  AND status = 'verified';
  
  -- Bank Statement: 20 points
  SELECT score + CASE WHEN COUNT(*) > 0 THEN 20 ELSE 0 END INTO score
  FROM verification_documents 
  WHERE user_id = p_user_id 
  AND document_type = 'bank_statement' 
  AND status = 'verified';
  
  -- Update profile verification score
  UPDATE users SET verification_score = score WHERE id = p_user_id;
  
  RETURN score;
END;
$$;

-- ============================================
-- 2. Add RESTRICTIVE policies for defense in depth
-- ============================================

-- Users table: Add restrictive policy
CREATE POLICY "users_restrictive" ON users
  AS RESTRICTIVE FOR ALL
  TO authenticated
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Cars table: Add restrictive policy
CREATE POLICY "cars_restrictive" ON cars
  AS RESTRICTIVE FOR ALL
  TO authenticated
  USING (
    status = 'approved' OR 
    owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Bookings table: Add restrictive policy
CREATE POLICY "bookings_restrictive" ON bookings
  AS RESTRICTIVE FOR ALL
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Transactions table: Add restrictive policy
CREATE POLICY "transactions_restrictive" ON transactions
  AS RESTRICTIVE FOR ALL
  TO authenticated
  USING (
    owner_id = auth.uid() OR 
    customer_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Loyalty points: Add restrictive policy
CREATE POLICY "loyalty_points_restrictive" ON loyalty_points
  AS RESTRICTIVE FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 3. Add missing admin policies
-- ============================================

-- Damage reports - admin full access
CREATE POLICY "admin_damage_reports" ON damage_reports
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Disputes - admin full access
CREATE POLICY "admin_disputes" ON disputes
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Inspection photos - admin full access
CREATE POLICY "admin_inspection_photos" ON inspection_photos
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Rental agreements - admin full access
CREATE POLICY "admin_rental_agreements" ON rental_agreements
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Security deposits - admin full access
CREATE POLICY "admin_security_deposits" ON security_deposits
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Vehicle inspections - admin full access
CREATE POLICY "admin_vehicle_inspections" ON vehicle_inspections
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Vehicle verifications - admin full access  
CREATE POLICY "admin_vehicle_verifications" ON vehicle_verifications
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Verification documents - admin full access
CREATE POLICY "admin_verification_documents" ON verification_documents
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Car availability - admin full access
CREATE POLICY "admin_car_availability" ON car_availability
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Favorites - admin read access
CREATE POLICY "admin_favorites" ON favorites
  AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Loyalty points - admin full access
CREATE POLICY "admin_loyalty_points" ON loyalty_points
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Payouts - admin full access
CREATE POLICY "admin_payouts" ON payouts
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Referral codes - admin read access
CREATE POLICY "admin_referral_codes" ON referral_codes
  AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Referrals - admin full access
CREATE POLICY "admin_referrals" ON referrals
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Reviews - admin full access
CREATE POLICY "admin_reviews" ON reviews
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 4. Add missing UPDATE policies for some tables
-- ============================================

-- Damage reports - allow both parties to update
CREATE POLICY "booking_parties_update_damage" ON damage_reports
  AS PERMISSIVE FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings WHERE id = booking_id 
      AND (customer_id = auth.uid() OR owner_id = auth.uid())
    )
  );

-- Disputes - allow both parties to update
CREATE POLICY "booking_parties_update_disputes" ON disputes
  AS PERMISSIVE FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings WHERE id = booking_id 
      AND (customer_id = auth.uid() OR owner_id = auth.uid())
    )
  );

-- Security deposits - add INSERT policy for system
CREATE POLICY "system_insert_deposits" ON security_deposits
  AS PERMISSIVE FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN cars c ON c.id = b.car_id
      WHERE b.id = booking_id 
      AND (b.customer_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

-- Rental agreements - add INSERT policy
CREATE POLICY "system_insert_agreements" ON rental_agreements
  AS PERMISSIVE FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_id 
      AND (customer_id = auth.uid() OR owner_id = auth.uid())
    )
  );

-- ============================================
-- 5. Points transactions - admin access
-- ============================================

CREATE POLICY "admin_points_transactions" ON points_transactions
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 6. Grant minimal necessary permissions
-- ============================================

-- Ensure public schema is not writable by anon
REVOKE ALL ON SCHEMA public FROM anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Ensure authenticated role has usage
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================
-- 7. Add triggers for audit logging (optional)
-- ============================================

-- Create audit log table (optional, for compliance)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS on audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only_audit_log" ON audit_log
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
