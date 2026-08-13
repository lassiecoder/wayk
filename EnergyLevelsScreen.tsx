/**
 * "Wayk gets you out of bed" insight screen. The two chart lines draw
 * themselves in using react-native-reanimated's useAnimatedProps driving
 * an SVG Path's strokeDashoffset (the standard SVG line-draw technique).
 * The Continue button unlocks once both lines finish drawing.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 48;
const CHART_W = CARD_W - 40;
const CHART_H = 190;

const WAYK_PATH = `M0,${CHART_H} C${CHART_W * 0.32},${CHART_H} ${
  CHART_W * 0.6
},0 ${CHART_W},0`;

const SNOOZE_PATH = `M0,${CHART_H}
  Q${CHART_W * 0.06},${CHART_H * 0.05} ${CHART_W * 0.13},${CHART_H * 0.3}
  Q${CHART_W * 0.2},${CHART_H * 0.55} ${CHART_W * 0.27},${CHART_H * 0.88}
  Q${CHART_W * 0.33},${CHART_H * 0.65} ${CHART_W * 0.4},${CHART_H * 0.55}
  Q${CHART_W * 0.45},${CHART_H * 0.75} ${CHART_W * 0.5},${CHART_H * 0.9}
  Q${CHART_W * 0.56},${CHART_H * 0.7} ${CHART_W * 0.62},${CHART_H * 0.78}
  Q${CHART_W * 0.67},${CHART_H * 0.9} ${CHART_W * 0.72},${CHART_H * 0.9}
  Q${CHART_W * 0.85},${CHART_H * 0.6} ${CHART_W},${CHART_H * 0.15}`;

const WAYK_END = { x: CHART_W, y: 0 };
const SNOOZE_END = { x: CHART_W, y: CHART_H * 0.15 };

export default function EnergyLevelsScreen({
  progress,
  onBack,
  onContinue,
}: {
  progress: number;
  onBack: () => void;
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();
  const wayxPathRef = useRef<any>(null);
  const snoozePathRef = useRef<any>(null);
  const [lengths, setLengths] = useState<{
    wayk: number;
    snooze: number;
  } | null>(null);
  const [connected, setConnected] = useState(false);

  const draw = useSharedValue(0);

  // Title slides in from the right, same reveal used on the question
  // screens (QuestionnaireScreen, MissionSelectScreen, etc.), just driven
  // by reanimated since that's what this screen already uses for its chart.
  const titleReveal = useSharedValue(0);
  useEffect(() => {
    titleReveal.value = withTiming(1, {
      duration: 550,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleReveal.value,
    transform: [{ translateX: (1 - titleReveal.value) * 40 }],
  }));

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const wayk = wayxPathRef.current?.getTotalLength?.() ?? CHART_W * 1.15;
      const snooze = snoozePathRef.current?.getTotalLength?.() ?? CHART_W * 1.9;
      setLengths({ wayk, snooze });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!lengths) {
      return;
    }
    draw.value = withDelay(
      300,
      withTiming(
        1,
        { duration: 2000, easing: Easing.out(Easing.cubic) },
        finished => {
          if (finished) {
            runOnJS(setConnected)(true);
          }
        },
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lengths]);

  const wayxProps = useAnimatedProps(() => {
    const len = lengths?.wayk ?? CHART_W * 1.15;
    return {
      strokeDasharray: [len, len],
      strokeDashoffset: len * (1 - draw.value),
    };
  });

  const snoozeProps = useAnimatedProps(() => {
    const len = lengths?.snooze ?? CHART_W * 1.9;
    return {
      strokeDasharray: [len, len],
      strokeDashoffset: len * (1 - draw.value),
    };
  });

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

      <Animated.Text style={[styles.title, titleStyle]}>
        Wayk gets you out of bed
      </Animated.Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Morning Energy Levels</Text>

        <View style={styles.chartWrap}>
          <View style={[styles.badge, connected && styles.badgeActive]}>
            <Text style={styles.badgeIcon}>⚡</Text>
            <Text
              style={[styles.badgeText, connected && styles.badgeTextActive]}
            >
              Wayk Protocol
            </Text>
          </View>

          <Svg width={CHART_W} height={CHART_H} style={styles.svg}>
            <Path
              ref={snoozePathRef}
              d={SNOOZE_PATH}
              stroke="#E8899A"
              strokeWidth={3}
              fill="none"
              opacity={0}
            />
            <Path
              ref={wayxPathRef}
              d={WAYK_PATH}
              stroke="#000000"
              strokeWidth={3.5}
              fill="none"
              opacity={0}
            />
            {lengths && (
              <>
                <AnimatedPath
                  d={SNOOZE_PATH}
                  stroke="#E8899A"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  animatedProps={snoozeProps}
                />
                <AnimatedPath
                  d={WAYK_PATH}
                  stroke="#000000"
                  strokeWidth={3.5}
                  fill="none"
                  strokeLinecap="round"
                  animatedProps={wayxProps}
                />
              </>
            )}
          </Svg>

          {connected && (
            <>
              <View
                style={[
                  styles.dotWayk,
                  { left: WAYK_END.x - 6, top: WAYK_END.y - 6 },
                ]}
              />
              <View
                style={[
                  styles.dotSnooze,
                  { left: SNOOZE_END.x - 6, top: SNOOZE_END.y - 6 },
                ]}
              />
            </>
          )}

          <Text style={[styles.snoozeLabel, connected && styles.labelActive]}>
            Snooze Cycle
          </Text>
          <Text style={[styles.groggyLabel, connected && styles.labelActive]}>
            GROGGY ZONE
          </Text>
        </View>

        <Text style={styles.caption}>
          Avoid the 'groggy zone'. Wayk launches you straight into alertness.
        </Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            connected ? styles.continueBtnActive : styles.continueBtnDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!connected}
          onPress={onContinue}
        >
          <Text
            style={[
              styles.continueText,
              connected && styles.continueTextActive,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F8',
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
    color: '#3A3A3C',
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
    backgroundColor: '#E7A845',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000000',
    marginTop: 24,
  },
  card: {
    marginTop: 96,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  chartWrap: {
    marginTop: 16,
  },
  svg: {
    marginTop: 0,
  },
  badge: {
    position: 'absolute',
    top: 26,
    left: 88,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(60,60,67,0.5)',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 2,
  },
  badgeActive: {
    backgroundColor: '#000000',
  },
  badgeIcon: {
    fontSize: 10,
    marginRight: 6,
    color: '#FFFFFF',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
  dotWayk: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
  },
  dotSnooze: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E8899A',
    backgroundColor: '#FFFFFF',
  },
  snoozeLabel: {
    position: 'absolute',
    left: CHART_W * 0.24,
    top: CHART_H - 16,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(232,137,154,0.45)',
  },
  groggyLabel: {
    position: 'absolute',
    left: CHART_W * 0.6,
    top: CHART_H - 16,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(232,137,154,0.45)',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#D98A9A',
  },
  caption: {
    marginTop: 18,
    fontSize: 15,
    color: '#8A8A8E',
    textAlign: 'center',
    lineHeight: 21,
    fontWeight: '700',
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
    backgroundColor: 'rgba(120,120,128,0.24)',
  },
  continueBtnDisabled: {
    backgroundColor: 'rgba(120,120,128,0.16)',
  },
  continueBtnActive: {
    backgroundColor: '#000000',
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(60,60,67,0.6)',
  },
  continueTextActive: {
    color: '#FFFFFF',
  },
});
