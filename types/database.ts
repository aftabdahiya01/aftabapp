export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'customer' | 'owner' | 'admin';
export type CarCategory = 'Budget' | 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury' | 'EV' | 'Scooter' | 'Commuter' | 'Sports' | 'Electric_Bike' | 'Premium' | 'Cruiser';
export type VehicleType = 'car' | 'bike';
export type BikeType = 'scooter' | 'commuter' | 'sports' | 'electric_bike' | 'premium';
export type Transmission = 'Manual' | 'Automatic';
export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG';
export type CarStatus = 'pending' | 'approved' | 'rejected' | 'available' | 'rented';
export type BookingStatus = 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type TransactionType = 'booking_payment' | 'withdrawal' | 'refund' | 'commission' | 'payout';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  kyc_verified: boolean;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: UserRole;
  kyc_verified?: boolean;
  wallet_balance?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserUpdate {
  id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  role?: UserRole;
  kyc_verified?: boolean;
  wallet_balance?: number;
  created_at?: string;
  updated_at?: string;
}

// Car types
export interface Car {
  id: string;
  owner_id: string;
  owner_name: string;
  name: string;
  brand: string;
  model: string;
  registration_number: string;
  price_per_day: number;
  category: CarCategory;
  transmission: Transmission;
  fuel: FuelType;
  seats: number;
  location: string;
  description: string;
  photos: string[];
  status: CarStatus;
  rating: number;
  total_bookings: number;
  created_at: string;
  updated_at: string;
}

export interface CarInsert {
  id?: string;
  owner_id: string;
  owner_name: string;
  name: string;
  brand: string;
  model: string;
  registration_number: string;
  price_per_day: number;
  category?: CarCategory;
  transmission?: Transmission;
  fuel?: FuelType;
  seats?: number;
  location?: string;
  description?: string;
  photos?: string[];
  status?: CarStatus;
  rating?: number;
  total_bookings?: number;
  created_at?: string;
  updated_at?: string;
}

