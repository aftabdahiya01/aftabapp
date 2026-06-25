import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <AuthProvider>
        <View style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              animation: 'fade',
            }}
          >
            {/* Splash Screen - Initial Route */}
            <Stack.Screen name="index" />

            {/* Auth Routes */}
            <Stack.Screen
              name="auth/login"
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="auth/signup"
              options={{ animation: 'slide_from_bottom' }}
            />

            {/* Main App - Tabs */}
            <Stack.Screen
              name="(tabs)"
              options={{ animation: 'fade' }}
            />

            {/* Car Details & Booking */}
            <Stack.Screen
              name="car/[id]"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="car/[id]/book"
              options={{ animation: 'slide_from_bottom' }}
            />

            {/* Profile Routes */}
            <Stack.Screen
              name="profile/wallet"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="profile/kyc"
              options={{ animation: 'slide_from_right' }}
            />

            {/* Owner Routes */}
            <Stack.Screen
              name="owner/dashboard"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="owner/add-car"
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="owner/car/[id]"
              options={{ animation: 'slide_from_right' }}
            />

            {/* Admin Routes */}
            <Stack.Screen
              name="admin"
              options={{ animation: 'slide_from_right' }}
            />

            {/* Not Found */}
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" />
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
