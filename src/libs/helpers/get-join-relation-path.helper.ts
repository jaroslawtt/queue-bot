import { type ValueOf } from '~/libs/types/types.js';

import { type Abstract as AbstractModel } from '../database/abstract.model.js';
import { DatabaseTableName } from '~/libs/database/database.js';

const getJoinRelationPath = <T extends AbstractModel>(
  databaseTableName: ValueOf<typeof DatabaseTableName>,
  relationKey: keyof T,
): string => {
  return `${databaseTableName}.${relationKey.toString()}`;
};

export { getJoinRelationPath };
