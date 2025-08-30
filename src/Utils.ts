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

  static sleepRandom(minSec: number, maxSec: number) {
    const randomSec = Utils.randomNumber(minSec, maxSec);
    Utils.sleep(randomSec);
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

  static shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i] as any, result[j] as any] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * @description return integer between min and max inclusively
   * @param min 
   * @param max 
   */
  static randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}