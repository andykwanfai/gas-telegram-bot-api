import { HttpClient, HttpFetchOptions, HttpResponse, IHttpResponse } from './HttpClient';

export class GasHttpResponse extends HttpResponse {
  private _source: IHttpResponse;
  constructor(i: IHttpResponse) {
    super();
    this._source = i;
  }

  // gas response function
  getAllHeaders() {
    return this._source.getAllHeaders();
  }
  getAs(contentType: string) {
    return this._source.getAs(contentType);
  }
  getBlob() {
    return this._source.getBlob();
  }
  getContent() {
    return this._source.getContent();
  }
  getContentText() {
    return this._source.getContentText();
  }
  getHeaders() {
    return this._source.getHeaders();
  }
  getResponseCode() {
    return this._source.getResponseCode();
  }
}

function querystring(obj: object) {
  return Object.entries(obj).map(([key, value]) => {
    return `${key}=${value}`;
  }).join('&');
}

export function appendQuerystring(url: string, obj: object) {
  const question_mark_index = url.indexOf('?');
  const qs = querystring(obj);
  if (question_mark_index > 0) {
    return `${url}&${qs}`;
  }
  return `${url}?${qs}`;
}

export class GasHttpClient extends HttpClient {
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
    return new GasHttpResponse(res);
  }
}