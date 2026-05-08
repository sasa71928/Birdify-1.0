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
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import styles from '../../styles/screens/settings/offlineStorageScreen.styles';

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
                          <View style={[styles.downloadFill, { width: `${pkg.progress ?? 0}%` }]} />
                        </View>
                        <Text style={styles.downloadPercent}>{pkg.progress ?? 0}%</Text>
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

