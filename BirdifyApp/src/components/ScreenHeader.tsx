/**
 * ScreenHeader — Header reutilizable con logo de Birdify y línea divisora
 *
 * Props:
 *  icon     — emoji/texto del logo (default: '🐦')
 *  title    — nombre de la app (default: 'Birdify')
 */
import React from 'react';
import { View, Text } from 'react-native';
import shared from '../styles/shared/shared.styles';

type ScreenHeaderProps = {
  icon?: string;
  title?: string;
};

export default function ScreenHeader({
  icon = '🐦',
  title = 'Birdify',
}: ScreenHeaderProps) {
  return (
    <>
      <View style={shared.header}>
        <Text style={shared.logoIcon}>{icon}</Text>
        <Text style={shared.logoText}>{title}</Text>
      </View>
      <View style={shared.headerDivider} />
    </>
  );
}
