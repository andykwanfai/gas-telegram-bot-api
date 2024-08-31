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
    return date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).replace(/\//g, '-') + ' JST';
  }
}