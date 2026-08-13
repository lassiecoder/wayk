/**
 * "Pick your alarm sound" screen — single-select sound list grouped into
 * sections (Classic, Viral), each section rendered as one continuous card
 * with dividers between rows. Every row but the current default has a
 * play button to preview the sound (preview itself isn't wired up — no
 * audio asset exists yet, this just tracks selection).
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
import { Ionicons } from '@react-native-vector-icons/ionicons';

type Sound = {
  id: string;
  name: string;
  color: string;
  isBell?: boolean;
};

type Section = {
  emoji: string;
  label: string;
  sounds: Sound[];
};

const SECTIONS: Section[] = [
  {
    emoji: '🔔',
    label: 'CLASSIC',
    sounds: [
      { id: 'default', name: 'Default', color: '#9B9BA1', isBell: true },
      { id: 'alarmClock', name: 'Alarm Clock', color: '#3E4C63' },
      { id: 'reveille', name: 'Reveille', color: '#74822F' },
      { id: 'sparkles', name: 'Sparkles', color: '#A47FD6' },
    ],
  },
  {
    emoji: '🔥',
    label: 'VIRAL',
    sounds: [
      { id: 'mindfulEarth', name: 'Mindful Earth', color: '#319B7A' },
      { id: 'epicBrass', name: 'Epic Brass', color: '#D1A62A' },
      { id: 'neon', name: 'Neon', color: '#A99BEA' },
      { id: 'dialed', name: 'Dialed', color: '#BD5B44' },
    ],
  },
];

const DEFAULT_SOUND = 'default';

export default function AlarmSoundScreen({
  progress,
  onBack,
  onContinue,
}: {
  progress: number;
  onBack: () => void;
  onContinue: (soundId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(DEFAULT_SOUND);

  // Title slides in from the right; the sound list slides up from the
  // bottom, both driven by the same timer, same pattern used across the
  // other setup/question screens.
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

  const listReveal = {
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
        Pick your alarm sound
      </Animated.Text>

      <Animated.ScrollView
        style={[styles.list, listReveal]}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map(section => (
          <View key={section.label} style={styles.section}>
            <Text style={styles.sectionLabel}>
              {section.emoji} {section.label}
            </Text>
            <View style={styles.card}>
              {section.sounds.map((sound, i) => {
                const isSelected = selected === sound.id;
                return (
                  <TouchableOpacity
                    key={sound.id}
                    style={[
                      styles.row,
                      i < section.sounds.length - 1 && styles.rowDivider,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelected(sound.id)}
                  >
                    <View style={[styles.avatar, { backgroundColor: sound.color }]}>
                      {sound.isBell && (
                        <Ionicons name="notifications" size={16} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.rowName}>{sound.name}</Text>
                    {!sound.isBell && (
                      <TouchableOpacity style={styles.playBtn} activeOpacity={0.7}>
                        <Ionicons name="play" size={13} color="#4A4A4C" />
                      </TouchableOpacity>
                    )}
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.continueBtn}
          activeOpacity={0.85}
          onPress={() => onContinue(selected)}
        >
          <Text style={styles.continueText}>Continue</Text>
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
  list: {
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 120,
  },
  section: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A8A8E',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 14,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(120,120,128,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
    backgroundColor: '#000000',
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