// Booking types
export interface Booking {
  id: string;
  car_id: string;
  car_name: string;
  car_photo: string | null;
  customer_id: string;
  customer_name: string;
  owner_id: string;
  pickup_date: string;
  return_date: string;
  days: number;
  amount: number;
  commission: number;
  owner_amount: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingInsert {
  id?: string;
  car_id: string;
  car_name: string;
  car_photo?: string | null;
  customer_id: string;
  customer_name: string;
  owner_id: string;
  pickup_date: string;
  return_date: string;
  days: number;
  amount: number;
  commission: number;
  owner_amount: number;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  created_at?: string;
  updated_at?: string;
}

export interface BookingUpdate {
  id?: string;
  car_id?: string;
  car_name?: string;
  car_photo?: string | null;
  customer_id?: string;
  customer_name?: string;
  owner_id?: string;
  pickup_date?: string;
  return_date?: string;
  days?: number;
  amount?: number;
  commission?: number;
  owner_amount?: number;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  created_at?: string;
  updated_at?: string;
}

// Transaction types
export interface Transaction {
  id: string;
  type: TransactionType;
  booking_id: string | null;
  owner_id: string | null;
  customer_id: string | null;
  amount: number;
  commission: number;
  owner_credit: number;
  created_at: string;
}

export interface TransactionInsert {
  id?: string;
  type: TransactionType;
  booking_id?: string | null;
  owner_id?: string | null;
  customer_id?: string | null;
  amount: number;
  commission?: number;
  owner_credit?: number;
  created_at?: string;
}

// Loyalty types
export type LoyaltyTier = 'silver' | 'gold' | 'platinum';
export type PointsTransactionType = 'earned' | 'redeemed' | 'bonus' | 'referral';

export interface LoyaltyPoints {
  id: string;
  user_id: string;
  points: number;
  tier: LoyaltyTier;
  total_earned: number;
  total_redeemed: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyPointsInsert {
  user_id: string;
  points?: number;
  tier?: LoyaltyTier;
  total_earned?: number;
  total_redeemed?: number;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: PointsTransactionType;
  booking_id: string | null;
  description: string | null;
  created_at: string;
}

export interface PointsTransactionInsert {
  user_id: string;
  amount: number;
  type: PointsTransactionType;
  booking_id?: string | null;
  description?: string | null;
}

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  uses: number;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  reward_points: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

// Review types
export interface Review {
  id: string;
  booking_id: string;
  car_id: string;
  reviewer_id: string;
  owner_id: string;
  rating: number;
  comment: string | null;
  car_condition_rating: number | null;
  cleanliness_rating: number | null;
  owner_response: string | null;
  created_at: string;
}

export interface ReviewInsert {
  booking_id: string;
  car_id: string;
  reviewer_id: string;
  owner_id: string;
  rating: number;
  comment?: string | null;
  car_condition_rating?: number | null;
  cleanliness_rating?: number | null;
}

// Favorite types
export interface Favorite {
  id: string;
  user_id: string;
  car_id: string;
  created_at: string;
}

// Car availability types
export interface CarAvailability {
  id: string;
  car_id: string;
  date: string;
  is_available: boolean;
  price_override: number | null;
  created_at: string;
}

// Payout types
export interface Payout {
  id: string;
  owner_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bank_account: string | null;
  ifsc_code: string | null;
  account_holder_name: string | null;
  created_at: string;
  processed_at: string | null;
}

// Verification document types
export type DocumentType = 'aadhaar' | 'driving_license' | 'vehicle_rc' | 'pan_card' | 'bank_statement';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  document_number: string | null;
  document_name: string;
  document_url: string;
  document_back_url: string | null;
  status: VerificationStatus;
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface VerificationDocumentInsert {
  user_id: string;
  document_type: DocumentType;
  document_number?: string | null;
  document_name: string;
  document_url: string;
  document_back_url?: string | null;
  status?: VerificationStatus;
  metadata?: Json;
}

// Vehicle verification types
export interface VehicleVerification {
  id: string;
  car_id: string;
  rc_number: string;
  rc_document_url: string;
  insurance_document_url: string | null;
  puc_document_url: string | null;
  fitness_certificate_url: string | null;
  status: VerificationStatus;
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Security deposit types
export type DepositStatus = 'pending' | 'held' | 'released' | 'deducted' | 'refunded';

export interface SecurityDeposit {
  id: string;
  booking_id: string;
  user_id: string;
  owner_id: string;
  amount: number;
  status: DepositStatus;
  held_at: string;
  released_at: string | null;
  deduction_amount: number;
  deduction_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Vehicle inspection types
export type InspectionType = 'pickup' | 'return' | 'damage_report';
export type ConditionLevel = 'excellent' | 'good' | 'fair' | 'poor';
export type FuelLevel = 'empty' | 'quarter' | 'half' | 'three_quarter' | 'full';

export interface VehicleInspection {
  id: string;
  booking_id: string;
  inspection_type: InspectionType;
  inspector_id: string;
  inspection_date: string;
  odometer_reading: number | null;
  fuel_level: FuelLevel | null;
  exterior_condition: ConditionLevel | null;
  interior_condition: ConditionLevel | null;
  notes: string | null;
  damage_found: boolean;
  created_at: string;
}

export interface InspectionPhoto {
  id: string;
  inspection_id: string;
  photo_url: string;
  photo_type: 'exterior_front' | 'exterior_back' | 'exterior_left' | 'exterior_right' | 'interior_front' | 'interior_back' | 'damage' | 'odometer' | 'other';
  damage_description: string | null;
  damage_severity: 'minor' | 'moderate' | 'severe' | null;
  created_at: string;
}

// Damage report types
export type DamageType = 'scratch' | 'dent' | 'crack' | 'break' | 'mechanical' | 'interior' | 'other';
export type DamageStatus = 'reported' | 'acknowledged' | 'repairing' | 'resolved' | 'disputed';

export interface DamageReport {
  id: string;
  booking_id: string;
  reported_by: string;
  damage_type: DamageType;
  damage_location: string;
  description: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  status: DamageStatus;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Dispute types
export type DisputeType = 'damage' | 'deposit' | 'payment' | 'late_return' | 'fuel' | 'other';
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed';

export interface Dispute {
  id: string;
  booking_id: string;
  damage_report_id: string | null;
  opened_by: string;
  dispute_type: DisputeType;
  description: string;
  status: DisputeStatus;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Rental agreement types
export type AgreementStatus = 'pending' | 'signed_by_owner' | 'signed_by_renter' | 'completed' | 'cancelled';

export interface RentalAgreement {
  id: string;
  booking_id: string;
  agreement_number: string;
  terms_and_conditions: string;
  owner_signature_url: string | null;
  renter_signature_url: string | null;
  owner_signed_at: string | null;
  renter_signed_at: string | null;
  status: AgreementStatus;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

// Database interface for Supabase client
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      cars: {
        Row: Car;
        Insert: CarInsert;
        Update: Partial<Car>;
      };
      bookings: {
        Row: Booking;
        Insert: BookingInsert;
        Update: BookingUpdate;
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionInsert;
        Update: Partial<Transaction>;
      };
      loyalty_points: {
        Row: LoyaltyPoints;
        Insert: LoyaltyPointsInsert;
        Update: Partial<LoyaltyPoints>;
      };
      points_transactions: {
        Row: PointsTransaction;
        Insert: PointsTransactionInsert;
        Update: Partial<PointsTransaction>;
      };
      referral_codes: {
        Row: ReferralCode;
        Insert: Partial<ReferralCode>;
        Update: Partial<ReferralCode>;
      };
      referrals: {
        Row: Referral;
        Insert: Partial<Referral>;
        Update: Partial<Referral>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      car_category: CarCategory;
      transmission: Transmission;
      fuel_type: FuelType;
      car_status: CarStatus;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
      transaction_type: TransactionType;
      loyalty_tier: LoyaltyTier;
      points_transaction_type: PointsTransactionType;
    };
  };
}
