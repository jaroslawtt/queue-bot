import { HandlerManager } from '~/libs/handler-manager/handler-manager.js';
import { type BotHandler } from '~/libs/types/bot-handler.type.js';
import { AppCommand } from '~/packages/app/libs/enums/enums.js';

class AppHandlerManager extends HandlerManager {
  public constructor() {
    super();

    this.addHandler(this.handleAppStart);
  }

  private handleAppStart: BotHandler = async (bot) => {
    bot.onText(AppCommand.START, async msg => {
      await bot.sendMessage(msg.chat.id, 'Hello, world!');
    });
  };
}

export { AppHandlerManager };