import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen    from '../screens/LoginScreen';

// ── Tipos de rutas de la app ──────────────────────────────────────────────────
export type RootStackParamList = {
  Register: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Register"
      screenOptions={{ headerShown: false }} // Los headers los maneja cada pantalla
    >
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login"    component={LoginScreen}    />
    </Stack.Navigator>
  );
}
