import React, { useEffect } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { Typography, Radius } from '../../theme';
import { PressableScale } from './PressableScale';

export interface SegmentOption<T extends string = string> {
  id: T;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
  height?: number;
  compact?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  selectedId,
  onSelect,
  height = 42,
  compact = false,
}: SegmentedControlProps<T>) {
  const { colors, isDark } = useDynamicStyles();
  const reducedMotion = useReducedMotion();

  const [widths, setWidths] = React.useState<number[]>([]);
  const [containerWidth, setContainerWidth] = React.useState(0);

  const selectedIndex = Math.max(0, options.findIndex((o) => o.id === selectedId));
  const translateX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const isUniform = widths.length === options.length && widths.every((w, _, arr) => Math.abs(w - arr[0]) < 2);

  const calculatePosition = (idx: number) => {
    if (widths.length === options.length) {
      let offset = 4; // padding
      for (let i = 0; i < idx; i++) {
        offset += widths[i];
      }
      return { offset, width: widths[idx] };
    } else if (containerWidth > 0 && options.length > 0) {
      const segWidth = (containerWidth - 8) / options.length;
      return { offset: 4 + idx * segWidth, width: segWidth };
    }
    return { offset: 4, width: 0 };
  };

  useEffect(() => {
    const { offset, width } = calculatePosition(selectedIndex);
    if (width > 0) {
      if (reducedMotion) {
        translateX.value = offset;
        indicatorWidth.value = width;
      } else {
        translateX.value = withSpring(offset, { damping: 26, stiffness: 420, mass: 0.4 });
        indicatorWidth.value = withSpring(width, { damping: 26, stiffness: 420, mass: 0.4 });
      }
    }
  }, [selectedIndex, widths, containerWidth, reducedMotion]);

  const pillAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: indicatorWidth.value,
    };
  });

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const handleItemLayout = (index: number, e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidths((prev) => {
      const next = [...prev];
      next[index] = w;
      return next;
    });
  };

  return (
    <View
      onLayout={handleContainerLayout}
      style={[
        styles.container,
        {
          height,
          backgroundColor: isDark ? '#232524' : '#EAECE9',
        },
      ]}
    >
      {/* Sliding pill indicator */}
      <Animated.View
        style={[
          styles.pill,
          {
            height: height - 8,
            backgroundColor: colors.canvasPure,
            shadowColor: '#000',
            shadowOpacity: isDark ? 0.35 : 0.08,
          },
          pillAnimatedStyle,
        ]}
      />

      {/* Segments */}
      <View style={styles.segmentsRow}>
        {options.map((opt, idx) => {
          const isSelected = opt.id === selectedId;
          return (
            <PressableScale
              key={opt.id}
              activeScale={0.97}
              haptic="selection"
              onLayout={(e) => handleItemLayout(idx, e)}
              onPress={() => onSelect(opt.id)}
              style={[
                styles.segment,
                { height: height - 8 },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={opt.label}
            >
              <View style={styles.labelContainer}>
                {opt.icon && <View style={styles.iconWrap}>{opt.icon}</View>}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.labelText,
                    compact && styles.compactLabel,
                    {
                      color: isSelected ? colors.primary : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
                {opt.badge !== undefined && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: isSelected
                          ? colors.primary + '18'
                          : colors.componentBase,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: isSelected ? colors.primary : colors.textSecondary,
                        },
                      ]}
                    >
                      {opt.badge}
                    </Text>
                  </View>
                )}
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    padding: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    borderRadius: Radius.md,
    top: 4,
    left: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  segmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  iconWrap: {
    marginRight: 6,
  },
  labelText: {
    fontFamily: Typography.fontFamilyDisplay,
    fontSize: Typography.fontSize.sm,
  },
  compactLabel: {
    fontSize: Typography.fontSize.xs,
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
});

