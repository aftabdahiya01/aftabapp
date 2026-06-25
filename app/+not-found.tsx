import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { AlertCircle, Home } from 'lucide-react-native';
import { Button } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <AlertCircle size={48} color={Colors.gold} />
        </View>

        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>
          The page you're looking for doesn't exist or has been moved.
        </Text>

        <Link href="/" asChild>
          <Button
            title="Go Home"
            onPress={() => {}}
            variant="gold"
            icon={<Home size={18} color={Colors.black} />}
            style={styles.button}
          />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius['3xl'],
    backgroundColor: Colors.titanium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  title: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 24,
  },
  button: {
    marginTop: Spacing.lg,
  },
});
