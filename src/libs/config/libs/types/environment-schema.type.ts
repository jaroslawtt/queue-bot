import { type ValueOf } from '~/libs/types/value-of.type.js';
import { AppEnvironment } from '~/libs/config/libs/enums/enums.js';


type EnvironmentSchema = {
  APP: {
    TELEGRAM_TOKEN: string;
    ENVIRONMENT: ValueOf<typeof AppEnvironment>;
  };
  DB: {
    CONNECTION_STRING: string;
    DIALECT: string;
    POOL_MIN: number;
    POOL_MAX: number;
  };
};

export { type EnvironmentSchema };
