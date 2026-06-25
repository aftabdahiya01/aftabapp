import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Gradients } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const sizeStyles = getSizeStyles(size);
  const variantStyles = getVariantStyles(variant, disabled);

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variantStyles.spinnerColor}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              { color: variantStyles.textColor },
              icon ? { marginLeft: Spacing.sm } : null,
              icon && iconPosition === 'right' ? { marginLeft: 0, marginRight: Spacing.sm } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth]}
      >
        <LinearGradient
          colors={disabled ? [Colors.titanium, Colors.titaniumLight] : Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            sizeStyles.button,
            fullWidth && styles.fullWidth,
            style,
          ]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'accent') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth]}
      >
        <LinearGradient
          colors={disabled ? [Colors.titanium, Colors.titaniumLight] : Gradients.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            sizeStyles.button,
            fullWidth && styles.fullWidth,
            style,
          ]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        sizeStyles.button,
        variantStyles.button,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
}

function getSizeStyles(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return {
        button: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
        text: { fontSize: 14 },
      };
    case 'lg':
      return {
        button: { paddingVertical: Spacing.xl, paddingHorizontal: Spacing['2xl'] },
        text: { fontSize: 18 },
      };
    default:
      return {
        button: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
        text: { fontSize: 16 },
      };
  }
}

function getVariantStyles(variant: ButtonVariant, disabled: boolean) {
  switch (variant) {
    case 'primary':
      return {
        button: { ...Shadows.glow },
        textColor: Colors.text,
        spinnerColor: Colors.text,
      };
    case 'accent':
      return {
        button: {},
        textColor: Colors.text,
        spinnerColor: Colors.text,
      };
    case 'secondary':
      return {
        button: {
          backgroundColor: Colors.titanium,
          borderWidth: 1,
          borderColor: Colors.border,
        },
        textColor: Colors.text,
        spinnerColor: Colors.text,
      };
    case 'outline':
      return {
        button: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? Colors.border : Colors.primary,
        },
        textColor: disabled ? Colors.textTertiary : Colors.primary,
        spinnerColor: disabled ? Colors.textTertiary : Colors.primary,
      };
    case 'ghost':
      return {
        button: {
          backgroundColor: 'transparent',
        },
        textColor: disabled ? Colors.textTertiary : Colors.primary,
        spinnerColor: disabled ? Colors.textTertiary : Colors.primary,
      };
    default:
      return {
        button: {},
        textColor: Colors.text,
        spinnerColor: Colors.text,
      };
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  text: {
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
});
