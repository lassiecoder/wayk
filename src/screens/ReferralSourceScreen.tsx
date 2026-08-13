/**
 * "Where did you hear about us?" screen — single-select source list, same
 * icon-badge/border-select card pattern as MissionSelectScreen. Brand
 * icons come from the installed vector-icon packages as flat single-color
 * glyphs (no gradients available), so each avatar approximates the
 * brand's color instead of reproducing its exact mark.
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
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Ionicons } from '@react-native-vector-icons/ionicons';

type Source = {
  id: string;
  name: string;
  iconSet: 'mdi' | 'ion';
  icon: string;
  bg: string;
  color: string;
};

const SOURCES: Source[] = [
  { id: 'doctor', name: 'Doctor', iconSet: 'mdi', icon: 'stethoscope', bg: '#EDEDED', color: '#1A1A1A' },
  { id: 'instagram', name: 'Instagram', iconSet: 'mdi', icon: 'instagram', bg: '#FFFFFF', color: '#C13584' },
  { id: 'facebook', name: 'Facebook', iconSet: 'mdi', icon: 'facebook', bg: '#1877F2', color: '#FFFFFF' },
  { id: 'twitter', name: 'Twitter', iconSet: 'ion', icon: 'logo-x', bg: '#EDEDED', color: '#000000' },
  { id: 'youtube', name: 'YouTube', iconSet: 'ion', icon: 'logo-youtube', bg: '#FF0000', color: '#FFFFFF' },
  { id: 'reddit', name: 'Reddit', iconSet: 'mdi', icon: 'reddit', bg: '#FF4500', color: '#FFFFFF' },
];

function SourceIcon({ source }: { source: Source }) {
  return (
    <View style={[styles.avatar, { backgroundColor: source.bg }]}>
      {source.iconSet === 'mdi' ? (
        <MaterialDesignIcons name={source.icon as never} size={22} color={source.color} />
      ) : (
        <Ionicons name={source.icon as never} size={22} color={source.color} />
      )}
    </View>
  );
}

export default function ReferralSourceScreen({
  progress,
  onBack,
  onContinue,
}: {
  progress: number;
  onBack: () => void;
  onContinue: (sourceId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  // Title slides in from the right, same technique as
  // MissionSelectScreen/SetAlarmScreen/DaysScreen's title reveal.
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
        Where did you hear about us?
      </Animated.Text>

      <Animated.ScrollView
        style={[styles.list, listReveal]}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {SOURCES.map(source => {
          const isSelected = selected === source.id;
          return (
            <TouchableOpacity
              key={source.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              activeOpacity={0.8}
              onPress={() => setSelected(source.id)}
            >
              <SourceIcon source={source} />
              <Text style={styles.cardName}>{source.name}</Text>
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>

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
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cardSelected: {
    borderColor: '#000000',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 14,
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
