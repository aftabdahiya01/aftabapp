// Base color tokens - Shared between themes
const baseColors = {
  // Primary brand colors
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',

  // Accent colors
  accent: '#F97316',
  accentLight: '#FB923C',
  accentDark: '#EA580C',

  // Success/Error/Warning
  success: '#22C55E',
  successLight: '#4ADE80',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',

  // Category colors
  budget: '#22C55E',
  hatchback: '#3B82F6',
  sedan: '#8B5CF6',
  suv: '#F97316',
  luxury: '#D4AF37',
  ev: '#06B6D4',
};

// Light theme colors
export const lightColors = {
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  backgroundTertiary: '#F1F5F9',
  backgroundCard: 'rgba(241, 245, 249, 0.9)',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textDisabled: '#CBD5E1',
  border: 'rgba(15, 23, 42, 0.1)',
  borderLight: 'rgba(15, 23, 42, 0.05)',
  borderStrong: 'rgba(15, 23, 42, 0.2)',
  overlay: 'rgba(255, 255, 255, 0.8)',
  overlayLight: 'rgba(255, 255, 255, 0.5)',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  budget: baseColors.budget,
  hatchback: baseColors.hatchback,
  sedan: baseColors.sedan,
  suv: baseColors.suv,
  luxury: baseColors.luxury,
  ev: baseColors.ev,
  primary: baseColors.primary,
  primaryLight: baseColors.primaryLight,
  primaryDark: baseColors.primaryDark,
  accent: baseColors.accent,
  accentLight: baseColors.accentLight,
  accentDark: baseColors.accentDark,
  success: baseColors.success,
  successLight: baseColors.successLight,
  warning: baseColors.warning,
  warningLight: baseColors.warningLight,
  error: baseColors.error,
  errorLight: baseColors.errorLight,
  transparent: 'transparent',
};

// Dark theme colors
export const darkColors = {
  black: '#000000',
  charcoal: '#0A0A0A',
  noir: '#121212',
  obsidian: '#1A1A1A',
  slate: '#222222',
  titanium: '#2D2D2D',
  titaniumLight: '#3D3D3D',
  titaniumMid: '#4A4A4A',
  platinum: '#E5E5E5',
  platinumLight: '#F5F5F5',
  platinumDark: '#C5C5C5',
  silver: '#D4D4D4',
  gold: '#D4AF37',
  goldLight: '#E5C66B',
  goldDark: '#B8960F',
  background: '#000000',
  backgroundSecondary: '#0A0A0A',
  backgroundTertiary: '#121212',
  backgroundCard: 'rgba(26, 26, 26, 0.8)',
  text: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textTertiary: '#737373',
  textDisabled: '#525252',
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  borderStrong: 'rgba(255, 255, 255, 0.2)',
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  surface: '#1A1A1A',
  surfaceSecondary: '#262626',
  budget: baseColors.budget,
  hatchback: baseColors.hatchback,
  sedan: baseColors.sedan,
  suv: baseColors.suv,
  luxury: baseColors.luxury,
  ev: baseColors.ev,
  primary: baseColors.primaryLight,
  primaryLight: baseColors.primaryLight,
  primaryDark: baseColors.primary,
  accent: baseColors.accent,
  accentLight: baseColors.accentLight,
  accentDark: baseColors.accentDark,
  success: baseColors.success,
  successLight: baseColors.successLight,
  warning: baseColors.warning,
  warningLight: baseColors.warningLight,
  error: baseColors.error,
  errorLight: baseColors.errorLight,
  transparent: 'transparent',
};

// Default export (dark mode for backward compatibility)
export const Colors = darkColors;

export const Gradients = {
  primary: ['#2563EB', '#1D4ED8'] as const,
  accent: ['#F97316', '#EA580C'] as const,
  dark: ['#1A1A1A', '#000000'] as const,
  hero: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.8)'] as const,
  glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] as const,
  card: ['rgba(45, 45, 45, 0.8)', 'rgba(26, 26, 26, 0.6)'] as const,
  gold: ['#E5C66B', '#D4AF37'] as const,
};

export const Typography = {
  heading: 'Inter-Bold',
  headingMedium: 'Inter-SemiBold',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    hero: 64,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
  '6xl': 96,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: {
    shadowColor: baseColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const Animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

export const GlassEffect = {
  background: 'rgba(26, 26, 26, 0.6)',
  border: 'rgba(255, 255, 255, 0.1)',
  blur: 20,
};

// Car categories configuration
export const CarCategories = [
  { id: 'Budget', label: 'Budget Cars', description: 'Affordable rides from Rs.300/day', color: baseColors.budget },
  { id: 'Hatchback', label: 'Hatchbacks', description: 'City friendly & fuel efficient', color: baseColors.hatchback },
  { id: 'Sedan', label: 'Sedans', description: 'Family comfort & space', color: baseColors.sedan },
  { id: 'SUV', label: 'SUVs', description: 'Spacious & powerful', color: baseColors.suv },
  { id: 'Luxury', label: 'Luxury', description: 'Premium experience', color: baseColors.luxury },
  { id: 'EV', label: 'Electric', description: 'Eco-friendly drives', color: baseColors.ev },
] as const;

// Bike categories configuration
export const BikeCategories = [
  { id: 'Scooter', label: 'Scooters', description: 'Easy city commute from Rs.200/day', color: baseColors.budget },
  { id: 'Commuter', label: 'Commuter Bikes', description: 'Daily ride comfort', color: baseColors.hatchback },
  { id: 'Sports', label: 'Sports Bikes', description: 'Power & performance', color: baseColors.suv },
  { id: 'Electric_Bike', label: 'Electric Bikes', description: 'Eco-friendly rides', color: baseColors.ev },
  { id: 'Premium', label: 'Premium Bikes', description: 'High-end experience', color: baseColors.luxury },
  { id: 'Cruiser', label: 'Cruisers', description: 'Long distance comfort', color: baseColors.sedan },
] as const;

// Popular Indian cities
export const PopularCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Goa',
] as const;

// Price ranges in INR
export const PriceRanges = [
  { label: 'Under Rs.500', min: 0, max: 500 },
  { label: 'Rs.500 - Rs.1000', min: 500, max: 1000 },
  { label: 'Rs.1000 - Rs.2000', min: 1000, max: 2000 },
  { label: 'Rs.2000 - Rs.5000', min: 2000, max: 5000 },
  { label: 'Rs.5000+', min: 5000, max: 100000 },
] as const;

// Status colors
export const statusColors: Record<string, string> = {
  pending: baseColors.warning,
  approved: baseColors.success,
  rejected: baseColors.error,
  available: baseColors.success,
  confirmed: baseColors.success,
  ongoing: baseColors.accent,
  completed: '#94A3B8',
  cancelled: baseColors.error,
};

// Category icons mapping
export const categoryIcons: Record<string, string> = {
  Budget: 'banknote',
  Hatchback: 'car',
  Sedan: 'car',
  SUV: 'truck',
  Luxury: 'crown',
  EV: 'zap',
};
