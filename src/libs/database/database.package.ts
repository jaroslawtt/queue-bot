import Knex, { type Knex as TKnex } from 'knex';
import { knexSnakeCaseMappers, Model } from 'objection';

import { DatabaseTableName } from './libs/enums/enums.js';
import { type IDatabase } from './libs/interfaces/interfaces.js';
import { IConfig } from '../config/libs/interfaces/config.interface.js';
import { ILogger } from '../logger/libs/interfaces/logger.interface.js';
import { AppEnvironment } from '../config/libs/enums/enums.js';

class Database implements IDatabase {
  private appConfig: IConfig;
  private logger: ILogger;

  public constructor(config: IConfig, logger: ILogger) {
    this.appConfig = config;
    this.logger = logger;
  }

  public connect(): ReturnType<IDatabase['connect']> {
    this.logger.info('Establish DB connection...');

    Model.knex(Knex(this.environmentConfig));

    this.logger.info('DB is successfully connected');
  }

  public get environmentsConfig(): IDatabase['environmentsConfig'] {
    return {
      [AppEnvironment.DEVELOPMENT]: this.initialConfig,
      [AppEnvironment.PRODUCTION]: this.initialConfig,
    };
  }

  private get initialConfig(): TKnex.Config {
    return {
      client: this.appConfig.ENV.DB.DIALECT,
      connection: this.appConfig.ENV.DB.CONNECTION_STRING,
      pool: {
        min: this.appConfig.ENV.DB.POOL_MIN,
        max: this.appConfig.ENV.DB.POOL_MAX,
      },
      migrations: {
        directory: 'src/db/migrations',
        tableName: DatabaseTableName.MIGRATIONS,
      },
      debug: false,
      ...knexSnakeCaseMappers({ underscoreBetweenUppercaseLetters: true }),
    };
  }

  private get environmentConfig(): TKnex.Config {
    return this.environmentsConfig[this.appConfig.ENV.APP.ENVIRONMENT];
  }
}

export { Database };
export { DatabaseTableName } from './libs/enums/enums.js';
export { type IDatabase } from './libs/interfaces/interfaces.js';
