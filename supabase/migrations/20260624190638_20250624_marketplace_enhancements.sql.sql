-- Add review/ratings table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  car_condition_rating INTEGER CHECK (car_condition_rating >= 1 AND car_condition_rating <= 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  owner_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_reviews" ON reviews FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_own_review" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "update_own_review" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = reviewer_id);

-- Car availability calendar
CREATE TABLE car_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  price_override INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(car_id, date)
);

-- RLS for car_availability
ALTER TABLE car_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_availability" ON car_availability FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "manage_own_availability" ON car_availability FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM cars WHERE id = car_id AND owner_id = auth.uid())
  );

-- Update cars table for marketplace
ALTER TABLE cars ADD COLUMN IF NOT EXISTS weekly_price INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS monthly_price INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS security_deposit INTEGER DEFAULT 0;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS minimum_booking_days INTEGER DEFAULT 1;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS maximum_booking_days INTEGER DEFAULT 30;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE cars ADD COLUMN IF NOT EXISTS instant_booking BOOLEAN DEFAULT false;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS pickup_location TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS mileage INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Owner earnings/payouts table
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  bank_account TEXT,
  ifsc_code TEXT,
  account_holder_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- RLS for payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_payouts" ON payouts FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "insert_own_payouts" ON payouts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, car_id)
);

-- RLS for favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Bookings changes - add more statuses
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_time TEXT DEFAULT '10:00';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_time TEXT DEFAULT '10:00';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_location TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_location TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS security_deposit_returned BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_instant_booking BOOLEAN DEFAULT false;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_car ON reviews(car_id);
CREATE INDEX IF NOT EXISTS idx_reviews_owner ON reviews(owner_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_car_availability_car ON car_availability(car_id);
CREATE INDEX IF NOT EXISTS idx_car_availability_date ON car_availability(date);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_car ON favorites(car_id);
CREATE INDEX IF NOT EXISTS idx_payouts_owner ON payouts(owner_id);
