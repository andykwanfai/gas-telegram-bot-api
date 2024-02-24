import moment from "moment-timezone";
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
    if (typeof Utilities !== 'undefined') {
      return Utilities.formatDate(date, 'Asia/Tokyo', "yyyy-MM-dd HH:mm:ss z");
    }
    const formattedDate = moment(date).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss z')
    return formattedDate;
  }
}