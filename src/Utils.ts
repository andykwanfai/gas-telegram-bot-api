export class Utils {
  static parseJson(s: string): null | object {
    try {
      return JSON.parse(s);
    } catch (error) {
      return null;
    }
  }

  static sleep(sec: number) {
    if (typeof Utilities !== 'undefined') {
      Utilities.sleep(sec * 1000);
    } else {
      const start = new Date().getTime();
      while (new Date().getTime() - start < sec * 1000);
    }
  }

  static now() {
    return new Date().getTime();
  }

  static getJSTDateString(date: Date) {
    return date.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-') + ' JST';
  }

  static decodeEntities(encodedString: string) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate: any = {
      "nbsp": " ",
      "amp": "&",
      "quot": "\"",
      "lt": "<",
      "gt": ">"
    };
    return encodedString.replace(translate_re, function (match, entity) {
      return translate[entity];
    }).replace(/&#(\d+);/gi, function (match, numStr) {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
    });
  }
}