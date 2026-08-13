/**
 * Second onboarding screen: value-prop headline, App Store rating badge,
 * and the "Build my plan" CTA. Triggers the native App Tracking
 * Transparency prompt shortly after it appears.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { requestTrackingPermission } from 'react-native-tracking-transparency';
import LanguageSheet from './LanguageSheet';

const { width: SCREEN_W } = Dimensions.get('window');
const RATING_IMAGE_ASPECT = 701 / 356;
const RATING_IMAGE_WIDTH = SCREEN_W * 0.78;

const CTA_WIDTH = SCREEN_W - 48;
const SHINE_WIDTH = CTA_WIDTH * 0.55;
const SHINE_HEIGHT = 140;

function CtaShine() {
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shineAnim]);

  const translateX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SHINE_WIDTH, CTA_WIDTH],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.shineBand,
        { transform: [{ translateX }, { rotate: '14deg' }] },
      ]}>
      <Svg width={SHINE_WIDTH} height={SHINE_HEIGHT}>
        <Defs>
          <LinearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
            <Stop offset="0.35" stopColor="#FFFFFF" stopOpacity={0.05} />
            <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.14} />
            <Stop offset="0.65" stopColor="#FFFFFF" stopOpacity={0.05} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width={SHINE_WIDTH} height={SHINE_HEIGHT} fill="url(#shine)" />
      </Svg>
    </Animated.View>
  );
}

export default function PlanIntroScreen({ onContinue }: { onContinue: () => void }) {
  const insets = useSafeAreaInsets();
  const introAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    Animated.timing(introAnim, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(ctaAnim, {
      toValue: 1,
      duration: 650,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [introAnim, ctaAnim]);

  useEffect(() => {
    const id = setTimeout(() => {
      requestTrackingPermission().catch(() => {});
    }, 700);
    return () => clearTimeout(id);
  }, []);

  const introStyle = {
    opacity: introAnim,
    transform: [
      {
        translateY: introAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const ctaStyle = {
    opacity: ctaAnim,
    transform: [
      {
        translateY: ctaAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <TouchableOpacity style={styles.flagBadge} onPress={() => setLangOpen(true)}>
        <Text style={styles.flagEmoji}>🇺🇸</Text>
      </TouchableOpacity>

      <Animated.View style={introStyle}>
        <Text style={styles.headline}>
          {'Stop hitting snooze.\nStart winning\nmornings.'}
        </Text>
        <Text style={styles.subtext}>One alarm. One mission. You're up.</Text>
      </Animated.View>

      <View style={styles.ratingBlock}>
        <Image
          source={require('./assets/images/app-store-rating.webp')}
          style={styles.ratingImage}
          resizeMode="contain"
        />
        <Text style={styles.ratingValue}>4.8 out of 5</Text>
        <Text style={styles.ratingCount}>35,000+ App Store ratings</Text>
      </View>

      <View style={styles.bottom}>
        <Animated.View style={[styles.ctaWrap, ctaStyle]}>
          <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={onContinue}>
            <Text style={styles.ctaText}>Build my plan</Text>
            <Text style={styles.ctaArrow}>{'  →'}</Text>
            <CtaShine />
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.footerLineJionIn}>
          Join 500k+ people waking up with Wayk
        </Text>
        <Text style={styles.footerLine}>
          Already have an account?{' '}
          <Text style={styles.footerLink}>Sign in</Text>
        </Text>
        <Text style={styles.footerLine}>
          Purchased on the web?{' '}
          <Text style={styles.footerLink}>Activate your account</Text>
        </Text>
      </View>

      <LanguageSheet visible={langOpen} onClose={() => setLangOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F8',
    paddingHorizontal: 24,
  },
  flagBadge: {
    alignSelf: 'flex-end',
    marginTop: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 20,
  },
  headline: {
    fontSize: 34,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 39,
    marginTop: 16,
  },
  subtext: {
    fontSize: 17,
    color: '#78787A',
    marginTop: 12,
  },
  ratingBlock: {
    alignItems: 'center',
    marginTop: SCREEN_W * 0.15,
  },
  ratingImage: {
    width: RATING_IMAGE_WIDTH,
    height: RATING_IMAGE_WIDTH / RATING_IMAGE_ASPECT,
  },
  ratingValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 0,
  },
  ratingCount: {
    fontSize: 14,
    color: '#8A8A8E',
    marginTop: 8,
  },
  bottom: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 40,
    alignItems: 'center',
  },
  ctaWrap: {
    width: '100%',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 32,
    paddingVertical: 18,
    width: '100%',
    overflow: 'hidden',
  },
  shineBand: {
    position: 'absolute',
    top: -(SHINE_HEIGHT - 58) / 2,
    left: 0,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  ctaArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footerLineJionIn: {
    fontSize: 14,
    color: '#8A8A8E',
    marginVertical: 18,
    fontWeight: '700',
  },
  footerLine: {
    fontSize: 14,
    color: '#8A8A8E',
    marginTop: 8,
  },
  footerLink: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
});
