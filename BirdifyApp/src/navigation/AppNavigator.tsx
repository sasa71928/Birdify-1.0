import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import BottomNavBar from '../components/BottomNavBar';

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
import BirdDetailScreen     from '../screens/BirdDetailScreen';
import ChatScreen           from '../screens/ChatScreen';
import CreateGroupScreen    from '../screens/CreateGroupScreen';
import SearchMessagesScreen from '../screens/SearchMessagesScreen';
import SettingsScreen       from '../screens/SettingsScreen';
import OfflineStorageScreen from '../screens/OfflineStorageScreen';
import LanguageSettingsScreen from '../screens/LanguageSettingsScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import AboutBirdifyScreen from '../screens/AboutBirdifyScreen';

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
  MainTabs: { screen?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createMaterialTopTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavBar {...props} />}
      tabBarPosition="bottom"
      initialRouteName="Feed"
      screenOptions={{ swipeEnabled: true }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Dictionary" component={DictionaryScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
    </Tab.Navigator>
  );
}

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
      <Stack.Screen name="MainTabs" component={MainTabs} />
      
      {/* ── Modal/Fullscreen screens ── */}
      <Stack.Screen name="RecordSighting" component={RecordSightingScreen} />
      <Stack.Screen name="Profile"        component={ProfileScreen} />
      <Stack.Screen name="Search"         component={SearchScreen} />
      <Stack.Screen name="BirdDetail"      component={BirdDetailScreen} />
      <Stack.Screen name="Chat"            component={ChatScreen} />
      <Stack.Screen name="CreateGroup"      component={CreateGroupScreen} />
      <Stack.Screen name="SearchMessages"   component={SearchMessagesScreen} />
      <Stack.Screen name="Settings"         component={SettingsScreen} />
      <Stack.Screen name="OfflineStorage"   component={OfflineStorageScreen} />
      <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
      <Stack.Screen name="PrivacySettings"  component={PrivacySettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="EditProfile"      component={EditProfileScreen} />
      <Stack.Screen name="ThemeSettings"    component={ThemeSettingsScreen} />
      <Stack.Screen name="HelpSupport"      component={HelpSupportScreen} />
      <Stack.Screen name="AboutBirdify"      component={AboutBirdifyScreen} />
    </Stack.Navigator>
  );
}
