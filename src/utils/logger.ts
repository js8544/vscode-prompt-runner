import * as winston from 'winston';
import * as path from 'path';
import * as vscode from 'vscode';
import Transport from 'winston-transport';

class OutputChannelTransport extends Transport {
  private outputChannel: vscode.OutputChannel;

  constructor(opts: Transport.TransportStreamOptions) {
    super(opts);
    this.outputChannel = vscode.window.createOutputChannel('Prompt Runner');
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const message = `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
    this.outputChannel.appendLine(message);

    callback();
  }

  show() {
    this.outputChannel.show();
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
  ),
  transports: [
    new OutputChannelTransport({
      level: 'info'
    })
  ]
});

export default logger;
