/**
 * Three-question onboarding survey shown after "Build my plan".
 * Each question's options reveal with the same staggered fade/slide
 * animation used on the sunrise screen. The progress bar fills by one
 * step per "Continue" tap.
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
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import LanguageSheet from '../components/LanguageSheet';
import { Colors } from '../theme/colors';

const { width: SCREEN_W } = Dimensions.get('window');

export type Question = {
  id: string;
  title: string;
  options: string[];
};

export const QUESTIONS: Question[] = [
  {
    id: 'morningPerson',
    title: 'Do you feel like a morning person?',
    options: ['Yes', 'Not yet'],
  },
  {
    id: 'ageRange',
    title: "What's your age range?",
    options: ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'],
  },
  {
    id: 'gender',
    title: 'What best describes you?',
    options: ['Male', 'Female', 'Other'],
  },
  {
    id: 'bedKeeper',
    title: 'What keeps you in bed after the alarm?',
    options: [
      'Phone scrolling',
      'Snooze loop',
      'Sleep through alarms',
      'I wake up but stay in bed',
    ],
  },
  {
    id: 'firstThought',
    title: 'First thought when the alarm goes off?',
    options: [
      "I'm up",
      'Just 5 more minutes',
      "I'll set another alarm",
      'Why did I do this?',
    ],
  },
  {
    id: 'alarmCount',
    title: 'How many alarms do you set?',
    options: ['One', '2-3', '4+'],
  },
  {
    id: 'wakeConfidence',
    title: 'If you set one alarm, would you wake up?',
    options: ['Yes', 'Sometimes', 'No'],
  },
  {
    id: 'turnOffAndSleep',
    title: 'Do you ever turn off the alarm and go back to sleep?',
    options: ['Often', 'Sometimes', 'Rarely', 'Never'],
  },
  {
    id: 'nightFeeling',
    title: 'How do you feel setting your alarm at night?',
    options: ['Motivated', 'Anxious about sleep', 'Defeated', 'Neutral'],
  },
  {
    id: 'wakeFeeling',
    title: 'How do you feel right after waking up?',
    options: ['Ready to go', 'Groggy', 'Anxious or stressed', 'Neutral'],
  },
  {
    id: 'timeToAwake',
    title: 'How long until you feel fully awake?',
    options: ['Instantly', '10-15 minutes', '30 minutes or more'],
  },
];

// The Energy Levels screen is shown as an interstitial between
// "firstThought" and "alarmCount", and the Mission screen between
// "turnOffAndSleep" and "nightFeeling", so the flow renders
// QuestionnaireScreen in three segments around them.
const ENERGY_LEVELS_SPLIT = 5;
const MISSION_SPLIT = 8;
export const MAIN_QUESTIONS = QUESTIONS.slice(0, ENERGY_LEVELS_SPLIT);
export const ALARM_QUESTIONS = QUESTIONS.slice(ENERGY_LEVELS_SPLIT, MISSION_SPLIT);
export const NIGHT_QUESTIONS = QUESTIONS.slice(MISSION_SPLIT);

// The whole onboarding flow shares one progress bar, so its fraction is
// computed from a single running total instead of each screen's own
// question count — otherwise the bar resets every time the flow moves
// into a new segment (e.g. after the Energy Levels interstitial).
export const TOTAL_ONBOARDING_STEPS = QUESTIONS.length + 16; // +16 for the Energy Levels + Mission + Biology + Wake Time + Wake Goal + Mission Select + Exercise Setup + Set Alarm + Days + Alarm Sound + Mission Alarm + Referral Source + Referral Code + Speed Gauge + Notification Permission + Commitment interstitials
export const ENERGY_LEVELS_PROGRESS = MAIN_QUESTIONS.length / TOTAL_ONBOARDING_STEPS;
export const ALARM_QUESTIONS_OFFSET = MAIN_QUESTIONS.length + 1;
export const MISSION_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length + 1 + ALARM_QUESTIONS.length) / TOTAL_ONBOARDING_STEPS;
export const NIGHT_QUESTIONS_OFFSET =
  MAIN_QUESTIONS.length + 1 + ALARM_QUESTIONS.length + 1;
export const BIOLOGY_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length + 1 + ALARM_QUESTIONS.length + 1 + NIGHT_QUESTIONS.length) /
  TOTAL_ONBOARDING_STEPS;
export const WAKE_TIME_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length +
    1 +
    ALARM_QUESTIONS.length +
    1 +
    NIGHT_QUESTIONS.length +
    1) /
  TOTAL_ONBOARDING_STEPS;
export const WAKE_GOAL_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length +
    1 +
    ALARM_QUESTIONS.length +
    1 +
    NIGHT_QUESTIONS.length +
    1 +
    1) /
  TOTAL_ONBOARDING_STEPS;
export const MISSION_SELECT_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length +
    1 +
    ALARM_QUESTIONS.length +
    1 +
    NIGHT_QUESTIONS.length +
    1 +
    1 +
    1) /
  TOTAL_ONBOARDING_STEPS;
export const EXERCISE_SETUP_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length +
    1 +
    ALARM_QUESTIONS.length +
    1 +
    NIGHT_QUESTIONS.length +
    1 +
    1 +
    1 +
    1) /
  TOTAL_ONBOARDING_STEPS;
export const SET_ALARM_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length +
    1 +
    ALARM_QUESTIONS.length +
    1 +
    NIGHT_QUESTIONS.length +
    1 +
    1 +
    1 +
    1 +
    1) /
  TOTAL_ONBOARDING_STEPS;
export const DAYS_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length +
    1 +
    ALARM_QUESTIONS.length +
    1 +
    NIGHT_QUESTIONS.length +
    1 +
    1 +
    1 +
    1 +
    1 +
    1) /
  TOTAL_ONBOARDING_STEPS;
export const ALARM_SOUND_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length +
    1 +
    ALARM_QUESTIONS.length +
    1 +
    NIGHT_QUESTIONS.length +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1) /
  TOTAL_ONBOARDING_STEPS;
export const MISSION_ALARM_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length +
    1 +
    ALARM_QUESTIONS.length +
    1 +
    NIGHT_QUESTIONS.length +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1) /
  TOTAL_ONBOARDING_STEPS;
export const REFERRAL_SOURCE_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length +
    1 +
    ALARM_QUESTIONS.length +
    1 +
    NIGHT_QUESTIONS.length +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1) /
  TOTAL_ONBOARDING_STEPS;
export const REFERRAL_CODE_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length +
    1 +
    ALARM_QUESTIONS.length +
    1 +
    NIGHT_QUESTIONS.length +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1) /
  TOTAL_ONBOARDING_STEPS;
export const SPEED_GAUGE_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length +
    1 +
    ALARM_QUESTIONS.length +
    1 +
    NIGHT_QUESTIONS.length +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1) /
  TOTAL_ONBOARDING_STEPS;
export const NOTIFICATION_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length +
    1 +
    ALARM_QUESTIONS.length +
    1 +
    NIGHT_QUESTIONS.length +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1) /
  TOTAL_ONBOARDING_STEPS;
export const COMMITMENT_SCREEN_PROGRESS =
  (MAIN_QUESTIONS.length +
    1 +
    ALARM_QUESTIONS.length +
    1 +
    NIGHT_QUESTIONS.length +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1) /
  TOTAL_ONBOARDING_STEPS;

export default function QuestionnaireScreen({
  questions = MAIN_QUESTIONS,
  progressOffset = 0,
  index,
  answers,
  onIndexChange,
  onAnswersChange,
  onBack,
  onComplete,
  showFlag = true,
}: {
  questions?: Question[];
  progressOffset?: number;
  index: number;
  answers: Record<string, string>;
  onIndexChange: (index: number) => void;
  onAnswersChange: (answers: Record<string, string>) => void;
  onBack: () => void;
  onComplete: (answers: Record<string, string>) => void;
  showFlag?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const [langOpen, setLangOpen] = useState(false);

  const progressAnim = useRef(
    new Animated.Value((progressOffset + index) / TOTAL_ONBOARDING_STEPS),
  ).current;
  const revealAnim = useRef(new Animated.Value(0)).current;

  const question = questions[index];
  const selected = answers[question.id] ?? null;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (progressOffset + index) / TOTAL_ONBOARDING_STEPS,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    revealAnim.setValue(0);
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 550 + question.options.length * 90,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const select = (option: string) => {
    onAnswersChange({ ...answers, [question.id]: option });
  };

  const goBack = () => {
    if (index === 0) {
      onBack();
      return;
    }
    onIndexChange(index - 1);
  };

  const goNext = () => {
    if (!selected) {
      return;
    }
    if (index === questions.length - 1) {
      Animated.timing(progressAnim, {
        toValue: (progressOffset + questions.length) / TOTAL_ONBOARDING_STEPS,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => onComplete(answers));
      return;
    }
    onIndexChange(index + 1);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['4%', '100%'],
  });

  const titleAnim = {
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

  const optionAnim = (i: number, count: number) => {
    const start = Math.min(0.15 + i * (0.5 / Math.max(count, 1)), 0.6);
    const end = Math.min(start + 0.45, 1);
    return {
      opacity: revealAnim.interpolate({
        inputRange: [start, end],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
      transform: [
        {
          translateY: revealAnim.interpolate({
            inputRange: [start, end],
            outputRange: [16, 0],
            extrapolate: 'clamp',
          }),
        },
      ],
    };
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </View>
        {showFlag && index === 0 && (
          <TouchableOpacity
            style={styles.flagBadge}
            onPress={() => setLangOpen(true)}
          >
            <Text style={styles.flagEmoji}>🇺🇸</Text>
          </TouchableOpacity>
        )}
      </View>

      <Animated.Text style={[styles.title, titleAnim]}>
        {question.title}
      </Animated.Text>

      <View style={styles.options}>
        {question.options.map((option, i) => {
          const isSelected = selected === option;
          return (
            <Animated.View
              key={option}
              style={optionAnim(i, question.options.length)}
            >
              <TouchableOpacity
                style={[styles.option, isSelected && styles.optionSelected]}
                activeOpacity={0.8}
                onPress={() => select(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
                <View
                  style={[styles.radio, isSelected && styles.radioSelected]}
                >
                  {isSelected && <Text style={styles.radioCheck}>✓</Text>}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.bottomFadeWrap} pointerEvents="none">
        <Svg width={SCREEN_W} height={180}>
          <Defs>
            <LinearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={Colors.black} stopOpacity={0} />
              <Stop offset="1" stopColor={Colors.black} stopOpacity={0.16} />
            </LinearGradient>
          </Defs>
          <Rect width={SCREEN_W} height={180} fill="url(#bottomFade)" />
        </Svg>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            selected ? styles.continueBtnActive : styles.continueBtnDisabled,
          ]}
          activeOpacity={0.85}
          onPress={goNext}
        >
          <Text
            style={[styles.continueText, selected && styles.continueTextActive]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>

      <LanguageSheet visible={langOpen} onClose={() => setLangOpen(false)} />
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
    marginHorizontal: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
  flagBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.black,
    lineHeight: 34,
    marginTop: 28,
  },
  options: {
    marginTop: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  optionSelected: {
    borderColor: Colors.black,
  },
  optionText: {
    fontSize: 17,
    color: Colors.darkText,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  radioCheck: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  bottomFadeWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
