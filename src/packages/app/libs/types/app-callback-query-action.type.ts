import { ValueOf } from '~/libs/types/value-of.type';
import { AppCallbackQueryActionType } from '~/packages/app/libs/enums/enums.js';

type AppCallbackQueryAction = ValueOf<typeof AppCallbackQueryActionType>;

export { type AppCallbackQueryAction };
