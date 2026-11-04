import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
} from 'react-native-reanimated';
import { haptics } from '../../utils/haptics';
import { useT } from '../../i18n';

interface CarouselDotProps {
  index: number;
  scrollProgress: SharedValue<number>;
  totalCount: number;
}

export const CarouselDot: React.FC<CarouselDotProps> = React.memo(
  ({ index, scrollProgress, totalCount }) => {
    const animatedDotStyle = useAnimatedStyle(() => {
      const diff = Math.abs(scrollProgress.value - index);
      const width = interpolate(diff, [0, 0.7, 1], [20, 10, 6], Extrapolation.CLAMP);
      const opacity = interpolate(diff, [0, 0.8, 1], [1, 0.65, 0.42], Extrapolation.CLAMP);
      const scale =
        totalCount > 5
          ? interpolate(diff, [1, 2.5], [1, 0.72], Extrapolation.CLAMP)
          : 1;

      return {
        width,
        opacity,
        transform: [{ scale }],
      };
    });

    return (
      <Reanimated.View
        style={[
          {
            height: 6,
            borderRadius: 3,
            backgroundColor: '#FFFFFF',
            marginHorizontal: 3,
          },
          animatedDotStyle,
        ]}
      />
    );
  }
);

interface FeedCardMediaProps {
  images: string[];
  postTag?: string;
  pagerRef: React.RefObject<any>;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  imageLoaded: Record<number, boolean>;
  setImageLoaded: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  imageError: Record<number, boolean>;
  setImageError: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  scrollProgress: SharedValue<number>;
  counterAnimatedStyle: any;
  triggerCounterVisibility: () => void;
  showHeartAnimation: boolean;
  heartScale: Animated.Value;
  heartOpacity: Animated.Value;
  heartTranslateY: Animated.Value;
  onImageTap: () => void;
  onTagPress?: () => void;
  styles: any;
  colors: any;
  isDark: boolean;
}

