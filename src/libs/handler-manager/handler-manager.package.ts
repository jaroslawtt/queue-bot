import { IHandlerManager } from '~/libs/handler-manager/libs/interfaces/handler-manager.interface.js';
import { type BotHandler } from '~/libs/types/bot-handler.type.js';

class HandlerManager implements IHandlerManager {
  public handlers: BotHandler[];

  public constructor() {
    this.handlers = [];
  }

  public addHandler(handler: BotHandler) {
    this.handlers.push(handler);
  }
}

export { HandlerManager };
