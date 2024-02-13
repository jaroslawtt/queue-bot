import { type BotHandler } from '~/libs/types/bot-handler.type.js';

interface IHandlerManager {
  handlers: BotHandler[];
  addHandler: (handler: BotHandler) => void;
}

export { IHandlerManager };