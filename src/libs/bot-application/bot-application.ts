import { BotApplication } from './bot-application.package.js';
import { appHandlerManager } from '~/packages/app/app.js';
import { database } from '~/libs/database/database.js';
import { config } from '~/libs/config/config.js';
import { logger } from '~/libs/logger/logger.js';

const handlers = appHandlerManager.handlers;

const bot = new BotApplication({ config, logger, database, handlers });

export { bot };
