-- Owner Verification System
CREATE TABLE verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('aadhaar', 'driving_license', 'vehicle_rc', 'pan_card', 'bank_statement')),
  document_number TEXT,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_back_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, document_type)
);

-- Vehicle verification
CREATE TABLE vehicle_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  rc_number TEXT NOT NULL,
  rc_document_url TEXT NOT NULL,
  insurance_document_url TEXT,
  puc_document_url TEXT,
  fitness_certificate_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Deposits
CREATE TABLE security_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('pending', 'held', 'released', 'deducted', 'refunded')),
  held_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  deduction_amount DECIMAL(10,2) DEFAULT 0,
  deduction_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Inspection (before/after rental)
CREATE TABLE vehicle_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('pickup', 'return', 'damage_report')),
  inspector_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  inspection_date TIMESTAMPTZ DEFAULT NOW(),
  odometer_reading INTEGER,
  fuel_level TEXT CHECK (fuel_level IN ('empty', 'quarter', 'half', 'three_quarter', 'full')),
  exterior_condition TEXT CHECK (exterior_condition IN ('excellent', 'good', 'fair', 'poor')),
  interior_condition TEXT CHECK (interior_condition IN ('excellent', 'good', 'fair', 'poor')),
  notes TEXT,
  damage_found BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspection Photos
CREATE TABLE inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES vehicle_inspections(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('exterior_front', 'exterior_back', 'exterior_left', 'exterior_right', 'interior_front', 'interior_back', 'damage', 'odometer', 'other')),
  damage_description TEXT,
  damage_severity TEXT CHECK (damage_severity IN ('minor', 'moderate', 'severe')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Damage Reports
CREATE TABLE damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  reported_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  damage_type TEXT NOT NULL CHECK (damage_type IN ('scratch', 'dent', 'crack', 'break', 'mechanical', 'interior', 'other')),
  damage_location TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'acknowledged', 'repairing', 'resolved', 'disputed')),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disputes
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  damage_report_id UUID REFERENCES damage_reports(id) ON DELETE SET NULL,
  opened_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('damage', 'deposit', 'payment', 'late_return', 'fuel', 'other')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rental Agreements
CREATE TABLE rental_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  agreement_number TEXT UNIQUE NOT NULL,
  terms_and_conditions TEXT NOT NULL,
  owner_signature_url TEXT,
  renter_signature_url TEXT,
  owner_signed_at TIMESTAMPTZ,
  renter_signed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_by_owner', 'signed_by_renter', 'completed', 'cancelled')),
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User verification status
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS driving_license_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Location tracking for cars
ALTER TABLE cars ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS location_address TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS pickup_instructions TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_location_verified BOOLEAN DEFAULT FALSE;

-- Car verification status
ALTER TABLE cars ADD COLUMN IF NOT EXISTS rc_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS insurance_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS car_verification_score INTEGER DEFAULT 0;

-- Security deposit amount for cars
ALTER TABLE cars ADD COLUMN IF NOT EXISTS security_deposit_amount DECIMAL(10,2) DEFAULT 0;

-- Booking location fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_latitude DECIMAL(10,8);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_longitude DECIMAL(11,8);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_latitude DECIMAL(10,8);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_longitude DECIMAL(11,8);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS distance_traveled DECIMAL(10,2);

-- Indexes
CREATE INDEX idx_verification_documents_user ON verification_documents(user_id);
CREATE INDEX idx_verification_documents_status ON verification_documents(status);
CREATE INDEX idx_vehicle_verifications_car ON vehicle_verifications(car_id);
CREATE INDEX idx_security_deposits_booking ON security_deposits(booking_id);
CREATE INDEX idx_security_deposits_user ON security_deposits(user_id);
CREATE INDEX idx_vehicle_inspections_booking ON vehicle_inspections(booking_id);
CREATE INDEX idx_inspection_photos_inspection ON inspection_photos(inspection_id);
CREATE INDEX idx_damage_reports_booking ON damage_reports(booking_id);
CREATE INDEX idx_disputes_booking ON disputes(booking_id);
CREATE INDEX idx_rental_agreements_booking ON rental_agreements(booking_id);
CREATE INDEX idx_cars_location_verified ON cars(is_location_verified);
CREATE INDEX idx_users_verification_score ON users(verification_score);

-- Enable RLS
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;

