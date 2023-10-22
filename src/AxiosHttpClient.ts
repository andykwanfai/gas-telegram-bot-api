import { HttpBlob, HttpClient, HttpFetchOptions, HttpResponse } from './HttpClient';
import axios, { AxiosHeaders, AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios';
import FormData from 'form-data';

export interface AxiosHttpFetchOptions extends HttpFetchOptions {
  responseType?: ResponseType;
}

export class AxiosHttpResponse extends HttpResponse implements HttpBlob {
  private response;
  constructor(i: AxiosResponse) {
    super();
    this.response = i;
  }

  getAllHeaders(): object {
    return this.response.headers;
  }

  getAs(contentType: string): any {
    throw new Error("this function is not implemented");
  }

  getBlob(): HttpBlob {
    return this.response.data.slice(0);
  }

  getContent(): number[] {
    return Array.from(new Uint8Array(this.response.data));
  }

  getContentText(): string;
  getContentText(charset: string): string
  getContentText(charset?: any): string {
    return Buffer.from(this.response.data, charset ?? 'utf-8').toString();
  }

  getHeaders(): object {
    return this.getAllHeaders();
  }

  getResponseCode(): number {
    return this.response.status;
  }

  copyBlob(): AxiosHttpResponse {
    return new AxiosHttpResponse(this.response);
  }

  getBytes(): number[] {
    throw new Error();
  }
  getContentType(): string {
    throw new Error();
  }
  getDataAsString(): string;
  getDataAsString(charset: string): string;
  getDataAsString(charset?: unknown): string {
    throw new Error();
  }
  getName(): string {
    throw new Error();
  }
  isGoogleType(): boolean {
    throw new Error();
  }
  setBytes(data: number[]): AxiosHttpResponse {
    throw new Error();
  }
  setContentType(contentType: string): AxiosHttpResponse {
    throw new Error();
  }
  setContentTypeFromExtension(): AxiosHttpResponse {
    throw new Error();
  }
  setDataFromString(string: string): AxiosHttpResponse;
  setDataFromString(string: string, charset: string): AxiosHttpResponse;
  setDataFromString(string: unknown, charset?: unknown): AxiosHttpResponse {
    throw new Error();
  }
  setName(name: string): AxiosHttpResponse {
    throw new Error();
  }
  getAllBlobs(): AxiosHttpResponse[] {
    throw new Error();
  }
}

export class AxiosHttpClient extends HttpClient {

  async fetch(url: string, options: AxiosHttpFetchOptions) {
    this.logger.debug(url);
    this.logger.debug(options);
    const axios_config = AxiosHttpClient.transformHttpFetchOptions(url, options);
    const res = await axios(axios_config);
    return new AxiosHttpResponse(res);
  }

  private static transformHttpFetchOptions(url: string, options: AxiosHttpFetchOptions) {
    const axios_config: AxiosRequestConfig<any> = {
      url,
      params: options.params,
      method: options.method,
      responseType: options.responseType ?? 'arraybuffer',
    }
    const payload = options.payload;
    if (payload) {
      const form_data = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value) {
          let options;
          if (value instanceof Buffer) {
            options = { filename: "video.mp4" };
          }
          form_data.append(key, value, options);
        }
      });
      axios_config.data = form_data;
    }
    if (options.headers || options.contentType) {
      const headers = new AxiosHeaders(options.headers);
      if (options.contentType) {
        headers.setContentType(options.contentType);
      }
      axios_config.headers = headers;
    }
    if (options.followRedirects) {
      axios_config.maxRedirects = 0;
    }
    if (options.muteHttpExceptions) {
      axios_config.validateStatus = (status) => status < 9999;
    }
    return axios_config;
  }
}