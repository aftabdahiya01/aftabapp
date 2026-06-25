import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, ArrowLeft, Sparkles, Car } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'owner'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signUp } = useAuth();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signUp(email, password, name, role);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={Colors.text} />
              </TouchableOpacity>

              <View style={styles.logoContainer}>
                <View style={styles.logoGradient}>
                  <Sparkles size={32} color={Colors.gold} />
                </View>
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join the premium car rental experience</Text>
            </View>

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>I want to</Text>
              <View style={styles.roleOptions}>
                <TouchableOpacity
                  style={[styles.roleOption, role === 'customer' && styles.roleOptionActive]}
                  onPress={() => setRole('customer')}
                >
                  <LinearGradient
                    colors={['transparent', 'transparent']}
                    style={styles.roleGradient}
                  >
                    <User size={24} color={role === 'customer' ? Colors.black : Colors.text} />
                    <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>
                      Rent Cars
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleOption, role === 'owner' && styles.roleOptionActive]}
                  onPress={() => setRole('owner')}
                >
                  <LinearGradient
                    colors={['transparent', 'transparent']}
                    style={styles.roleGradient}
                  >
                    <Car size={24} color={role === 'owner' ? Colors.black : Colors.text} />
                    <Text style={[styles.roleText, role === 'owner' && styles.roleTextActive]}>
                      List My Cars
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                label="Full Name"
                autoCapitalize="words"
                icon={<User size={20} color={Colors.textTertiary} />}
              />

              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                label="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Mail size={20} color={Colors.textTertiary} />}
              />

              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                label="Password"
                secureTextEntry
                icon={<Lock size={20} color={Colors.textTertiary} />}
              />

              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                label="Confirm Password"
                secureTextEntry
                icon={<Lock size={20} color={Colors.textTertiary} />}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Button
                title="Create Account"
                onPress={handleSignup}
                loading={loading}
                variant="gold"
                size="lg"
                fullWidth
                style={styles.signupButton}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/auth/login" style={styles.link}>
                <Text style={styles.linkText}>Sign In</Text>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['4xl'],
    paddingBottom: Spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: Spacing.sm,
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.titanium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  roleContainer: {
    marginBottom: Spacing['2xl'],
  },
  roleLabel: {
    color: Colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roleOption: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  roleOptionActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold,
  },
  roleGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  roleTextActive: {
    color: Colors.black,
  },
  form: {
    marginBottom: Spacing['2xl'],
  },
  errorContainer: {
    backgroundColor: Colors.error + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  errorText: {
    color: Colors.error,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  signupButton: {
    marginTop: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: Spacing.xl,
  },
  footerText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  link: {},
  linkText: {
    color: Colors.gold,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});
