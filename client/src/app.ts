import TelegramBot from "node-telegram-bot-api";
import InlineKeyboardButton = TelegramBot.InlineKeyboardButton;

import { QUEUE_LIMIT, START_PAGE } from "./constants";

import { config } from "dotenv";

import AnswerTemplates, {
  AlertTemplates,
  getQueueProfileInfo,
  getQueueStatsList,
  getQueueTurnsList,
} from "./answer-templates/templates";
import {
  IQueue,
  CallbackQueryType,
  AxiosCustomException,
  CallbackQueryTypeList,
} from "./types";
import {
  getPaginationControls,
  getQueueControlsInlineKeyboard,
  getQueuesInlineKeyboard,
  getQueueTurnsListControls,
  getTurnsInlineKeyboard,
} from "./inline_keyboard";
import {
  createQueue,
  dequeueUser,
  enqueueUser,
  fetchQueue,
  fetchQueues,
  removeQueue,
} from "./api";

config({ path: `./.env` });

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});

bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id, AnswerTemplates.Greetings, {
    parse_mode: `HTML`,
    disable_notification: true,
  });
});

// handling queue data
bot.onText(/\/create/, async (msg) => {
  const message = await bot.sendMessage(
    msg.chat.id,
    `Send a name for your queue`,
    {
      reply_to_message_id: msg.message_id,
      reply_markup: {
        force_reply: true,
        selective: true,
      },
    },
  );

  const nameHandlerId = bot.onReplyToMessage(
    message.chat.id,
    message.message_id,
    async function nameHandler(nameMsg) {
      bot.removeReplyListener(nameHandlerId);
      if (nameMsg.text && nameMsg.from?.id === msg.from?.id) {
        const name = nameMsg.text;
        const message = await bot.sendMessage(
          nameMsg.chat.id,
          `Send number of students`,
          {
            reply_to_message_id: nameMsg.message_id,
            reply_markup: {
              force_reply: true,
              selective: true,
            },
          },
        );
        const numberHandlerId = bot.onReplyToMessage(
          message.chat.id,
          message.message_id,
          async function numberHandler(numMsg) {
            const numberOfStudents: number = parseInt(numMsg.text as string);
            if (Number.isNaN(numberOfStudents))
              await bot.sendMessage(numMsg.chat.id, AnswerTemplates.NotANumber);
            else if (numberOfStudents <= 0)
              await bot.sendMessage(
                numMsg.chat.id,
                AnswerTemplates.NegativeOrZero,
              );
            else if (
              numMsg.text &&
              numMsg.from &&
              numMsg.from?.id === nameMsg.from?.id
            ) {
              const numberOfStudents = parseInt(numMsg.text);
              const username: string =
                numMsg.from.first_name || numMsg.from.username || ``;
              try {
                const newQueue: IQueue = await createQueue({
                  queueForm: {
                    name,
                    numberOfStudents,
                  },
                  username,
                  chat_id: numMsg.chat.id,
                  user_id: numMsg.from.id,
                });
                bot.removeReplyListener(numberHandlerId);
                const inlineKeyboard: Array<Array<InlineKeyboardButton>> =
                  getTurnsInlineKeyboard(newQueue);
                await bot.sendMessage(
                  numMsg.chat.id,
                  `${getQueueTurnsList(newQueue)}`,
                  {
                    reply_markup: {
                      inline_keyboard: inlineKeyboard,
                      resize_keyboard: true,
                    },
                  },
                );
              } catch (e: unknown) {
                const { status } = (e as AxiosCustomException)?.response || 400;
                const { message: text } = (e as AxiosCustomException)?.response
                  ?.data;
                if (status === 403) {
                  await bot.sendMessage(numMsg.chat.id, text);
                } else {
                  await bot.sendMessage(
                    numMsg.chat.id,
                    AlertTemplates.DefaultAlert,
                  );
                }
              }
            }
          },
        );
      }
    },
  );
});

//call this to see all available queues
bot.onText(/\/queues/, async (msg) => {
  const chat_id = msg.chat.id;
  try {
    const queues = await fetchQueues({ chat_id, limit: QUEUE_LIMIT });
    await bot.sendMessage(chat_id, getQueueStatsList(queues), {
      reply_markup: {
        inline_keyboard: getQueuesInlineKeyboard(
          queues,
          `control`,
          START_PAGE,
        ).concat(getPaginationControls(queues.length, QUEUE_LIMIT, START_PAGE)),
      },
    });
    await bot.deleteMessage(chat_id, msg.message_id);
  } catch (e: unknown) {
    await bot.sendMessage(msg.chat.id, AlertTemplates.DefaultAlert);
  }
});