export const FeedCardMedia: React.FC<FeedCardMediaProps> = React.memo(({
  images,
  postTag,
  pagerRef,
  currentImageIndex,
  setCurrentImageIndex,
  imageLoaded,
  setImageLoaded,
  imageError,
  setImageError,
  scrollProgress,
  counterAnimatedStyle,
  triggerCounterVisibility,
  showHeartAnimation,
  heartScale,
  heartOpacity,
  heartTranslateY,
  onImageTap,
  onTagPress,
  styles,
  colors,
  isDark,
}) => {
  const { t } = useT();
  const totalImages = images.length;

  return (
    <View style={styles.mediaWrapper}>
      <PagerView
        ref={pagerRef}
        style={styles.imageContainer}
        initialPage={0}
        scrollEnabled={true}
        offscreenPageLimit={1}
        overdrag={false}
        onPageScroll={(e) => {
          scrollProgress.value = e.nativeEvent.position + e.nativeEvent.offset;
          triggerCounterVisibility();
        }}
        onPageSelected={(e) => {
          const nextIndex = e.nativeEvent.position;
          scrollProgress.value = withTiming(nextIndex, { duration: 160 });
          if (nextIndex !== currentImageIndex) {
            setCurrentImageIndex(nextIndex);
            haptics.selection();
          }
          triggerCounterVisibility();
        }}
      >
        {images.map((img, index) => {
          const isImgLoaded = Boolean(imageLoaded[index]);
          const isImgError = Boolean(imageError[index] || !img);

          return (
            <View key={index} style={styles.pageItem}>
              <TouchableWithoutFeedback onPress={onImageTap}>
                <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                  {(!isImgLoaded || isImgError) && (
                    <View style={styles.placeholderContainer} pointerEvents="none">
                      <View style={styles.placeholderGlow} />
                      <View style={styles.placeholderIconWrapper}>
                        <MaterialCommunityIcons
                          name="feather"
                          size={36}
                          color={isDark ? '#A3D494' : colors.primary}
                        />
                      </View>
                      <Text style={styles.placeholderBadgeText}>
                        {isImgError ? t('feed.sightingTagDefault') : t('feed.loadingPhoto')}
                      </Text>
                      <Text style={styles.placeholderBirdTitle} numberOfLines={2}>
                        {postTag || t('feed.unidentifiedBird')}
                      </Text>
                      {isImgError ? (
                        <View style={styles.placeholderStatusPill}>
                          <Ionicons name="image-outline" size={13} color={colors.textSecondary} />
                          <Text style={styles.placeholderStatusText}>{t('feed.photoUnavailable')}</Text>
                        </View>
                      ) : (
                        <View style={styles.placeholderStatusPill}>
                          <ActivityIndicator size="small" color={colors.primary} />
                          <Text style={styles.placeholderStatusText}>{t('feed.loadingImage')}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {Boolean(img) && !isImgError && (
                    <ExpoImage
                      source={{ uri: img }}
                      style={[styles.postImage, { opacity: isImgLoaded ? 1 : 0 }]}
                      transition={200}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      onLoad={() => {
                        setImageLoaded((prev) => ({ ...prev, [index]: true }));
                      }}
                      onError={() => {
                        setImageError((prev) => ({ ...prev, [index]: true }));
                      }}
                    />
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          );
        })}
      </PagerView>

      {/* Double-tap animated heart */}
      {showHeartAnimation && (
        <View style={styles.heartOverlay} pointerEvents="none">
          <Animated.View
            style={[
              styles.heartAnimated,
              {
                transform: [
                  { scale: heartScale },
                  { translateY: heartTranslateY },
                ],
                opacity: heartOpacity,
              },
            ]}
          >
            <Ionicons name="heart" size={110} color="#FF2E63" style={styles.heartIcon} />
          </Animated.View>
        </View>
      )}

      {/* Quick Nav Chevron Izquierda */}
      {totalImages > 1 && currentImageIndex > 0 && (
        <Reanimated.View style={[styles.navArrowLeft, counterAnimatedStyle]}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              haptics.light();
              const prev = currentImageIndex - 1;
              scrollProgress.value = withTiming(prev, { duration: 180 });
              pagerRef.current?.setPage(prev);
            }}
            style={styles.navArrowBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </Reanimated.View>
      )}

      {/* Quick Nav Chevron Derecha */}
      {totalImages > 1 && currentImageIndex < totalImages - 1 && (
        <Reanimated.View style={[styles.navArrowRight, counterAnimatedStyle]}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              haptics.light();
              const next = currentImageIndex + 1;
              scrollProgress.value = withTiming(next, { duration: 180 });
              pagerRef.current?.setPage(next);
            }}
            style={styles.navArrowBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={t('common.next') || 'Siguiente'}
          >
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </Reanimated.View>
      )}

      {/* Image Counter animado con auto-fadeout suave */}
      {totalImages > 1 && (
        <Reanimated.View style={[styles.imageCounter, counterAnimatedStyle]} pointerEvents="none">
          <Text style={styles.imageCounterText}>
            {currentImageIndex + 1} / {totalImages}
          </Text>
        </Reanimated.View>
      )}

      {/* Carousel Dots animados con interpolación continua */}
      {totalImages > 1 && (
        <View style={styles.dotsContainer} pointerEvents="none">
          {images.map((_, index) => (
            <CarouselDot
              key={index}
              index={index}
              scrollProgress={scrollProgress}
              totalCount={totalImages}
            />
          ))}
        </View>
      )}

      {/* Tag Badge de Especie de Ave */}
      {postTag ? (
        <TouchableOpacity
          style={styles.tagBadge}
          activeOpacity={0.8}
          onPress={onTagPress}
          disabled={!onTagPress}
        >
          <MaterialCommunityIcons name="feather" size={13} color={colors.primary} />
          <Text style={styles.tagText} numberOfLines={1}>
            {postTag}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
});
