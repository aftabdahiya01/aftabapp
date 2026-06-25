import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Car } from '@/types/database';

interface UseCarsOptions {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  transmission?: string;
  fuel?: string;
  search?: string;
  owner_id?: string;
  status?: string;
  // Location-based search
  latitude?: number;
  longitude?: number;
  radius?: number; // in km
  sortByDistance?: boolean;
}

interface CarWithOwner extends Car {
  owner_verification_score?: number;
  distance?: number;
}

interface UseCarsReturn {
  cars: CarWithOwner[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Haversine formula to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Stable serialization of options for comparison
function serializeOptions(options: UseCarsOptions): string {
  return JSON.stringify({
    category: options.category,
    location: options.location,
    minPrice: options.minPrice,
    maxPrice: options.maxPrice,
    transmission: options.transmission,
    fuel: options.fuel,
    search: options.search,
    owner_id: options.owner_id,
    status: options.status,
    latitude: options.latitude,
    longitude: options.longitude,
    radius: options.radius,
    sortByDistance: options.sortByDistance,
  });
}

export function useCars(options: UseCarsOptions = {}): UseCarsReturn {
  const [cars, setCars] = useState<CarWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track if we've already fetched
  const hasFetchedRef = useRef(false);
  const lastOptionsRef = useRef<string>('');

  // Serialize options for comparison
  const optionsKey = useMemo(() => serializeOptions(options), [
    options.category,
    options.location,
    options.minPrice,
    options.maxPrice,
    options.transmission,
    options.fuel,
    options.search,
    options.owner_id,
    options.status,
    options.latitude,
    options.longitude,
    options.radius,
    options.sortByDistance,
  ]);

  const fetchCars = useCallback(async (isRefresh = false) => {
    // Prevent duplicate fetches with same options
    if (!isRefresh && lastOptionsRef.current === optionsKey && hasFetchedRef.current) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      lastOptionsRef.current = optionsKey;

      let query = supabase
        .from('cars')
        .select(`
          *,
          users!owner_id(verification_score)
        `)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      } else if (!options.owner_id) {
        query = query.eq('status', 'approved');
      }

      if (options.category && options.category !== 'All') {
        query = query.eq('category', options.category);
      }

      if (options.location && options.location !== 'All Cities') {
        query = query.eq('location', options.location);
      }

      if (options.minPrice !== undefined) {
        query = query.gte('price_per_day', options.minPrice);
      }

      if (options.maxPrice !== undefined) {
        query = query.lte('price_per_day', options.maxPrice);
      }

      if (options.transmission && options.transmission !== 'Any') {
        query = query.eq('transmission', options.transmission);
      }

      if (options.fuel && options.fuel !== 'Any') {
        query = query.eq('fuel', options.fuel);
      }

      if (options.search) {
        query = query.or(`name.ilike.%${options.search}%,brand.ilike.%${options.search}%,model.ilike.%${options.search}%`);
      }

      if (options.owner_id) {
        query = query.eq('owner_id', options.owner_id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Process cars with owner verification score
      let processedCars: CarWithOwner[] = (data || []).map((car: any) => ({
        ...car,
        owner_verification_score: car.users?.verification_score || 0,
      }));

      // Filter by distance if location is provided
      if (options.latitude && options.longitude) {
        const userLat = options.latitude;
        const userLon = options.longitude;
        const radius = options.radius || 50; // Default 50km radius

        processedCars = processedCars
          .map(car => {
            if (car.latitude && car.longitude) {
              const distance = calculateDistance(userLat, userLon, car.latitude, car.longitude);
              return { ...car, distance };
            }
            return car;
          })
          .filter(car => {
            // Include cars without coordinates, or cars within radius
            if (!car.distance) return true;
            return car.distance <= radius;
          });
      }

      // Sort: verified owners first, then by distance if requested
      if (options.sortByDistance && options.latitude && options.longitude) {
        processedCars.sort((a, b) => {
          // First sort by verification score (higher is better)
          const scoreDiff = (b.owner_verification_score || 0) - (a.owner_verification_score || 0);
          if (scoreDiff !== 0) return scoreDiff;

          // Then by distance (closer is better)
          if (a.distance && b.distance) return a.distance - b.distance;
          if (a.distance) return -1;
          if (b.distance) return 1;
          return 0;
        });
      } else {
        // Default sort: verified owners first
        processedCars.sort((a, b) => {
          return (b.owner_verification_score || 0) - (a.owner_verification_score || 0);
        });
      }

      // Remove the nested users object from the response
      processedCars = processedCars.map(({ users, ...car }) => car) as CarWithOwner[];

      setCars(processedCars);
      hasFetchedRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cars';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [optionsKey]); // Only depend on serialized key

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const refresh = useCallback(async () => {
    hasFetchedRef.current = false;
    await fetchCars(true);
  }, [fetchCars]);

  return { cars, loading, error, refresh };
}

export function useCar(id: string | undefined) {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchCar = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('cars')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setCar(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch car';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  return { car, loading, error };
}
