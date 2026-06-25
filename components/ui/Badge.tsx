import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Typography, Spacing, BorderRadius, Colors } from '@/constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'gold' | 'outline';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function Badge({ text, variant = 'default', size = 'sm', style }: BadgeProps) {
  const variantStyles = getVariantStyles(variant);

  return (
    <View style={[styles.badge, variantStyles.badge, size === 'md' && styles.badgeMd, style]}>
      <Text style={[styles.text, variantStyles.text, size === 'md' && styles.textMd]}>
        {text}
      </Text>
    </View>
  );
}

function getVariantStyles(variant: BadgeVariant) {
  switch (variant) {
    case 'success':
      return {
        badge: { backgroundColor: Colors.success },
        text: { color: Colors.black },
      };
    case 'warning':
      return {
        badge: { backgroundColor: Colors.warning },
        text: { color: Colors.black },
      };
    case 'error':
      return {
        badge: { backgroundColor: Colors.error },
        text: { color: Colors.text },
      };
    case 'gold':
      return {
        badge: { backgroundColor: Colors.gold },
        text: { color: Colors.black },
      };
    case 'outline':
      return {
        badge: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.border,
        },
        text: { color: Colors.text },
      };
    default:
      return {
        badge: { backgroundColor: Colors.titanium },
        text: { color: Colors.text },
      };
  }
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  text: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textMd: {
    fontSize: 12,
  },
});
