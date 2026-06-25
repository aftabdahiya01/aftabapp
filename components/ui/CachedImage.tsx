import React, { useState, useEffect, useRef, memo } from 'react';
import {
  Image,
  View,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ImageResizeMode,
  DimensionValue,
} from 'react-native';
import { Colors } from '@/constants/theme';

interface CachedImageProps {
  uri: string;
  style?: any;
  resizeMode?: ImageResizeMode;
  placeholder?: React.ReactNode;
  fadeInDuration?: number;
  threshold?: number;
}

// Simple in-memory cache for loaded images
const imageCache = new Map<string, boolean>();

// Preload an image to cache
export const preloadImage = (uri: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (imageCache.has(uri)) {
      resolve(true);
      return;
    }

    Image.prefetch(uri)
      .then(() => {
        imageCache.set(uri, true);
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
};

// Preload multiple images
export const preloadImages = (uris: string[]): Promise<void[]> => {
  return Promise.all(uris.map(uri => preloadImage(uri)));
};

const CachedImageComponent: React.FC<CachedImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  placeholder,
  fadeInDuration = 300,
  threshold = 100,
}) => {
  const [loaded, setLoaded] = useState(() => imageCache.has(uri));
  const [error, setError] = useState(false);
  const opacity = useRef(new Animated.Value(loaded ? 1 : 0)).current;
  const loadingRef = useRef(false);

  useEffect(() => {
    // Reset state when URI changes
    if (loadingRef.current) return;

    const isCached = imageCache.get(uri);
    if (isCached && !loaded) {
      setLoaded(true);
      opacity.setValue(1);
      return;
    }

    loadingRef.current = true;

    // Prefetch the image
    Image.prefetch(uri)
      .then(() => {
        imageCache.set(uri, true);
        setLoaded(true);
        loadingRef.current = false;
      })
      .catch(() => {
        setError(true);
        loadingRef.current = false;
      });
  }, [uri]);

  useEffect(() => {
    if (loaded && opacity._value === 0) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: fadeInDuration,
        useNativeDriver: true,
      }).start();
    }
  }, [loaded, fadeInDuration]);

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/400x300/1A1A1A/737373?text=No+Image' }}
            style={styles.errorImage}
            resizeMode={resizeMode}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {!loaded && (placeholder || (
        <View style={styles.placeholder}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ))}
      <Animated.Image
        source={{ uri }}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity,
          },
        ]}
        resizeMode={resizeMode}
        onLoad={() => {
          if (!loaded) {
            imageCache.set(uri, true);
            setLoaded(true);
          }
        }}
        onError={() => setError(true)}
      />
    </View>
  );
};

export const CachedImage = memo(CachedImageComponent);

// Image carousel with preloading
interface ImageCarouselProps {
  images: string[];
  index: number;
  style?: any;
  resizeMode?: ImageResizeMode;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = memo(({ images, index, style, resizeMode = 'cover' }) => {
  const [currentIndex, setCurrentIndex] = useState(index);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Preload adjacent images
    const preloadNext = () => {
      const nextIndex = (currentIndex + 1) % images.length;
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      preloadImage(images[nextIndex]);
      preloadImage(images[prevIndex]);
    };
    preloadNext();
  }, [currentIndex, images]);

  useEffect(() => {
    // Fade transition on index change
    if (index !== currentIndex) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentIndex(index);
    }
  }, [index, currentIndex, opacity]);

  return (
    <Animated.View style={[style, { opacity }]}>
      <CachedImage
        uri={images[currentIndex] || images[0]}
        style={style}
        resizeMode={resizeMode}
        fadeInDuration={200}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  errorImage: {
    width: '100%',
    height: '100%',
  },
});
