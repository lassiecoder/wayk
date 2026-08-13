/**
 * "Get out of bed 5x faster with Wayk" insight screen — a custom SVG
 * speedometer (gradient arc + tick marks + needle) since no such asset
 * exists in assets/. Same unlock-after-delay Continue convention as
 * BiologyScreen/QuoteScreen — pure insight, no user choice to gate on.
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
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Line,
  Circle,
} from 'react-native-svg';

const UNLOCK_DELAY_MS = 1000;
const NEEDLE_SWEEP_MS = 1000;

const GAUGE_W = 300;
const GAUGE_H = 190;
const CX = 150;
const CY = 170;
const ARC_R = 130;

// Needle position, 0 (Slow/left) -> 1 (Instant/right, horizontal). At
// 5.0x the needle sits almost flat, just shy of the arc's right end.
const NEEDLE_T_START = 0; // 1.0x, on landing
const NEEDLE_T_END = 0.93; // 5.0x, where it settles

// t: 0 (left/red) -> 1 (right/green), measured as the top semicircle.
function pointAt(t: number, r: number) {
  const angle = Math.PI * (1 - t);
  return {
    x: CX + r * Math.cos(angle),
    y: CY - r * Math.sin(angle),
  };
}

function Gauge({ needleT }: { needleT: number }) {
  const arcStart = pointAt(0, ARC_R);
  const arcEnd = pointAt(1, ARC_R);

  const ticks = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12;
    const inner = pointAt(t, 98);
    const outer = pointAt(t, 113);
    return { t, inner, outer };
  });

  const needleAngle = Math.PI * (1 - needleT);
  const tip = pointAt(needleT, 120);
  const tail = {
    x: CX - 22 * Math.cos(needleAngle),
    y: CY + 22 * Math.sin(needleAngle),
  };

  return (
    <Svg width="100%" height={GAUGE_H} viewBox={`0 0 ${GAUGE_W} ${GAUGE_H}`}>
      <Defs>
        <LinearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#E8524F" />
          <Stop offset="0.35" stopColor="#F0A83B" />
          <Stop offset="0.65" stopColor="#C9CB4A" />
          <Stop offset="1" stopColor="#3FAE7A" />
        </LinearGradient>
      </Defs>
      <Path
        d={`M ${arcStart.x} ${arcStart.y} A ${ARC_R} ${ARC_R} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
        stroke="url(#gaugeGrad)"
        strokeWidth={22}
        strokeLinecap="round"
        fill="none"
      />
      {ticks.map(tick => (
        <Line
          key={tick.t}
          x1={tick.inner.x}
          y1={tick.inner.y}
          x2={tick.outer.x}
          y2={tick.outer.y}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={2}
        />
      ))}
      <Line
        x1={tail.x}
        y1={tail.y}
        x2={tip.x}
        y2={tip.y}
        stroke="#000000"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Circle cx={CX} cy={CY} r={9} fill="#000000" />
      <Circle cx={CX} cy={CY} r={3} fill="#FFFFFF" />
    </Svg>
  );
}

export default function SpeedGaugeScreen({
  progress,
  onBack,
  onContinue,
}: {
  progress: number;
  onBack: () => void;
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [unlocked, setUnlocked] = useState(false);
  const [needleT, setNeedleT] = useState(NEEDLE_T_START);
  const [displayValue, setDisplayValue] = useState(1);
  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = setTimeout(() => setUnlocked(true), UNLOCK_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const listenerId = sweepAnim.addListener(({ value }) => {
      setNeedleT(NEEDLE_T_START + (NEEDLE_T_END - NEEDLE_T_START) * value);
      setDisplayValue(1 + 4 * value);
    });
    Animated.timing(sweepAnim, {
      toValue: 1,
      duration: NEEDLE_SWEEP_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => sweepAnim.removeListener(listenerId);
  }, [sweepAnim]);

  // Title slides in from the right; the gauge card slides up from the
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

      <Animated.Text style={[styles.title, titleReveal]}>
        Get out of bed 5x faster with Wayk
      </Animated.Text>

      <Animated.View style={[styles.card, cardReveal]}>
        <View style={styles.gaugeWrap}>
          <Gauge needleT={needleT} />
          <View style={styles.gaugeLabel} pointerEvents="none">
            <Text style={styles.gaugeValue}>{displayValue.toFixed(1)}x</Text>
            <Text style={styles.gaugeCaption}>FASTER</Text>
          </View>
        </View>

        <View style={styles.endLabels}>
          <View>
            <Text style={[styles.endLabel, styles.endLabelSlow]}>Slow</Text>
            <Text style={styles.endSubLabel}>Groggy</Text>
          </View>
          <View style={styles.endLabelRight}>
            <Text style={[styles.endLabel, styles.endLabelInstant]}>Instant</Text>
            <Text style={styles.endSubLabel}>Active</Text>
          </View>
        </View>

        <Text style={styles.description}>
          Wayk eliminates snoozing for instant wake ups.
        </Text>
      </Animated.View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            unlocked ? styles.continueBtnActive : styles.continueBtnDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!unlocked}
          onPress={onContinue}
        >
          <Text
            style={[styles.continueText, unlocked && styles.continueTextActive]}
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
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 34,
    marginTop: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginTop: 56,
  },
  gaugeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeLabel: {
    position: 'absolute',
    top: 78,
    alignItems: 'center',
  },
  gaugeValue: {
    fontSize: 38,
    fontWeight: '800',
    color: '#000000',
  },
  gaugeCaption: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A8A8E',
    letterSpacing: 1,
    marginTop: 2,
  },
  endLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  endLabelRight: {
    alignItems: 'flex-end',
  },
  endLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  endLabelSlow: {
    color: '#E8524F',
  },
  endLabelInstant: {
    color: '#3FAE7A',
  },
  endSubLabel: {
    fontSize: 13,
    color: '#B0B0B4',
    marginTop: 2,
  },
  description: {
    fontSize: 15,
    color: '#8A8A8E',
    textAlign: 'center',
    marginTop: 20,
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
