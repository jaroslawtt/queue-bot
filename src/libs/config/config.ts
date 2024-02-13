import { Config } from './config.package.js';
import { logger } from '../logger/logger.js';

const config = new Config(logger);

export { config };
export { type IConfig } from './libs/interfaces/interfaces.js';
