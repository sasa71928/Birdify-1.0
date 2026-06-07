import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import * as MailComposer from 'expo-mail-composer';
import { handleError } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';
type SettingsNavProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  danger?: boolean;
}

interface SettingSection {
  title: string;
  data: SettingItem[];
}

const SETTING_SECTIONS: SettingSection[] = [
  {
    title: 'Account',
    data: [
      { id: '1', icon: 'person-outline', label: 'Edit Profile' },
      { id: '2', icon: 'lock-closed-outline', label: 'Privacy & Security' },
      { id: '3', icon: 'notifications-outline', label: 'Notifications' },
      { id: 'verify', icon: 'mail-outline', label: 'Request Verification as a Certified Birdwatcher' },
    ],
  },
  {
    title: 'Preferences',
    data: [
      { id: '4', icon: 'globe-outline', label: 'Language' },
      { id: '5', icon: 'moon-outline', label: 'Theme' },
    ],
  },
  {
    title: 'Support & About',
    data: [
      { id: '6', icon: 'help-circle-outline', label: 'Help & Support' },
      { id: '7', icon: 'information-circle-outline', label: 'About Birdify' },
    ],
  },
  {
    title: 'Developer',
    data: [{ id: '9', icon: 'server-outline', label: 'Server Configuration' }],
  },
  {
    title: 'Actions',
    data: [{ id: '8', icon: 'log-out-outline', label: 'Log Out', danger: true }],
  },
];

export const createStyles = (colors: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '20',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: colors.textPrimary },
    placeholder: { width: 32 },
    content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
    section: { marginBottom: Spacing.lg },
    sectionTitle: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textSecondary,
      marginBottom: Spacing.sm,
      marginLeft: Spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    card: { backgroundColor: colors.canvasPure, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border + '20' },
    itemRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
    iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
    iconWrapDanger: { backgroundColor: colors.errorRed + '15' },
    itemLabel: { flex: 1, fontSize: Typography.fontSize.md, color: colors.textPrimary, fontWeight: Typography.fontWeight.medium },
    itemLabelDanger: { color: colors.errorRed },
    divider: { height: 1, backgroundColor: colors.border + '20', marginLeft: 52 + Spacing.md },
  });

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavProp>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { signOut, session } = useAuth();

  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string } | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const handlePress = (item: SettingItem) => {
    if (item.danger) {
      signOut().catch(err => handleError(err, setToast, 'Logout failed'));
    } else if (item.id === '1') {
      navigation.navigate('EditProfile' as any);
    } else if (item.id === '2') {
      navigation.navigate('PrivacySettings' as any);
    } else if (item.id === '3') {
      navigation.navigate('NotificationSettings' as any);
    } else if (item.id === '4') {
      navigation.navigate('LanguageSettings' as any);
    } else if (item.id === '5') {
      navigation.navigate('ThemeSettings' as any);
    } else if (item.id === '6') {
      navigation.navigate('HelpSupport' as any);
    } else if (item.id === '7') {
      navigation.navigate('AboutBirdify' as any);
    } else if (item.id === 'verify') {
      setVerificationModalVisible(true);
    } else if (item.id === '9') {
      navigation.navigate('ServerConfig' as any);
    } else {
      console.log(`Navigating to ${item.label}`);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppToast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {SETTING_SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.data.map(item => {
                const isLast = item.id === section.data[section.data.length - 1].id;
                return (
                  <View key={item.id}>
                    <TouchableOpacity style={styles.itemRow} activeOpacity={0.7} onPress={() => handlePress(item)}>
                      <View style={[styles.iconWrap, item.danger && styles.iconWrapDanger]}>
                        <Ionicons name={item.icon as any} size={20} color={item.danger ? colors.errorRed : colors.primary} />
                      </View>
                      <Text style={[styles.itemLabel, item.danger && styles.itemLabelDanger]}>{item.label}</Text>
                      {!item.danger && (
                        <Ionicons name="chevron-forward" size={18} color={colors.outlineGrey} />
                      )}
                    </TouchableOpacity>
                    {!isLast && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
        <Modal
          visible={verificationModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setVerificationModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ margin: 20, backgroundColor: colors.canvasPure, padding: 35, borderRadius: 20, elevation: 5 }}>
              <Text style={{ fontSize: 18, marginBottom: 15, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center' }}>Solicitar verificación</Text>
              <Text style={{ marginBottom: 15, color: colors.textSecondary, textAlign: 'center' }}>Sube un PDF o imagen que acredite tu experiencia como ornitólogo o biólogo.</Text>

              <TouchableOpacity
                style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: colors.primary + '20', borderRadius: 8, alignItems: 'center', marginBottom: 15 }}
                onPress={async () => {
                  try {
                    const result = await DocumentPicker.getDocumentAsync({
                      type: ['application/pdf', 'image/*'],
                      copyToCacheDirectory: true,
                    });
                    if (!result.canceled) {
                      setSelectedFile({ uri: result.assets[0].uri, name: result.assets[0].name });
                    }
                  } catch (e) {
                    handleError(e, setToast, 'Error selecting file');
                  }
                }}
              >
                <Text style={{ color: colors.primary }}>{selectedFile ? selectedFile.name : 'Seleccionar archivo'}</Text>
              </TouchableOpacity>

              {selectedFile && (
                <Text style={{ marginBottom: 15, color: colors.textPrimary, textAlign: 'center' }}>{selectedFile.name}</Text>
              )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    style={{ backgroundColor: colors.errorRed, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 }}
                    onPress={() => {
                      setVerificationModalVisible(false);
                      setSelectedFile(null);
                    }}>
                    <Text style={{ color: colors.canvasPure, fontWeight: '600' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: selectedFile ? colors.primary : colors.outlineGrey,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 8,
                    }}
                    disabled={!selectedFile}
                    onPress={async () => {
                      if (selectedFile) {
                        try {
                          const { status } = await MailComposer.composeAsync({
                            recipients: ['authbirdify@gmail.com'],
                            subject: 'Solicitud de verificación - ' + session?.user?.email,
                            body: `Adjunto mi documento de verificación (${selectedFile.name}).`,
                            attachments: [selectedFile.uri],
                          });
                          if (status === 'sent') {
                            handleError('Correo enviado correctamente', setToast, 'Solicitud enviada');
                          } else {
                            handleError('El correo no se pudo enviar', setToast, 'Error');
                          }
                        } catch (e) {
                          handleError(e, setToast, 'No se pudo enviar la solicitud');
                        }
                        setVerificationModalVisible(false);
                        setSelectedFile(null);
                      }
                    }}>
                    <Text style={{ color: colors.canvasPure, fontWeight: '600' }}>Enviar solicitud</Text>
                  </TouchableOpacity>
                </View>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
}
