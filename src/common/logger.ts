class _Logger {
  info(message: string, data?: any) {
    console.log(`${message}: \n${data}`);
  }
}

export const logger = new _Logger();
