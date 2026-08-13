/**
 * "Why doing push ups wakes you up" insight screen, shown after
 * ExerciseSetupScreen for exercise missions with insight copy. Same
 * unlock-after-delay Continue convention as BiologyScreen — no animation
 * to wait on, just a beat to let the reader take in the copy.
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

const UNLOCK_DELAY_MS = 1000;

export default function ExerciseInsightScreen({
  title,
  image,
  heading,
  body,
  progress,
  onBack,
  onContinue,
}: {
  title: string;
  image: number;
  heading: string;
  body: string;
  progress: number;
  onBack: () => void;
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setUnlocked(true), UNLOCK_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  // Title slides in from the right; the image/heading/body block slides up
  // from the bottom, both driven by the same timer, same pattern used
  // across the other insight/setup screens.
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

  const contentReveal = {
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

      <Animated.Text style={[styles.title, titleReveal]}>{title}</Animated.Text>

      <Animated.View style={[styles.content, contentReveal]}>
        <Animated.Image source={image} style={styles.image} resizeMode="contain" />
        <Text style={styles.heading}>{heading}</Text>
        <Text style={styles.body}>{body}</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  image: {
    width: 180,
    height: 180,
  },
  heading: {
    fontSize: 19,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginTop: 24,
  },
  body: {
    fontSize: 16,
    color: '#8A8A8E',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
    marginHorizontal: 12,
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
