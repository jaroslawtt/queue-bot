import { type AppCallbackQueryAction } from '~/packages/app/libs/types/app-callback-query-action.type.js';

type AppCallbackQueryPattern = `${AppCallbackQueryAction}/${number | ''}/${
  | number
  | ''}/${number | ''}`;

export { AppCallbackQueryPattern };
