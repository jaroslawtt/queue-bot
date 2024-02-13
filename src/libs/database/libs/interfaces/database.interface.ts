import { type Knex } from 'knex';
import { ValueOf } from '~/libs/types/value-of.type.js';
import { AppEnvironment } from '~/libs/config/libs/enums/enums.js';


interface IDatabase {
  connect: () => void;
  environmentsConfig: Record<ValueOf<typeof AppEnvironment>, Knex.Config>;
}

export { type IDatabase };
