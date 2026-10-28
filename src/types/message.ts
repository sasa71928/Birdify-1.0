export interface Message {
  id: string;
  text: string;
  time: string;
  isMine: boolean;
  image?: string;
  senderName?: string;
  senderAvatar?: string;
  replyToId?: string;
  replyToText?: string;
  replyToUser?: string;
  replyToImage?: string;
  isRead?: boolean;
  createdAt?: string;
}
