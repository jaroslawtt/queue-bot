import TelegramBot from 'node-telegram-bot-api';
import { HandlerManager } from '~/libs/handler-manager/handler-manager.js';
import { type BotHandler } from '~/libs/types/bot-handler.type.js';
import {
  AppCallbackQueryActionType,
  AppCommand,
} from '~/packages/app/libs/enums/enums.js';
import { AppAnswerTemplateEnum } from '~/packages/app/libs/enums/app-answer-template.enum.js';
import { MAX_QUEUE_PARTICIPATES_NUMBER } from '~/packages/queues/queues.js';
import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';
import { AppService } from '~/packages/app/app.service.js';
import { type AppCallbackQueryPattern } from '~/packages/app/libs/types/app-callback-query-pattern.type.js';
import { type AppCallbackQueryAction } from '~/packages/app/libs/types/app-callback-query-action.type.js';
import { type QueueItem } from '~/packages/queues/libs/types/queue-item.type.js';
import { type UserItem } from '~/packages/users/libs/types/user-item.type.js';

class AppHandlerManager extends HandlerManager {
  private readonly appService: AppService;

  public constructor(appService: AppService) {
    super();

    this.appService = appService;

    this.addHandler(this.handleAppStart);

    this.addHandler(this.handleCreatingQueue);

    this.addHandler(this.handleCallbackQuery);
  }

  private handleAppStart: BotHandler = async (bot) => {
    bot.onText(AppCommand.START, async (msg) => {
      await bot.sendMessage(msg.chat.id, 'Hello, world!');
    });
  };

  private handleCreatingQueue: BotHandler = async (bot) => {
    bot.onText(AppCommand.CREATE, async (msg) => {
      const botSendNameRequestMessage = await bot.sendMessage(
        msg.chat.id,
        AppAnswerTemplateEnum.REQUEST_QUEUE_NAME,
        {
          reply_to_message_id: msg.message_id,
          reply_markup: {
            force_reply: true,
          },
        },
      );

      const nameRequestReplyHandlerId = bot.onReplyToMessage(
        botSendNameRequestMessage.chat.id,
        botSendNameRequestMessage.message_id,
        async (nameReplyMessage) => {
          const queueName = nameReplyMessage.text;
          if (!(nameReplyMessage.from?.id === msg.from?.id)) return;
          if (!queueName) return;
          bot.removeReplyListener(nameRequestReplyHandlerId);

          const numberOfParticipantsRequestMessage = await bot.sendMessage(
            msg.chat.id,
            AppAnswerTemplateEnum.REQUEST_STUDENT_NUMBER,
            {
              reply_markup: {
                force_reply: true,
              },
            },
          );

          const numberOfParticipantsReplyHandlerId = bot.onReplyToMessage(
            numberOfParticipantsRequestMessage.chat.id,
            numberOfParticipantsRequestMessage.message_id,
            async (numberOfParticipantsReplyMessage) => {
              if (!(numberOfParticipantsReplyMessage.from?.id === msg.from?.id))
                return;
              if (!numberOfParticipantsReplyMessage.text) return;
              if (!numberOfParticipantsReplyMessage.from) return;

              const telegramUser = msg.from as TelegramBot.User;
              const telegramTag = telegramUser.username;
              const telegramUsername =
                telegramUser.first_name + ' ' + telegramUser.last_name ?? '';
              const numberOfParticipants = parseInt(
                numberOfParticipantsReplyMessage.text,
              );

              if (Number.isNaN(numberOfParticipants)) {
                const botAlertMessageId = await bot.sendMessage(
                  msg.chat.id,
                  AppAnswerTemplateEnum.NOT_A_NUMBER,
                  {
                    reply_to_message_id:
                      numberOfParticipantsReplyMessage.message_id,
                  },
                );

                return setTimeout(
                  async () =>
                    Promise.allSettled([
                      bot.deleteMessage(
                        msg.chat.id,
                        botAlertMessageId.message_id,
                      ),
                      bot.deleteMessage(
                        msg.chat.id,
                        numberOfParticipantsReplyMessage.message_id,
                      ),
                    ]),
                  5000,
                );
              }

              if (numberOfParticipants <= 0)
                return await bot.sendMessage(
                  msg.chat.id,
                  AppAnswerTemplateEnum.NEGATIVE_VALUE,
                  {
                    reply_to_message_id:
                      numberOfParticipantsReplyMessage.message_id,
                  },
                );

              if (numberOfParticipants > MAX_QUEUE_PARTICIPATES_NUMBER)
                return await bot.sendMessage(
                  msg.chat.id,
                  AppAnswerTemplateEnum.NUMBER_IS_HIGHER_THAN_MAX,
                  {
                    reply_to_message_id:
                      numberOfParticipantsReplyMessage.message_id,
                  },
                );
              bot.removeReplyListener(numberOfParticipantsReplyHandlerId);

              await Promise.allSettled([
                bot.deleteMessage(msg.chat.id, msg.message_id),
                bot.deleteMessage(
                  msg.chat.id,
                  botSendNameRequestMessage.message_id,
                ),
                bot.deleteMessage(msg.chat.id, nameReplyMessage.message_id),
                bot.deleteMessage(
                  msg.chat.id,
                  numberOfParticipantsRequestMessage.message_id,
                ),
                bot.deleteMessage(
                  msg.chat.id,
                  numberOfParticipantsReplyMessage.message_id,
                ),
              ]);

              const queue = await this.appService.createQueue({
                name: queueName,
                turns: numberOfParticipants as QueueParticipatesRange,
                chatId: msg.chat.id,
                creatorId: telegramUser.id,
                creatorUsername: telegramUsername,
                creatorTag: telegramTag ?? null,
              });
              const creator = (await this.appService.findUser(
                queue.creatorId,
              )) as UserItem;

              const { template, inlineKeyboard } =
                this.appService.generateQueueListData({
                  queue,
                  creator,
                });

              return await bot.sendMessage(msg.chat.id, template, {
                reply_markup: {
                  inline_keyboard: inlineKeyboard,
                },
                parse_mode: 'HTML',
              });
            },
          );
        },
      );
    });
  };

