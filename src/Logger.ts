
export class Logger {
  constructor(i?: { debug: boolean }) {
    if (i?.debug) {
      this.debug = this.info;
    }
  }

  debug(data: any) {
  }

  info(data: any) {
    console.log(data);
  }
}
