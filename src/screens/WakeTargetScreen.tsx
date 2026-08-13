/**
 * Confirmation screen shown right after WakeGoalScreen: restates the
 * chosen wake-up time as a target, alongside the plan's adjustment pace.
 * Same progress value as WakeGoalScreen since this doesn't ask anything
 * new — it's a summary of what was just picked, not a further step.
 */
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

export default function WakeTargetScreen({
  time,
  progress,
  onBack,
  onContinue,
}: {
  time: string;
  progress: number;
  onBack: () => void;
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();

  // Same reveal used for the question title in QuestionnaireScreen: fade in
  // while sliding up from 16px, once on mount.
  const revealAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealAnim]);

  const centerReveal = {
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

      <Animated.View style={[styles.center, centerReveal]}>
        <Text style={styles.title}>Waking up at {time} is your target.</Text>
        <Text style={styles.pace}>+15 minutes every morning</Text>
        <Text style={styles.paceSub}>+7 hours this month</Text>
      </Animated.View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.continueBtn}
          activeOpacity={0.85}
          onPress={onContinue}
        >
          <Text style={styles.continueText}>Continue</Text>
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
  center: {
    // flex: 1,
    marginTop: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.black,
    lineHeight: 40,
    textAlign: 'center',
  },
  pace: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2FAE60',
    marginTop: 24,
    textAlign: 'center',
  },
  paceSub: {
    fontSize: 16,
    color: Colors.mutedText,
    marginTop: 8,
    textAlign: 'center',
  },
  bottom: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 40,
    alignItems: 'center',
  },
  continueBtn: {
    width: '100%',
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
});
