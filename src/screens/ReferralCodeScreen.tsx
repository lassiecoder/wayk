/**
 * "Enter referral code (optional)" screen. Continue has no gating — the
 * field is optional, matching the title. Submit inside the input row only
 * activates once something's typed; it doesn't validate against a
 * backend, it just commits the code the same way Continue would.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

export default function ReferralCodeScreen({
  progress,
  onBack,
  onContinue,
}: {
  progress: number;
  onBack: () => void;
  onContinue: (code: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const hasCode = code.trim().length > 0;

  // Title slides in from the right; the input row slides up from the
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

  const inputReveal = {
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 12 }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>

        <Animated.View style={titleReveal}>
          <Text style={styles.title}>Enter referral code (optional)</Text>
          <Text style={styles.subtitle}>Have a friend's code? You'll both get credit.</Text>
        </Animated.View>

        <Animated.View style={[styles.middle, inputReveal]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Referral Code"
              placeholderTextColor={Colors.mutedText}
              autoCapitalize="characters"
              value={code}
              onChangeText={setCode}
            />
            <TouchableOpacity
              style={[styles.submitBtn, hasCode && styles.submitBtnActive]}
              activeOpacity={0.85}
              disabled={!hasCode}
              onPress={() => onContinue(code.trim())}
            >
              <Text
                style={[styles.submitText, hasCode && styles.submitTextActive]}
              >
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.continueBtn}
            activeOpacity={0.85}
            onPress={() => onContinue(code.trim())}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
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
    fontSize: 28,
    fontWeight: '800',
    color: Colors.black,
    lineHeight: 34,
    marginTop: 28,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.mutedText,
    marginTop: 8,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 28,
    padding: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  submitBtn: {
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(120,120,128,0.32)',
  },
  submitBtnActive: {
    backgroundColor: Colors.black,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(60,60,67,0.6)',
  },
  submitTextActive: {
    color: Colors.white,
  },
  bottom: {
    alignItems: 'center',
    marginBottom: 40,
  },
  continueBtn: {
    width: '100%',
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
});
