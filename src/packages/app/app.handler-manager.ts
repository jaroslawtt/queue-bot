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
import { ApplicationError } from '~/libs/exceptions/exceptions.js';
import { ApplicationErrorCause } from '~/libs/exceptions/application-error/libs/enums/application-error-cause.enum.js';
import { MAX_NUMBER_CONTROLS_QUEUES } from '~/packages/app/libs/constants/constants.js';

class AppHandlerManager extends HandlerManager {
  private readonly appService: AppService;

  public constructor(appService: AppService) {
    super();

    this.appService = appService;

    this.addHandler(this.handleAppStart);

    this.addHandler(this.handleCreatingQueue);

    this.addHandler(this.handleCallbackQuery);

    this.addHandler(this.handleCancelGettingNotification);

    this.addHandler(this.handleResumeGettingNotification);

    this.addHandler(this.handleQueuesControlPanel);
  }

  private handleAppStart: BotHandler = async (bot) => {
    bot.onText(AppCommand.START, async (msg) => {
      const telegramUser = msg.from;
      if (!telegramUser) return;

      const telegramTag = telegramUser.username;
      const telegramUsername =
        telegramUser.first_name + ' ' + telegramUser.last_name ?? '';

      const user = await this.appService.findUser(telegramUser.id);

      if (!user) {
        await this.appService.insertUser({
          telegramId: telegramUser.id,
          telegramUsername,
          telegramTag: telegramTag ?? null,
        });
      }

      if (msg.chat.type === 'private') {
        await this.appService.allowUserGetNotifications(telegramUser.id);
        return await bot.sendMessage(
          msg.chat.id,
          AppAnswerTemplateEnum.PRIVATE_START,
        );
      }

      return await bot.sendMessage(
        msg.chat.id,
        AppAnswerTemplateEnum.CHAT_START,
      );
    });
  };

  private handleResumeGettingNotification: BotHandler = (bot) => {
    bot.onText(AppCommand.RESUME, async (msg) => {
      const telegramUser = msg.from;

      if (!telegramUser || msg.chat.type !== 'private') return;

      const telegramTag = telegramUser.username;
      const telegramUsername =
        telegramUser.first_name + ' ' + telegramUser.last_name ?? '';

      const user = await this.appService.upsertUser({
        telegramId: telegramUser.id,
        telegramUsername,
        telegramTag: telegramTag ?? null,
      });

      if (user.isAllowedNotification) {
        await bot.sendMessage(
          msg.chat.id,
          AppAnswerTemplateEnum.USER_ALREADY_GET_NOTIFICATIONS,
        );
      } else {
        await this.appService.allowUserGetNotifications(telegramUser.id);
        await bot.sendMessage(
          msg.chat.id,
          AppAnswerTemplateEnum.GETTING_NOTIFICATIONS_ALLOWED,
        );
      }
    });
  };

  private handleCancelGettingNotification: BotHandler = (bot) => {
    bot.onText(AppCommand.STOP, async (msg) => {
      const telegramUser = msg.from;

      if (!telegramUser || msg.chat.type !== 'private') return;

      const telegramTag = telegramUser.username;
      const telegramUsername =
        telegramUser.first_name + ' ' + telegramUser.last_name ?? '';

      const user = await this.appService.upsertUser({
        telegramId: telegramUser.id,
        telegramUsername,
        telegramTag: telegramTag ?? null,
      });

      if (!user.isAllowedNotification) {
        await bot.sendMessage(
          msg.chat.id,
          AppAnswerTemplateEnum.USER_DOES_NOT_GET_NOTIFICATIONS,
        );
      } else {
        await this.appService.forbidUserGetNotifications(telegramUser.id);
        await bot.sendMessage(
          msg.chat.id,
          AppAnswerTemplateEnum.GETTING_NOTIFICATIONS_CANCELED,
        );
      }
    });
  };