//handling choosing turn in query and cancel turn
bot.on(`callback_query`, async (msg) => {
  if (msg.data && msg.message) {
    const query: string = msg.data;
    const type: CallbackQueryType = query.split("/")[0] as CallbackQueryType;
    const turn: number = parseInt(query.split("/")[1]) || 0;
    const queue_id: number = parseInt(query.split("/")[2]);
    const username: string =
      msg?.from.first_name ?? "" + msg?.from.last_name ?? "";
    const telegram_tag: string = msg?.from.username ?? "";
    const message_id: number = msg.message.message_id;
    const user_id: number | undefined = msg.from.id;
    const chat_id: number = msg.message.chat.id;
    if (type) {
      let queue: IQueue;
      let queues: Array<IQueue>;
      try {
        switch (type) {
          case CallbackQueryTypeList.Turn:
            queue = await enqueueUser({
              user_id,
              username,
              queue_id,
              turn,
              telegram_tag,
            });
            await bot.editMessageText(getQueueTurnsList(queue), {
              reply_markup: {
                inline_keyboard: getTurnsInlineKeyboard(queue),
              },
              message_id,
              chat_id,
            });
            break;
          case CallbackQueryTypeList.Page:
            queues = await fetchQueues({
              chat_id,
              limit: QUEUE_LIMIT,
              page: turn,
            });
            await bot.editMessageText(getQueueStatsList(queues), {
              reply_markup: {
                inline_keyboard: getQueuesInlineKeyboard(
                  queues,
                  `control`,
                  turn,
                ).concat(
                  getPaginationControls(queues.length, QUEUE_LIMIT, turn),
                ),
              },
              message_id,
              chat_id,
            });
            break;
          case CallbackQueryTypeList.Cancel:
            queue = await dequeueUser({ user_id, queue_id });
            await bot.editMessageText(getQueueTurnsList(queue), {
              reply_markup: {
                inline_keyboard: getTurnsInlineKeyboard(queue),
              },
              message_id,
              chat_id,
            });
            break;
          case CallbackQueryTypeList.Control:
            queue = await fetchQueue(queue_id);
            await bot.editMessageText(getQueueProfileInfo(queue), {
              reply_markup: {
                inline_keyboard: getQueueControlsInlineKeyboard(queue_id, turn),
              },
              message_id,
              chat_id,
            });
            break;
          case CallbackQueryTypeList.Queue:
            queue = await fetchQueue(queue_id);
            await bot.deleteMessage(
              msg.message.chat.id,
              msg.message.message_id,
            );
            await bot.sendMessage(chat_id, `${getQueueTurnsList(queue)}`, {
              reply_markup: {
                inline_keyboard: getQueueTurnsListControls(queue_id),
              },
            });
            break;
          case CallbackQueryTypeList.Delete:
            await removeQueue({ user_id, queue_id });
            await bot.deleteMessage(
              msg.message.chat.id,
              msg.message.message_id,
            );
            break;
          case CallbackQueryTypeList.Back:
            queues = await fetchQueues({
              chat_id,
              limit: QUEUE_LIMIT,
              page: turn,
            });
            await bot.editMessageText(getQueueStatsList(queues), {
              reply_markup: {
                inline_keyboard: getQueuesInlineKeyboard(
                  queues,
                  `control`,
                  turn,
                ).concat(
                  getPaginationControls(queues.length, QUEUE_LIMIT, turn),
                ),
              },
              chat_id,
              message_id,
            });
            break;
          case CallbackQueryTypeList.Update:
            queue = await fetchQueue(queue_id);
            await bot.editMessageText(`${getQueueTurnsList(queue)}`, {
              reply_markup: {
                inline_keyboard: getQueueTurnsListControls(queue_id),
              },
              message_id,
              chat_id,
            });
            break;
        }
      } catch (e: unknown) {
        console.log(e);
        const status = (e as AxiosCustomException).response.status;
        const text = (e as AxiosCustomException).response.data?.message;
        if (status === 403) {
          await bot.answerCallbackQuery(msg.id, {
            text,
            show_alert: true,
          });
          if (text === AnswerTemplates.QueueExist)
            await bot.deleteMessage(chat_id, message_id);
        } else {
          await bot.answerCallbackQuery(msg.id, {
            text: AlertTemplates.DefaultAlert,
            show_alert: true,
          });
        }
      }
    }
  }
});
