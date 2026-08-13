/**
 * Vertical-ticker text: when `text` changes, the old and new values sit
 * stacked in a single column that translates up by one line — the
 * odometer/slot-machine effect used on the wheel-picker screens' big time
 * display, whole-string rather than per-digit so it doesn't require the
 * hour's 1-vs-2-digit width to stay fixed. Both lines are normal-flow (not
 * absolutely positioned), so the container still sizes to its content.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TextStyle, View } from 'react-native';

const DURATION_MS = 280;

export default function RollingText({
  text,
  style,
  height = 54,
}: {
  text: string;
  style?: TextStyle | TextStyle[];
  height?: number;
}) {
  const [items, setItems] = useState([text]);
  const settled = useRef(text);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (text === settled.current) {
      return;
    }
    setItems([settled.current, text]);
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      settled.current = text;
      setItems([text]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height],
  });

  return (
    <View style={[styles.clip, { height }]}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {items.map((item, i) => (
          <Text key={i} style={[style, { height, lineHeight: height }]}>
            {item}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
});
