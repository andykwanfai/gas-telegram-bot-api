import { Log } from './Logger';
import { Utils } from './Utils';

export class HttpPostSizeExceedLimitError extends Error {
  constructor(message?: string) {
    super(message ?? "Limit Exceeded: URLFetch POST Size.");
    this.name = "HttpPostSizeExceedLimitError";
  }
}
export class HttpTooManyRequestsError extends Error {
  constructor(message?: string) {
    super(message ?? "Too Many Request.");
    this.name = "HttpTooManyRequestsError";
  }
}

export interface HttpFetchOptions extends GoogleAppsScript.URL_Fetch.URLFetchRequestOptions {
  params?: object;
}

export interface HttpBlob extends GoogleAppsScript.Base.Blob { }

export interface IHttpResponse extends GoogleAppsScript.URL_Fetch.HTTPResponse { }
export interface HttpResponse extends IHttpResponse { }
export class HttpResponse {
  constructor(res: IHttpResponse) {
    Object.assign(this, res);
  }

  getSetCookieHeader() {
    const headers: any = this.getAllHeaders();
    const set_cookie = headers['Set-Cookie'] ?? headers['set-cookie'];
    return set_cookie as string[] | undefined;
  }

  getContentLength() {
    const headers: any = this.getHeaders();
    const content_length = headers['Content-Length'] ?? headers['content-legnth'];
    return content_length as number | undefined;
  }
}

function querystring(obj: object) {
  return Object.entries(obj).map(([key, value]) => {
    return `${key}=${value}`;
  }).join('&');
}

function appendQuerystring(url: string, obj: object) {
  const question_mark_index = url.indexOf('?');
  const qs = querystring(obj);
  if (question_mark_index > 0) {
    return `${url}&${qs}`;
  }
  return `${url}?${qs}`;
}

export class HttpClient {
  private logger;
  private retry_second;
  constructor(logger: Log, retry_second: number) {
    this.logger = logger;
    this.retry_second = retry_second;
  }

  public getRetrySecond() {
    return this.retry_second;
  }

  async fetch(url: string, options: HttpFetchOptions) {
    if (options.params) {
      url = appendQuerystring(url, options.params);
    }
    this.logger.debug(url);
    this.logger.debug(options);
    const res = UrlFetchApp.fetch(url, options);
    return new HttpResponse(res);
  }

  async fetchWithRetry(i: {
    url: string;
    options: HttpFetchOptions;
    retry: number;
    handleRetry?: (res?: HttpResponse) => void;
  }): Promise<HttpResponse> {
    const { url, options, handleRetry: handleRetry } = i;
    let { retry } = i;

    let res;
    let error_message;
    try {
      res = await this.fetch(url, { ...options, muteHttpExceptions: true });
    } catch (error: any) {
      // catch Address unavailable error
      error_message = error.message as string;
    }

    const status_code = res?.getResponseCode() ?? 9999;
    if (status_code < 400) {
      return res as HttpResponse;
    }

    error_message = error_message ?? res?.getContentText();
    this.logger.info(`fetch error: ${error_message}`);

    if (error_message?.includes("Limit Exceeded: URLFetch POST Size")) {
      throw new HttpPostSizeExceedLimitError();
    }
    if (status_code === 429) {
      throw new HttpTooManyRequestsError();
    }

    if (retry <= 0) {
      const msg = `fetch error after retry: ${error_message}`;
      this.logger.info(msg);
      throw new Error(msg);
    }

    retry--;

    if (handleRetry) {
      handleRetry(res);
    } else {
      this.defaultHandleRetry();
    }

    return await this.fetchWithRetry({ url, options, retry });
  }

  private defaultHandleRetry() {
    const retry_after = this.retry_second;

    this.logger.info(`Sleep for ${retry_after} sec`);
    Utils.sleep(retry_after);
  }

  async get(url: string, params?: object, options?: HttpFetchOptions) {
    return await this.fetch(url, { ...options, params: params, method: 'get' });
  }

  async post(url: string, body?: object, options?: HttpFetchOptions) {
    return await this.fetch(url, { ...options, payload: body, method: 'post' });
  }

  async put(url: string, body?: object, options?: HttpFetchOptions) {
    return await this.fetch(url, { ...options, payload: body, method: 'put' });
  }

  async patch(url: string, body?: object, options?: HttpFetchOptions) {
    return await this.fetch(url, { ...options, payload: body, method: 'patch' });
  }

  async delete(url: string, options?: HttpFetchOptions) {
    return await this.fetch(url, { ...options, method: 'delete' });
  }
}