import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../hooks/useDynamicStyles';
import { Radius, Spacing, Typography } from '../theme';

export type LegalDocumentType = 'terms' | 'privacy' | 'licenses' | null;

interface LegalModalProps {
  documentType: LegalDocumentType;
  onClose: () => void;
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '25',
    },
    title: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
    },
    content: {
      padding: Spacing.lg,
      paddingBottom: Spacing.xxl,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
      marginTop: Spacing.md,
      marginBottom: Spacing.xs,
    },
    paragraph: {
      fontSize: Typography.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 21,
      marginBottom: Spacing.sm,
    },
    closeBtn: {
      padding: 6,
      borderRadius: Radius.md,
    },
  });

export default function LegalModal({ documentType, onClose }: LegalModalProps) {
  const { screen: styles, colors } = useDynamicStyles(createStyles);

  if (!documentType) return null;

  const headerTitle =
    documentType === 'terms'
      ? 'Términos de Servicio'
      : documentType === 'privacy'
        ? 'Política de Privacidad'
        : 'Licencias de Código Abierto';

  return (
    <Modal visible={Boolean(documentType)} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{headerTitle}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {documentType === 'terms' && (
            <>
              <Text style={styles.paragraph}>Última actualización: Octubre 2026</Text>

              <Text style={styles.sectionTitle}>1. Uso aceptable y comunidad</Text>
              <Text style={styles.paragraph}>
                Birdify es una red social dedicada a la observación responsable de aves. No está
                permitido publicar contenido ofensivo, fraudulento, spam, acoso ni información que
                ponga en peligro especies protegidas o zonas de anidación sensibles.
              </Text>

              <Text style={styles.sectionTitle}>2. Moderación, reportes y bloqueo</Text>
              <Text style={styles.paragraph}>
                Los usuarios pueden reportar publicaciones o cuentas y bloquear a otros usuarios en
                cualquier momento. Birdify revisa los reportes de contenido generado por usuarios y
                se reserva el derecho de retirar contenido o suspender cuentas que infrinjan estas
                normas.
              </Text>

              <Text style={styles.sectionTitle}>3. Propiedad del contenido</Text>
              <Text style={styles.paragraph}>
                Conservas los derechos sobre las fotografías y notas que publicas, otorgando a
                Birdify una licencia no exclusiva para mostrarlas dentro de la plataforma conforme a
                la configuración de privacidad de tu cuenta y de cada avistamiento.
              </Text>

              <Text style={styles.sectionTitle}>4. Eliminación de cuenta</Text>
              <Text style={styles.paragraph}>
                Puedes eliminar permanentemente tu cuenta y todos tus datos desde Configuración {'>'}{' '}
                Privacidad y Seguridad {'>'} Eliminar cuenta.
              </Text>
            </>
          )}

          {documentType === 'privacy' && (
            <>
              <Text style={styles.paragraph}>Última actualización: Octubre 2026</Text>

              <Text style={styles.sectionTitle}>1. Datos que recopilamos</Text>
              <Text style={styles.paragraph}>
                Recopilamos tu correo electrónico, nombre de usuario, foto de perfil opcional,
                fotografías de avistamientos, mensajes enviados en la plataforma y coordenadas GPS
                únicamente cuando decides registrar la ubicación pública de un avistamiento.
              </Text>

              <Text style={styles.sectionTitle}>2. Privacidad de ubicaciones y perfiles</Text>
              <Text style={styles.paragraph}>
                Si marcas un avistamiento con Ubicación Privada, las coordenadas GPS no se almacenan
                ni se comparten con otros usuarios. Además, puedes activar Perfil Privado para que
                únicamente seguidores mutuos accedan a tu actividad. Los metadatos EXIF de cámara se
                eliminan al seleccionar fotografías.
              </Text>

              <Text style={styles.sectionTitle}>3. Almacenamiento y seguridad</Text>
              <Text style={styles.paragraph}>
                Las credenciales de sesión se almacenan cifradas en el llavero seguro del
                dispositivo (iOS Keychain / Android Keystore) y las comunicaciones se transmiten
                exclusivamente mediante HTTPS/TLS.
              </Text>

              <Text style={styles.sectionTitle}>4. Derechos y eliminación de datos</Text>
              <Text style={styles.paragraph}>
                Puedes editar o eliminar tus avistamientos y borrar tu cuenta de manera permanente e
                inmediata desde Configuración {'>'} Privacidad y Seguridad {'>'} Eliminar cuenta, o
                contactando a birdifysupport@gmail.com.
              </Text>
            </>
          )}

          {documentType === 'licenses' && (
            <>
              <Text style={styles.paragraph}>
                Birdify agradece a los proyectos de código abierto que hacen posible esta
                aplicación:
              </Text>
              <Text style={styles.sectionTitle}>Expo & React Native (MIT License)</Text>
              <Text style={styles.paragraph}>
                Copyright (c) 650 Industries, Inc. / Meta Platforms, Inc.
              </Text>
              <Text style={styles.sectionTitle}>React Navigation (MIT License)</Text>
              <Text style={styles.paragraph}>
                Navegación nativa y pestañas para aplicaciones React Native.
              </Text>
              <Text style={styles.sectionTitle}>Supabase JS (MIT License)</Text>
              <Text style={styles.paragraph}>
                Cliente oficial de autenticación, base de datos y almacenamiento en tiempo real.
              </Text>
              <Text style={styles.sectionTitle}>react-native-maps & Ionicons (MIT License)</Text>
              <Text style={styles.paragraph}>
                Visualización cartográfica e iconografía de interfaz.
              </Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

