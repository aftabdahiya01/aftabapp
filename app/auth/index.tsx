import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, Link } from 'expo-router';
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'owner'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password || (mode === 'signup' && !name)) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    if (mode === 'login') {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.replace('/(tabs)');
      }
    } else {
      const result = await signUp(email, password, name, role);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.replace('/(tabs)');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background */}
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.gradient}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Sparkles size={32} color={Colors.primary} />
          </View>
          <View style={styles.brandRow}>
            <Sparkles size={20} color={Colors.primary} />
            <Text style={styles.brandName}>Ridezy</Text>
          </View>
          <Text style={styles.tagline}>Self-Drive Rentals Made Easy</Text>
        </View>

        {/* Large Auth Buttons - Toggle Mode */}
        <View style={styles.modeButtonContainer}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'login' && styles.modeActive]}
            onPress={() => {
              setMode('login');
              setError(null);
            }}
            activeOpacity={0.9}
          >
            <Text style={[styles.modeButtonText, mode === 'login' && styles.modeActiveText]}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'signup' && styles.modeActive]}
            onPress={() => {
              setMode('signup');
              setError(null);
            }}
            activeOpacity={0.9}
          >
            <Text style={[styles.modeButtonText, mode === 'signup' && styles.modeActiveText]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {mode === 'login' ? 'Welcome Back!' : 'Join Ridezy Today'}
          </Text>

          {mode === 'signup' && (
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              label="Full Name"
              autoCapitalize="words"
              icon={<User size={20} color={Colors.textTertiary} />}
            />
          )}

          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={20} color={Colors.textTertiary} />}
          />

          <View style={styles.passwordContainer}>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              label="Password"
              secureTextEntry={!showPassword}
              icon={<Lock size={20} color={Colors.textTertiary} />}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color={Colors.textTertiary} />
              ) : (
                <Eye size={20} color={Colors.textTertiary} />
              )}
            </TouchableOpacity>
          </View>

          {mode === 'signup' && (
            <View style={styles.roleSelector}>
              <Text style={styles.roleLabel}>I want to:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'customer' && styles.roleActive]}
                  onPress={() => setRole('customer')}
                >
                  <Text style={[styles.roleText, role === 'customer' && styles.roleActiveText]}>
                    Rent Cars
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'owner' && styles.roleActive]}
                  onPress={() => setRole('owner')}
                >
                  <Text style={[styles.roleText, role === 'owner' && styles.roleActiveText]}>
                    List My Car
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {mode === 'login' && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <Button
            title={mode === 'login' ? 'Sign In' : 'Create Account'}
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.submitButton}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Auth */}
        <TouchableOpacity style={styles.googleButton}>
          <View style={styles.googleIcon}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 120, // Extra padding for Bolt watermark
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    marginTop: Spacing.md,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginLeft: Spacing.sm,
  },
  tagline: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  modeButtonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    marginTop: Spacing.xl,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeButtonText: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  modeActiveText: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.lg,
    top: 38,
  },
  roleSelector: {
    marginTop: Spacing.lg,
  },
  roleLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  roleText: {
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  roleActiveText: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  errorContainer: {
    backgroundColor: Colors.error + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  errorText: {
    color: Colors.error,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginHorizontal: Spacing.md,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  googleText: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  terms: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing['4xl'],
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
  },
});
