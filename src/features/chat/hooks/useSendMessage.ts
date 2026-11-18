import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../../context/AuthContext';
import { chatStore } from '../data/chatStore';
import { ChatRepository } from '../data/chat.repository';
import { realtimeManager } from '../data/realtimeManager';
import { ChatMessage, ChatReplyInfo } from '../types';

export function useSendMessage(conversationId: string) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const sendMessage = useCallback(async () => {
    const trimmed = text.trim();
    const imageUri = selectedImage;
    if (!trimmed && !imageUri) return;
    if (!user) return;

    const tempId = uuidv4();
    const currentReply = replyingTo;

    let replyInfo: ChatReplyInfo | null = null;
    if (currentReply) {
      replyInfo = {
        id: currentReply.id,
        text: currentReply.text,
        imagePath: currentReply.imagePath,
        senderName: currentReply.sender?.fullname || currentReply.sender?.username || 'Usuario',
      };
    }

    // 1. Mensaje optimista instantáneo
    const pendingMessage: ChatMessage = {
      id: tempId,
      conversationId,
      senderId: user.id,
      text: trimmed || null,
      imagePath: null,
      localImageUri: imageUri || undefined,
      createdAt: new Date().toISOString(),
      isDeleted: false,
      replyTo: replyInfo,
      reactions: [],
      status: 'sending',
    };

    chatStore.addPendingMessage(conversationId, pendingMessage);

    // 2. Limpiar input inmediatamente para máxima agilidad visual
    setText('');
    setSelectedImage(null);
    setReplyingTo(null);

    // 3. Envío en background
    try {
      const confirmed = await ChatRepository.sendMessage({
        id: tempId,
        conversationId,
        senderId: user.id,
        text: trimmed || null,
        localImageUri: imageUri || null,
        replyToId: currentReply?.id || null,
      });

      const meta = chatStore.getConversation(conversationId).meta;
      const senderMember = meta?.members.find((m) => m.id === user.id);
      const confirmedMessage: ChatMessage = {
        ...pendingMessage,
        id: confirmed.id,
        imagePath: confirmed.imagePath,
        imageWidth: confirmed.imageWidth,
        imageHeight: confirmed.imageHeight,
        createdAt: confirmed.createdAt || pendingMessage.createdAt,
        localImageUri: undefined,
        sender: senderMember
          ? {
              id: senderMember.id,
              username: senderMember.username,
              fullname: senderMember.fullname,
              profile_pic_url: senderMember.profile_pic_url,
            }
          : pendingMessage.sender,
        status: 'sent',
      };

      chatStore.confirmPendingMessage(conversationId, tempId, confirmedMessage);
      realtimeManager.sendMessageBroadcast(conversationId, confirmedMessage);
    } catch (e) {
      console.warn('[useSendMessage] Error sending message:', e);
      chatStore.failPendingMessage(conversationId, tempId);
    }
  }, [text, selectedImage, replyingTo, user, conversationId]);

  const retryMessage = useCallback(
    async (failedMsg: ChatMessage) => {
      if (!user) return;
      chatStore.patchMessage(conversationId, failedMsg.id, { status: 'sending' });

      try {
        const confirmed = await ChatRepository.sendMessage({
          id: failedMsg.id,
          conversationId,
          senderId: user.id,
          text: failedMsg.text,
          localImageUri: failedMsg.localImageUri || null,
          replyToId: failedMsg.replyTo?.id || null,
        });

        const meta = chatStore.getConversation(conversationId).meta;
        const senderMember = meta?.members.find((m) => m.id === user.id);
        const confirmedMessage: ChatMessage = {
          ...failedMsg,
          id: confirmed.id,
          imagePath: confirmed.imagePath,
          imageWidth: confirmed.imageWidth,
          imageHeight: confirmed.imageHeight,
          createdAt: confirmed.createdAt || failedMsg.createdAt,
          localImageUri: undefined,
          sender: senderMember
            ? {
                id: senderMember.id,
                username: senderMember.username,
                fullname: senderMember.fullname,
                profile_pic_url: senderMember.profile_pic_url,
              }
            : failedMsg.sender,
          status: 'sent',
        };

        chatStore.confirmPendingMessage(conversationId, failedMsg.id, confirmedMessage);
        realtimeManager.sendMessageBroadcast(conversationId, confirmedMessage);
      } catch (e) {
        console.warn('[useSendMessage] Retry failed:', e);
        chatStore.failPendingMessage(conversationId, failedMsg.id);
      }
    },
    [conversationId, user]
  );

  const discardMessage = useCallback(
    (messageId: string) => {
      chatStore.removeMessage(conversationId, messageId);
    },
    [conversationId]
  );

  return {
    text,
    setText,
    selectedImage,
    setSelectedImage,
    replyingTo,
    setReplyingTo,
    sendMessage,
    retryMessage,
    discardMessage,
  };
}

