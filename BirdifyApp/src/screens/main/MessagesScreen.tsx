import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Typography, Spacing, Radius, Shadows } from '../../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../../components/TopNavBar';
import { RootStackParamList, ChatThread } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/main/messagesScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

type MessagesNavProp = NativeStackNavigationProp<RootStackParamList, 'Messages'>;

const MOCK_THREADS: ChatThread[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
    lastMessage: 'Did you see the Cardinal at the feeder today?',
    time: '2m',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Mike Thompson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
    lastMessage: 'Thanks for sharing the coordinates, headed there now.',
    time: '1h',
  },
  {
    id: '3',
    name: 'Local Birders Group',
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=100',
    lastMessage: 'Elena: Found a great spot for warblers near the old mill.',
    time: 'Yesterday',
    isGroup: true,
  },
  {
    id: '4',
    name: 'Anna K.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100',
    lastMessage: 'Yes, the lighting was perfect for those shots.',
    time: 'Tue',
  },
];


export default function MessagesScreen() {
  const navigation = useNavigation<MessagesNavProp>();
  const { shared, screen: styles, colors, isDark } = useDynamicStyles(createStyles);

  const renderItem = ({ item }: { item: ChatThread }) => (
    <TouchableOpacity
      style={[styles.threadItem, item.unreadCount ? styles.unreadThread : null]}
      activeOpacity={0.75}
      onPress={() => navigation.navigate('Chat', { thread: item })}
    >
      <View style={styles.avatarContainer}>
        {item.isGroup ? (
            <View style={styles.groupAvatar}>
                <Ionicons name="people" size={24} color={colors.secondaryBlue} />
            </View>
        ) : (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
        )}
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.threadInfo}>
        <View style={styles.threadHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.threadFooter}>
          <Text style={styles.lastMessage} numberOfLines={2}>{item.lastMessage}</Text>
          {item.unreadCount ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <TopNavBar />

      <View style={styles.container}>
        {/* ── Encabezado con título y botón crear grupo ── */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Messages</Text>
          <TouchableOpacity style={styles.createGroupBtn} activeOpacity={0.8} onPress={() => navigation.navigate('CreateGroup')}>
            <MaterialCommunityIcons name="account-multiple-plus-outline" size={20} color={colors.canvasPure} />
            <Text style={styles.createGroupText}>New Group</Text>
          </TouchableOpacity>
        </View>

        {/* ── Búsqueda ── */}
        <TouchableOpacity
          style={styles.searchContainer}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SearchMessages')}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search messages...</Text>
        </TouchableOpacity>

        <FlatList
          data={MOCK_THREADS}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

