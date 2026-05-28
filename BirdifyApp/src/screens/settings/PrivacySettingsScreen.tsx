import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createStyles } from '../../styles/screens/settings/settingsSubScreens.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ProfileRepository } from '../../repositories/profile.repository';
import AppToast from '../../components/AppToast';

export default function PrivacySettingsScreen() {
  const navigation = useNavigation();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user, signOut } = useAuth();

  const [isPrivateProfile, setIsPrivateProfile] = useState(false);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ visible: boolean, message: string, type: 'success' | 'error' }>({ visible: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3500);
  };

  // Password Modal states
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const loadPrivacy = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('is_private')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setIsPrivateProfile(Boolean(data?.is_private));
      } catch (error) {
        console.error('Error loading privacy settings:', error);
      }
    };

    loadPrivacy();
  }, [user]);

  const handleTogglePrivateProfile = async (nextValue: boolean) => {
    if (!user || isSavingPrivacy) return;
    const previous = isPrivateProfile;
    setIsPrivateProfile(nextValue);
    setIsSavingPrivacy(true);

    try {
      await ProfileRepository.update(user.id, { is_private: nextValue });
      showToast(
        nextValue
          ? 'Tu perfil ahora es privado. Solo usuarios que se siguen mutuamente podrán ver Sightings, Logbook y Likes.'
          : 'Tu perfil ahora es público.',
        'success'
      );
    } catch (error) {
      console.error('Error updating private profile:', error);
      setIsPrivateProfile(previous);
      showToast('No se pudo actualizar la privacidad del perfil.', 'error');
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) {
      showToast('No se detectó un usuario autenticado.', 'error');
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Por favor completa todos los campos.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('La nueva contraseña y su confirmación no coinciden.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      // 1. Validar la contraseña actual intentando iniciar sesión
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (authError) {
        showToast('La contraseña actual es incorrecta.', 'error');
        setIsChangingPassword(false);
        return;
      }

      // 2. Actualizar la contraseña a la nueva
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      showToast('Tu contraseña ha sido cambiada correctamente.', 'success');
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'No se pudo cambiar la contraseña. Inténtalo de nuevo.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const handleDeleteAccount = () => {
    if (!user) return;
    setDeleteConfirmationText('');
    setDeleteModalVisible(true);
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'ELIMINAR') {
      showToast('Por favor escribe la palabra ELIMINAR.', 'error');
      return;
    }
    if (!user) return;

    setIsDeleting(true);
    try {
      // 1. Intentar eliminar el usuario de auth.users mediante un RPC (elimina de auth y por cascada de public)
      const { error: rpcError } = await supabase.rpc('delete_user');

      if (rpcError) {
        console.warn('RPC delete_user no disponible o falló, aplicando fallback a public.users:', rpcError);
        
        // 2. Fallback: eliminar al menos el registro público
        const { error: dbError } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id);

        if (dbError) throw dbError;
      }

      setDeleteModalVisible(false);
      setDeleteConfirmationText('');
      await signOut();
    } catch (err: any) {
      console.error('Error deleting account:', err);
      showToast('No se pudo eliminar tu cuenta. Por favor vuelve a intentarlo.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const localStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      width: '100%',
      maxWidth: 360,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border + '30',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      fontFamily: 'PlusJakartaSans-Bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: 14,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.componentBase,
      borderWidth: 1,
      borderColor: colors.border + '20',
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: colors.textPrimary,
    },
    btnContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      marginTop: 10,
    },
    btn: {
      flex: 1,
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnCancel: {
      borderWidth: 1.5,
      borderColor: colors.border + '60',
    },
    btnSave: {
      backgroundColor: colors.primary,
    },
    btnTextCancel: {
      color: colors.textSecondary,
      fontWeight: '600',
    },
    btnTextSave: {
      color: colors.canvasPure,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppToast
        visible={toast.visible && !passwordModalVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Privacy Settings Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-outline" size={22} color={colors.primary} />
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Private Profile</Text>
              <Text style={styles.settingSublabel}>Only mutual followers can see your sightings, logbook and likes.</Text>
            </View>
            <Switch
              value={isPrivateProfile}
              onValueChange={handleTogglePrivateProfile}
              disabled={isSavingPrivacy}
              trackColor={{ false: isDark ? '#444' : '#D1D1D1', true: colors.primary }}
              thumbColor={colors.canvasPure}
            />
          </View>
          <View style={styles.settingDivider} />
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BlockedUsers' as never)}
          >
            <Ionicons name="remove-circle-outline" size={22} color={colors.textPrimary} style={{marginRight: 12}} />
            <Text style={[styles.settingLabel, {flex: 1}]}>Blocked Users</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
          </TouchableOpacity>
        </View>

        {/* Account Security Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
          <Text style={styles.sectionTitle}>Account Security</Text>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={[styles.settingContent, { opacity: 0.5 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                <View style={{ backgroundColor: '#EEE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 }}>
                  <Text style={{ fontSize: 10, color: '#666', fontWeight: 'bold' }}>SOON</Text>
                </View>
              </View>
              <Text style={styles.settingSublabel}>Secure your account with a code.</Text>
            </View>
            <Switch
              value={false}
              disabled={true}
              trackColor={{ false: isDark ? '#444' : '#D1D1D1', true: colors.primary }}
              thumbColor={colors.canvasPure}
              style={{ opacity: 0.5 }}
            />
          </View>
          <View style={styles.settingDivider} />
          <TouchableOpacity 
            style={styles.settingRow} 
            activeOpacity={0.7}
            onPress={() => setPasswordModalVisible(true)}
          >
            <MaterialCommunityIcons name="dots-horizontal" size={22} color={colors.textPrimary} style={{marginRight: 12}} />
            <Text style={[styles.settingLabel, {flex: 1}]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
          </TouchableOpacity>
        </View>

        {/* Delete Account */}
        <TouchableOpacity 
          style={[styles.deleteBtn, isDeleting && { opacity: 0.6 }]} 
          activeOpacity={0.8}
          onPress={handleDeleteAccount}
          disabled={isDeleting || isChangingPassword}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.errorRed} />
          ) : (
            <>
              <View style={{
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.errorRed,
                borderRadius: 4,
                padding: 2,
                marginRight: 8
              }}>
                <Ionicons name="trash-outline" size={16} color={colors.errorRed} />
              </View>
              <Text style={styles.deleteBtnText}>Delete Account</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.deleteWarning}>
          Deleting your account will permanently remove all your sightings, journals, and data. This action cannot be undone.
        </Text>

      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isChangingPassword) setPasswordModalVisible(false);
        }}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContainer}>
            <Text style={localStyles.modalTitle}>Cambiar Contraseña</Text>

            <AppToast
              visible={toast.visible}
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(prev => ({ ...prev, visible: false }))}
              floating={false}
              containerStyle={{ marginBottom: 14, padding: 12, borderRadius: 10 }}
            />

            <View style={localStyles.inputGroup}>
              <Text style={localStyles.inputLabel}>Contraseña Actual</Text>
              <TextInput
                style={localStyles.input}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
                editable={!isChangingPassword}
              />
            </View>

            <View style={localStyles.inputGroup}>
              <Text style={localStyles.inputLabel}>Nueva Contraseña</Text>
              <TextInput
                style={localStyles.input}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
                editable={!isChangingPassword}
              />
            </View>

            <View style={localStyles.inputGroup}>
              <Text style={localStyles.inputLabel}>Confirmar Nueva Contraseña</Text>
              <TextInput
                style={localStyles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
                editable={!isChangingPassword}
              />
            </View>

            <View style={localStyles.btnContainer}>
              <TouchableOpacity
                style={[localStyles.btn, localStyles.btnCancel]}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                disabled={isChangingPassword}
              >
                <Text style={localStyles.btnTextCancel}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[localStyles.btn, localStyles.btnSave]}
                onPress={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator size="small" color={colors.canvasPure} />
                ) : (
                  <Text style={localStyles.btnTextSave}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) setDeleteModalVisible(false);
        }}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContainer}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.errorRed + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 10,
              }}>
                <Ionicons name="warning-outline" size={30} color={colors.errorRed} />
              </View>
              <Text style={[localStyles.modalTitle, { color: colors.errorRed, marginBottom: 4 }]}>⚠️ ¿Eliminar Cuenta?</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 18, fontFamily: 'PlusJakartaSans-Medium' }}>
                Esta acción es irreversible. Si decides eliminar tu cuenta de Birdify, se borrará de forma permanente:
              </Text>
            </View>

            <View style={{ backgroundColor: colors.componentBase, borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.errorRed, marginRight: 8 }} />
                <Text style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '500' }}>Perfil y nombre de usuario</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.errorRed, marginRight: 8 }} />
                <Text style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '500' }}>Avistamientos y fotos registradas</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.errorRed, marginRight: 8 }} />
                <Text style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '500' }}>Comentarios, reacciones y seguidores</Text>
              </View>
            </View>

            <View style={localStyles.inputGroup}>
              <Text style={[localStyles.inputLabel, { color: colors.textSecondary }]}>Escribe <Text style={{ fontWeight: 'bold', color: colors.errorRed }}>ELIMINAR</Text> para confirmar:</Text>
              <TextInput
                style={[localStyles.input, { borderColor: deleteConfirmationText.trim().toUpperCase() === 'ELIMINAR' ? colors.errorRed : colors.border + '20' }]}
                value={deleteConfirmationText}
                onChangeText={setDeleteConfirmationText}
                placeholder="ELIMINAR"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="characters"
                editable={!isDeleting}
              />
            </View>

            <View style={localStyles.btnContainer}>
              <TouchableOpacity
                style={[localStyles.btn, localStyles.btnCancel]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeleteConfirmationText('');
                }}
                disabled={isDeleting}
              >
                <Text style={localStyles.btnTextCancel}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[localStyles.btn, { backgroundColor: deleteConfirmationText.trim().toUpperCase() === 'ELIMINAR' ? colors.errorRed : colors.border + '60' }]}
                onPress={confirmDeleteAccount}
                disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== 'ELIMINAR'}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.canvasPure} />
                ) : (
                  <Text style={[localStyles.btnTextSave, { color: colors.canvasPure }]}>Eliminar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


