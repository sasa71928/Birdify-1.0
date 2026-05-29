import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { createStyles } from '../../styles/screens/settings/settingsSubScreens.styles';
import { useAuth } from '../../context/AuthContext';
import { UserBlockRepository } from '../../repositories/user_block.repository';
import { handleError } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';

interface BlockedUserItem {
  id: string;
  username: string;
  fullname?: string | null;
  profile_pic_url?: string | null;
}

export default function BlockedUsersScreen() {
  const navigation = useNavigation();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user } = useAuth();

  const [blockedUsers, setBlockedUsers] = useState<BlockedUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingUserId, setUnblockingUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3200);
  };

  const loadBlockedUsers = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await UserBlockRepository.getBlockedUsers(user.id);
      setBlockedUsers(data || []);
    } catch (error) {
      handleError(error, setToast, 'No se pudieron cargar los usuarios bloqueados');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadBlockedUsers();
    }, [loadBlockedUsers])
  );

  const handleUnblock = async (blockedId: string, username: string) => {
    if (!user || unblockingUserId) return;

    try {
      setUnblockingUserId(blockedId);
      await UserBlockRepository.unblock(user.id, blockedId);
      setBlockedUsers(prev => prev.filter(item => item.id !== blockedId));
      handleError(`Desbloqueaste a @${username}`, setToast, 'Success');
    } catch (error) {
      handleError(error, setToast, 'No se pudo desbloquear al usuario');
    } finally {
      setUnblockingUserId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked Users</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 24, flexGrow: blockedUsers.length ? 0 : 1 }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="shield-checkmark-outline" size={42} color={colors.textSecondary} />
              <Text style={{ marginTop: 12, color: colors.textSecondary, textAlign: 'center' }}>
                No tienes usuarios bloqueados.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.canvasPure,
                borderColor: colors.border + '20',
                borderWidth: 1,
                borderRadius: 14,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <Image
                source={{ uri: item.profile_pic_url || 'https://gravatar.com/avatar/?d=mp' }}
                style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                  {item.fullname || item.username}
                </Text>
                <Text style={{ color: colors.textSecondary, marginTop: 2 }}>@{item.username}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleUnblock(item.id, item.username)}
                disabled={unblockingUserId === item.id}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: colors.primary + '15',
                  minWidth: 94,
                  alignItems: 'center',
                }}
              >
                {unblockingUserId === item.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>Desbloquear</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
