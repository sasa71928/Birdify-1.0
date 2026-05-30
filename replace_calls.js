const fs = require('fs');
const path = 'c:/Birdify-1.0/BirdifyApp/src/screens/social/ChatScreen.tsx';

let content = fs.readFileSync(path, 'utf8');

// Replace first call (in useEffect that responds to new messages)
const oldCall1 = `    // Marcar como leído hasta el último mensaje
    if (user && lastMessage) {
      console.log('[ChatScreen] Marking as read:', lastMessage.id);
      ConversationRepository.upsertLastReadMessageId(conversationId, user.id, lastMessage.id).catch(e => {
        console.error('[ChatScreen] Error marking as read:', e);
        handleError(e, setToast, 'Error marking messages as read');
      });
    }`;

const newCall1 = `    // Marcar como leído hasta el último mensaje
    if (isNearBottomRef.current) {
      markConversationAsRead();
    }`;

content = content.replace(oldCall1, newCall1);

// Replace second call (in useEffect that marks as read when opening the chat)
const oldCall2 = `    const lastMessage = messages[messages.length - 1];
    if (user && lastMessage && !lastMessage.isMine && !lastMessage.isRead) {
      console.log('[ChatScreen] Opening chat - marking last message as read:', lastMessage.id);
      ConversationRepository.upsertLastReadMessageId(conversationId, user.id, lastMessage.id).catch(e => {
        console.error('[ChatScreen] Error marking as read on open:', e);
      });
    }`;

const newCall2 = `    markConversationAsRead();`;

content = content.replace(oldCall2, newCall2);

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced both calls successfully');
