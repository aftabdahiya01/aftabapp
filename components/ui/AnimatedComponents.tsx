import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withFadeIn,
  withFadeOut,
  interpolate,
  FadeIn,
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  SlideInUp,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  ZoomOut,
  BounceIn,
  BounceInDown,
  BounceInLeft,
  BounceInRight,
  BounceInUp,
  Layout,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

// Fade In View
interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: any;
}

export function FadeInView({ children, delay = 0, duration = 400, style }: FadeInViewProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// Slide In View
interface SlideInViewProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  distance?: number;
  style?: any;
}

export function SlideInView({ children, direction = 'up', delay = 0, distance = 50, style }: SlideInViewProps) {
  const translateValue = useSharedValue(distance);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateValue.value = withDelay(delay, withSpring(0, { damping: 15 }));
  }, [delay, distance]);

  const animatedStyle = useAnimatedStyle(() => {
    const transforms: any[] = [];

    switch (direction) {
      case 'up':
        transforms.push({ translateY: translateValue.value });
        break;
      case 'down':
        transforms.push({ translateY: -translateValue.value });
        break;
      case 'left':
        transforms.push({ translateX: translateValue.value });
        break;
      case 'right':
        transforms.push({ translateX: -translateValue.value });
        break;
    }

    return {
      opacity: opacity.value,
      transform: transforms,
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// Scale In View (for cards, buttons, etc.)
interface ScaleInViewProps {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}

export function ScaleInView({ children, delay = 0, style }: ScaleInViewProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// Stagger List Animation
interface StaggerListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  direction?: 'up' | 'down';
}

export function StaggerList({ children, staggerDelay = 100, direction = 'up' }: StaggerListProps) {
  return (
    <>
      {children.map((child, index) => (
        <SlideInView
          key={index}
          direction={direction}
          delay={index * staggerDelay}
          distance={30}
        >
          {child}
        </SlideInView>
      ))}
    </>
  );
}

// Pulse Animation (for loading states, notifications)
interface PulseViewProps {
  children: React.ReactNode;
  style?: any;
}

export function PulseView({ children, style }: PulseViewProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.05, { duration: 500 }),
      withTiming(1, { duration: 500 })
    );
    const interval = setInterval(() => {
      scale.value = withSequence(
        withTiming(1.05, { duration: 500 }),
        withTiming(1, { duration: 500 })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// Shimmer Loading Effect
interface ShimmerViewProps {
  width: number;
  height: number;
  borderRadius?: number;
  style?: any;
}

export function ShimmerView({ width: shimWidth, height, borderRadius = 8, style }: ShimmerViewProps) {
  const shimmerPosition = useSharedValue(-shimWidth);

  useEffect(() => {
    shimmerPosition.value = withSequence(
      withTiming(shimWidth, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
    );
    const interval = setInterval(() => {
      shimmerPosition.value = -shimWidth;
      shimmerPosition.value = withTiming(shimWidth, { duration: 1000, easing: Easing.inOut(Easing.ease) });
    }, 1200);
    return () => clearInterval(interval);
  }, [shimWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value }],
  }));

  return (
    <View style={[{ width: shimWidth, height, borderRadius, backgroundColor: Colors.titanium, overflow: 'hidden' }, style]}>
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

// Card with Hover/Press Effect
interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export function AnimatedCard({ children, onPress, style }: AnimatedCardProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Counter Animation
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  style?: any;
}

export function AnimatedNumber({ value, duration = 1000, style }: AnimatedNumberProps) {
  const displayValue = useSharedValue(0);

  useEffect(() => {
    displayValue.value = withTiming(value, { duration });
  }, [value, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    // For now just render the value - full number animation requires more complex handling
  }));

  return (
    <Animated.Text style={style}>
      {value.toLocaleString()}
    </Animated.Text>
  );
}

// Skeleton Loading Cards
interface SkeletonCardProps {
  style?: any;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  return (
    <View style={[styles.skeletonCard, style]}>
      <ShimmerView width="100%" height={140} borderRadius={BorderRadius.lg} />
      <View style={styles.skeletonContent}>
        <ShimmerView width="60%" height={14} style={{ marginTop: Spacing.sm }} />
        <ShimmerView width="80%" height={18} style={{ marginTop: Spacing.xs }} />
        <ShimmerView width="40%" height={14} style={{ marginTop: Spacing.sm }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  skeletonContent: {
    padding: Spacing.lg,
  },
});
