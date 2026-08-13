/**
 * "Create an account" gate, shown after the referral ask and before the
 * Morning Plan recap. No auth SDK is wired up (no Apple/Google sign-in
 * package installed, no backend) — Apple, Google, and Skip all just
 * advance the flow, same mock convention as the rest of onboarding's
 * unwired choices (e.g. AlarmSoundScreen's preview buttons).
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function CreateAccountScreen({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();

  // Title/subtitle slide in from the right; the sign-in buttons slide up
  // from the bottom, both driven by the same timer, same pattern used
  // across the other setup/insight screens.
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

  const buttonsReveal = {
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

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.content}>
        <Animated.View style={titleReveal}>
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>Keep your alarms, streak, and badges safe.</Text>
        </Animated.View>

        <Animated.View style={[styles.buttonsWrap, buttonsReveal]}>
          <TouchableOpacity style={styles.appleBtn} activeOpacity={0.85} onPress={onContinue}>
            <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={styles.btnIcon} />
            <Text style={styles.appleText}>Sign in with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85} onPress={onContinue}>
            <Ionicons name="logo-google" size={18} color="#1A1A1A" style={styles.btnIcon} />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={onContinue}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>
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
  content: {
    marginTop: 220,
    alignItems: 'center',
  },
  buttonsWrap: {
    width: '100%',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#8A8A8E',
    textAlign: 'center',
    marginTop: 8,
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 32,
    paddingVertical: 17,
    marginTop: 32,
    backgroundColor: '#000000',
  },
  appleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 32,
    paddingVertical: 17,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  googleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  btnIcon: {
    marginRight: 8,
  },
  skipText: {
    fontSize: 15,
    color: '#8A8A8E',
    marginTop: 20,
  },
});
