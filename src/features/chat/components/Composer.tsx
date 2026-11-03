import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Radius, Typography } from '../../../theme';
import { ReplyQuote } from './ReplyQuote';
import { AttachmentModal } from './AttachmentModal';
import { ChatMessage } from '../types';
import { useT } from '../../../i18n';

interface ComposerProps {
  text: string;
  onChangeText: (text: string) => void;
  selectedImage: string | null;
  onClearImage: () => void;
  onSelectImage: (uri: string) => void;
  replyingTo: ChatMessage | null;
  onClearReply: () => void;
  onSend: () => void;
  onTyping: () => void;
}

export const Composer: React.FC<ComposerProps> = ({
  text,
  onChangeText,
  selectedImage,
  onClearImage,
  onSelectImage,
  replyingTo,
  onClearReply,
  onSend,
  onTyping,
}) => {
  const { colors } = useDynamicStyles();
  const insets = useSafeAreaInsets();
  const { t } = useT();

  const [showAttachModal, setShowAttachModal] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardOpen(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardOpen(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const canSend = text.trim().length > 0 || selectedImage !== null;

  const handlePickImage = async (useCamera = false) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('common.error'), t('chat.imagePermissionDenied'));
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.85,
        });
        if (!result.canceled && result.assets[0]?.uri) {
          onSelectImage(result.assets[0].uri);
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('common.error'), t('chat.imagePermissionDenied'));
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.85,
        });
        if (!result.canceled && result.assets[0]?.uri) {
          onSelectImage(result.assets[0].uri);
        }
      }
    } catch (e) {
      console.warn('[Composer] Image picker error:', e);
    }
  };

  const handleAttachPress = () => {
    setShowAttachModal(true);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border + '20',
          paddingBottom: isKeyboardOpen ? 6 : Math.max(insets.bottom, 8),
        },
      ]}
    >
      {/* Vista previa de respuesta */}
      {replyingTo && (
        <View style={styles.previewBar}>
          <View style={styles.previewContent}>
            <ReplyQuote
              reply={{
                id: replyingTo.id,
                text: replyingTo.text,
                imagePath: replyingTo.imagePath || replyingTo.localImageUri || null,
                senderName:
                  replyingTo.sender?.fullname ||
                  replyingTo.sender?.username ||
                  t('chat.yourself'),
              }}
              isMine={false}
            />
          </View>
          <TouchableOpacity
            style={styles.closePreviewBtn}
            onPress={onClearReply}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Vista previa de imagen seleccionada */}
      {selectedImage && (
        <View style={styles.imagePreviewWrap}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.imagePreview}
            contentFit="cover"
          />
          <TouchableOpacity
            style={styles.removeImgBtn}
            onPress={onClearImage}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Barra de entrada */}
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.attachBtn}
          activeOpacity={0.7}
          onPress={handleAttachPress}
          accessibilityLabel="Adjuntar foto"
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>

        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.componentBase,
              borderColor: colors.border + '30',
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                fontFamily: Typography.fontFamilyBody,
              },
            ]}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={colors.placeholder}
            value={text}
            onChangeText={(val) => {
              onChangeText(val);
              onTyping();
            }}
            multiline
            maxLength={2000}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor: canSend ? colors.primary : colors.componentBase,
              opacity: canSend ? 1 : 0.6,
            },
          ]}
          disabled={!canSend}
          activeOpacity={0.8}
          onPress={onSend}
          accessibilityLabel="Enviar mensaje"
        >
          <Ionicons
            name="arrow-up"
            size={20}
            color={canSend ? '#FFFFFF' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Modal de adjuntar imagen con diseño moderno */}
      <AttachmentModal
        visible={showAttachModal}
        onClose={() => setShowAttachModal(false)}
        onPickCamera={() => handlePickImage(true)}
        onPickGallery={() => handlePickImage(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  previewContent: {
    flex: 1,
  },
  closePreviewBtn: {
    padding: 6,
    marginLeft: 6,
  },
  imagePreviewWrap: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginLeft: 44,
    marginBottom: 8,
  },
  imagePreview: {
    width: 68,
    height: 68,
    borderRadius: Radius.sm,
  },
  removeImgBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  inputWrapper: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14.5,
    padding: 0,
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
});

