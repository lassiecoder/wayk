/**
 * "One alarm. One mission." insight screen. Two side-by-side timelines
 * compare a typical snooze-riddled morning against a Wayk morning. Each
 * timeline's connecting line self-draws using the same SVG
 * strokeDashoffset technique as EnergyLevelsScreen, segment by segment,
 * ending with the Wayk line extending into a "25 MINS GAINED" badge that
 * unlocks Continue.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import Reanimated, {
  Easing as REasing,
  runOnJS,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';

const AnimatedPath = Reanimated.createAnimatedComponent(Path);

const { width: SCREEN_W } = Dimensions.get('window');

const GOLD = Colors.accent;
const ORANGE = '#E0904B';
const RED = '#E2536B';
const GREEN = '#1FA971';

const ROW_H = 92;
const ICON = 44;
const LINE_X = ICON / 2;
const EDGE = ICON / 2; // trim segments to the icon's outer edge, not its center
const CONTENT_W = 118; // icon + gap + time/label text, shared by every row so icons stay column-aligned

const LEFT_NODE_Y = [22, 22 + ROW_H, 22 + ROW_H * 2, 22 + ROW_H * 3];
const RIGHT_NODE_Y = [22, 22 + ROW_H, 22 + ROW_H * 2];
const BADGE_TOP = 258;
const CONTAINER_H = LEFT_NODE_Y[3] + ICON / 2; // bottom-aligns with the Panic row

type Point = { x: number; y: number };

function zigzagPoints(y0: number, y1: number): Point[] {
  const dy = y1 - y0;
  return [
    { x: LINE_X, y: y0 },
    { x: LINE_X - 14, y: y0 + dy * 0.38 },
    { x: LINE_X + 14, y: y0 + dy * 0.62 },
    { x: LINE_X, y: y1 },
  ];
}

function straightPoints(y0: number, y1: number): Point[] {
  return [
    { x: LINE_X, y: y0 },
    { x: LINE_X, y: y1 },
  ];
}

function pointsToD(points: Point[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
}

function pathLength(points: Point[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y,
    );
  }
  return len;
}

const LEFT_SEGMENTS = [
  zigzagPoints(LEFT_NODE_Y[0] + EDGE, LEFT_NODE_Y[1] - EDGE),
  zigzagPoints(LEFT_NODE_Y[1] + EDGE, LEFT_NODE_Y[2] - EDGE),
  zigzagPoints(LEFT_NODE_Y[2] + EDGE, LEFT_NODE_Y[3] - EDGE),
];
const LEFT_DS = LEFT_SEGMENTS.map(pointsToD);
const LEFT_LENS = LEFT_SEGMENTS.map(pathLength);
const LEFT_COLORS = [GOLD, ORANGE, RED];

// The Wayk line runs straight and continuous behind the icons (unlike the
// zigzag, which looks messy poking into a circle at an angle), so these
// segments are NOT trimmed to the icon edges — they run node-center to
// node-center, same as the reference.
const RIGHT_SEGMENTS = [
  straightPoints(RIGHT_NODE_Y[0] + EDGE, RIGHT_NODE_Y[1] - EDGE),
  straightPoints(RIGHT_NODE_Y[1] + EDGE, RIGHT_NODE_Y[2] - EDGE),
  // straightPoints(RIGHT_NODE_Y[0], RIGHT_NODE_Y[1]),
  // straightPoints(RIGHT_NODE_Y[1], RIGHT_NODE_Y[2]),
];
const RIGHT_DS = RIGHT_SEGMENTS.map(pointsToD);
const RIGHT_LENS = RIGHT_SEGMENTS.map(pathLength);

const EXT_POINTS = straightPoints(RIGHT_NODE_Y[2] + EDGE, BADGE_TOP);
const EXT_D = pointsToD(EXT_POINTS);
const EXT_LEN = pathLength(EXT_POINTS);

// Both timelines draw at the same px/ms rate — durations come from each
// segment's actual path length instead of hand-picked numbers, so the
// zigzag (longer per segment) and the straight line don't visually race
// at different speeds.
const DRAW_SPEED = 0.2; // px per ms
const INITIAL_DELAY = 150;
const EXT_PAUSE = 200; // breathing room after both mains finish, before the payoff

const LEFT_DURS = LEFT_LENS.map(len => len / DRAW_SPEED);
const LEFT_DELAYS = [
  INITIAL_DELAY,
  INITIAL_DELAY + LEFT_DURS[0],
  INITIAL_DELAY + LEFT_DURS[0] + LEFT_DURS[1],
];
const LEFT_END = INITIAL_DELAY + LEFT_DURS[0] + LEFT_DURS[1] + LEFT_DURS[2];

const RIGHT_DURS = RIGHT_LENS.map(len => len / DRAW_SPEED);
const RIGHT_DELAYS = [INITIAL_DELAY, INITIAL_DELAY + RIGHT_DURS[0]];
const RIGHT_MAIN_END = INITIAL_DELAY + RIGHT_DURS[0] + RIGHT_DURS[1];

const EXT_DUR = EXT_LEN / DRAW_SPEED;
const EXT_DELAY = Math.max(LEFT_END, RIGHT_MAIN_END) + EXT_PAUSE;

const LEFT_NODES = [
  {
    time: '7:00',
    label: 'Alarm',
    bg: 'rgba(231,168,69,0.14)',
    icon: <BellIcon color={GOLD} />,
  },
  {
    time: '7:09',
    label: 'Snooze',
    bg: 'rgba(231,168,69,0.14)',
    icon: <ZzIcon color={GOLD} />,
  },
  {
    time: '7:18',
    label: 'Snooze',
    bg: 'rgba(226,83,107,0.14)',
    icon: <ZzIcon color={RED} />,
  },
  {
    time: '7:27',
    label: 'Panic',
    bg: RED,
    icon: (
      <Text style={{ color: Colors.white, fontWeight: '800', fontSize: 17 }}>
        !
      </Text>
    ),
  },
];

const RIGHT_NODES = [
  {
    time: '7:00',
    label: 'Alarm',
    bg: 'rgba(31,169,113,0.14)',
    icon: <BellIcon color={GREEN} />,
  },
  {
    time: '7:01',
    label: 'Mission',
    bg: GREEN,
    icon: (
      <Text style={{ color: Colors.white, fontWeight: '800', fontSize: 15 }}>
        ✓
      </Text>
    ),
  },
  {
    time: '7:02',
    label: 'Started',
    bg: 'rgba(31,169,113,0.14)',
    icon: <SunIcon color={GREEN} />,
  },
];

function ZzIcon({ color }: { color: string }) {
  return (
    <View>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '800',
          color,
          lineHeight: 14,
          width: 16,
          textAlign: 'center',
        }}
      >
        Z
      </Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: '800',
          color,
          lineHeight: 11,
          width: 16,
          textAlign: 'center',
        }}
      >
        z
      </Text>
    </View>
  );
}

function BellIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C9.2 3 7 5.5 7 9v3.2c0 1-.4 2-1.2 2.7L5 16h14l-.8-1.1c-.8-.7-1.2-1.7-1.2-2.7V9c0-3.5-2.2-6-5-6z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path
        d="M10 18a2 2 0 0 0 4 0"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const SUN_RAYS: [number, number, number, number][] = [
  [19, 12, 22, 12],
  [16.9, 16.9, 19.1, 19.1],
  [12, 19, 12, 22],
  [7.1, 16.9, 4.9, 19.1],
  [5, 12, 2, 12],
  [7.1, 7.1, 4.9, 4.9],
  [12, 5, 12, 2],
  [16.9, 7.1, 19.1, 4.9],
];

function SunIcon({ color }: { color: string }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={1.6} />
      {SUN_RAYS.map(([x1, y1, x2, y2], i) => (
        <Line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      ))}
    </Svg>
  );
}

export default function MissionScreen({
  progress,
  onBack,
  onContinue,
}: {
  progress: number;
  onBack: () => void;
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [revealed, setRevealed] = useState(false);
  const badgeAnim = useRef(new Animated.Value(0)).current;

  // Title slides in from the right, same reveal used on the question
  // screens (QuestionnaireScreen, MissionSelectScreen, etc.).
  const titleReveal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(titleReveal, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [titleReveal]);
  const titleStyle = {
    opacity: titleReveal,
    transform: [
      {
        translateX: titleReveal.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
    ],
  };

  const lp0 = useSharedValue(0);
  const lp1 = useSharedValue(0);
  const lp2 = useSharedValue(0);
  const rp0 = useSharedValue(0);
  const rp1 = useSharedValue(0);
  const rext = useSharedValue(0);

  useEffect(() => {
    lp0.value = withDelay(
      LEFT_DELAYS[0],
      withTiming(1, {
        duration: LEFT_DURS[0],
        easing: REasing.out(REasing.cubic),
      }),
    );
    lp1.value = withDelay(
      LEFT_DELAYS[1],
      withTiming(1, {
        duration: LEFT_DURS[1],
        easing: REasing.out(REasing.cubic),
      }),
    );
    lp2.value = withDelay(
      LEFT_DELAYS[2],
      withTiming(1, {
        duration: LEFT_DURS[2],
        easing: REasing.out(REasing.cubic),
      }),
    );
    rp0.value = withDelay(
      RIGHT_DELAYS[0],
      withTiming(1, {
        duration: RIGHT_DURS[0],
        easing: REasing.out(REasing.cubic),
      }),
    );
    rp1.value = withDelay(
      RIGHT_DELAYS[1],
      withTiming(1, {
        duration: RIGHT_DURS[1],
        easing: REasing.out(REasing.cubic),
      }),
    );
    rext.value = withDelay(
      EXT_DELAY,
      withTiming(
        1,
        { duration: EXT_DUR, easing: REasing.out(REasing.cubic) },
        finished => {
          if (finished) {
            runOnJS(setRevealed)(true);
          }
        },
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (revealed) {
      Animated.timing(badgeAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [revealed, badgeAnim]);

  const leftProps0 = useAnimatedProps(() => ({
    strokeDasharray: [LEFT_LENS[0], LEFT_LENS[0]],
    strokeDashoffset: LEFT_LENS[0] * (1 - lp0.value),
  }));
  const leftProps1 = useAnimatedProps(() => ({
    strokeDasharray: [LEFT_LENS[1], LEFT_LENS[1]],
    strokeDashoffset: LEFT_LENS[1] * (1 - lp1.value),
  }));
  const leftProps2 = useAnimatedProps(() => ({
    strokeDasharray: [LEFT_LENS[2], LEFT_LENS[2]],
    strokeDashoffset: LEFT_LENS[2] * (1 - lp2.value),
  }));
  const rightProps0 = useAnimatedProps(() => ({
    strokeDasharray: [RIGHT_LENS[0], RIGHT_LENS[0]],
    strokeDashoffset: RIGHT_LENS[0] * (1 - rp0.value),
  }));
  const rightProps1 = useAnimatedProps(() => ({
    strokeDasharray: [RIGHT_LENS[1], RIGHT_LENS[1]],
    strokeDashoffset: RIGHT_LENS[1] * (1 - rp1.value),
  }));
  const extProps = useAnimatedProps(() => ({
    strokeDasharray: [EXT_LEN, EXT_LEN],
    strokeDashoffset: EXT_LEN * (1 - rext.value),
  }));

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
        One alarm. One mission.
      </Animated.Text>

      <View style={styles.card}>
        <View style={styles.columns}>
          <View style={styles.col}>
            <Text style={styles.colHeaderTypical}>TYPICAL MORNING</Text>
            <View style={[styles.timeline, { height: CONTAINER_H }]}>
              <View style={[styles.timelineInner, { height: CONTAINER_H }]}>
                <Svg
                  width={ICON}
                  height={CONTAINER_H}
                  style={styles.timelineSvg}
                >
                  <AnimatedPath
                    d={LEFT_DS[0]}
                    stroke={LEFT_COLORS[0]}
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    animatedProps={leftProps0}
                  />
                  <AnimatedPath
                    d={LEFT_DS[1]}
                    stroke={LEFT_COLORS[1]}
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    animatedProps={leftProps1}
                  />
                  <AnimatedPath
                    d={LEFT_DS[2]}
                    stroke={LEFT_COLORS[2]}
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    animatedProps={leftProps2}
                  />
                </Svg>
                {LEFT_NODES.map((node, i) => (
                  <View
                    key={node.label + i}
                    style={[styles.nodeRow, { top: LEFT_NODE_Y[i] - ICON / 2 }]}
                  >
                    <View
                      style={[styles.nodeIcon, { backgroundColor: node.bg }]}
                    >
                      {node.icon}
                    </View>
                    <View style={styles.nodeText}>
                      <Text style={styles.nodeTime}>{node.time}</Text>
                      <Text style={styles.nodeLabel}>{node.label}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.col, styles.colRight]}>
            <Text style={styles.colHeaderWayk}>WAYK MORNING</Text>
            <View style={[styles.timeline, { height: CONTAINER_H }]}>
              <View style={[styles.timelineInner, { height: CONTAINER_H }]}>
                <Svg
                  width={ICON}
                  height={CONTAINER_H}
                  style={styles.timelineSvg}
                >
                  <AnimatedPath
                    d={RIGHT_DS[0]}
                    stroke={GREEN}
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    animatedProps={rightProps0}
                  />
                  <AnimatedPath
                    d={RIGHT_DS[1]}
                    stroke={GREEN}
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    animatedProps={rightProps1}
                  />
                  <AnimatedPath
                    d={EXT_D}
                    stroke={GREEN}
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    animatedProps={extProps}
                  />
                </Svg>
                {RIGHT_NODES.map((node, i) => (
                  <View
                    key={node.label + i}
                    style={[
                      styles.nodeRow,
                      { top: RIGHT_NODE_Y[i] - ICON / 2 },
                    ]}
                  >
                    <View
                      style={[styles.nodeIcon, { backgroundColor: node.bg }]}
                    >
                      {node.icon}
                    </View>
                    <View style={styles.nodeText}>
                      <Text style={styles.nodeTime}>{node.time}</Text>
                      <Text style={styles.nodeLabel}>{node.label}</Text>
                    </View>
                  </View>
                ))}
                <Animated.View
                  style={[
                    styles.badge,
                    {
                      top: BADGE_TOP,
                      height: CONTAINER_H - BADGE_TOP,
                      opacity: badgeAnim,
                      transform: [
                        {
                          translateY: badgeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.badgeValue}>25 MINS</Text>
                  <Text style={styles.badgeLabel}>GAINED</Text>
                </Animated.View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            revealed ? styles.continueBtnActive : styles.continueBtnDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!revealed}
          onPress={onContinue}
        >
          <Text
            style={[styles.continueText, revealed && styles.continueTextActive]}
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
    fontSize: 26,
    fontWeight: '800',
    color: Colors.black,
    marginTop: 24,
  },
  card: {
    marginTop: 28,
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  columns: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
    paddingRight: 14,
  },
  colRight: {
    paddingRight: 0,
    paddingLeft: 14,
    borderLeftWidth: 1,
    borderLeftColor: Colors.divider,
  },
  colHeaderTypical: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.mutedText,
    letterSpacing: 1,
  },
  colHeaderWayk: {
    fontSize: 11,
    fontWeight: '800',
    color: GREEN,
    letterSpacing: 1,
  },
  timeline: {
    marginTop: 18,
    position: 'relative',
    alignItems: 'center',
  },
  timelineInner: {
    width: CONTENT_W,
    position: 'relative',
  },
  timelineSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  },
  nodeRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ICON,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  nodeIcon: {
    width: ICON,
    height: ICON,
    borderRadius: ICON / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeText: {
    marginLeft: 10,
  },
  nodeTime: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.darkText,
    fontVariant: ['tabular-nums'],
  },
  nodeLabel: {
    fontSize: 12,
    color: Colors.mutedText,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#E1F5EA',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeValue: {
    fontSize: 18,
    fontWeight: '800',
    color: GREEN,
    letterSpacing: 0.3,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: GREEN,
    marginTop: 2,
    letterSpacing: 1,
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
    backgroundColor: Colors.black,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(60,60,67,0.6)',
  },
  continueTextActive: {
    color: Colors.white,
  },
});