-- Verification documents policies
CREATE POLICY "select_own_documents" ON verification_documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_documents" ON verification_documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_documents" ON verification_documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Vehicle verifications policies
CREATE POLICY "owner_manage_verifications" ON vehicle_verifications FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM cars WHERE id = car_id AND owner_id = auth.uid())
  );

-- Security deposits policies
CREATE POLICY "user_own_deposits" ON security_deposits FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR auth.uid() = owner_id);

-- Vehicle inspections policies
CREATE POLICY "booking_parties_inspections" ON vehicle_inspections FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM bookings WHERE id = booking_id 
      AND (customer_id = auth.uid() OR owner_id = auth.uid())
    )
  );
CREATE POLICY "booking_parties_insert_inspections" ON vehicle_inspections FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings WHERE id = booking_id 
      AND (customer_id = auth.uid() OR owner_id = auth.uid())
    )
  );

-- Inspection photos policies
CREATE POLICY "inspection_photos_access" ON inspection_photos FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM vehicle_inspections vi
      JOIN bookings b ON b.id = vi.booking_id
      WHERE vi.id = inspection_id AND (b.customer_id = auth.uid() OR b.owner_id = auth.uid())
    )
  );
CREATE POLICY "inspection_photos_insert" ON inspection_photos FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM vehicle_inspections vi
      JOIN bookings b ON b.id = vi.booking_id
      WHERE vi.id = inspection_id AND (b.customer_id = auth.uid() OR b.owner_id = auth.uid())
    )
  );

-- Damage reports policies
CREATE POLICY "booking_parties_damage" ON damage_reports FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM bookings WHERE id = booking_id 
      AND (customer_id = auth.uid() OR owner_id = auth.uid())
    )
  );

-- Disputes policies
CREATE POLICY "booking_parties_disputes" ON disputes FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM bookings WHERE id = booking_id 
      AND (customer_id = auth.uid() OR owner_id = auth.uid())
    )
  );
CREATE POLICY "booking_parties_insert_disputes" ON disputes FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings WHERE id = booking_id 
      AND (customer_id = auth.uid() OR owner_id = auth.uid())
    )
  );

-- Rental agreements policies
CREATE POLICY "booking_parties_agreements" ON rental_agreements FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM bookings WHERE id = booking_id 
      AND (customer_id = auth.uid() OR owner_id = auth.uid())
    )
  );
CREATE POLICY "booking_parties_sign_agreements" ON rental_agreements FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM bookings WHERE id = booking_id 
      AND (customer_id = auth.uid() OR owner_id = auth.uid())
    )
  );

-- Create sequence for agreement numbers
CREATE SEQUENCE IF NOT EXISTS agreement_seq;

-- Function to generate agreement number
CREATE OR REPLACE FUNCTION generate_agreement_number()
RETURNS TEXT AS $$
DECLARE
  agreement_num TEXT;
BEGIN
  agreement_num := 'RA' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('agreement_seq')::TEXT, 5, '0');
  RETURN agreement_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate verification score
CREATE OR REPLACE FUNCTION calculate_verification_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  SELECT CASE WHEN COUNT(*) > 0 THEN 30 ELSE 0 END INTO score
  FROM verification_documents 
  WHERE user_id = p_user_id AND document_type = 'aadhaar' AND status = 'verified';
  
  SELECT score + CASE WHEN COUNT(*) > 0 THEN 30 ELSE 0 END INTO score
  FROM verification_documents 
  WHERE user_id = p_user_id AND document_type = 'driving_license' AND status = 'verified';
  
  SELECT score + CASE WHEN COUNT(*) > 0 THEN 20 ELSE 0 END INTO score
  FROM verification_documents 
  WHERE user_id = p_user_id AND document_type = 'pan_card' AND status = 'verified';
  
  SELECT score + CASE WHEN COUNT(*) > 0 THEN 20 ELSE 0 END INTO score
  FROM verification_documents 
  WHERE user_id = p_user_id AND document_type = 'bank_statement' AND status = 'verified';
  
  UPDATE users SET verification_score = score WHERE id = p_user_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_verification_documents_updated_at
  BEFORE UPDATE ON verification_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vehicle_verifications_updated_at
  BEFORE UPDATE ON vehicle_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_deposits_updated_at
  BEFORE UPDATE ON security_deposits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_damage_reports_updated_at
  BEFORE UPDATE ON damage_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rental_agreements_updated_at
  BEFORE UPDATE ON rental_agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
