import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen    from '../screens/LoginScreen';
import FeedScreen     from '../screens/FeedScreen';
import RecordSightingScreen from '../screens/RecordSightingScreen';
import ProfileScreen        from '../screens/ProfileScreen';
import DictionaryScreen     from '../screens/DictionaryScreen';
import MessagesScreen       from '../screens/MessagesScreen';
import ExploreScreen        from '../screens/ExploreScreen';
import WelcomeScreen        from '../screens/WelcomeScreen';
import SearchScreen         from '../screens/SearchScreen';

// ── Tipos de rutas de la app ──────────────────────────────────────────────────
export type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  Feed: undefined;
  RecordSighting: undefined;
  Profile: undefined;
  Dictionary: undefined;
  Messages: undefined;
  Explore: undefined;
  Search: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    // @ts-ignore - React 19 type mismatch with React Navigation 7
    <Stack.Navigator
      initialRouteName={"Welcome" as any}
      screenOptions={{ headerShown: false } as any}
    >
      <Stack.Screen name="Welcome"  component={WelcomeScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login"    component={LoginScreen}    />
      <Stack.Screen name="Feed"     component={FeedScreen}     />
      <Stack.Screen name="RecordSighting" component={RecordSightingScreen} />
      <Stack.Screen name="Profile"        component={ProfileScreen} />
      <Stack.Screen name="Dictionary"     component={DictionaryScreen} />
      <Stack.Screen name="Messages"       component={MessagesScreen} />
      <Stack.Screen name="Explore"        component={ExploreScreen} />
      <Stack.Screen name="Search"         component={SearchScreen} />
    </Stack.Navigator>
  );
}
