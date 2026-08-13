/**
 * Motivational-quote interstitial shown after WakeTargetScreen. Static
 * copy, same header/footer chrome as the other Wake-flow screens.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const UNLOCK_DELAY_MS = 1000;

export default function QuoteScreen({
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

  useEffect(() => {
    const id = setTimeout(() => setUnlocked(true), UNLOCK_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  // Same reveal used for the question title in QuestionnaireScreen: fade in
  // while sliding up from 16px, once on mount. The quote icon shares the
  // same fade/timing but slides in from the left instead.
  const revealAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealAnim]);

  const textReveal = {
    opacity: revealAnim,
    transform: [
      {
        translateY: revealAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };

  const iconReveal = {
    opacity: revealAnim,
    transform: [
      {
        translateX: revealAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-40, 0],
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

      <View style={styles.center}>
        <Animated.Image
          source={require('../../assets/images/inverted-commas.webp')}
          style={[styles.quoteIcon, iconReveal]}
          resizeMode="contain"
        />
        <Animated.View style={textReveal}>
          <Text style={styles.quote}>
            If you win the morning, you win the day.
          </Text>
          <Text style={styles.author}>Tim Ferriss</Text>
        </Animated.View>
      </View>

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
  center: {
    // flex: 1,
    marginTop: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteIcon: {
    width: 56,
    height: 56,
    marginBottom: 24,
  },
  quote: {
    fontSize: 30,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    color: '#000000',
    lineHeight: 38,
    textAlign: 'center',
  },
  author: {
    fontSize: 16,
    color: '#8A8A8E',
    marginTop: 20,
    textAlign: 'center',
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
