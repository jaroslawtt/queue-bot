"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const templates_1 = require("./answer-templates/templates");
const inline_keyboard_1 = require("./inline_keyboard");
const api_1 = require("./api");
(0, dotenv_1.config)({ path: `.env` });
const bot = new node_telegram_bot_api_1.default(process.env.TELEGRAM_BOT_TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10,
        }
    },
});
let creatorId = null;
const queueForm = {
    name: ``,
    numberOfStudents: null,
};
bot.onText(/\/start/, async (msg) => {
    await bot.sendMessage(msg.chat.id, "What's up\u270B.\nI can help you with creating queues\uD83E\uDDD1\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1.\nStart with /create" /* AnswerTemplates.Greetings */, {
        parse_mode: `HTML`,
        disable_notification: true,
    });
});
// call this to create queue
bot.onText(/\/create/, async (msg) => {
    creatorId = msg?.from?.id || null;
    queueForm.name = ``;
    queueForm.numberOfStudents = null;
    if (creatorId) {
        await bot.sendMessage(msg.chat.id, `Send a name for your queue`);
    }
});
//call to cancel creating queue
bot.onText(/\/cancel/, async (msg) => {
    if (msg.from && msg.from?.id === creatorId) {
        creatorId = null;
        queueForm.name = ``;
        queueForm.numberOfStudents = null;
    }
});
//call this to see all available queues
bot.onText(/\/queues/, async (msg) => {
    const chat_id = msg.chat.id;
    try {
        const queues = await (0, api_1.fetchQueues)(chat_id);
        await bot.sendMessage(chat_id, (0, templates_1.getQueueStatsList)(queues), {
            reply_markup: {
                inline_keyboard: (0, inline_keyboard_1.getQueuesInlineKeyboard)(queues, `queue`),
            }
        });
    }
    catch (e) {
        await bot.sendMessage(msg.chat.id, "Oops, sth went wrong..." /* AlertTemplates.DefaultAlert */);
    }
});
//call to remove queue
bot.onText(/\/delete/, async (msg) => {
    const chat_id = msg.chat.id;
    try {
        const queues = await (0, api_1.fetchQueues)(chat_id);
        await bot.sendMessage(chat_id, (0, templates_1.getQueueStatsList)(queues), {
            reply_markup: {
                inline_keyboard: (0, inline_keyboard_1.getQueuesInlineKeyboard)(queues, `delete`),
            }
        });
    }
    catch {
        await bot.sendMessage(msg.chat.id, "Oops, sth went wrong..." /* AlertTemplates.DefaultAlert */);
    }
});
//handling queue data
bot.on(`message`, async (msg) => {
    if (creatorId) {
        if (msg.from && msg.from?.id === creatorId && msg.text && !RegExp(/\/+/).test(msg.text)) {
            const { text } = msg;
            if (queueForm.name.length === 0) {
                queueForm.name = text;
                await bot.sendMessage(msg.chat.id, `Send number of students`, {
                    reply_to_message_id: msg.message_id,
                });
            }
            else if (!queueForm.numberOfStudents && !Number.isNaN(parseInt(text))) {
                queueForm.numberOfStudents = parseInt(text);
                const username = msg?.from.first_name || ``;
                try {
                    const newQueue = await (0, api_1.createQueue)(queueForm, creatorId, username, msg.chat.id);
                    const inlineKeyboard = (0, inline_keyboard_1.getTurnsInlineKeyboard)(newQueue);
                    await bot.sendMessage(msg.chat.id, `${(0, templates_1.getQueueTurnsList)(newQueue)}`, {
                        reply_markup: {
                            inline_keyboard: inlineKeyboard,
                            resize_keyboard: true,
                        }
                    });
                }
                catch (e) {
                    if (e.response.status === 403) {
                        await bot.sendMessage(msg.chat.id, "Queue with this name already exists" /* AnswerTemplates.QueueExist */);
                        queueForm.name = ``;
                        queueForm.numberOfStudents = null;
                    }
                    else {
                        await bot.sendMessage(msg.chat.id, "Oops, sth went wrong..." /* AlertTemplates.DefaultAlert */);
                    }
                }
            }
        }
    }
});
//handling choosing turn in query and cancel turn
bot.on(`callback_query`, async (msg) => {
    if (msg.data && msg.message) {
        const type = msg.data.split("/")[0] || ``;
        const turn = parseInt(msg?.data?.split("/")[1]) || 0;
        const queue_id = parseInt(msg?.data?.split("/")[2]);
        const username = msg?.from.first_name || ``;
        const message_id = msg.message.message_id;
        const chat_id = msg.message.chat.id;
        if (type) {
            try {
                let queue;
                switch (type) {
                    case `turn`:
                        queue = await (0, api_1.enqueueUser)(msg.from.id, username, queue_id, turn);
                        await bot.editMessageText((0, templates_1.getQueueTurnsList)(queue), {
                            reply_markup: {
                                inline_keyboard: (0, inline_keyboard_1.getTurnsInlineKeyboard)(queue),
                            },
                            message_id,
                            chat_id,
                        });
                        break;
                    case `cancel`:
                        queue = await (0, api_1.dequeueUser)(msg.from.id, queue_id);
                        await bot.editMessageText((0, templates_1.getQueueTurnsList)(queue), {
                            reply_markup: {
                                inline_keyboard: (0, inline_keyboard_1.getTurnsInlineKeyboard)(queue),
                            },
                            message_id,
                            chat_id,
                        });
                        break;
                    case `queue`:
                        queue = await (0, api_1.fetchQueue)(queue_id);
                        await bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
                        await bot.sendMessage(chat_id, `${(0, templates_1.getQueueTurnsList)(queue)}`);
                        break;
                    case `delete`:
                        await (0, api_1.removeQueue)(queue_id, msg.from.id);
                        await bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
                        break;
                }
            }
            catch (e) {
                if (e?.response?.status === 403) {
                    const text = e.response?.data?.message;
                    switch (text) {
                        case "This queue doesn't exist anymore":
                            await bot.deleteMessage(chat_id, message_id);
                            await bot.answerCallbackQuery(msg.id, {
                                text, show_alert: true,
                            });
                            break;
                        default:
                            await bot.answerCallbackQuery(msg.id, {
                                text, show_alert: true,
                            });
                    }
                }
                else {
                    await bot.answerCallbackQuery(msg.id, {
                        text: "Oops, sth went wrong..." /* AlertTemplates.DefaultAlert */, show_alert: true,
                    });
                }
            }
        }
    }
});
