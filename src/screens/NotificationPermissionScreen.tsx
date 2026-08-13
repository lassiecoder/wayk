/**
 * "Never miss your alarm" notification-permission prompt, shown after
 * SpeedGaugeScreen. Enable/Not now both just advance the flow — there's
 * no real push-notification registration wired up here, matching the
 * rest of this onboarding mockup (e.g. AlarmSoundScreen doesn't actually
 * play audio either).
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../theme/colors';

export default function NotificationPermissionScreen({
  progress,
  onBack,
  onContinue,
}: {
  progress: number;
  onBack: () => void;
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();

  // Bell icon slides in from the right; the title/body slide up from the
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
          outputRange: [16, 0],
        }),
      },
    ],
  };

  const progressWidth = `${Math.max(progress, 0.04) * 100}%`;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Animated.View style={iconReveal}>
          <View style={styles.glowOuter}>
            <View style={styles.glowInner}>
              <View style={styles.bellCircle}>
                <Ionicons name="notifications" size={34} color={Colors.white} />
              </View>
            </View>
          </View>
        </Animated.View>
        <Animated.View style={textReveal}>
          <Text style={styles.title}>Never miss your alarm</Text>
          <Text style={styles.body}>
            Alarm alerts and reminders that keep your plan on track. Turn
            them off anytime.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.enableBtn}
          activeOpacity={0.85}
          onPress={onContinue}
        >
          <Text style={styles.enableText}>Enable</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={onContinue}>
          <Text style={styles.notNowText}>Not now</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginLeft: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 140,
  },
  glowOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(231,168,69,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowInner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(231,168,69,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.black,
    textAlign: 'center',
    marginTop: 28,
  },
  body: {
    fontSize: 15,
    color: Colors.mutedText,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
    marginHorizontal: 8,
  },
  bottom: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 40,
    alignItems: 'center',
  },
  enableBtn: {
    width: '100%',
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  enableText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  notNowText: {
    fontSize: 15,
    color: Colors.mutedText,
    marginTop: 18,
  },
});
