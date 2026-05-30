const fs = require('fs');
const path = 'c:/Birdify-1.0/BirdifyApp/src/screens/social/ChatScreen.tsx';

const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Find line 248 (index 247) and insert after it
const insertIndex = 248; // After line 248

const newFunction = [
  '',
  '  // Centralized function to mark conversation as read with duplicate guards',
  '  const markConversationAsRead = useCallback(async () => {',
  '    if (!user || messages.length === 0) return;',
  '    const lastMsg = messages[messages.length - 1];',
  '    if (!lastMsg || lastMsg.isMine) return;',
  '    ',
  '    // Only mark if the last unread message is different from the last marked',
  '    if (lastMsg.id === lastReadMessageId) return;',
  '    ',
  '    try {',
  '      await ConversationRepository.upsertLastReadMessageId(conversationId, user.id, lastMsg.id);',
  '      setLastReadMessageId(lastMsg.id);',
  '    } catch (e) {',
  '      // Silent fail, the context has fallback with polling every 30s',
  "      console.error('[ChatScreen] Error marking as read:', e);",
  '    }',
  '  }, [messages, user?.id, conversationId, lastReadMessageId]);'
];

lines.splice(insertIndex, 0, ...newFunction);

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Function inserted successfully');
