/**
 * "Choose your wake up mission" screen — a single-select list of alarm
 * dismissal tasks. Icons come from the installed vector-icon packages
 * (@react-native-vector-icons/material-design-icons + /ionicons) rather
 * than custom art, since no matching illustrations exist in assets/.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Ionicons } from '@react-native-vector-icons/ionicons';

type Mission = {
  id: string;
  title: string;
  subtitle: string;
  iconSet: 'mdi' | 'ion';
  icon: string;
  bg: string;
  color: string;
};

export const MISSIONS: Mission[] = [
  {
    id: 'objectHunt',
    title: 'Object Hunt',
    subtitle: 'Photograph a random object',
    iconSet: 'ion',
    icon: 'scan-outline',
    bg: '#E8E9F5',
    color: '#5B5FC7',
  },
  {
    id: 'pushUps',
    title: 'Push Ups',
    subtitle: '15 seconds of push-ups',
    iconSet: 'mdi',
    icon: 'arm-flex',
    bg: '#FBE7E7',
    color: '#B5484D',
  },
  {
    id: 'squats',
    title: 'Squats',
    subtitle: '15 seconds of squats',
    iconSet: 'mdi',
    icon: 'human-handsdown',
    bg: '#FBEEE0',
    color: '#C4762B',
  },
  {
    id: 'mathProblem',
    title: 'Math Problem',
    subtitle: 'Solve math problems',
    iconSet: 'mdi',
    icon: 'square-root',
    bg: '#F3E8F7',
    color: '#8E4EC6',
  },
  {
    id: 'skyPhoto',
    title: 'Sky Photo',
    subtitle: 'Photograph the morning sky',
    iconSet: 'ion',
    icon: 'partly-sunny-outline',
    bg: '#E8EEF7',
    color: '#4A75B0',
  },
  {
    id: 'makeBed',
    title: 'Make Your Bed',
    subtitle: 'Show a made bed',
    iconSet: 'mdi',
    icon: 'bed',
    bg: '#EDE9F5',
    color: '#6B5B95',
  },
];

function MissionIcon({ mission }: { mission: Mission }) {
  return (
    <View style={[styles.iconBadge, { backgroundColor: mission.bg }]}>
      {mission.iconSet === 'mdi' ? (
        <MaterialDesignIcons name={mission.icon as never} size={26} color={mission.color} />
      ) : (
        <Ionicons name={mission.icon as never} size={26} color={mission.color} />
      )}
    </View>
  );
}

export default function MissionSelectScreen({
  progress,
  onBack,
  onContinue,
}: {
  progress: number;
  onBack: () => void;
  onContinue: (missionId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  // Title slides in from the right; each mission card fades/slides up from
  // the bottom, staggered by index — same revealAnim driver and easing as
  // the reveal used elsewhere, just different axes.
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

  const cardReveal = (i: number, count: number) => {
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
        <Text style={styles.title}>Choose your wake up mission</Text>
        <Text style={styles.subtitle}>You'll do this to turn off your alarm.</Text>
      </Animated.View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {MISSIONS.map((mission, i) => {
          const isSelected = selected === mission.id;
          return (
            <Animated.View key={mission.id} style={cardReveal(i, MISSIONS.length)}>
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => setSelected(mission.id)}
              >
                <MissionIcon mission={mission} />
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{mission.title}</Text>
                  <Text style={styles.cardSubtitle}>{mission.subtitle}</Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

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
  list: {
    marginTop: 24,
  },
  listContent: {
    paddingBottom: 120,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8A8A8E',
    marginTop: 2,
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
    borderColor: '#000000',
    backgroundColor: '#000000',
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
