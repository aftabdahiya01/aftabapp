import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({ source, name, size = 'md', style }: AvatarProps) {
  const sizeStyles = getSizeStyles(size);

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[sizeStyles.container, styles.avatar, style]}
      />
    );
  }

  if (name) {
    return (
      <View style={[sizeStyles.container, styles.placeholder, style]}>
        <Text style={[styles.initials, sizeStyles.text]}>
          {getInitials(name)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[sizeStyles.container, styles.placeholder, style]}>
      <Text style={[styles.initials, sizeStyles.text]}>?</Text>
    </View>
  );
}

function getSizeStyles(size: AvatarSize) {
  switch (size) {
    case 'xs':
      return {
        container: { width: 32, height: 32, borderRadius: BorderRadius.full },
        text: { fontSize: 12 },
      };
    case 'sm':
      return {
        container: { width: 40, height: 40, borderRadius: BorderRadius.full },
        text: { fontSize: 14 },
      };
    case 'lg':
      return {
        container: { width: 64, height: 64, borderRadius: BorderRadius.full },
        text: { fontSize: 24 },
      };
    case 'xl':
      return {
        container: { width: 80, height: 80, borderRadius: BorderRadius.full },
        text: { fontSize: 28 },
      };
    default:
      return {
        container: { width: 48, height: 48, borderRadius: BorderRadius.full },
        text: { fontSize: 16 },
      };
  }
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.titanium,
  },
  placeholder: {
    backgroundColor: Colors.titanium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
  },
});
