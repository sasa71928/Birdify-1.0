import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useT } from '../../i18n';

interface DictionaryEmptyStateProps {
  searchQuery: string;
  onReset: () => void;
  styles: any;
  colors: any;
}

export const DictionaryEmptyState: React.FC<DictionaryEmptyStateProps> = React.memo(({
  searchQuery,
  onReset,
  styles,
  colors,
}) => {
  const { t } = useT();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <MaterialCommunityIcons name="feather" size={38} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>
        {searchQuery ? t('dictionary.noBirds') : 'Catálogo vacío'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `No hay especies que coincidan con "${searchQuery}". Prueba con otro nombre o revisa la ortografía.`
          : 'Aún no se han sincronizado aves en el catálogo local.'}
      </Text>

      <TouchableOpacity
        style={styles.resetBtn}
        activeOpacity={0.8}
        onPress={onReset}
      >
        <Ionicons name="refresh" size={16} color="#FFFFFF" />
        <Text style={styles.resetBtnText}>{t('dictionary.resetFilters')}</Text>
      </TouchableOpacity>
    </View>
  );
});

