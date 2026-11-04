import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../../components/ui/Avatar';
import { FollowRepository } from '../../../repositories/follow.repository';
import { ConversationRepository } from '../../../repositories/conversation.repository';
import { handleError } from '../../../utils/errorHandler';
import { Typography } from '../../../theme';
import { useT } from '../../../i18n';

interface NewConversationModalProps {
  visible: boolean;
  onClose: () => void;
  user: any;
  navigation: any;
  setToast: React.Dispatch<React.SetStateAction<{ visible: boolean; message: string; type: 'success' | 'error' }>>;
  styles: any;
  colors: any;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = React.memo(({
  visible,
  onClose,
  user,
  navigation,
  setToast,
  styles,
  colors,
}) => {
  const { t } = useT();
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [startingChat, setStartingChat] = useState<string | null>(null);

  const loadFollowingUsers = useCallback(async () => {
    if (!user) return;
    setLoadingUsers(true);
    try {
      const following = await FollowRepository.getFollowing(user.id);
      setFollowingUsers(following || []);
      setFilteredUsers(following || []);
    } catch (e) {
      handleError(e, setToast, 'No se pudo cargar la lista de contactos');
    } finally {
      setLoadingUsers(false);
    }
  }, [user, setToast]);

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      loadFollowingUsers();
    }
  }, [visible, loadFollowingUsers]);

  const handleSearch = (queryText: string) => {
    setSearchQuery(queryText);
    if (!queryText.trim()) {
      setFilteredUsers(followingUsers);
      return;
    }
    const lower = queryText.toLowerCase();
    setFilteredUsers(
      followingUsers.filter(
        (u) =>
          u.username?.toLowerCase().includes(lower) ||
          u.fullname?.toLowerCase().includes(lower)
      )
    );
  };

  const handleSelectUser = async (selectedUser: any) => {
    if (!user || startingChat) return;
    setStartingChat(selectedUser.id);
    try {
      const conversationId = await ConversationRepository.createDirectConversation(
        user.id,
        selectedUser.id
      );
      onClose();
      navigation.navigate('Chat', { conversationId });
    } catch (e) {
      handleError(e, setToast, 'No se pudo abrir el chat');
    } finally {
      setStartingChat(null);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalSafe, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.modalHeader,
            { borderBottomColor: colors.border + '20', backgroundColor: colors.surface },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text
            style={[
              styles.modalHeaderTitle,
              { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
            ]}
          >
            {t('messages.newChatModalTitle')}
          </Text>
        </View>

        <View
          style={[
            styles.modalSearchRow,
            { backgroundColor: colors.componentBase, borderColor: colors.border + '30' },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            autoFocus
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder={t('messages.searchFollowingPlaceholder')}
            placeholderTextColor={colors.placeholder}
            style={[styles.modalInput, { color: colors.textPrimary }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {loadingUsers ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.noUsersText, { color: colors.textSecondary }]}>
              {searchQuery
                ? t('messages.noFollowingFound', { query: searchQuery })
                : t('messages.notFollowingAnyone')}
            </Text>
          </View>
        ) : (
          <FlashList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={startingChat === item.id}
                onPress={() => handleSelectUser(item)}
                style={[styles.userRow, { borderBottomColor: colors.border + '15' }]}
              >
                <Avatar uri={item.profile_pic_url} name={item.fullname || item.username} size={44} />
                <View style={styles.userInfo}>
                  <Text
                    style={[
                      styles.userName,
                      { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
                    ]}
                  >
                    {item.fullname || item.username}
                  </Text>
                  <Text style={[styles.userHandle, { color: colors.textSecondary }]}>
                    @{item.username}
                  </Text>
                </View>
                {startingChat === item.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
});

