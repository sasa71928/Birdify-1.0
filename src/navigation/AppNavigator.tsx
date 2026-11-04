import React, { useContext } from 'react';
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
import OfflineFeedScreen from '../screens/main/OfflineFeedScreen';

import RecordSightingScreen from '../screens/bird/RecordSightingScreen';
import ProfileScreen        from '../screens/social/ProfileScreen';
import SearchScreen         from '../screens/bird/SearchScreen';
import BirdDetailScreen     from '../screens/bird/BirdDetailScreen';
import ChatScreen           from '../screens/social/ChatScreen';
import CreateGroupScreen    from '../screens/social/CreateGroupScreen';
import EditGroupScreen      from '../screens/social/EditGroupScreen';
import SearchMessagesScreen from '../screens/social/SearchMessagesScreen';
import SettingsScreen       from '../screens/settings/SettingsScreen';
import OfflineStorageScreen from '../screens/settings/OfflineStorageScreen';
import LanguageSettingsScreen from '../screens/settings/LanguageSettingsScreen';
import PrivacySettingsScreen from '../screens/settings/PrivacySettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import FeedPreferencesScreen from '../screens/settings/FeedPreferencesScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import ThemeSettingsScreen from '../screens/settings/ThemeSettingsScreen';
import HelpSupportScreen from '../screens/settings/HelpSupportScreen';
import AboutBirdifyScreen from '../screens/settings/AboutBirdifyScreen';
import BlockedUsersScreen from '../screens/settings/BlockedUsersScreen';
import { useAuth } from '../context/AuthContext';

import { OfflineContext, OfflineProvider, useOffline } from '../context/OfflineContext';
export { OfflineContext, OfflineProvider, useOffline };

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
  userRole?: string;
}

export type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  Feed: undefined;
  RecordSighting: { editingSighting?: any; preselectedBird?: BirdSpeciesData };
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
  OfflineStorage: undefined;
  LanguageSettings: undefined;
  PrivacySettings: undefined;
  BlockedUsers: undefined;
  NotificationSettings: undefined;
  FeedPreferences: undefined;
  EditProfile: undefined;
  ThemeSettings: undefined;
  HelpSupport: undefined;
  AboutBirdify: undefined;
  MainTabs: { screen?: string; params?: { searchQuery?: string } };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createMaterialTopTabNavigator();

// ── Tabs ONLINE ───────────────────────────────────────────────────────────────
function OnlineTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavBar {...props} />}
      tabBarPosition="bottom"
      initialRouteName="Feed"
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
      }}
    >
      <Tab.Screen name="Feed"       component={FeedScreen} />
      <Tab.Screen name="Explore"    component={ExploreScreen} />
      <Tab.Screen name="Dictionary" component={DictionaryScreen} />
      <Tab.Screen name="Messages"   component={MessagesScreen} />
    </Tab.Navigator>
  );
}

// ── Tabs OFFLINE ──────────────────────────────────────────────────────────────
function OfflineTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavBar {...props} />}
      tabBarPosition="bottom"
      initialRouteName="Feed"
      screenOptions={{ swipeEnabled: false }}
    >
      <Tab.Screen name="Feed" component={OfflineFeedScreen} />
    </Tab.Navigator>
  );
}

// ── MainTabs: solo elige Online/Offline según contexto ────────────────────────
function MainTabs() {
  const isOffline = useContext(OfflineContext);
  return isOffline ? <OfflineTabs /> : <OnlineTabs />;
}

// ── AppNavigator ──────────────────────────────────────────────────────────────
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
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      {!session ? (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="RecordSighting"
            component={RecordSightingScreen}
            options={{
              animation: 'slide_from_bottom',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{
              animation: 'fade_from_bottom',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="BirdDetail"
            component={BirdDetailScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="CreateGroup"
            component={CreateGroupScreen}
            options={{
              animation: 'slide_from_bottom',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="EditGroup"
            component={EditGroupScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="SearchMessages"
            component={SearchMessagesScreen}
            options={{
              animation: 'fade_from_bottom',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="OfflineStorage"
            component={OfflineStorageScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="LanguageSettings"
            component={LanguageSettingsScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="PrivacySettings"
            component={PrivacySettingsScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="BlockedUsers"
            component={BlockedUsersScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettingsScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="FeedPreferences"
            component={FeedPreferencesScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="ThemeSettings"
            component={ThemeSettingsScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="HelpSupport"
            component={HelpSupportScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="AboutBirdify"
            component={AboutBirdifyScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
