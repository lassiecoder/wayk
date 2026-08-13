/**
 * "Your Morning Plan" recap screen. Summarizes the plan the user just
 * built (wake time, mission, alarm sound) with a live countdown to the
 * next alarm, a timeline of what happens that morning, a wake-receipt
 * illustration (custom SVG scene, no matching asset exists — same
 * convention as SpeedGaugeScreen's gauge), a streak card, and two
 * testimonials. Rendered twice in the flow: once as a preview right
 * after setup finishes (leading into the referral/account gates), and
 * once as the final onboarding destination after account creation.
 * "Start my plan" is the only way forward; no back button.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { MISSIONS } from './MissionSelectScreen';

const { width: SCREEN_W } = Dimensions.get('window');
const RATING_IMAGE_ASPECT = 701 / 356;
const RATING_IMAGE_WIDTH = SCREEN_W * 0.42;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    initial: 'S',
    color: '#5B5FC7',
    rating: '5.0',
    quote:
      "I used to hit snooze for an hour every morning. Now I'm up on my first alarm and actually have time for breakfast.",
  },
  {
    name: 'James R.',
    initial: 'J',
    color: '#C4762B',
    rating: '5.0',
    quote:
      'The mission feature is genius. Having one clear task to do gets me out of bed way faster than any sound ever did.',
  },
];

function parseTime(time: string): { hour: number; minute: number } {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    return { hour: 7, minute: 30 };
  }
  let hour = parseInt(match[1], 10) % 12;
  if (match[3].toUpperCase() === 'PM') {
    hour += 12;
  }
  return { hour, minute: parseInt(match[2], 10) };
}

function nextOccurrence(hour: number, minute: number): Date {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

const RECEIPT_W = 360;
const RECEIPT_H = 200;

function WakeReceiptArt() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${RECEIPT_W} ${RECEIPT_H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id="receiptSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4A3B66" />
          <Stop offset="0.4" stopColor="#8C6B72" />
          <Stop offset="0.72" stopColor="#D79A63" />
          <Stop offset="1" stopColor="#2E6F72" />
        </LinearGradient>
        <RadialGradient id="receiptSunCore" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset="45%" stopColor="#FFD24D" stopOpacity={1} />
          <Stop offset="100%" stopColor="#FFA733" stopOpacity={0.95} />
        </RadialGradient>
        <RadialGradient id="receiptSunGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFC15C" stopOpacity={0.5} />
          <Stop offset="60%" stopColor="#FFB347" stopOpacity={0.15} />
          <Stop offset="100%" stopColor="#FFB347" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={RECEIPT_W} height={RECEIPT_H} fill="url(#receiptSky)" />

      <Polygon
        points="0,120 40,85 90,110 140,70 190,105 240,80 290,112 340,88 360,105 360,150 0,150"
        fill="#5B5A82"
        opacity={0.55}
      />
      <Polygon
        points="0,140 50,105 100,130 160,95 220,128 280,100 340,132 360,120 360,160 0,160"
        fill="#40406B"
        opacity={0.8}
      />

      <Rect x={0} y={150} width={RECEIPT_W} height={50} fill="#2C6068" />
      <Rect x={0} y={150} width={RECEIPT_W} height={6} fill="#3E7D82" opacity={0.6} />

      <Rect x={0} y={158} width={130} height={9} fill="#6B4A34" />
      {[20, 45, 70, 95, 120].map(x => (
        <Line key={x} x1={x} y1={158} x2={x} y2={167} stroke="#5C3E2A" strokeWidth={1} />
      ))}
      <Line x1={15} y1={167} x2={15} y2={182} stroke="#4A3325" strokeWidth={3} />
      <Line x1={95} y1={167} x2={95} y2={182} stroke="#4A3325" strokeWidth={3} />

      <G>
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (Math.PI * 2 * i) / 8;
          const cx = 118;
          const cy = 128;
          const x1 = cx + Math.cos(angle) * 30;
          const y1 = cy + Math.sin(angle) * 30;
          const x2 = cx + Math.cos(angle) * 40;
          const y2 = cy + Math.sin(angle) * 40;
          return (
            <Line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#FFC15C"
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={0.8}
            />
          );
        })}
        <Circle cx={118} cy={128} r={44} fill="url(#receiptSunGlow)" />

        <Path d="M 108 150 Q 104 165 100 178" stroke="#1A1A1A" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d="M 128 150 Q 132 165 136 178" stroke="#1A1A1A" strokeWidth={2.5} fill="none" strokeLinecap="round" />

        <Circle cx={118} cy={128} r={26} fill="url(#receiptSunCore)" />

        <Path d="M 140 126 Q 156 118 168 100" stroke="#1A1A1A" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d="M 168 100 Q 178 128 190 148" stroke="rgba(255,255,255,0.7)" strokeWidth={1.2} fill="none" />

        <Circle cx={110} cy={124} r={2.2} fill="#3A2A10" />
        <Circle cx={124} cy={124} r={2.2} fill="#3A2A10" />
        <Path d="M 108 134 Q 118 141 128 134" stroke="#3A2A10" strokeWidth={2} fill="none" strokeLinecap="round" />
      </G>

      <G>
        <Path
          d="M 182 148 Q 192 138 202 144 Q 195 150 200 156 Q 190 154 182 148 Z"
          fill="#DDE7EA"
        />
        <Circle cx={172} cy={158} r={2} fill="#FFFFFF" opacity={0.7} />
        <Circle cx={178} cy={162} r={1.4} fill="#FFFFFF" opacity={0.5} />
      </G>
    </Svg>
  );
}

function Pill({
  iconSet,
  icon,
  color,
  label,
}: {
  iconSet: 'ion' | 'mdi';
  icon: string;
  color: string;
  label: string;
}) {
  return (
    <View style={styles.pill}>
      {iconSet === 'mdi' ? (
        <MaterialDesignIcons name={icon as never} size={14} color={color} />
      ) : (
        <Ionicons name={icon as never} size={14} color={color} />
      )}
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function ChevronDivider() {
  return (
    <View style={styles.chevronRow}>
      <Ionicons name="chevron-down" size={16} color="#B0B0B4" />
    </View>
  );
}

export default function MorningPlanScreen({
  wakeTime,
  wakeMission,
  onContinue,
}: {
  wakeTime: string;
  wakeMission: string | null;
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();
  const mission = MISSIONS.find(m => m.id === wakeMission) ?? MISSIONS[1];
  const { hour: targetHour, minute: targetMinute } = parseTime(wakeTime);
  const target = useRef(nextOccurrence(targetHour, targetMinute)).current;
  const [remaining, setRemaining] = useState(target.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(target.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const revealAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealAnim]);

  const reveal = {
    opacity: revealAnim,
    transform: [
      {
        translateY: revealAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
      },
    ],
  };

  const handleShare = () => {
    Share.share({
      message: `I'm waking up at ${wakeTime} with Wayk 🌅`,
    }).catch(() => {});
  };

  const weekdayLabel = `${WEEKDAYS[target.getDay()]} ${wakeTime}`;
  const dateLabel = new Date()
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    .toUpperCase();
  const receiptTime = wakeTime.replace(' ', '').toLowerCase();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <Animated.View style={reveal}>
          <Image
            source={require('../../assets/images/app-store-rating.webp')}
            style={styles.ratingImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Your Morning Plan</Text>
          <Text style={styles.subtitle}>Here's what today looks like at {wakeTime}</Text>

          <View style={styles.pillsRow}>
            <Pill iconSet="ion" icon="alert-circle" color="#E7A845" label={`Starts in ${formatCountdown(remaining)}`} />
            <Pill iconSet="ion" icon="flash" color="#E7A845" label={weekdayLabel} />
          </View>
          <View style={styles.pillsRow}>
            <Pill iconSet={mission.iconSet} icon={mission.icon} color={mission.color} label={mission.title} />
            <Pill iconSet="ion" icon="notifications" color="#E7A845" label="Default" />
          </View>
        </Animated.View>

        <ChevronDivider />

        <View style={styles.card}>
          <Text style={styles.cardLabel}>HERE'S TODAY</Text>

          <View style={styles.timeline}>
            <View style={styles.timelineLine} pointerEvents="none" />

            <View style={styles.timelineRow}>
              <View style={styles.timelineCircleBlack}>
                <Ionicons name="notifications" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.timelineText}>{wakeTime} — Alarm rings</Text>
            </View>

            <View style={styles.timelineRow}>
              <View style={styles.timelineCircleBlack}>
                {mission.iconSet === 'mdi' ? (
                  <MaterialDesignIcons name={mission.icon as never} size={16} color="#FFFFFF" />
                ) : (
                  <Ionicons name={mission.icon as never} size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.timelineText}>Complete {mission.title}</Text>
            </View>

            <View style={[styles.timelineRow, styles.timelineRowLast]}>
              <View style={styles.timelineCircleGreen}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
              <Text style={[styles.timelineText, styles.timelineTextBold]}>
                You're up. Day started.
              </Text>
            </View>
          </View>

          <Text style={styles.cardCaption}>
            No snooze loops. One action, then your day starts with momentum.
          </Text>
        </View>

        <ChevronDivider />

        <Text style={styles.sectionLabel}>YOUR WAKE RECEIPT</Text>
        <View style={styles.receiptCard}>
          <WakeReceiptArt />
          <View style={styles.receiptOverlay} pointerEvents="box-none">
            <View style={styles.receiptTopRow}>
              <Text style={styles.receiptDate}>{dateLabel}</Text>
              <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7} onPress={handleShare}>
                <Ionicons name="share-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.receiptBottomRow}>
              <View>
                <Text style={styles.receiptTime}>{receiptTime}</Text>
                <Text style={styles.receiptMission}>{mission.title}</Text>
              </View>
              <View style={styles.receiptBadge}>
                <Text style={styles.receiptBadgeText}>No. 1</Text>
              </View>
            </View>
          </View>
        </View>

        <ChevronDivider />

        <View style={styles.card}>
          <Text style={styles.streakTitle}>Rise and repeat.</Text>
          <Text style={styles.streakSubtitle}>
            Your alarm fires 7× a week. Build the streak.
          </Text>
          <View style={styles.dayRow}>
            {DAY_LETTERS.map((letter, i) => (
              <View key={i} style={styles.dayCircle}>
                <Text style={styles.dayLetter}>{letter}</Text>
              </View>
            ))}
          </View>
        </View>

        <ChevronDivider />

        <Text style={styles.sectionLabel}>OTHERS LIKE YOU</Text>
        {TESTIMONIALS.map(t => (
          <View key={t.name} style={styles.testimonialCard}>
            <View style={styles.testimonialHeader}>
              <View style={[styles.avatar, { backgroundColor: t.color }]}>
                <Text style={styles.avatarInitial}>{t.initial}</Text>
              </View>
              <Text style={styles.testimonialName}>{t.name}</Text>
              <View style={styles.testimonialRating}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Ionicons key={i} name="star" size={11} color="#E7A845" />
                ))}
                <Text style={styles.testimonialRatingText}>{t.rating}</Text>
              </View>
            </View>
            <Text style={styles.testimonialQuote}>"{t.quote}"</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.continueBtn} activeOpacity={0.85} onPress={onContinue}>
          <Text style={styles.continueText}>Start my plan</Text>
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
  ratingImage: {
    alignSelf: 'center',
    width: RATING_IMAGE_WIDTH,
    height: RATING_IMAGE_WIDTH / RATING_IMAGE_ASPECT,
    marginTop: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A8A8E',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A4A4C',
    marginLeft: 6,
  },
  chevronRow: {
    alignItems: 'center',
    marginVertical: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8E',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8E',
    letterSpacing: 1,
    marginBottom: 20,
  },
  timeline: {
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 17,
    top: 18,
    bottom: 18,
    width: 2,
    backgroundColor: '#E5E5E7',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  timelineRowLast: {
    marginBottom: 0,
  },
  timelineCircleBlack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCircleGreen: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3FAE7A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 16,
  },
  timelineTextBold: {
    fontWeight: '700',
  },
  cardCaption: {
    fontSize: 14,
    color: '#8A8A8E',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  receiptCard: {
    height: 200,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#2C6068',
  },
  receiptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
  },
  receiptTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  receiptDate: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  shareBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  receiptTime: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  receiptMission: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  receiptBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  receiptBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
  },
  streakSubtitle: {
    fontSize: 14,
    color: '#8A8A8E',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLetter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testimonialName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 12,
  },
  testimonialRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testimonialRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8E',
    marginLeft: 4,
  },
  testimonialQuote: {
    fontSize: 14,
    color: '#4A4A4C',
    lineHeight: 20,
    marginTop: 12,
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
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
