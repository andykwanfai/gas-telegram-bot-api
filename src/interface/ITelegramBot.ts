import { HttpBlob } from "../HttpClient";

interface TelegramBotSendInput {
  chat_id?: number | string;
  message_thread_id?: number | string;

  parse_mode?: string;

  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: any;
}

export interface TelegramBotSendFileInput extends TelegramBotSendInput {
  caption?: string;
  caption_entities?: any[];
}

export interface TelegramBotSendMessageInput extends TelegramBotSendInput {
  text: string;
  entities?: any[];
  disable_web_page_preview?: boolean;
}

export interface TelegramBotSendPhotoInput extends TelegramBotSendFileInput {
  photo: string | HttpBlob;
}

export interface TelegramBotSendAudioInput extends TelegramBotSendFileInput {
  audio: string | HttpBlob;
  duration?: number;
  performer?: string;
  title?: string;
  thumb?: string;
}

export interface TelegramBotSendVideoInput extends TelegramBotSendFileInput {
  video: string | HttpBlob;
  duration?: number;
  width?: number;
  height?: number;
  thumb?: HttpBlob;
  supports_streaming?: boolean;
}

export interface TelegramBotSendAnimationInput extends TelegramBotSendFileInput {
  animation: string | HttpBlob;
  duration?: number;
  width?: number;
  height?: number;
  thumb?: string | HttpBlob;
}

export interface TelegramBotInputMedia {
  type: 'audio' | 'photo' | 'video';
  media: string | HttpBlob;
  duration?: number;
  width?: number;
  height?: number;
  thumb?: string;
  supports_streaming?: boolean;
  caption?: string;
  parse_mode?: string;
}

export interface TelegramBotSendMediaGroupInput extends TelegramBotSendInput {
  media: TelegramBotInputMedia[];
  duration?: number;
  width?: number;
  height?: number;
  thumb?: string;
  supports_streaming?: boolean;
  [index: number]: HttpBlob;
}

export interface TelegramBoPinMessageInput {
  chat_id?: string;
  message_id: number;
  disable_notification?: boolean;
}

export interface TelegramResponseResult {
  message_id: number;
  photo?: { file_id: string }[];
  video?: { file_id: string };
  document?: { file_id: string };
  audio?: { file_id: string };
  animation?: { file_id: string };
  media_group_id?: string;
  caption?: string;
  text?: string;
  date: number;
  sender_chat?: {
    id: number,
    title: string,
    username: string,
    type: string
  },
  chat?: {
    id: number,
    title: string,
    username: string,
    type: string
  },
}

export interface TelegramBotUpdate {
  update_id: number;
  message?: TelegramBotMessage;
}

export interface TelegramBotUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

interface TelegramBotChatPhoto {
  small_file_id: string;
  small_file_unique_id: string;
  big_file_id: string;
  big_file_unique_id: string;
}

export interface TelegramBotChat {
  id: number;
  type: 'private' | "group" | "supergroup" | "channel";
  title?: string;
  username?: string;
  first_name: string;
  last_name?: string;
  is_forum?: boolean;
  photo?: TelegramBotChatPhoto;
  active_usernames?: string[];
  emoji_status_custom_emoji_id?: string;
  emoji_status_expiration_date?: number;
  bio?: string;
  has_private_forwards?: boolean;
  has_restricted_voice_and_video_messages?: boolean;
  join_to_send_messages?: boolean;
  join_by_request?: boolean;
  description?: string;
  invite_link?: string;
  pinned_message?: TelegramBotMessage;
  permissions?: TelegramBotChatPermissions;
  slow_mode_delay?: number;
  message_auto_delete_time?: number;
  has_aggressive_anti_spam_enabled?: boolean;
  has_hidden_members?: boolean;
  has_protected_content?: boolean;
  sticker_set_name?: string;
  can_set_sticker_set?: boolean;
  linked_chat_id?: number;
  location?: TelegramBotChatLocation;
}

interface TelegramBotChatPermissions {
  can_send_messages?: boolean;
  can_send_audios?: boolean;
  can_send_documents?: boolean;
  can_send_photos?: boolean;
  can_send_videos?: boolean;
  can_send_video_notes?: boolean;
  can_send_voice_notes?: boolean;
  can_send_polls?: boolean;
  can_send_other_messages?: boolean;
  can_add_web_page_previews?: boolean;
  can_change_info?: boolean;
  can_invite_users?: boolean;
  can_pin_messages?: boolean;
  can_manage_topics?: boolean;
}

interface TelegramBotLocation {
  longitude: number;
  latitude: number;
  horizontal_accuracy?: number;
  live_period?: number;
  heading?: number;
  proximity_alert_radius?: number;
}

interface TelegramBotChatLocation {
  location: TelegramBotLocation;
  address: string;
}

export interface TelegramBotMessage {
  message_id: number;
  message_thread_id?: number;
  from?: TelegramBotUser;
  sender_chat?: TelegramBotChat;
  date: number;
  chat: TelegramBotChat;
  text?: string;
}

export interface TelegramResponse {
  ok: boolean;
  description?: string;
  result?: TelegramResponseResult | TelegramResponseResult[];
  error_code?: number;
  parameters?: { migrate_to_chat_id?: number, retry_after?: number };
}
