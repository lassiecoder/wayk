/**
 * "Set up your push-ups / squats" screen — shown after MissionSelectScreen
 * only when the chosen mission is an exercise. Time mode steps seconds by
 * 5; Reps mode steps rep count by 5. Continue has no gating: a value is
 * always selected by default (same convention as WakeTimeScreen).
 */
import React, { useEffect, useRef, useState } from 'react';
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

const TIME_STEP = 5;
const TIME_MIN = 5;
const TIME_MAX = 120;
const REPS_STEP = 5;
const REPS_MIN = 5;
const REPS_MAX = 100;

type Mode = 'time' | 'reps';

export default function ExerciseSetupScreen({
  exerciseLabel,
  progress,
  onBack,
  onContinue,
}: {
  exerciseLabel: string;
  progress: number;
  onBack: () => void;
  onContinue: (config: { mode: Mode; value: number }) => void;
}) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('time');
  const [seconds, setSeconds] = useState(15);
  const [reps, setReps] = useState(10);

  const value = mode === 'time' ? seconds : reps;

  const decrement = () => {
    if (mode === 'time') {
      setSeconds(s => Math.max(TIME_MIN, s - TIME_STEP));
    } else {
      setReps(r => Math.max(REPS_MIN, r - REPS_STEP));
    }
  };

  const increment = () => {
    if (mode === 'time') {
      setSeconds(s => Math.min(TIME_MAX, s + TIME_STEP));
    } else {
      setReps(r => Math.min(REPS_MAX, r + REPS_STEP));
    }
  };

  // Title slides in from the right; the tabs/stepper card slides up from
  // the bottom, both driven by the same timer, same pattern used across
  // the other setup/question screens.
  const revealAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealAnim]);

  const titleReveal = {
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

  const cardReveal = {
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

      <Animated.View style={titleReveal}>
        <Text style={styles.title}>Set up your {exerciseLabel}</Text>
        <Text style={styles.subtitle}>You can change this anytime in settings.</Text>
      </Animated.View>

      <Animated.View style={cardReveal}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'time' && styles.tabActive]}
            activeOpacity={0.8}
            onPress={() => setMode('time')}
          >
            <Text style={[styles.tabText, mode === 'time' && styles.tabTextActive]}>
              Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'reps' && styles.tabActive]}
            activeOpacity={0.8}
            onPress={() => setMode('reps')}
          >
            <Text style={[styles.tabText, mode === 'reps' && styles.tabTextActive]}>
              Reps
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              activeOpacity={0.8}
              onPress={decrement}
            >
              <Text style={styles.stepperIcon}>−</Text>
            </TouchableOpacity>
            <View style={styles.stepperValueWrap}>
              <Text style={styles.stepperValue}>{value}</Text>
              <Text style={styles.stepperUnit}>{mode === 'time' ? 'seconds' : 'reps'}</Text>
            </View>
            <TouchableOpacity
              style={styles.stepperBtn}
              activeOpacity={0.8}
              onPress={increment}
            >
              <Text style={styles.stepperIcon}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.description}>
            {mode === 'time'
              ? `Do ${exerciseLabel} for ${value} seconds to turn off your alarm.`
              : `Do ${value} ${exerciseLabel} to turn off your alarm.`}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.continueBtn}
          activeOpacity={0.85}
          onPress={() => onContinue({ mode, value })}
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.black,
    lineHeight: 34,
    marginTop: 28,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.mutedText,
    marginTop: 8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 20,
    padding: 4,
    marginTop: 28,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 16,
  },
  tabActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.mutedText,
  },
  tabTextActive: {
    color: Colors.black,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginTop: 20,
    alignItems: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginTop: -2,
  },
  stepperValueWrap: {
    alignItems: 'center',
    marginHorizontal: 32,
    minWidth: 80,
  },
  stepperValue: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.black,
  },
  stepperUnit: {
    fontSize: 15,
    color: Colors.mutedText,
    marginTop: 2,
  },
  description: {
    fontSize: 15,
    color: Colors.mutedText,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 21,
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
