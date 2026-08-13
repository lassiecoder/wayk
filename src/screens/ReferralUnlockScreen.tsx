/**
 * "Unlock an exclusive alarm sound" referral gate, shown after setup
 * finishes and before the Morning Plan recap. "Text One Friend" opens
 * the native share sheet (no real referral/reward backend exists, same
 * mock convention as AlarmSoundScreen's unwired preview buttons);
 * both it and "Skip" lead on to the same destination.
 */
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../theme/colors';

const ICON_SIZE = 160;

function LockIcon() {
  const cx = ICON_SIZE / 2;
  const cy = ICON_SIZE / 2;
  const rings = [70, 56, 42];

  return (
    <View style={styles.iconWrap}>
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox={`0 0 ${ICON_SIZE} ${ICON_SIZE}`}>
        <Defs>
          <LinearGradient id="lockGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F2A67E" />
            <Stop offset="1" stopColor="#C96D6D" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={ICON_SIZE} height={ICON_SIZE} rx={36} fill="url(#lockGrad)" />
        {rings.map(r => (
          <Circle
            key={r}
            cx={cx}
            cy={cy}
            r={r}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1.5}
            fill="none"
          />
        ))}
        <Circle cx={cx} cy={cy} r={30} fill="#F5ECDD" />
      </Svg>
      <View style={styles.lockGlyph} pointerEvents="none">
        <Ionicons name="lock-closed" size={26} color={Colors.lockBrown} />
      </View>
    </View>
  );
}

export default function ReferralUnlockScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();

  // Icon slides in from the right; the title/body slide up from the
  // bottom, both driven by the same timer, same pattern used across the
  // other setup/insight screens.
  const revealAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealAnim]);

  const iconReveal = {
    opacity: revealAnim,
    transform: [
      {
        translateX: revealAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
    ],
  };

  const textReveal = {
    opacity: revealAnim,
    transform: [
      {
        translateY: revealAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  const handleShare = () => {
    Share.share({
      message: "I've been using Wayk to actually wake up on time — you should try it too.",
    })
      .catch(() => {})
      .finally(onContinue);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Animated.View style={iconReveal}>
          <LockIcon />
        </Animated.View>

        <Animated.View style={textReveal}>
          <Text style={styles.title}>Unlock an exclusive alarm sound</Text>
          <Text style={styles.body}>
            Know someone who sleeps through their alarms? Refer a friend and
            this alarm sound is yours.
          </Text>
          <Text style={styles.bodySecondary}>
            We'll write the text for you. Just pick one friend. No spam, no
            catch.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85} onPress={handleShare}>
          <Text style={styles.shareText}>Text One Friend</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={onContinue}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: Colors.subtleText,
    marginRight: 2,
  },
  content: {
    alignItems: 'center',
    marginTop: 48,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockGlyph: {
    position: 'absolute',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 34,
    marginTop: 28,
    marginHorizontal: 12,
  },
  body: {
    fontSize: 16,
    color: Colors.mutedText,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 20,
    marginHorizontal: 8,
  },
  bodySecondary: {
    fontSize: 14,
    color: Colors.tertiaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 20,
    marginHorizontal: 8,
  },
  bottom: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 40,
    alignItems: 'center',
  },
  shareBtn: {
    width: '100%',
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  shareText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  skipText: {
    fontSize: 15,
    color: Colors.mutedText,
    marginTop: 18,
  },
});
