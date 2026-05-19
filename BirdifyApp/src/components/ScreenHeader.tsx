import React from 'react';
import { View, Text } from 'react-native';
import { useDynamicStyles } from '../hooks/useDynamicStyles';

type ScreenHeaderProps = {
  icon?: string;
  title?: string;
};

export default function ScreenHeader({
  icon = '🐦',
  title = 'Birdify',
}: ScreenHeaderProps) {
  const { shared } = useDynamicStyles();
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
