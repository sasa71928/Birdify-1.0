import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme';
import { useT } from '../../i18n';

interface FeedOptionsMenuModalProps {
  visible: boolean;
  isOwnPost: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onBlock: () => void;
  styles: any;
}

export const FeedOptionsMenuModal: React.FC<FeedOptionsMenuModalProps> = React.memo(({
  visible,
  isOwnPost,
  onClose,
  onEdit,
  onDelete,
  onReport,
  onBlock,
  styles,
}) => {
  const { t } = useT();
  const screenHeight = Dimensions.get('window').height;
  const optionsPanY = React.useRef(new Animated.Value(screenHeight)).current;

  const resetOptionsModal = React.useCallback(() => {
    Animated.timing(optionsPanY, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [onClose, optionsPanY, screenHeight]);

  const optionsPanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          optionsPanY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          Animated.timing(optionsPanY, {
            toValue: screenHeight,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          Animated.spring(optionsPanY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const optionsBackdropOpacity = optionsPanY.interpolate({
    inputRange: [0, screenHeight],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });

  React.useEffect(() => {
    if (visible) {
      Animated.spring(optionsPanY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      optionsPanY.setValue(screenHeight);
    }
  }, [visible, optionsPanY, screenHeight]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={resetOptionsModal}
    >
      <View style={styles.optionsOverlay}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: '#000', opacity: optionsBackdropOpacity },
          ]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={resetOptionsModal}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.optionsContent,
            { transform: [{ translateY: optionsPanY }] },
          ]}
        >
          <View
            {...optionsPanResponder.panHandlers}
            style={{ width: '100%', alignItems: 'center', paddingVertical: 10 }}
          >
            <View style={styles.modalHandle} />
          </View>

          <View style={styles.optionsList}>
            {isOwnPost && (
              <>
                <TouchableOpacity style={styles.optionItem} onPress={onEdit}>
                  <Ionicons name="pencil-outline" size={22} color={Colors.textPrimary} />
                  <Text style={styles.optionText}>{t('feed.editPost')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionItem} onPress={onDelete}>
                  <Ionicons name="trash-outline" size={22} color="#FF5252" />
                  <Text style={[styles.optionText, { color: '#FF5252' }]}>
                    {t('feed.deletePost')}
                  </Text>
                </TouchableOpacity>
                <View style={styles.optionDivider} />
              </>
            )}

            {!isOwnPost && (
              <>
                <TouchableOpacity style={styles.optionItem} onPress={onReport}>
                  <Ionicons name="flag-outline" size={22} color="#FF9800" />
                  <Text style={styles.optionText}>{t('feed.reportPost')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionItem} onPress={onBlock}>
                  <Ionicons name="ban-outline" size={22} color="#FF5252" />
                  <Text style={[styles.optionText, { color: '#FF5252' }]}>
                    {t('feed.blockUser')}
                  </Text>
                </TouchableOpacity>
                <View style={styles.optionDivider} />
              </>
            )}

            <TouchableOpacity style={styles.optionItem} onPress={resetOptionsModal}>
              <Ionicons name="close-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.optionText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});
