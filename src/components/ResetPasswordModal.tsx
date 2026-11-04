import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { useT } from '../i18n';

interface ResetPasswordModalProps {
  visible: boolean;
  onComplete: () => void;
}

export default function ResetPasswordModal({ visible, onComplete }: ResetPasswordModalProps) {
  const { colors } = useTheme();
  const { t } = useT();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        },
        card: {
          width: '100%',
          maxWidth: 380,
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: colors.border + '35',
        },
        iconWrap: {
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: colors.primary + '18',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          marginBottom: 14,
        },
        title: {
          fontSize: 19,
          fontFamily: 'PlusJakartaSans-Bold',
          color: colors.textPrimary,
          textAlign: 'center',
          marginBottom: 6,
        },
        subtitle: {
          fontSize: 13,
          fontFamily: 'BeVietnamPro',
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: 18,
          lineHeight: 19,
        },
        label: {
          fontSize: 13,
          fontFamily: 'PlusJakartaSans-SemiBold',
          color: colors.textPrimary,
          marginBottom: 6,
        },
        inputRow: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.componentBase,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border + '30',
          paddingHorizontal: 12,
          marginBottom: 14,
        },
        input: {
          flex: 1,
          height: 46,
          fontSize: 15,
          color: colors.textPrimary,
        },
        feedbackBox: {
          borderRadius: 10,
          padding: 10,
          marginBottom: 14,
        },
        feedbackText: {
          fontSize: 13,
          fontFamily: 'PlusJakartaSans-Medium',
          textAlign: 'center',
        },
        primaryBtn: {
          height: 48,
          borderRadius: 12,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 4,
        },
        primaryBtnText: {
          fontSize: 15,
          fontFamily: 'PlusJakartaSans-Bold',
          color: colors.canvasPure,
        },
        cancelBtn: {
          height: 42,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 8,
        },
        cancelBtnText: {
          fontSize: 14,
          fontFamily: 'PlusJakartaSans-SemiBold',
          color: colors.textSecondary,
        },
      }),
    [colors]
  );

  const resetForm = () => {
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setFeedback(null);
  };

  const handleSavePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setFeedback({ type: 'error', text: t('auth.fillAllFields') });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ type: 'error', text: t('auth.passwordMinLength') });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: t('auth.passwordsMustMatch') });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setFeedback({ type: 'success', text: t('auth.passwordUpdatedSuccess') });
      setTimeout(() => {
        resetForm();
        onComplete();
      }, 900);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || t('auth.passwordUpdateError'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    resetForm();
    onComplete();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="key-outline" size={26} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('auth.resetPasswordModalTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.resetPasswordModalSubtitle')}
          </Text>

          {feedback && (
            <View
              style={[
                styles.feedbackBox,
                {
                  backgroundColor:
                    feedback.type === 'error' ? colors.errorRed + '18' : colors.primary + '18',
                },
              ]}
            >
              <Text
                style={[
                  styles.feedbackText,
                  { color: feedback.type === 'error' ? colors.errorRed : colors.primary },
                ]}
              >
                {feedback.text}
              </Text>
            </View>
          )}

          <Text style={styles.label}>{t('auth.newPasswordLabel')}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              placeholder={t('auth.newPasswordPlaceholder')}
              placeholderTextColor={colors.placeholder}
              editable={!isSaving}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t('auth.confirmNewPasswordLabel')}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              placeholder={t('auth.confirmNewPasswordPlaceholder')}
              placeholderTextColor={colors.placeholder}
              editable={!isSaving}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, isSaving && { opacity: 0.7 }]}
            onPress={handleSavePassword}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel={t('auth.saveNewPassword')}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.canvasPure} />
            ) : (
              <Text style={styles.primaryBtnText}>{t('auth.updatePasswordBtn')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel={t('auth.closeRecoveryModal')}
          >
            <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
