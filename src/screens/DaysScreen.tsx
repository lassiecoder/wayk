/**
 * "Which days should Wayk ring?" screen — multi-select day-of-week
 * toggle list, shown after SetAlarmScreen. Title slides in right-to-left;
 * each day row fades/slides up from the bottom, staggered by index (same
 * revealAnim technique as MissionSelectScreen). Continue has no gating: a
 * default selection is always applied.
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
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../theme/colors';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DEFAULT_SELECTED = new Set(['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday']);

export default function DaysScreen({
  progress,
  onBack,
  onContinue,
}: {
  progress: number;
  onBack: () => void;
  onContinue: (days: string[]) => void;
}) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<string>>(new Set(DEFAULT_SELECTED));

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

  const rowReveal = (i: number, count: number) => {
    const start = Math.min(0.15 + i * (0.5 / Math.max(count, 1)), 0.6);
    const end = Math.min(start + 0.45, 1);
    return {
      opacity: revealAnim.interpolate({
        inputRange: [start, end],
        outputRange: [0, 1],
        extrapolate: 'clamp' as const,
      }),
      transform: [
        {
          translateY: revealAnim.interpolate({
            inputRange: [start, end],
            outputRange: [24, 0],
            extrapolate: 'clamp' as const,
          }),
        },
      ],
    };
  };

  const toggleDay = (day: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
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
        <Text style={styles.title}>Which days should Wayk ring?</Text>
        <Text style={styles.subtitle}>Pick the days you want to lock in.</Text>
      </Animated.View>

      <View style={styles.list}>
        {DAYS.map((day, i) => {
          const isSelected = selected.has(day);
          return (
            <Animated.View key={day} style={rowReveal(i, DAYS.length)}>
              <TouchableOpacity
                style={[styles.row, isSelected && styles.rowSelected]}
                activeOpacity={0.8}
                onPress={() => toggleDay(day)}
              >
                <Text style={styles.rowText}>{day}</Text>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.continueBtn}
          activeOpacity={0.85}
          onPress={() => onContinue(DAYS.filter(d => selected.has(d)))}
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
  list: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  rowSelected: {
    borderColor: Colors.black,
    backgroundColor: Colors.white,
  },
  rowText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    borderColor: Colors.black,
    backgroundColor: Colors.black,
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
