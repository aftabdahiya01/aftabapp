import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { LoadingSpinner } from '@/components/ui';
import { Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth/login');
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.gradient}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[Colors.goldLight, Colors.gold]}
            style={styles.logoGradient}
          >
            <Sparkles size={64} color={Colors.black} />
          </LinearGradient>
        </View>

        {/* Brand */}
        <Text style={styles.brandName}>Ridezy</Text>
        <Text style={styles.tagline}>Premium Luxury Self-Drive</Text>

        {/* Loading */}
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: Spacing['2xl'],
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 56,
    letterSpacing: -2,
  },
  tagline: {
    color: Colors.gold,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: Spacing.sm,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  loadingText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: Spacing['4xl'],
  },
});
