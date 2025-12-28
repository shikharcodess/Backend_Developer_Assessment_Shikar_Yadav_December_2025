class _Logger {
  info(message: string, data?: any) {
    console.log(`INFO: ${message}`);
    if (data) {
      console.log(data);
    }
  }
  error(message: string, data?: any) {
    console.error(message, data);
  }
  warning(message: string, data?: any) {
    console.log(`WARN: ${message}`);
    if (data) {
      console.log(data);
    }
  }
}

export const logger = new _Logger();
