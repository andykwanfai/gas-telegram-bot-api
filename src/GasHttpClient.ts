import { HttpClient, HttpFetchOptions, HttpResponse, IHttpResponse } from './HttpClient';

export class GasHttpResponse extends HttpResponse {
  constructor(i: IHttpResponse) {
    super();
    Object.assign(this, i);
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