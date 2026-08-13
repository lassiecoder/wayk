/**
 * "Set your first Wayk time" screen — the final wheel-picker step that
 * commits the actual alarm. Same hand-rolled wheel picker as
 * WakeTimeScreen/WakeGoalScreen; subtitle and CTA text update live with
 * the picked time. Title block slides in right-to-left on mount, same
 * revealAnim technique as MissionSelectScreen's title.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RollingText from '../components/RollingText';
import { Colors } from '../theme/colors';

const ITEM_H = 44;
const VISIBLE_ROWS = 5;
const WHEEL_H = ITEM_H * VISIBLE_ROWS;
const PAD = (ITEM_H * (VISIBLE_ROWS - 1)) / 2;

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, '0'),
);
const PERIODS = ['AM', 'PM'];

const DEFAULT_HOUR_INDEX = 6; // "7"
const DEFAULT_MINUTE_INDEX = 30; // "30"
const DEFAULT_PERIOD_INDEX = 0; // "AM"

function WheelColumn({
  items,
  initialIndex,
  onChange,
  width,
}: {
  items: string[];
  initialIndex: number;
  onChange: (index: number) => void;
  width: number;
}) {
  const scrollY = useRef(new Animated.Value(initialIndex * ITEM_H)).current;

  const snapToNearest = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.max(0, Math.min(items.length - 1, Math.round(y / ITEM_H)));
    onChange(idx);
  };

  return (
    <Animated.ScrollView
      style={{ height: WHEEL_H, width }}
      contentContainerStyle={{ paddingVertical: PAD }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_H}
      decelerationRate="fast"
      contentOffset={{ x: 0, y: initialIndex * ITEM_H }}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true },
      )}
      onMomentumScrollEnd={snapToNearest}
      onScrollEndDrag={snapToNearest}
    >
      {items.map((label, i) => {
        const inputRange = [
          (i - 2) * ITEM_H,
          (i - 1) * ITEM_H,
          i * ITEM_H,
          (i + 1) * ITEM_H,
          (i + 2) * ITEM_H,
        ];
        const opacity = scrollY.interpolate({
          inputRange,
          outputRange: [0.2, 0.4, 1, 0.4, 0.2],
          extrapolate: 'clamp',
        });
        return (
          <View key={label + i} style={styles.wheelRow}>
            <Animated.Text style={[styles.wheelItem, { opacity }]}>
              {label}
            </Animated.Text>
          </View>
        );
      })}
    </Animated.ScrollView>
  );
}

export default function SetAlarmScreen({
  progress,
  onBack,
  onContinue,
}: {
  progress: number;
  onBack: () => void;
  onContinue: (time: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [hourIndex, setHourIndex] = useState(DEFAULT_HOUR_INDEX);
  const [minuteIndex, setMinuteIndex] = useState(DEFAULT_MINUTE_INDEX);
  const [periodIndex, setPeriodIndex] = useState(DEFAULT_PERIOD_INDEX);

  // Title block slides in from the right, same technique as
  // MissionSelectScreen's title reveal.
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

  const pickerReveal = {
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

  const selectedTime = `${HOURS[hourIndex]}:${MINUTES[minuteIndex]} ${PERIODS[periodIndex]}`;
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
        <Text style={styles.title}>Set your first Wayk time</Text>
        <Text style={styles.subtitle}>
          We'll wake you at {selectedTime} with your mission.
        </Text>
      </Animated.View>

      <Animated.View style={pickerReveal}>
        <View style={styles.displayRow}>
          <RollingText text={selectedTime} style={styles.display} height={54} />
        </View>

        <View style={styles.wheelWrap}>
          <View style={styles.highlightBand} pointerEvents="none" />
          <WheelColumn
            items={HOURS}
            initialIndex={DEFAULT_HOUR_INDEX}
            onChange={setHourIndex}
            width={64}
          />
          <WheelColumn
            items={MINUTES}
            initialIndex={DEFAULT_MINUTE_INDEX}
            onChange={setMinuteIndex}
            width={64}
          />
          <WheelColumn
            items={PERIODS}
            initialIndex={DEFAULT_PERIOD_INDEX}
            onChange={setPeriodIndex}
            width={80}
          />
        </View>
      </Animated.View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.continueBtn}
          activeOpacity={0.85}
          onPress={() => onContinue(selectedTime)}
        >
          <Text style={styles.continueText}>Set alarm for {selectedTime}</Text>
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
  displayRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 56,
  },
  display: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.black,
    textAlign: 'center',
  },
  wheelWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  highlightBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: PAD,
    height: ITEM_H,
    backgroundColor: 'rgba(0,0,0,0.045)',
    borderRadius: 14,
  },
  wheelRow: {
    height: ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItem: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
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
