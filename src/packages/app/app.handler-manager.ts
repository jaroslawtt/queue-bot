import TelegramBot, { ChatType } from 'node-telegram-bot-api';
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

    this.addHandler(this.handlePrivateChatManageNotifications);

    this.addHandler(this.handleCancelGettingNotification);

    this.addHandler(this.handleResumeGettingNotification);
  }

  private handleAppStart: BotHandler = async (bot) => {
    bot.onText(AppCommand.START, async (msg) => {
      const telegramUser = msg.from;
      if (!telegramUser) return;

      const telegramTag = telegramUser.username;
      const telegramUsername =
        telegramUser.first_name + ' ' + telegramUser.last_name ?? '';

      const user = await this.appService.findUser(telegramUser.id);

      if (!user)
        await this.appService.insertUser({
          telegramId: telegramUser.id,
          telegramUsername,
          telegramTag: telegramTag ?? null,
        });

      if (msg.chat.type === 'private') {
        await this.appService.allowUserGetNotifications(telegramUser.id);
      }
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
          const queueName = nameReplyMessage.text;
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
                chatType: queueMessage.chat.type,
                queueTitle: queue.name,
                username: `${creator.telegramTag ? '@' + creator.telegramTag : creator.telegramUsername}`,
                chatTitle: chat.title,
              });
            },
          );
        },
      );
    });
  };

  private handlePrivateChatManageNotifications: BotHandler = async (bot) => {
    bot.onText(AppCommand.MANAGE, async (msg) => {
      if (msg.chat.type !== 'private' || !msg.from) return;

      const telegramUser = msg.from;
      const telegramTag = telegramUser.username;
      const telegramUsername =
        telegramUser.first_name + ' ' + telegramUser.last_name ?? '';

      const user = await this.appService.upsertUser({
        telegramId: telegramUser.id,
        telegramTag: telegramTag ?? null,
        telegramUsername,
      });

      await bot.sendMessage(msg.chat.id, 'Hello, manage');
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

      const user = await this.appService.upsertUser({
        telegramId: userId,
        telegramTag,
        telegramUsername,
      });

      console.log(user);

      if (!messageId || !chatId) return;

      await this.appService.associateUserWithChat({
        userId,
        chatId,
      });

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

  private async sendNotificationUsers({
    bot,
    users,
    chatId,
    chatType,
    messageId,
    chatTitle,
    queueTitle,
    username,
  }: {
    bot: TelegramBot;
    chatId: number;
    users: UserItem[];
    messageId: number;
    chatType: ChatType;
    chatTitle: string | undefined;
    queueTitle: string;
    username: string;
  }) {
    for (const user of users) {
      try {
        const chatMember = await bot.getChatMember(chatId, user.telegramId);

        if (!chatMember) return;

        const messageLink = this.appService.generateMessageLink({
          chatId,
          messageId,
          chatType,
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
}

export { AppHandlerManager };
