-- Add bikes support
ALTER TABLE cars ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'car' CHECK (vehicle_type IN ('car', 'bike'));

-- Add bike-specific columns
ALTER TABLE cars ADD COLUMN IF NOT EXISTS engine_cc INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS bike_type TEXT CHECK (bike_type IN ('scooter', 'commuter', 'sports', 'electric_bike', 'premium'));

-- Update the category constraint to include bike categories
ALTER TABLE cars DROP CONSTRAINT IF EXISTS cars_category_check;
ALTER TABLE cars ADD CONSTRAINT cars_category_check 
  CHECK (category IN ('Budget', 'Hatchback', 'Sedan', 'SUV', 'Luxury', 'EV', 'Scooter', 'Commuter', 'Sports', 'Electric_Bike', 'Premium', 'Cruiser'));

-- Add index for vehicle type
CREATE INDEX IF NOT EXISTS idx_cars_vehicle_type ON cars(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_cars_bike_type ON cars(bike_type);
