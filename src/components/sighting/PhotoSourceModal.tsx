import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useT } from '../../i18n';

interface PhotoSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSource: (source: 'camera' | 'gallery') => void;
  panY: Animated.Value;
  backdropOpacity: Animated.AnimatedInterpolation<number>;
  panResponder: any;
  screenHeight: number;
  colors: any;
}

export const PhotoSourceModal: React.FC<PhotoSourceModalProps> = React.memo(({
  visible,
  onClose,
  onSelectSource,
  panY,
  backdropOpacity,
  panResponder,
  screenHeight,
  colors,
}) => {
  const { t } = useT();

  const handleDismiss = () => {
    Animated.timing(panY, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const modalStyles = React.useMemo(
    () =>
      StyleSheet.create({
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        },
        sheetContainer: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          paddingBottom: 36,
          alignItems: 'center',
        },
        dragIndicator: {
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.border + '40',
          marginBottom: 16,
        },
        sheetTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: 6,
        },
        sheetSubtitle: {
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 20,
        },
        optionsContainer: { width: '100%', gap: 12 },
        optionBtn: {
          width: '100%',
          height: 52,
          borderRadius: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
        optionIcon: { marginRight: 10 },
        optionText: { color: colors.canvasPure, fontSize: 15, fontWeight: '600' },
      }),
    [colors]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={modalStyles.modalOverlay}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: '#000', opacity: backdropOpacity },
          ]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={handleDismiss}
          />
        </Animated.View>

        <Animated.View
          style={[modalStyles.sheetContainer, { transform: [{ translateY: panY }] }]}
        >
          <View
            {...panResponder.panHandlers}
            style={{
              width: '100%',
              alignItems: 'center',
              paddingVertical: 15,
              marginTop: -10,
            }}
          >
            <View style={modalStyles.dragIndicator} />
          </View>
          <Text style={modalStyles.sheetTitle}>{t('sighting.addPhoto')}</Text>
          <Text style={modalStyles.sheetSubtitle}>{t('sighting.photoSourcePrompt')}</Text>

          <View style={modalStyles.optionsContainer}>
            <TouchableOpacity
              style={[modalStyles.optionBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
              onPress={() => onSelectSource('camera')}
            >
              <Ionicons
                name="camera"
                size={20}
                color={colors.canvasPure}
                style={modalStyles.optionIcon}
              />
              <Text style={modalStyles.optionText}>{t('sighting.takeWithCamera')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[modalStyles.optionBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
              onPress={() => onSelectSource('gallery')}
            >
              <Ionicons
                name="images"
                size={20}
                color={colors.canvasPure}
                style={modalStyles.optionIcon}
              />
              <Text style={modalStyles.optionText}>{t('sighting.selectFromGallery')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

