import React, { useEffect, useState, useRef } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  formatter?: (val: number) => string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 200,
  style,
  formatter,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      previousValueRef.current = value;
      return;
    }

    const startValue = previousValueRef.current;
    const endValue = value;
    const diff = endValue - startValue;

    if (diff === 0) {
      setDisplayValue(endValue);
      return;
    }

    const startTime = Date.now();
    let frameId: number;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + diff * ease);

      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        previousValueRef.current = endValue;
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [value, duration, reducedMotion]);

  const text = formatter ? formatter(displayValue) : displayValue.toString();

  return <Text style={style}>{text}</Text>;
};

