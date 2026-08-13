/**
 * Night-to-day animated onboarding hero.
 * Crossfades a sampled sky gradient while a sun rises across the screen
 * and the stars fade out into daylight.
 *
 * The sky/sun are react-native-svg elements. Under Fabric, react-native-svg's
 * custom string props (e.g. Stop.stopColor) don't resolve correctly through
 * Animated.createAnimatedComponent, so the animation is driven by a plain
 * `progress` listener feeding React state instead of Animated-bound SVG props.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { Colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Sky gradient stops sampled at 6 keyframes (top / upper-mid / lower-mid / bottom).
const SKY_KEYFRAMES = [
  ['#02020C', '#040615', '#070B1C', '#070E22'], // night
  ['#05061A', '#0B0A25', '#191331', '#372A33'], // late night
  ['#1E0F45', '#321E55', '#4D2F63', '#6A4547'], // pre-dawn
  ['#553355', '#956362', '#CA8F62', '#B6894F'], // dawn
  ['#6A4564', '#AA7469', '#DB9D67', '#C79856'], // sunrise
  ['#FDF9F3', '#FAF8F2', '#F8F7EF', '#D1CFC8'], // day
];

// Sun rise path: a cubic Bezier that bows left through the middle of the
// screen, then hooks right near the top (fractions of screen).
const SUN_PATH = {
  p0: { x: 0.4, y: 0.78 },
  p1: { x: 0.18, y: 0.58 },
  p2: { x: 0.22, y: 0.32 },
  p3: { x: 0.54, y: 0.27 },
};

// Sun diameter sampled at 6 keyframes (fraction of screen width).
const SUN_DIAMETER_KEYFRAMES = [0.093, 0.127, 0.148, 0.169, 0.18, 0.19];

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number) {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

const STARS = [
  { x: 0.07, y: 0.09, r: 2, big: false },
  { x: 0.61, y: 0.05, r: 1.5, big: false },
  { x: 0.86, y: 0.06, r: 2, big: false },
  { x: 0.48, y: 0.11, r: 3, big: true },
  { x: 0.3, y: 0.13, r: 2, big: false },
  { x: 0.15, y: 0.2, r: 3.5, big: true },
  { x: 0.79, y: 0.19, r: 2, big: false },
  { x: 0.43, y: 0.21, r: 1.5, big: false },
  { x: 0.03, y: 0.23, r: 2, big: false },
  { x: 0.75, y: 0.26, r: 3.5, big: true },
  { x: 0.53, y: 0.3, r: 2, big: false },
  { x: 0.17, y: 0.38, r: 1.5, big: false },
  { x: 0.9, y: 0.4, r: 2, big: false },
  { x: 0.22, y: 0.55, r: 2.5, big: true },
];

const DURATION_MS = 6000;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp01(t: number) {
  return Math.max(0, Math.min(1, t));
}

// t is 0..(keyframes.length - 1)
function stageLerp<T extends number>(t: number, values: T[]): number {
  const i = Math.floor(clamp01(t / (values.length - 1)) * (values.length - 1));
  const nextI = Math.min(i + 1, values.length - 1);
  const localT = t - i;
  return lerp(values[i], values[nextI], clamp01(localT));
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function lerpColor(t: number, colors: string[]): string {
  const i = Math.floor(clamp01(t / (colors.length - 1)) * (colors.length - 1));
  const nextI = Math.min(i + 1, colors.length - 1);
  const localT = clamp01(t - i);
  const a = hexToRgb(colors[i]);
  const b = hexToRgb(colors[nextI]);
  const r = Math.round(lerp(a.r, b.r, localT));
  const g = Math.round(lerp(a.g, b.g, localT));
  const bl = Math.round(lerp(a.b, b.b, localT));
  return `rgb(${r}, ${g}, ${bl})`;
}

export default function SkyOnboarding({ onComplete }: { onComplete?: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [t, setT] = useState(0);

  useEffect(() => {
    const id = progress.addListener(({ value }) => setT(value));
    Animated.timing(progress, {
      toValue: 5,
      duration: DURATION_MS,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        onComplete?.();
      }
    });
    return () => progress.removeListener(id);
  }, [progress, onComplete]);

  const skyTop = lerpColor(t, SKY_KEYFRAMES.map(s => s[0]));
  const skyUpperMid = lerpColor(t, SKY_KEYFRAMES.map(s => s[1]));
  const skyLowerMid = lerpColor(t, SKY_KEYFRAMES.map(s => s[2]));
  const skyBottom = lerpColor(t, SKY_KEYFRAMES.map(s => s[3]));

  const riseT = clamp01(t / 5);
  const sunCx = cubicBezier(riseT, SUN_PATH.p0.x, SUN_PATH.p1.x, SUN_PATH.p2.x, SUN_PATH.p3.x) * SCREEN_W;
  const sunCy = cubicBezier(riseT, SUN_PATH.p0.y, SUN_PATH.p1.y, SUN_PATH.p2.y, SUN_PATH.p3.y) * SCREEN_H;
  const sunR = (stageLerp(t, SUN_DIAMETER_KEYFRAMES) * SCREEN_W) / 2;
  const glowR = sunR * 2.3;

  const starOpacity =
    t <= 3.3 ? 1 : t >= 4.3 ? 0 : lerp(1, 0, (t - 3.3) / 1.0);

  // Each word reveals in sequence rather than all at once.
  const wordAnim = (startT: number, endT: number) => ({
    opacity: progress.interpolate({
      inputRange: [startT, endT],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [startT, endT],
          outputRange: [16, 0],
          extrapolate: 'clamp',
        }),
      },
    ],
  });
  const becomeAnim = wordAnim(3.6, 3.9);
  const aAnim = wordAnim(3.8, 4.1);
  const morningAnim = wordAnim(4.0, 4.4);
  const personAnim = wordAnim(4.3, 4.7);

  const textColor =
    t <= 3.6
      ? '#FBEFE0'
      : lerpColor(
          (clamp01((t - 3.6) / 1.4)) * 2,
          ['#FBEFE0', '#8A6A55', '#3A3630'],
        );

  return (
    <View style={styles.container}>
      <Svg width={SCREEN_W} height={SCREEN_H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={skyTop} />
            <Stop offset="0.3" stopColor={skyUpperMid} />
            <Stop offset="0.6" stopColor={skyLowerMid} />
            <Stop offset="1" stopColor={skyBottom} />
          </LinearGradient>
          <RadialGradient id="sunCore" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={Colors.white} stopOpacity={1} />
            <Stop offset="45%" stopColor={Colors.sunCore} stopOpacity={1} />
            <Stop offset="100%" stopColor={Colors.sunEdge} stopOpacity={0.95} />
          </RadialGradient>
          <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={Colors.sunGlowStart} stopOpacity={0.45} />
            <Stop offset="60%" stopColor={Colors.sunGlowMid} stopOpacity={0.12} />
            <Stop offset="100%" stopColor={Colors.sunGlowMid} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Rect x={0} y={0} width={SCREEN_W} height={SCREEN_H} fill="url(#sky)" />

        {STARS.map((s, i) => (
          <React.Fragment key={i}>
            {s.big && (
              <Circle
                cx={s.x * SCREEN_W}
                cy={s.y * SCREEN_H}
                r={s.r * 2.5}
                fill={Colors.white}
                opacity={starOpacity * 0.25}
              />
            )}
            <Circle
              cx={s.x * SCREEN_W}
              cy={s.y * SCREEN_H}
              r={s.r}
              fill={Colors.white}
              opacity={starOpacity}
            />
          </React.Fragment>
        ))}

        <Circle cx={sunCx} cy={sunCy} r={glowR} fill="url(#sunGlow)" />
        <Circle cx={sunCx} cy={sunCy} r={sunR} fill="url(#sunCore)" />
      </Svg>

      <View style={styles.textWrap}>
        <View style={styles.wordRow}>
          <Animated.Text style={[styles.headline, { color: textColor }, becomeAnim]}>
            Become
          </Animated.Text>
          <Animated.Text style={[styles.headline, { color: textColor }, aAnim]}>
            {' a'}
          </Animated.Text>
        </View>
        <Animated.Text style={[styles.headline, { color: textColor }, morningAnim]}>
          morning
        </Animated.Text>
        <Animated.Text style={[styles.headline, { color: textColor }, personAnim]}>
          person
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#02020C',
  },
  textWrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: SCREEN_H * 0.42,
    alignItems: 'center',
  },
  wordRow: {
    flexDirection: 'row',
  },
  headline: {
    fontSize: 54,
    fontWeight: '800',
    lineHeight: 60,
    textAlign: 'center',
  },
});
