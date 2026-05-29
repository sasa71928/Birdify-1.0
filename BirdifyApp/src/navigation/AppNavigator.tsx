import React, { Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import BottomNavBar from '../components/BottomNavBar';
import { Colors } from '../theme';

import RegisterScreen from '../screens/auth/RegisterScreen';
import LoginScreen    from '../screens/auth/LoginScreen';
import FeedScreen     from '../screens/main/FeedScreen';
import DictionaryScreen     from '../screens/main/DictionaryScreen';
import MessagesScreen       from '../screens/main/MessagesScreen';
import ExploreScreen        from '../screens/main/ExploreScreen';
import WelcomeScreen        from '../screens/auth/WelcomeScreen';

const RecordSightingScreen = React.lazy(() => import('../screens/bird/RecordSightingScreen'));
const ProfileScreen        = React.lazy(() => import('../screens/social/ProfileScreen'));
const SearchScreen         = React.lazy(() => import('../screens/bird/SearchScreen'));
const BirdDetailScreen     = React.lazy(() => import('../screens/bird/BirdDetailScreen'));
const ChatScreen           = React.lazy(() => import('../screens/social/ChatScreen'));
const CreateGroupScreen    = React.lazy(() => import('../screens/social/CreateGroupScreen'));
const EditGroupScreen      = React.lazy(() => import('../screens/social/EditGroupScreen'));
const SearchMessagesScreen = React.lazy(() => import('../screens/social/SearchMessagesScreen'));
const SettingsScreen       = React.lazy(() => import('../screens/settings/SettingsScreen'));
const LanguageSettingsScreen = React.lazy(() => import('../screens/settings/LanguageSettingsScreen'));
const PrivacySettingsScreen = React.lazy(() => import('../screens/settings/PrivacySettingsScreen'));
const NotificationSettingsScreen = React.lazy(() => import('../screens/settings/NotificationSettingsScreen'));
const EditProfileScreen = React.lazy(() => import('../screens/settings/EditProfileScreen'));
const ThemeSettingsScreen = React.lazy(() => import('../screens/settings/ThemeSettingsScreen'));
const HelpSupportScreen = React.lazy(() => import('../screens/settings/HelpSupportScreen'));
const AboutBirdifyScreen = React.lazy(() => import('../screens/settings/AboutBirdifyScreen'));
const BlockedUsersScreen = React.lazy(() => import('../screens/settings/BlockedUsersScreen'));

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
  RecordSighting: { editingSighting?: any };
  Profile: { userId?: string };
  Dictionary: { searchQuery?: string };
  Messages: undefined;
  Explore: { targetSighting?: { id: string; latitude: number; longitude: number } };
  Search: undefined;
  BirdDetail: { bird: BirdSpeciesData };
  Chat: { conversationId: string };
  CreateGroup: undefined;
  EditGroup: { conversationId: string };
  SearchMessages: undefined;
  Settings: undefined;
  LanguageSettings: undefined;
  PrivacySettings: undefined;
  BlockedUsers: undefined;
  NotificationSettings: undefined;
  EditProfile: undefined;
  ThemeSettings: undefined;
  HelpSupport: undefined;
  AboutBirdify: undefined;
  MainTabs: { screen?: string, params?: { searchQuery?: string } };
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

import { useAuth } from '../context/AuthContext';

export default function AppNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    // @ts-ignore - React 19 type mismatch with React Navigation 7
    <Suspense fallback={
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    }>
    <Stack.Navigator
      screenOptions={{ headerShown: false } as any}
    >
      {!session ? (
        <>
          <Stack.Screen name="Welcome"  component={WelcomeScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login"    component={LoginScreen}    />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          
          {/* ── Modal/Fullscreen screens ── */}
          <Stack.Screen name="RecordSighting" component={RecordSightingScreen} />
          <Stack.Screen name="Profile"        component={ProfileScreen} />
          <Stack.Screen name="Search"         component={SearchScreen} />
          <Stack.Screen name="BirdDetail"      component={BirdDetailScreen} />
          <Stack.Screen name="Chat"            component={ChatScreen} />
          <Stack.Screen name="CreateGroup"      component={CreateGroupScreen} />
          <Stack.Screen name="EditGroup"        component={EditGroupScreen} />
          <Stack.Screen name="SearchMessages"   component={SearchMessagesScreen} />
          <Stack.Screen name="Settings"         component={SettingsScreen} />
          <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
          <Stack.Screen name="PrivacySettings"  component={PrivacySettingsScreen} />
          <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="EditProfile"      component={EditProfileScreen} />
          <Stack.Screen name="ThemeSettings"    component={ThemeSettingsScreen} />
          <Stack.Screen name="HelpSupport"      component={HelpSupportScreen} />
          <Stack.Screen name="AboutBirdify"      component={AboutBirdifyScreen} />
        </>
      )}
    </Stack.Navigator>
    </Suspense>
  );
}
