import { HttpClient, HttpResponse, HttpFetchOptions, HttpBlob } from "./HttpClient";
import { Logger } from "./Logger";
import { Utils } from "./Utils";

export const TG_MAX_CAPTION_LEN = 1024; // character limit for caption of photo, video or media group is 1024 characters;
export const TG_MAX_MESSAGE_LEN = 4096; // character limit for text message is 4096 characters;

interface TelegramBotSendInput {
  chat_id?: number | string;

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

interface TelegramBotSendMessageInput extends TelegramBotSendInput {
  text: string;
  entities?: any[];
  disable_web_page_preview?: boolean;
}

interface TelegramBotSendPhotoInput extends TelegramBotSendFileInput {
  photo: string | HttpBlob;
}

interface TelegramBotSendAudioInput extends TelegramBotSendFileInput {
  audio: string | HttpBlob;
  duration?: number;
  performer?: string;
  title?: string;
  thumb?: string;
}

interface TelegramBotSendVideoInput extends TelegramBotSendFileInput {
  video: string | HttpBlob;
  duration?: number;
  width?: number;
  height?: number;
  thumb?: HttpBlob;
  supports_streaming?: boolean;
}

interface TelegramBotSendAnimationInput extends TelegramBotSendFileInput {
  animation: string | HttpBlob;
  duration?: number;
  width?: number;
  height?: number;
  thumb?: string | HttpBlob;
}

export interface TelegramBotInputMedia {
  type: 'audio' | 'photo' | 'video';
  media: string | HttpBlob;
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

export class TelegramSendMediaByUrlError extends Error {
  super(message?: string) {
    this.name = "TelegramSendMediaByUrlError";
    this.message = message ?? "send media by url error";
  }
}

export interface ITelegramBot {
  name: string;
  token: string;
  is_default?: boolean;
}

export interface ITelegramRecipient {
  bot: ITelegramBot;
  chat_id: string;
  pin_all_message?: boolean;
  // is_default?: boolean;
}

export interface TelegramResponse {
  ok: boolean;
  description?: string;
  result?: TelegramResponseResult | TelegramResponseResult[];
  error_code?: number;
  parameters?: { migrate_to_chat_id?: number, retry_after?: number };
}

export class TelegramBot {
  private max_retry;
  private retry_second;
  private logger;
  private httpClient;
  constructor(i: { max_retry?: number, retry_second: number, logger: Logger, httpClient: HttpClient }) {
    const { max_retry, retry_second, logger, httpClient } = i;
    this.max_retry = max_retry ?? 0;
    this.retry_second = retry_second;
    this.logger = logger;
    this.httpClient = httpClient;
  }

  async sendMessage(recipient: ITelegramRecipient, input: TelegramBotSendMessageInput) {
    input = {
      parse_mode: 'HTML',
      chat_id: recipient.chat_id,
      ...input
    };
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(recipient, `sendMessage`, options);
    return res;
  }

  async sendPhoto(recipient: ITelegramRecipient, input: TelegramBotSendPhotoInput) {
    input = {
      parse_mode: 'HTML',
      chat_id: recipient.chat_id,
      ...input
    };
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(recipient, `sendPhoto`, options);
    return res;
  }

  async sendAudio(recipient: ITelegramRecipient, input: TelegramBotSendAudioInput) {
    input = {
      parse_mode: 'HTML',
      chat_id: recipient.chat_id,
      ...input
    };
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(recipient, `sendAudio`, options);
    return res;
  }

  async sendVideo(recipient: ITelegramRecipient, input: TelegramBotSendVideoInput) {
    input = {
      parse_mode: 'HTML',
      chat_id: recipient.chat_id,
      ...input
    };
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(recipient, `sendVideo`, options);
    return res;
  }

  async sendAnimation(recipient: ITelegramRecipient, input: TelegramBotSendAnimationInput) {
    input = {
      parse_mode: 'HTML',
      chat_id: recipient.chat_id,
      ...input
    };
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(recipient, `sendAnimation`, options);
    return res;
  }

  async sendMediaGroup(recipient: ITelegramRecipient, input: TelegramBotSendMediaGroupInput) {
    // set default parse_mode
    input.media[0] = { parse_mode: 'HTML', ...input.media[0]! };
    // tg api need to stringify media
    input.media = JSON.stringify(input.media) as any;
    input = {
      chat_id: recipient.chat_id, //set default chat_id
      ...input
    };
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(recipient, `sendMediaGroup`, options);
    return res;
  }

  async pinChatMessage(recipient: ITelegramRecipient, input: TelegramBoPinMessageInput) {
    input = {
      chat_id: recipient.chat_id, //set default chat_id
      ...input
    };
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(recipient, `pinChatMessage`, options);
    return res;
  }

  public static getFileId(result: TelegramResponseResult) {
    if (result.photo) {
      const photos = result.photo;
      return photos[photos.length - 1]!.file_id;
    }
    if (result.video) {
      return result.video.file_id;
    }
    if (result.audio) {
      return result.audio.file_id;
    }
    if (result.document) {
      return result.document.file_id;
    }
    if (result.animation) {
      return result.animation.file_id;
    }
  }

  private getApi(token: string) {
    return `https://api.telegram.org/bot${token}`;
  }

  private handleRetry(res?: HttpResponse) {
    const status_code = res?.getResponseCode();

    let retry_after = this.retry_second;

    if (status_code !== undefined) {
      const error = Utils.parseJson(res!.getContentText()) as TelegramResponse;
      if (status_code === 429) {
        retry_after = error.parameters?.retry_after!;
      } else if (status_code === 400) {
        const error_msg = error.description?.toLowerCase();
        if (error_msg && (error_msg.includes("failed to get HTTP URL content".toLowerCase()) ||
          error_msg.includes("Wrong file identifier/HTTP URL specified".toLowerCase()) ||
          error_msg.includes("group send failed".toLowerCase()) ||
          error_msg.includes("Wrong type of the web page content".toLowerCase()))
        ) {
          throw new TelegramSendMediaByUrlError();
        }
      }
    }

    this.logger.info(`Sleep for ${retry_after} sec`);
    Utils.sleep(retry_after);
  }

  private async fetch(recipient: ITelegramRecipient, endpoint: string, options: HttpFetchOptions,) {
    const res = await this.httpClient.fetchWithRetry({
      url: `${this.getApi(recipient.bot.token)}/${endpoint}`,
      options: options,
      retry: this.max_retry,
      handleRetry: (res) => this.handleRetry(res),
    });

    return Utils.parseJson(res.getContentText()) as TelegramResponse;
  }
}