  private handleCreatingQueue: BotHandler = async (bot) => {
    bot.onText(AppCommand.CREATE, async (msg) => {
      if (msg.chat.type === 'private') return;

      const chatId = msg.chat.id;
      const botSendNameRequestMessage = await bot.sendMessage(
        chatId,
        AppAnswerTemplateEnum.REQUEST_QUEUE_NAME,
        {
          reply_to_message_id: msg.message_id,
          reply_markup: {
            force_reply: true,
          },
        },
      );

      const nameRequestReplyHandlerId = bot.onReplyToMessage(
        chatId,
        botSendNameRequestMessage.message_id,
        async (nameReplyMessage) => {
          const queueName = nameReplyMessage.text?.slice(0, 30);

          if (!(nameReplyMessage.from?.id === msg.from?.id)) return;
          if (!queueName) return;
          bot.removeReplyListener(nameRequestReplyHandlerId);

          const numberOfParticipantsRequestMessage = await bot.sendMessage(
            chatId,
            AppAnswerTemplateEnum.REQUEST_PARTICIPANTS_NUMBER,
            {
              reply_markup: {
                force_reply: true,
              },
            },
          );

          const numberOfParticipantsReplyHandlerId = bot.onReplyToMessage(
            chatId,
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
                  chatId,
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
                  chatId,
                  AppAnswerTemplateEnum.NEGATIVE_VALUE,
                  {
                    reply_to_message_id:
                      numberOfParticipantsReplyMessage.message_id,
                  },
                );

              if (numberOfParticipants > MAX_QUEUE_PARTICIPATES_NUMBER)
                return await bot.sendMessage(
                  chatId,
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

              const creator = await this.appService.upsertUser({
                telegramId: telegramUser.id,
                telegramUsername,
                telegramTag: telegramTag ?? null,
              });

              await this.appService.associateUserWithChat({
                userId: telegramUser.id,
                chatId: msg.chat.id,
              });

              const queue = await this.appService.createQueue({
                name: queueName,
                turns: numberOfParticipants as QueueParticipatesRange,
                chatId: msg.chat.id,
                creatorId: creator.telegramId,
              });

              const { template, inlineKeyboard } =
                this.appService.generateQueueListData({
                  queue,
                  creator,
                });

              const queueMessage = await bot.sendMessage(chatId, template, {
                reply_markup: {
                  inline_keyboard: inlineKeyboard,
                },
                parse_mode: 'HTML',
              });

              const chat = await bot.getChat(chatId);

              const usersOnChatWithAllowedNotifications =
                await this.appService.getUsersByChatId(chatId, true);

              await this.sendNotificationUsers({
                bot,
                users: usersOnChatWithAllowedNotifications.filter(
                  (userOnChatWithAllowedNotifications) =>
                    userOnChatWithAllowedNotifications.telegramId !==
                    creator.telegramId,
                ),
                chatId,
                messageId: queueMessage.message_id,
                queueTitle: queue.name,
                username: `${creator.telegramTag ? '@' + creator.telegramTag : creator.telegramUsername}`,
                chatTitle: chat.title,
              });

              await this.appService.updateQueueData({
                id: queue.id,
                name: queue.name,
                turns: queue.turns,
                chatId: queue.chatId,
                creatorId: queue.creatorId,
                messageId: queueMessage.message_id,
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

      await this.appService.associateUserWithChat({
        userId,
        chatId,
      });

      try {
        switch (action) {
          case AppCallbackQueryActionType.TURN: {
            const turn = +callbackQuery.split('/')[1];
            const queueId = +callbackQuery.split('/')[2];

            await this.appService.enqueueUser({
              turn: turn as QueueParticipatesRange,
              userId,
              queueId,
            });

            const queue = (await this.appService.findQueue(
              queueId,
            )) as QueueItem;
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

            await this.updateListMessages({ bot, queue });

            break;
          }

          case AppCallbackQueryActionType.CANCEL: {
            const queueId = +callbackQuery.split('/')[2];
            const userId = msg.from.id;

            await this.appService.dequeueUser({
              queueId,
              userId,
            });

            const queue = (await this.appService.findQueue(
              queueId,
            )) as QueueItem;

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

            await this.updateListMessages({ bot, queue });

            break;
          }

          case AppCallbackQueryActionType.PAGE: {
            const pageNumber = +callbackQuery.split('/')[1];
            const userControlsId = +callbackQuery.split('/')[2];

            if (userId !== userControlsId)
              return await bot.answerCallbackQuery(msg.id, {
                text: AppAnswerTemplateEnum.NO_PERMISSION_TO_MANIPULATE_WITH,
                show_alert: true,
              });

            const { items: chatQueues, meta } =
              await this.appService.findQueuesByChatId(chatId, {
                limit: MAX_NUMBER_CONTROLS_QUEUES,
                page: pageNumber,
              });

            const { template, inlineKeyboard } =
              this.appService.generateQueuesListControlPanelData({
                queues: chatQueues,
                meta,
                userId,
                pageNumber,
              });

            await bot.editMessageText(template, {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: inlineKeyboard,
              },
              chat_id: chatId,
              message_id: msg.message?.message_id,
            });
            break;
          }
          case AppCallbackQueryActionType.QUEUE: {
            const queueId = +callbackQuery.split('/')[1];
            const userControlsId = +callbackQuery.split('/')[2];
            const pageNumber = +callbackQuery.split('/')[3];

            if (userId !== userControlsId)
              return await bot.answerCallbackQuery(msg.id, {
                text: AppAnswerTemplateEnum.NO_PERMISSION_TO_MANIPULATE_WITH,
                show_alert: true,
              });

            const queue = await this.appService.findQueue(queueId);

            if (!queue) {
              await bot.answerCallbackQuery(msg.id, {
                text: AppAnswerTemplateEnum.QUEUE_NOT_EXIST,
                show_alert: true,
              });

              const { items: chatQueues, meta } =
                await this.appService.findQueuesByChatId(chatId, {
                  limit: MAX_NUMBER_CONTROLS_QUEUES,
                  page: 1,
                });

              const { template, inlineKeyboard } =
                this.appService.generateQueuesListControlPanelData({
                  queues: chatQueues,
                  meta,
                  userId,
                  pageNumber: meta.currentPage,
                });

              return await bot.editMessageText(template, {
                reply_markup: {
                  inline_keyboard: inlineKeyboard,
                },
                chat_id: chatId,
                message_id: messageId,
              });
            }

            const creator = (await this.appService.findUser(
              queue.creatorId,
            )) as UserItem;

            const { template, inlineKeyboard } =
              this.appService.generateQueueDetailsControlsData({
                userId,
                queue,
                creator,
                pageNumber,
              });

            await bot.editMessageText(template, {
              reply_markup: {
                inline_keyboard: inlineKeyboard,
              },
              chat_id: chatId,
              message_id: msg.message?.message_id,
              parse_mode: 'HTML',
            });

            break;
          }
          case AppCallbackQueryActionType.BACK: {
            const pageNumber = +callbackQuery.split('/')[1];
            const userControlsId = +callbackQuery.split('/')[2];

            if (userId !== userControlsId)
              return await bot.answerCallbackQuery(msg.id, {
                text: AppAnswerTemplateEnum.NO_PERMISSION_TO_MANIPULATE_WITH,
                show_alert: true,
              });

            const { items: chatQueues, meta } =
              await this.appService.findQueuesByChatId(chatId, {
                page: pageNumber,
                limit: MAX_NUMBER_CONTROLS_QUEUES,
              });

            const { template, inlineKeyboard } =
              this.appService.generateQueuesListControlPanelData({
                userId,
                meta,
                queues: chatQueues,
                pageNumber,
              });

            await bot.editMessageText(template, {
              reply_markup: {
                inline_keyboard: inlineKeyboard,
              },
              chat_id: chatId,
              message_id: msg.message?.message_id,
              parse_mode: 'HTML',
            });

            break;
          }
          case AppCallbackQueryActionType.DELETE: {
            const queueId = +callbackQuery.split('/')[1];
            const userControlsId = +callbackQuery.split('/')[2];

            if (userId !== userControlsId)
              return await bot.answerCallbackQuery(msg.id, {
                text: AppAnswerTemplateEnum.NO_PERMISSION_TO_MANIPULATE_WITH,
                show_alert: true,
              });

            const queue = await this.appService.findQueue(queueId);

            if (!queue) {
              await bot.answerCallbackQuery(msg.id, {
                text: AppAnswerTemplateEnum.QUEUE_NOT_EXIST,
                show_alert: true,
              });
              return await bot.deleteMessage(chatId, messageId);
            }

            const isUserCreator = userId === queue.creatorId;

            if (!isUserCreator) {
              const telegramUser = await bot.getChatMember(chatId, userId);

              if (telegramUser.status !== 'administrator') {
                return await bot.answerCallbackQuery(msg.id, {
                  text: AppAnswerTemplateEnum.NO_RIGHTS,
                  show_alert: true,
                });
              }
            }

            await this.appService.deleteQueue(queueId);

            await Promise.allSettled([
              bot.deleteMessage(chatId, messageId),
              bot.deleteMessage(chatId, Number(queue.messageId)),
            ]);

            break;
          }
          case AppCallbackQueryActionType.LIST: {
            const queueId = +callbackQuery.split('/')[1];
            const userControlsId = +callbackQuery.split('/')[2];

            if (userId !== userControlsId)
              return await bot.answerCallbackQuery(msg.id, {
                text: AppAnswerTemplateEnum.NO_PERMISSION_TO_MANIPULATE_WITH,
                show_alert: true,
              });

            const queue = await this.appService.findQueue(queueId);

            if (!queue) {
              await bot.answerCallbackQuery(msg.id, {
                text: AppAnswerTemplateEnum.QUEUE_NOT_EXIST,
                show_alert: true,
              });
              return await bot.deleteMessage(chatId, messageId);
            }

            const creator = (await this.appService.findUser(
              userId,
            )) as UserItem;

            const queueParticipants =
              await this.appService.findQueueParticipants(queueId);

            const template = this.appService.generateQueueListTemplate({
              queue,
              participants: queueParticipants,
              creator,
            });

            const listMessage = await bot.sendMessage(chatId, template, {
              parse_mode: 'HTML',
            });

            await this.appService.assignMessageWithQueue({
              id: listMessage.message_id,
              queueId: queue.id,
            });

            await bot.deleteMessage(chatId, messageId);

            break;
          }
        }
      } catch (err) {
        if (err instanceof ApplicationError) {
          try {
            switch (err.cause) {
              case ApplicationErrorCause.QUEUE_NOT_EXIST: {
                await bot.answerCallbackQuery(msg.id, {
                  text: err.message,
                  show_alert: true,
                });
                await bot.deleteMessage(chatId, messageId);
                break;
              }
              default: {
                await bot.answerCallbackQuery(msg.id, {
                  text: err.message,
                  show_alert: true,
                });
                break;
              }
            }
          } catch {
            console.error(err);
          }
        } else console.error(err);
      }
    });
  };

  private handleQueuesControlPanel: BotHandler = async (bot) => {
    bot.onText(AppCommand.QUEUES, async (msg) => {
      if (!msg.from) return;
      if (msg.chat.type === 'private') return;

      const telegramUser = msg.from;
      const telegramTag = telegramUser.username;
      const telegramUsername =
        telegramUser.first_name + ' ' + telegramUser.last_name ?? '';
      const chatId = msg.chat.id;
      const pageNumber = 1;

      await this.appService.upsertUser({
        telegramId: telegramUser.id,
        telegramTag: telegramTag ?? null,
        telegramUsername,
      });

      const { items: chatQueues, meta } =
        await this.appService.findQueuesByChatId(chatId, {
          limit: MAX_NUMBER_CONTROLS_QUEUES,
          page: pageNumber,
        });

      const { template, inlineKeyboard } =
        this.appService.generateQueuesListControlPanelData({
          queues: chatQueues,
          meta,
          userId: telegramUser.id,
          pageNumber,
        });

      await bot.sendMessage(chatId, template, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      });

      await bot.deleteMessage(chatId, msg.message_id);
    });
  };

  private async sendNotificationUsers({
    bot,
    users,
    chatId,
    messageId,
    chatTitle,
    queueTitle,
    username,
  }: {
    bot: TelegramBot;
    chatId: number;
    users: UserItem[];
    messageId: number;
    chatTitle: string | undefined;
    queueTitle: string;
    username: string;
  }) {
    for (const user of users) {
      try {
        const chatMember = await bot.getChatMember(chatId, user.telegramId);

        if (!chatMember) return;
        if (chatMember.status === 'left' || chatMember.status === 'kicked')
          return await this.appService.dissociateUserWithChat({
            userId: user.telegramId,
            chatId,
          });

        const messageLink = this.appService.generateMessageLink({
          chatId,
          messageId,
        });

        await bot.sendMessage(
          user.telegramId,
          this.appService.generateNotificationMessage({
            messageLink,
            queueTitle,
            chatTitle,
            username,
          }),
          {
            parse_mode: 'HTML',
          },
        );
      } catch {
        await this.appService.dissociateUserWithChat({
          userId: user.telegramId,
          chatId,
        });
      }
    }
    return;
  }

  private async updateListMessages({
    bot,
    queue,
  }: {
    bot: TelegramBot;
    queue: QueueItem;
  }) {
    const creator = (await this.appService.findUser(
      queue.creatorId,
    )) as UserItem;
    const participants = await this.appService.findQueueParticipants(queue.id);
    const messages = await this.appService.findQueueMessages(queue.id);

    for (const message of messages) {
      const template = this.appService.generateQueueListTemplate({
        queue,
        creator,
        participants,
      });

      await bot.editMessageText(template, {
        message_id: message.id,
        chat_id: queue.chatId,
      });
    }
  }
}

export { AppHandlerManager };
