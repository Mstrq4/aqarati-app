import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../src/context/AppContext';

export default function SplashScreen() {
  const router = useRouter();
  const { t, colors } = useApp();

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const dot1Opacity = useRef(new Animated.Value(0)).current;
  const dot2Opacity = useRef(new Animated.Value(0)).current;
  const dot3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Text fade in
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Dots animation
        const animateDot = (dot: Animated.Value, delay: number) => {
          setTimeout(() => {
            Animated.loop(
              Animated.sequence([
                Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
              ])
            ).start();
          }, delay);
        };
        animateDot(dot1Opacity, 0);
        animateDot(dot2Opacity, 200);
        animateDot(dot3Opacity, 400);
      });
    });

    // Auto navigate to tabs after 2.5s
    const timeout = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      {/* Background circles */}
      <View style={[styles.circle1, { backgroundColor: colors.primaryLight }]} />
      <View style={[styles.circle2, { backgroundColor: colors.primaryDark }]} />

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoCircle,
            { transform: [{ scale: logoScale }], opacity: logoOpacity },
          ]}
        >
          <Ionicons name="home" size={52} color={colors.primary} />
        </Animated.View>

        {/* App Name */}
        <Animated.View
          style={{ opacity: textOpacity, transform: [{ translateY: textTranslateY }] }}
        >
          <Text style={styles.appName}>{t('appName')}</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={{ opacity: textOpacity, transform: [{ translateY: textTranslateY }] }}
        >
          <Text style={styles.tagline}>{t('appTagline')}</Text>
        </Animated.View>

        {/* Loading dots */}
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  circle1: {
    position: 'absolute',
    top: -150,
    right: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    opacity: 0.4,
  },
  circle2: {
    position: 'absolute',
    bottom: -200,
    left: -150,
    width: 600,
    height: 600,
    borderRadius: 300,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    letterSpacing: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F0D060',
  },
});
