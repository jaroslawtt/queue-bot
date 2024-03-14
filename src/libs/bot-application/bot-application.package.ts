import TelegramBot from 'node-telegram-bot-api';
import { IConfig } from '~/libs/config/libs/interfaces/config.interface.js';
import { ILogger } from '~/libs/logger/libs/interfaces/logger.interface.js';
import { IDatabase } from '~/libs/database/libs/interfaces/database.interface.js';
import { IBotApplication } from '~/libs/bot-application/libs/interfaces/bot-application.interface.js';
import { type BotHandler } from '~/libs/types/bot-handler.type.js';
import { ApplicationError } from '~/libs/exceptions/exceptions';
type Constructor = {
  config: IConfig;
  handlers: BotHandler[];
  logger: ILogger;
  database: IDatabase;
};

class BotApplication implements IBotApplication {
  private readonly logger: ILogger;
  private readonly database: IDatabase;
  private readonly config: IConfig;
  private readonly bot: TelegramBot;
  private readonly handlers: BotHandler[];
  constructor({ config, handlers, logger, database }: Constructor) {
    this.logger = logger;

    this.handlers = handlers;

    this.database = database;

    this.config = config;

    this.bot = new TelegramBot(this.config.ENV.APP.TELEGRAM_TOKEN, {
      polling: {
        autoStart: false,
      },
    });
  }

  private registerHandler(handler: BotHandler) {
    handler(this.bot);
  }

  private registerHandlers(handlers: BotHandler[]) {
    for (const handler of handlers) {
      this.registerHandler(handler);
    }
  }

  async init(): Promise<void> {
    this.logger.info('Application initialization…');
    this.database.connect();

    await this.bot
      .startPolling()
      .then(() => this.logger.info('Bot has been successfully started...'))
      .catch((error: Error) => {
        this.logger.error(error.message, {
          cause: error.cause,
          stack: error.stack,
        });
      });

    return void this.registerHandlers(this.handlers);
  }
}

export { BotApplication };
