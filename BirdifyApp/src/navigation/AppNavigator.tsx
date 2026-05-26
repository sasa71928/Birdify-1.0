import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import NetInfo from '@react-native-community/netinfo';
import BottomNavBar from '../components/BottomNavBar';

import RegisterScreen           from '../screens/auth/RegisterScreen';
import LoginScreen              from '../screens/auth/LoginScreen';
import FeedScreen               from '../screens/main/FeedScreen';
import RecordSightingScreen     from '../screens/bird/RecordSightingScreen';
import ProfileScreen            from '../screens/social/ProfileScreen';
import DictionaryScreen         from '../screens/main/DictionaryScreen';
import MessagesScreen           from '../screens/main/MessagesScreen';
import ExploreScreen            from '../screens/main/ExploreScreen';
import WelcomeScreen            from '../screens/auth/WelcomeScreen';
import SearchScreen             from '../screens/bird/SearchScreen';
import BirdDetailScreen         from '../screens/bird/BirdDetailScreen';
import ChatScreen               from '../screens/social/ChatScreen';
import CreateGroupScreen        from '../screens/social/CreateGroupScreen';
import SearchMessagesScreen     from '../screens/social/SearchMessagesScreen';
import SettingsScreen           from '../screens/settings/SettingsScreen';
import OfflineStorageScreen     from '../screens/settings/OfflineStorageScreen';
import LanguageSettingsScreen   from '../screens/settings/LanguageSettingsScreen';
import PrivacySettingsScreen    from '../screens/settings/PrivacySettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import EditProfileScreen        from '../screens/settings/EditProfileScreen';
import ThemeSettingsScreen      from '../screens/settings/ThemeSettingsScreen';
import HelpSupportScreen        from '../screens/settings/HelpSupportScreen';
import AboutBirdifyScreen       from '../screens/settings/AboutBirdifyScreen';
import { useAuth }              from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Colors }               from '../theme';
import SightingsOfflineScreen from '../screens/bird/SightingsOfflineScreen'; // agregar

// ── Shared types ──────────────────────────────────────────────────────────────
export interface BirdSpeciesData {
  id: string;
  name: string;
  scientificName: string;
  image: string;
  status: 'RESIDENTE' | 'MIGRATORIA';
  overview: string;
  habitat: string;
  conservationStatus: string;
  classification?: {
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
  };
}

export interface ChatThread {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isOnline?: boolean;
  isGroup?: boolean;
}

// ── Tipos de rutas ────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  Feed: undefined;
  RecordSighting: undefined;
  Profile: { userId?: string };
  Dictionary: { searchQuery?: string };
  Messages: undefined;
  Explore: undefined;
  Search: undefined;
  BirdDetail: { bird: BirdSpeciesData };
  Chat: { thread: ChatThread };
  CreateGroup: undefined;
  SearchMessages: undefined;
  Settings: undefined;
  OfflineStorage: undefined;
  LanguageSettings: undefined;
  PrivacySettings: undefined;
  NotificationSettings: undefined;
  EditProfile: undefined;
  ThemeSettings: undefined;
  HelpSupport: undefined;
  AboutBirdify: undefined;
  MainTabs: { screen?: string; params?: { searchQuery?: string } };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createMaterialTopTabNavigator();

// ── BottomNavBar offline: solo el botón "+" centrado ─────────────────────────
// Pasamos isOffline al BottomNavBar como prop extra via tabBar render prop.
// BottomNavBar ya acepta `state` como prop — no necesita cambios.
// Usamos un componente wrapper que inyecta el modo offline en el contexto.

import { createContext, useContext } from 'react';
export const OfflineContext = createContext(false);

// ── Tabs online ───────────────────────────────────────────────────────────────
function OnlineTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavBar {...props} />}
      tabBarPosition="bottom"
      initialRouteName="Feed"
      screenOptions={{ swipeEnabled: true }}
    >
      <Tab.Screen name="Feed"       component={FeedScreen} />
      <Tab.Screen name="Explore"    component={ExploreScreen} />
      <Tab.Screen name="Dictionary" component={DictionaryScreen} />
      <Tab.Screen name="Messages"   component={MessagesScreen} />
    </Tab.Navigator>
  );
}
function OfflineTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavBar {...props} />}
      tabBarPosition="bottom"
      initialRouteName="Feed"
      screenOptions={{ swipeEnabled: false }}
    >
      <Tab.Screen name="Feed" component={SightingsOfflineScreen} />
    </Tab.Navigator>
  );
}

// ── MainTabs dinámico ─────────────────────────────────────────────────────────
function MainTabs() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    NetInfo.fetch().then(state => setOnline(!!state.isConnected));
    const unsub = NetInfo.addEventListener(state => setOnline(!!state.isConnected));
    return unsub;
  }, []);

  return (
    <OfflineContext.Provider value={!online}>
      {online ? <OnlineTabs /> : <OfflineTabs />}
    </OfflineContext.Provider>
  );
}

// ── AppNavigator ──────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    // @ts-ignore - React 19 type mismatch with React Navigation 7
    <Stack.Navigator screenOptions={{ headerShown: false } as any}>
      {!user ? (
        <>
          <Stack.Screen name="Welcome"  component={WelcomeScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login"    component={LoginScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />

          {/* ── Modal/Fullscreen screens ── */}
          <Stack.Screen name="RecordSighting"       component={RecordSightingScreen} />
          <Stack.Screen name="Profile"              component={ProfileScreen} />
          <Stack.Screen name="Search"               component={SearchScreen} />
          <Stack.Screen name="BirdDetail"           component={BirdDetailScreen} />
          <Stack.Screen name="Chat"                 component={ChatScreen} />
          <Stack.Screen name="CreateGroup"          component={CreateGroupScreen} />
          <Stack.Screen name="SearchMessages"       component={SearchMessagesScreen} />
          <Stack.Screen name="Settings"             component={SettingsScreen} />
          <Stack.Screen name="OfflineStorage"       component={OfflineStorageScreen} />
          <Stack.Screen name="LanguageSettings"     component={LanguageSettingsScreen} />
          <Stack.Screen name="PrivacySettings"      component={PrivacySettingsScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="EditProfile"          component={EditProfileScreen} />
          <Stack.Screen name="ThemeSettings"        component={ThemeSettingsScreen} />
          <Stack.Screen name="HelpSupport"          component={HelpSupportScreen} />
          <Stack.Screen name="AboutBirdify"         component={AboutBirdifyScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}