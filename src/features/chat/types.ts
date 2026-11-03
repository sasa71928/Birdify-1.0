export type MessageStatus = 'sending' | 'sent' | 'read' | 'failed';

export interface ReactionSummary {
  emoji: string;
  count: number;
  mine: boolean;
}

export interface ChatReplyInfo {
  id: string;
  text: string | null;
  imagePath: string | null;
  senderName: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string | null;
  imagePath: string | null;      // 'storage://chat-images/...' o URL firmada resuelta
  localImageUri?: string;       // preview local inmediato mientras sube
  imageWidth?: number | null;
  imageHeight?: number | null;
  createdAt: string;
  isDeleted: boolean;
  sender?: {
    id: string;
    username: string;
    fullname: string | null;
    profile_pic_url: string | null;
  };
  replyTo?: ChatReplyInfo | null;
  reactions: ReactionSummary[];
  status: MessageStatus;
}

export interface ChatMember {
  id: string;
  username: string;
  fullname: string | null;
  profile_pic_url: string | null;
  role: 'admin' | 'member';
}

export interface ChatBootstrap {
  conversation: {
    id: string;
    name: string | null;
    description: string | null;
    avatar_url: string | null;
    is_group: boolean;
    created_by: string | null;
    created_at?: string;
  };
  members: ChatMember[];
  myRole: 'admin' | 'member';
  otherUserId: string | null;
  lastReadMessageId: string | null;
  unreadCount: number;
  firstUnreadMessageId: string | null;
  blockedByMe: boolean;
  blockedMe: boolean;
}

export type ChatRow =
  | {
      type: 'date';
      key: string;
      label: string;
    }
  | {
      type: 'unread';
      key: 'unread-separator';
      count: number;
    }
  | {
      type: 'message';
      key: string;
      message: ChatMessage;
      isMine: boolean;
      isFirstInGroup: boolean;
      isLastInGroup: boolean;
      showSenderName: boolean;
    };

