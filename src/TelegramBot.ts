import { HttpClient, HttpResponse, HttpFetchOptions, HttpTooManyRequestsError } from "./HttpClient";
import { TelegramBoPinMessageInput, TelegramBotInputMedia, TelegramBotSendAnimationInput, TelegramBotSendAudioInput, TelegramBotSendMediaGroupInput, TelegramBotSendMessageInput, TelegramBotSendPhotoInput, TelegramBotSendVideoInput, TelegramResponse, TelegramResponseResult } from "./interface/ITelegramBot";
import { Logger } from "./Logger";
import { Utils } from "./Utils";

export const TG_MAX_CAPTION_LEN = 1024; // character limit for caption of photo, video or media group is 1024 characters;
export const TG_MAX_MESSAGE_LEN = 4096; // character limit for text message is 4096 characters;

export class TelegramSendMediaByUrlError extends Error {
  super(message?: string) {
    this.name = "TelegramSendMediaByUrlError";
    this.message = message ?? "send media by url error";
  }
}
export class TelegramFileTooLargeError extends Error {
  super(message?: string) {
    this.name = "TelegramFileTooLargeError";
    this.message = message ?? "Request Entity Too Large";
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
      chat_id: recipient.chat_id,
      supports_streaming: "true" as any,
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
    // tg api need to stringify media
    const media: TelegramBotInputMedia[] = input.media.map((e) => {
      return {
        height: e.height,
        width: e.width,
        // sendMediaGroup will throw "Bad Request: can't parse InputMedia: Field \"duration\" must be a valid Number" for float number. This case does not happen in sendVideo api
        duration: e.duration ? Math.round(e.duration) : undefined,
        thumb: e.thumb,
        type: e.type,
        media: e.media,
        caption: e.caption,
        parse_mode: e.parse_mode,
        supports_streaming: e.supports_streaming,
      }
    });
    input.media = JSON.stringify(media) as any;
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
        if (error_msg &&
          (
            error_msg.includes("failed to get HTTP URL content".toLowerCase()) ||
            error_msg.includes("Wrong file identifier/HTTP URL specified".toLowerCase()) ||
            error_msg.includes("group send failed".toLowerCase()) ||
            error_msg.includes("Wrong type of the web page content".toLowerCase()) ||
            error_msg.includes("WEBPAGE_CURL_FAILED".toLowerCase())
          )
        ) {
          throw new TelegramSendMediaByUrlError();
        }
        if (error_msg &&
          (
            error_msg.includes("Request Entity Too Large".toLowerCase()) ||
            error_msg.includes("too big for a photo".toLowerCase())
          )
        ) {
          throw new TelegramFileTooLargeError();
        }
      }
    }

    this.logger.info(`Sleep for ${retry_after} sec`);
    Utils.sleep(retry_after);
  }

  private async fetch(recipient: ITelegramRecipient, endpoint: string, options: HttpFetchOptions, retry = this.max_retry): Promise<TelegramResponse> {
    try {
      const res = await this.httpClient.fetchWithRetry({
        url: `${this.getApi(recipient.bot.token)}/${endpoint}`,
        options: options,
        retry: retry,
        handleRetry: (res) => this.handleRetry(res),
      });
      return Utils.parseJson(res.getContentText()) as TelegramResponse;
    } catch (error) {
      if (error instanceof HttpTooManyRequestsError) {
        const res = Utils.parseJson(error.response.getContentText()) as TelegramResponse;
        const retry_after = res.parameters?.retry_after!;
        Utils.sleep(retry_after);
        return await this.fetch(recipient, endpoint, options, retry--);
      }
      throw error;
    }
  }
}
