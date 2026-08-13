/**
 * "Lock in your commitment" screen — an actual signature pad (PanResponder
 * capturing touch strokes, rendered as an SVG path) rather than a static
 * mock. Once the user draws something, the pad border animates to green,
 * a checkmark badge scales/glows in, and a "COMMITMENT LOCKED" watermark
 * fades in behind it; the CTA unlocks from "I Commit" to "Continue".
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../theme/colors';

const PAD_HEIGHT = 380;

type Point = { x: number; y: number };

function pointsToPath(points: Point[]) {
  if (points.length === 0) {
    return '';
  }
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
}

export default function CommitmentScreen({
  wakeTime,
  progress,
  onBack,
  onContinue,
}: {
  wakeTime: string;
  progress: number;
  onBack: () => void;
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const currentStroke = useRef<Point[]>([]);
  const [, forceRender] = useState(0);
  const hasSigned = strokes.length > 0;

  const lockAnim = useRef(new Animated.Value(0)).current;

  // Title/subtitle slide in from the right; the signature pad slides up
  // from the bottom, both driven by the same timer on mount — separate
  // from lockAnim, which only fires once the user actually signs.
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

  const padReveal = {
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

  useEffect(() => {
    if (hasSigned) {
      Animated.timing(lockAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: false,
      }).start();
    } else {
      lockAnim.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSigned]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: e => {
        currentStroke.current = [
          { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY },
        ];
        forceRender(n => n + 1);
      },
      onPanResponderMove: e => {
        currentStroke.current = [
          ...currentStroke.current,
          { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY },
        ];
        forceRender(n => n + 1);
      },
      onPanResponderRelease: () => {
        if (currentStroke.current.length > 1) {
          setStrokes(prev => [...prev, currentStroke.current]);
        }
        currentStroke.current = [];
      },
    }),
  ).current;

  const clearSignature = () => {
    setStrokes([]);
    currentStroke.current = [];
  };

  const borderColor = lockAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.borderLight, Colors.success],
  });
  const badgeScale = lockAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const badgeOpacity = lockAnim;
  const watermarkOpacity = lockAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

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
        <Text style={styles.title}>Lock in your commitment</Text>
        <Text style={styles.subtitle}>
          Sign below to put the phone down and get up at {wakeTime}.
        </Text>
      </Animated.View>

      {/* Two nested Animated.Views: the outer carries only the native-driven
          reveal transform/opacity, the inner only the JS-driven border
          color. Animated can't mix a native- and JS-driven node in the
          same style array on one view without crashing once both have
          started. */}
      <Animated.View style={padReveal}>
        <Animated.View style={[styles.pad, { borderColor }]}>
          {!hasSigned && (
            <View style={styles.placeholder} pointerEvents="none">
              <Text style={styles.placeholderTitle}>Sign here</Text>
              <Text style={styles.placeholderSubtitle}>
                your commitment to wake up
              </Text>
            </View>
          )}

          <Animated.Text style={[styles.watermark, { opacity: watermarkOpacity }]}>
            COMMITMENT LOCKED
          </Animated.Text>

          <View style={styles.canvas} {...panResponder.panHandlers}>
            <Svg width="100%" height="100%">
              {strokes.map((stroke, i) => (
                <Path
                  key={i}
                  d={pointsToPath(stroke)}
                  stroke={Colors.darkText}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
              {currentStroke.current.length > 1 && (
                <Path
                  d={pointsToPath(currentStroke.current)}
                  stroke={Colors.darkText}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}
            </Svg>
          </View>

          {hasSigned && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.checkBadge,
                { opacity: badgeOpacity, transform: [{ scale: badgeScale }] },
              ]}
            >
              <Ionicons name="checkmark" size={30} color={Colors.white} />
            </Animated.View>
          )}

          <View style={styles.signLine} pointerEvents="none" />
          <TouchableOpacity style={styles.clearBtn} onPress={clearSignature}>
            <Ionicons name="close" size={16} color={Colors.mutedText} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            hasSigned ? styles.continueBtnActive : styles.continueBtnDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!hasSigned}
          onPress={onContinue}
        >
          <Text
            style={[styles.continueText, hasSigned && styles.continueTextActive]}
          >
            {hasSigned ? 'Continue' : '✓  I Commit'}
          </Text>
        </TouchableOpacity>
      </View>
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
    textAlign: 'center',
    lineHeight: 34,
    marginTop: 28,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.mutedText,
    textAlign: 'center',
    marginTop: 8,
  },
  pad: {
    height: PAD_HEIGHT,
    marginTop: 32,
    backgroundColor: Colors.white,
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 48,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.placeholder,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#D1D1D6',
    marginTop: 6,
  },
  watermark: {
    position: 'absolute',
    top: '46%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.success,
  },
  canvas: {
    flex: 1,
  },
  checkBadge: {
    position: 'absolute',
    top: '38%',
    alignSelf: 'center',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#4CBB80',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  signLine: {
    position: 'absolute',
    left: 48,
    right: 24,
    bottom: 32,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  clearBtn: {
    position: 'absolute',
    left: 20,
    bottom: 24,
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
