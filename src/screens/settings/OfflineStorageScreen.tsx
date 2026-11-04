import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useT } from '../../i18n';
import {
  SettingsScaffold,
  SettingsSection,
  SettingsRow,
} from '../../components/settings';
import { AnimatedSwitch, PressableScale } from '../../components/animated';
import { Radius, Typography, Shadows } from '../../theme';

interface DownloadPackage {
  id: string;
  name: string;
  size: string;
  status: 'downloaded' | 'not_downloaded' | 'downloading';
  progress?: number;
}

const INITIAL_PACKAGES: DownloadPackage[] = [
  { id: '1', name: 'Diccionario Básico de Aves', size: '45 MB', status: 'downloaded' },
  { id: '2', name: 'Fotografías en Alta Resolución', size: '320 MB', status: 'not_downloaded' },
  { id: '3', name: 'Mapa Offline: Región Norte', size: '120 MB', status: 'downloading', progress: 45 },
  { id: '4', name: 'Mapa Offline: Región Centro y Sur', size: '150 MB', status: 'not_downloaded' },
];

export default function OfflineStorageScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useDynamicStyles();
  const { t } = useT();

  const [wifiOnly, setWifiOnly] = useState(true);
  const [packages, setPackages] = useState<DownloadPackage[]>(INITIAL_PACKAGES);

  const toggleDownload = (id: string) => {
    setPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id === id) {
          if (pkg.status === 'not_downloaded') {
            return { ...pkg, status: 'downloading', progress: 0 };
          }
          if (pkg.status === 'downloading') {
            return { ...pkg, status: 'not_downloaded' };
          }
          if (pkg.status === 'downloaded') {
            return { ...pkg, status: 'not_downloaded' };
          }
        }
        return pkg;
      })
    );
  };

  return (
    <SettingsScaffold
      title={t('settings.offlineStorage')}
      subtitle={t('settings.offlineStorageSubtitle')}
      onBack={() => navigation.goBack()}
    >
      {/* Storage Usage Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.canvasPure,
            borderColor: isDark ? colors.border + '30' : colors.border + '20',
          },
        ]}
      >
        <View style={styles.storageHeader}>
          <MaterialCommunityIcons name="database" size={24} color={colors.primary} />
          <Text style={[styles.storageTitle, { color: colors.textPrimary }]}>
            Uso de Almacenamiento
          </Text>
        </View>

        <View
          style={[
            styles.progressBarContainer,
            { backgroundColor: isDark ? '#2E2E2E' : '#E8EBE6' },
          ]}
        >
          <View
            style={[styles.progressBarApp, { backgroundColor: colors.primary, width: '22%' }]}
          />
        </View>

        <View style={styles.storageLegends}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.primary }]}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Birdify (350 MB)
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: isDark ? '#444' : '#CCC' },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Libre (4.2 GB)
            </Text>
          </View>
        </View>

        <Text style={[styles.storageDesc, { color: colors.textSecondary }]}>
          Descarga paquetes de información y mapas para identificar especies y registrar avistamientos sin conexión a internet.
        </Text>
      </View>

      {/* Preferences Section */}
      <SettingsSection>
        <SettingsRow
          icon="wifi-outline"
          label="Descargar solo con Wi-Fi"
          sublabel="Ahorra datos de tu plan móvil"
          showChevron={false}
          isLast
          rightElement={
            <AnimatedSwitch
              value={wifiOnly}
              onValueChange={setWifiOnly}
              accessibilityLabel="Descargar solo con Wi-Fi"
            />
          }
        />
      </SettingsSection>

      {/* Packages Section */}
      <SettingsSection title="Paquetes disponibles">
        {packages.map((pkg, idx) => {
          const isLast = idx === packages.length - 1;
          const isDownloaded = pkg.status === 'downloaded';
          const isDownloading = pkg.status === 'downloading';

          return (
            <View key={pkg.id}>
              <View style={styles.packageRow}>
                <View style={styles.packageInfo}>
                  <Text
                    style={[styles.packageName, { color: colors.textPrimary }]}
                  >
                    {pkg.name}
                  </Text>
                  <Text
                    style={[styles.packageSize, { color: colors.textSecondary }]}
                  >
                    {pkg.size}
                  </Text>
                  {isDownloading && (
                    <View style={styles.downloadProgressWrap}>
                      <View
                        style={[
                          styles.downloadTrack,
                          { backgroundColor: isDark ? '#333' : '#E0E7E4' },
                        ]}
                      >
                        <View
                          style={[
                            styles.downloadFill,
                            {
                              backgroundColor: colors.primary,
                              width: `${pkg.progress ?? 0}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.downloadPercent,
                          { color: colors.primary },
                        ]}
                      >
                        {pkg.progress ?? 0}%
                      </Text>
                    </View>
                  )}
                </View>

                <PressableScale
                  activeScale={0.88}
                  haptic="light"
                  onPress={() => toggleDownload(pkg.id)}
                  style={styles.downloadBtn}
                >
                  <Ionicons
                    name={
                      isDownloaded
                        ? 'checkmark-circle'
                        : isDownloading
                        ? 'stop-circle-outline'
                        : 'cloud-download-outline'
                    }
                    size={26}
                    color={
                      isDownloaded
                        ? colors.primary
                        : isDownloading
                        ? colors.secondaryBlue
                        : colors.primary
                    }
                  />
                </PressableScale>
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: colors.border + '20' },
                  ]}
                />
              )}
            </View>
          );
        })}
      </SettingsSection>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
    ...Shadows.card,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  storageTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 12,
  },
  progressBarApp: {
    height: '100%',
    borderRadius: 5,
  },
  storageLegends: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyBody,
  },
  storageDesc: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyBody,
    lineHeight: 18,
  },
  packageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  packageInfo: {
    flex: 1,
    marginRight: 12,
  },
  packageName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    marginBottom: 4,
  },
  packageSize: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyBody,
  },
  downloadProgressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  downloadTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  downloadFill: {
    height: '100%',
    borderRadius: 2,
  },
  downloadPercent: {
    fontSize: 11,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  downloadBtn: {
    padding: 4,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