  private handleCallbackQuery: BotHandler = async (bot) => {
    bot.on('callback_query', async (msg) => {
      if (!msg.from || !msg.data) return;

      const callbackQuery = msg.data as AppCallbackQueryPattern;
      const action: AppCallbackQueryAction = callbackQuery.split('/')[0];
      const messageId = msg.message?.message_id;
      const chatId = msg.message?.chat.id;
      const userId = msg.from.id;
      const telegramTag = msg.from.username ?? null;
      const telegramUsername = `${msg.from.first_name}${msg.from.last_name ? ' ' + msg.from.last_name : ''}`;

      await this.appService.upsertUser({
        telegramId: userId,
        telegramTag,
        telegramUsername,
      });

      if (!messageId || !chatId) return;

      switch (action) {
        case AppCallbackQueryActionType.TURN: {
          const turn = +callbackQuery.split('/')[1];
          const queueId = +callbackQuery.split('/')[2];

          await this.appService.enqueueUser({
            turn: turn as QueueParticipatesRange,
            userId,
            queueId,
          });

          const queue = (await this.appService.findQueue(queueId)) as QueueItem;
          const creator = (await this.appService.findUser(
            queue.creatorId,
          )) as UserItem;
          const usersWithTurns =
            await this.appService.findQueueParticipants(queueId);

          const { template, inlineKeyboard } =
            this.appService.generateQueueListData({
              queue,
              users: usersWithTurns,
              creator,
            });

          await bot.editMessageText(template, {
            message_id: messageId,
            chat_id: chatId,
            reply_markup: {
              inline_keyboard: inlineKeyboard,
            },
            parse_mode: 'HTML',
          });

          break;
        }

        case AppCallbackQueryActionType.CANCEL: {
          const queueId = +callbackQuery.split('/')[2];
          const userId = msg.from.id;

          const queue = await this.appService.findQueue(queueId);

          if (!queue) return;

          await this.appService.dequeueUser({
            queueId,
            userId,
          });

          const creator = (await this.appService.findUser(
            queue.creatorId,
          )) as UserItem;

          const usersWithTurns =
            await this.appService.findQueueParticipants(queueId);

          const { template, inlineKeyboard } =
            this.appService.generateQueueListData({
              queue,
              users: usersWithTurns,
              creator,
            });

          await bot.editMessageText(template, {
            message_id: messageId,
            chat_id: chatId,
            reply_markup: {
              inline_keyboard: inlineKeyboard,
            },
            parse_mode: 'HTML',
          });

          break;
        }
      }
    });
  };
}

export { AppHandlerManager };
