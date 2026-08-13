/**
 * Bottom sheet for language selection, opened by tapping the flag badge.
 * Two snap points (peek / full) reached by dragging the header handle.
 * Dismiss via the close button or by dragging the sheet down past the
 * peek position.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

const { height: SCREEN_H } = Dimensions.get('window');

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
];

export default function LanguageSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const PEEK_Y = SCREEN_H - 300;
  const FULL_Y = insets.top + 30;
  const HIDDEN_Y = SCREEN_H;

  const translateY = useRef(new Animated.Value(HIDDEN_Y)).current;
  const currentSnap = useRef(PEEK_Y);
  const [selected, setSelected] = useState('en');

  useEffect(() => {
    if (visible) {
      currentSnap.current = PEEK_Y;
      translateY.setValue(HIDDEN_Y);
      Animated.spring(translateY, {
        toValue: PEEK_Y,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const close = useCallback(() => {
    Animated.timing(translateY, {
      toValue: HIDDEN_Y,
      duration: 240,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onClose());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        translateY.stopAnimation(() => {
          translateY.setOffset(currentSnap.current);
          translateY.setValue(0);
        });
      },
      onPanResponderMove: (_, g) => {
        const clamped = Math.max(g.dy, FULL_Y - currentSnap.current);
        translateY.setValue(clamped);
      },
      onPanResponderRelease: (_, g) => {
        translateY.flattenOffset();
        const finalY = currentSnap.current + g.dy;

        if (g.dy > 120 || g.vy > 1.2) {
          currentSnap.current = HIDDEN_Y;
          close();
          return;
        }
        if (finalY < (FULL_Y + PEEK_Y) / 2 || g.vy < -0.8) {
          currentSnap.current = FULL_Y;
        } else {
          currentSnap.current = PEEK_Y;
        }
        Animated.spring(translateY, {
          toValue: currentSnap.current,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      },
    }),
  ).current;

  const backdropOpacity = translateY.interpolate({
    inputRange: [FULL_Y, PEEK_Y, HIDDEN_Y],
    outputRange: [0.5, 0.5, 0],
    extrapolate: 'clamp',
  });

  if (!visible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          { height: SCREEN_H - FULL_Y, transform: [{ translateY }] },
        ]}>
        <View {...panResponder.panHandlers}>
          <View style={styles.handleBar} />
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={close}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Language</Text>
          </View>
        </View>

        <FlatList
          data={LANGUAGES}
          keyExtractor={item => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => setSelected(item.code)}>
              <Text style={styles.flag}>{item.flag}</Text>
              <Text style={styles.langName}>{item.name}</Text>
              {selected === item.code && (
                <View style={styles.check}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: Colors.black,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handleBar: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    marginTop: 10,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  closeBtn: {
    position: 'absolute',
    left: 20,
    top: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: Colors.subtleText,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  flag: {
    fontSize: 26,
    marginRight: 16,
  },
  langName: {
    flex: 1,
    fontSize: 17,
    color: Colors.darkText,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.successAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 24,
  },
});
