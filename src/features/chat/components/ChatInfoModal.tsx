import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../../components/ui/Avatar';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { createStyles } from '../styles/chatInfoModal.styles';
import { Radius, Typography } from '../../../theme';
import { useT } from '../../../i18n';
import { ChatBootstrap, ChatMember } from '../types';
import { ChatRepository } from '../data/chat.repository';
import { chatStore } from '../data/chatStore';
import { ProfileRepository } from '../../../repositories/profile.repository';
import { User } from '../../../types/models';
import { ImageViewer } from './ImageViewer';

interface ChatInfoModalProps {
  visible: boolean;
  onClose: () => void;
  meta: ChatBootstrap | undefined;
  conversationId: string;
  onPressImage: (url: string) => void;
  onPressMember: (userId: string) => void;
  onPressEditGroup: () => void;
  onPressSearch: () => void;
}

interface SharedPhoto {
  id: string;
  url: string;
  createdAt: string;
}

export const ChatInfoModal: React.FC<ChatInfoModalProps> = ({
  visible,
  onClose,
  meta,
  conversationId,
  onPressImage,
  onPressMember,
  onPressEditGroup,
  onPressSearch,
}) => {
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { t } = useT();

  const [photos, setPhotos] = useState<SharedPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const isGroup = Boolean(meta?.conversation.is_group);
  const otherMember = meta?.members.find((m) => m.id === meta?.otherUserId);

  // Cargar fotos y detalles del usuario cuando se abre el modal
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;

    // 1. Fotos compartidas
    const loadSharedPhotos = async () => {
      setLoadingPhotos(true);
      try {
        // Cargar desde repo
        const fetched = await ChatRepository.getSharedPhotos(conversationId);

        // Combinar con fotos del store local que pudieran no haber sincronizado aún
        const localConv = chatStore.getConversation(conversationId);
        const localPhotos: SharedPhoto[] = Object.values(localConv.byId)
          .filter((m) => Boolean(m.imagePath) && !m.isDeleted)
          .map((m) => ({
            id: m.id,
            url: m.localImageUri || m.imagePath!,
            createdAt: m.createdAt,
          }));

        // Combinar eliminando duplicados por ID
        const map = new Map<string, SharedPhoto>();
        for (const p of [...localPhotos, ...fetched]) {
          if (!map.has(p.id)) {
            map.set(p.id, p);
          }
        }

        if (isMounted) {
          setPhotos(Array.from(map.values()));
        }
      } catch (e) {
        console.warn('[ChatInfoModal] Error loading photos:', e);
      } finally {
        if (isMounted) setLoadingPhotos(false);
      }
    };

    // 2. Información del otro usuario (en 1 a 1)
    const loadUserDetails = async () => {
      if (isGroup || !meta?.otherUserId) return;
      setLoadingUser(true);
      try {
        const u = await ProfileRepository.getById(meta.otherUserId);
        if (isMounted && u) {
          setOtherUser(u);
        }
      } catch (e) {
        console.warn('[ChatInfoModal] Error loading user details:', e);
      } finally {
        if (isMounted) setLoadingUser(false);
      }
    };

    loadSharedPhotos();
    loadUserDetails();

    return () => {
      isMounted = false;
    };
  }, [visible, conversationId, isGroup, meta?.otherUserId]);

  if (!meta) return null;

  const title = isGroup
    ? meta.conversation.name || 'Grupo'
    : otherUser?.fullname || otherMember?.fullname || otherMember?.username || 'Usuario';

  const username = isGroup
    ? null
    : otherUser?.username || otherMember?.username || null;

  const avatarUrl = isGroup
    ? meta.conversation.avatar_url
    : otherUser?.profile_pic_url || otherMember?.profile_pic_url;

  const description = isGroup
    ? meta.conversation.description
    : otherUser?.bio;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.canvasPure }]}
        edges={['top', 'bottom']}
      >
        {/* Top Bar */}
        <View style={[styles.topBar, { borderBottomColor: colors.border + '20' }]}>
          <TouchableOpacity
            style={styles.closeBtn}
            activeOpacity={0.7}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {isGroup ? t('chat.chatInfo.groupInfo') : t('chat.chatInfo.userInfo')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Avatar
              uri={avatarUrl}
              name={title}
              size={88}
              isGroup={isGroup}
            />
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]} numberOfLines={2}>
              {title}
            </Text>

            {isGroup ? (
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                {t('chat.membersCount', { count: meta.members.length })}
              </Text>
            ) : username ? (
              <View style={styles.usernameRow}>
                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                  @{username}
                </Text>
                {otherUser?.is_verified && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                )}
              </View>
            ) : null}

            {/* Bio / Descripción */}
            {description ? (
              <View
                style={[
                  styles.descBox,
                  {
                    backgroundColor: colors.componentBase,
                    borderColor: colors.border + '20',
                  },
                ]}
              >
                <Text style={[styles.descText, { color: colors.textSecondary }]}>
                  {description}
                </Text>
              </View>
            ) : null}

            {/* Quick Actions Row */}
            <View style={styles.actionRow}>
              {/* Buscar en chat */}
              <TouchableOpacity
                style={[
                  styles.actionPill,
                  {
                    backgroundColor: colors.componentBase,
                    borderColor: colors.border + '25',
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  onPressSearch();
                }}
              >
                <Ionicons name="search" size={18} color={colors.primary} />
                <Text style={[styles.actionPillText, { color: colors.textPrimary }]}>
                  {t('chat.chatInfo.searchInChat')}
                </Text>
              </TouchableOpacity>

              {/* Si es 1 a 1: Ver Perfil */}
              {!isGroup && meta.otherUserId && (
                <TouchableOpacity
                  style={[
                    styles.actionPill,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onPressMember(meta.otherUserId!);
                  }}
                >
                  <Ionicons name="person" size={18} color="#FFFFFF" />
                  <Text style={[styles.actionPillText, { color: '#FFFFFF', fontWeight: '700' }]}>
                    {t('chat.chatInfo.viewProfile')}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Si es grupo y soy admin: Editar Grupo */}
              {isGroup && meta.myRole === 'admin' && (
                <TouchableOpacity
                  style={[
                    styles.actionPill,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onPressEditGroup();
                  }}
                >
                  <Ionicons name="pencil" size={18} color="#FFFFFF" />
                  <Text style={[styles.actionPillText, { color: '#FFFFFF', fontWeight: '700' }]}>
                    {t('chat.chatInfo.editGroup')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.sectionDivider, { backgroundColor: colors.border + '15' }]} />

          {/* Sección de Fotos Compartidas */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWrap}>
                <Ionicons name="images" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  {t('chat.chatInfo.sharedPhotos')}
                </Text>
              </View>
              {photos.length > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                    {photos.length}
                  </Text>
                </View>
              )}
            </View>

            {loadingPhotos && photos.length === 0 ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : photos.length === 0 ? (
              <View
                style={[
                  styles.emptyMediaBox,
                  {
                    backgroundColor: colors.componentBase,
                    borderColor: colors.border + '20',
                  },
                ]}
              >
                <Ionicons
                  name="image-outline"
                  size={32}
                  color={colors.textSecondary}
                  style={{ opacity: 0.6 }}
                />
                <Text style={[styles.emptyMediaText, { color: colors.textSecondary }]}>
                  {t('chat.chatInfo.noSharedPhotos')}
                </Text>
              </View>
            ) : (
              <View style={styles.photoGrid}>
                {photos.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.photoCell}
                    activeOpacity={0.8}
                    onPress={() => setPreviewImage(item.url)}
                  >
                    <Image
                      source={{ uri: item.url }}
                      style={styles.photoThumb}
                      contentFit="cover"
                      transition={200}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Si es Grupal: Lista de Integrantes */}
          {isGroup && (
            <>
              <View style={[styles.sectionDivider, { backgroundColor: colors.border + '15' }]} />

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleWrap}>
                    <Ionicons name="people" size={20} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                      {t('chat.chatInfo.members')}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: colors.primary + '20' },
                    ]}
                  >
                    <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                      {meta.members.length}
                    </Text>
                  </View>
                </View>

                <View style={styles.membersList}>
                  {meta.members.map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberRow,
                        {
                          backgroundColor: colors.componentBase,
                          borderColor: colors.border + '20',
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        onClose();
                        onPressMember(member.id);
                      }}
                    >
                      <Avatar
                        uri={member.profile_pic_url}
                        name={member.fullname || member.username}
                        size={44}
                      />
                      <View style={styles.memberInfo}>
                        <Text
                          style={[styles.memberName, { color: colors.textPrimary }]}
                          numberOfLines={1}
                        >
                          {member.fullname || member.username}
                        </Text>
                        <Text
                          style={[styles.memberUsername, { color: colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          @{member.username}
                        </Text>
                      </View>

                      {/* Badge de Rol */}
                      {member.role === 'admin' ? (
                        <View
                          style={[
                            styles.roleBadge,
                            { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.roleText,
                              { color: isDark ? '#34D399' : '#059669' },
                            ]}
                          >
                            {t('chat.chatInfo.admin')}
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.roleBadge,
                            { backgroundColor: colors.border + '25' },
                          ]}
                        >
                          <Text style={[styles.roleText, { color: colors.textSecondary }]}>
                            {t('chat.chatInfo.member')}
                          </Text>
                        </View>
                      )}

                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={colors.textSecondary}
                        style={{ opacity: 0.6 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Si es 1 a 1: Datos adicionales del usuario */}
          {!isGroup && otherUser && (
            <>
              <View style={[styles.sectionDivider, { backgroundColor: colors.border + '15' }]} />

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleWrap}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                      {t('chat.chatInfo.about')}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: colors.componentBase,
                      borderColor: colors.border + '20',
                    },
                  ]}
                >
                  {otherUser.user_level && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Nivel de observador
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                        {otherUser.user_level}
                      </Text>
                    </View>
                  )}

                  {otherUser.created_at && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        {t('chat.chatInfo.joined')}
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                        {new Date(otherUser.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Visor de imágenes para fotos de la galería */}
        <ImageViewer
          visible={previewImage !== null}
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      </SafeAreaView>
    </Modal>
  );
};
