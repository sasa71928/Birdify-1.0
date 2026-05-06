import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface DownloadPackage {
  id: string;
  name: string;
  size: string;
  status: 'downloaded' | 'not_downloaded' | 'downloading';
  progress?: number;
}

const MOCK_PACKAGES: DownloadPackage[] = [
  { id: '1', name: 'Core Dictionary (Text & Basic Images)', size: '45 MB', status: 'downloaded' },
  { id: '2', name: 'High-Resolution Bird Photos', size: '320 MB', status: 'not_downloaded' },
  { id: '3', name: 'Offline Maps: Baja California', size: '120 MB', status: 'downloading', progress: 45 },
  { id: '4', name: 'Offline Maps: Central Mexico', size: '150 MB', status: 'not_downloaded' },
];

export default function OfflineStorageScreen() {
  const navigation = useNavigation();
  const [wifiOnly, setWifiOnly] = useState(true);
  const [packages, setPackages] = useState<DownloadPackage[]>(MOCK_PACKAGES);

  const toggleDownload = (id: string) => {
    setPackages(prev => prev.map(pkg => {
      if (pkg.id === id) {
        if (pkg.status === 'not_downloaded') return { ...pkg, status: 'downloading', progress: 0 };
        if (pkg.status === 'downloading') return { ...pkg, status: 'not_downloaded' };
        if (pkg.status === 'downloaded') return { ...pkg, status: 'not_downloaded' };
      }
      return pkg;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'downloaded': return <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />;
      case 'downloading': return <Ionicons name="stop-circle-outline" size={24} color={Colors.secondaryBlue} />;
      default: return <Ionicons name="cloud-download-outline" size={24} color={Colors.primary} />;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline Storage</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* ── Storage Overview ── */}
        <View style={styles.card}>
          <View style={styles.storageHeader}>
            <MaterialCommunityIcons name="database" size={24} color={Colors.primary} />
            <Text style={styles.storageTitle}>Storage Usage</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '35%' }]} />
            <View style={[styles.progressBarApp, { width: '15%' }]} />
          </View>
          
          <View style={styles.storageLegends}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>Birdify (350 MB)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E0E7E4' }]} />
              <Text style={styles.legendText}>Free (4.2 GB)</Text>
            </View>
          </View>
          
          <Text style={styles.storageDesc}>
            Download dictionaries and maps to identify birds and log sightings even without an internet connection.
          </Text>
        </View>

        {/* ── Preferences ── */}
        <View style={styles.preferencesCard}>
          <View style={styles.prefRow}>
            <View>
              <Text style={styles.prefTitle}>Download over Wi-Fi only</Text>
              <Text style={styles.prefDesc}>Save cellular data</Text>
            </View>
            <Switch
              value={wifiOnly}
              onValueChange={setWifiOnly}
              trackColor={{ false: '#E0E7E4', true: Colors.primary }}
              thumbColor={Colors.canvasPure}
            />
          </View>
        </View>

        {/* ── Download Packages ── */}
        <Text style={styles.sectionTitle}>Available for Download</Text>
        
        <View style={styles.packageList}>
          {packages.map((pkg, index) => {
            const isLast = index === packages.length - 1;
            return (
              <View key={pkg.id}>
                <View style={styles.packageRow}>
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <Text style={styles.packageSize}>{pkg.size}</Text>
                    
                    {pkg.status === 'downloading' && (
                      <View style={styles.downloadProgressWrap}>
                        <View style={styles.downloadTrack}>
                          <View style={[styles.downloadFill, { width: `${pkg.progress}%` }]} />
                        </View>
                        <Text style={styles.downloadPercent}>{pkg.progress}%</Text>
                      </View>
                    )}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.downloadBtn}
                    onPress={() => toggleDownload(pkg.id)}
                  >
                    {getStatusIcon(pkg.status)}
                  </TouchableOpacity>
                </View>
                {!isLast && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  placeholder: { width: 32 },
  
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  
  // Storage Overview
  card: {
    backgroundColor: Colors.canvasPure,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  storageTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E0E7E4',
    borderRadius: Radius.full,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBar: {
    backgroundColor: Colors.primary,
    height: '100%',
  },
  progressBarApp: {
    backgroundColor: Colors.tertiaryBrown,
    height: '100%',
  },
  storageLegends: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  storageDesc: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Preferences
  preferencesCard: {
    backgroundColor: Colors.canvasPure,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
  },
  prefDesc: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Packages
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  packageList: {
    backgroundColor: Colors.canvasPure,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    marginBottom: Spacing.xxl,
  },
  packageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  packageInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  packageName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  packageSize: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  downloadBtn: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginLeft: Spacing.md,
  },
  downloadProgressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  downloadTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E7E4',
    borderRadius: 2,
    overflow: 'hidden',
  },
  downloadFill: {
    height: '100%',
    backgroundColor: Colors.secondaryBlue,
  },
  downloadPercent: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondaryBlue,
  },
});
