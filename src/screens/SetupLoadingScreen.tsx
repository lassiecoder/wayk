/**
 * "Setting everything up for you" processing screen, shown right after
 * commitment is signed. Fully automatic — no back button, no user
 * choice — a single Animated.Value drives the percent counter, the
 * gradient progress bar (same red->orange->yellow->green stops as
 * SpeedGaugeScreen's gauge), and unlocks each checklist row in turn.
 * Once it reaches 100% it calls onComplete on its own, same auto-advance
 * convention as SkyOnboarding.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MISSIONS } from './MissionSelectScreen';
import { Colors } from '../theme/colors';

const { height: SCREEN_H } = Dimensions.get('window');

const DURATION_MS = 5200;
const COMPLETE_DELAY_MS = 650;

type StepState = 'pending' | 'current' | 'done';

type Step = {
  title: string;
  doneSubtitle: string;
};

function StepRow({
  title,
  subtitle,
  state,
}: {
  title: string;
  subtitle?: string;
  state: StepState;
}) {
  const revealAnim = useRef(
    new Animated.Value(state === 'pending' ? 0 : 1),
  ).current;
  const checkAnim = useRef(
    new Animated.Value(state === 'done' ? 1 : 0),
  ).current;
  const prevState = useRef(state);

  useEffect(() => {
    if (prevState.current === 'pending' && state !== 'pending') {
      Animated.timing(revealAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
    if (prevState.current !== 'done' && state === 'done') {
      checkAnim.setValue(0);
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.back(1.6)),
        useNativeDriver: false,
      }).start();
    }
    prevState.current = state;
  }, [state, revealAnim, checkAnim]);

  // Text stays visible at every state — only its color/weight animates from
  // a light "not yet reached" gray up to full black, so pending rows are
  // always readable rather than fading out to nothing.
  const titleColor = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.placeholder, Colors.black],
  });
  const circleBorderColor = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.successAlt],
  });
  const circleBg = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', Colors.successAlt],
  });

  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Animated.Text style={[styles.rowTitle, { color: titleColor }]}>
          {title}
        </Animated.Text>
        {state === 'done' && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      <Animated.View
        style={[
          styles.circle,
          { borderColor: circleBorderColor, backgroundColor: circleBg },
        ]}
      >
        <Animated.View
          style={{ opacity: checkAnim, transform: [{ scale: checkAnim }] }}
        >
          <Ionicons name="checkmark" size={14} color={Colors.white} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export default function SetupLoadingScreen({
  wakeMission,
  wakeTime,
  onComplete,
}: {
  wakeMission: string | null;
  wakeTime: string;
  onComplete: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [percent, setPercent] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  // Percent/headline slide in from the right; the progress bar, status
  // caption, and checklist card slide up from the bottom — a separate
  // mount-only timer from `progress`, which drives the fill/count instead.
  const revealAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealAnim]);

  const pctReveal = {
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

  const restReveal = {
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

  const missionTitle =
    MISSIONS.find(m => m.id === wakeMission)?.title ?? 'Mission';

  const STEPS: Step[] = [
    { title: 'Configuring your goals', doneSubtitle: 'Morning routine ready' },
    { title: 'Setting your mission', doneSubtitle: `${missionTitle} selected` },
    { title: 'Setting alarm tone', doneSubtitle: 'Sound locked in' },
    { title: 'Scheduling your alarm', doneSubtitle: `Set for ${wakeTime}` },
    { title: 'Setting up wake receipt', doneSubtitle: 'Sunrise ready' },
  ];

  useEffect(() => {
    const id = progress.addListener(({ value }) =>
      setPercent(Math.round(value)),
    );
    Animated.timing(progress, {
      toValue: 100,
      duration: DURATION_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setTimeout(onComplete, COMPLETE_DELAY_MS);
      }
    });
    return () => progress.removeListener(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isComplete = percent >= 100;
  const currentIndex = Math.min(
    STEPS.length - 1,
    Math.floor(percent / (100 / STEPS.length)),
  );

  const stepState = (i: number): StepState => {
    const threshold = ((i + 1) * 100) / STEPS.length;
    if (percent >= threshold) {
      return 'done';
    }
    return i === currentIndex ? 'current' : 'pending';
  };

  const fillWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const statusText = isComplete ? 'All done!' : `${STEPS[currentIndex].title}…`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.View style={pctReveal}>
          <Text style={styles.percent}>{percent}%</Text>
          <Text style={styles.headline}>
            {isComplete ? "You're all set" : 'Setting everything up for you'}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.trackWrap, restReveal]}>
          <View
            style={styles.progressTrack}
            onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}
          >
            <Animated.View style={[styles.progressFill, { width: fillWidth }]}>
              {trackWidth > 0 &&
                (isComplete ? (
                  <View style={styles.progressFillSolid} />
                ) : (
                  <Svg width={trackWidth} height={8}>
                    <Defs>
                      <LinearGradient id="setupGrad" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor={Colors.spectrumRed} />
                        <Stop offset="0.35" stopColor={Colors.spectrumOrange} />
                        <Stop offset="0.65" stopColor={Colors.spectrumYellow} />
                        <Stop offset="1" stopColor={Colors.success} />
                      </LinearGradient>
                    </Defs>
                    <Rect width={trackWidth} height={8} fill="url(#setupGrad)" />
                  </Svg>
                ))}
            </Animated.View>
          </View>

          <Text style={styles.status}>{statusText}</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.card, restReveal]}>
        {STEPS.map((step, i) => (
          <View
            key={step.title}
            style={i < STEPS.length - 1 ? styles.rowDivider : undefined}
          >
            <StepRow
              title={step.title}
              subtitle={step.doneSubtitle}
              state={stepState(i)}
            />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  content: {
    marginTop: SCREEN_H * 0.22,
    alignItems: 'center',
  },
  trackWrap: {
    width: '100%',
  },
  percent: {
    fontSize: 60,
    fontWeight: '800',
    color: Colors.black,
    textAlign: 'center',
  },
  headline: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
    marginTop: 4,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginTop: 28,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFillSolid: {
    flex: 1,
    backgroundColor: Colors.success,
  },
  status: {
    width: '100%',
    fontSize: 14,
    color: Colors.mutedText,
    marginTop: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginTop: 32,
    overflow: 'hidden',
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowSubtitle: {
    fontSize: 13,
    color: Colors.mutedText,
    marginTop: 2,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
