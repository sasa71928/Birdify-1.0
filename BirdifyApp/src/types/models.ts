export interface User {
  id: string;
  email: string;
  username: string;
  fullname: string | null;
  bio: string | null;
  profile_pic_url: string | null;
  is_private: boolean;
  is_verified: boolean;
  user_level: 'general' | 'admin' | 'moderator';
  created_at: string;
  expo_push_token: string | null;
  notification_settings: any | null;
  push_notifications: boolean;
  email_notifications: boolean;
}

export interface Bird {
  id: string;
  common_name: string;
  scientific_name: string;
  description: string | null;
  season: string | null;
  habitat_info: string | null;
  ideal_zones: string | null;
}

export interface Sighting {
  id: string;
  user_id: string;
  bird_id: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  is_location_private: boolean;
  photo_url: string | string[] | null;
  sighting_date: string;
  created_at: string;
  updated_at: string;
  user?: Partial<User>;
  bird?: Partial<Bird>;
}

export interface Comment {
  id: string;
  sighting_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  is_subcomment: boolean;
  created_at: string;
  updated_at: string;
  user?: Partial<User>;
  replies?: Comment[];
}

export interface Reaction {
  user_id: string;
  sighting_id: string;
  created_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export type UpdateProfileDTO = Partial<Omit<User, 'id' | 'created_at' | 'email'>>;
