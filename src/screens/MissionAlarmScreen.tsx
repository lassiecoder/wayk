/**
 * "Play your alarm during the mission?" screen — single-select question,
 * shown after AlarmSoundScreen. Same option-card/radio styling and
 * staggered reveal as QuestionnaireScreen's questions, kept as its own
 * screen since it isn't part of the QUESTIONS array flow.
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

const OPTIONS = [
  'Keep alarm ringing while completing the mission.',
  'Silence the alarm during my mission. It rings again if I leave the app.',
];

export default function MissionAlarmScreen({
  progress,
  onBack,
  onContinue,
}: {
  progress: number;
  onBack: () => void;
  onContinue: (option: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  const revealAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 550 + OPTIONS.length * 90,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealAnim]);

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
        extrapolate: 'clamp' as const,
      }),
      transform: [
        {
          translateY: revealAnim.interpolate({
            inputRange: [start, end],
            outputRange: [16, 0],
            extrapolate: 'clamp' as const,
          }),
        },
      ],
    };
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

      <Animated.Text style={[styles.title, titleAnim]}>
        Play your alarm during the mission?
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, titleAnim]}>
        You can change this later in settings.
      </Animated.Text>

      <View style={styles.options}>
        {OPTIONS.map((option, i) => {
          const isSelected = selected === option;
          return (
            <Animated.View key={option} style={optionAnim(i, OPTIONS.length)}>
              <TouchableOpacity
                style={[styles.option, isSelected && styles.optionSelected]}
                activeOpacity={0.8}
                onPress={() => setSelected(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <Text style={styles.radioCheck}>✓</Text>}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            selected ? styles.continueBtnActive : styles.continueBtnDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!selected}
          onPress={() => selected && onContinue(selected)}
        >
          <Text
            style={[styles.continueText, !!selected && styles.continueTextActive]}
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
  subtitle: {
    fontSize: 15,
    color: '#8A8A8E',
    marginTop: 8,
  },
  options: {
    marginTop: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  optionSelected: {
    borderColor: '#000000',
  },
  optionText: {
    flex: 1,
    fontSize: 17,
    color: '#1A1A1A',
    marginRight: 16,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D8D8DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  radioCheck: {
    color: '#FFFFFF',
    fontSize: 12,
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
